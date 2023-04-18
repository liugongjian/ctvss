<template>
  <DashboardContainer title="告警处理">
    <div class="images" :style="`height:${height - 10}vh`">
      <div v-for="item in list" :key="item.timestamp" @click="openDialog(item)">
        <img :src="item.url">
      </div>
    </div>
    <div class="remain">剩余告警处理数: <span>{{ count }}</span></div>
    <DashboardAlertLiveDetailDialog v-if="dialog" :is-light="false" :confirm="true" theme="dashboard-alert-live-dialog" :audit="currentItem" @on-close="closeDialog" />
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import DashboardMixin from '../mixin/DashboardMixin'
import { AlertType, AlertLevel, AlertIcon } from '@/dics'
import DashboardContainer from './DashboardContainer.vue'
import { getAuditList } from '@/api/dashboard'
import DashboardLightContainer from './DashboardLightContainer.vue'
import DashboardAlertLiveDetailDialog from './DashboardAlertLiveDetailDialog.vue'

@Component({
  name: 'DashboardAlertLive',
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
  private count = 238

  @Prop({ default: false })
  private isLight?: boolean

  private get container() {
    return this.isLight ? 'DashboardLightContainer' : 'DashboardContainer'
  }

  private mounted() {
    this.setInterval(this.updateAuditList)
  }

  private async updateAuditList() {
    try {
      this.loading = true
      const res = await getAuditList({
        limit: 9
      })
      this.list = res.audit
    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
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
      deviceName: item.deviceName
    }
  }

  private closeDialog(isRefresh: boolean) {
    this.dialog = false
    if (isRefresh) {
      this.updateAuditList()
      this.count--
      if (this.count < 0) {
        this.count = 0
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .images {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;

    div {
      width: 30%;
      display: block;
      cursor: pointer;
      margin: 10px 0;
    }

    img {
      width: 100%;
      display: block;
    }
  }

  .remain {
    margin-bottom: 4vh;
    text-align: center;

    span {
      color: $primary;
      font-weight: bold;
    }
  }
</style>
