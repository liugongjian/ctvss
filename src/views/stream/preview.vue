<template>
  <div class="app-container">
    <el-page-header content="流列表" @back="back" />
    <live-view
      :class="{'fullscreen': previewFullscreen.live}"
      :device-id="deviceId"
      :is-fullscreen="previewFullscreen.live"
      @onFullscreen="previewFullscreen.live = true; fullscreen()"
      @onExitFullscreen="exitFullscreen()"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator'
import { RecordTemplate } from '@/type/template'
import FullscreenMixin from '@/views/device/mixin/fullscreenMixin'
import LiveView from '@/views/device/components/LiveView.vue'

@Component({
  name: 'StreamPreview',
  components: {
    LiveView
  }
})
export default class extends Mixins(FullscreenMixin) {
  private deviceId = ''
  private previewFullscreen = {
    live: false,
    replay: false
  }
  private created() {
    let query: any = this.$route.query
    if (query.deviceId) {
      this.deviceId = query.deviceId
    }
  }
  private back() {
    this.$router.push('/stream')
  }
}
</script>
<style lang="scss" scoped>
</style>
