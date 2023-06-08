<template>
  <component :is="container" title="实时告警信息" :less-padding="true">
    <div class="stats-container">
      <ul v-loading="loading && !list.length" class="alert-list" :class="{ 'light': isLight }" :style="`height:${height}vh`">
        <div v-if="!list.length && !loading" class="empty-text">暂无数据</div>
        <li v-for="item in list" :key="item.image" :class="{ 'new-alert': item.isNew }" class="alert-list__item" @click="openDialog(item)">
          <div class="alert-list__item__pic">
            <el-image :src="item.image" />
          </div>
          <div class="alert-list__item__info">
            <div>{{ item.appName }}</div>
            <div>{{ item.deviceName }}</div>
            <div>{{ item.captureTime }}</div>
          </div>
        </li>
      </ul>
      <audio ref="audio" :src="alertFile" preload="auto" />
      <DashboardAlertLiveDetailDialog v-if="dialog" :is-light="isLight" theme="dashboard-alert-live-dialog" :audit="currentItem" @on-close="closeDialog" />
    </div>
  </component>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import DashboardMixin from '../mixin/DashboardMixin'
import { AlertType, AlertLevel, AlertIcon } from '@/dics'
import DashboardContainer from './DashboardContainer.vue'
import DashboardLightContainer from './DashboardLightContainer.vue'
import DashboardAlertLiveDetailDialog from './DashboardAlertLiveDetailDialog.vue'
import { fromUnixTime, format } from 'date-fns'

@Component({
  name: 'DashboardAlertLiveNew',
  components: {
    DashboardContainer,
    DashboardAlertLiveDetailDialog,
    DashboardLightContainer
  }
})
export default class extends Mixins(DashboardMixin) {
  private alertType = AlertType
  private alertLevel = AlertLevel
  private alertIcon = AlertIcon
  private currentItem: any = null
  private loading = true
  private dialog = false
  private list: any = []
  public intervalTime = 15 * 1000
  private lastTime: any = null
  private alertFile = null

  @Prop({ default: false })
  private isLight?: boolean

  private get container() {
    return this.isLight ? 'DashboardLightContainer' : 'DashboardContainer'
  }

  private mounted() {
    const userTags = this.$store.state.user.tags
    // 特殊音效
    if (userTags.isSpecialAINotice === 'Y') {
      this.alertFile = require('@/assets/dashboard/alert3.mp3')
    } else {
      this.alertFile = require('@/assets/dashboard/alert.mp3')
    }
    this.setInterval(this.updateAlarmList)
  }

  private async updateAlarmList() {
    try {
      this.loading = true
      const list = [{
        algoCode: '10014', captureTime: 1685514698, appName: 'app1', algoName: 'xxx', deviceName: '的', image: 'https://vaas.cn-guianxinqu-1.ctyunxs.cn/vss-test-refactor-rai_test01-1/682033951851757568/ai/2023-03-10/20230310-164045-e4ef7e8f-9e0b-4ab2-8611-af509622efb9.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1ZMJJ907IRQO5R2C4G6S%2F20230607%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20230607T082442Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=095a0344e8d14c37d998b488e435a68546d90bb5d50154948c41d87961ae33cc'
      }, {
         algoCode: '10014', captureTime: 1685514698, appName: 'app2', algoName: 'xxx', deviceName: 'd2', image: 'https://vaas.cn-guianxinqu-1.ctyunxs.cn/vss-test-refactor-rai_test01-1/682033951851757568/ai/2023-03-10/20230310-164045-e4ef7e8f-9e0b-4ab2-8611-af509622efb9.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1ZMJJ907IRQO5R2C4G6S%2F20230607%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20230607T082442Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=095a0344e8d14c37d998b488e435a68546d90bb5d50154948c41d87961ae33cc'
      }, {
        algoCode: '10014', captureTime: 1685514698, appName: 'app3',  algoName: 'xxx', deviceName: 'd3', image: 'https://vaas.cn-guianxinqu-1.ctyunxs.cn/vss-test-refactor-rai_test01-1/682033951851757568/ai/2023-03-10/20230310-164045-e4ef7e8f-9e0b-4ab2-8611-af509622efb9.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1ZMJJ907IRQO5R2C4G6S%2F20230607%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20230607T082442Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=095a0344e8d14c37d998b488e435a68546d90bb5d50154948c41d87961ae33cc'
      }, {
         algoCode: '10014', captureTime: 1685514698, appName: 'app3',  algoName: 'xxx', deviceName: 'd4', image: 'https://vaas.cn-guianxinqu-1.ctyunxs.cn/vss-test-refactor-rai_test01-1/682033951851757568/ai/2023-03-10/20230310-164045-e4ef7e8f-9e0b-4ab2-8611-af509622efb9.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1ZMJJ907IRQO5R2C4G6S%2F20230607%2Fdefault%2Fs3%2Faws4_request&X-Amz-Date=20230607T082442Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=095a0344e8d14c37d998b488e435a68546d90bb5d50154948c41d87961ae33cc'
      }]
      this.list = list.map(item => ({ ...item, captureTime: format(fromUnixTime(item.captureTime), 'yyyy-MM-dd HH:mm:ss') }))

    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  private checkLevel(data: any) {
    if (data.event === '2' && JSON.parse(data.metaData).result.length <= 10) {
      return 'normal'
    } else {
      return 'serious'
    }
  }

  private openDialog(item: any) {
    this.dialog = true
    this.currentItem = {
      event: item.event,
      streamName: item.streamName,
      timestamp: item.timeStamp,
      metaData: item.metaData,
      url: item.url,
      deviceName: item.deviceName,
      appName: item.appName
    }
  }

  private closeDialog() {
    this.dialog = false
  }
}
</script>
<style lang="scss" scoped>
.widder-padding {
  padding: 2.7vh 4vw 4vh !important;
}
.stats-container{
  min-width: 360px;
  overflow:auto;
}

.alert-list {
  min-height: 180px;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  // justify-content: space-between;
  justify-content: flex-start;

  &__item{
    display: flex;
    justify-content: space-around;
    margin-bottom: 10px;
    cursor: pointer;
    &__pic{
      width: 175px;
    }
    &__info{
      display: flex;
      flex-direction: column;
      justify-content: space-around;
    }
  }
}
</style>
