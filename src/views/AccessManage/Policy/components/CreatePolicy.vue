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
        <el-form-item label="权限：">
          <div v-for="(statement, index) in form.statementList" :key="statement.id" class="statement-block">
            <div style="height: 40px; line-height: 40px; background-color: #f3f3f3; cursor: pointer;" @click="toggleOpenStatus(index)">
              <i v-if="statement.opened" class="el-icon-caret-bottom" />
              <i v-else class="el-icon-caret-right" />
              <span style="margin-left: 5px;">智能视图服务（IVS）</span>
              <el-button type="text" style="float: right; margin-right: 10px;" @click.stop="deleteStatement(index)">删除</el-button>
            </div>
            <div v-show="statement.opened">
              <el-form-item
                label="效果（Effect）"
                :prop="'statementList.' + index + '.effect'"
                label-width="180px"
              >
                <el-radio-group v-model="statement.effect">
                  <el-radio label="allow">允许</el-radio>
                  <el-radio label="deny">拒绝</el-radio>
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
                    width="200"
                  />
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
                style="margin-top: 20px;"
              >
                <el-radio-group v-model="statement.resourceType" style="margin-bottom: 5px;" :disabled="isCtyunPolicy">
                  <el-radio label="all">所有资源</el-radio>
                  <el-radio label="selected">特定资源</el-radio>
                </el-radio-group>
                <div v-show="statement.resourceType === 'selected'" class="dialog-wrap">
                  <div v-loading="loading.dir" class="tree-wrap">
                    <el-tree
                      :ref="`dirTree_${index}`"
                      node-key="id"
                      lazy
                      show-checkbox
                      :data="dirList"
                      :load="loadDirs"
                      :props="treeProp"
                      :check-strictly="false"
                      @check-change="onCheckDevice($event, index)"
                    >
                      <span
                        slot-scope="{node, data}"
                        class="custom-tree-node"
                        :class="`custom-tree-node__${data.type}`"
                      >
                        <span class="node-name">
                          <svg-icon :name="data.type" color="#6e7c89" />
                          {{ node.label }}
                        </span>
                      </span>
                    </el-tree>
                  </div>
                  <div class="device-wrap">
                    <div class="device-wrap__header">已选资源({{ statement.resourceList.length }})</div>
                    <el-table ref="deviceTable" :data="statement.resourceList" empty-text="暂无选择资源" fit>
                      <el-table-column key="label" prop="label" width="180" label="业务组/目录名称">
                        <template slot-scope="{row}">
                          {{ row.label || '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column key="path" prop="path" label="所在位置">
                        <template slot-scope="{row}">
                          {{ renderPath(row.path) }}
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" prop="action" class-name="col-action" width="110" fixed="right">
                        <template slot-scope="scope">
                          <el-button type="text" @click="removeDevice(index, scope.row)">移除</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </el-form-item>
            </div>
          </div>
          <el-button type="text" @click="addStatement">+ 添加权限</el-button>
        </el-form-item>
        <el-form-item>
          <el-row style="margin: 20px 0;">
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
import { getDeviceTree } from '@/api/device'
import { getGroups } from '@/api/group'
import settings from '@/settings'
import { UserModule } from '@/store/modules/user'
import TemplateBind from '@/views/components/TemplateBind.vue'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'AddDevices',
  components: {
    TemplateBind
  }
})
export default class extends Vue {
  private breadCrumbContent = ''

