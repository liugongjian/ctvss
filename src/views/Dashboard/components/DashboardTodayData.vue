<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-23 10:19:12
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-04-19 15:46:16
 * @FilePath: /vss-user-web/src/views/Dashboard/components/DashboardTodayData.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
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
                <div>{{ bandWidthData.realUpstreamBandwidth }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="dashboard-wrap-overview__item_content_data">
                上行流量峰值
                <div>
                  {{ splitBandWidth(bandWidthData.upstreamBandwidth)[0]
                  }}{{ splitBandWidth(bandWidthData.upstreamBandwidth)[1] }}
                </div>
              </div>
            </el-col>
            <!-- </el-row>
          <el-row :gutter="20"> -->
            <el-col :span="12">
              <div class="dashboard-wrap-overview__item_content_data">
                实时下行带宽
                <div>{{ bandWidthData.realDownstreamBandwidth }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="dashboard-wrap-overview__item_content_data">
                下行流量峰值
                <div>
                  {{ splitBandWidth(bandWidthData.downstreamBandwidth)[0]
                  }}{{ splitBandWidth(bandWidthData.downstreamBandwidth)[1] }}
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
import {
  getDeviceStates,
  getBandwidthStates,
  getUserStorage
} from '@/api/dashboard'
import { formatStorage, formatBandWidth } from '@/utils/number'
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
    return this.$store.state.user.tags.showStorageUsage === 'Y'
    // return false
  }

  private mounted() {
    this.chartHandle()
    this.intervalTime = 10 * 60 * 1000
    this.setInterval(this.getData)
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
    const init = document.createEvent('Event')
    init.initEvent('resize', true, true)
    window.dispatchEvent(init)
  }

  private splitBandWidth(bandwidth) {
    if (bandwidth === 0) return []
    return [
      bandwidth.substr(0, bandwidth.length - 4),
      `${bandwidth.substring(bandwidth.length - 4, bandwidth.length - 3)}B`
    ]
  }

  private formatDeviceData(res) {
    const {
      offline = 0,
      online = 0,
      sum = 0,
      unregistered = 0,
      deactivate = 0
    } = res
    const data = {
      offline,
      online,
      deactivate,
      unregistered
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

      this.pieDataVideo = this.formatDeviceData(video)

      this.drawPieToday('pieVideoToday', 'pieVideoToday', this.pieDataVideo)

      const { enable } = viid

      if (enable === 1) {
        this.ifShowViidPie = true
        this.$nextTick(()=>{
          this.pieDataViid = this.formatDeviceData(viid)
          this.drawPieToday('pieViidToday', 'pieViidToday', this.pieDataViid)
        })
      }
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private async getBandwidth() {
    try {
      const res = await getBandwidthStates()
      const {
        downstreamBandwidth,
        realDownstreamBandwidth,
        realUpstreamBandwidth,
        upstreamBandwidth
      } = res
      this.bandWidthData = {
        downstreamBandwidth: formatBandWidth(downstreamBandwidth),
        realDownstreamBandwidth: formatBandWidth(realDownstreamBandwidth),
        realUpstreamBandwidth: formatBandWidth(realUpstreamBandwidth),
        upstreamBandwidth: formatBandWidth(upstreamBandwidth)
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
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private drawPieToday(container, chartDom, data) {

    this.currentPieChart[chartDom] && this.currentPieChart[chartDom].destroy()

    this[chartDom] = new Chart({
      container,
      autoFit: true,
      width: 800,
      height: 260
    })

    console.log('this[chartDom] ---->', container, chartDom, this[chartDom])

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
            // return `${this.pieTodayToText[data.item]}: ${(
            //   percent * 100
            // ).toFixed(2)}%`
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
      width: 800,
      height: 260
    })

    this[chartDom].data(data)

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
        margin-bottom: 20px;
      }
    }

    &_content {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      text-align: center;

      &_detail {
        flex: 1;
        margin-bottom: 10px;
        min-width: 260px;

        &_pie {
          text-align: center;
          font-weight: bold;
        }

        &:last-child {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;

          ::v-deep {
            .el-row {
              .el-col {
                width: 50%;
                min-width: 130px;
                margin-bottom: 10px;
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
