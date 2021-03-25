<!-- 设备管理页面中的三合一预览（实时、录像、截图）-->
<template>
  <div class="app-container">
    <div class="preview-wrap">
      <el-button class="btn-detail" @click="goToDetail"><svg-icon name="documentation" /> 查看设备详情</el-button>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane lazy label="实时预览" name="preview">
          <live-view
            v-if="activeName === 'preview'"
            :class="{'fullscreen': previewFullscreen.live}"
            :device-id="deviceId"
            :in-protocol="inProtocol"
            :is-fullscreen="previewFullscreen.live"
            @onFullscreen="previewFullscreen.live = true; fullscreen()"
            @onExitFullscreen="exitFullscreen()"
          />
        </el-tab-pane>
        <el-tab-pane lazy label="录像回放" name="replay">
          <replay-view
            v-if="activeName === 'replay'" ref="replayView"
            :class="{'fullscreen': previewFullscreen.replay}"
            :device-id="deviceId"
            :is-fullscreen="previewFullscreen.replay"
            @onFullscreen="previewFullscreen.replay = true; fullscreen()"
            @onExitFullscreen="exitFullscreen()"
          />
        </el-tab-pane>
        <el-tab-pane v-if="false" label="监控截图" name="snapshot">
          <el-date-picker
            v-model="snapshotRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
          <div class="snapshot-list">
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
            <div class="snapshot-item">
              <div class="img" />
              <span>{{ dateFormat(1594260926566) }}</span>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <SetRecordTemplate v-if="setRecordTemplateDialog" @on-close="closeSetRecordTemplateDialog" />
    <SetSnapshotTemplate
      v-if="setSnapshotTemplateDialog"
      @on-close="closeSetScrrenCutTemplateDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Inject, Watch } from 'vue-property-decorator'
import { dateFormatInTable, dateFormat } from '@/utils/date'
import FullscreenMixin from './mixin/fullscreenMixin'
import SetRecordTemplate from '../components/dialogs/SetRecordTemplate.vue'
import SetSnapshotTemplate from '../components/dialogs/SetSnapshotTemplate.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import ReplayView from './components/ReplayView.vue'
import LiveView from './components/LiveView.vue'

@Component({
  name: 'DevicePreview',
  components: {
    SetRecordTemplate,
    SetSnapshotTemplate,
    StatusBadge,
    ReplayView,
    LiveView
  }
})
export default class extends Mixins(FullscreenMixin) {
  @Inject('deviceRouter') private deviceRouter!: Function
  private dateFormatInTable = dateFormatInTable
  private dateFormat = dateFormat
  private activeName = 'preview'
  private snapshotRange = null
  private template = {
    snapshotTemplate: '123'
  }
  private setRecordTemplateDialog = false
  private setSnapshotTemplateDialog = false
  private previewFullscreen = {
    live: false,
    replay: false
  }

  private get deviceId() {
    return this.$route.query.deviceId
  }

  private get inProtocol() {
    return this.$route.query.inProtocol
  }

  @Watch('$route.query')
  private onRouterChange() {
    this.activeName = 'preview'
  }

  private mounted() {
    if (this.$route.query.previewTab) this.activeName = this.$route.query.previewTab.toString()
    this.$nextTick(this.resizeReplayVideo)
    window.addEventListener('resize', this.resizeReplayVideo)
    window.addEventListener('resize', this.checkFullscreen)
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.resizeReplayVideo)
    window.removeEventListener('resize', this.checkFullscreen)
  }

  /**
   * 检查是否全屏
   */
  public checkFullscreen() {
    const doc: any = document
    const isFullscreen = !!(doc.webkitIsFullScreen || doc.mozFullScreen || doc.msFullscreenElement || doc.fullscreenElement)
    this.previewFullscreen = {
      live: isFullscreen,
      replay: isFullscreen
    }
  }

  private goToDetail() {
    this.deviceRouter({
      id: this.deviceId,
      type: 'detail'
    })
  }

  /**
   * 设置播放器大小
   */
  private resizeReplayVideo() {
    const replayView: any = this.$refs.replayView
    if (!replayView) return
    const $replayView = replayView.$el
    const playerSize = $replayView.getBoundingClientRect()
    const documentHeight = document.body.offsetHeight
    $replayView.style.height = `${documentHeight - playerSize.top - 50}px`
  }

  private handleClick(tab: any) {
    this.activeName = tab.name
    this.$nextTick(this.resizeReplayVideo)
  }

  private setRecordTemplate() {
    this.setRecordTemplateDialog = true
  }

  private setScrrenCutTemplate() {
    this.setSnapshotTemplateDialog = true
  }

  private closeSetRecordTemplateDialog() {
    this.setRecordTemplateDialog = false
  }

  private closeSetScrrenCutTemplateDialog() {
    this.setSnapshotTemplateDialog = false
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

  .device-list__title {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid $borderGrey;
    padding: 0 15px;
  }

  .device-list {
    padding: 10px;
    ::v-deep .status-badge {
      width: 6px;
      height: 6px;
    }
  }

  .preview-wrap {
    position: relative;
    padding-top: 6px;
    .btn-detail {
      position: absolute;
      top: -12px;
      right: 0;
      z-index: 9;
    }
    .replay-view {
      display: flex;
      flex-direction: column;
      ::v-deep .replay-player {
        flex: 1;
      }
    }
  }

  .snapshot-list {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10px;
    .snapshot-item {
      position: relative;
      width: 25%;
      span {
        position: absolute;
        bottom: 20px;
        left: 20px;
      }
      .img {
        background: #eee;
        margin: 10px;
        min-height: 200px;
      }
    }
  }

  .fullscreen ::v-deep .preview-player .video-wrap, .fullscreen.replay-view {
    position: fixed;
    z-index: 1001;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100% !important;
    background: #333;
  }

  .fullscreen.replay-view {
    ::v-deep .filter-container {
      display: none;
    }
  }

  .fullscreen ::v-deep .preview-player video {
    position: absolute;
    height: 100%;
  }

  .fullscreen ::v-deep .preview-player canvas {
    position: absolute;
    width: 100%;
  }

  .fullscreen ::v-deep .preview-player .video-wrap {
    max-height: 100%;
  }
</style>
