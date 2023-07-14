<template>
  <div class="dashboard-wrap-overview__item">
    <el-card>
      <div slot="header">
        <span>今日数据</span>
        <!-- <slot name="header" /> -->
      </div>
      <div class="dashboard-wrap-overview__item_content">
        <div class="dashboard-wrap-overview__item_content_detail">
          <div id="pieVideoToday"></div>
          <div class="dashboard-wrap-overview__item_content_detail_pie">
            视频接入数
          </div>
        </div>
        <div
          v-if="ifShowViidPie"
          class="dashboard-wrap-overview__item_content_detail"
        >
          <div id="pieViidToday"></div>
          <div class="dashboard-wrap-overview__item_content_detail_pie">
            视图接入数
          </div>
        </div>
        <div
          v-if="storageFlag"
          class="dashboard-wrap-overview__item_content_detail"
        >
          <div id="pieChartStorage"></div>
          <div class="dashboard-wrap-overview__item_content_detail_pie">
            视频存储使用量
          </div>
        </div>

        <div class="dashboard-wrap-overview__item_content_detail">
          <el-row :gutter="10">
            <el-col :span="12">
              <div class="dashboard-wrap-overview__item_content_data">
                实时上行带宽
                <div>{{ bandwidth.uploadBandWidthCurrentValue }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="dashboard-wrap-overview__item_content_data">
                实时上行流量
                <div>
                  {{ splitBandWidth(bandwidth.uploadTrafficValue)[0]
                  }}{{ splitBandWidth(bandwidth.uploadTrafficValue)[1] }}
                </div>
              </div>
            </el-col>
            <!-- </el-row>
          <el-row :gutter="20"> -->
            <el-col :span="12">
              <div class="dashboard-wrap-overview__item_content_data">
                实时下行带宽
                <div>{{ bandwidth.downloadBandWidthCurrentValue }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="dashboard-wrap-overview__item_content_data">
                实时下行流量
                <div>
                  {{ splitBandWidth(bandwidth.downloadTrafficValue)[0]
                  }}{{ splitBandWidth(bandwidth.downloadTrafficValue)[1] }}
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
// import DashboardLightContainer from './DashboardLightContainer.vue'
import DashboardMixin from '../mixin/DashboardMixin'
import { getDeviceStates, getUserStorage } from '@/api/dashboard'
import { getBandwidthStatistics } from '@/api/dosageStatistics'
import _ from 'lodash'
import { formatStorage } from '@/utils/number'
import { Chart, Util } from '@antv/g2'

@Component({
  name: 'DashboardTodayData',
  components: {}
})
export default class extends Mixins(DashboardMixin) {
  private statistics: any = {}

  private ifShowViidPie = false

  private chartStorage: any = null

  private pieVideoToday: any = null

  private pieViidToday: any = null

  private pieDataVideo: any = []

  private pieDataViid: any = []

  private pieDataStorage: any = []

  private pieDataView: any = []

  private currentPieChart: any = {}

  private bandWidthData: any = {
    downstreamBandwidth: 0,
    realDownstreamBandwidth: 0,
    realUpstreamBandwidth: 0,
    upstreamBandwidth: 0
  }
  private bandwidth: any = {
    uploadTrafficValue: 0,
    downloadTrafficValue: 0,
    downloadBandWidthCurrentValue: 0,
    uploadBandWidthCurrentValue: 0
  }

  private pieTodayToText = {
    offline: '离线',
    online: '在线',
    unregistered: '未注册',
    deactivate: '停用'
  }

  private pieStorageToText = {
    unused: '未使用',
    totalUsage: '已使用'
  }

  private get storageFlag() {
    return this.$store.state.user.tags?.showStorageUsage === 'Y'
    // return false
  }

  private mounted() {
    this.intervalTime = 10 * 60 * 1000
    this.setInterval(this.getData)
    this.chartHandle()
  }

  private getData() {
    this.getDevice()
    this.$nextTick(() => {
      this.getBandwidth()
      if (this.storageFlag) {
        this.getStorage()
      }
    })
  }

  private chartHandle() {
    // const init = document.createEvent('Event')
    // init.initEvent('resize', true, true)
    // window.dispatchEvent(init)

    this.$nextTick(() => {
      const event = new Event('resize')
      window.dispatchEvent(event)
    })
  }

  private splitBandWidth(bandwidth) {
    if (bandwidth === 0) return []
    return [
      bandwidth.substr(0, bandwidth.length - 4),
      `${bandwidth.substring(bandwidth.length - 4, bandwidth.length - 3)}B`
    ]
  }

  private formatBandWidth = (mbps) => {
    let i = 0
    while (Math.abs(mbps) >= 1024) {
      mbps = mbps / 1024
      i++
      if (i === 1) break
    }
    const units = ['Mbps', 'Gbps', 'Tbps']
    const newsize = _.round(mbps, 3)
    return newsize + units[i]
  }

  private formatDeviceData(res, kind) {
    const {
      offline = 0,
      online = 0,
      sum = 0,
      unregistered = 0,
      deactivate = 0
    } = res

    let data = {}

    if (kind === 'viid') {
      data = {
        offline,
        online,
        deactivate
      }
    } else {
      data = {
        offline,
        online,
        deactivate,
        unregistered
      }
    }

    const result = Object.keys(data).map((item) => ({
      item: item,
      value: data[item],
      percent: data[item] / sum,
      text: ''
    }))

    return result
  }

  private async getDevice() {
    try {
      const res = await getDeviceStates()

      const { video, viid } = res

      this.pieDataVideo = this.formatDeviceData(video, 'video')

      this.drawPieToday('pieVideoToday', 'pieVideoToday', this.pieDataVideo)

      const { enable, sum } = viid

      if (enable === 1 && Number(sum) !== 0) {
        this.ifShowViidPie = true
        this.$nextTick(() => {
          this.pieDataViid = this.formatDeviceData(viid, 'viid')
          this.drawPieToday('pieViidToday', 'pieViidToday', this.pieDataViid)
        })
      }

      this.$nextTick(() => {
        this.chartHandle()
      })
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private async getBandwidth() {
    try {
      const res = await getBandwidthStatistics()
      const {
        downloadBandWidthCurrentValue = 0,
        uploadBandWidthCurrentValue = 0,
        uploadTrafficValue = 0,
        downloadTrafficValue = 0
      } = res
      this.bandwidth = {
        downloadBandWidthCurrentValue: this.formatBandWidth(
          downloadBandWidthCurrentValue
        ),
        uploadBandWidthCurrentValue: this.formatBandWidth(
          uploadBandWidthCurrentValue
        ),
        uploadTrafficValue: this.formatBandWidth(uploadTrafficValue),
        downloadTrafficValue: this.formatBandWidth(downloadTrafficValue)
      }
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private async getStorage() {
    try {
      const res = await getUserStorage()
      const { totalBytes, totalUsage } = res
      this.pieDataStorage = [
        {
          item: 'unused',
          value: totalBytes - totalUsage,
          percent: (totalBytes - totalUsage) / totalBytes
        },
        {
          item: 'totalUsage',
          value: totalUsage,
          percent: totalUsage / totalBytes
        }
      ]

      this.drawPieStorage(
        'pieChartStorage',
        'chartStorage',
        this.pieDataStorage
      )

      this.$nextTick(() => {
        this.chartHandle()
      })
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private drawPieToday(container, chartDom, data) {
    this.currentPieChart[chartDom] && this.currentPieChart[chartDom].destroy()

    this[chartDom] = new Chart({
      container,
      autoFit: true,
      width: 700,
      height: 260
    })

    this[chartDom].scale('percent', {
      formatter: (val) => {
        val = val * 100 + '%'
        return val
      }
    })

    this[chartDom].coordinate('theta', {
      radius: 0.5,
      innerRadius: 0.6
    })

    console.log('data:', data)
    this[chartDom].data(data)

    this[chartDom].tooltip({
      showTitle: false,
      showMarkers: false,
      itemTpl:
        '<li class="g2-tooltip-list-item"><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
    })

    this[chartDom]
      .interval()
      .adjust('stack')
      .position('percent')
      .color('item', ['#36A1FF', '#41CBCB', '#56CB77', '#FBD44B'])
      .style({ opacity: 0.4 })
      .state({
        active: {
          style: (element) => {
            const shape = element.shape
            return {
              matrix: Util.zoom(shape, 1.1)
            }
          }
        }
      })
      .label('percent', () => {
        return {
          style: {
            fontSize: 12,
            fontWeight: 'bold',
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)'
          },
          layout: [
            { percent: 'pie-spider' },
            {
              percent: 'limit-in-plot',
              cfg: { action: 'translate' }
            }
          ],
          labelHeight: 20,
          labelLine: {
            style: {
              lineWidth: 0.5
            }
          },
          content: (data) => {
            return `${this.pieTodayToText[data.item]}:${data.value}`
          }
        }
      })
      .tooltip('item*percent*value', (item, percent, value) => {
        percent = (percent * 100).toFixed(2) + '%'
        return {
          name: this.pieTodayToText[item],
          value: value
        }
      })

    this[chartDom].legend(false)

    this[chartDom].interaction('element-single-selected')

    this[chartDom].render()

    this.currentPieChart[chartDom] = this[chartDom]
  }

  private drawPieStorage(container, chartDom, data) {
    this.currentPieChart[chartDom] && this.currentPieChart[chartDom].destroy()

    this[chartDom] = new Chart({
      container,
      autoFit: true,
      width: 700,
      height: 260
    })

    this[chartDom].scale('percent', {
      formatter: (val) => {
        // val = (val * 100).toFixed(2) + '%'
        val = val * 100 + '%'
        return val
      }
    })

    this[chartDom].coordinate('theta', {
      radius: 0.5,
      innerRadius: 0.6
    })

    this[chartDom].data(data)

    this[chartDom].tooltip({
      showTitle: false,
      showMarkers: false,
      itemTpl:
        '<li class="g2-tooltip-list-item"><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
    })

    this[chartDom]
      .interval()
      .adjust('stack')
      .position('percent')
      .color('item', ['#36A1FF', '#41CBCB'])
      .style({ opacity: 0.4 })
      .state({
        active: {
          style: (element) => {
            const shape = element.shape
            return {
              matrix: Util.zoom(shape, 1.1)
            }
          }
        }
      })
      .label('percent', (percent) => {
        return {
          style: {
            fontSize: 12,
            fontWeight: 'bold',
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)'
          },
          layout: [
            { percent: 'pie-spider' },
            {
              percent: 'limit-in-plot',
              cfg: { action: 'translate' }
            }
          ],
          labelHeight: 20,
          labelLine: {
            style: {
              lineWidth: 0.5
            }
          },
          content: (data) => {
            return `${this.pieStorageToText[data.item]}: ${(
              percent * 100
            ).toFixed(2)}%`
          }
        }
      })
      .tooltip('item*percent*value', (item, percent, value) => {
        percent = (percent * 100).toFixed(2) + '%'
        return {
          name: this.pieStorageToText[item],
          value: formatStorage(value)
        }
      })

    this[chartDom].legend(false)

    this[chartDom].interaction('element-single-selected')

    this[chartDom].render()

    this.currentPieChart[chartDom] = this[chartDom]
  }
}
</script>

<style lang="scss" scoped>
.dashboard-wrap-overview {
  &__item {
    ::v-deep {
      .el-card__header {
        border: none;
      }

      .el-row {
        margin-bottom: $padding-primary;
      }
    }

    &_content {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      text-align: center;

      &_detail {
        flex: 1;
        margin-bottom: $margin-small;
        min-width: 260px;

        &_pie {
          text-align: center;
          font-weight: bold;
          font-size: $text-size-large;
        }

        &:last-child {
          margin-top: $padding-primary;
          display: flex;
          flex-direction: column;
          justify-content: center;

          ::v-deep {
            .el-row {
              .el-col {
                width: 50%;
                min-width: 130px;
                margin-bottom: $margin-small;
              }
            }
          }
        }
      }

      &_data {
        line-height: 30px;
        background-color: $color-grey-7;
        padding: $padding-small;
        border-radius: $border-radius;
        font-size: $text-size-medium;
        text-align: center;

        div {
          font-weight: bolder;
          font-size: $text-size-large;
        }
      }
    }
  }
}
</style>
