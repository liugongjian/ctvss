<template>
  <div>
    <div v-if="!device.deviceId" class="no-device">请先选择设备</div>
    <div v-else>
      <!-- <div> -->
      <!-- <div v-if="isFaceAlgoCode" class="face-filter">
      <el-descriptions :column="1">
        <el-descriptions-item label="人脸库">
          {{ faceLib.name ? faceLib.name : '' }}
        </el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 20px">
        <el-checkbox-group v-model="queryParam.faceSelected" size="mdedium" @change="handleChange">
          <el-checkbox v-for="item in faceInfos" :key="item.faceSampleId" :label="item.faceSampleId" border>
            <div class="checkbox-content">
              <img :src="decodeBase64(item.imageString)" alt="">
              <div>
                <span>{{ item.labels.name }}</span>
              </div>
            </div>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div> -->

      <div class="query-wrapper">
        <span>告警时间：
          <el-radio-group v-model="queryParam.periodType" size="medium" @change="handleChange">
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
        </span>
        <span>置信度：
          <div class="confidence-slider">
            <el-slider
              v-model="queryParam.confidence"
              range
              @change="handleChange"
            />
          </div>
        </span>
        <!-- <span>间隔频率：
          <div class="time-interval">
            <el-select v-model="queryParam.resultTimeInterval" placeholder="请选择" @change="handleChange">
              <el-option
                v-for="(value,key) in timeInterval"
                :key="value"
                :label="key"
                :value="value"
              />
            </el-select>
          </div>
        </span> -->
        <span>
          <el-button class="el-button-rect" :disabled="dataLoading" @click="refresh"><svg-icon name="refresh" /></el-button>
        </span>
      </div>
      <div v-if="isGatheringCode && !queryLoading.peopleChart" class="chart-wrapper">
        <div class="title">
          <div class="title-block" />
          <span>人员聚集趋势</span>
        </div>
        <PeopleTrendChart
          :height="24"
          :param="queryParam"
          :face-lib="faceLib"
          :device="device"
          :app-info="appInfo"
        />
      </div>

      <div v-if="!queryLoading.carChart && isCarFlowCode" class="chart-wrapper car-spec">
        <div class="title">
          <div class="title-block" />
          <span>车流量统计结果</span>
        </div>
        <CarFlowChart
          :height="24"
          :param="queryParam"
          :face-lib="faceLib"
          :device="device"
          :app-info="appInfo"
        />
      </div>
      <div v-if="!queryLoading.carAlarmTable && isCarFlowCode" class="table-wrapper">
        <div class="title">
          <div class="title-block" />
          <span>告警列表</span>
        </div>
        <el-table
          v-if="alarms.length"
          ref="multipleTable"
          :data="alarms"
          tooltip-effect="dark"
          style="width: 100%;"
          height="300"
        >
          <el-table-column type="index" label="序号" align="center" />
          <el-table-column prop="AlarmCount" label="告警车辆" align="center" />
          <el-table-column prop="AlarmTime" label="时间" align="center" />
        </el-table>
        <div v-else class="no-data">暂无数据</div>
      <!-- <el-pagination
          :current-page="chartPager.pageNum"
          :page-size="chartPager.pageSize"
          :total="chartPager.totalNum"
          layout="total, prev, pager, next, jumper"
          @current-change="handleChartTableCurrentChange"
        /> -->
      </div>

      <div v-loading="queryLoading.pic" class="pic-wrapper">
        <div class="title">
          <div class="title-block" />
          <span>告警截图</span>
        </div>
        <div v-if="device.deviceId.length > 0 && picInfos.length > 0 && !queryLoading.pic" class="card-wrapper">
          <PicCard
            v-for="(pic, index) in picInfos"
            :key="index"
            :pic="pic"
            :type="appInfo.algorithm.code"
            @showDialogue="showDialogue"
          />
        </div>
        <div v-else class="no-data">{{ device ? '暂无数据' : '请选择设备' }}</div>
        <el-pagination
          :current-page="pager.pageNum"
          :page-size="pager.pageSize"
          :page-sizes="[12,24,36,48,60]"
          :total="pager.totalNum"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      <el-dialog
        v-if="visibile"
        :visible="visibile"
        :fullscreen="true"
        :custom-class="`light-ai-image-fullscreen`"
        @close="dialogueOprate"
      >
        <div slot="title">{{ dialoguePic && dialoguePic.deviceName }} | {{ dialoguePic && dialoguePic.time }}</div>
        <div class="ai-recognation__images__item__wrap ai-image-fullscreen__img">
          <div class="ai-recognation__images__item__img--wrap ai-image-fullscreen__img--wrap">
            <img v-if="dialoguePic" ref="dialogue" :src="dialoguePic.image" @load="onload">
            <Locations :type="appInfo.algorithm.code" :img="dialoguePic" :clickable="true" @click-location="onLocationChanged" />
          </div>
          <Attributes
            v-if="appInfo.algorithm.code === '10009'"
            class="ai-image-fullscreen__img--attributes"
            :type="appInfo.algorithm.code"
            :img="dialoguePic"
            :attributes-index="currentLocationIndex"
          />
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import PicCard from './PicCard.vue'
import PeopleTrendChart from './PeopleTrendChart.vue'
import CarFlowChart from './CarFlowChart.vue'
import Locations from './Locations.vue'
import Attributes from './Attributes.vue'
import { parseMetaData, transformLocationAi } from '@vss/ai/util/ai'
import { getAppScreenShot, getVehiclesAlarmStatic } from '@vss/device/api/ai-app'
import debounce from '@vss/ai/util/debounce'
import { getGroupPersonAlready } from '@vss/device/api/aiConfig'
import { decodeBase64 } from '@vss/ai/util/base64'
import { ResultTimeInterval } from '@vss/ai/dics/contants'
import { getTime } from 'date-fns'

