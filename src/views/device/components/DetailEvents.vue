<template>
  <div class="app-container">
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
    <div v-if="isLiuzhou" class="filter-container">
      <el-button type="primary" @click="ignoreEvents()">全部忽略</el-button>
      <el-button :disabled="!selectedDeviceIdList.length" @click="ignoreEvents(selectedDeviceIdList)">批量忽略</el-button>
    </div>
    <el-table ref="table" v-loading="loading" :data="dataList" class="template__table" fit @selection-change="handleSelectionChange">
      <el-table-column v-if="isLiuzhou" type="selection" :selectable="checkSelectable" prop="selection" class-name="col-selection" width="55" />
      <el-table-column prop="createdTime" label="时间" min-width="200" />
      <el-table-column prop="errorLevel" label="事件级别" min-width="100" />
      <el-table-column prop="eventType" label="事件类型" min-width="100" />
      <el-table-column prop="errorMessage" label="异常提示" min-width="300" />
      <el-table-column v-if="isLiuzhou" label="操作" prop="action" class-name="col-action" width="100" fixed="right">
        <template slot-scope="{row}">
          <el-button type="text" :disabled="row.deleted !== '0'" @click="ignoreEvents(row.id)">{{ row.deleted === '0' ? '忽略' : '已忽略' }}</el-button>
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
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getDeviceEvents, ignoreEvents } from '@/api/device'
import { errorLevel, eventsType } from '@/dics/index'
import { Device } from '@/type/Device'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'DeviceEvents'
})
export default class extends Vue {
  @Prop() private deviceId?: String
  @Prop() private inProtocol?: String
  private loading = false
  public selectedDeviceIdList: Array<string> = []
  private search = {
    timeRange: [],
    errorLevel: '1',
    eventType: 'all'
  }

  private errorLevelList: Array<any> = Object.keys(errorLevel).map(error => {
    return {
      label: errorLevel[error],
      value: error
    }
  })

  private eventsTypeList: Array<any> = Object.keys(eventsType).map(event => {
    return {
      label: eventsType[event],
      value: event
    }
  })

  private dataList = []
  private pager: any = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  public get isLiuzhou() {
    return UserModule.tags && UserModule.tags.privateUser && UserModule.tags.privateUser === 'liuzhou'
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
      this.dataList = res.desDeviceEvent?.map(event => {
        return {
          id: event.id,
          createdTime: event.createdTime,
          errorLevel: this.errorLevelList.find(error => error.value === event.errorLevel)?.label,
          eventType: this.eventsTypeList.find(error => error.value === event.eventType)?.label,
          errorMessage: event.errorMessage || '-',
          deleted: event.deleted
        }
      })
    } catch (e) {
      this.$message.error(`获取事件列表失败，原因：${e && e.message}`)
    } finally {
      this.loading = false
    }
  }

  /**
   * 表格多选框变化
   */
  private handleSelectionChange(devices: Array<Device>) {
    this.selectedDeviceIdList = []
    devices.forEach(device => {
      if ((device as any).deleted === '0') {
        this.selectedDeviceIdList.push((device as any).id.toString())
      }
    })
  }

  /**
   * 检测是否可选
   */
  private checkSelectable(row: any) {
    return row.deleted === '0'
  }

  /**
   * 忽略事件
   */
  private async ignoreEvents(paload) {
    const params: any = { deviceId: this.deviceId }
    if (Array.isArray(paload)) {
      params.ids = paload
    } else if (paload) {
      params.ids = [paload]
    }
    try {
      await ignoreEvents(params)
      this.$message.success('忽略成功')
    } catch (e) {
      console.log(e)
    } finally {
      this.getList()
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
