<template>
  <component :is="container" title="实时告警信息" :less-padding="true">
    <ul v-loading="loading && !list.length" class="alert-list" :class="{ 'light': isLight }" :style="`height:${height}vh`">
      <div v-if="!list.length && !loading" class="empty-text">暂无数据</div>
      <li v-for="item in list" :key="item.id" :class="{ 'new-alert': item.isNew }" @click="openDialog(item)">
        <div class="alert-list__level" :class="`alert-list__level--${item.level}`">
          <svg-icon :name="alertIcon[item.level]" />
          {{ alertLevel[item.level] }}
        </div>
        <div class="alert-list__type">{{ alertType[item.event] }}</div>
        <div class="alert-list__datetime">{{ item.formatedTime }}</div>
      </li>
    </ul>
    <audio ref="audio" :src="alertFile" preload="auto" />
    <DashboardAlertLiveDetailDialog v-if="dialog" :is-light="isLight" theme="dashboard-alert-live-dialog" :audit="currentItem" @on-close="closeDialog" />
  </component>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import DashboardMixin from '../mixin/DashboardMixin'
import { AlertType, AlertLevel, AlertIcon } from '@/dics'
import DashboardContainer from './DashboardContainer.vue'
import { getAuditList } from '@/api/dashboard'
import { dateFormat, getTimestamp } from '@/utils/date'
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
    this.setInterval(this.updateAuditList)
  }

  private async updateAuditList() {
    try {
      this.loading = true
      const res = await getAuditList({
        limit: 6
      })
      this.list = res.Result
      this.list.forEach((item: any) => {
        item.id = Math.random().toString(16).slice(-10)
        item.level = this.checkLevel(item)
        item.isNew = this.lastTime && (getTimestamp(item.timeStamp) > this.lastTime)
        item.formatedTime = dateFormat(new Date(getTimestamp(item.timeStamp)), 'MM-dd HH:mm:ss')
      })
      if (this.list.some((item: any) => item.isNew)) {
        const audio: any = this.$refs.audio
        audio.play()
      }
      if (this.list.length) {
        this.lastTime = getTimestamp(this.list[0].timeStamp)
      }
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

.alert-list {
  min-height: 180px;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  // justify-content: space-between;
  justify-content: flex-start;

  li {
    // flex: 1;
    height: 16.6%;
    display: flex;
    align-items: center;
    padding: 0.4rem;
    color: #d8d8d8;
    cursor: pointer;

    &:hover {
      background: #052777;
    }
  }

  &__level {
    width: 30%;

    &--normal {
      color: #f4c46c;
    }

    &--serious {
      color: #ff4949;
    }
  }

  &__datetime {
    flex: 1;
    text-align: right;
  }

  .new-alert {
    animation: shining 2s;
    border-radius: 5px;
  }

  &.light {
    li {
      height: 30px;
      color: $text;

      &:hover {
        background: #f5f7fa;
      }
    }
  }
}
</style>