@Component({
  name: 'AppSubDetail',
  components: {
    PicCard,
    PeopleTrendChart,
    Locations,
    Attributes,
    CarFlowChart
  }
})
export default class extends Vue {
  @Prop() private device!: any
  @Prop() private appInfo!: any
  @Prop() private faceLib!: any
  private dialoguePic: any = null
  private queryLoading: any = {
    pic: false,
    carChart: false,
    peopleChart: false,
    carAlarmTable: false
  }
  private currentLocationIndex = -1
  private visibile = false
  private decodeBase64: Function = decodeBase64
  private timeInterval = ResultTimeInterval
  private pager = {
    pageNum: 1,
    pageSize: 12,
    totalNum: 0
  }
  private chartPager = {
    pageNum: 1,
    pageSize: 5,
    totalNum: 300
  }
  private breadCrumbContent: String = '应用详情'
  private queryParam: any = {
    periodType: '今天',
    period: [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)],
    confidence: [0, 100],
    faceSelected: [],
    resultTimeInterval: 1
  }
  private faceInfos: any = []
  private picInfos: any = []
  private alarms: any = []
  // 防抖
  private debounceHandle = debounce(() => {
    Object.keys(this.queryLoading).forEach(key => { this.queryLoading[key] = true })
    this.getScreenShot()
    this.isCarFlowCode && this.getAlarmsList()
    Object.keys(this.queryLoading).forEach(key => { this.queryLoading[key] = false })
  }, 500)

  get dataLoading() {
    let loading = false
    Object.keys(this.queryLoading).forEach(key => {
      if (this.queryLoading[key]) {
        loading = true
      }
    })
    return loading
  }

  @Watch('queryParam.periodType')
  private periodTypeUpdated(newVal) {
    switch (newVal) {
      case '今天':
        this.$set(this.queryParam, 'period', [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)])
        break
      case '近3天':
        this.$set(this.queryParam, 'period', [this.getDateBefore(2), new Date().setHours(23, 59, 59, 999)])
        break
      case '自定义时间':
        this.$set(this.queryParam, 'period', [this.getDateBefore(6), new Date().setHours(23, 59, 59, 999)])
        break
    }
  }

  @Watch('device', { deep: true })
  private deviceIdUpdate() {
    this.debounceHandle()
  }
  @Watch('appInfo', { deep: true })
  private appInfoUpdate() {
    this.device.deviceId.length > 0 && this.debounceHandle()
  }

  private get isFaceAlgoCode() {
    return this.appInfo.algorithm?.code === '10001'
  }
  private get isGatheringCode() {
    return this.appInfo.algorithm?.code === '10005'
  }

  private get isCarFlowCode() {
    return this.appInfo.algorithm?.code === '10019'
  }
  private async mounted() {
    // this.initFaceInfos()
    if (this.device.deviceId.length > 0) {
      this.getScreenShot()
      this.isCarFlowCode && this.getAlarmsList()
    }
  }

  /**
     * 得到N天前的时间戳
     */
  private getDateBefore(dayCount) {
    const dd = new Date()
    dd.setDate(dd.getDate() - dayCount)
    const time = dd.setHours(0, 0, 0)
    return time
  }

  /**
     * 请求截屏数据
     */
  private async getScreenShot() {
    this.picInfos = []
    const [startTime, endTime] = this.queryParam.period
    const [confidenceMin, confidenceMax] = this.queryParam.confidence
    const { deviceId, inProtocol } = this.device
    const { pageNum, pageSize } = this.pager
    const query = {
      startTime: Math.floor(startTime / 1000),
      endTime: Math.floor(endTime / 1000),
      confidenceMin,
      confidenceMax,
      faceDb: this.faceLib.id,
      faceIdList: this.queryParam.faceSelected,
      resultTimeInterval: this.queryParam.resultTimeInterval,
      appId: this.appInfo.id || this.appInfo.appId,
      deviceId: deviceId === 'all' ? undefined : deviceId,
      inProtocol,
      pageNum,
      pageSize }
    try {
      this.queryLoading.pic = true
      const res = await getAppScreenShot(query)
      this.pager.totalNum = res.totalNum
      this.picInfos = res.screenShotList
    } catch (e) {
      // 异常处理
      console.log(e)
    } finally {
      this.queryLoading.pic = false
    }
  }

  private async getAlarmsList() {
    this.alarms = []
    const [startTime, endTime] = this.queryParam.period
    const { deviceId } = this.device
    const query = {
      appId: this.appInfo.id,
      startTime: Math.floor(startTime / 1000),
      endTime: Math.floor(endTime / 1000),
      deviceId: deviceId === 'all' ? undefined : deviceId
    }
    const res = await getVehiclesAlarmStatic(query)
    this.alarms = res.vehiclesAlarmList
  }

  /**
     * 初始化人脸选项图片
     */
  private async initFaceInfos() {
    if (this.appInfo.algorithmMetadata?.length > 0) {
      const algorithmMetadata = JSON.parse(this.appInfo.algorithmMetadata)
      if (algorithmMetadata?.FaceDbName) {
        const { faces }: any = await getGroupPersonAlready({ id: algorithmMetadata?.FaceDbName })
        this.faceInfos = faces.map(face => {
          return { ...face, labels: JSON.parse(face.labels) }
        })
      }
    }
  }
  /**
     * 拦截所有操作，并防抖发起查询请求
     */
  private handleChange() {
    const ntDaysBefore = getTime(new Date()) - 90 * 24 * 60 * 60 * 1000
    if (this.queryParam.period[0] < ntDaysBefore)
      return this.$message.error(
        '只能查询90天以内的告警记录，请重新选择查询时间'
      )
    if (this.queryParam.period[1] - this.queryParam.period[0] > 7 * 24 * 60 * 60 * 1000) return this.$message.error('只能查询时间跨度最长为7天的告警记录，请重新选择查询时间')
    if (this.device.deviceId.length > 0) {
      (this.queryParam.periodType !== '自定义时间' || this.queryParam.period.length !== 0) && this.debounceHandle()
    } else {
      this.$message.error('请先选择设备')
    }
  }
  /**
     * 分页操作
     */
  private handleSizeChange(val: number) {
    this.pager.pageSize = val
    this.getScreenShot()
  }
  /**
     * 分页操作
     */
  private handleCurrentChange(val: number) {
    this.pager.pageNum = val
    this.getScreenShot()
  }

  /**
     * 分页操作
     */
  private handleChartTableCurrentChange(val: number) {
    this.chartPager.pageNum = val
  }

  private dialogueOprate() {
    this.visibile = !this.visibile
  }
  private showDialogue(val) {
    this.visibile = true
    this.dialoguePic = val
  }
  private onload() {
    const metaData = JSON.parse(this.dialoguePic.metadata)
    const locations = parseMetaData(this.appInfo.algorithm?.code, metaData)
    const img = this.$refs.dialogue
    this.dialoguePic = { ...this.dialoguePic, locations: transformLocationAi(locations, img) }
  }
  private onLocationChanged(index: number) {
    this.currentLocationIndex = index
  }
  private async refresh() {
    this.debounceHandle()
  }
}
</script>

