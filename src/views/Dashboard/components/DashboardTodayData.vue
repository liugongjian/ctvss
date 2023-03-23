<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-23 10:19:12
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-23 15:30:38
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
          <div id="pieChartStorage"></div>
        </div>

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
      const { offline, online, sum, unregistered } = res
      const data = {
        offline,
        online,
        sum,
        unregistered
      }
      this.pieDataToday = Object.keys(data).map((item)=>({
        type: item,
        value: data[item]
      }))

      

      this.drawPieToday()
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
      height: 300,
      width: 200
    })

    this.chartToday.data(this.pieDataToday)
    console.log('this.pieDataToday----->', this.pieDataToday)
    this.chartToday.coordinate('theta', {
      radius: 0.5,
      innerRadius: 0.3
    })

    this.chartToday.tooltip({
      showMarkers: false
    })

    this.chartToday
      .interval()
      .adjust('stack')
      .position('value')
      .color('type', ['#063d8a', '#1770d6', '#47abfc', '#38c060'])
      .style({ opacity: 0.4 })
      // .state({
      //   active: {
      //     style: (element) => {
      //       const shape = element.shape
      //       return {
      //         matrix: Util.zoom(shape, 1.1)
      //       }
      //     }
      //   }
      // })
      .label('type', (val) => {
        // const opacity = val === '四线及以下' ? 1 : 0.5
        return {
          offset: -10,
          style: {
            // opacity,
            fill: 'white',
            fontSize: 12,
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)'
          },
          content: (obj) => {
            return obj.type + '\n' + obj.value + '%'
          }
        }
      })

    this.chartToday.interaction('element-single-selected')

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
      display: flex;

      &_data {
        line-height: 30px;
        background-color: $color-grey-7;
        padding: 15px;
        border-radius: $border-radius;
        font-size: $text-size-medium;

        span {
          font-weight: bolder;
          font-size: $text-size-large;
        }
      }
    }
  }
}
</style>
