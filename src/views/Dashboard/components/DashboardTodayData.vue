<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-23 10:19:12
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-04-18 10:17:51
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
          <div id="pieChartToday"></div>
          <div class="dashboard-wrap-overview__item_content_detail_pie">
            接入设备数
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

  private chartToday: any = null

  private chartStorage: any = null

  private pieDataToday: any = []

  private pieDataStorage: any = []

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

  private async getDevice() {
    try {
      const res = await getDeviceStates()
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

      this.pieDataToday = Object.keys(data).map((item) => ({
        item: item,
        value: data[item],
        percent: data[item] / sum,
        text: ''
      }))

      this.chartToday
        ? this.chartToday.changeData(this.pieDataToday)
        : this.drawPieToday()
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

      this.chartStorage
        ? this.chartStorage.changeData(this.pieDataStorage)
        : this.drawPieStorage()
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private drawPieToday() {
    this.chartToday = new Chart({
      container: 'pieChartToday',
      autoFit: true,
      width: 800,
      height: 260
    })

    this.chartToday.scale('percent', {
      formatter: (val) => {
        val = val * 100 + '%'
        return val
      }
    })

    this.chartToday.coordinate('theta', {
      radius: 0.5,
      innerRadius: 0.6
    })

    this.chartToday.data(this.pieDataToday)

    this.chartToday.tooltip({
      showTitle: false,
      showMarkers: false,
      itemTpl:
        '<li class="g2-tooltip-list-item"><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
    })

    this.chartToday
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

    this.chartToday.legend(false)

    this.chartToday.interaction('element-single-selected')

    this.chartToday.render()
  }

  private drawPieStorage() {
    this.chartStorage = new Chart({
      container: 'pieChartStorage',
      autoFit: true,
      width: 800,
      height: 260
    })

    this.chartStorage.data(this.pieDataStorage)

    this.chartStorage.scale('percent', {
      formatter: (val) => {
        // val = (val * 100).toFixed(2) + '%'
        val = val * 100 + '%'
        return val
      }
    })

    this.chartStorage.coordinate('theta', {
      radius: 0.5,
      innerRadius: 0.6
    })

    this.chartStorage.tooltip({
      showTitle: false,
      showMarkers: false,
      itemTpl:
        '<li class="g2-tooltip-list-item"><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
    })

    this.chartStorage
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

    this.chartStorage.legend(false)

    this.chartStorage.interaction('element-single-selected')

    this.chartStorage.render()
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
        }

        &:last-child {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          // min-width: 500px;
          ::v-deep {
            .el-row {
              // display: flex;
              // justify-content: space-between;
              // text-align: center;
              // flex-wrap: wrap;

              .el-col {
                // flex: 1 2 35%;
                // flex: 1;
                // flex-grow: 2;
                width: 50%;
                min-width: 130px;
                margin-bottom: 10px;
              }
            }
          }
        }
      }

      // @media screen and (max-width: 1280px) {
      //   .dashboard-wrap-overview_content_detail {
      //     &:last-child {
      //       ::v-deep {
      //         // .el-row {
      //         //   display: flex;
      //         //   justify-content: space-between;
      //         //   text-align: center;
      //         //   flex-wrap: wrap;

      //         .el-col {
      //           // flex: 1 2 50%;
      //           flex: 1;
      //           // flex-grow: 2;
      //           width: 25%;
      //           min-width: 130px;
      //           margin-bottom: 10px;
      //         }
      //       }
      //     }
      //   }
      // }

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
