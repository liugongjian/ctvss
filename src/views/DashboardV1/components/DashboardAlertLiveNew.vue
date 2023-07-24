<template>
  <component :is="container" title="今日AI告警" :less-padding="true">
    <div ref="imgListContainer" class="stats-container" :style="`height:${heigh}px;padding-top:${ list.length === 0 ? '80' : '0'}px`">
      <div v-if="noAlarmTody" class="svg-container">
        <img :src="require('@/icons/svg/empty.svg')" alt="">
      </div>
      <div v-if="noAlarmTody" class="empty-text">今日无任何告警</div>
      <ul ref="imgList" v-loading="loading && !list.length" class="alert-list" :class="{ 'light': isLight }">
        <el-divider v-if="noAlarmTody">历史告警</el-divider>
        <li v-for="(item, index) in list" :key="index" :class="{ 'new-alert': item.isNew }" class="alert-list__item" @click="openDialog(item)">
          <div class="alert-list__item__pic">
            <el-image :src="item.imageThumbnail" />
          </div>
          <div class="alert-list__item__info">
            <div>{{ item.appName }}</div>
            <div>{{ item.deviceName }}</div>
            <div>{{ item.captureTime2 }}</div>
          </div>
        </li>
      </ul>
      <slot name="footer"></slot>
      <audio ref="audio" :src="alertFile" preload="auto" />
      <PicDialogue v-if="dialog" :alarms="list" :current-index.sync="currentIndex" :visible.sync="dialog" />
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
import PicDialogue from '@/views/Alarm/AI/components/PicDialogue.vue'
import { getAiAlarms } from '@/api/ai-app'

@Component({
  name: 'DashboardAlertLiveNew',
  components: {
    DashboardContainer,
    DashboardAlertLiveDetailDialog,
    DashboardLightContainer,
    PicDialogue
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
  private noAlarmTody = false
  private heigh = 200

  private currentIndex = 0

  @Prop({ default: false })
  private isLight?: boolean

  private get container() {

    return this.isLight ? 'DashboardLightContainer' : 'DashboardContainer'
  }

  private mounted() {

    this.muteSound()
    const userTags = this.$store.state.user.tags
    // 特殊音效
    if (userTags.isSpecialAINotice === 'Y') {
      this.alertFile = require('@/assets/dashboard/alert3.mp3')
    } else {
      this.alertFile = require('@/assets/dashboard/alert.mp3')
    }
    this.setInterval(this.updateAlarmList)

    window.onload = () => this.calcHeight()
  }



  /**
 * 得到N天前的时间戳
 */
  public getDateBefore(dayCount) {
    const dd = new Date()
    dd.setDate(dd.getDate() - dayCount)
    const time = dd.setHours(0, 0, 0)
    return time
  }

  private async updateAlarmList() {
    try {
      let list = []
      this.loading = true
      const param = {
        startTime: (new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000).toFixed(),
        endTime: (new Date().getTime() / 1000).toFixed(),
        pageSize: 10,
        pageNum: 1
      }
      const res = await getAiAlarms(param)
      this.noAlarmTody = res.analysisResults.length === 0
      if (this.noAlarmTody) {
        const res1 = await getAiAlarms({ pageSize: 10, pageNum: 1 })
        list = res1.analysisResults
      } else {
        list = res.analysisResults
      }

      const isUpdated = this.checkAlarmsUpdated(list)

      if (isUpdated){
        this.list = list.map(item => ({ ...item, captureTime2: format(fromUnixTime(item.captureTime), 'yyyy-MM-dd HH:mm:ss') }))
        this.list.length > 0 && this.playSound()
        this.calcHeight()
      }

    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  private calcHeight(){
    const left: any = document.getElementsByClassName('dashboard-wrap-overview__left')[0]
    const totalHeight = left.offsetHeight
    this.heigh = totalHeight - 500
  }

  private checkAlarmsUpdated(alarms){
    if ( this.list.length === 0 || alarms.length === 0 ){
      return true
    }
    const idOrigin = this.list[0].captureTime + this.list[0].deviceID + this.list[0].appID
    const idNew = alarms[0].captureTime + alarms[0].deviceID + alarms[0].appID
    return idOrigin !== idNew
  }

  private playSound(){
    const audio: any = this.$refs.audio
    audio.muted = false
    audio.play()
  }

  private muteSound(){
    const audio: any = this.$refs.audio
    audio.muted = true
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
    this.currentIndex = this.list.findIndex(i => i.image === item.image)
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
  .svg-container{
    margin-top: 15px;
    height: 30px;
    display: flex;
    justify-content: center;
    color:#F2F2F2;
  }
  .empty{
    width: 40px;
    height: 25px;
  }
  .empty-text{
    margin-top: 20px;
    margin-bottom: 15px;
  }

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
  .el-divider--horizontal{
      background: 0 0;
      border-top: 1px dashed #17181a;
  }

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
      margin-left: 10px;
    }
  }
}
</style>
