<template>
  <el-dialog
    :visible="true"
    title="查看用户绑定策略"
    width="750px"
    center
    @close="closeDialog"
  >
    <el-table
      v-loading="loading"
      :data="bindData"
      class="bind-table"
    >
      <el-table-column
        prop="policyName"
        label="策略名"
      >
        <template slot-scope="{row}">
          {{ row.policyName || row.policyId }}
        </template>
      </el-table-column>
      <el-table-column
        prop="policyDesc"
        label="策略描述"
      >
        <template slot-scope="{row}">
          {{ row.policyDesc || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        :filters="filtersArray"
        :filter-method="filterHandler"
        prop="inherit"
        label="是否继承"
        width="120"
      >
        <template slot="header">
          <span>是否继承</span>
          <svg-icon name="filter" width="15" height="15" />
        </template>
        <template slot-scope="{row}">
          <el-tag v-if="row.inherit" type="success">是</el-tag>
          <el-tag v-else type="primary">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="policyDesc"
        label="继承自"
      >
        <template slot-scope="{row}">
          {{ row.groupDetails && row.groupDetails.groupName || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="{row}">
          <el-button type="text" :disabled="row.inherit" @click="detachUserPolicy(row)">解绑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import {
  getPolicyList, getUser, detachUserPolicy, getGroup, getGroupInheritedPolicies
} from '@/api/accessManage'

@Component({
  name: 'UserViewBind'
})
export default class extends Vue {
  @Prop() private dialogData: any

  private loading = false
  private policyList = []
  private policies = []
  private inheritedPolicies = []
  private bindData = []
  private filtersArray = [{ text: '是', value: true }, { text: '否', value: false }]

  private filterHandler(value: string, row: any, column: any) {
    console.log('value: ', value)
    console.log('row: ', row)
    console.log('column: ', column)
    const prop = column['property']
    return row[prop] === value
  }

  private async mounted() {
    try {
      this.loading = true
      await this.getPolicyList()
      await this.initParentGroupInfo(this.dialogData.parentGroupId)
      await this.getUser()
      this.bindData = this.inheritedPolicies.concat(this.policies)
      console.log('this.bindData: ', this.bindData)
    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  private async getPolicyList() {
    let params: any = {
      pageSize: 1000,
      policyType: 'subUser'
    }
    try {
      let res: any = await getPolicyList(params)
      this.policyList = res.iamPolicies
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  private async getUser() {
    try {
      let res = await getUser({
        iamUserId: this.dialogData.iamUserId
      })
      this.policies = res.policies.map((policy: any) => ({
        ...policy,
        inherit: false
      }))
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  public async initParentGroupInfo(parentGroupId: string) {
    try {
      let params = {
        groupId: parentGroupId
      }
      const [inheritedPoliciesRes, groupRes] =
        await Promise.all([getGroupInheritedPolicies(params), getGroup(params)])

      const iamPolicies: any = this.policyList
      const policyIds = groupRes.policyIds
      const tempPolicies = policyIds.map(id => {
        const policy = iamPolicies.find(iamPolicy => iamPolicy.policyId === id)
        return {
          policyId: policy.policyId,
          policyName: policy.policyName,
          policyDesc: policy.policyDesc,
          policyScope: policy.policyScope,
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
      this.inheritedPolicies = tempPolicies.map(item => ({
        ...item,
        inherit: true
      }))
    } catch (e) {
      this.$message.error(e)
    }
  }

  public async detachUserPolicy(row: any) {
    try {
      this.loading = true
      await detachUserPolicy({
        policyIds: [row.policyId],
        iamUserId: this.dialogData.iamUserId,
        principalType: 'iam_user'
      })
      this.$message.success(`成功解除与 ${row.policyName} 的绑定！`)
      await this.getUser()
      this.bindData = this.inheritedPolicies.concat(this.policies)
    } catch (e) {
      this.$message.error(`解除 ${row.policyName} 的绑定失败，原因：${e && e.message}`)
    } finally {
      this.loading = false
    }
  }

  private closeDialog() {
    this.$emit('on-close')
  }
}
</script>
<style lang="scss" scoped>
.bind-table {
  position: relative;

  ::v-deep {
    span.el-table__column-filter-trigger {
      visibility: hidden;
    }
  }
}
</style>
