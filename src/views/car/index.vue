<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <div class="filter-container__right">
          <el-input v-model="recordTemplateName" class="filter-container__search-group" placeholder="请输入车牌号" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table ref="table" v-loading="loading" :data="dataList" fit class="template__table" @row-click="rowClick">
        <el-table-column label="设备ID/设备名" min-width="200">
          <template slot-scope="{row}">
            <div class="device-list__device-name">
              <div class="device-list__device-id">{{ row.templateName }}</div>
              <div>{{ row.templateName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="PlateNumber" label="车牌号" width="120">
          <template slot-scope="{row}">
            <span>{{ row.PlateNumber }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="Driver" label="司机" min-width="260" />
        <el-table-column prop="TransCompany" label="运输公司" width="200" />
        <el-table-column prop="Factory" label="工厂" width="200" />
        <el-table-column
          prop="createdTime"
          label="任务状态"
          min-width="110"
        >
          <template slot-scope="{row}">
            <status-badge :status="row.Status" />
            {{ row.Status }}
          </template>
        </el-table-column>
        <el-table-column prop="StartTime" label="开始时间" width="200" />
        <el-table-column prop="EndTime" label="结束时间" width="200" />
        <el-table-column prop="action" class-name="col-action" label="视频查看" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click.stop.native="preview(scope.row)">实时预览</el-button>
            <el-button type="text" @click="deleteTemplate(scope.row)">录像回放</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="action" class-name="col-action" label="任务操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="update(scope.row)">暂停</el-button>
            <el-button type="text" @click="deleteTemplate(scope.row)">结束</el-button>
            <el-button type="text" @click="detail(scope.row)">查看详情</el-button>
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
    <detail-dialog v-if="showDetailDialog" :record="currentRecord" @on-close="closeDetail" />
    <video-dialog v-if="showVideoDialog" :record="currentRecord" @on-close="closeVideo" />
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Watch } from 'vue-property-decorator'
import { RecordTemplate } from '@/type/template'
import { dateFormatInTable } from '@/utils/date'
import { getRecordTemplates, deleteRecordTemplate } from '@/api/template'
import StatusBadge from '@/components/StatusBadge/index.vue'
import DetailDialog from './component/DetailDialog.vue'
import VideoDialog from './component/VideoDialog.vue'

@Component({
  name: 'Car',
  components: {
    StatusBadge,
    DetailDialog,
    VideoDialog
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
  private showDetailDialog = false
  private showVideoDialog = false
  private currentRecord: any = {}

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
  private detail(row: any) {
    this.currentRecord = row
    this.showDetailDialog = true
  }
  private preview(row: any) {
    this.currentRecord = row
    this.showVideoDialog = true
  }
  private closeDetail() {
    this.currentRecord = {}
    this.showDetailDialog = false
  }
  private closeVideo() {
    this.currentRecord = {}
    this.showVideoDialog = false
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
          formatList: []
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

  /**
   * 单击行
   */
  private rowClick(row: any) {
    this.detail(row)
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
