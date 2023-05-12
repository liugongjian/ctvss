<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card v-loading="loading.resource">
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
        <el-form-item label="权限：" prop="statementList">
          <div v-for="(statement, index) in form.statementList" :key="statement.id" class="statement-block">
            <div class="statement-block__headline" @click="toggleOpenStatus(index)">
              <i v-if="statement.opened" class="el-icon-caret-bottom" />
              <i v-else class="el-icon-caret-right" />
              <span style="margin-left: 5px;">{{ '权限集' + (index + 1) }}</span>
              <el-button type="text" style="float: right; margin-right: 10px;" @click.stop="deleteStatement(index)">删除</el-button>
            </div>
            <div v-show="statement.opened">
              <el-form-item
                label="效果（Effect）"
                :prop="'statementList.' + index + '.effect'"
                label-width="180px"
              >
                <el-radio-group
                  v-model="statement.effect"
                  :disabled="isCtyunPolicy"
                  @input="changeEffect(index)"
                >
                  <el-radio label="Allow">允许</el-radio>
                  <el-radio label="Deny">拒绝</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="操作（Action）"
                :rules="innerActionFormRule"
                :prop="'statementList.' + index + '.actionList'" label-width="180px"
              >
                <span
                  v-if="statement.actionType === 'all'"
                  style="color: #c0c4cc;"
                >
                  所有操作权限
                </span>
                <el-table
                  v-else-if="statement.actionType === 'selected'"
                  :ref="`actionTable_${index}`"
                  :data="filteredSystemActionList"
                  size="small"
                  max-height="450"
                  tooltip-effect="dark"
                  @selection-change="handleSelectionChange($event, index)"
                >
                  <el-table-column
                    type="selection"
                    :selectable="(row) => checkSelectable(row, index)"
                    :label-class-name="isCtyunPolicy ? 'is-ctyun-policy' : ''"
                    width="55"
                  />
                  <el-table-column
                    label="操作名称"
                    prop="actionName"
                    width="220"
                  />
                  <el-table-column
                    label="操作级别"
                    prop="actionValue"
                    width="200"
                  >
                    <template slot-scope="{ row }">
                      <span v-if="!row.actionValueOption"> - </span>
                      <el-select v-else v-model="statement.actionLevel[row.actionKey]" :disabled="isCtyunPolicy" size="mini" style="width: 65%;">
                        <el-option
                          v-for="option in row.actionValueOption"
                          :key="option"
                          :label="option"
                          :value="option"
                        />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="操作描述"
                    prop="actionDesc"
                  />
                </el-table>
              </el-form-item>
              <el-form-item
                label="资源（Resource）"
                :rules="innerResourceFormRule"
                :prop="'statementList.' + index + '.resourceList'"
                label-width="180px"
              >
                <el-radio-group
                  v-model="statement.resourceType"
                  style="margin-bottom: 5px;"
                  :disabled="isCtyunPolicy"
                >
                  <el-radio label="all">所有资源</el-radio>
                  <el-radio label="selected">特定资源</el-radio>
                </el-radio-group>
                <div v-show="statement.resourceType === 'selected'" class="dialog-wrap">
                  <resource-selector
                    :checked-list="statement.resourceIdList"
                    @resourceListChange="resourceListChange($event, index)"
                    @resourceLoaded="resourceLoaded"
                  />
                </div>
              </el-form-item>
            </div>
          </div>
          <el-button v-if="!isCtyunPolicy" :loading="loading.dir || loading.resource" type="text" @click="addStatement">+ 添加权限</el-button>
        </el-form-item>
        <el-form-item>
          <el-row>
            <template v-if="!isCtyunPolicy">
              <el-button type="primary" class="confirm" :loading="loading.dir || loading.resource" @click="upload">确定</el-button>
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
import settings from '@/settings'
import { UserModule } from '@/store/modules/user'
import TemplateBind from '@/views/components/TemplateBind.vue'
import { Component, Vue } from 'vue-property-decorator'
import ResourceSelector from '@/views/components/ResourceSelector.vue'

