<template>
  <div>
    <div class="filter-container">
      <span>时间区间:</span>
      <el-date-picker
        v-model="search.timeRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />
      <span>事件级别:</span>
      <el-select v-model="search.errorLevel">
        <el-option
          v-for="(item, index) in errorLevelList"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <span>事件类型:</span>
      <el-select v-model="search.eventType">
        <el-option
          v-for="(item, index) in eventsTypeList"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
      <div class="filter-container__right">
        <el-button type="primary" @click="searchEvents">搜索</el-button>
      </div>
    </div>
    <el-table ref="table" v-loading="loading" :data="dataList" fit>
      <el-table-column prop="createdTime" label="时间" min-width="200" />
      <el-table-column prop="errorLevel" label="事件级别" min-width="100" />
      <el-table-column prop="eventType" label="事件类型" min-width="100" />
      <el-table-column prop="errorMessage" label="异常提示" min-width="300" />
    </el-table>
    <el-pagination
      :current-page="pager.pageNum"
      :page-size="pager.pageSize"
      :total="pager.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script lang='ts'>
import { Component, Mixins } from 'vue-property-decorator'
import { getDeviceEvents } from '@vss/device/api/device'
import { ErrorLevel, EventsType } from '@vss/device/dicts/index'
import detailMixin from '@vss/device/mixin/deviceMixin'

@Component({
  name: 'DeviceEvents'
})
export default class extends Mixins(detailMixin) {
  private loading = false
  private search = {
    timeRange: [],
    errorLevel: '1',
    eventType: 'all'
  }
  private errorLevelList: Array<any> = Object.keys(ErrorLevel).map(error => {
    return {
      label: ErrorLevel[error],
      value: error
    }
  })
  private eventsTypeList: Array<any> = Object.keys(EventsType).map(event => {
    return {
      label: EventsType[event],
      value: event
    }
  })
  private dataList = []
  private pager: any = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private async mounted() {
    await this.getList()
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
        startTime: this.search.timeRange && this.search.timeRange[0]?.getTime(),
        endTime: this.search.timeRange && this.search.timeRange[1]?.getTime(),
        errorLevel: this.search.errorLevel,
        eventType: this.search.eventType,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      const res = await getDeviceEvents(params)
      this.pager.total = res.totalNum
      this.dataList = res.deviceEvents?.map(event => {
        return {
          createdTime: event.createdTime,
          errorLevel: this.errorLevelList.find(error => error.value === event.errorLevel)?.label,
          eventType: this.eventsTypeList.find(error => error.value === event.eventType)?.label,
          errorMessage: event.errorMessage || '-'
        }
      })
    } catch (e) {
      this.$message.error(`获取事件列表失败，原因：${e && e.message}`)
      this.dataList = []
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
}
</script>

<style lang="scss" scoped>
.filter-container__right {
  > * {
    margin-left: 10px;
  }
}

.filter-container {
  > * {
    margin-right: 15px;
    margin-bottom: 10px;
  }

  .el-select {
    width: 150px;
  }
}
</style>
