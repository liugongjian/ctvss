<template>
  <div>
    <el-button type="primary" class="add-group" @click="showAddGroupDialog = true">添加群组</el-button>
    <el-table v-loading="loading" :data="dataList">
      <el-table-column prop="name" label="组名" align="center" />
      <el-table-column prop="desc" label="描述" align="center" />
      <el-table-column label="操作" align="center">
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
    const res = await getAIConfigGroupData({})
    this.dataList = [{
      groupId: 123,
      name: 'rzj-test',
      desc: '测试分组'
    }]
  }

  private closeAddDialog(refresh: boolean) {
    this.showAddGroupDialog = false
    refresh && this.getData()
  }

  private correlationWith(row: any) {
    this.groupId = row.groupId
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