<style lang='scss' scoped>
.face-filter {
  margin-bottom: 20px;

  ::v-deep .el-descriptions-item__label {
    min-width: 48px !important;
  }

  .el-checkbox-group {
    padding-left: 55px;

    .el-checkbox {
      line-height: 63px;
      height: 84px;
      width: 200px;
      position: relative;
      padding: 0;
      margin: 0 58px 20px 0;

      ::v-deep .el-checkbox__input {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-41%);
      }

      ::v-deep .el-checkbox__label {
        position: absolute;
        padding: 0;
        width: 160px;
        height: 100%;
        vertical-align: middle;

        .checkbox-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;

          img {
            width: 50%;
            height: 100%;
          }

          div {
            width: 50%;
            text-align: center;
          }
        }
      }
    }
  }
}

.query-wrapper {
  // height: 36px;
  margin-bottom: 20px;
  line-height: 52px;

  & > span {
    margin-right: 20px;
  }

  .el-date-editor {
    margin-left: 10px;
    padding-top: 2px;
  }

  .confidence-slider {
    display: inline-block;
    line-height: 100%;
    vertical-align: middle;
    width: 11vw;
    margin-right: 20px;
    padding-left: 8px;
  }

  .time-interval {
    display: inline-block;
    width: 5vw;
  }
}