  private dirList: any = []
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
    statementList: [],
    actionList: [],
    resourceList: []
  }

  private isCtyunPolicy = false
  private actionType = ''
  private resourceType = 'all'
  private rules = {
    policyName: [
      { required: true, message: '请输入策略名称', trigger: 'blur' },
      { validator: this.validatePolicyName, trigger: 'blur' }
    ]
  }

  private innerActionFormRule = {
    validator: this.validatorActionList,
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

  private validatorActionList(rule: any, value: string, callback: Function) {
    if (!value || !value.length) {
      callback(new Error('操作列表不能为空！'))
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
    const denyPerms = (tagObject.privateUser && settings.privateDenyPerms[tagObject.privateUser]) || []
    return settings.systemActionList.filter((action: any) => !denyPerms.includes(action.actionValue))
  }

  private async mounted() {
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
      } else {
        this.back()
      }
    } else {
      await this.initDirs()
    }
  }

  private handleSelectionChange(actions: any, index: number) {
    const actionTable: any = this.$refs[`actionTable_${index}`][0]
    this.$nextTick(() => {
      actions.forEach((action: any) => {
        if (action.autoSelected) {
          const autoSelectedRow = this.filteredSystemActionList.find((row: any) => row.actionValue === action.autoSelected)
          autoSelectedRow && actionTable.toggleRowSelection(autoSelectedRow, true)
        }
      })
    })
    this.form.statementList[index].actionList = actions.map((action: any) => action.actionValue)
  }

  private addStatement() {
    this.form.statementList.push({
      opened: true,
      effect: 'allow',
      actionType: 'selected',
      resourceType: 'all',
      actionList: [],
      resourceList: []
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
      this.form.actionList = policyInfo.Statement[0].Action
      if (this.form.actionList[0] === 'vss:*') {
        this.actionType = 'all'
      } else {
        this.actionType = 'selected'
        if (this.form.actionList[0] === 'vss:Get*') {
          this.form.actionList = this.filteredSystemActionList
            .filter((row: any) => row.actionType === 'GET')
            .map((row: any) => row.actionValue)
        }
        this.$nextTick(() => {
          const actionTable: any = this.$refs.actionTable
          this.form.actionList.forEach((action: any) => {
            const row = this.filteredSystemActionList.find(
              (systemAction: any) => systemAction.actionValue === action
            )
            if (row) {
              actionTable.toggleRowSelection(row)
            }
          })
        })
      }
      const resourceList = policyInfo.Statement[0].Resource
      if (resourceList[0] === '*') {
        this.resourceType = 'all'
      } else {
        this.resourceType = 'selected'
      }
      await this.initDirs()
      this.$nextTick(() => this.initResourceStatus(resourceList))
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

    const relatedActions = this.filteredSystemActionList.filter((action: any) => action.autoSelected === row.actionValue).map(row => row.actionValue)
    const actionList = this.form.statementList[index].actionList
    return !(relatedActions.length && actionList.filter(action => relatedActions.includes(action)).length)
  }

  /**
   * 初始化资源选中状态
   */
  public async initResourceStatus(resourceList: any) {
    try {
      this.loading.dir = true
      const dirTree: any = this.$refs.dirTree
      const checkedKeys = []
      for (let index = 0, len = resourceList.length; index < len; index++) {
        const resource = resourceList[index]
        if (/vssgroup/.test(resource)) {
          const _key = resource.split(':').slice(-1)[0]
          checkedKeys.push(_key)
        } else {
          const keyPath = resource.split(':').slice(2).join('/').split(/\//)
          if (keyPath && keyPath.length) {
            for (let i = 0; i < keyPath.length - 1; i++) {
              const _key = keyPath[i]
              const node = dirTree.getNode(_key)
              if (node) {
                await this.loadDirChildren(_key, node)
              }
            }
            checkedKeys.push(keyPath[keyPath.length - 1])
          }
        }
      }
      dirTree.setCheckedKeys(checkedKeys)
    } catch (e) {
      console.log('e: ', e)
    } finally {
      this.loading.dir = false
    }
  }

  /**
   * 加载子目录
   */
  public async loadDirChildren(key: string, node: any) {
    if (node.loaded) {
      node.parent.expanded = true
      return
    }
    try {
      const dirTree: any = this.$refs.dirTree
      const data = await getDeviceTree({
        groupId: node.data.groupId,
        id: node.data.type === 'group' ? 0 : node.data.id,
        inProtocol: node.data.inProtocol,
        type: node.data.type === 'group' ? undefined : node.data.type
      })
      if (data.dirs) {
        const dirs = data.dirs
          .filter((dir: any) => dir.type === 'dir')
          .map((dir: any) => ({
            id: dir.id,
            groupId: node.data.groupId,
            label: dir.label,
            inProtocol: node.data.inProtocol,
            isLeaf: dir.isLeaf,
            type: dir.type,
            path: node.data.path.concat([dir]),
            parentId: node.data.id
          }))
        dirTree.updateKeyChildren(key, dirs)
      }
      node.expanded = true
      node.loaded = true
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 目录初始化
   */
  public async initDirs() {
    try {
      this.loading.dir = true
      const res = await getGroups({
        pageSize: 1000
      })
      this.dirList = []
      res.groups.forEach((group: any) => {
        group.inProtocol !== 'vgroup' &&
          this.dirList.push({
            id: group.groupId,
            groupId: group.groupId,
            label: group.groupName,
            inProtocol: group.inProtocol,
            type: 'group',
            parentId: '0',
            path: [
              {
                id: group.groupId,
                label: group.groupName,
                type: 'group'
              }
            ]
          })
      })
    } catch (e) {
      this.dirList = []
    } finally {
      this.loading.dir = false
    }
  }

  /**
   * 加载目录
   */
  private async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) return resolve([])
    const dirs = await this.getTree(node)
    resolve(dirs)
  }

  /**
   * 获取菜单树
   */
  private async getTree(node: any) {
    try {
      const shareDeviceIds: any = []

      const devices: any = await getDeviceTree({
        groupId: node.data.groupId,
        id: node.data.type === 'group' ? 0 : node.data.id,
        inProtocol: node.data.inProtocol,
        type: node.data.type === 'group' ? undefined : node.data.type
      })

      const dirTree: any = this.$refs.dirTree
      const checkedKeys = dirTree.getCheckedKeys()
      const dirs: any = devices.dirs
        .filter((dir: any) => dir.type === 'dir')
        .map((dir: any) => {
          if (shareDeviceIds.includes(dir.id) && dir.type === 'ipc') {
            checkedKeys.push(dir.id)
            dirTree.setCheckedKeys(checkedKeys)
          }
          return {
            id: dir.id,
            groupId: node.data.groupId,
            label: dir.label,
            inProtocol: node.data.inProtocol,
            isLeaf: dir.isLeaf,
            type: dir.type,
            path: node.data.path.concat([dir]),
            parentId: node.data.id
          }
        })
      return dirs
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 当设备被选中时回调，将选中的设备列出
   */
  private onCheckDevice(data: any, index: number) {
    const dirTree: any = this.$refs[`dirTree_${index}`][0]
    const nodes = dirTree.getCheckedNodes()
    this.form.statementList[index].resourceList = nodes.filter((node: any) => {
      const nodeIdsList = nodes.map((node: any) => node.id)
      return nodeIdsList.indexOf(node.parentId) === -1
    })
  }

  /**
   * 移除设备
   */
  private removeDevice(index: number, device: any) {
    const dirTree: any = this.$refs[`dirTree_${index}`][0]
    dirTree.setChecked(device.id, false)
  }

  /**
   * 显示设备所在路径
   */
  private renderPath(path: any) {
    const dirPath = path.slice(0, -1)
    const dirPathName = dirPath.map((dir: any) => {
      return dir.label
    })
    return dirPathName.join('/')
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
              Statement: this.form.statementList.map((statement: any) =>
                ({
                  Effect: statement.effect,
                  Action: statement.actionList,
                  Resource:
                    statement.resourceType === 'all'
                      ? ['*']
                      : statement.resourceList.map((resource: any) => {
                        const mainUserID = this.$store.state.user.mainUserID
                        const inProtocol = resource.inProtocol
                        const type = resource.type
                        const pathIds = resource.path.map(
                          (obj: any) => obj.id
                        )
                        return `${mainUserID}:${inProtocol}-${
                          type === 'group' ? 'vssgroup' : 'directory'
                        }:${pathIds[0]}${
                          (pathIds.length > 1 ? ':' : '') +
                            pathIds.slice(1).join('/')
                        }`
                      })
                })
              )
            })
          }
          ;(await this.form.policyId) ? editPolicy(data) : createPolicy(data)
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
}

.statement-block:first-child {
  margin-top: 36px;
}
</style>
