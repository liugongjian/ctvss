<template>
  <div />
</template>
<script lang="ts">
import { Screen } from '@/views/device/services/Screen/Screen'
import { pick } from 'lodash'
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'QueueExecutor'
})
export default class extends ComponentMixin {
  private currentExecuteIndex = 0
  private timer: NodeJS.Timeout

  /* 视频队列 */
  private get devicesQueue() {
    return this.screenManager.devicesQueue
  }

  /* 播放器列表 */
  private get screenList() {
    return this.screenManager.screenList
  }

  /* 配置轮巡 */
  private set pollingStatus(val) {
    this.screenManager.executeQueueConfig.status = val
  }

  /* 轮巡状态 */
  private get pollingStatus() {
    return this.screenManager.executeQueueConfig.status
  }

  /* 轮巡间隔 */
  private get pollingInterval() {
    return this.screenManager.executeQueueConfig.interval
  }

  /* 分屏数量 */
  private get maxSize() {
    return this.screenManager.size
  }

  /**
   * 执行批量播放策略
   * @param policy 设备队列执行策略
   */
  public executeDevicesQueue(policy: 'polling' | 'autoPlay') {
    console.log('executeDevicesQueue', policy)
    this.currentExecuteIndex = 0
    switch (policy) {
      case 'polling':
        if (this.pollingStatus === 'free') {
          this.pollingStatus = 'working'
          this.doPolling()
        }
        break
      case 'autoPlay':
        this.doAutoPlay()
    }
  }

  /**
   * 一键播放
   */
  private doAutoPlay() {
    for (let i = 0; i < this.maxSize; i++) {
      this.screenList[i].destroy()
      if (!this.devicesQueue[i]) {
        continue
      } else {
        this.screenManager.transformDeviceParams(this.screenList[i], this.devicesQueue[i])
        this.screenList[i].inProtocol = this.devicesQueue[i].inProtocol
        this.screenList[i].isLive = this.screenManager.isLive
      }
      this.screenList[i].init()
    }
  }

  /**
   * 轮巡
   */
  private doPolling() {
    // 轮巡初始化
    this.timer && clearTimeout(this.timer)
    if (this.devicesQueue.length - 1 < this.maxSize) {
      this.doAutoPlay()
    } else {
      // 刷新
      this.pollingVideos()
      // 间隔时间大于预加载时间则执行预加载策略
      let preLoadDelay = 999 // 禁用
      if (this.pollingInterval <= preLoadDelay) {
        preLoadDelay = 0
      }
      const intervalPolling = () => {
        this.timer = setTimeout(
          () => {
            this.timer && clearTimeout(this.timer)
            if (preLoadDelay) {
              this.preLoadPollingVideos()
              this.timer = setTimeout(
                () => {
                  this.timer && clearTimeout(this.timer)
                  this.pollingVideos()
                  intervalPolling()
                },
                preLoadDelay * 1000
              )
            } else {
              this.pollingVideos()
              intervalPolling()
            }
          },
          (this.pollingInterval - preLoadDelay) * 1000
        )
      }
      intervalPolling()
    }
  }

  /**
   * 轮巡视频
   */
  private pollingVideos() {
    const length = this.devicesQueue.length
    this.currentExecuteIndex = this.currentExecuteIndex % length
    let currentIndex = 0
    for (let i = 0; i < this.maxSize; i++) {
      this.screenList[i].destroy()
      const deviceInfo = this.devicesQueue[(this.currentExecuteIndex + (i % length)) % length]
      this.screenManager.transformDeviceParams(this.screenList[i], deviceInfo)
      this.screenList[i].inProtocol = deviceInfo.inProtocol
      this.screenList[i].isLive = this.screenManager.isLive
      if (deviceInfo.url && deviceInfo.codec) {
        this.$nextTick(() => {
          Object.assign(this.screenList[i], pick(deviceInfo, ['codec', 'url']))
        })
      } else {
        this.screenList[i].init()
      }
      if (currentIndex < this.maxSize - 1) {
        currentIndex++
      } else {
        currentIndex = 0
      }
    }
    this.currentExecuteIndex = this.currentExecuteIndex + this.maxSize
  }

  /**
   * 轮巡预加载
   */
  private async preLoadPollingVideos() {
    console.log('轮巡预加载')
    const length = this.devicesQueue.length
    const currentExecuteIndex = this.currentExecuteIndex % length
    let currentIndex = 0
    let preLoadScreen = new Screen()
    for (let i = 0; i < this.maxSize; i++) {
      const pollingDeviceInfo = this.devicesQueue[(currentExecuteIndex + (i % length)) % length]
      preLoadScreen.destroy()
      preLoadScreen.deviceId = pollingDeviceInfo.id
      preLoadScreen.deviceName = pollingDeviceInfo.label
      preLoadScreen.inProtocol = pollingDeviceInfo.inProtocol
      preLoadScreen.isLive = true
      await preLoadScreen.init()
      pollingDeviceInfo.url = preLoadScreen.url
      pollingDeviceInfo.codec = preLoadScreen.codec
      if (currentIndex < this.maxSize - 1) {
        currentIndex++
      } else {
        currentIndex = 0
      }
    }
    preLoadScreen = null
  }

  /**
   * 停止轮巡
   */
  private stopPolling() {
    if (this.pollingStatus !== 'free') {
      clearTimeout(this.timer)
      this.pollingStatus = 'free'
    }
  }

  /**
   * 暂停轮巡
   */
  private pausePolling() {
    if (this.pollingStatus === 'working') {
      clearTimeout(this.timer)
      this.pollingStatus = 'pause'
    }
  }

  /**
   * 继续轮巡
   */
  private resumePolling() {
    if (this.pollingStatus === 'pause') {
      this.doPolling()
      this.pollingStatus = 'working'
    }
  }
}

</script>