.pic-wrapper {
  .card-wrapper {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    overflow-y: auto;
  }
}

.table-wrapper,
.chart-wrapper {
  display: inline-block;
  vertical-align: top;
}

.chart-wrapper {
  width: 100%;
}

.table-wrapper {
  width: 400px;
}

.title {
  height: 50px;
  vertical-align: middle;

  & > div {
    // display: inline-block;
    padding-top: 5px;
  }

  .title-block {
    width: 7px;
    height: 15px;
    background-color: rgba(250, 131, 52, 100%);
    border: none;
    margin-top: 2px;
    margin-right: 5px;
    display: inline-block;
  }

  span {
    font-weight: bold;
  }
}

.no-data {
  height: 200px;
  line-height: 200px;
  vertical-align: middle;
  text-align: center;
  color: rgba(186, 198, 198);
}

.ai-image-fullscreen__img {
  width: 100%;
  display: flex;

  &--wrap {
    position: relative;
    flex: 4;
  }

  &--attributes {
    flex: 1;
    background: #f7f7f7;
    padding: 20px 15px;
  }

  img {
    width: 100%;
  }
}

.no-device {
  height: 70vh;
  color: rgba(186, 198, 198);
  line-height: 50vh;
  text-align: center;
  font-size: 25px;
}

.car-spec {
  width: calc(100% - 400px) !important;
}
</style>
