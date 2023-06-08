<template>
  <div ref="listWrap" class="min-contaniner">
    <div class="filter-container clearfix">
      <div ref="filterWrap" class="filter-container__right">
        <div>算法类型</div>
        <el-select v-model="queryParam.algoType" placeholder="请选择">
          <el-option
            label="全部"
            value="all"
          >
          </el-option>
        </el-select>
        <div>应用名称</div>
        <el-select v-model="queryParam.appName" placeholder="请选择">
          <el-option
            label="全部"
            value="all"
          >
          </el-option>
        </el-select>
        <div>告警时间</div>
        <el-radio-group v-model="queryParam.periodType" size="medium" @change="handleChange">
          <!-- <el-radio-group> -->
          <el-radio-button label="今天" />
          <el-radio-button label="近7天" />
          <el-radio-button label="近30天" />
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
        />
        <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        <el-radio-group v-model="pageMode">
          <el-radio-button label="list">
            <i class="el-icon-s-operation" />
          </el-radio-button>
          <el-radio-button label="card">
            <i class="el-icon-menu" />
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
      <el-table-column label="告警时间" prop="deviceName" />
      <el-table-column label="置信度" prop="deviceName" />
      <el-table-column
        label="告警截图"
      >
        <template slot-scope="{ row }">
          <el-image :src="row.image" />
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="pageMode === 'list'"
      :current-page="pager.pageNum"
      :page-size="pager.pageSize"
      :total="pager.totalNum"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <CardList v-if="pageMode === 'card'" :alarms="alarmList" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { deleteAlarmInfo, getAlarmRules } from '@/api/alarm'
import { getAppScreenShot } from '@vss/device/api/ai-app'
import CardList from './CardList.vue'


@Component({
  name: 'alarm-list',
  components: {
    CardList
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

  private queryParam: any = {
    algoType: 'all',
    appName: 'all',
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
    totalNum: 0
  }

  private confidence = 0

  private pageMode = 'list'

  @Watch('queryParam.periodType')
  private periodTypeUpdated(newVal) {
    switch (newVal) {
      case '今天':
        this.queryParam.period = [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)]
        break
      case '近7天':
        this.queryParam.period = [this.getDateBefore(7), new Date().setHours(23, 59, 59, 999)]
        break
      case '近30天':
        this.queryParam.period = [this.getDateBefore(30), new Date().setHours(23, 59, 59, 999)]
        break
      case '自定义时间':
        this.queryParam.period = [this.getDateBefore(7), new Date().setHours(0, 0, 0, 0)]
        break
    }
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
      totalNum: 0
    }
    const tableDom: any = this.$refs.table
    tableDom.clearSort()
    tableDom.clearFilter()
    // this.$route.query.inProtocol && this.getList()
    // this.getList()
    this.timer && clearInterval(this.timer)
    this.getList()
    this.setTimer()
  }

  private mounted() {
    this.getScreenShot()
  }

  private async getScreenShot() {
    this.alarmList = []
    const [startTime, endTime] = this.queryParam.period
    const [confidenceMin, confidenceMax] = this.queryParam.confidence
    const deviceId: any = '682033951851757568'
    const inProtocol = 'rtmp'
    const { pageNum, pageSize } = this.pager
    const query = {
      startTime: Math.floor(startTime / 1000),
      endTime: Math.floor(endTime / 1000),
      confidenceMin,
      confidenceMax,
      // faceDb: this.faceLib.id,
      // faceIdList: this.queryParam.faceSelected,
      resultTimeInterval: this.queryParam.resultTimeInterval,
      appId: '559',
      // deviceId: deviceId === 'all' ? undefined : deviceId,
      deviceId: deviceId === 'all' ? undefined : deviceId,
      inProtocol,
      pageNum,
      pageSize }
    try {
      // this.queryLoading.pic = true
      // const res = await getAppScreenShot(query)
      // this.pager.totalNum = res.totalNum
      const list = [{
        algoCode: '10014', captureTime: 1685514698, appName: 'app1', algoName: 'xxx', deviceName: '的', image: 'https://vaas.cn-guianxinqu-1.ctyunxs.cn/vss-test-refactor-rai_test01-1/682033951851757568/ai/2023-03-10/20230310-164045-e4ef7e8f-9e0b-4ab2-8611-af509622efb9.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1ZMJJ907IRQO5R2C4G6S%2F20230607%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20230607T082442Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=095a0344e8d14c37d998b488e435a68546d90bb5d50154948c41d87961ae33cc'
      }, {
         algoCode: '10014', captureTime: 1685514698, appName: 'app2', algoName: 'xxx', deviceName: 'd2', image: 'https://vaas.cn-guianxinqu-1.ctyunxs.cn/vss-test-refactor-rai_test01-1/682033951851757568/ai/2023-03-10/20230310-164045-e4ef7e8f-9e0b-4ab2-8611-af509622efb9.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1ZMJJ907IRQO5R2C4G6S%2F20230607%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20230607T082442Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=095a0344e8d14c37d998b488e435a68546d90bb5d50154948c41d87961ae33cc'
      }, {
        algoCode: '10014', captureTime: 1685514698, appName: 'app3',  algoName: 'xxx', deviceName: 'd3', image: 'https://vaas.cn-guianxinqu-1.ctyunxs.cn/vss-test-refactor-rai_test01-1/682033951851757568/ai/2023-03-10/20230310-164045-e4ef7e8f-9e0b-4ab2-8611-af509622efb9.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1ZMJJ907IRQO5R2C4G6S%2F20230607%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20230607T082442Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=095a0344e8d14c37d998b488e435a68546d90bb5d50154948c41d87961ae33cc'
      }, {
         algoCode: '10014', captureTime: 1685514698, appName: 'app3',  algoName: 'xxx', deviceName: 'd4', image: 'https://vaas.cn-guianxinqu-1.ctyunxs.cn/vss-test-refactor-rai_test01-1/682033951851757568/ai/2023-03-10/20230310-164045-e4ef7e8f-9e0b-4ab2-8611-af509622efb9.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1ZMJJ907IRQO5R2C4G6S%2F20230607%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20230607T082442Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=095a0344e8d14c37d998b488e435a68546d90bb5d50154948c41d87961ae33cc'
      }]
      this.alarmList = list
    } catch (e) {
      // 异常处理
      console.log(e)
    } finally {
      // this.queryLoading.pic = false
    }
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
      pageSize: this.pager.pageSize,
      inProtocol: this.$route.query.inVideoProtocol || 'gb28181'
    }
    const type = this.$route.query.type
    if (type !== 'ipc' && type !== 'nvr') {
      // 目录级别
      params.dirId = this.$route.query.dirId
      if (typeof(this.$route.query.type) === 'undefined') {
        // 根目录
        params.dirId = '0'
      }
    } else {
      // 设备级别
      params.deviceId = this.$route.query.deviceId
    }
    try {
      !forbitLoading && (this.loading = true) && (this.alarmList = [])
      const res: any = await getAlarmRules(params)
      this.$nextTick(() => {
        this.alarmList = res.alarms
        this.pager.totalNum = res.totalNum
      })
    } catch (e) {
      this.$message.error(`获取模板列表失败，原因：${e && e.message}`)
    } finally {
      this.loading = false
    }
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

    /**
   * 告警搜索时间
   */
  public handleChange() {}

  private refresh(){
    this.getScreenShot()
  }

  private rowClick(row){

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

}
</script>
<style lang="scss" scoped>
.min-contaniner {
  min-width: 1100px;
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

  }
}

.el-date-editor {
  margin-left: 5px;
}
.el-slider{
  margin-left: 15px;
  width: 100px;
}
</style>
