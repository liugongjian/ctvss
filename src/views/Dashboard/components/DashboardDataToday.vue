<template>
  <component :is="container" title="今日数据统计">
    <div class="dashboard-wrap-overview__item__card__content">
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">实时上行带宽</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num">{{ splitBandWidth(stats.realUpstreamBandwidth)[0] }}</span> {{ splitBandWidth(stats.realUpstreamBandwidth)[1] }}
        </p>
      </div>
      <div class="column-line" />
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">实时下行带宽</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num">{{ splitBandWidth(stats.realDownstreamBandwidth)[0] }}</span> {{ splitBandWidth(stats.realDownstreamBandwidth)[1] }}
        </p>
      </div>
      <div class="column-line" />
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">今日上行带宽峰值</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num">{{ splitBandWidth(stats.upstreamBandwidth)[0] }}</span> {{ splitBandWidth(stats.upstreamBandwidth)[1] }}
        </p>
      </div>
      <div class="column-line" />
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">今日下行带宽峰值</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num">{{ splitBandWidth(stats.downstreamBandwidth)[0] }}</span> {{ splitBandWidth(stats.downstreamBandwidth)[1] }}
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
      <div v-if="storageFlag" class="column-line" />
      <div v-if="storageFlag" class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">存储使用量</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num">{{ stats.usage.substr(0, stats.usage.length-2) }}</span>{{ stats.usage.substr(stats.usage.length-2, 2) }}
          <span> / {{ stats.total }}</span>
        </p>
      </div>
    </div>
  </component>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardLightContainer from './DashboardLightContainer.vue'
import DashboardMixin from '../mixin/DashboardMixin'
import { getDeviceStates, getBandwidthStates, getUserStorage } from '@/api/dashboard'
import { formatStorage, formatBandWidth } from '@/utils/number'

@Component({
  name: 'DashboardDataToday',
  components: {
    DashboardLightContainer
  }
})
export default class extends Mixins(DashboardMixin) {
  private stats: any = {
    realUpstreamBandwidth: '',
    realDownstreamBandwidth: '',
    upstreamBandwidth: '',
    downstreamBandwidth: '',
    sum: 0,
    online: 0,
    total: '',
    usage: ''
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
    this.getStorage()
  }

  /**
   * 获取带宽数据
   */
  private async getBandwidthStates() {
    const res = await getBandwidthStates(null)
    this.stats.realUpstreamBandwidth = formatBandWidth(res.realUpstreamBandwidth).toString()
    this.stats.realDownstreamBandwidth = formatBandWidth(res.realDownstreamBandwidth).toString()
    this.stats.upstreamBandwidth = formatBandWidth(res.upstreamBandwidth).toString()
    this.stats.downstreamBandwidth = formatBandWidth(res.downstreamBandwidth).toString()
  }

  /**
   * 获取设备数据
   */
  private async getDeviceStates() {
    const res = await getDeviceStates(null)
    const sum = Math.max(parseInt(res.sum), parseInt(res.online))
    const online = Math.min(parseInt(res.sum), parseInt(res.online))
    this.stats.sum = sum
    this.stats.online = online
  }

  private async getStorage() {
    const res = await getUserStorage({})
    this.stats.total = formatStorage(res.totalBytes)
    this.stats.usage = formatStorage(res.totalUsage)
  }

  private get storageFlag() {
    return this.$store.state.user.tags.showStorageUsage === 'Y'
  }

  private splitBandWidth(bandwidth) {
    return [bandwidth.substr(0, bandwidth.length - 4), bandwidth.substr(bandwidth.length - 4, bandwidth.length - 1)]
  }
}
</script>
