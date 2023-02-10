<template>
  <el-dialog
    v-loading="loading.form"
    :title="dialogTitle"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    center
    width="700px"
    @close="closeDialog"
  >
    <template v-if="dialogData.type !== 'merge'">
      <div class="group-dialog__inherited">
        <span class="group-dialog__inherited_title">继承上级部门策略:</span>
        <div class="group-dialog__inherited_tag">
          <template v-if="inheritedPolicies.length">
            <el-tag
              v-for="policy in inheritedPolicies"
              :key="policy.name"
              style="margin-right: 10px; margin-bottom: 3px;"
            >
              {{ `${policy.policyName}(${policy.groupDetails.groupName})` }}
            </el-tag>
          </template>
          <el-button v-else type="text">暂无继承策略</el-button>
        </div>
      </div>
      <div class="group-dialog__policy">
        <span class="group-dialog__policy_title">自定义策略:</span>
        <el-table
          ref="policyTable"
          :data="iamPolicies"
          max-height="320"
          tooltip-effect="dark"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="策略名称" prop="policyName" min-width="200">
            <template slot-scope="{row}">
              {{ row.policyName }}
              <el-button v-if="row.inherited" type="text">[已继承]</el-button>
            </template>
          </el-table-column>
          <el-table-column label="策略描述" prop="policyDesc" width="200" show-overflow-tooltip />
          <el-table-column label="关联次数" prop="bindingCnt" width="120" />
        </el-table>
      </div>
    </template>
    <el-form
      ref="form"
      :rules="rules"
      :model="form"
      label-position="right"
      label-width="120px"
    >
      <el-form-item v-if="dialogData.type === 'merge'" label-width="0" prop="aimGroupId">
        <div class="breadcrumb">
          <label>合并至部门:</label>
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
      <template v-else>
        <el-form-item label="部门名称:" prop="groupName">
          <el-input v-model="form.groupName" />
          <el-row class="form-tip">2-16位，可包含大小写字母、数字、中文、中划线。</el-row>
        </el-form-item>
        <el-form-item label="描述" prop="groupDesc">
          <el-input v-model="form.groupDesc" type="textarea" rows="4" />
        </el-form-item>
      </template>
    </el-form>
    <div slot="footer" align="center">
      <el-button type="primary" :disabled="loading.submit" @click="operateGroup(dialogData.type)">确定</el-button>
      <el-button :disabled="loading.submit" @click="closeDialog">取消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { createGroup, modifyGroup, getGroup, combineGroup, getGroupList, getPolicyList, getGroupInheritedPolicies } from '@/api/accessManage'
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
      groupId: '',
      groupName: '通讯录'
    }
  }
  private breadcrumb: any = []
  private iamPolicies: any = []
  private inheritedPolicies: any = []
  private selectedPolicies: any = []
  private form: any = {
    groupId: '',
    groupName: '',
    aimGroupId: '',
    groupDesc: ''
  }
  private rules = {
    groupName: [
      { required: true, message: '请输入部门名称', trigger: 'blur' },
      { validator: this.validateGroupName, trigger: 'blur' }
    ],
    aimGroupId: [
      { required: true, message: '请选择目标部门', trigger: 'blur' }
    ]
  }

  private async mounted() {
    const type = this.dialogData.type
    const groupId = this.dialogData.data.groupId
    if (type !== 'merge') {
      if (type === 'add') {
        this.dialogTitle = '创建部门'
        this.initCreateGroup(groupId)
      } else if (type === 'edit') {
        this.dialogTitle = '修改部门'
        this.initModifyGroup(groupId)
      }
    } else {
      this.dialogTitle = '合并部门'
    }
  }

  private handleSelectionChange(rows: any) {
    this.selectedPolicies = rows
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

  /**
   * 获取全量策略列表
   */
  private async getPolicyList() {
    let params = {
      scope: 'all',
      pageNum: 1,
      pageSize: -1,
      policyType: 'subUser'
    }
    let res = await getPolicyList(params)
    return res
  }

  private async initCreateGroup(parentGroupId: string) {
    try {
      this.loading.form = true
      let params = {
        groupId: parentGroupId
      }
      const [iamPoliciesRes, inheritedPoliciesRes, groupRes] =
        await Promise.all([this.getPolicyList(), getGroupInheritedPolicies(params), getGroup(params)])

      const iamPolicies = iamPoliciesRes.iamPolicies
      const policyIds = groupRes.policyIds
      const tempPolicies = policyIds.map(id => {
        const policy = iamPolicies.find(iamPolicy => iamPolicy.policyId === id)
        return {
          policyId: policy.policyId,
          policyName: policy.policyName,
          policyDesc: policy.policyDesc,
          groupDetails: {
            groupId: groupRes.groupId,
            groupName: groupRes.groupName,
            groupDesc: groupRes.groupDesc
          }
        }
      })
      const inheritPolicies = inheritedPoliciesRes.inheritedPolicies
      inheritPolicies.forEach(inherit => {
        if (!policyIds.includes(inherit.policyId)) {
          tempPolicies.push(inherit)
        }
      })
      this.inheritedPolicies = tempPolicies
      this.iamPolicies = iamPolicies.map(policy => ({
        ...policy,
        'inherited': this.inheritedPolicies.find(item => item.policyId === policy.policyId)
      }))
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.loading.form = false
    }
  }

  private async initModifyGroup(groupId: string) {
    try {
      this.loading.form = true
      let params = {
        groupId
      }
      const [iamPoliciesRes, inheritedPoliciesRes, groupRes] =
        await Promise.all([this.getPolicyList(), getGroupInheritedPolicies(params), getGroup(params)])

      const iamPolicies = iamPoliciesRes.iamPolicies
      this.inheritedPolicies = inheritedPoliciesRes.inheritedPolicies
      this.form.groupId = groupRes.groupId
      this.form.groupName = groupRes.groupName
      this.form.groupDesc = groupRes.groupDesc

      this.iamPolicies = iamPolicies.map(policy => ({
        ...policy,
        'inherited': this.inheritedPolicies.find(item => item.policyId === policy.policyId)
      }))
      const selectedPolicies = groupRes.policyIds.map(id => this.iamPolicies.find(row => row.policyId === id))
      this.$nextTick(() => {
        const policyTable: any = this.$refs['policyTable']
        if (policyTable) {
          selectedPolicies.forEach(row => policyTable.toggleRowSelection(row))
        }
      })
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.loading.form = false
    }
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
            params.groupName = this.form.groupName
            params.groupDesc = this.form.groupDesc
            params.policyIds = this.selectedPolicies.map(policy => policy.policyId)
            await createGroup(params)
            this.$message.success('创建部门成功')
            this.$emit('on-close', { type: 'add' })
          } else if (type === 'edit') {
            params.groupId = this.form.groupId
            params.groupName = this.form.groupName
            params.groupDesc = this.form.groupDesc
            params.policyIds = this.selectedPolicies.map(policy => policy.policyId)
            await modifyGroup(params)
            this.$message.success('修改部门成功')
            this.$emit('on-close', { type: 'edit', nodeKey: params.groupId })
          } else if (type === 'merge') {
            params = {
              sourceGroupId: this.dialogData.data.groupId,
              destGroupId: this.form.aimGroupId
            }
            await combineGroup(params)
            this.$message.success('合并部门成功')
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
    transition: padding-left 0.2s;
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

  .group-dialog {
    &__inherited {
      margin-bottom: 17px;

      &_title {
        font-size: 16px;
        display: inline-block;
        margin-bottom: 10px;
      }

      &_tag {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
      }
    }

    &__policy {
      margin-bottom: 20px;

      &_title {
        font-size: 16px;
        display: inline-block;
        margin-bottom: 10px;
      }
    }
  }
</style>
