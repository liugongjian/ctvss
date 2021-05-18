<template>
  <component :is="container" title="今日数据统计">
    <div class="dashboard-wrap-overview__item__card__content">
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">实时上行带宽</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num">{{ stats.realUpstreamBandwidth }}</span> Mbps
        </p>
      </div>
      <div class="column-line" />
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">实时下行带宽</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num">{{ stats.realDownstreamBandwidth }}</span> Mbps
        </p>
      </div>
      <div class="column-line" />
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">今日上行流量峰值</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num">{{ stats.upstreamBandwidth }}</span> Mbps
        </p>
      </div>
      <div class="column-line" />
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">今日下行流量峰值</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num">{{ stats.downstreamBandwidth }}</span> Mbps
        </p>
      </div>
      <div class="column-line" />
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">在线设备数</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num dashboard-wrap-overview__num__light">{{ stats.online }}</span>
          <span> / {{ stats.sum }}</span>
        </p>
      </div>
    </div>
  </component>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardLightContainer from './DashboardLightContainer.vue'
import DashboardMixin from '../mixin/DashboardMixin'
import { getDeviceStates, getBandwidthStates } from '@/api/dashboard'

@Component({
  name: 'DashboardDataToday',
  components: {
    DashboardLightContainer
  }
})
export default class extends Mixins(DashboardMixin) {
  private stats: any = {
    realUpstreamBandwidth: 0,
    realDownstreamBandwidth: 0,
    upstreamBandwidth: 0,
    downstreamBandwidth: 0,
    sum: 0,
    online: 0
  }
  private get container() {
    return 'DashboardLightContainer'
  }

  private mounted() {
    this.intervalTime = 10 * 60 * 1000
    this.setInterval(this.getData)
  }

  /**
   * 获取数据
   */
  private getData() {
    this.getDeviceStates()
    this.getBandwidthStates()
  }

  /**
   * 获取带宽数据
   */
  private async getBandwidthStates() {
    const res = await getBandwidthStates(null)
    this.stats['realUpstreamBandwidth'] = res.realUpstreamBandwidth
    this.stats['realDownstreamBandwidth'] = res.realDownstreamBandwidth
    this.stats['upstreamBandwidth'] = res.upstreamBandwidth
    this.stats['downstreamBandwidth'] = res.downstreamBandwidth
  }

  /**
   * 获取设备数据
   */
  private async getDeviceStates() {
    const res = await getDeviceStates(null)
    const sum = Math.max(parseInt(res.sum), parseInt(res.online))
    const online = Math.min(parseInt(res.sum), parseInt(res.online))
    this.stats['sum'] = sum
    this.stats['online'] = online
  }
}
</script>
