<template>
  <div ref="listWrap" class="device-list__container min-contaniner">
    <div class="filter-container clearfix">
      <!-- <div class="filter-container__left">
        <el-button type="primary" @click="1">一键删除</el-button>
        <el-dropdown key="dropdown" placement="bottom" @command="handleBatch">
          <el-button>批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="delete">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div> -->
      <div ref="filterWrap" class="filter-container__right">
        <el-date-picker
          v-model="searchFrom.timeRange"
          class="data-picker"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
        <el-input v-model="searchFrom.deviceName" class="filter-container__search-group" placeholder="请输入设备名称">
          <el-button slot="append" class="el-button-rect" @click="search"><svg-icon name="search" /></el-button>
        </el-input>
        <el-button class="el-button-rect" @click="getList"><svg-icon name="refresh" /></el-button>
      </div>
    </div>
    <el-table
      ref="table"
      v-loading="loading"
      :height="maxHeight - 200"
      :data="alarmList"
      fit
      class="template__table"
      empty-text="暂无告警信息"
      @row-click="1"
      @filter-change="filterChange"
      @sort-change="sortChange"
    >
      <!-- <el-table-column type="selection" prop="selection" class-name="col-selection" width="55" /> -->
      <el-table-column label="设备ID/名称" min-width="240">
        <template slot-scope="{ row }">
          <div class="device-list__device-name">
            <div class="device-list__device-id">{{ row.deviceId }}</div>
            <div>{{ row.deviceName }}</div>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column
        key="AlarmPriority"
        column-key="AlarmPriority"
        prop="alarmPriority"
        min-width="150"
        :filters="filtersArray.alarmPriority"
      > -->
      <el-table-column
        key="AlarmPriority"
        column-key="AlarmPriority"
        prop="alarmPriority"
        min-width="150"
      >
        <template slot="header">
          <span class="filter">报警级别</span>
          <!-- <svg-icon class="filter" name="filter" width="15" height="15" /> -->
        </template>
        <template slot-scope="{ row }">
          {{ getLabel('alarmPriority', row.alarmPriority) }}
        </template>
      </el-table-column>
      <!-- <el-table-column
        key="AlarmMethod"
        column-key="AlarmMethod"
        prop="alarmMethod"
        min-width="240"
        :filters="filtersArray.alarmMethod"
      > -->
      <el-table-column
        key="AlarmMethod"
        column-key="AlarmMethod"
        prop="alarmMethod"
        min-width="240"
      >
        <template slot="header">
          <span class="filter">报警方式</span>
          <!-- <svg-icon class="filter" name="filter" width="15" height="15" /> -->
        </template>
        <template slot-scope="{ row }">
          {{ getLabel('alarmMethod', row.alarmMethod) || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        key="AlarmType"
        column-key="AlarmType"
        prop="alarmType"
        min-width="240"
      >
        <template slot="header">
          <span class="filter">报警类型</span>
          <!-- <svg-icon class="filter" name="filter" width="15" height="15" /> -->
        </template>
        <template slot-scope="{ row }">
          {{ getLabel('alarmType', row.alarmMethod + '-' + row.alarmType) || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        key="AlarmTime"
        column-key="AlarmTime"
        prop="alarmTime"
        sortable="custom"
        label="报警时间"
        min-width="240"
      >
        <template slot-scope="{ row }">
          {{ row.alarmTime }}
        </template>
      </el-table-column>
      <el-table-column prop="alarmDescription" label="报警内容" min-width="240" />
      <el-table-column prop="action" class-name="col-action" label="操作" width="250" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" @click.stop="deleteAlarm(row)">删除</el-button>
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
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { deleteAlarmInfo, getAlarmRules } from '@/api/alarm'

@Component({
  name: 'alarm-list'
})
export default class extends Vue {
  @Prop() private maxHeight
  @Prop({ default: '' }) private groupId!: string
  private loading = false
  private showViewBindDialog = false
  private currentTemplateId: any = ''
  private selectedDeviceList: any = []
  private observer: any = null
  private searchFrom: any = {
    deviceName: '',
    timeRange: null,
    alarmPriority: [],
    alarmMethod: [],
    sortBy: '',
    sortDirection: ''
  }
  private filtersArray: any = {
    alarmPriority: [
      { text: '一级警情', value: '1' },
      { text: '二级警情', value: '2' },
      { text: '三级警情', value: '3' },
      { text: '四级警情', value: '4' }
    ],
    alarmMethod: [
      { text: '电话报警', value: '1' },
      { text: '设备报警', value: '2' },
      { text: '短信报警', value: '3' },
      { text: 'GPS报警', value: '4' },
      { text: '视频报警', value: '5' },
      { text: '设备故障报警', value: '6' },
      { text: '其他报警', value: '7' }
    ]
  }
  private alarmPriorityOptions: any = [
    { label: '一级警情', value: '1' },
    { label: '二级警情', value: '2' },
    { label: '三级警情', value: '3' },
    { label: '四级警情', value: '4' }
  ]
  private alarmMethodOptions: any = [
    {
      value: '1',
      label: '电话报警'
    },
    {
      value: '2',
      label: '设备报警',
      children: [
        { value: '1', label: '视频丢失报警' },
        { value: '2', label: '设备防拆报警' },
        { value: '3', label: '存储设备磁盘满报警' },
        { value: '4', label: '设备高温报警' },
        { value: '5', label: '设备低温报警' }
      ]
    },
    {
      value: '3',
      label: '短信报警'
    },
    {
      value: '4',
      label: 'GPS报警'
    },
    {
      value: '5',
      label: '视频报警',
      children: [
        { value: '1', label: '人工视频报警' },
        { value: '2', label: '运动目标检测报警' },
        { value: '3', label: '遗留物检测报警' },
        { value: '4', label: '物体移除检测报警' },
        { value: '5', label: '绊线检测报警' },
        { value: '6', label: '入侵检测报警' },
        { value: '7', label: '逆行检测报警' },
        { value: '8', label: '徘徊检测报警' },
        { value: '9', label: '流量统计报警' },
        { value: '10', label: '密度检测报警' },
        { value: '11', label: '视频异常检测报警' },
        { value: '12', label: '快速移动报警' }
      ]
    },
    {
      value: '6',
      label: '设备故障报警',
      children: [
        { value: '1', label: '存储设备磁盘故障报警' },
        { value: '2', label: '存储设备风扇故障报警' }
      ]
    },
    {
      value: '7',
      label: '其他报警'
    }
  ]
  private alarmList: any = []
  private timer: any = null
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  @Watch('$route.query', { deep: true })
  public onRouterChange() {
    this.searchFrom = {
      deviceName: '',
      timeRange: null,
      alarmPriority: [],
      alarmMethod: [],
      sortBy: '',
      sortDirection: ''
    }
    this.pager = {
      pageNum: 1,
      pageSize: 10,
      total: 0
    }
    const tableDom: any = this.$refs.table
    tableDom.clearSort()
    tableDom.clearFilter()
    // this.$route.query.inProtocol && this.getList()
    this.getList()
  }

  private mounted() {
    // this.$route.query.inProtocol && this.getList()
    this.getList()
    this.setTimer()
  }

  private destroyed() {
    this.timer && clearInterval(this.timer)
  }

  private search() {
    this.pager.pageNum = 1
    this.getList()
    this.setTimer()
  }

  /**
   * 定时刷新
   */
  private setTimer() {
    this.timer && clearInterval(this.timer)
    this.timer = setInterval(() => {
      this.getList(true)
    }, 5000)
  }

  private async getList(forbitLoading?: boolean) {
    const params: any = {
      // inProtocol: this.$route.query.inProtocol,
      deviceName: this.searchFrom.deviceName,
      startTime: this.searchFrom.timeRange !== null ? this.searchFrom.timeRange[0].getTime() : '',
      endTime: this.searchFrom.timeRange !== null ? this.searchFrom.timeRange[1].getTime() : '',
      sortBy: this.searchFrom.sortBy,
      sortDirection: this.searchFrom.sortDirection,
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    if (this.$route.query.type !== 'ipc') {
      // 目录级别
      params.dirId = this.$route.query.dirId
      if (typeof(this.$route.query.type) === 'undefined') {
        // 根目录
        params.dirId = 'root'
      }
    } else {
      // 设备级别
        params.deviceId = this.$route.query.deviceId
    }
    try {
      !forbitLoading && (this.loading = true) && (this.alarmList = [])
      const res: any = await getAlarmRules(params)
      this.alarmList = res.alarms
      this.pager.total = res.totalNum
    } catch (e) {
      this.$message.error(`获取模板列表失败，原因：${e && e.message}`)
    } finally {
      this.loading = false
    }
  }
  private getLabel(type: string, value: any) {
    let arr: any = []
    switch (type) {
      case 'alarmPriority':
        arr.push(value)
        break
      case 'alarmMethod':
        arr.push(value)
        break
      case 'alarmType':
        arr = (() => {
          const key = value.split('-')[0]
          const obj = this['alarmMethodOptions'].find((item: any) => item.value === key)
          if (obj) {
            return obj.children
          } else {
            return undefined
          }
        })()
        break
    }
    if (!arr) return undefined
    if (type === 'alarmType') {
      const obj = arr.find((item: any) => item.value === value.split('-')[1])
      if (obj) {
        return obj.label
      } else {
        return undefined
      }
    } else {
      let res: any = arr.map((str: any) => {
        const obj = this[`${type}Options`].find((item: any) => item.value === str)
        if (obj) {
          return obj.label
        } else {
          return undefined
        }
      })
      res = [...new Set(res)].join('，')
      return res
    }
  }
  private async deleteAlarm(row: any) {
    this.$alertDelete({
      type: '告警信息',
      msg: '确定删除该告警信息',
      method: deleteAlarmInfo,
      payload: { alarmId: row.alarmId },
      onSuccess: this.getList
    })
  }
  private filterChange(filters: any) {
    for (const key in filters) {
      const values = filters[key]
      if (values.length) {
        this.searchFrom[key] = values
      } else {
        this.searchFrom[key] = []
      }
    }
  }
  private sortChange(sort: any) {
    if (sort.order) {
      this.searchFrom.sortBy = sort.column.columnKey
      this.searchFrom.sortDirection = sort.order === 'ascending' ? 'asc' : 'desc'
      this.search()
    }
  }
  /**
   * 表格多选框变化
   */
  private handleSelectionChange(alarms: any) {
    this.selectedDeviceList = alarms
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getList()
  }

  /**
   * 批量操作菜单
   */
  public handleBatch(command: any) {
    if (!this.selectedDeviceList.length) {
      this.$alertError('请先选择告警信息')
      return
    }
    switch (command) {
      case 'delete':
        break
    }
  }
}
</script>
<style lang="scss" scoped>
  .min-contaniner {
    min-width: 800px;
  }

  .data-picker {
    margin-right: 10px;
  }
</style>
