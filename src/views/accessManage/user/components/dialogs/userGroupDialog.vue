<template>
  <el-dialog
    :v-loading="loading.form"
    :title="dialogTitle"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    center
    width="700px"
    @close="closeDialog"
  >
    <el-form
      ref="form"
      :rules="rules"
      :model="form"
      label-position="right"
      label-width="120px"
    >
      <el-form-item v-if="dialogData.type === 'merge'" label-width="0" prop="aimGroupId">
        <div class="breadcrumb">
          <label>合并至子部门:</label>
          <span
            v-for="item in breadcrumb"
            :key="item.groupId"
            class="breadcrumb__item"
          >
            {{ item.groupName }}
          </span>
        </div>
        <el-tree
          v-if="dialogData.type === 'merge'"
          ref="groupTree"
          :props="props"
          node-key="groupId"
          highlight-current
          :expand-on-click-node="false"
          :default-expanded-keys="['']"
          current-node-key=""
          lazy
          :load="loadGroups"
          @current-change="setCurrentNode"
        />
      </el-form-item>
      <el-form-item v-else label="子部门名称:" prop="groupName">
        <el-input v-model="form.groupName" />
        <el-row class="form-tip">2-16位，可包含大小写字母、数字、中文、中划线。</el-row>
      </el-form-item>
    </el-form>
    <div slot="footer" align="center">
      <el-button type="primary" :disabled="loading.submit" @click="operateGroup(dialogData.type)">确定</el-button>
      <el-button :disabled="loading.submit" @click="closeDialog">取消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { createGroup, modifyGroup, getGroup, combineGroup, getGroupList } from '@/api/accessManage'
@Component({
  name: 'AddGroup'
})
export default class extends Vue {
  @Prop() private dialogData: any
  private dialogTitle: string = ''
  private dialogVisible = true
  private loading: any = {
    form: false,
    submit: false
  }
  private props: object = {
    label: 'groupName',
    children: 'children'
  }
  private currentNode: any = {
    data: {
      groupName: '通讯录',
      groupId: ''
    }
  }
  private breadcrumb: any = []
  private form: any = {
    groupName: '',
    groupId: '',
    aimGroupId: '',
    isChoosePath: false
  }
  private rules = {
    groupName: [
      { required: true, message: '请输入子部门名称', trigger: 'blur' },
      { validator: this.validateGroupName, trigger: 'blur' }
    ],
    aimGroupId: [
      { required: true, message: '请选择目标子部门', trigger: 'blur' }
    ]
  }

  private mounted() {
    if (this.dialogData.type === 'add') {
      this.dialogTitle = '创建子部门'
    } else if (this.dialogData.type === 'edit') {
      this.dialogTitle = '修改子部门'
      this.getGroup()
    } else if (this.dialogData.type === 'merge') {
      this.dialogTitle = '合并子部门'
    }
  }

  private setCurrentNode(data: any, node: any) {
    this.currentNode = node
    this.form.aimGroupId = node.data.groupId
    this.breadcrumb = this.getNodePath(node)
  }

  private getNodePath(node: any) {
    let curentNodePath: any = []
    this.findParentNode(node, curentNodePath)
    return curentNodePath
  }

  private findParentNode(node: any, curentNodePath: any) {
    if (node.parent !== null) {
      curentNodePath.unshift({
        groupName: node.data.groupName,
        groupId: node.data.groupId
      })
      this.findParentNode(node.parent, curentNodePath)
    }
  }

  private async loadGroups(node: any, resolve: Function) {
    if (node.level === 0) {
      return resolve([
        { groupName: '通讯录', groupId: '', children: [] }
      ])
    }
    try {
      const res = await getGroupList({
        parentGroupId: node.data.groupId
      })
      let groups = res.groups.filter((item: any) => item.groupId !== this.dialogData.data.groupId)
      let dirs: any = groups.map((group: any) => {
        return {
          groupName: group.groupName,
          groupId: group.groupId
        }
      })
      resolve(dirs)
    } catch (e) {
      console.log(e)
    }
  }

  private closeDialog() {
    this.$emit('on-close', false)
  }

  private async getGroup() {
    let params = {
      groupId: this.dialogData.data.groupId
    }
    this.loading.form = true
    let res = await getGroup(params)
    this.loading.form = false
    this.form.groupId = res.groupId
    this.form.groupName = res.groupName
  }

  private async operateGroup(type: any) {
    const form: any = this.$refs.form
    form.validate(async(valid: any) => {
      try {
        if (valid) {
          let params: any = {
            groupName: this.form.groupName
          }
          this.loading.submit = true
          if (type === 'add') {
            params.parentGroupId = this.dialogData.data.groupId
            await createGroup(params)
            this.$message.success('创建子部门成功')
            this.$emit('on-close', { type: 'add' })
          } else if (type === 'edit') {
            params.groupId = this.form.groupId
            await modifyGroup(params)
            this.$message.success('修改子部门成功')
            this.$emit('on-close', { type: 'edit', nodeKey: params.groupId })
          } else if (type === 'merge') {
            params = {
              sourceGroupId: this.dialogData.data.groupId,
              destGroupId: this.form.aimGroupId
            }
            await combineGroup(params)
            this.$message.success('合并子部门成功')
            this.$emit('on-close', { type: 'merge' })
          }
        } else {
          return false
        }
      } catch (e) {
        this.$message.error(e && e.message)
      } finally {
        this.loading.submit = false
      }
    })
  }

  private validateGroupName(rule: any, value: any, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-]{2,16}$/.test(value)) {
      callback(new Error('2-16位，可包含大小写字母、数字、中划线。'))
    } else {
      callback()
    }
  }
}
</script>
<style lang="scss" scoped>
  .breadcrumb {
    height: 50px;
    line-height: 50px;
    padding-left: 20px;
    border: 1px solid $primary;
    background: #f8f8f8;
    transition: padding-left .2s;
    margin-bottom: 10px;
    label {
      margin-right: 20px;
      color: $textGrey;
    }
    &__item {
      cursor: pointer;
    }
    &__item:after {
      content: '>';
      color: $textGrey;
      margin: 0 10px;
    }
    &__item:last-child:after {
      content: '';
    }
  }
</style>
