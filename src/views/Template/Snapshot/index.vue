<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">新建截图模板</el-button>
        <div class="filter-container__right">
          <el-input v-model="snapshotTemplateName" class="filter-container__search-group" placeholder="请输入截图模板名称" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table ref="table" v-loading="loading" :data="dataList" fit class="template__table" @row-click="rowClick">
        <el-table-column prop="templateName" label="模板名称" min-width="200" />
        <el-table-column prop="region" label="服务区域" min-width="100" />
        <el-table-column prop="rate" label="频率" min-width="100" />
        <el-table-column prop="storeType" label="存储格式" min-width="100">
          <template slot-scope="{row}">
            <span v-html="row.storeType.map(item => snapshotStorageType[item]).join('<br />')" />
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" min-width="160" />
        <el-table-column prop="action" class-name="col-action" label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="update(scope.row)">编辑</el-button>
            <el-button type="text" @click="deleteTemplate(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="pager.pageIndex"
        :page-size="pager.pageSize"
        :total="pager.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Watch } from 'vue-property-decorator'
import { SnapshotTemplate } from '@/type/Template'
import { dateFormatInTable } from '@/utils/date'
import { SnapshotStorageType } from '@/dics'
import { getSnapshotTemplates, deleteSnapshotTemplate } from '@/api/template'

@Component({
  name: 'snapshot-template'
})
export default class extends Vue {
  private loading = false
  private snapshotTemplateName = ''
  private dataList: Array<SnapshotTemplate> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 20
  }
  private snapshotStorageType = SnapshotStorageType
  private dateFormatInTable = dateFormatInTable

  @Watch('dataList.length')
  private onDataListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private async mounted() {
    await this.getList()
  }

  private async refresh() {
    await this.getList()
  }

  private async getList() {
    try {
      this.loading = true
      let params = {
        keyWord: this.snapshotTemplateName,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      const res = await getSnapshotTemplates(params)
      this.loading = false
      this.dataList = res.templates
      this.pager.total = res.total
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.loading = false
    }
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getList()
  }

  private handleCreate() {
    this.$router.push('/template/snapshot/create')
  }

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList()
  }

  private async deleteTemplate(row: SnapshotTemplate) {
    this.$alertDelete({
      type: '截图模板',
      msg: `确定删除截图模板"${row.templateName}"`,
      method: deleteSnapshotTemplate,
      payload: { templateId: row.templateId },
      onSuccess: this.getList
    })
  }

  private update(row: SnapshotTemplate) {
    this.$router.push({
      path: '/template/snapshot/update',
      query: {
        templateId: row.templateId!.toString()
      }
    })
  }

  /**
   * 单击行
   */
  private rowClick(row: any, column: any, event: any) {
    if (column.property !== 'action') {
      const $table: any = this.$refs.table
      $table.toggleRowExpansion(row)
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container__search-group {
  margin-right: 10px;
}

.template__table {
  ::v-deep .el-table__body {
    td {
      cursor: pointer;
    }

    .col-action {
      cursor: default;
    }
  }
}
</style>
