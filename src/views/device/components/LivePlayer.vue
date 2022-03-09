<template>
  <VssPlayer
    v-if="screen.url"
    ref="player"
    v-loading="screen.loading"
    :url="screen.url"
    :type="screen.type"
    :codec="screen.codec"
    :device-info="screen.deviceInfo"
    :stream-info="screen.streamInfo"
    :is-debug="true"
    :is-auto-play="true"
    :is-live="true"
    :is-ws="true"
    @dispatch="onDispatch"
  />
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { PlayerEvent } from '@/components/VssPlayer/models/VssPlayer.d'
import Screen from '../models/Screen'
import VssPlayer from '@/components/VssPlayer/index.vue'

@Component({
  name: 'LivePlayer',
  components: {
    VssPlayer
  }
})
export default class extends Vue {
  @Prop()
  private screen: Screen

  @Watch('screen')
  private onScreenChange() {
    this.screen.type = 'flv'
    this.screen.getUrl()
  }

  /**
   * 播放器事件路由
   */
  private onDispatch(event: PlayerEvent) {
    switch (event.eventType) {
      case 'streamNumChange':
        this.onStreamNumChange(event.payload)
        break
    }
  }

  /**
   * 切换主子码流
   */
  private onStreamNumChange(streamNum: number) {
    console.log(streamNum)
    this.screen.streamInfo.streamNum = streamNum
    this.screen.getUrl()
  }
}
</script>
<style lang="scss" scoped>
</style>
