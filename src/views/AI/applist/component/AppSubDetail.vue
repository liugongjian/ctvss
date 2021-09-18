<template>
  <div>
    <div class="face-filter">
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
    </div>

    <div class="query-wrapper">
      <span>截图时间：
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
    </div>
    <div class="chart-wrapper">
      <div class="title">
        <div class="title-block" />
        <span>人员聚集趋势</span>
      </div>
      <PeopleTrendChart
        :height="34"
        :param="queryParam"
        :face-lib="faceLib"
        :device="device"
        :app-info="appInfo"
      />
    </div>

    <div class="pic-wrapper">
      <div class="title">
        <div class="title-block" />
        <span>视频截图</span>
      </div>
      <div v-if="device.deviceId.length > 0 && picInfos.length > 0" class="card-wrapper">
        <PicCard
          v-for="(pic, index) in picInfos"
          :key="index"
          :pic="pic"
        />
      </div>
      <div v-else class="no-data">{{ device ? '暂无数据' : '请选择设备' }}</div>
      <el-pagination
        :current-page="pager.pageNum"
        :page-size="pager.pageSize"
        :total="pager.totalNum"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import PicCard from './PicCard.vue'
import PeopleTrendChart from './PeopleTrendChart.vue'
import { getAppScreenShot } from '@/api/ai-app'
import { getGroupPersonAlready } from '@/api/aiConfig'
import { decodeBase64 } from '@/utils/base64'
import debounce from '@/utils/debounce'

@Component({
  name: 'AppSubDetail',
  components: {
    PicCard,
    PeopleTrendChart
  }
})
export default class extends Vue {
    @Prop() private device!: any
    @Prop() private appInfo!: any
    @Prop() private faceLib!: any
    private decodeBase64: Function = decodeBase64
    private pager = {
      pageNum: 1,
      pageSize: 10,
      totalNum: 0
    }
    private breadCrumbContent: String = '应用详情'
    private queryParam: any = {
      periodType: '今天',
      period: [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)],
      frequency: 'all',
      confidence: [0, 100],
      faceSelected: []
    }
    private faceInfos: any = []
    private picInfos: any = []
    // 防抖
    private debounceHandle = debounce(this.getScreenShot, 500)

    @Watch('queryParam.periodType')
    private periodTypeUpdated(newVal) {
      switch (newVal) {
        case '今天':
          this.$set(this.queryParam, 'period', [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)])
          break
        case '近3天':
          this.$set(this.queryParam, 'period', [this.getDateBefore(3), new Date().setHours(23, 59, 59, 999)])
          break
        case '自定义时间':
          this.$set(this.queryParam, 'period', [])
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

    private async mounted() {
      this.initFaceInfos()
    }

    /**
     * 得到N天前的时间戳
     */
    private getDateBefore(dayCount) {
      let dd = new Date()
      dd.setDate(dd.getDate() + dayCount)
      let time = dd.getTime()
      return time
    }

    /**
     * 请求截屏数据
     */
    private async getScreenShot() {
      const [startTime, endTime] = this.queryParam.period
      const [confidenceMin, confidenceMax] = this.queryParam.confidence
      const query = {
        startTime,
        endTime,
        confidenceMin,
        confidenceMax,
        faceDb: this.faceLib.id,
        faceIdList: this.queryParam.faceSelected,
        appId: this.appInfo.id,
        deviceId: this.device.deviceId,
        inProtocol: this.device.inProtocol,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize }
      const res = await getAppScreenShot(query)
      this.pager.totalNum = res.totalNum
      this.picInfos = res.screenShotList
    }

    /**
     * 初始化人脸选项图片
     */
    private async initFaceInfos() {
      const algorithmMetadata = JSON.parse(this.appInfo.algorithmMetadata)
      if (algorithmMetadata.FaceDbName) {
        const { faces }: any = await getGroupPersonAlready({ id: algorithmMetadata.FaceDbName })
        this.faceInfos = faces.map(face => {
          return { ...face, labels: JSON.parse(face.labels) }
        })
      }
    }
    /**
     * 拦截所有操作，并防抖发起查询请求
     */
    private handleChange() {
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
}
</script>

<style lang='scss' scoped>

.face-filter{
  margin-bottom: 20px;
  ::v-deep .el-descriptions-item__label {
    min-width: 48px !important;
  }
  .el-checkbox-group{
    padding-left: 55px;
    .el-checkbox{
      line-height: 63px;
      height: 84px;
      width: 200px;
      position: relative;
      padding:0;
      margin: 0 58px 20px 0;
      ::v-deep .el-checkbox__input{
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-41%);
      }
      ::v-deep .el-checkbox__label{
        position: absolute;
        padding: 0;
        width: 160px;
        height: 100%;
        vertical-align: middle;
        .checkbox-content{
          display: flex;
          flex-direction: row;
          justify-content:space-between;
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
  .checkbox-content{
    width: 100%;
    height: 100%;
  }
  .face-options{
      width: 88%;
      height: 86px;
      margin-left: 56px;
      overflow: hidden;
      transition: height .2s;
      &::-webkit-scrollbar {
          /*滚动条整体样式*/
          width : 1px;  /*高宽分别对应横竖滚动条的尺寸*/
          height: 1px;
      }
      &::-webkit-scrollbar-thumb {
          /*滚动条里面小方块*/
          border-radius   : 10px;
          background-color: #fff;
      }
      &::-webkit-scrollbar-track {
      /*滚动条里面轨道*/
          background   : #fff;
          border-radius: 10px;
      }
      .selected{
          border: rgba(250,131,52) solid 2px !important;
      }
      .option{
          cursor: pointer;
          display: inline-block;
          width: 15%;
          min-width: 167px;
          max-width: 222px;
          height: 54px;
          border: rgb(192,196,204) solid .5px;
          border-radius: 5px;
          margin:20px 20px 0 0;
          overflow: hidden;
          padding:0;
          .el-image{
              display: inline-block;
              height: 100%;
              width: 40%;
              min-width: 65px;
              max-width: 70px;
          }
          .option-info{
              float: right;
              display: flex;
              line-height: 54px;
              width: 60%;
              justify-content: space-around;
              align-items: center;
          }
      }
  }
  .link-wrapper{
      margin-top: 10px;
      text-align: center;
  }
}
.query-wrapper{
    margin-bottom: 20px;
    &>span{
        margin-right: 20px;
    }
    .el-date-editor{
      margin-left: 10px;
      padding-top: 2px;
    }
    .confidence-slider{
      display: inline-block;
      line-height: 100%;
      vertical-align: middle;
      width:11vw;
      margin-right: 20px;
    }
}
.pic-wrapper{
    .card-wrapper{
        // height: 40vh;
        // overflow-y: scroll;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        flex-wrap: wrap;
    }
}
.title{
        height: 50px;
        vertical-align: middle;
        &>div{
            // display: inline-block;
            padding-top: 5px;
        }
        .title-block{
            width: 7px;
            height: 15px;
            background-color: rgba(250, 131, 52, 1);
            border: none;
            margin-top: 2px;
            margin-right: 5px;
            display: inline-block;
        }
        span {
            font-weight: bold;
        }
    }

.no-data{
  height: 200px;
  line-height: 200px;
  vertical-align: middle;
  text-align: center;
  color: rgba(186,198,198);
}
</style>
