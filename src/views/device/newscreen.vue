<!-- 实时预览 -->
<template>
  <div v-loading="loading.group" class="app-container">
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div
        class="device-list"
        :class="{'device-list--collapsed': !isExpanded, 'device-list--dragging': dirDrag.isDragging}"
      >
        <el-button class="device-list__expand" @click="toggledirList">
          <svg-icon name="hamburger" />
        </el-button>
        <div
          class="device-list__handle"
          :style="`left: ${dirDrag.width}px`"
          @mousedown="changeWidthStart($event)"
        />
        <div ref="dirList" class="device-list__left" :style="`width: ${dirDrag.width}px`">
          <div class="dir-list" :style="`width: ${dirDrag.width}px`">
            <div class="dir-list__tools">
              <el-tooltip
                class="item"
                effect="dark"
                content="轮巡根目录"
                placement="top"
                :open-delay="300"
              >
                <el-button
                  v-if="!polling.isStart"
                  type="text"
                  @click="videosOnPolling(null, false)"
                >
                  <svg-icon name="polling-play" />
                </el-button>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="一键播放根目录"
                placement="top"
                :open-delay="300"
              >
                <el-button
                  type="text"
                  @click="videosOnAutoPlay(null, false)"
                >
                  <svg-icon name="auto-play" />
                </el-button>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="刷新目录"
                placement="top"
                :open-delay="300"
              >
                <el-button type="text" @click="initDirs">
                  <svg-icon name="refresh" />
                </el-button>
              </el-tooltip>
            </div>
            <div
              v-loading="loading.dir"
              class="dir-list__tree device-list__max-height"
              :style="{height: `${maxHeight - (currentGroup.inProtocol === 'gb28181' ? 40 : 0)}px`, marginBottom: currentGroup.inProtocol === 'gb28181' ? '40px' : '0px'}"
            >
              <el-tree
                v-if="!advancedSearchForm.revertSearchFlag"
                key="screen-el-tree-original"
                ref="dirTree"
                empty-text="暂无目录或设备"
                :data="dirList"
                node-key="id"
                highlight-current
                lazy
                :load="loadDirs"
                :props="treeProp"
                @node-click="openScreen"
              >
                <span
                  slot-scope="{node, data}"
                  class="custom-tree-node"
                  :class="{'online': data.deviceStatus === 'on', 'offline': (data.deviceStatus !== 'on' && data.type === 'ipc')}"
                  @contextmenu="($event, node)"
                >
                  <span class="node-name">
                    <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                    <span v-else class="node-dir">
                      <svg-icon name="dir" width="15" height="15" />
                      <svg-icon name="dir-close" width="15" height="15" />
                    </span>
                    <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                    {{ node.label }}
                    <span class="sum-icon">{{ getSums(data) }}</span>
                    <span class="alert-type">{{ renderAlertType(data) }}</span>
                    <svg-icon v-if="checkTreeItemStatus(data)" name="playing" class="playing" />
                  </span>
                  <div class="tools" @click.stop.prevent>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="切换主子码流"
                      placement="top"
                      :open-delay="500"
                    >
                      <StreamSelector v-if="data.type === 'ipc'" class="set-stream" :stream-size="data.multiStreamSize" :streams="data.deviceStreams" @onSetStreamNum="openScreen(data, ...arguments)" />
                    </el-tooltip>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="更多操作"
                      placement="top"
                      :open-delay="300"
                    >
                      <OperateSelector v-if="data.type === 'nvr' || data.type === 'dir' || data.type === 'group'" @onSetOperateValue="setOperateValue($event, node)" />
                    </el-tooltip>
                  </div>
                </span>
              </el-tree>
              <el-tree
                v-else
                key="screen-el-tree-filter"
                ref="dirTree"
                empty-text="暂无目录或设备"
                :data="dirList"
                node-key="id"
                highlight-current
                :props="treeProp"
                default-expand-all
                @node-click="openScreen"
              >
                <span
                  slot-scope="{node, data}"
                  class="custom-tree-node"
                  :class="{'online': data.deviceStatus === 'on', 'offline': (data.deviceStatus !== 'on' && data.type === 'ipc')}"
                  @contextmenu="($event, node)"
                >
                  <span class="node-name">
                    <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                    <span v-else class="node-dir">
                      <svg-icon name="dir" width="15" height="15" />
                      <svg-icon name="dir-close" width="15" height="15" />
                    </span>
                    <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                    {{ node.label }}
                    <span class="sum-icon">{{ getSums(data) }}</span>
                    <span class="alert-type">{{ renderAlertType(data) }}</span>
                    <svg-icon v-if="checkTreeItemStatus(data)" name="playing" class="playing" />
                  </span>
                  <div class="tools" @click.stop.prevent>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="切换主子码流"
                      placement="top"
                      :open-delay="500"
                    >
                      <StreamSelector v-if="data.type === 'ipc'" class="set-stream" :stream-size="data.multiStreamSize" :streams="data.deviceStreams" @onSetStreamNum="openScreen(data, ...arguments)" />
                    </el-tooltip>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="更多操作"
                      placement="top"
                      :open-delay="300"
                    >
                      <OperateSelector v-if="data.type === 'nvr' || data.type === 'dir' || data.type === 'group'" @onSetOperateValue="setOperateValue($event, node)" />
                    </el-tooltip>
                  </div>
                </span>
              </el-tree>
              <Datepicker v-if="currentScreen" :screen="currentScreen" />
              <ReplayType v-if="currentScreen" :screen="currentScreen" />
            </div>
            <div v-if="polling.isLoading || pollingStatus !== 'free'" class="polling-mask">
              <div class="polling-mask__tools">
                <div class="polling-mask__tools__status">
                  <span v-if="pollingStatus === 'pause'">轮巡已暂停</span>
                  <span v-else>{{ polling.isLoading ? '查询设备中...' : '当前轮巡中...' }}</span>
                </div>
                <div class="polling-mask__tools__item">
                  <svg-icon
                    name="clock"
                    class="polling-mask__tools__clock"
                    width="16px"
                    height="16px"
                  />
                  <el-select
                    v-model="polling.interval"
                    class="polling-mask__tools__select"
                    size="mini"
                    placeholder="请选择"
                    :disabled="polling.isLoading"
                    @change="intervalChange"
                  >
                    <el-option
                      v-for="item in pollingInterval"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
                <div v-if="pollingStatus === 'working'" class="polling-mask__tools__item">
                  <el-button size="mini" :disabled="polling.isLoading" @click="pausePolling()">
                    <svg-icon name="pause" />暂停
                  </el-button>
                </div>
                <div v-if="pollingStatus === 'pause'" class="polling-mask__tools__item">
                  <el-button size="mini" :disabled="polling.isLoading" @click="resumePolling()">
                    <svg-icon name="play" />继续
                  </el-button>
                </div>
                <div class="polling-mask__tools__item">
                  <el-button size="mini" :disabled="polling.isLoading" @click="stopPolling()">
                    <svg-icon name="stop" />结束
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 国标才展示 -->
            <div v-if="currentGroup.inProtocol === 'gb28181'">
              <advanced-search :search-form="advancedSearchForm" @search="doSearch" />
            </div>
          </div>
        </div>
        <div class="device-list__right">
          <ScreenBoard
            ref="screenBoard"
            class="device-list__right"
            :is-live="false"
            :in-protocol="currentGroupInProtocol"
            :has-live-replay-selector="true"
          />
          <ptz-control v-if="pollingStatus !== 'working' && currentGroupInProtocol === 'gb28181'" :device-id="selectedDeviceId" />
        </div>
      </div>
    </el-card>

    <device-dir v-if="dialogs.deviceDir" @on-close="onDeviceDirClose" />
  </div>
