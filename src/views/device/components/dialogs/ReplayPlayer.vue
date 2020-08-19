<template>
  <el-dialog
    title="录像回放"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    fullscreen
    class="video-player"
    @close="closeDialog"
  >
    <player v-if="dialogVisible" ref="video" :type="type" :url="video.hls" :auto-play="true" :on-time-update="onTimeUpdate" />
    <div class="current-time">{{ dateFormat(currentTime) }}</div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { dateFormat } from '@/utils/date'
import Player from '@/views/components/Player.vue'

@Component({
  name: 'ReplayPlayer',
  components: {
    Player
  }
})
export default class extends Vue {
  @Prop()
  private video?: any

  private dialogVisible = true
  private currentTime?: Date | null = null
  private dateFormat = dateFormat

  private get type() {
    return this.video.type === 'h265' ? 'h265-hls' : 'hls'
  }

  private onTimeUpdate() {
    const $video: any = this.$refs.video
    if ($video) {
      const currentTimestamp = this.video.startAt + $video.player.player.currentTime * 1000
      this.currentTime = new Date(currentTimestamp)
    }
  }

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }
}
</script>
<style lang="scss" scoped>
  .video-player {
    margin: 3%;
    ::v-deep .el-dialog {
      display: flex;
      flex-direction: column;
    }
    ::v-deep .el-dialog__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding-top: 10px;
    }
    .video-wrap {
      flex: 1;
    }
  }

  ::v-deep .video-wrap {
    width: 100%;
    height: 0;
    flex: 1;
    video {
      width: 100%;
      height: 100%;
      background: #000;
    }
  }

  .current-time {
    font-size: 16px;
    font-weight: bold;
    padding: 0 15px;
    color: #fff;
    height: 50px;
    line-height: 50px;
    background: #000;
  }
</style>
