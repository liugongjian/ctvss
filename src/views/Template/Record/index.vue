<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">新建录制模板</el-button>
        <div class="filter-container__right">
          <el-input v-model="recordTemplateName" class="filter-container__search-group" placeholder="请输入录制模板名称" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table ref="table" v-loading="loading" :data="dataList" fit class="template__table" @row-click="rowClick">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-table :data="scope.row.formatList" border size="mini" :header-cell-style="setHeaderClass">
              <el-table-column prop="formatType" label="存储格式" align="center" />
              <el-table-column prop="interval" label="周期时长" align="center">
                <template slot-scope="{row}">
                  <span>{{ row.interval + '分钟' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="storageTime" label="存储时长" align="center">
                <template slot-scope="{row}">
                  <span>{{ row.storageTime ? row.storageTime / 60 / 24 + '天' : '永久存储' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="path" label="存储路径" min-width="200" />
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="templateName" label="模板名称" min-width="240" />
        <el-table-column prop="storeType" label="录制类别" width="120">
          <template slot-scope="{row}">
            <span>{{ row.recordType === 1 ? '自动录制' : '手动录制' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="模板备注" min-width="260" />
        <el-table-column prop="createdTime" label="创建时间" width="200" />
        <el-table-column prop="action" class-name="col-action" label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="update(scope.row)">编辑</el-button>
            <el-button type="text" @click="deleteTemplate(scope.row)">删除</el-button>
            <el-button type="text" @click="viewBind(scope.row)">查看绑定关系</el-button>
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
    </el-card>
    <view-bind v-if="showViewBindDialog" :template-id="currentTemplateId" @on-close="closeViewBind" />
  </div>
</template>

<script lang='ts'>
import { deleteRecordTemplate, getRecordTemplates } from '@/api/template'
import { RecordTemplate } from '@/type/Template'
import { dateFormatInTable } from '@/utils/date'
import { Component, Vue, Watch } from 'vue-property-decorator'
import ViewBind from './Dialogs/ViewBind.vue'

@Component({
  name: 'record-template',
  components: {
    ViewBind
  }
})
export default class extends Vue {
  private loading = false
  private recordTemplateName = ''
  private dataList: Array<RecordTemplate> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private dateFormatInTable = dateFormatInTable
  private showViewBindDialog = false
  private currentTemplateId: any

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
  private async viewBind(row: RecordTemplate) {
    this.currentTemplateId = row.templateId
    this.showViewBindDialog = true
  }
  private async closeViewBind() {
    this.currentTemplateId = ''
    this.showViewBindDialog = false
  }
  private setHeaderClass() {
    return 'background: white'
  }
  private async getList() {
    try {
      this.loading = true
      let params = {
        templateName: this.recordTemplateName || undefined,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      const res = await getRecordTemplates(params)
      this.loading = false
      this.dataList = res.templates.map((template: any) => {
        const rowData: RecordTemplate = {
          templateId: template.templateId,
          templateName: template.templateName,
          recordType: template.recordType,
          createdTime: template.createdTime,
          description: template.description,
          formatList: [],
          storageTime: template.storageTime,
          interval: template.interval
        }
        if (template.hlsParam && template.hlsParam.enable) {
          rowData.formatList.push({
            formatType: 'hls',
            interval: template.hlsParam.interval / 60,
            path: template.hlsParam.path,
            storageTime: template.hlsParam.storageTime / 60
          })
        }
        if (template.flvParam && template.flvParam.enable) {
          rowData.formatList.push({
            formatType: 'flv',
            interval: template.flvParam.interval / 60,
            path: template.flvParam.path,
            storageTime: template.flvParam.storageTime / 60
          })
        }
        if (template.mpParam && template.mpParam.enable) {
          rowData.formatList.push({
            formatType: 'mp4',
            interval: template.mpParam.interval / 60,
            path: template.mpParam.path,
            storageTime: template.mpParam.storageTime / 60
          })
        }
        return rowData
      })
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(`获取录制模板失败，原因：${e && e.message}`)
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
    this.$router.push('/template/record/create')
  }

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList()
  }

  private async deleteTemplate(row: RecordTemplate) {
    this.$alertDelete({
      type: '录制模板',
      msg: `确定删除录制模板"${row.templateName}"`,
      method: deleteRecordTemplate,
      payload: { templateId: row.templateId },
      onSuccess: this.getList
    })
  }

  private update(row: RecordTemplate) {
    this.$router.push({
      path: '/template/record/update',
      query: {
        templateId: row.templateId!.toString()
      }
    })
  }

  /**
   * 单击行
   */
  private rowClick(row: any, column: any) {
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
