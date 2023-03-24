<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-23 10:19:12
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-24 09:06:12
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
        </div>
        <!-- <div class="dashboard-wrap-overview__item_content_detail">
          <div id="pieChartStorage"></div>
        </div> -->

        <div class="dashboard-wrap-overview__item_content_detail">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="dashboard-wrap-overview__item_content_data">
                实时上行带宽
                <span>{{ bandWidthData.realUpstreamBandwidth }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="dashboard-wrap-overview__item_content_data">
                上行流量峰值
                <span>{{ bandWidthData.upstreamBandwidth }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="dashboard-wrap-overview__item_content_data">
                实时下行带宽
                <span>{{ bandWidthData.realDownstreamBandwidth }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="dashboard-wrap-overview__item_content_data">
                下行流量峰值
                <span>{{ bandWidthData.downstreamBandwidth }}</span>
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

  private pieDataToday: any = []

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

  private mounted() {
    this.intervalTime = 10 * 60 * 1000
    this.setInterval(this.getData)
  }

  private getData() {
    this.getDevice()
    this.getBandwidth()
    this.getStorage()
  }

  private async getDevice() {
    try {
      const res = await getDeviceStates()
      console.log('res--getDeviceS--->', res)
      const { offline, online, sum, unregistered, deactivate } = res
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
      console.log('res--getBandwidthStates--->', res)
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
      console.log('res--getUserStorage--->', res)
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private drawPieToday() {
    this.chartToday = new Chart({
      container: 'pieChartToday',
      autoFit: true,
      height: 150,
      width: 250
    })

    this.chartToday.data(this.pieDataToday)

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
      .color('item')
      .label('percent', (percent) => {
        return {
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
            return `${this.pieTodayToText[data.item]}: ${(
              percent * 100
            ).toFixed(2)}%`
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

    this.chartToday.interaction('element-active')

    this.chartToday.render()
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
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      grid-gap: 10px;

      &_detail {
        // flex: 1;
      }

      &_data {
        line-height: 30px;
        background-color: $color-grey-7;
        padding: $padding-medium;
        border-radius: $border-radius;
        font-size: $text-size-medium;
        text-align: center;

        span {
          font-weight: bolder;
          font-size: $text-size-large;
        }
      }
    }
  }
}
</style>
