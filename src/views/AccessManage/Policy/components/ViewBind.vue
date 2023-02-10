<template>
  <el-dialog
    :visible="true"
    title="查看绑定关系"
    width="650px"
    center
    @close="closeDialog"
  >
    <el-table
      v-loading="loading"
      :data="bindData"
      class="bind-table"
    >
      <el-table-column
        prop="name"
        label="用户名/部门名"
      >
        <template slot-scope="{row}">
          {{ row.name || row.id }}
        </template>
      </el-table-column>
      <el-table-column
        :filters="filtersArray"
        :filter-method="filterHandler"
        prop="type"
        label="类别"
      >
        <template slot="header">
          <span>类别</span>
          <svg-icon name="filter" width="15" height="15" />
        </template>
        <template slot-scope="{row}">
          {{ row.type === 'iam_group' ? "部门" : "用户" }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{row}">
          <el-button type="text" @click="detachUserPolicy(row)">解绑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="pager.pageNum"
      :page-size="pager.pageSize"
      :total="pager.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getPolicyPrincipals, detachUserPolicy } from '@/api/accessManage'

@Component({
  name: 'ViewBind'
})
export default class extends Vue {
  @Prop({ default: '' })
  private policyId!: string
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private loading = false
  private bindData = []
  private filtersArray = [{ text: '部门', value: 'iam_group' }, { text: '用户', value: 'iam_user' }]
  private async mounted() {
    this.getPolicyPrincipals()
  }
  private filterHandler(value: string, row: any, column: any) {
    const prop = column['property']
    return row[prop] === value
  }
  private async getPolicyPrincipals() {
    try {
      this.loading = true
      let params = {
        policyId: this.policyId,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      const res = await getPolicyPrincipals(params)
      this.loading = false
      this.bindData = res.principalInfos
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(`获取绑定关系失败，原因：${e && e.message}`)
      this.loading = false
    }
  }

  public async detachUserPolicy(row: any) {
    try {
      this.loading = true
      await detachUserPolicy({
        policyIds: [this.policyId],
        iamUserId: row.id,
        principalType: row.type
      })
      this.$message.success(`解除用户 ${row.name} 绑定的策略成功！`)
      this.getPolicyPrincipals()
    } catch (e) {
      this.$message.error(`解除用户 ${row.name} 绑定的策略失败，原因：${e && e.message}`)
    } finally {
      this.loading = false
    }
  }
  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getPolicyPrincipals()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getPolicyPrincipals()
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
