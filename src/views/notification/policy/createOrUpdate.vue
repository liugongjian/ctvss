<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card v-loading="loading.resource">
      <el-form ref="form" class="form" :rules="rules" :model="form" label-width="100px">
        <el-form-item v-if="isUpdate" label="策略ID：" prop="id">
          <el-input v-model="form.id" class="form__input" :disabled="isUpdate" />
        </el-form-item>
        <el-form-item label="策略名：" prop="name">
          <el-input v-model="form.name" class="form__input" placeholder="请填写策略名称" />
          <div class="form-tip">2-32位，可包含大小写字母、数字、中文、中划线、空格。</div>
        </el-form-item>
        <el-form-item label="描述：" prop="desciption">
          <el-input
            v-model="form.desciption"
            class="form__input"
            type="textarea"
            rows="4"
          />
        </el-form-item>
        <el-form-item label="推送方式：" prop="">
          <el-radio-group v-model="resourceType" style="margin-bottom: 5px;" :disabled="isCtyunPolicy">
            <el-radio label="all">所有资源</el-radio>
            <el-radio label="selected">特定资源</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生效资源：" prop="resourceList">
          <div class="dialog-wrap">
            <div v-loading="loading.dir" class="tree-wrap">
              <el-tree
                ref="dirTree"
                node-key="id"
                lazy
                show-checkbox
                :data="dirList"
                :load="loadDirs"
                :props="treeProp"
                :check-strictly="false"
                @check-change="onCheckDevice"
              >
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
            <template>
              <el-button type="primary" class="confirm" @click="upload">确定</el-button>
            </template>
          </el-row>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getDeviceTree } from '@/api/device'
import { getGroups } from '@/api/group'
import { getNotificationPolicyInfo, createNotificationPolicy, editNotificationPolicy } from '@/api/notification'
import { INotifictionPolicyForm } from '@/type/notification'

@Component({
  name: 'notification-policy-create-or-update'
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
  private form: INotifictionPolicyForm = {
    id: '',
    name: '',
    description: '',
    source: '',
    sourceRules: [],
    notifyChannel: '',
    notifyTemplate: '',
    effectiveTime: '',
    notifyFreq: '',
    notifyResources: [],
    notifyDestinations: [],
    active: 0
  }
  private rules = {
    policyName: [
      { required: true, message: '请输入策略名称', trigger: 'blur' },
      { validator: this.validatePolicyName, trigger: 'blur' }
    ],
    resourceList: [
      { validator: this.validateResourceList, trigger: 'blur' }
    ]
  }

  private validatePolicyName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-\s]{2,32}$/.test(value)) {
      callback(new Error('策略名称格式错误。2-32位，可包含大小写字母、数字、中文、中划线、空格。'))
    } else {
      callback()
    }
  }

  private validateResourceList(rule: any, value: string, callback: Function) {
    if (!this.form.resourceList.length) {
      callback(new Error('资源列表不能为空！'))
    } else {
      callback()
    }
  }

  private get isUpdate() {
    return this.$route.name === 'notification-policy-edit'
  }
  private async mounted() {
    this.breadCrumbContent = this.$route.meta.title
    await this.initDirs()
    if (this.isUpdate) {
      const id = this.$route.query.id
      if (id) {
        this.$set(this.form, 'id', id)
        await this.getNotificationPolicyInfo()
      } else {
        this.back()
      }
    }
  }

  /*
   * 获取策略详情
   */
  private async getNotificationPolicyInfo() {
    try {
      this.loading.resource = true
      const res: any = await getNotificationPolicyInfo({
        id: this.form.id
      })
      this.form.policyName = res.policyName
      this.form.desc = res.desc
      const policyInfo = JSON.parse(res.policyDocument)
      const resourceList = policyInfo.Statement[0].Resource
      this.initResourceStatus(resourceList)
    } catch (e) {
      console.log('e: ', e)
      this.$message.error('查询策略详情出错！')
    } finally {
      this.loading.resource = false
    }
  }

  /**
   * 初始化资源选中状态
   */
  public async initResourceStatus(resourceList: any) {
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
        const dirs = data.dirs.filter((dir: any) => dir.type === 'dir').map((dir: any) => ({
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
        (group.inProtocol !== 'vgroup') && (
          this.dirList.push({
            id: group.groupId,
            groupId: group.groupId,
            label: group.groupName,
            inProtocol: group.inProtocol,
            type: 'group',
            parentId: '0',
            path: [{
              id: group.groupId,
              label: group.groupName,
              type: 'group'
            }]
          })
        )
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
      let dirs: any = devices.dirs.filter((dir: any) => dir.type === 'dir').map((dir: any) => {
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
            id: this.form.id || undefined,
            policyName: this.form.policyName,
            desc: this.form.desc,
            policyDocument: JSON.stringify({
              'Version': '2022-03-25',
              'Statement': [
                {
                  'Effect': 'Allow',
                  'Resource': this.form.resourceList.map((resource: any) => {
                    const mainUserID = this.$store.state.user.mainUserID
                    const inProtocol = resource.inProtocol
                    const type = resource.type
                    const pathIds = resource.path.map((obj: any) => obj.id)
                    return `${mainUserID}:${inProtocol}-${type === 'group' ? 'vssgroup' : 'directory'}:${pathIds[0]}${(pathIds.length > 1 ? ':' : '') + pathIds.slice(1).join('/')}`
                  })
                }
              ]
            })
          }
          await this.form.id ? editNotificationPolicy(data) : createNotificationPolicy(data)
          this.$message.success(`${this.form.id ? '编辑策略成功！' : '创建策略成功！'}`)
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
