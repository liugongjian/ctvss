<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card v-loading="loading.policy">
      <el-form ref="form" class="form" :rules="rules" :model="form" label-width="100px">
        <el-form-item v-if="isUpdate" label="策略ID：" prop="policyId">
          <el-input v-model="form.policyId" class="form__input" :disabled="isUpdate" />
        </el-form-item>
        <el-form-item label="策略名：" prop="policyName">
          <el-input v-model="form.policyName" class="form__input" placeholder="请填写策略名称" :disabled="isCtyunPolicy" />
          <div class="form-tip">2-32位，可包含大小写字母、数字、中文、中划线、空格。</div>
        </el-form-item>
        <el-form-item label="描述：" prop="desc">
          <el-input v-model="form.desc" class="form__input" type="textarea" rows="4" :disabled="isCtyunPolicy" />
        </el-form-item>
        <el-form-item label="操作：" prop="actionList">
          <span v-if="actionType === 'besideSelected'" style="color: #c0c4cc;">所有操作权限</span>
          <el-table v-else-if="actionType === 'selected'" ref="actionTable" :data="systemActionList" tooltip-effect="dark" @selection-change="handleSelectionChange">
            <el-table-column type="selection" :selectable="checkSelectable" :label-class-name="isCtyunPolicy ? 'is-ctyun-policy' : ''" width="55" />
            <el-table-column label="操作名称" prop="actionName" width="200" />
            <el-table-column label="操作描述" prop="actionDesc" />
          </el-table>
        </el-form-item>
        <el-form-item label="资源：" prop="resourceList">
          <el-radio-group v-model="resourceType" style="margin-bottom: 5px;" :disabled="isCtyunPolicy">
            <el-radio label="all">所有资源</el-radio>
            <el-radio label="selected">特定资源</el-radio>
          </el-radio-group>
          <div v-show="resourceType === 'selected'" class="dialog-wrap">
            <resource-selector
              v-if="loading.policy === false || !isUpdate"
              :checked-list="initResourceList"
              :filter-type-arr="['dir']"
              @resourceListChange="resourceListChange"
              @resourceLoaded="resourceLoaded"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-row style="margin: 20px 0;">
            <template v-if="!isCtyunPolicy">
              <el-button type="primary" class="confirm" :loading="loading.resource || loading.policy" @click="upload">确定</el-button>
              <el-button class="cancel" @click="back">取消</el-button>
            </template>
            <template v-else>
              <el-button type="primary" @click="back">返回</el-button>
            </template>
          </el-row>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { createPolicy, editPolicy, getPolicyInfo } from '@/api/accessManage'
import TemplateBind from '@/views/components/TemplateBind.vue'
import { Component, Vue } from 'vue-property-decorator'
import ResourceSelector from '@/views/components/ResourceSelector.vue'

