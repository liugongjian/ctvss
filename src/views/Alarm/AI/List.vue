<template>
  <div ref="listWrap" class="min-contaniner">
    <div class="filter-container clearfix">
      <div ref="filterWrap" class="filter-container__right">
        <div v-if="showAlgoType">算法类型</div>
        <el-select v-if="showAlgoType" v-model="queryParam.algoType" placeholder="请选择" @change="algoTypeChange">
          <el-option
            v-for="type in algoTypes"
            :key="type.code"
            :label="type.name"
            :value="type.code"
          >
          </el-option>
        </el-select>
        <div>应用名称</div>
        <el-select v-model="queryParam.appName" placeholder="请选择" @change="handleChange">
          <el-option
            v-for="app in apps"
            :key="app.id"
            :label="app.name"
            :value="app.id"
          >
          </el-option>
        </el-select>
        <div>告警时间</div>
        <el-radio-group v-model="queryParam.periodType" size="medium" @change="handleChange">
          <!-- <el-radio-group> -->
          <el-radio-button label="今天" />
          <el-radio-button label="近3天" />
          <el-radio-button label="自定义时间" />
        </el-radio-group>
        <el-date-picker
          v-if="queryParam.periodType === '自定义时间'"
          v-model="queryParam.period"
          type="daterange"
          value-format="timestamp"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          @change="handleChange"
        />
        <div>置信度</div>
        <el-slider
          v-model="queryParam.confidence"
          range
          :show-input-controls="false"
          @change="handleChange"
        />
        <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        <el-radio-group v-model="pageMode" @change="handleChange">
          <el-radio-button label="list">
            <svg-icon name="list-mode" />
          </el-radio-button>
          <el-radio-button label="card">
            <svg-icon name="pic-mode" />
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <el-table
      v-if="pageMode === 'list'"
      ref="table"
      :data="alarmList"
      fit
      class="template__table"
      empty-text="暂无告警信息"
      @row-click="rowClick"
    >
      <el-table-column label="应用名称" prop="appName" />
      <el-table-column label="算法类型" prop="algoName" />
      <el-table-column label="设备名称" prop="deviceName" />
      <el-table-column label="告警时间" prop="captureTime">
        <template slot-scope="{ row }">
          {{ format(fromUnixTime(row.captureTime), 'yyyy-MM-dd HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column label="置信度" prop="confidence">
        <template slot-scope="{ row }">
          {{ row.confidence * 100 }}
        </template>
      </el-table-column>
      <el-table-column
        label="告警截图"
      >
        <template slot-scope="{ row }">
          <el-image :src="row.imageThumbnail" />
        </template>
      </el-table-column>
    </el-table>
    <CardList v-if="pageMode === 'card'" :alarms="alarmList" />
    <el-pagination
      :current-page="pager.pageNum"
      :page-size="pager.pageSize"
      :total="pager.totalNum"
      :page-sizes="pager.pageSizes"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <PicDialogue v-if="dialogueVisibile" :alarms="alarmList" :current-index.sync="currentIndex" :visible.sync="dialogueVisibile" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import CardList from './CardList.vue'
import PicDialogue from './components/PicDialogue.vue'
import { getAppList, getAlgorithmList, getAiAlarms } from '@/api/ai-app'
import { getTime } from 'date-fns'
import { format, fromUnixTime } from 'date-fns'


@Component({
  name: 'alarm-list',
  components: {
    CardList,
    PicDialogue
  }
})
export default class extends Vue {
  @Prop({ default: '' }) private groupId!: string
  private selectedDeviceList: any = []
  private searchFrom: any = {
    deviceName: '',
    timeRange: null,
    alarmPriority: [],
    alarmMethod: [],
    sortBy: '',
    sortDirection: ''
  }

  private dialogueVisibile = false

  private format = format
  private fromUnixTime = fromUnixTime

  private queryParam: any = {
    algoType: '0',
    appName: '0',
    periodType: '今天',
    period: [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)],
    confidence: [0, 100],
    faceSelected: [],
    resultTimeInterval: 1
  }

  private alarmList: any = []
  private timer: any = null
  private pager = {
    pageNum: 1,
    pageSize: 10,
    totalNum: 0,
    pageSizes: [10, 20, 30, 40, 50]
  }

  private confidence = 0

  private pageMode = 'list'

  private currentIndex = 0

  private apps = []

  private algoTypes = []

  private get showAlgoType(){
    return this.$route.query.deviceId === '' || !this.$route.query.deviceId
  }


  @Watch('queryParam.periodType')
  private periodTypeUpdated(newVal) {
    switch (newVal) {
      case '今天':
        this.queryParam.period = [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)]
        break
      case '近3天':
        this.queryParam.period = [this.getDateBefore(2), new Date().setHours(23, 59, 59, 999)]
        break
      case '自定义时间':
        this.queryParam.period = [this.getDateBefore(6), new Date().setHours(23, 59, 59, 999)]
        break
    }
  }

  @Watch('$route.query', { deep: true, immediate: true })
  public onRouterChange() {
    // this.getScreenShot()
    this.getAiAlarms()
    this.getApps()
    this.showAlgoType && this.getAlgoTypes()
  }

  private async getApps(){
    const all = [{ id: '0', name: '全部' }]
    const { aiApps } = await getAppList({ deviceId: this.$route.query.deviceId || undefined, pageSize: 3000 })
    all.push(...aiApps)
    this.apps = all
  }

  private async getAlgoTypes(){
    const all = [{ code: '0', name: '全部' }]
    const { aiAbilityAlgorithms } = await getAlgorithmList({ deviceId: this.$route.query.deviceId || undefined, pageSize: 3000 })
    all.push(...aiAbilityAlgorithms)
    this.algoTypes = all
  }


  private async getAiAlarms(){
    const [startTime, endTime] = this.queryParam.period
    const param = {
      appID: this.queryParam.appName === '0' ? undefined : this.queryParam.appName,
      algoCode: this.queryParam.algoType === '0' ? undefined : this.queryParam.algoType,
      deviceID: this.$route.query.deviceId,
      confidenceMin: this.queryParam.confidence[0] / 100,
      confidenceMax: this.queryParam.confidence[1] / 100,
      startTime: Math.floor(startTime / 1000),
      endTime: Math.floor(endTime / 1000),
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize,
    }
    const res = await getAiAlarms(param)
    this.alarmList = res.analysisResults
    this.pager.pageNum = res.pageNum
    this.pager.pageSize = res.pageSize
    this.pager.totalNum = res.totalNum
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


  private async refresh(){
    try {
      const ntDaysBefore = getTime(new Date()) - 90 * 24 * 60 * 60 * 1000
      if (this.queryParam.period[1] - this.queryParam.period[0] > 7 * 24 * 60 * 60 * 1000) return this.$message.error('只能查询时间跨度最长为7天的告警记录，请重新选择查询时间')
      if (this.queryParam.period[0] < ntDaysBefore) return this.$message.error('只能查询90天以内的告警记录，请重新选择查询时间')
      await this.getAiAlarms()
      this.$message.success('查询成功')
    } catch (e){
      this.$message.error(e)
    }

  }

  private handleChange(){
    this.refresh()
  }

  private rowClick(row){
    this.currentIndex = this.alarmList.findIndex(item => item.image === row.image)
    this.dialogueVisibile = true
  }

  /**
 * 得到N天前的时间戳
 */
  public getDateBefore(dayCount) {
    const dd = new Date()
    dd.setDate(dd.getDate() - dayCount)
    const time = dd.setHours(0, 0, 0)
    return time
  }

  private async algoTypeChange(val){
    await this.getApps()
    if (val !== '0'){
      this.apps = this.apps.filter(app => app.id === '0' || app.algorithm.code === val)
    }
    this.queryParam.appName = '0'
    this.refresh()
  }

  /**
   * 分页操作
   */
  private handleSizeChange(val: number) {
    this.pager.pageSize = val
    this.getAiAlarms()
  }

  /**
   * 分页操作
   */
  private handleCurrentChange(val: number) {
    this.pager.pageNum = val
    this.getAiAlarms()
  }
}
</script>
<style lang="scss" scoped>
.min-contaniner {
  min-width: 1350px;
  width: 100%;
  .filter-container__right{
    display: flex;
    align-items: center;
    & > div {
      margin: 0 8px;
    }
    ::v-deep .el-input {
      width: 100px;
    }
  }
  .el-table{
    ::v-deep .cell{
      display: flex;
      justify-content: center;
      .el-image{
        width:100px;
      }
    }
    ::v-deep .el-table__row{
      cursor: pointer;
    }

  }
}

.el-date-editor {
  margin-left: 5px;
}
.el-slider{
  margin-left: 15px;
  width: 100px;
}
.el-button-rect{
  margin: 0px 10px;
}
</style>
