<template>
  <div
    class="screen-list"
  >
    <div class="screen-wrap" :class="`screen-size--${size}`">
      <ScreenItem
        v-for="(screen, index) in screenList"
        :key="index"
        :screen="screen"
        :style="`grid-area: item${index}`"
        :class="[{'actived': index === currentIndex && screenList.length > 1}]"
        @click="selectScreen(index)"
        @openScreen="openScreen"
      />
    </div>
    <ScreenTools />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Provide } from 'vue-property-decorator'
import { ScreenManager } from '@/views/device/models/Screen/ScreenManager'
import { VGroupModule } from '@/store/modules/vgroup'
import ScreenItem from './ScreenItem.vue'
import ScreenTools from './ScreenTools.vue'

@Component({
  name: 'ScreenBoard',
  components: {
    ScreenItem,
    ScreenTools
  }
})
export default class extends Vue {
  @Prop({
    default: true
  })
  private isLive: boolean

  @Prop()
  private inProtocol: string

  /* 分屏管理器 */
  public screenManager: ScreenManager = null

  /* 分屏列表 */
  private get screenList() {
    return this.screenManager && this.screenManager.screenList
  }

  /* 当前选中的索引 */
  private get currentIndex() {
    return this.screenManager && this.screenManager.currentIndex
  }

  /* 分屏数 */
  private get size() {
    return this.screenManager && this.screenManager.size
  }

  /* 获取分屏管理器Provide */
  @Provide('getScreenManager')
  private getScreenManager() {
    return this.screenManager
  }

  private mounted() {
    this.screenManager = new ScreenManager({
      size: 4,
      isLive: this.isLive
    })
  }

  /**
   * 打开分屏视频
   */
  public async openScreen(item: any, streamNum?: number) {
    // TODO: 放到screen manager里
    // if (this.polling.isStart) {
    //   this.$message({
    //     message: '请先关闭轮巡再进行选择',
    //     type: 'warning'
    //   })
    //   return
    // }
    // 设置虚拟业务组相关信息
    VGroupModule.SetRoleID(item.roleId || '')
    VGroupModule.SetRealGroupId(item.realGroupId || '')
    VGroupModule.SetRealGroupInProtocol(item.realGroupInProtocol || '')

    if (item.type === 'ipc' && item.deviceStatus === 'on') {
      const screen = this.screenList[this.currentIndex]
      // 如果当前分屏已有播放器，先执行销毁操作
      if (screen.deviceInfo.deviceId) {
        screen.destroy()
      }
      screen.isInitialized = true
      screen.type = 'flv'
      screen.isLive = false
      screen.deviceInfo = {
        inProtocol: this.inProtocol,
        deviceId: item.id,
        deviceName: item.label,
        roleId: item.roleId || '',
        realGroupId: item.realGroupId || '',
        realGroupInProtocol: item.realGroupInProtocol || ''
      }
      screen.streamInfo.streamSize = item.multiStreamSize
      screen.streamInfo.streams = item.deviceStreams
      if (streamNum && !isNaN(streamNum)) {
        screen.streamInfo.streamNum = streamNum
      } else {
        screen.streamInfo.streamNum = item.autoStreamNum
      }
      if (this.currentIndex < this.size - 1) {
        this.screenManager.currentIndex++
      }
      screen.init()
    }
  }

  /**
   * 选择分屏
   */
  public selectScreen(index: number) {
    this.screenManager.currentIndex = index
  }
}
</script>
