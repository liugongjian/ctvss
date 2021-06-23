<template>
  <div class="app-container">
    <el-page-header content="流列表" @back="back" />
    <div class="preview-wrap">
      <player-container :on-can-play="onCanPlay">
        <live-view
          :class="{'fullscreen': isFullscreen}"
          :device-id="deviceId"
          type="stream"
          :is-fullscreen="isFullscreen"
          @onCanPlay="playEvent"
          @onFullscreen="isFullscreen = true; fullscreen()"
          @onExitFullscreen="exitFullscreen()"
        />
      </player-container>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import FullscreenMixin from '@/views/device/mixin/fullscreenMixin'
import LiveView from '../device/components/LiveView.vue'
import PlayerContainer from './components/PlayerContainer.vue'

@Component({
  name: 'StreamPreview',
  components: {
    LiveView,
    PlayerContainer
  }
})
export default class extends Mixins(FullscreenMixin) {
  private deviceId = ''
  private groupId = ''
  private onCanPlay = false

  private async created() {
    let query: any = this.$route.query
    if (query.deviceId) {
      this.deviceId = query.deviceId
      this.groupId = query.currentGroupId
    }
  }

  private mounted() {
    window.addEventListener('resize', this.checkFullscreen)
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.checkFullscreen)
  }

  private back() {
    this.$router.push({
      path: '/stream'
    })
  }

  private playEvent(val: boolean) {
    this.onCanPlay = val
  }
}
</script>
<style lang="scss" scoped>
  .app-container {
    ::v-deep {
      .info-list__title {
        margin: 10px 5px 0 5px;
      }
    }
  }
  .fullscreen ::v-deep .preview-player .video-wrap {
    position: fixed;
    z-index: 1001;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100% !important;
    background: #333;
  }
</style>
