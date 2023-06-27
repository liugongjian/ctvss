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
        <el-select v-model="queryParam.appName" placeholder="请选择">
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
    <CardList v-if="pageMode === 'card'" :alarms="alarmList" />
    <el-pagination
      :current-page="pager.pageNum"
      :page-size="pager.pageSize"
      :total="pager.totalNum"
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
    totalNum: 0
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

  @Watch('$route.query', { deep: true, immediate: true })
  public onRouterChange() {
    // this.getScreenShot()
    this.getAiAlarms()
    this.getApps()
    this.showAlgoType && this.getAlgoTypes()
  }

  private async getApps(){
    const all = [{ id: '0', name: '全部' }]
    const { aiApps } = await getAppList({ deviceId: this.$route.query.deviceId, pageSize: 3000 })
    all.push(...aiApps)
    this.apps = all
  }

  private async getAlgoTypes(){
    const all = [{ code: '0', name: '全部' }]
    const { aiAbilityAlgorithms } = await getAlgorithmList({ deviceId: this.$route.query.deviceId, pageSize: 3000 })
    all.push(...aiAbilityAlgorithms)
    this.algoTypes = all
  }


  private async getAiAlarms(){
    const [startTime, endTime] = this.queryParam.period
    const param = {
      appID: this.queryParam.appName === '0' ? '' : this.queryParam.appName,
      algoCode: this.queryParam.algoType === '0' ? '' : this.queryParam.algoCode,
      deviceID: this.$route.query.deviceId,
      confidenceMin: this.queryParam.confidence[0] / 100,
      confidenceMax: this.queryParam.confidence[1] / 100,
      startTime: startTime / 1000,
      endTime: (endTime / 1000).toFixed()
    }
    await getAiAlarms(param)
  }


  // private async getScreenShot() {
  //   this.alarmList = []
  //   const [startTime, endTime] = this.queryParam.period
  //   const [confidenceMin, confidenceMax] = this.queryParam.confidence
  //   const deviceId: any = '682033951851757568'
  //   const inProtocol = 'rtmp'
  //   const { pageNum, pageSize } = this.pager
  //   const query = {
  //     startTime: Math.floor(startTime / 1000),
  //     endTime: Math.floor(endTime / 1000),
  //     confidenceMin,
  //     confidenceMax,
  //     // faceDb: this.faceLib.id,
  //     // faceIdList: this.queryParam.faceSelected,
  //     resultTimeInterval: this.queryParam.resultTimeInterval,
  //     appId: '559',
  //     // deviceId: deviceId === 'all' ? undefined : deviceId,
  //     deviceId: deviceId === 'all' ? undefined : deviceId,
  //     inProtocol,
  //     pageNum,
  //     pageSize }
  //   try {
  //     // this.queryLoading.pic = true
  //     // const res = await getAppScreenShot(query)
  //     // this.pager.totalNum = res.totalNum
  //     const attr =   {
  //               'Gender': {
  //                   'Name': '男',
  //                   'Score': 0.996
  //               },
  //               'FaceMask': {
  //                   'Name': '无口罩',
  //                   'Score': 0.9737
  //               },
  //               'Attachment': {
  //                   'Name': '无携带物',
  //                   'Score': 0.9914
  //               },
  //               'Age': {
  //                   'Name': '十八岁到六十岁',
  //                   'Score': 0.9976
  //               },
  //               'Direction': {
  //                   'Name': '侧向',
  //                   'Score': 0.9975
  //               },
  //               'UpperWear': {
  //                   'Name': '长袖',
  //                   'Score': 0.9991
  //               },
  //               'LowerWear': {
  //                   'Name': '下装-不确定',
  //                   'Score': 0.8744
  //               },
  //               'UpperColor': {
  //                   'Name': '上装-黑色',
  //                   'Score': 0.9998
  //               },
  //               'LowerColor': {
  //                   'Name': '下装-颜色不确定',
  //                   'Score': 0.8744
  //               },
  //               'Hat': {
  //                   'Name': '',
  //                   'Score': 0
  //               },
  //               'Glass': {
  //                   'Name': '',
  //                   'Score': 0
  //               }
  //           }
  //     const list = [{
  //       algoCode: '10009', captureTime: 1685514698, appName: 'app1', algoName: 'xxx', deviceName: '的', image: 'https://vaas.cn-guianxinqu-1.ctyunxs.cn/vss-test-refactor-rai_test01-1/682033951851757568/ai/2023-03-10/20230310-164045-e4ef7e8f-9e0b-4ab2-8611-af509622efb9.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1ZMJJ907IRQO5R2C4G6S%2F20230627%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20230627T022454Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=fd43a591f5167d275c8f269a30f9ab96848bdd954f847eefde580a01be2add36'
  //       , detectBoxes: [867, 346, 287, 403 ], boxLabels: [{ info: { MatchPicUrl: 'xxx' } } ], imageLabel: { '离岗': '' }, ocrBoxes: [867, 346, 287, 403, 867, 346, 287, 403], detectArea: [21, 32, 434, 23, 231, 424, 55],
  //       attributesLabel: attr
  //     }, {
  //        algoCode: '10014', captureTime: 1685514698, appName: 'app2', algoName: 'xxx', deviceName: 'd2', image: 'https://vaas.cn-guianxinqu-1.ctyunxs.cn/vss-test-refactor-rai_test01-1/682033951851757568/ai/2023-03-10/20230310-162445-08d90408-0018-4241-873f-433c5fc721f8.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1ZMJJ907IRQO5R2C4G6S%2F20230627%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20230627T022454Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=e2fc63f1f3720fa761b1bf78bdfaa1367eadf06f1120080221df5976144feb1a'
  //       , detectBoxes: [867, 346, 287, 403 ], boxLabels: [{ info: { MatchPicUrl: 'xxx' } } ], imageLabel: { '离岗': '' }, ocrBoxes: [867, 346, 287, 403, 867, 346, 287, 403], detectArea: [21, 32, 434, 23, 231, 424, 55],
  //       attributesLabel: attr
  //     }]
  //     this.alarmList = list
  //   } catch (e) {
  //     // 异常处理
  //     console.log(e)
  //   } finally {
  //     // this.queryLoading.pic = false
  //   }
  // }

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


  private refresh(){
    const ntDaysBefore = getTime(new Date()) - 90 * 24 * 60 * 60 * 1000
    if (this.queryParam.period[0] < ntDaysBefore) return this.$message.error('只能查询90天以内的告警记录，请重新选择查询时间')
    this.this.getAiAlarms()
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
