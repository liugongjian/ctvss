<template>
  <div
    ref="statisticWrap"
    class="statistic"
    :class="[{ statistic__statistic: activeName === 'statistic' }]"
  >
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane label="基本统计" name="statistic">
        <div class="statistic-box statistic-box__p15-no-t">
          <div class="statistic-box__title">
            <div class="access-restriction__title-text">设备统计概览</div>
          </div>
          <el-row>
            <el-col :span="5">
              <div class="statistic-box__content">
                <p class="statistic-box__content__title">
                  设备在线数<span>(在线/总数)</span>
                </p>
                <p class="statistic-box__content__number">
                  <span>{{ statisticsData.totalDeviceOnlineNum }}</span>/{{ statisticsData.totalDeviceNum }}
                </p>
              </div>
              <draw-chart :chart-info="deviceOnlineInfo" />
            </el-col>
            <el-col :span="5">
              <div class="statistic-box__content">
                <p class="statistic-box__content__title">
                  流在线数<span>(在线/总数)</span>
                </p>
                <p class="statistic-box__content__number">
                  <span>{{ statisticsData.totalStreamOnlineNum }}</span>/{{ statisticsData.totalDeviceNum }}
                </p>
              </div>
              <draw-chart :chart-info="streamOnlineInfo" />
            </el-col>
            <el-col :span="5">
              <div class="statistic-box__content">
                <p class="statistic-box__content__title">
                  录制数<span>(录制中/总数)</span>
                </p>
                <p class="statistic-box__content__number">
                  <span>{{ statisticsData.totalRecordNum }}</span>/{{ statisticsData.totalDeviceNum }}
                </p>
              </div>
              <draw-chart :chart-info="recordOnlineInfo" />
            </el-col>
            <el-col v-if="storageFlag" :span="5">
              <div class="statistic-box__content">
                <p class="statistic-box__content__title">
                  存储容量
                  <span>(已使用/总容量)</span>
                </p>
                <p
                  v-if="statisticsData.storage"
                  class="statistic-box__content__number"
                >
                  <span>{{ recordUsage }}TB</span>
                  /{{ recordTotal }}TB
                </p>
              </div>
              <draw-chart :chart-info="bytesInfo" />
            </el-col>
          </el-row>

          <div v-if="storageFlag">
            <div class="statistic-box__title">
              <div class="statistic-box__title-text">近7日存储用量趋势</div>
              <el-button
                type="primary"
                size="mini"
                @click="changeThresholdDialog"
              >
                配置
              </el-button>
            </div>
            <div
              v-if="recordLog.storageWarn && recordLog.storageWarn.show"
              class="statistic-box__warning"
            >
              预估录制剩余天数 <span>{{ recordLog.storageWarn.days }}天</span>
            </div>
            <div class="statistic-box__line-content">
              <draw-chart :chart-info="recordLogInfo" />
            </div>
          </div>

          <el-form ref="form" :model="listQueryForm" :inline="true">
            <!-- <el-form-item label="业务组" required>
              <el-select v-model="listQueryForm.groupInfo" placeholder="请选择业务组">
                <el-option v-for="item in groupList" :key="item.groupId" :label="item.groupName" :value="`${item.groupId}_${item.inProtocol}_${item.groupName}`" />
              </el-select>
            </el-form-item> -->
            <el-form-item label="设备状态">
              <el-select
                v-model="listQueryForm.deviceStatus"
                placeholder="请选择设备状态"
              >
                <el-option label="全部" value="" />
                <el-option
                  v-for="item in Object.keys(deviceStatusText)"
                  :key="item"
                  :label="`${deviceStatusText[item]}`"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="流状态">
              <el-select
                v-model="listQueryForm.streamStatus"
                placeholder="请选择流状态"
              >
                <el-option label="全部" value="" />
                <el-option
                  v-for="item in Object.keys(streamStatusText)"
                  :key="`${streamStatusText[item]}_${item}`"
                  :label="streamStatusText[item]"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="录制状态">
              <el-select
                v-model="listQueryForm.recordStatus"
                placeholder="请选择录制状态"
              >
                <el-option label="全部" value="" />
                <el-option
                  v-for="item in Object.keys(recordStatusText)"
                  :key="`${item}_${recordStatusText[item]}`"
                  :label="recordStatusText[item]"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                :loading="tableLoading"
                @click="searchDeviceList"
              >
                查询
              </el-button>
            </el-form-item>
            <el-form-item>
              <el-tooltip placement="top" content="导出">
                <svg-icon name="export" class="export" @click="exportList" />
              </el-tooltip>
            </el-form-item>
          </el-form>

          <!-- 默认不展示，点击了查询才给展示 -->

          <!-- <div v-if="Array.isArray(tableData)" class="statistic-box__info">
            <el-row>
              <el-col :span="7">
                <div class="statistic-box__content">
                  <p class="statistic-box__content__title">设备在线数:<span class="statistic-box__content__title_number">{{ tableInfo.totalDeviceOnlineNum }}/{{ tableInfo.totalDeviceNum }}</span></p>
                </div>
              </el-col>
              <el-col :span="7">
                <div class="statistic-box__content">
                  <p class="statistic-box__content__title">流在线数:<span class="statistic-box__content__title_number">{{ tableInfo.totalStreamOnlineNum }}/{{ tableInfo.totalDeviceNum }}</span></p>
                </div>
              </el-col>
              <el-col :span="7">
                <div class="statistic-box__content">
                  <p class="statistic-box__content__title">录制数:<span class="statistic-box__content__title_number">{{ tableInfo.totalRecordNum }}/{{ tableInfo.totalDeviceNum }}</span></p>
                </div>
              </el-col>
            </el-row>
          </div> -->

          <el-table
            v-if="Array.isArray(tableData)"
            v-loading="tableLoading"
            :data="tableData"
            style="width: 100%"
          >
            <el-table-column prop="dirName" label="所属目录" width="230">
              <template slot-scope="{ row }">
                <!-- <span>{{ row.dirName || '_' }}</span> -->
                <span v-if="row.dirName.length < 23">{{ row.dirName }}</span>
                <span v-else>
                  <el-tooltip
                    :content="row.dirName"
                    effect="dark"
                    placement="top-start"
                  >
                    <div class="statistic-box__table__text">
                      {{ row.dirName }}
                    </div>
                  </el-tooltip>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="deviceName" label="设备名称" width="160" />
            <el-table-column prop="gbId" label="国标ID" width="210" />
            <el-table-column prop="deviceId" label="设备ID" width="210" />
            <el-table-column prop="deviceIp" label="ip" width="210" />
            <el-table-column prop="status" label="设备状态" width="80">
              <template slot-scope="{ row }">
                <span>{{ deviceStatusText[row.deviceStatus] || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="流状态" width="80">
              <template slot-scope="{ row }">
                <span>{{ streamStatusText[row.streamStatus] || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="录制状态" width="80">
              <template slot-scope="{ row }">
                <span>{{ recordStatusText[row.recordStatus] || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="longitude" label="经度" width="140">
              <template slot-scope="{ row }">
                <span>{{ Number(row.longitude).toFixed(4) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="latitude" label="纬度" width="140">
              <template slot-scope="{ row }">
                <span>{{ Number(row.latitude).toFixed(4) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180">
              <template slot-scope="{ row }">
                <span>{{ dateFormat(Number(row.createTime)) }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-if="Array.isArray(tableData)"
            :current-page="pager.pageNum"
            :page-size="pager.pageSize"
            :total="pager.totalNum"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-tab-pane>
      <!-- 设备统计 -->
      <el-tab-pane label="设备统计" name="device">
        <div
          v-if="activeName === 'device'"
          class="statistic-box statistic-box__device"
        >
          <div class="statistic-box__left">
            <device-tree
              :wrap="$refs.statisticWrap"
              @treeback="getTreeDeviceId"
              @noback="setNoStatistic"
            />
          </div>
          <div class="statistic-box__right">
            <el-tabs v-if="ifShowStatistic" v-model="activeTab">
              <el-tab-pane
                v-loading="calendarLoading"
                label="录像统计"
                name="record"
              >
                <div class="statistic-box__title">
                  <div class="statistic-box__title-text">设备录像统计</div>
                </div>
                <div>
                  <el-date-picker
                    v-model="monthValue"
                    type="month"
                    placeholder="选择月"
                    value-format="yyyy-MM"
                    @change="monthValueChange"
                  />
                  <div
                    v-if="
                      calendarInfo.length > 0 &&
                        recordDayInfo.status !== 'unbind' &&
                        recordDayInfo.status !== 'stop'
                    "
                    class="statistic-box__calendar"
                  >
                    <div class="statistic-box__calendar__chart">
                      <div class="statistic-box__content">
                        <p class="statistic-box__content__title">录制天数</p>
                        <p class="statistic-box__content__number">
                          <span>{{ recordDayInfo.totalRecordDays || 0 }}</span>/{{ recordDayInfo.totalDays || 30 }}
                        </p>
                      </div>
                      <draw-chart :chart-info="recordDays" />
                    </div>
                    <div class="statistic-box__calendar__line" />
                    <div
                      v-loading="dayMissDataLoading"
                      class="statistic-box__calendar__date"
                    >
                      <el-tooltip
                        v-for="item in calendarInfo"
                        :key="item.day"
                        placement="top"
                        :content="getDateTipContent(item)"
                      >
                        <span
                          class="statistic-box__calendar__date__day"
                          :class="getThisClass(item)"
                          @click="openDetail(item)"
                        >
                          {{ item.day.substring(6) }}
                        </span>
                      </el-tooltip>
                    </div>
                  </div>
                  <div v-else-if="recordDayInfo.status === 'stop'">
                    <p>此月份未启动录像</p>
                  </div>
                  <div v-else-if="recordDayInfo.status === 'unbind'">
                    <p>此月份未绑定录制模板</p>
                  </div>
                </div>

                <div class="statistic-box__title">
                  <div class="statistic-box__title-text">丢失录像片段统计</div>
                </div>
                <el-form ref="filterForm" :model="filterForm" :inline="true">
                  <el-form-item label="时间段">
                    <!-- <el-col :span="11">
                        <el-date-picker v-model="filterForm.startTime" type="date" placeholder="选择日期" style="width: 100%;" />
                      </el-col>
                      <el-col class="line" :span="2">-</el-col>
                      <el-col :span="11">
                        <el-time-picker v-model="filterForm.endTime" placeholder="选择时间" style="width: 100%;" />
                      </el-col> -->
                    <el-date-picker
                      v-model="filterForm.dateValue"
                      type="datetimerange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                    />
                  </el-form-item>
                  <el-form-item label="忽略时长">
                    <template slot="label">
                      忽略时长
                      <el-popover
                        placement="top-start"
                        width="400"
                        trigger="hover"
                        :open-delay="300"
                        content="忽略规定秒内的缺失录像。"
                      >
                        <svg-icon
                          slot="reference"
                          class="form-question"
                          name="help"
                        />
                      </el-popover>
                    </template>
                    <el-input v-model="filterForm.ignore" @input="minValue" />
                  </el-form-item>
                  <el-form-item>
                    <el-button
                      type="primary"
                      :loading="tableLoading"
                      @click="searchList"
                    >
                      查询
                    </el-button>
                  </el-form-item>
                  <el-form-item>
                    <el-tooltip placement="top" content="导出">
                      <svg-icon
                        name="export"
                        class="export"
                        @click="exportMissData"
                      />
                    </el-tooltip>
                  </el-form-item>
                </el-form>
                <miss-table v-if="!calendarLoading" :info="searchParam" />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 弹层，非页面主体内容 -->
    <!-- 近7日存储用量趋势配置 -->
    <el-dialog
      v-if="ifThresholdDialog"
      title="近7日存储用量趋势配置"
      :visible="true"
      width="35%"
      :close-on-click-modal="false"
      :close="resetThresholdInput"
      :before-close="changeThresholdDialog"
      center
    >
      <!-- <div class="statistic-box__threshold-dialog">
        <el-input v-model="thresholdInput" placeholder="请输入告警阈值" min="0" max="100" @input="inputChange">
          <template slot="prepend">告警阈值：</template>
          <template slot="append">%</template>
        </el-input>
      </div> -->
      <el-form ref="thresholdForm" :model="thresholdForm" :rules="rules">
        <el-form-item label="" prop="thresholdInput">
          <el-input
            v-model="thresholdForm.thresholdInput"
            placeholder="请输入告警阈值"
            autocomplete="off"
          >
            <template slot="prepend">告警阈值：</template>
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sureThis">确 定</el-button>
        <el-button @click="changeThresholdDialog">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 录像丢失统计 -->
    <el-dialog
      :title="`${dayInfo.day} 录像丢失统计`"
      :visible="ifDayDialog"
      center
      :before-close="changeDayDialog"
    >
      <p>{{ `录制完整率: ${(dayInfo.complianceRate * 100).toFixed(2)}%` }}</p>

      <miss-table from="dialog" :info="dayInfo" />
      <span slot="footer" class="dialog-footer">
        <!-- <el-button type="primary" @click="sureThis">确 定</el-button> -->
        <el-button @click="changeDayDialog">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import DrawChart from './components/DrawChart.vue'
import DeviceTree from './components/DeviceTree.vue'
import MissTable from './components/MissTable.vue'
import {
  getStatistics,
  getRecordLog,
  setRecordThreshold,
  getDeviceList,
  exportDeviceList,
  getCalendarInfo,
  exportCalendarMissData
} from '@/api/statistic'
import {
  ChartInfo,
  CalendarListResponse,
  CalendarQuery,
  CalendarItem,
  CalendarMissItem,
  ExportMissQuery,
  RecordMissQuery
} from '@/type/Statistic'
import { dateFormat } from '@/utils/date'
import { UserModule } from '@/store/modules/user'
import { startOfDay, endOfDay, parse } from 'date-fns'

@Component({
  name: 'Statistic',
  components: {
    DrawChart,
    DeviceTree,
    MissTable
  }
})
export default class extends Vue {
  private activeName = 'statistic'
  private activeTab = 'record'
  private bytesToTB = Math.pow(1024, 4)
  private chart: any = {}

  private dateFormat = dateFormat

  private tableData: any = null
  private tableInfo: any = null
  private tableLoading = false

  private statisticsData: any = {}
  private recordData: any = {}
  private recordLog: any = {}
  private deviceList: any = {}

  private deviceOnlineInfo: ChartInfo = {}
  private streamOnlineInfo: ChartInfo = {}
  private recordOnlineInfo: ChartInfo = {}

  private recordLogInfo: ChartInfo = {}

  private bytesInfo: ChartInfo = {}
  private recordInfo: ChartInfo = {}

  private recordDays: ChartInfo = {}

  private ifThresholdDialog = false

  private thresholdInput: any = ''

  private monthValue = ''
  private daysOfMonth = 0
  private calendarInfo: CalendarItem[] = []
  private calendarLoading = true
  private recordDayInfo: any = {}

  private ifDayDialog = false
  private dayInfo: CalendarItem = {}

  private dayMissDataLoading = false

  private dayMissTableData: CalendarMissItem[] = []
  private dialogDayMissData: CalendarMissItem[] = []

  private ifShowStatistic = false

  private deviceId = ''

  private filterForm: RecordMissQuery = {
    deviceId: '',
    startTime: '',
    endTime: '',
    ignore: 0,
    pageNum: 1,
    pageSize: 10
  }

  private searchParam = {}

  private thresholdForm: any = {
    thresholdInput: ''
  }

  private listQueryForm: any = {
    // groupInfo: '',
    deviceStatus: '',
    recordStatus: '',
    streamStatus: ''
  }

  private pager: any = {
    pageSize: 10,
    pageNum: 1,
    totalNum: 0
  }

  private deviceStatusText = {
    on: '在线',
    off: '离线',
    new: '未注册'
  }

  private streamStatusText = {
    on: '在线',
    off: '离线'
  }

  private recordStatusText = {
    on: '录制中',
    off: '未录制',
    failed: '录制失败'
  }

  private groupList: any = []

  private param: any = {}

  @Watch('deviceId')
  private onDeviceIdChange(deviceId: string) {
    this.filterForm = {
      deviceId,
      // inProtocol: this.inProtocol,
      // groupId: this.groupId,
      ignore: 0,
      pageNum: 1,
      pageSize: 10,
      dateValue: [
        new Date(new Date().setHours(0, 0, 0, 0)),
        new Date(new Date().setHours(23, 59, 59, 0))
      ]
    }
    this.searchParam = { ...this.filterForm }
    this.getMonth()
    this.getCalendarInfo()
  }

  @Watch('monthValue')
  private onMonthValueChange() {
    if (this.deviceId) {
      this.getCalendarInfo()
    }
  }

  async mounted() {
    await this.getData()
    this.getMonth()
  }

  private validateThresholdInput(rule, value, callback) {
    if (!value) {
      callback(new Error('阈值不能为空'))
    } else if (!Number.isInteger(Number(value))) {
      callback(new Error('请输入数字'))
    } else if (Number(value) < 0 || Number(value) > 100) {
      callback(new Error('请输入0到100之间的数字'))
    } else {
      callback()
    }
  }

  private rules = {
    thresholdInput: [
      { validator: this.validateThresholdInput, trigger: 'blur' }
    ]
  }

  public get ifLiuzhou() {
    return UserModule.tags?.privateUser === 'liuzhou'
  }

  private get storageFlag() {
    return UserModule.tags?.showStorageUsage === 'Y'
  }

  private get recordUsage() {
    return (this.statisticsData.storage.usage / this.bytesToTB).toFixed(2)
  }

  private get recordTotal() {
    return (this.statisticsData.storage.total / this.bytesToTB).toFixed(2)
  }

  private getMonth() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const monthStr = month < 10 ? `0${month}` : month
    this.monthValue = `${year}-${monthStr}`
  }

  private changeThresholdDialog() {
    this.ifThresholdDialog = !this.ifThresholdDialog
    if (this.ifThresholdDialog) {
      // this.thresholdInput = this.recordLog.threshold
      this.thresholdForm.thresholdInput = this.recordLog.threshold
    }
  }

  private resetThresholdInput() {
    this.thresholdForm.thresholdInput = 0
  }

  private async getData() {
    if (this.activeName === 'statistic') {
      try {
        this.statisticsData = await getStatistics()

        if (this.storageFlag) {
          // this.recordData = await getRecord()
          this.bytesInfo = {
            kind: 'pie',
            totalDeviceNum: this.statisticsData.storage.total / this.bytesToTB,
            onlineNum: this.statisticsData.storage.usage / this.bytesToTB,
            label: '使用率',
            name: 'bytes'
          }
          this.recordLog = await getRecordLog()
          this.recordLogInfo = {
            kind: 'line',
            name: 'recordLog',
            data: this.recordLog
          }
        }

        // this.recordInfo = {
        //   kind: 'pie',
        //   totalDeviceNum: this.recordData.record.total,
        //   onlineNum: this.recordData.record.online,
        //   label: '使用率',
        //   name: 'record'
        // }

        this.deviceOnlineInfo = {
          kind: 'pie',
          totalDeviceNum: this.statisticsData.totalDeviceNum,
          onlineNum: this.statisticsData.totalDeviceOnlineNum,
          label: '在线率',
          name: 'deviceOnline'
        }

        this.streamOnlineInfo = {
          kind: 'pie',
          totalDeviceNum: this.statisticsData.totalDeviceNum,
          onlineNum: this.statisticsData.totalStreamOnlineNum,
          label: '在线率',
          name: 'streamOnline'
        }

        this.recordOnlineInfo = {
          kind: 'pie',
          totalDeviceNum: this.statisticsData.totalDeviceNum,
          onlineNum: this.statisticsData.totalRecordNum,
          label: '在线率',
          name: 'recordOnline'
        }

        // const query = {
        //   pageSize: 999
        // }
        // const res = await getGroups(query)
        // this.groupList = res.groups
      } catch (error) {
        this.$message.error(error && error.message)
      }
    }
  }

  // 月 选择器回调
  private monthValueChange(value: string) {
    const [year, month] = value.split('-')
    const date = this.getDaysOfMonth(Number(year), Number(month))
    this.daysOfMonth = date
  }

  // 获取特定月 有多少天
  private getDaysOfMonth(year: number, month: number): number {
    // new Date(year, month, 0)默认返回 当前月最后一天日期
    const date = new Date(year, month, 0).getDate()
    return date
  }

  private getDateTipContent(item: CalendarItem) {
    switch (item.status) {
      case 'unbind':
        return '该日未绑定录制模板'
      case 'stop':
        return '该日未启动录像'
      default:
        // return `录制完整率${(item.complianceRate * 100).toFixed(2)}%`
        return `录制完整率${Number(
          (item.complianceRate * 100).toString().match(/^\d+(?:\.\d{0,2})?/)
        )}%`
    }
  }

  private getThisClass(item: CalendarItem) {
    switch (item.status) {
      case 'unbind':
      case 'stop':
        return 'statistic-box__calendar__date__stop'
      case 'complete':
        return 'statistic-box__calendar__date__complete'
      case 'incomplete':
        return 'statistic-box__calendar__date__incomplete'
      default:
        return 'statistic-box__calendar__date__stop'
    }
  }

  private openDetail(item: CalendarItem) {
    if (item.status === 'incomplete') {
      const parsedDate = parse(item.day, 'yyyyMMdd', new Date())
      const startDate = startOfDay(parsedDate)
      const endDate = endOfDay(parsedDate)
      const query = {
        deviceId: this.deviceId,
        dateValue: [startDate, endDate],
        ...item
      }
      this.dayInfo = query
      this.changeDayDialog()
    }
  }

  private changeDayDialog() {
    this.ifDayDialog = !this.ifDayDialog
  }

  // 左侧树点击回调
  private getTreeDeviceId(
    deviceId: string,
    inProtocol: string,
    groupId: string
  ) {
    this.deviceId = deviceId
    // this.inProtocol = inProtocol
    this.groupId = groupId
    this.ifShowStatistic = true
  }

  private setNoStatistic() {
    this.ifShowStatistic = false
  }

  // 获取 日历及图表 信息
  private async getCalendarInfo() {
    try {
      this.calendarLoading = true
      const param: CalendarQuery = {
        deviceId: this.deviceId,
        month: this.monthValue,
        // inProtocol: this.inProtocol,
        groupId: this.groupId
      }

      const calendarInfo: CalendarListResponse = await getCalendarInfo(param)
      this.recordDayInfo = calendarInfo
      this.calendarInfo = calendarInfo.records
      this.recordDays = {
        kind: 'pie',
        totalDeviceNum: 100,
        onlineNum: this.recordDayInfo?.complianceRate * 100 || 0,
        label: '完整率',
        name: 'recordDays',
        width: 180,
        height: 280
      }
    } catch (error) {
      this.$message.error(error && error.message)
    } finally {
      this.calendarLoading = false
    }
  }

  // 查询丢失录像片段
  private async searchList() {
    this.searchParam = { ...this.filterForm }
  }

  private searchDeviceList() {
    this.pager.pageNum = 1
    this.getDeviceList()
  }

  private handleSizeChange(val: number) {
    this.pager.pageSize = val
    this.pager.pageNum = 1
    this.getDeviceList()
  }

  private handleCurrentChange(val: number) {
    this.pager.pageNum = val
    this.getDeviceList()
  }

  private minValue(value) {
    value = value.replace(/[^\d]/g, '')
    this.filterForm.ignore = value
  }

  private async getDeviceList() {
    this.tableLoading = true

    const {
      deviceStatus,
      streamStatus,
      recordStatus
      // groupInfo
    } = this.listQueryForm

    // const groupId = groupInfo.split('_')[0]
    // const inProtocol = groupInfo.split('_')[1]

    this.param = {
      // inProtocol,
      // groupId,
      deviceStatus,
      streamStatus,
      recordStatus,
      pageSize: this.pager.pageSize,
      pageNum: this.pager.pageNum
    }

    try {
      const res = await getDeviceList(this.param)
      this.tableData = res.devices
      this.pager.totalNum = Number(res.totalNum)
      this.tableInfo = res
    } catch (error) {
      this.$message.error(error && error.message)
    } finally {
      this.tableLoading = false
    }
  }

  private async exportList() {
    if (!Array.isArray(this.tableData) || this.tableData.length === 0) {
      this.$message.warning('请先查询出实际数据再进行导出')
    } else {
      try {
        const query = {
          ...this.param
        }

        const res = await exportDeviceList(query)
        const blob = new Blob([res.data])
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = '设备状态.xlsx'
        link.click()
        link.remove()
      } catch (error) {
        this.$message.error(error && error.message)
      }
    }
  }

  private async exportMissData() {
    try {
      const {
        deviceId,
        dateValue: [startTime, endTime],
        ignore
        // inProtocol, groupId
      } = this.filterForm
      const param: ExportMissQuery = {
        deviceId,
        // inProtocol,
        // groupId,
        startTime: dateFormat(startTime, 'yyyy-MM-dd HH:mm:ss'),
        endTime: dateFormat(endTime, 'yyyy-MM-dd HH:mm:ss'),
        ignore
      }
      const res = await exportCalendarMissData(param)
      const date = dateFormat(startTime, 'yyyy-MM-dd')
      const blob = new Blob([res.data])
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `${date}.xlsx`
      link.click()
      link.remove()
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private async sureThis() {
    const param = {
      threshold: this.thresholdForm.thresholdInput
    }
    try {
      (this.$refs.thresholdForm as any).validate(async (valid) => {
        if (valid) {
          await setRecordThreshold(param)
          this.getData()
        }
      })
    } catch (error) {
      this.$message.error(error && error.message)
    } finally {
      this.changeThresholdDialog()
    }
  }

  private handleClick() {
    this.getData()
  }
}
</script>

<style lang="scss" scoped>
.statistic {
  flex: 1;
  padding: 20px;

  &__statistic {
    min-width: 1200px;
  }

  ::v-deep .el-tabs__content {
    padding: 0;

    .el-form {
      margin-top: 30px;
    }
  }

  ::v-deep.el-card {
    overflow: auto;
  }
}

.statistic-box {
  &__p15-no-t {
    padding: 0 15px 15px;
  }

  ::v-deep .el-row {
    display: flex;
    width: 98%;

    .el-col {
      flex: 1;
      width: 22%;
      display: flex;
      border: 1px solid #d3d3d3;
      margin: 10px calc((100% - 20.8333% * 4) / 8);
      padding: 10px 0;
      min-width: 230px;
    }
  }

  ::v-deep .el-form {
    &-item {
      &__label {
        padding-right: 10px;
      }
    }
  }

  &__title {
    padding-left: 16px;
    border-left: 8px solid #fa8334;
    height: 26px;
    line-height: 26px;
    font-size: 16px;
    font-weight: bold;
    margin: 20px 0 10px;

    &-text {
      width: 160px;
      display: inline-block;
    }
  }

  &__content {
    width: 230px;

    &__title {
      font-size: 12px;
      color: #a1a1a1;
      padding-left: 10px;

      span {
        color: #d3d3d3;
      }
    }

    &__number {
      padding-left: 10px;
      color: #0f0f0f;
      font-size: 16px;

      span {
        color: $success;
      }
    }
  }

  &__info {
    background: #f2f2f2;
    margin: 10px 0;
    padding-left: 10px;

    ::v-deep .el-row {
      .el-col {
        margin: 0;
        border: none;
      }
    }

    .statistic-box__content {
      &__title {
        font-size: 14px;

        span {
          color: #a1a1a1;
        }

        span.statistic-box__content__title_number {
          color: #0f0f0f;
          padding-left: 5px;
        }
      }
    }
  }

  &__line-content {
    width: 95%;
    // height: 500px;
  }

  &__warning {
    display: inline-block;
    min-width: 240px;
    padding: 0 20px;
    height: 60px;
    background-color: #ac0100;
    color: #fff;
    font-size: 16px;
    line-height: 60px;
    margin: 20px 0 30px;

    span {
      font-size: 24px;
    }
  }

  &__table__text {
    cursor: pointer;
    width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__calendar {
    display: flex;
    align-items: center;
    width: 640px;
    margin: 20px 0;
    border: 1px solid $borderGrey2;
    padding: 10px;
    max-width: 750px;
    border-radius: 3px;

    &__chart,
    &__date {
      flex: 1;
      width: 49%;
    }

    &__chart {
      display: flex;
      padding-top: 10px;
    }

    &__date {
      padding: 10px;
      // height: 166px;

      &__day {
        display: inline-block;
        vertical-align: middle;
        width: 36px;
        margin: 3px;
        height: 26px;
        text-align: center;
        line-height: 26px;
        background-color: #fff;
        user-select: none;
        font-size: 12px;
        border-radius: 3px;
      }

      &__incomplete {
        background-color: #f59a23;
        color: #fff;
        cursor: pointer;
      }

      &__stop {
        background-color: #fff;
        border: 1px #b4b4b4 solid;
      }

      &__complete {
        background-color: $success;
        color: #fff;
      }
    }

    &__line {
      height: 130px;
      width: 1px;
      border-left: 1px solid #b4b4b4;
      // margin-top: 20px;
    }
  }

  &__device {
    display: flex;

    &__tree {
      overflow-y: auto;
      position: relative;
      height: 200px;
    }

    .statistic__chart {
      height: 160px;
    }

    .statistic-box__content {
      width: 90px;
      padding-top: 40px;
      padding-left: 10px;
    }

    ::v-deep .not-allowed {
      cursor: not-allowed;
    }
  }

  &__right {
    flex: 1;
    padding: 20px;
  }

  .export {
    cursor: pointer;
  }
}
</style>