</template>
<script lang="ts">
import { Component, Watch, Mixins } from 'vue-property-decorator'
import { Device } from '@/type/device'
import ScreenMixin from './mixin/screenMixin'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { Screen } from './models/Screen/Screen'
import DeviceDir from './components/dialogs/DeviceDir.vue'
import PtzControl from './components/ptzControl.vue'
import StreamSelector from './components/StreamSelector.vue'
import OperateSelector from './components/OperateSelector.vue'
import { renderAlertType, getSums } from '@/utils/device'
import { VGroupModule } from '@/store/modules/vgroup'
import AdvancedSearch from '@/views/device/components/AdvancedSearch.vue'

import { ScreenManager } from './models/Screen/ScreenManager'
import ScreenBoard from './components/ScreenBoard/index.vue'
import Datepicker from './components/ScreenBoard/components/Datepicker.vue'
import ReplayType from './components/ScreenBoard/components/ReplayType.vue'

@Component({
  name: 'Screen',
  components: {
    DeviceDir,
    StatusBadge,
    PtzControl,
    StreamSelector,
    OperateSelector,
    AdvancedSearch,
    ScreenBoard,
    Datepicker,
    ReplayType
  }
})
export default class extends Mixins(ScreenMixin) {
  public openScreen(item: any, streamNum?: number) {
    const screenBoard: any = this.$refs.screenBoard
    screenBoard.openScreen(item, streamNum)
  }

