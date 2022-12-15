<template>
  <el-card>
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane label="设备统计" name="statistic">
        <div class="statistic-box">
          <div class="statistic-box__title">
            <div class="access-restriction__title-text">设备统计概览</div>
          </div>
          <el-row>
            <el-col :span="7">
              <div class="statistic-box__content">
                <p class="statistic-box__content__title">设备在线数<span>(在线/总数)</span></p>
                <p class="statistic-box__content__number"><span>3834</span>/23834</p>
              </div>
              <draw-chart :chart-info="deviceOnlineInfo" />
            </el-col>
            <el-col :span="7">
              <div class="statistic-box__content">
                <p class="statistic-box__content__title">流在线数<span>(在线/总数)</span></p>
                <p class="statistic-box__content__number"><span>3834</span>/23834</p>
              </div>
              <draw-chart :chart-info="streamOnlineInfo" />
            </el-col>
            <el-col :span="7">
              <div class="statistic-box__content">
                <p class="statistic-box__content__title">录制数<span>(录制中/总数)</span></p>
                <p class="statistic-box__content__number"><span>3834</span>/23834</p>
              </div>
              <draw-chart :chart-info="recordOnlineInfo" />
            </el-col>
          </el-row>
        </div>
        <el-table
          :data="tableData"
          style="width: 100%;"
        >
          <el-table-column
            prop="dir"
            label="所属目录"
            width="180"
          />
          <el-table-column
            prop="name"
            label="设备名称"
            width="180"
          />
          <el-table-column
            prop="gbId"
            label="国标ID"
          />
          <el-table-column
            prop="deviceId"
            label="设备ID"
          />
          <el-table-column
            prop="ip"
            label="ip"
          />
          <el-table-column
            prop="status"
            label="设备状态"
          >
            <template slot-scope="{row}">
              <span>{{ row.status || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="流状态"
          >
            <template slot-scope="{row}">
              <span>{{ row.status || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="录制状态"
          >
            <template slot-scope="{row}">
              <span>{{ row.status || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="ip"
            label="经度"
          />
          <el-table-column
            prop="ip"
            label="纬度"
          />
          <el-table-column
            prop="time"
            label="创建时间"
          />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="录像统计" name="record">
        <div class="statistic-box">
          <el-row>
            <el-col :span="7">
              <div class="statistic-box__content">
                <p class="statistic-box__content__title">
                  存储容量
                  <span>(已使用/总容量)</span>
                </p>
                <p v-if="recordData.storage" class="statistic-box__content__number">
                  <span>{{ recordUsage }}TB</span>
                  /{{ recordTotal }}TB
                </p>
              </div>
              <draw-chart :chart-info="bytesInfo" />
            </el-col>
            <el-col :span="7">
              <div class="statistic-box__content">
                <p class="statistic-box__content__title">
                  录制数
                  <span>(录制中/总数
                    <el-tooltip class="item" effect="dark" content="总数包含IPC和NVR下的通道" placement="top-start">
                      <i class="el-icon-warning" />
                    </el-tooltip>
                    )</span>
                </p>
                <p v-if="recordData.record" class="statistic-box__content__number">
                  <span>{{ recordData.record.online }}</span>
                  /{{ recordData.record.total }}
                </p>
              </div>
              <draw-chart :chart-info="recordInfo" />
            </el-col>
          </el-row>
          <div class="statistic-box__title">
            <div class="astatistic-box__title-text">近7日存储用量趋势</div>
          </div>
          <div v-if="recordLog.storageWarn&&recordLog.storageWarn.show" class="statistic-box__warning">预估录制剩余天数 <span>{{ recordLog.storageWarn.days }}天</span></div>
          <div class="statistic-box__line-content">
            <draw-chart :chart-info="recordLogInfo" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DrawChart from './components/DrawChart.vue'
// import { Chart } from '@antv/g2'
import { getStatistics, getRecord, getRecordLog } from '@/api/statistic'

@Component({
  name: 'Statistic',
  components: {
    DrawChart
  }
})
export default class extends Vue {
  private activeName: string = 'statistic'
  private bytesToTB = Math.pow(1024, 4)
  private chart: any = {}

  private tableData = []
  private statisticsData: any = {}
  private recordData: any = {}
  private recordLog: any = {}

  private deviceOnlineInfo: any = {}
  private streamOnlineInfo: any = {}
  private recordOnlineInfo: any = {}

  private recordLogInfo: any = {}

  private bytesInfo: any = {}
  private recordInfo: any = {}

  async mounted() {
    await this.getData()
  }

  private get recordUsage() {
    return (this.recordData.storage.usage / this.bytesToTB).toFixed(2)
  }

  private get recordTotal() {
    return (this.recordData.storage.total / this.bytesToTB).toFixed(2)
  }

  private async getData() {
    if (this.activeName === 'statistic') {
      try {
        this.statisticsData = await getStatistics()
        this.deviceOnlineInfo = {
          kind: 'pie',
          totalDeviceNum: 100, // this.statisticsData.totalDeviceNum,
          onlineNum: 20, // this.statisticsData.totalDeviceOnlineNum,
          label: '在线率',
          name: 'deviceOnline'
        }
        this.streamOnlineInfo = {
          kind: 'pie',
          totalDeviceNum: 100, // this.statisticsData.totalDeviceNum,
          onlineNum: 30, // this.statisticsData.totalStreamOnlineNum,
          label: '在线率',
          name: 'streamOnline'
        }
        this.recordOnlineInfo = {
          kind: 'pie',
          totalDeviceNum: 100, // this.statisticsData.totalDeviceNum,
          onlineNum: 40, // this.statisticsData.toalRecordNum,
          label: '在线率',
          name: 'recordOnline'
        }
      } catch (error) {
        this.$message.error(error && error.message)
      }
    } else {
      try {
        this.recordData = await getRecord()
        this.recordLog = await getRecordLog()

        this.bytesInfo = {
          kind: 'pie',
          totalDeviceNum: this.recordData.storage.total / this.bytesToTB,
          onlineNum: this.recordData.storage.usage / this.bytesToTB,
          label: '使用率',
          name: 'bytes'
        }
        this.recordInfo = {
          kind: 'pie',
          totalDeviceNum: this.recordData.record.total,
          onlineNum: this.recordData.record.online,
          label: '使用率',
          name: 'record'
        }

        this.recordLogInfo = {
          kind: 'line',
          name: 'recordLog',
          data: this.recordLog
        }
      } catch (error) {
        this.$message.error(error && error.message)
      }
    }
  }

  private drawChart() {

  }

  private handleClick() {
    this.getData()
  }
}
</script>

<style lang="scss" scoped>
.statistic-box {
  ::v-deep .el-row {
    .el-col {
      display: flex;
      border: 1px solid #d3d3d3;
      margin: calc((100% - 29.1667%*3)/6);
      padding: 10px 0;
    }
  }

  &__title {
    padding-left: 16px;
    border-left: 8px solid #fa8334;
    height: 26px;
    line-height: 26px;
    font-size: 16px;
    font-weight: bold;
    margin: 10px 0 20px;

    &-text {
      width: 120px;
      display: inline-block;
    }
  }

  &__content {
    width: 230px;

    &__title {
      font-size: 12px;
      color: #a1a1a1;
      padding-left: 20px;

      span {
        color: #d3d3d3;
      }
    }

    &__number {
      padding-left: 20px;
      color: #0f0f0f;
      font-size: 16px;

      span {
        color: #9bcc56;
      }
    }
  }

  &__line-content {
    width: 50%;
    height: 500px;
  }

  &__warning {
    width: 240px;
    height: 60px;
    background-color: #ac0100;
    color: #fff;
    font-size: 16px;
    line-height: 60px;
    padding-left: 20px;
    margin: 30px 0;

    span {
      font-size: 24px;
    }
  }
}
</style>
