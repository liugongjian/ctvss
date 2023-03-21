<template>
  <div
    v-droppable="getDropCallback()"
    class="screen-item"
    :data-index="itemIndex"
    :class="{ 'screen-item--fullscreen': isFullscreen, 'screen-item--live': isLive, 'screen-item--replay': !isLive }"
    @click="click"
  >
    <template v-if="screen.deviceId">
      <LivePlayer
        v-if="screen.isLive"
        :key="screen.key"
        :screen="screen"
        :has-close="hasClose"
        :is-debug="false"
        :has-live-replay-selector="hasReplayRecord && !isSingle"
        @canplay="canplay"
        @close="close"
      >
        <div v-if="videoTypeLabel && !screen.isLoading && screen.player" class="video-type-label">{{ videoTypeLabel }}</div>
      </LivePlayer>
      <ReplayPlayer
        v-else
        :key="screen.key"
        :screen="screen"
        :has-axis="hasAxis"
        :has-close="hasClose"
        :is-debug="false"
        :has-live-replay-selector="!isSingle"
        :is-car-task="isCarTask"
        @close="close"
      >
        <div v-if="videoTypeLabel && !screen.isLoading && screen.player" class="video-type-label">{{ videoTypeLabel }}</div>
      </ReplayPlayer>
    </template>
    <div v-else class="tip-text tip-select-device">
      <el-button type="text" size="mini" @click="selectDevice">请选择设备</el-button>
    </div>
    <device-dir v-if="dialogs.deviceDir" @on-close="onDeviceDirClose" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import { checkPermission } from '@vss/base/utils/permission'
import { ScreenManager } from '@vss/device/services/Screen/ScreenManager'
import screenLogManager from '@vss/device/services/Screen/ScreenLogManager'
import LivePlayer from '../LivePlayer.vue'
import ReplayPlayer from '../ReplayPlayer/index.vue'
import DeviceDir from '../DeviceDir.vue'
import { droppable } from './droppable'

@Component({
  name: 'ScreenItem',
  directives: {
    'droppable': droppable
  },
  components: {
    LivePlayer,
    ReplayPlayer,
    DeviceDir
  }
})
export default class extends Vue {
  @Prop()
  private screen

  @Prop()
  private itemIndex

  @Prop({
    default: true
  })
  private hasClose

  @Prop({
    default: false
  })
  private isSingle

  private dialogs = {
    deviceDir: false
  }

  @Inject('getScreenManager')
  private getScreenManager: Function

  private get screenManager(): ScreenManager {
    return this.getScreenManager()
  }

  private get hasReplayRecord() {
    return checkPermission(['ReplayRecord'])
  }

  /**
   * 在实时预览显示录像回放的标签
   * 在录像回放显示实时预览的标签
   */
  private get videoTypeLabel() {
    let label = ''
    if (this.screen.isLive !== null && this.screenManager.isLive !== this.screen.isLive) {
      label = this.screen.isLive ? '实时画面' : '回放画面'
    }
    return label
  }

  /**
   * 在实时预览页面中显示录像回放时间轴
   */
  private get hasAxis() {
    return this.screenManager.isLive && !this.screen.isLive
  }

  /**
   * 是否开启全屏
   */
  private get isFullscreen() {
    return this.screen && this.screen.isFullscreen
  }

  /**
   * 是否为直播
   */
  private get isLive() {
    return this.screen && this.screen.isLive
  }

  /**
   * 是否是车辆管理的录像回放，是则隐藏下载功能
   */
  private get isCarTask() {
    return this.screenManager.isCarTask
  }

  private getVueComponent() {
    return this
  }

  /**
   * 获取拖拽元素拖入drop后触发回调
   */
  private getDropCallback() {
    return function(itemIndex, nodeData) {
      this.$emit('drop', nodeData, itemIndex)
    }.bind(this, this.itemIndex)
  }

  /**
   * 关闭视频
   */
  private close() {
    this.screen.destroy()
  }

  /**
   * 单击视频
   */
  private click() {
    this.$emit('click')
  }

  /**
   * 选择视频
   * @param screen 视频
   */
  private selectDevice() {
    this.dialogs.deviceDir = true
  }

  /**
   * 关闭视频选择对话框
   * @param device 设备
   */
  private onDeviceDirClose(item) {
    this.dialogs.deviceDir = false
    if (item) {
      this.screenManager.openTreeItem(item)
    }
  }

  /**
   * 加载完成可以开始播放
   */
  private canplay() {
    if (this.screen.isLive) {
      screenLogManager.addLog(this.screen)
    }
  }
}
</script>