  /**
   * 检查设备树中的设备项是否选择
   */
  public checkTreeItemStatus(item: any) {
    // if (item.type !== 'ipc' && item.type !== 'stream') return false
    // return !!this.screenList.find(screen => screen.deviceInfo.deviceId === item.id)
  }
  /* NEW!!! */

  private renderAlertType = renderAlertType
  private getSums = getSums
  public maxSize = 4
  private selectedDeviceId = null
  private currentPollingIndex = 0
  private isLoading: boolean = false
  private currentNode?: Record<string, any> = {
    data: {}
  }
  private pollingDevices: Record<string, any>[] = []
  private autoPlayDevices: Record<string, any>[] = []
  private pollingInterval = [
    {
      value: 5,
      label: '5秒'
    },
    {
      value: 10,
      label: '10秒'
    },
    {
      value: 20,
      label: '20秒'
    },
    {
      value: 40,
      label: '40秒'
    },
    {
      value: 60,
      label: '1分钟'
    },
    {
      value: 180,
      label: '3分钟'
    },
    {
      value: 300,
      label: '5分钟'
    }
  ]

  // private ifIntercom = false
  // private intercomInfo = {}

  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: String, oldGroupId: String) {
    // search为inject变量，不能直接整体赋值为其他，否则inject会失效
    this.advancedSearchForm.deviceStatusKeys = []
    this.advancedSearchForm.streamStatusKeys = []
    this.advancedSearchForm.deviceAddresses = {
      code: '',
      level: ''
    }
    this.advancedSearchForm.matchKeys = []
    this.advancedSearchForm.inputKey = ''
    this.advancedSearchForm.searchKey = ''
    this.advancedSearchForm.revertSearchFlag = false
    if (oldGroupId) {
      const query = {
        searchKey: '',
        deviceStatusKeys: '',
        streamStatusKeys: '',
        deviceAddresses: '',
        matchKeys: ''
      }
      this.$router.replace({
        query
      })
    }
    if (!groupId) return
    this.$nextTick(() => {
      this.initDirs()
      // this.stopPolling()
    })
  }

  @Watch('currentIndex')
  private onCurrentIndexChange(newValue: number) {
    if (this.screenList.length) {
      this.selectedDeviceId = this.screenList[newValue]!.deviceInfo.deviceId
    }
  }

  private beforeDestroy() {
    this.interval && clearInterval(this.interval)
  }

  private destroyed() {
    VGroupModule.resetVGroupInfo()
    // this.screenList.map(() => {
    //   return new Screen()
    // })
    window.removeEventListener('resize', this.calMaxHeight)
    window.removeEventListener('resize', this.checkFullscreen)
  }

  private closeScreen(screen: Screen) {
    this.selectedDeviceId = ''
    screen.destroy()
  }

  /**
   *  切换分屏数量
   */
  public handleLiveScreenSize(size: String) {
    this.handleScreenSize(size)
    if (this.polling.isStart) {
      this.doPolling()
    }
  }

  /**
   * 更多操作
   */
  private setOperateValue(value: string, node: any) {
    switch (value) {
      case 'polling':
        this.videosOnPolling(node, true)
        break
      case 'autoPlay':
        this.videosOnAutoPlay(node, true)
        break
    }
  }

  /**
   * 判断轮巡时是否需要刷新
   */
  // private doPolling() {
  //   // 不刷新
  //   this.interval && clearTimeout(this.interval)
  //   if (this.pollingDevices.length - 1 < this.maxSize) {
  //     this.$alert('当前设备数需大于分屏数才可开始轮巡', '提示', {
  //       confirmButtonText: '确定'
  //     })
  //   } else {
  //     // 刷新
  //     this.polling.isStart = true
  //     this.pollingVideos()
  //     // 间隔时间大于预加载时间则执行预加载策略
  //     let preLoadDelay = 5
  //     if (this.polling.interval <= preLoadDelay) {
  //       preLoadDelay = 0
  //     }
  //     let intervalPolling = () => {
  //       this.interval = setTimeout(
  //         () => {
  //           this.interval && clearTimeout(this.interval)
  //           if (preLoadDelay) {
  //             this.preLoadPollingVideos()
  //             this.interval = setTimeout(
  //               () => {
  //                 this.interval && clearTimeout(this.interval)
  //                 this.pollingVideos()
  //                 intervalPolling()
  //               },
  //               preLoadDelay * 1000
  //             )
  //           } else {
  //             this.pollingVideos()
  //             intervalPolling()
  //           }
  //         },
  //         (this.polling.interval - preLoadDelay) * 1000
  //       )
  //     }
  //     intervalPolling()
  //     // } else {
  //     //   this.interval = setInterval(
  //     //     this.pollingVideos,
  //     //     this.polling.interval * 1000
  //     //   )
  //     // }
  //   }
  // }

  /**
   * 轮巡
   */
  // private pollingVideos() {
  //   const length = this.pollingDevices.length
  //   this.currentPollingIndex = this.currentPollingIndex % length
  //   this.currentIndex = 0
  //   for (let i = 0; i < this.maxSize; i++) {
  //     this.screenList[i] = new Screen()
  //     this.screenList[i].deviceInfo.deviceId = this.pollingDevices[(this.currentPollingIndex + (i % length)) % length].id
  //     this.screenList[i].deviceInfo.deviceName = this.pollingDevices[(this.currentPollingIndex + (i % length)) % length].label
  //     this.screenList[i].deviceInfo.inProtocol = this.currentGroupInProtocol!
  //     this.screenList[i].deviceInfo.roleId = this.pollingDevices[(this.currentPollingIndex + (i % length)) % length].roleId
  //     this.screenList[i].deviceInfo.realGroupId = this.pollingDevices[(this.currentPollingIndex + (i % length)) % length].realGroupId
  //     this.screenList[i].deviceInfo.realGroupInProtocol = this.pollingDevices[(this.currentPollingIndex + (i % length)) % length].realGroupInProtocol
  //     this.screenList[i].init()
  //     if (this.currentIndex < this.maxSize - 1) {
  //       this.currentIndex++
  //     } else {
  //       this.currentIndex = 0
  //     }
  //   }
  //   this.currentPollingIndex = this.currentPollingIndex + this.maxSize
  // }

  /**
   * 轮巡预加载
   */
  // private async preLoadPollingVideos() {
  //   console.log('轮巡预加载')
  //   const length = this.pollingDevices.length
  //   let currentPollingIndex = this.currentPollingIndex % length
  //   let currentIndex = 0
  //   let preLoadScreen = new Screen()
  //   for (let i = 0; i < this.maxSize; i++) {
  //     let pollingDeviceInfo = this.pollingDevices[(currentPollingIndex + (i % length)) % length]
  //     preLoadScreen.destroy()
  //     preLoadScreen.deviceInfo.deviceId = pollingDeviceInfo.id
  //     preLoadScreen.deviceInfo.deviceName = pollingDeviceInfo.label
  //     preLoadScreen.deviceInfo.inProtocol = this.currentGroupInProtocol!
  //     preLoadScreen.type = pollingDeviceInfo.type
  //     preLoadScreen.isLive = true
  //     await preLoadScreen.init()
  //     pollingDeviceInfo.url = preLoadScreen.streamInfo.url
  //     pollingDeviceInfo.codec = preLoadScreen.streamInfo.codec

  //     if (currentIndex < this.maxSize - 1) {
  //       currentIndex++
  //     } else {
  //       currentIndex = 0
  //     }
  //   }
  //   preLoadScreen = null
  //   // this.currentPollingIndex = this.currentPollingIndex + this.maxSize
  // }

  /**
   * 视频断流30秒后重试
   */
  private onRetry(screen: Screen, params?: any) {
    let timeout = 30 * 1000
    if (params && params.immediate) {
      timeout = 100
    }
    setTimeout(async() => {
      screen.url = ''
      await screen.init()
      if (screen.retry) {
        this.onRetry(screen)
      }
    }, timeout)
  }

  /**
   * 设置主子码流号
   */
  // private onSetStreamNum(screen: Screen, streamNum: number) {
  //   screen.url = ''
  //   screen.streamNum = streamNum
  //   screen.init()
  // }

  /**
   * 录像回放
   */
  private onPlayback(screen: Screen) {
    screen.isLive = false
  }

  /**
   * 实时对讲
   */
  // private onIntercom(screen: Screen, type: string) {
  //   for (let i = 0; i < this.screenList.length; i++) {
  //     this.screenList[i].volume = 0
  //   }
  //   screen.type = type.toLowerCase()
  //   this.intercomInfo = screen
  //   this.ifIntercom = true
  // }

  /**
   * 关闭实时对讲
   */
  // private closeIntercom() {
  //   for (let i = 0; i < this.screenList.length; i++) {
  //     this.screenList[i].volume = 30
  //   }
  //   this.ifIntercom = false
  // }

  /**
   * 修改ptz缩放状态，子组件缩放互斥
   */
  // private changeScalePTZStatus(screen: Screen, status: boolean) {
  //   for (let i = 0; i < this.screenList.length; i++) {
  //     this.screenList[i].ifScalePTZ = false
  //   }
  //   screen.ifScalePTZ = status
  // }

  /**
   * 切换播放格式
   */
  // private onTypeChange(screen: Screen, type: string) {
  //   screen.type = type.toLowerCase()
  // }

  /**
   * 播放直播
   */
  private onPlaylive(screen: Screen) {
    screen.isLive = true
  }

  /**
   * 关闭视频选择对话框
   * @param device 设备
   */
  private onDeviceDirClose(device: Device) {
    this.dialogs.deviceDir = false
    if (device) this.openScreen(device)
  }

  private pollingStatus: string = 'free'
  private screenManager: ScreenManager = null
  private polling = {
    interval: 10,
    isLoading: false
  }

  @Watch('screenManager.screenManagerStatus', { deep: true })
  private onScreenManagerChange(screenManagerStatus) {
    console.log(screenManagerStatus.executeQueueConfig.status)
    this.pollingStatus = screenManagerStatus.executeQueueConfig.status
  }

  private get currentScreen() {
    return this.screenManager && this.screenManager.screenList[this.screenManager.currentIndex]
  }

  private mounted() {
    const screenBoard = this.$refs.screenBoard as ScreenBoard
    this.screenManager = screenBoard!.screenManager
  }

  private get queueExecutor() {
    return this.screenManager && this.screenManager.refs.queueExecutor
  }

  private intervalChange(val: number) {
    this.screenManager.executeQueueConfig.interval = val
  }

  /**
   * 获取需要轮巡的视频
   */
  private async videosOnPolling(node: any, isRoot: boolean) {
    let pollingDevices: Device[] = []
    const dirTree: any = this.$refs.dirTree
    if (node) {
      this.currentNode = node
      // 设置虚拟业务组相关信息
      VGroupModule.SetRoleID(this.currentNode!.data.roleId || '')
      VGroupModule.SetRealGroupId(this.currentNode!.data.realGroupId || '')
      VGroupModule.SetRealGroupInProtocol(this.currentNode!.data.realGroupInProtocol || '')
    }
    this.polling.isLoading = true
    if (!isRoot) {
      for (let i = 0, length = this.dirList.length; i < length; i++) {
        await this.deepDispatchTree(dirTree, dirTree.getNode(this.dirList[i].id), pollingDevices, 'polling')
      }
    } else {
      await this.deepDispatchTree(dirTree, node, pollingDevices, 'polling')
    }
    // console.log(this.pollingDevices, 'this.pollingDevices')
    this.polling.isLoading = false
    this.executeQueue(pollingDevices, 'polling')
  }

  /**
   * 获取需要一键播放的视频
   */
  private async videosOnAutoPlay(node: any, isRoot: boolean) {
    let autoPlayDevices = []
    const dirTree: any = this.$refs.dirTree
    if (node) {
      this.currentNode = node
      // 设置虚拟业务组相关信息
      VGroupModule.SetRoleID(this.currentNode!.data.roleId || '')
      VGroupModule.SetRealGroupId(this.currentNode!.data.realGroupId || '')
      VGroupModule.SetRealGroupInProtocol(this.currentNode!.data.realGroupInProtocol || '')
    }
    if (!isRoot) {
      for (let i = 0, length = this.dirList.length; i < length; i++) {
        await this.deepDispatchTree(dirTree, dirTree.getNode(this.dirList[i].id), autoPlayDevices, 'autoPlay')
        // 当为一键播放时，加载设备数超过最大屏幕数则终止遍历
        if (autoPlayDevices.length >= this.maxSize) break
      }
    } else {
      await this.deepDispatchTree(dirTree, node, autoPlayDevices, 'autoPlay')
    }
    // console.log(this.autoPlayDevices, 'this.autoPlayDevices')
    this.executeQueue(autoPlayDevices, 'auotoPlay')
  }

  private executeQueue(devicesQueue: Device[], policy: 'polling' | 'auotoPlay') {
    console.log(this.screenManager, devicesQueue)
    if (this.queueExecutor) {
      this.screenManager.devicesQueue = devicesQueue
      this.queueExecutor.executeDevicesQueue(policy)
    }
  }

  private startAutoPlay(devicesQueue: Device[]) {
    console.log(this.screenManager, devicesQueue)
    if (this.queueExecutor) {
      this.screenManager.devicesQueue = devicesQueue
      this.queueExecutor.executeDevicesQueue()
    }
  }

  private stopPolling() {
    if (this.queueExecutor) {
      this.queueExecutor.stopPolling()
    }
  }

  private pausePolling() {
    if (this.queueExecutor) {
      this.queueExecutor.pausePolling()
    }
  }

  private resumePolling() {
    if (this.queueExecutor) {
      this.queueExecutor.resumePolling()
    }
  }
}
</script>
<style lang="scss" scoped>
.device-list {
  &__left {
    .playing {
      color: $success;
    }

    .custom-tree-node .tools {
      display: block;
      background: #fff;
      right: -10px;
      line-height: 26px;
      padding-right: 10px;

      i {
        display: block;
        padding: 5px 0;

        &:hover {
          .svg-icon {
            margin-right: 5px;
            color: #313941;
          }
        }
      }

      .set-stream {
        ::v-deep .controls__popup {
          left: auto;
          right: -5px;
        }
      }
    }

    .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content,
    .dir-list__tree .el-tree-node__content:hover {
      .custom-tree-node .tools {
        background: #f5f7fa;
      }
    }
  }

  &__right {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .dir-list__tree {
    position: relative;

    .offline .node-name {
      cursor: not-allowed;
    }
  }

  .dir-list {
    position: relative;

    .polling-mask {
      position: absolute;
      display: flex;
      height: 100%;
      width: 100%;
      top: 0;
      left: 0;
      background: rgba(255, 255, 255, 75%);
      align-items: center;

      &__tools {
        width: 100%;
        text-align: center;
        font-size: 12px;
        margin-top: -30%;

        &__item {
          margin-bottom: 15px;
        }

        &__clock {
          vertical-align: middle;
        }

        &__status {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 30px;
        }

        &__select {
          width: 80px;
        }

        .el-button--mini {
          width: 100px;
        }

        .svg-icon {
          color: inherit;
        }
      }
    }
  }
}
</style>
