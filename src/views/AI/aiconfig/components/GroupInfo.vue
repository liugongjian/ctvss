<template>
  <div>
    <el-button type="primary" class="add-group" @click="showAddGroupDialog = true">添加群组</el-button>
    <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
    <el-table v-loading="loading" :data="dataList">
      <el-table-column prop="name" label="组名" />
      <el-table-column prop="num" label="人数" width="140" />
      <el-table-column prop="createdTime" label="创建时间" />
      <el-table-column prop="updatedTime" label="更新时间" />
      <el-table-column label="操作" width="140">
        <template slot-scope="scope">
          <el-button type="text" @click="correlationWith(scope.row)">关联</el-button>
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
    <add-group-dialog v-if="showAddGroupDialog" @on-close="closeAddDialog" />
    <correlation-with v-if="showCorrelationWithDialog" :group-id="groupId" @on-close="closeCorrelationWithDialog" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AddGroupDialog from './dialogs/AddGroup.vue'
import CorrelationWith from './dialogs/CorrelationWith.vue'
import { getAIConfigGroupData } from '@/api/aiConfig'

@Component({
  name: 'GroupInfo',
  components: { AddGroupDialog, CorrelationWith }
})
export default class extends Vue {
  private showAddGroupDialog = false
  private showCorrelationWithDialog = false
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private loading = false
  private groupId = ''
  private dataList: any = []

  private async getData() {
    try {
      this.loading = true
      const res = await getAIConfigGroupData({
        pageSize: this.pager.pageSize,
        pageNum: this.pager.pageNum
      })
      this.loading = false
      this.dataList = res.groups
      this.pager.total = res.totalNum
    } catch (e) {
      this.loading = false
    }
  }

  private closeAddDialog(refresh: boolean) {
    this.showAddGroupDialog = false
    refresh && this.getData()
  }

  private correlationWith(row: any) {
    this.groupId = row.id
    this.showCorrelationWithDialog = true
  }

  private closeCorrelationWithDialog(refresh: boolean) {
    this.showCorrelationWithDialog = false
    refresh && this.getData()
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getData()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getData()
  }

  private refresh() {
    this.getData()
  }
  mounted() {
    this.getData()
  }
}
</script>

<style lang="scss" scoped>
.add-group {
  margin-bottom: 10px;
}
</style>
