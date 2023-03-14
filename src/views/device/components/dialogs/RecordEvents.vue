<template>
  <el-dialog
    title="故障告警"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="900px"
    center
    @close="closeDialog"
  >
    <div class="filter-container">
      <span>时间区间:</span>
      <el-date-picker
        v-model="search.timeRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />
      <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
      <div class="filter-container__right">
        <el-button type="primary" @click="searchEvents">搜索</el-button>
      </div>
    </div>
    <div class="filter-container">
      <el-button type="primary" @click="1">全部忽略</el-button>
    </div>
    <el-table ref="table" v-loading="loading" :data="dataList" fit class="template__table">
      <el-table-column prop="createdTime" label="时间" min-width="200" />
      <el-table-column prop="errorMessage" label="异常提示" min-width="300" />
      <el-table-column label="操作" prop="action" class-name="col-action" width="100" fixed="right">
        <template slot-scope="{data}">
          <el-button type="text" @click="1">忽略</el-button>
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
import { getDeviceEvents } from '@/api/device'
@Component({
  name: 'RecordEvents'
})
export default class extends Vue {
  @Prop() private deviceId?: String
  @Prop() private inProtocol?: String
  private dialogVisible = true
  private loading = false
  private search = {
    timeRange: [],
    errorLevel: '1',
    eventType: 'all'
  }

  private dataList = [{}, {}, {}]
  private pager: any = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private async mounted() {
    // await this.getList()
  }

  private async refresh() {
    await this.getList()
  }

  private searchEvents() {
    this.pager = {
      pageNum: 1,
      pageSize: 10,
      total: 0
    }
    this.getList()
  }

  private async getList() {
    try {
      this.loading = true
      const params = {
        deviceId: this.deviceId,
        inProtocal: this.inProtocol,
        startTime: this.search.timeRange[0]?.getTime(),
        endTime: this.search.timeRange[1]?.getTime(),
        errorLevel: this.search.errorLevel,
        eventType: this.search.eventType,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      const res = await getDeviceEvents(params)
      this.pager.total = res.totalNum
      this.dataList = res.desDeviceEvent?.map(event => {
        return {
          createdTime: event.createdTime,
          errorLevel: this.errorLevelList.find(error => error.value === event.errorLevel)?.label,
          eventType: this.eventsTypeList.find(error => error.value === event.eventType)?.label,
          errorMessage: event.errorMessage || '-'
        }
      })
    } catch (e) {
      this.$message.error(`获取录制告警列表失败，原因：${e && e.message}`)
    } finally {
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

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
.filter-container__right {
  > * {
    margin-left: 10px;
  }
}

.filter-container {
  > *:not(:last-child) {
    margin-right: 15px;
    margin-bottom: 10px;
  }

  .el-select {
    width: 150px;
  }
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
