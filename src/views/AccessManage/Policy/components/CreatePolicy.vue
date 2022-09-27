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
            <div v-loading="loading.dir" class="tree-wrap">
              <el-tree ref="dirTree" node-key="id" lazy show-checkbox :data="dirList" :load="loadDirs" :props="treeProp" :check-strictly="false" @check-change="onCheckDevice">
                <span slot-scope="{node, data}" class="custom-tree-node" :class="`custom-tree-node__${data.type}`">
                  <span class="node-name">
                    <svg-icon :name="data.type" color="#6e7c89" />
                    {{ node.label }}
                  </span>
                </span>
              </el-tree>
            </div>
            <div class="device-wrap">
              <div class="device-wrap__header">已选资源({{ form.resourceList.length }})</div>
              <el-table ref="deviceTable" :data="form.resourceList" empty-text="暂无选择资源" fit>
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
                    <el-button type="text" @click="removeDevice(scope.row)">移除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
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
  private systemActionList = [
    {
      actionName: '查看业务组',
      actionValue: 'DescribeGroup',
      actionDesc: '拥有业务组的查看权限，可以展示业务组管理菜单'
    },
    {
      actionName: '管理业务组',
      actionValue: 'AdminGroup',
      actionDesc: '拥有业务组的管理权限，可对业务组进行管理操作'
    },
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
      this.actionType = 'selected'
      await this.initDirs()
    }
  }

  private handleSelectionChange(actions: any) {
    const actionTable: any = this.$refs.actionTable
    this.$nextTick(() => {
      actions.forEach((action: any) => {
        if (action.actionValue === 'AdminGroup') {
          actionTable.toggleRowSelection(this.systemActionList[0], true)
        }
        if (action.actionValue === 'AdminDevice') {
          actionTable.toggleRowSelection(this.systemActionList[2], true)
        }
        if (action.actionValue === 'AdminRecord') {
          actionTable.toggleRowSelection(this.systemActionList[5], true)
        }
        if (action.actionValue === 'AdminRecord') {
          actionTable.toggleRowSelection(this.systemActionList[5], true)
        }
        if (action.actionValue === 'AdminAi') {
          actionTable.toggleRowSelection(this.systemActionList[7], true)
        }
      })
    }) 
    this.form.actionList = actions.map((action: any) => action.actionValue)
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
      this.loading.resource = true
      const res: any = await getPolicyInfo({
        policyId: this.form.policyId
      })
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
            'DescribeGroup',
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
  private checkSelectable(row: any) {
    const actionList = this.form.actionList
    return !(
      this.isCtyunPolicy ||
      (row.actionValue === 'DescribeGroup' &&
        actionList.indexOf('AdminGroup') !== -1) ||
      (row.actionValue === 'DescribeDevice' &&
        actionList.indexOf('AdminDevice') !== -1) ||
      (row.actionValue === 'ReplayRecord' &&
        actionList.indexOf('AdminRecord') !== -1) ||
      (row.actionValue === 'DescribeAi' && actionList.indexOf('AdminAi') !== -1)
    )
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
      let data = await getDeviceTree({
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
      let shareDeviceIds: any = []

      const devices: any = await getDeviceTree({
        groupId: node.data.groupId,
        id: node.data.type === 'group' ? 0 : node.data.id,
        inProtocol: node.data.inProtocol,
        type: node.data.type === 'group' ? undefined : node.data.type
      })

      const dirTree: any = this.$refs.dirTree
      let checkedKeys = dirTree.getCheckedKeys()
      let dirs: any = devices.dirs
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
  private onCheckDevice() {
    const dirTree: any = this.$refs.dirTree
    const nodes = dirTree.getCheckedNodes()
    this.form.resourceList = nodes.filter((node: any) => {
      const nodeIdsList = nodes.map((node: any) => node.id)
      return nodeIdsList.indexOf(node.parentId) === -1
    })
  }

  /**
   * 移除设备
   */
  private removeDevice(device: any) {
    const dirTree: any = this.$refs.dirTree
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
          let data = {
            policyId: this.form.policyId || undefined,
            policyName: this.form.policyName,
            desc: this.form.desc,
            scope: 'local',
            policyDocument: JSON.stringify({
              Version: '2021-03-08',
              Statement: [
                {
                  Effect: 'Allow',
                  Action: this.form.actionList,
                  Resource:
                    this.resourceType === 'all'
                      ? ['*']
                      : this.form.resourceList.map((resource: any) => {
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
                }
              ]
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
</style>