@Component({
  name: 'CreatePolicy',
  components: {
    TemplateBind,
    ResourceSelector
  }
})
export default class extends Vue {
  public filterTypeArr = ['dir']
  public hasCheckbox = true
  private breadCrumbContent = ''
  private systemActionList = [
    {
      actionName: '查询设备',
      actionValue: 'DescribeDevice',
      actionDesc: '具有设备查询的权限，可以展示设备管理菜单'
    },
    {
      actionName: '管理设备',
      actionValue: 'AdminDevice',
      actionDesc: '拥有设备管理的权限，可对设备进行管理操作'
    },
    {
      actionName: '实时预览',
      actionValue: 'ScreenPreview',
      actionDesc: '具备实时预览菜单'
    },
    {
      actionName: '录像回放',
      actionValue: 'ReplayRecord',
      actionDesc: '具备录像回放菜单'
    },
    {
      actionName: '管理录像',
      actionValue: 'AdminRecord',
      actionDesc: '拥有录像下载，录像文件改名的权限'
    },
    {
      actionName: '查看AI应用',
      actionValue: 'DescribeAi',
      actionDesc: '拥有AI管理权限'
    },
    {
      actionName: '管理AI应用',
      actionValue: 'AdminAi',
      actionDesc: '拥有AI管理权限'
    },
    {
      actionName: '查看电子地图',
      actionValue: 'DescribeMap',
      actionDesc: '拥有电子地图的查看权限'
    },
    {
      actionName: '查看概览页面',
      actionValue: 'DescribeDashboard',
      actionDesc: '拥有概览页面的查看权限'
    },
    {
      actionName: '车辆管理',
      actionValue: 'AdminCar',
      actionDesc: '拥有车辆管理权限'
    }
  ]
  private dirList: any = []
  public loading = {
    policy: null,
    resource: false,
  }
  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }
  private form: any = {
    policyId: '',
    policyName: '',
    desc: '',
    policyType: '',
    scope: '',
    actionList: [],
    resourceList: []
  }
  private initResourceList = []
  private isCtyunPolicy = false
  private actionType = ''
  private resourceType = 'all'
  private rules = {
    policyName: [
      { required: true, message: '请输入策略名称', trigger: 'blur' },
      { validator: this.validatePolicyName, trigger: 'blur' }
    ],
    desc: [
      { validator: this.validatePolicyDesc, trigger: 'blur' }
    ],
    actionList: [{ validator: this.validatorActionList, trigger: 'blur' }],
    resourceList: [{ validator: this.validateResourceList, trigger: 'blur' }]
  }

  private validatePolicyName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-\s]{2,32}$/.test(value)) {
      callback(
        new Error(
          '策略名称格式错误。2-32位，可包含大小写字母、数字、中文、中划线、空格。'
        )
      )
    } else {
      callback()
    }
  }

  private validatePolicyDesc(rule: any, value: string, callback: Function) {
    if (value.length > 255) {
      callback(new Error('策略描述最多255个字符！'))
    } else {
      callback()
    }
  }

  private validatorActionList(rule: any, value: string, callback: Function) {
    if (!this.form.actionList.length) {
      callback(new Error('操作列表不能为空！'))
    } else {
      callback()
    }
  }

  private validateResourceList(rule: any, value: string, callback: Function) {
    if (this.resourceType === 'selected' && !this.form.resourceList.length) {
      callback(new Error('资源列表不能为空！'))
    } else {
      callback()
    }
  }

  private get isUpdate() {
    return this.$route.name === 'AccessManagePolicyEdit'
  }

  public async created() {
    this.isCtyunPolicy = this.$route.query.policyScope === 'ctyun'
    this.breadCrumbContent = !this.isUpdate
      ? this.$route.meta.title
      : this.isCtyunPolicy
        ? '查看策略'
        : '编辑策略'
    if (this.isUpdate) {
      const policyId = this.$route.query.policyId
      if (policyId) {
        this.$set(this.form, 'policyId', policyId)
        await this.getPolicyInfo()
        this.loading.resource = true
      } else {
        this.back()
      }
    } else {
      this.actionType = 'selected'
    }
  }

  private handleSelectionChange(actions: any) {
    const actionTable: any = this.$refs.actionTable
    this.$nextTick(() => {
      actions.forEach((action: any) => {
        if (action.actionValue === 'AdminDevice') {
          actionTable.toggleRowSelection(this.systemActionList[0], true)
        }
        if (action.actionValue === 'AdminRecord') {
          actionTable.toggleRowSelection(this.systemActionList[3], true)
        }
        if (action.actionValue === 'AdminAi') {
          actionTable.toggleRowSelection(this.systemActionList[5], true)
        }
      })
      this.form.actionList = actions.map((action: any) => action.actionValue)
    })
  }

  private handleRowClick(row: any) {
    const index = this.form.actionList.indexOf(row.actionValue)
    if (index === -1) {
      this.form.actionList.push(row.actionValue)
    } else {
      this.form.actionList.splice(index, 1)
    }
    const actionTable: any = this.$refs.actionTable
    actionTable.toggleRowSelection(row, index === -1)
  }
  /*
   * 获取策略详情
   */
  private async getPolicyInfo() {
    try {
      this.loading.policy = true
      this.policyPromise = getPolicyInfo({
        policyId: this.form.policyId
      })
      const res: any = await this.policyPromise
      this.form.policyName = res.policyName
      this.form.desc = res.desc
      const policyInfo = JSON.parse(res.policyDocument)
      this.form.actionList = policyInfo.Statement[0].Action
      if (this.form.actionList[0] === 'vss:*') {
        this.actionType = 'besideSelected'
      } else {
        this.actionType = 'selected'
        if (this.form.actionList[0] === 'vss:Get*') {
          this.form.actionList = [
            'DescribeDevice',
            'ScreenPreview',
            'ReplayRecord',
            'DescribeAi',
            'DescribeMap',
            'DescribeDashboard'
          ]
        }
        this.$nextTick(() => {
          const actionTable: any = this.$refs.actionTable
          this.form.actionList.forEach((action: any) => {
            const row = this.systemActionList.find(
              (systemAction: any) => systemAction.actionValue === action
            )
            if (row) {
              actionTable.toggleRowSelection(row)
            }
          })
        })
      }
      this.initResourceList = policyInfo.Statement[0].Resource

      if (this.initResourceList[0] === '*') {
        this.resourceType = 'all'
      } else {
        this.resourceType = 'selected'
      }
    } catch (e) {
      console.log('e: ', e)
      this.$message.error('查询策略详情出错！')
    } finally {
      this.loading.policy = false
    }
  }
  /**
   * 检测是否禁用
   */
  private checkSelectable(row: any) {
    const actionList = this.form.actionList
    return !(
      this.isCtyunPolicy ||
      (row.actionValue === 'DescribeDevice' &&
        actionList.indexOf('AdminDevice') !== -1) ||
      (row.actionValue === 'ReplayRecord' &&
        actionList.indexOf('AdminRecord') !== -1) ||
      (row.actionValue === 'DescribeAi' && actionList.indexOf('AdminAi') !== -1)
    )
  }

  private resourceListChange(resourceList) {
    this.form.resourceList = resourceList
  }

  private resourceLoaded() {
    this.loading.resource = false
  }

  /**
   * 显示设备所在路径
   */
  private renderPath(path: any) {
    const end = path.length - 1
    if (path.length > 1) {
      return path[end].label.indexOf('/') === 0 ? path[end].label.slice(1) : path[end].label
    } else {
      return ''
    }
  }

  private upload() {
    const form: any = this.$refs.form
    form.validate(async(valid: boolean) => {
      try {
        if (valid) {
          const data = {
            policyId: this.form.policyId || undefined,
            policyName: this.form.policyName,
            desc: this.form.desc,
            scope: 'local',
            policyDocument: JSON.stringify({
              Version: '2022-11-22',
              Statement: [
                {
                  Effect: 'Allow',
                  Action: this.form.actionList,
                  Resource:
                    this.resourceType === 'all'
                      ? ['*']
                      : this.form.resourceList
                }
              ]
            })
          }
          await (this.form.policyId ? editPolicy(data) : createPolicy(data))
          this.$message.success(
            `${this.form.policyId ? '编辑策略成功！' : '创建策略成功！'}`
          )
          this.back()
        } else {
          return false
        }
      } catch (e) {
        console.log(e)
        this.$message.error(e && e.message)
      } finally {
        // TODO
      }
    })
  }
  private back() {
    this.$router.go(-1)
  }
}
</script>

<style lang="scss" scoped>
.form {
  margin-left: 10px;

  &__input {
    width: 600px;
  }
}

.policy {
  display: flex;
}

.list {
  height: 400px;
  width: 400px;
  overflow: auto;
  border: 1px solid #d7d7d7;
  border-top: none;
  border-radius: 5px;

  &__title {
    height: 40px;
    line-height: 40px;
    background: #f2f2f2;
    padding-left: 20px;
  }
}

.el-table {
  width: 100%;
}

.el-table ::v-deep .is-ctyun-policy .cell .el-checkbox__inner {
  display: none;
  position: relative;
}

.dialog-wrap {
  display: flex;
  border: 1px solid $borderGrey;
}

.tree-wrap {
  flex: 1 0;
  height: 550px;
  padding: 10px;
  overflow: auto;
  border-right: 1px solid $borderGrey;

  .is-disabled + .custom-tree-node__ipc {
    cursor: not-allowed;
  }
}

.device-wrap {
  flex: 1 0;
  height: 550px;
  overflow: auto;

  &__header {
    font-weight: bold;
    text-align: center;
    padding: 10px;
  }
}
</style>
