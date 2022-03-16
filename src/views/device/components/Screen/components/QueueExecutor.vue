<template>
  <div />
</template>
<script lang="ts">
import { Screen } from '@/views/device/models/Screen/Screen'
import { pick } from 'lodash'
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'QueueExecutor'
})
export default class extends ComponentMixin {
  private currentPollingIndex = 0
  private timer: NodeJS.Timeout

  private get devicesQueue() {
    return this.screenManager.devicesQueue
  }

  private get screenList() {
    return this.screenManager.screenList
  }

  private set pollingStatus(val) {
    this.screenManager.executeQueueConfig.status = val
  }

  private get pollingStatus() {
    return this.screenManager.executeQueueConfig.status
  }

  private get pollingInterval() {
    return this.screenManager.executeQueueConfig.interval
  }

  private get maxSize() {
    return this.screenManager._size
  }

  /**
   * 执行批量播放策略
   * @policy 设备队列执行策略
   */
  public executeDevicesQueue(policy: 'polling' | 'auotoPlay') {
    console.log('executeDevicesQueue')
    switch (policy) {
      case 'polling':
        if (this.pollingStatus === 'free') {
          this.pollingStatus = 'working'
          console.log('executeDevicesQueue', this.screenManager)
          this.currentPollingIndex = 0
          this.doPolling()
        }
        break
      case 'auotoPlay':
        this.doAutoPlay()
    }
  }

  /**
   * 停止轮巡
   */
  private stopPolling() {
    if (this.pollingStatus === 'working') {
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

  /**
   * 一键播放
   */
  private doAutoPlay() {
    if (!this.devicesQueue.length) {
      this.$alert('当前设备数需大于0才可开始自动播放', '提示', {
        confirmButtonText: '确定'
      })
    }
    for (let i = 0; i < this.maxSize; i++) {
      this.screenList[i].destroy()
      if (!this.devicesQueue[i]) {
        continue
      } else {
        this.screenList[i].deviceInfo.deviceId = this.devicesQueue[i].id
        this.screenList[i].deviceInfo.deviceName = this.devicesQueue[i].label
        this.screenList[i].deviceInfo.inProtocol = this.devicesQueue[i].inProtocol
        this.screenList[i].isLive = this.screenManager.isLive
      }
      this.screenList[i].init()
    }
  }

  /**
   * 判断轮巡时是否需要刷新
   */
  private doPolling() {
    // 不刷新
    this.timer && clearTimeout(this.timer)
    if (this.devicesQueue.length - 1 < this.maxSize) {
      this.$alert('当前设备数需大于分屏数才可开始轮巡', '提示', {
        confirmButtonText: '确定'
      })
      this.pollingStatus = 'free'
    } else {
      // 刷新
      this.pollingVideos()
      // 间隔时间大于预加载时间则执行预加载策略
      let preLoadDelay = 5
      if (this.pollingInterval <= preLoadDelay) {
        preLoadDelay = 0
      }
      let intervalPolling = () => {
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
   * 轮巡
   */
  private pollingVideos() {
    console.log('this.devicesQueue', this.devicesQueue)
    const length = this.devicesQueue.length
    this.currentPollingIndex = this.currentPollingIndex % length
    let currentIndex = 0
    for (let i = 0; i < this.maxSize; i++) {
      this.screenList[i].destroy()
      let deviceInfo = this.devicesQueue[(this.currentPollingIndex + (i % length)) % length]
      Object.assign(this.screenList[i].deviceInfo, pick(deviceInfo, ['inProtocol', 'roleId', 'realGroupId', 'realGroupInProtocol']))
      this.screenList[i].deviceInfo.deviceId = deviceInfo.id
      this.screenList[i].deviceInfo.deviceName = deviceInfo.label
      this.screenList[i].isLive = this.screenManager.isLive
      if (deviceInfo.url && deviceInfo.codec) {
        this.$nextTick(() => {
          Object.assign(this.screenList[i].deviceInfo, pick(deviceInfo, ['codec', 'url']))
          console.log(this.screenList[i].streamInfo.url, this.screenList[i].streamInfo.codec)
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
    this.currentPollingIndex = this.currentPollingIndex + this.maxSize
  }

  /**
   * 轮巡预加载
   */
  private async preLoadPollingVideos() {
    console.log('轮巡预加载')
    const length = this.devicesQueue.length
    let currentPollingIndex = this.currentPollingIndex % length
    let currentIndex = 0
    let preLoadScreen = new Screen()
    for (let i = 0; i < this.maxSize; i++) {
      let pollingDeviceInfo = this.devicesQueue[(currentPollingIndex + (i % length)) % length]
      preLoadScreen.destroy()
      preLoadScreen.deviceInfo.deviceId = pollingDeviceInfo.id
      preLoadScreen.deviceInfo.deviceName = pollingDeviceInfo.label
      preLoadScreen.deviceInfo.inProtocol = pollingDeviceInfo.inProtocol
      preLoadScreen.isLive = true
      await preLoadScreen.init()
      pollingDeviceInfo.url = preLoadScreen.streamInfo.url
      pollingDeviceInfo.codec = preLoadScreen.streamInfo.codec

      if (currentIndex < this.maxSize - 1) {
        currentIndex++
      } else {
        currentIndex = 0
      }
    }
    preLoadScreen = null
  }
}

</script>