@Component({
  name: 'AddDevices',
  components: {
    TemplateBind,
    ResourceSelector
  }
})
export default class extends Vue {
  private breadCrumbContent = ''

  public loading = {
    dir: false,
    resource: false
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
    statementList: []
  }

  private isCtyunPolicy = false
  private actionType = ''
  private resourceType = 'all'
  private rules = {
    policyName: [
      { required: true, message: '请输入策略名称', trigger: 'blur' },
      { validator: this.validatePolicyName, trigger: 'blur' }
    ],
    statementList: [
      {
        validator: this.validateStatementList, trigger: 'blur'
      }
    ]
  }

  private innerActionFormRule = {
    validator: this.validateActionList,
    trigger: 'blur'
  }

  private innerResourceFormRule = {
    validator: this.validateResourceList,
    trigger: 'blur'
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

  private validateActionList(rule: any, value: string, callback: Function) {
    if (!value || !value.length) {
      callback(new Error('操作列表不能为空！'))
    } else {
      callback()
    }
  }

  private validateStatementList(rule: any, value: string, callback: Function) {
    if (!value || !value.length) {
      callback(new Error('权限列表不能为空！'))
    } else {
      callback()
    }
  }

  private validateResourceList(rule: any, value: string, callback: Function) {
    const index = rule.field.split('.')[1]
    const statement = this.form.statementList[index]
    if (statement.resourceType === 'selected' && !statement.resourceList.length) {
      callback(new Error('资源列表不能为空！'))
    } else {
      callback()
    }
  }

  private get isUpdate() {
    return this.$route.name === 'AccessManagePolicyEdit'
  }

  private get filteredSystemActionList() {
    const tagObject = UserModule.tags || ({})
    const userVersion = UserModule.version
    const denyPerms = (tagObject.privateUser && settings.privateDenyPerms[tagObject.privateUser]) || []
    return settings.systemActionList
      .filter((action: any) => !denyPerms.includes(action.actionKey))
      .filter((action: any) => !action.version || action.version === userVersion)
      .map(action => {
        const options = action.actionValueOption
        return {
          ...action,
          actionValueOption: options && options.every(option => typeof option === 'number')
            ? Array.from({ length: options[1] - options[0] + 1 }).map((item, index) => options[0] + index)
            : options
        }
      })
  }

  private async created() {
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
        // this.loading.resource = true
      } else {
        this.back()
      }
    }
  }

  private changeEffect(index: number) {
    const actionTable: any = this.$refs[`actionTable_${index}`][0]
    actionTable.clearSelection()
  }

  private handleSelectionChange(actions: any, index: number) {
    const actionTable: any = this.$refs[`actionTable_${index}`][0]
    this.$nextTick(() => {
      actions.forEach((action: any) => {
        const statement = this.form.statementList[index]
        const actionLevel = statement.actionLevel
        if (actionLevel[action.actionKey] == null) {
          this.$set(actionLevel, action.actionKey, action.actionValueDefault)
        }
        const autoSelectedArr = (statement.effect === 'Allow'
          ? action.allowAutoSelected
          : action.denyAutoSelected) || []

        autoSelectedArr.forEach((autoSelected) => {
          const autoSelectedRow = this.filteredSystemActionList.find((row: any) => row.actionKey === autoSelected)
          if (autoSelectedRow) {
            actionTable.toggleRowSelection(autoSelectedRow, true)
          }
        })
      })
    })
    this.form.statementList[index].actionList = actions.map((action: any) => action.actionKey)
  }

  private addStatement() {
    this.form.statementList.push({
      id: new Date().getTime().toString() + Math.random(),
      opened: true,
      effect: 'Allow',
      actionType: 'selected',
      resourceType: 'all',
      actionList: [],
      actionLevel: {},
      resourceList: [],
      resourceIdList: []
    })
  }

  private deleteStatement(index: number) {
    this.form.statementList.splice(index, 1)
  }

  private toggleOpenStatus(index: number) {
    this.form.statementList[index].opened = !this.form.statementList[index].opened
  }
  /*
   * 获取策略详情
   */
  private async getPolicyInfo() {
    try {
      this.loading.resource = true
      const res: any = await getPolicyInfo({
        policyId: this.form.policyId
      })
      this.form.policyName = res.policyName
      this.form.desc = res.desc
      const policyInfo = JSON.parse(res.policyDocument)

      this.form.statementList = policyInfo.Statement.map((statement, index) => ({
        id: new Date().getTime().toString() + Math.random(),
        opened: index === 0,
        effect: statement.Effect,
        actionType: statement.Action[0] === 'ivs:*' ? 'all' : 'selected',
        actionList: statement.Action,
        actionLevel: statement.ActionLevel || {},
        resourceType: statement.Resource[0] === '*' ? 'all' : 'selected',
        resourceList: [],
        resourceIdList: statement.Resource
      }))

      this.form.statementList.forEach(async(statement, index) => {
        if (statement.actionList[0] === 'ivs:Get*') {
          statement.actionList = this.filteredSystemActionList
            .filter((row: any) => row.actionType === 'GET')
            .map((row: any) => row.actionKey)
        }
        this.$nextTick(() => {
          const ref = this.$refs[`actionTable_${index}`]
          const actionTable: any = ref?.[0]
          if (actionTable) {
            statement.actionList.forEach((action: any) => {
              const row = this.filteredSystemActionList.find(
                (systemAction: any) => systemAction.actionKey === action
              )
              if (row) {
                actionTable.toggleRowSelection(row)
              }
            })
          }
        })
      })
    } catch (e) {
      console.log('e: ', e)
      this.$message.error('查询策略详情出错！')
    } finally {
      this.loading.resource = false
    }
  }

  /**
   * 检测是否禁用
   */
  private checkSelectable(row: any, index: number) {
    if (this.isCtyunPolicy) {
      return false
    }
    const statement = this.form.statementList[index]
    const relatedActions = this.filteredSystemActionList
      .filter((action: any) => {
        const autoSelected = (statement.effect === 'Allow'
          ? action.allowAutoSelected
          : action.denyAutoSelected) || []
        return autoSelected.includes(row.actionKey)
      })
      .map(item => item.actionKey)
    const actionList = statement.actionList
    return !(relatedActions.length && actionList.filter(action => relatedActions.includes(action)).length)
  }

  private resourceListChange(data: any, index: number) {
    this.form.statementList[index].resourceList = data
  }

  private resourceLoaded() {
    this.loading.resource = false
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
            policyType: 'subUser',
            policyDocument: JSON.stringify({
              Version: '2023-01-03',
              Statement: this.form.statementList.map((statement: any) => {
                const actionList = statement.actionList
                // 过滤出已勾选的action值
                const actionLevel = {}
                actionList.forEach(action => {
                  actionLevel[action] = statement.actionLevel[action]
                })
                return {
                  Effect: statement.effect,
                  Action: actionList,
                  ActionLevel: actionLevel,
                  Resource:
                    statement.resourceType === 'all'
                      ? ['*']
                      : statement.resourceList
                }
              }

              )
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
        this.$message.error(e && e.message)
      } finally {
        // TODO
      }
    })
  }

  private back() {
    // this.$router.push(`/accessManage/policy`)
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

.statement-block {
  margin-bottom: 10px;

  &__headline {
    height: 40px;
    line-height: 40px;
    background-color: #f3f3f3;
    cursor: pointer;
  }
}

.statement-block:first-child {
  margin-top: 36px;
}

::v-deep .el-form-item.is-error .el-input__inner {
  border-color: #c0c4cc !important;
}

::v-deep .el-form-item .el-form-item {
  margin-bottom: 20px;
}
</style>
