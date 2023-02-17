<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <el-form ref="userForm" :model="form" :rules="rules" label-position="right" label-width="150px">
        <el-form-item v-if="isEdit" label="角色ID" prop="roleId">
          <el-input v-model="form.roleId" disabled />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="绑定账户ID" prop="bindingUserId">
          <el-input v-model="form.extendUserId" placeholder="请输入绑定账户ID" />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="策略选择" prop="policy">
          <el-row>
            <el-checkbox v-model="form.policyType.system">系统预置策略</el-checkbox>
          </el-row>
          <div :class="{'policy__init__system': true, 'policy__collapse': !form.policyType.system}">
            <el-table ref="policyList" v-loading="loading.table" max-height="400" :data="policyList" @selection-change="handleSelectionChange" @row-click="rowClick">
              <template slot="empty">
                <span>暂无策略，请先添加策略。</span>
              </template>
              <el-table-column type="selection" width="55" />
              <el-table-column prop="policyName" label="策略名" width="150" />
              <el-table-column prop="policyDescribe" label="策略描述" />
            </el-table>
          </div>
          <el-row>
            <el-checkbox v-model="form.policyType.customize">自定义策略</el-checkbox>
          </el-row>
          <div :class="{'policy__init__customize': true, 'policy__collapse': !form.policyType.customize}">
            <el-form-item label="资源" class="policy-label" label-width="70px">
              <div v-loading="loading.dir" class="tree-container">
                <el-tree ref="dirTree" highlight-current lazy :data="dirList" :load="loadDirs" :props="treeProp" node-key="id" show-checkbox :default-expanded-keys="form.expandedKeys">
                  <span slot-scope="{node, data}" class="custom-tree-node">
                    <span class="node-name">
                      <svg-icon :name="data.icon" color="#6e7c89" />
                      {{ node.label }}
                    </span>
                  </span>
                </el-tree>
              </div>
            </el-form-item>
            <el-form-item label="操作" class="policy-label" label-width="70px">
              <el-select v-model="operateType" placeholder="请选择">
                <el-option v-for="item in operateOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="form.description" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item>
          <el-button :disabled="loading.submit" type="primary" @click="submit">提交</el-button>
          <el-button :disabled="loading.submit" @click="back">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import {
getPolicyList,
iamCreateRole,
iamGetRole,
iamModifyRole
} from '@/api/accessManage'
import { getDeviceTree } from '@/api/device'
import { getGroups } from '@/api/group'
import { dateFormat } from '@/utils/date'
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'CreateRole'
})
export default class extends Vue {
  private loading = {
    submit: false,
    table: false,
    dir: false
  }
  private query: any = null
  private breadCrumbContent: string = ''
  private form = {
    extendUserId: '',
    roleName: '',
    policy: 'init',
    policyType: {
      system: false,
      customize: false
    },
    systemPolicy: [],
    policyDocument: '',
    dateTime: '',
    description: '',
    expandedKeys: ['']
  }
  private policyList: any = []
  private roleResources: any = null
  private operateType = 'vss:*'
  private operateOptions = [
    {
      label: '管理员权限',
      value: 'vss:*'
    },
    {
      label: '只读权限',
      value: 'vss:Get'
    }
  ]
  private dirList: any = []
  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }
  private rules = {
    extendUserId: [
      { required: true, message: '请填写外部用户ID', trigger: 'blur' }
    ],
    roleName: [{ required: true, message: '请填写角色名称', trigger: 'blur' }],
    policy: [{ required: true, message: '请添加用户权限' }]
  }
  private get isEdit() {
    return this.$route.query.type === 'edit'
  }
  private async mounted() {
    await this.getPolicyList()
    this.initResourceDirs()
    this.query = this.$route.query
    if (this.query.type === 'edit') {
      this.breadCrumbContent = '编辑角色'
      this.form.expandedKeys = ['']
      this.editInit()
    } else if (this.query.type === 'add') {
      this.breadCrumbContent = '创建角色'
      this.form.expandedKeys = ['-1']
    }
  }

  private initResourceDirs() {
    this.dirList = [
      {
        label: '所有分组',
        id: '-1',
        icon: 'list'
      }
    ]
  }
  // 获取策略列表
  private async getPolicyList() {
    let params: any = {
      pageSize: 1000
    }
    try {
      this.loading.table = true
      let res: any = await getPolicyList(params)
      this.policyList = []
      for (let i = 0; i < res.iamPolicies.length; i++) {
        let obj: object = {
          policyName: res.iamPolicies[i].policyName,
          policyDescribe: res.iamPolicies[i].policyDesc,
          policyId: res.iamPolicies[i].policyId
        }
        this.policyList.push(obj)
      }
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.table = false
    }
  }

  /**
   * 管理角色初始化
   */
  private async editInit() {
    this.loading.dir = true
    const dirTree: any = this.$refs.dirTree
    let groups = await getGroups({
      pageSize: 1000
    })
    let dirs = groups.groups.map((group: any) => {
      return {
        label: group.groupName,
        groupId: group.groupId,
        id: group.groupId,
        icon: 'tree',
        isGroup: true,
        type: 'group',
        deviceType: 'dir',
        resourceType: 'vssgroup',
        inProtocol: group.inProtocol,
        path: group.groupId
      }
    })
    dirTree.updateKeyChildren('-1', dirs)
    console.log(dirs)

    dirTree.getNode('-1').expanded = true
    await this.getRoleInfo()
    let maxLength = 0
    let pathList: any = []
    let keyList: any = []
    console.log(this.roleResources)

    let resourceList = this.roleResources.map((resource: any) => {
      let arr = resource.split(':')
      let arrList = arr[arr.length - 1].split('/')
      maxLength = maxLength > arrList.length ? maxLength : arrList.length
      for (let i = 0; i < arrList.length; i++) {
        if (i === arrList.length - 1) {
          keyList.push(arrList[i])
        } else {
          !pathList[i] && (pathList[i] = [])
          pathList[i] && pathList[i].push(arrList[i])
          pathList[i] = [...new Set(pathList[i])]
        }
      }
      return arrList
    })
    console.log(resourceList)
    console.log(pathList)
    console.log(keyList)
    if (keyList.indexOf('*') !== -1) {
      dirTree.setCheckedKeys(['-1'])
      console.log(1)
    } else {
      await this.initDirTree(pathList, keyList)
    }
    this.loading.dir = false
  }
  // 查询角色
  private async getRoleInfo() {
    const policyTable: any = this.$refs.policyList
    try {
      this.loading.submit = true
      const roleInfo: any = await iamGetRole({ roleId: this.query.roleId })
      console.log(roleInfo)
      this.form.extendUserId = roleInfo.principal
      this.form.roleName = roleInfo.roleName
      this.form.description = roleInfo.description
      if (roleInfo.systemPolicy.systemPolicy.length) {
        this.form.policyType.system = true
        this.form.systemPolicy = roleInfo.systemPolicy.systemPolicy.map(
          (policy: any) => {
            let selectRow = this.policyList.find((row: any) => {
              return row.policyId === policy.policyId
            })
            policyTable.toggleRowSelection(selectRow)
            return policy.policyId
          }
        )
      }
      console.log(this.form.systemPolicy)

      if (roleInfo.policyDocument) {
        this.form.policyType.customize = true
        this.form.policyDocument = JSON.parse(roleInfo.policyDocument)
        const policyDocument: any = this.form.policyDocument
        this.roleResources = policyDocument.statement[0].resource
        this.operateType = policyDocument.statement[0].action[0]
      }
      // this.roleResources = [
      //   'ctyun:vss:::gb28181-dir:152352445740318720/152873158985367552',
      //   'ctyun:vss:::gb28181-ipc:152352445740318720/155064983875829760/29942163714343227',
      //   'ctyun:vss:::gb28181-nvr:152352445740318720/29942013390487957',
      //   'ctyun:vss:::gb28181-nvrchannel:152352445740318720/29942013390487957/29942058487644566',
      //   'ctyun:vss:::rtsp-vssgroup:155262131464667136',
      //   'ctyun:vss:::rtsp-dir:155262131464667136/155806982425935872',
      //   'ctyun:vss:::gb28181-nvrchannel:156752021260009472/29941959703396695/29942165861826904'
      // ]
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.submit = false
    }
  }
  // 根据查询角色信息初始化资源目录树
  private async initDirTree(pathList: any, keyList: any) {
    const dirTree: any = this.$refs.dirTree
    for (let i = 0; i < pathList.length; i++) {
      let promiseList: any = []
      pathList[i].forEach((path: any) => {
        let node: any = dirTree.getNode(path)
        if (node) {
          let getChild = this.loadDirs(node, (data: any) => {
            dirTree.updateKeyChildren(path, data)
          }).then(() => {
            node.expanded = true
          })
          promiseList.push(getChild)
        }
      })
      await Promise.all(promiseList)
    }
    dirTree.setCheckedKeys(keyList)
  }

  /**
   * 创建角色初始化
   */
  private async loadDirs(node: any, resolve: Function) {
    const data = node.data
    if (node.level === 0) return resolve([])
    else if (node.level === 1) {
      const res = await getGroups({
        pageSize: 1000
      })
      let dirs = res.groups.map((group: any) => {
        return {
          label: group.groupName,
          groupId: group.groupId,
          id: group.groupId,
          icon: 'tree',
          isGroup: true,
          type: 'group',
          deviceType: 'dir',
          resourceType: 'vssgroup',
          inProtocol: group.inProtocol,
          path: group.groupId
        }
      })
      resolve(dirs)
    } else {
      const res = await getDeviceTree({
        groupId: data.groupId,
        id: data.isGroup ? '0' : data.id,
        type: data.type === 'group' ? 'dir' : data.type
      })
      let dirs = res.dirs.map((dir: any) => {
        dir.groupId = data.groupId
        dir.icon = dir.type
        dir.inProtocol = data.inProtocol
        dir.deviceType =
          dir.type === 'nvr' || dir.type === 'platform'
            ? dir.type
            : data.deviceType
        dir.path = `${data.path}/${dir.id}`
        if (
          (data.deviceType === 'nvr' || data.deviceType === 'platform') &&
          dir.type === 'ipc'
        ) {
          dir.resourceType = `${data.type}channel`
        } else if (dir.type === 'dir') {
          dir.resourceType = 'directory'
        } else {
          dir.resourceType = dir.type
        }
        return dir
      })
      resolve(dirs)
    }
  }

  private handleSelectionChange(selection: any) {
    this.form.systemPolicy = selection.map((select: any) => {
      return { policyId: select.policyId }
    })
  }
  private rowClick(row: any) {
    const policyList: any = this.$refs.policyList
    policyList.toggleRowSelection(row)
  }

  /**
   * 提交
   */
  private async submit() {
    console.log(this.form.systemPolicy)
    this.getPolicyDocument()
    if (
      (this.form.policyType.system && this.form.systemPolicy.length) ||
      (this.form.policyType.customize && this.form.policyDocument)
    ) {
      this.form.policy = 'valid'
    } else {
      this.form.policy = ''
    }
    const form: any = this.$refs.userForm
    form.validate(async(valid: any) => {
      if (!valid) return
      let params: any = {
        roleName: this.form.roleName,
        description: this.form.description,
        systemPolicy: {
          systemPolicy: []
        },
        policyDocument: ''
      }
      this.form.policyType.system &&
        (params.systemPolicy.systemPolicy = this.form.systemPolicy)
      this.form.policyType.customize &&
        (params.policyDocument = this.form.policyDocument)
      console.log(params)

      try {
        this.loading.submit = true
        if (this.query.type === 'add') {
          params.principal = this.form.extendUserId
          console.log(params)
          await iamCreateRole(params)
          this.$message.success('创建角色成功')
        } else if (this.query.type === 'edit') {
          params.roleId = this.query.roleId
          await iamModifyRole(params)
          this.$message.success('修改角色成功')
        }
        console.log(params)

        this.back()
      } catch (e) {
        this.$message.error(e && e.message)
      } finally {
        this.loading.submit = false
      }
    })
  }
  // 获取格式化的已选自定义策略
  private getPolicyDocument() {
    const dirTree: any = this.$refs.dirTree
    let resources = []
    for (var node of dirTree.getCheckedNodes()) {
      if (node.id === '-1') {
        resources.push('ctyun:vss:::*')
        break
      }
      resources.push(
        `ctyun:vss:::${node.inProtocol}-${node.resourceType}:${node.path}`
      )
    }
    if (resources.length) {
      let policy: any = {
        version: dateFormat(new Date(), 'yyyy-MM-dd'),
        statement: [
          {
            effect: 'Allow',
            action: [this.operateType],
            resource: resources
          }
        ]
      }
      policy.statement[0].resource.length > 0 &&
        (this.form.policyDocument = JSON.stringify(policy))
    }
    console.log(resources)
  }

  /**
   * 返回
   */
  private back() {
    this.$router.push({
      name: 'AccessManageRole'
    })
  }
}
</script>

<style lang="scss" scoped>
.el-input {
  width: 400px;
}

.el-textarea {
  width: 500px;
}

.el-date-editor {
  width: 200px;
}

.el-table {
  width: 500px;
}

.tree-container {
  width: 430px;
  max-height: 300px;
  border-radius: 5px;
  padding: 10px;
  overflow: auto;
  border: 1px solid #dcdfe6;
}

.policy-label {
  margin-top: 20px;

  ::v-deep {
    .el-input__inner {
      border-color: #dcdfe6 !important;
    }
  }
}

.policy {
  &__init {
    &__system {
      max-height: 400px;
      transition: 0.3s;
      overflow: hidden;
    }

    &__customize {
      max-height: 400px;
      transition: 0.3s;
      overflow: hidden;
    }
  }

  &__collapse {
    max-height: 0 !important;
  }
}
</style>
