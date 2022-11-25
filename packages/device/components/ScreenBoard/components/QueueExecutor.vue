<template>
  <div />
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import { PollingStatusEnum } from '@vss/device/enums'
import { getAlgoStreamFrameShot } from '@vss/device/api/ai-app'
import ComponentMixin from '@vss/device/components/ScreenBoard/components/mixin'

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

  /* 配置对象 */
  private get executeQueueConfig() {
    return this.screenManager.executeQueueConfig
  }

  /**
   * 更新设备列表
   */
  public async getDevices(policy: 'polling' | 'autoPlay') {
    if (this.devicesQueue.length < this.executeQueueConfig.total) {
      const params = policy === 'polling' ?
      {
        ...this.executeQueueConfig.query,
        pageNum: this.executeQueueConfig.pageNum,
        pageSize: this.executeQueueConfig.pageSize
      } :
      {
        ...this.executeQueueConfig.query,
        playNum: this.maxSize
      }
      const res = await this.executeQueueConfig.method(params) || {}
      this.screenManager.devicesQueue.push(...res.devices)
      this.executeQueueConfig.total = res.totalSize
      this.executeQueueConfig.pageNum++
    }
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
        if (this.pollingStatus === PollingStatusEnum.Free) {
          this.pollingStatus = PollingStatusEnum.Working
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
      const intervalPolling = () => {
        this.timer = setTimeout(
          async () => {
            this.timer && clearTimeout(this.timer)
            this.pollingVideos()
            // 当队列中剩余视频数小于分屏数时，获取更多视频设备
            if (this.devicesQueue.length - this.currentExecuteIndex - 1 <= this.maxSize) {
              await this.getDevices('polling')
            }
            intervalPolling()
          },
          this.pollingInterval * 1000
        )
      }
      intervalPolling()
    }
  }

  /**
   * 轮巡视频
   */
  private pollingVideos() {
    const frameShotList = this.preloadFrameShot()
    console.log(frameShotList)
    const length = this.devicesQueue.length
    this.currentExecuteIndex = this.currentExecuteIndex % length
    let currentIndex = 0
    for (let i = 0; i < this.maxSize; i++) {
      this.screenList[i].destroy()
      const deviceInfo = this.devicesQueue[(this.currentExecuteIndex + (i % length)) % length]
      // const deviceInfo = this.devicesQueue[0]
      this.screenManager.transformDeviceParams(this.screenList[i], deviceInfo)
      this.screenList[i].inProtocol = deviceInfo.inProtocol
      this.screenList[i].poster = frameShotList[i]
      this.screenList[i].isLive = this.screenManager.isLive
      this.screenList[i].init()
      if (currentIndex < this.maxSize - 1) {
        currentIndex++
      } else {
        currentIndex = 0
      }
    }
    this.currentExecuteIndex = this.currentExecuteIndex + this.maxSize
    // this.preloadFrameShot(this.maxSize)
  }

  /**
   * 预加载分屏数相等数量的视频截图作为封面
   */
  private preloadFrameShot() {
    return this.screenList.map(screen => screen.snapshot())
  }

  /**
   * 停止轮巡
   */
  private stopPolling() {
    if (this.pollingStatus !== PollingStatusEnum.Free) {
      clearTimeout(this.timer)
      this.pollingStatus = PollingStatusEnum.Free
    }
  }

  /**
   * 暂停轮巡
   */
  private pausePolling() {
    if (this.pollingStatus === PollingStatusEnum.Working) {
      clearTimeout(this.timer)
      this.pollingStatus = PollingStatusEnum.Pause
    }
  }

  /**
   * 继续轮巡
   */
  private resumePolling() {
    if (this.pollingStatus === PollingStatusEnum.Pause) {
      this.doPolling()
      this.pollingStatus = PollingStatusEnum.Working
    }
  }
}

</script>
