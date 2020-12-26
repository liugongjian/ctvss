<template>
  <div class="app-container">
    <el-page-header content="流列表" @back="back" />
    <div class="preview-player">
      <player
        ref="video"
        type="rtmp"
        :url="form.playUrl"
        :auto-play="true"
        :is-ws="true"
        :is-live="true"
        :is-fullscreen="false"
        :has-control="false"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import FullscreenMixin from '@/views/device/mixin/fullscreenMixin'
import { Stream } from '@/type/stream'
import { getStream } from '@/api/stream'
import Player from '../device/components/Player.vue'

@Component({
  name: 'StreamPreview',
  components: {
    Player
  }
})
export default class extends Mixins(FullscreenMixin) {
  private deviceId = ''
  private groupId = ''
  private previewFullscreen = {
    live: false,
    replay: false
  }
  private form: Stream = {
    deviceId: ''
  }
  private async created() {
    let query: any = this.$route.query
    if (query.deviceId) {
      this.deviceId = query.deviceId
      this.groupId = query.groupId
      try {
        const res = await getStream({ deviceId: this.deviceId })
        this.form = res
      } catch (e) {
        this.$message.error(e && e.message)
      }
    }
  }

  private back() {
    this.$router.push({
      path: '/stream'
    })
  }
}
</script>
<style lang="scss" scoped>
</style>
