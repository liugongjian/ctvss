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
              :style="{height: `${maxHeight}px`}"
            >
              <el-tree
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
            </div>
            <div v-if="polling.isStart" class="polling-mask">
              <div class="polling-mask__tools">
                <div class="polling-mask__tools__status">
                  <span v-if="!polling.isPause">当前轮巡中...</span>
                  <span v-else>轮巡已暂停</span>
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
                <div v-if="!polling.isPause" class="polling-mask__tools__item">
                  <el-button size="mini" @click="pausePolling()">
                    <svg-icon name="pause" />暂停
                  </el-button>
                </div>
                <div v-if="polling.isPause" class="polling-mask__tools__item">
                  <el-button size="mini" @click="resumePolling()">
                    <svg-icon name="play" />继续
                  </el-button>
                </div>
                <div class="polling-mask__tools__item">
                  <el-button size="mini" @click="stopPolling()">
                    <svg-icon name="stop" />结束
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="device-list__right">
          <div class="device__tools">
            <label>分屏数:</label>
            <el-tooltip content="单分屏" placement="top">
              <el-button type="text" @click="changeMaxSize(1)">
                <svg-icon name="screen" />
              </el-button>
            </el-tooltip>
            <template v-if="currentGroupId !== '80337930297556992'">
              <el-tooltip content="四分屏" placement="top">
                <el-button type="text" @click="changeMaxSize(4)">
                  <svg-icon name="screen4" />
                </el-button>
              </el-tooltip>
              <el-tooltip content="九分屏" placement="top">
                <el-button type="text" @click="changeMaxSize(9)">
                  <svg-icon name="screen9" />
                </el-button>
              </el-tooltip>
              <el-tooltip content="十六分屏" placement="top">
                <el-button type="text" @click="changeMaxSize(16)">
                  <svg-icon name="screen16" />
                </el-button>
              </el-tooltip>
            </template>
            <div class="device__tools--right">
              <el-tooltip content="全屏" placement="top">
                <el-button type="text" @click="fullscreen">
                  <svg-icon name="fullscreen" />
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <div
            class="screen-list"
            :class="[`screen-size--${maxSize}`, {'fullscreen': isFullscreen, 'covid': isCovidLiving && isFullscreen}]"
          >
            <div v-if="isCovidLiving && isFullscreen" class="screen-banner">
              <img src="@/assets/images/covid_banner.png">
              <span class="covid__title">{{ `${currentRegion}核酸检测调度指挥云平台` }}</span>
            </div>
            <div class="sreen-wrap">
              <div
                v-for="(screen, index) in screenList"
                :key="index"
                v-loading="screen.loading"
                class="screen-item screen-item--live"
                :class="[{'actived': index === currentIndex && screenList.length > 1 && !polling.isStart}, {'fullscreen': screen.isFullscreen}]"
                @click="selectScreen(index)"
              >
                <template v-if="screen.loaded">
                  <player-container :on-can-play="screen.onCanPlay" :calendar-focus="screen.calendarFocus">
                    <template v-if="screen.isLive">
                      <div class="live-view">
                        <player
                          v-if="screen.url"
                          type="flv"
                          :codec="screen.codec"
                          :url="screen.url"
                          :is-live="true"
                          :is-ws="true"
                          :is-fullscreen="screen.isFullscreen"
                          :in-protocol="screen.inProtocol"
                          :auto-play="true"
                          :has-control="false"
                          :has-playback="true"
                          :device-name="screen.deviceName"
                          :stream-num="screen.streamNum"
                          @onCanPlay="playEvent(screen, ...arguments)"
                          @onRetry="onRetry(screen, ...arguments)"
                          @onPlayback="onPlayback(screen)"
                          @onFullscreen="screen.fullscreen();fullscreen()"
                          @onExitFullscreen="screen.exitFullscreen();exitFullscreen()"
                          @onIntercom="onIntercom(screen,true)"
                        />
                        <div v-if="!screen.url && !screen.loading" class="tip-text">{{ screen.errorMsg || '无信号' }}</div>
                      </div>
                    </template>
                    <template v-else>
                      <replay-view
                        :device-id="screen.deviceId"
                        :in-protocol="currentGroupInProtocol"
                        :has-playlive="true"
                        :is-fullscreen="screen.isFullscreen"
                        @onCalendarFocus="onCalendarFocus(screen, ...arguments)"
                        @onCanPlay="playEvent(screen, ...arguments)"
                        @onPlaylive="onPlaylive(screen)"
                        @onFullscreen="screen.fullscreen();fullscreen()"
                        @onExitFullscreen="screen.exitFullscreen();exitFullscreen()"
                      />
                    </template>
                    <div slot="header" class="screen-header">
                      <div class="device-name">
                        <!-- {{ screen.isLive ? "" : screen.deviceName }} -->
                        <StreamSelector
                          v-if="screen.isLive"
                          class="set-stream"
                          :stream-size="screen.streamSize"
                          :stream-num="screen.streamNum"
                          :streams="screen.streams"
                          @onSetStreamNum="onSetStreamNum(screen, ...arguments)"
                        />
                      </div>
                      <div class="screen__tools">
                        <el-tooltip content="关闭视频">
                          <el-button class="screen__close" type="text" @click="closeScreen(screen)">
                            <svg-icon name="close" width="12" height="12" />
                          </el-button>
                        </el-tooltip>
                      </div>
                    </div>
                  </player-container>
                </template>
                <div v-else class="tip-text tip-select-device">
                  <el-button type="text" @click="selectDevice(screen)">请选择设备</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ptz-control v-if="!polling.isStart" :device-id="selectedDeviceId" />
      </div>
    </el-card>

    <intercom-dialog v-if="ifIntercom" :if-intercom="ifIntercom" :intercom-info="intercomInfo" @onIntercom="onIntercom(intercomInfo,false)" />
    <div id="mouse-right" class="mouse-right" @click="videosOnPolling(null, true)">轮巡当前目录</div>
    <device-dir v-if="dialogs.deviceDir" @on-close="onDeviceDirClose" />
  </div>
</template>
<script lang="ts">
import { Component, Watch, Mixins } from 'vue-property-decorator'
import { Device } from '@/type/device'
import ScreenMixin from './mixin/screenMixin'
import StatusBadge from '@/components/StatusBadge/index.vue'
import Screen from './models/Screen'
import Player from './components/Player.vue'
import PlayerContainer from './components/PlayerContainer.vue'
import ReplayView from './components/ReplayView.vue'
import DeviceDir from './components/dialogs/DeviceDir.vue'
import PtzControl from './components/ptzControl.vue'
import StreamSelector from './components/StreamSelector.vue'
import OperateSelector from './components/OperateSelector.vue'
import { getDeviceTree } from '@/api/device'
import { renderAlertType, getSums } from '@/utils/device'
import { VGroupModule } from '@/store/modules/vgroup'
import IntercomDialog from './components/dialogs/Intercom.vue'

@Component({
  name: 'Screen',
  components: {
    Player,
    ReplayView,
    DeviceDir,
    StatusBadge,
    PtzControl,
    StreamSelector,
    OperateSelector,
    PlayerContainer,
    IntercomDialog
  }
})
export default class extends Mixins(ScreenMixin) {
  private renderAlertType = renderAlertType
  private getSums = getSums
  private currentRegion = ''
  public maxSize = 4;
  private selectedDeviceId = '';
  private currentPollingIndex = 0;
  private isZoom = false;
  private isClosed = false;
  private speed = 1;
  private polling = {
    interval: 10,
    isStart: false,
    isPause: false
  };
  private interval?: NodeJS.Timeout;
  private currentNode?: Record<string, any> = {
    data: {}
  };
  private pollingDevices: Record<string, any>[] = [];
  private autoPlayDevices: Record<string, any>[] = [];
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

  private ifIntercom = false
  private intercomInfo = {}

  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: String) {
    if (!groupId) return
    this.$nextTick(() => {
      this.screenList.forEach(screen => {
        screen.reset()
        this.currentIndex = 0
      })
      this.initDirs()
    })

    // TODO: 泰州专属
    if (groupId === '80337930297556992') {
      this.maxSize = 1
    }
  }

  @Watch('currentIndex')
  private onCurrentIndexChange(newValue: number) {
    if (this.screenList.length) {
      this.selectedDeviceId = this.screenList[newValue]!.deviceId
    }
  }

  private get isCovidLiving() {
    this.currentRegion = this.$store.state.user.tags.isCovidLiving
    return this.$store.state.user.tags.isCovidLiving !== undefined
  }

  private mounted() {
    this.initScreen()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
    window.addEventListener('resize', this.checkFullscreen)
  }

  private beforeDestroy() {
    this.interval && clearInterval(this.interval)
  }

  private destroyed() {
    VGroupModule.resetVGroupInfo()
    this.screenList.forEach(screen => {
      screen.reset()
    })
    window.removeEventListener('resize', this.calMaxHeight)
    window.removeEventListener('resize', this.checkFullscreen)
  }

  private closeScreen(screen: Screen) {
    this.selectedDeviceId = ''
    screen.reset()
  }

  /**
   * 清空初始化树状态默认方法
   */
  public async initTreeStatus() {
    // TODO: 对泰州用户单独处理，后续需删除
    this.dealTzTree()
  }

  /**
   * 打开分屏视频
   */
  private async openScreen(item: any, streamNum?: number) {
    if (this.polling.isStart) {
      this.$message({
        message: '请先关闭轮巡再进行选择',
        type: 'warning'
      })
      return
    }
    // 设置虚拟业务组相关信息
    VGroupModule.SetRoleID(item.roleId || '')
    VGroupModule.SetRealGroupId(item.realGroupId || '')
    VGroupModule.SetRealGroupInProtocol(item.realGroupInProtocol || '')

    if (item.type === 'ipc' && item.deviceStatus === 'on') {
      const screen = this.screenList[this.currentIndex]
      if (screen.deviceId) {
        screen.reset()
      }
      screen.inProtocol = this.currentGroupInProtocol!
      screen.deviceId = item.id
      screen.deviceName = item.label
      screen.streamSize = item.multiStreamSize
      screen.streams = item.deviceStreams
      screen.roleId = item.roleId || ''
      screen.realGroupId = item.realGroupId || ''
      screen.realGroupInProtocol = item.realGroupInProtocol || ''
      if (streamNum && !isNaN(streamNum)) {
        screen.streamNum = streamNum
      } else {
        screen.streamNum = item.autoStreamNum
      }
      if (this.currentIndex < this.maxSize - 1) {
        this.currentIndex++
      } else {
        if (this.screenList.length) {
          this.selectedDeviceId = this.screenList[this.currentIndex]!.deviceId
        }
      }
      await screen.getUrl()
    }
  }

  /**
   * @override 切换分屏数量
   */
  public changeMaxSize(size: number) {
    this.maxSize = size
    if (this.currentIndex >= this.maxSize) {
      this.currentIndex = this.maxSize - 1
    }
    this.initScreen()
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
   * 需要轮巡的视频
   */
  private async videosOnPolling(node: any, isDir: boolean) {
    this.pollingDevices = []
    if (node) {
      this.currentNode = node
      // 设置虚拟业务组相关信息
      VGroupModule.SetRoleID(this.currentNode!.data.roleId || '')
      VGroupModule.SetRealGroupId(this.currentNode!.data.realGroupId || '')
      VGroupModule.SetRealGroupInProtocol(this.currentNode!.data.realGroupInProtocol || '')
    }
    if (!isDir) {
      this.dirList.forEach((item: any) => {
        if (item.type === 'ipc' && item.deviceStatus === 'on') {
          this.pollingDevices.push(item)
        }
      })
    } else {
      let data = await getDeviceTree({
        groupId: this.currentGroupId,
        id: this.currentNode!.data.id,
        type: this.currentNode!.data.type
      })
      const dirs = this.setDirsStreamStatus(data.dirs)
      dirs.forEach((item: any) => {
        if (item.type === 'ipc' && item.deviceStatus === 'on') {
          this.pollingDevices.push(item)
        }
      })
    }
    this.currentPollingIndex = 0
    this.doPolling()
  }

  /**
   * 判断轮巡时是否需要刷新
   */
  private doPolling() {
    // 不刷新
    this.interval && clearInterval(this.interval)
    if (this.pollingDevices.length - 1 < this.maxSize) {
      this.$alert(`当前设备数需大于分屏数才可开始轮巡`, '提示', {
        confirmButtonText: '确定'
      })
    } else {
      // 刷新
      this.polling.isStart = true
      this.pollingVideos()
      this.interval = setInterval(
        this.pollingVideos,
        this.polling.interval * 1000
      )
    }
  }

  /**
   * 一键播放
   */
  private async videosOnAutoPlay(node: any, isDir: boolean) {
    this.autoPlayDevices = []
    if (node) {
      this.currentNode = node
      // 设置虚拟业务组相关信息
      VGroupModule.SetRoleID(this.currentNode!.data.roleId || '')
      VGroupModule.SetRealGroupId(this.currentNode!.data.realGroupId || '')
      VGroupModule.SetRealGroupInProtocol(this.currentNode!.data.realGroupInProtocol || '')
    }
    if (!isDir) {
      this.dirList.forEach((item: any) => {
        if (item.type === 'ipc' && item.deviceStatus === 'on') {
          this.autoPlayDevices.push(item)
        }
      })
    } else {
      let data = await getDeviceTree({
        groupId: this.currentGroupId,
        id: node!.data.id,
        type: node!.data.type
      })
      const dirs = this.setDirsStreamStatus(data.dirs)
      dirs.forEach((item: any) => {
        if (item.type === 'ipc' && item.deviceStatus === 'on') {
          this.autoPlayDevices.push(item)
        }
      })
    }
    if (!this.autoPlayDevices.length) {
      this.$alert(`当前设备数需大于0才可开始自动播放`, '提示', {
        confirmButtonText: '确定'
      })
    }
    for (let i = 0; i < this.maxSize; i++) {
      this.screenList[i].reset()
      if (!this.autoPlayDevices[i]) {
        continue
      } else {
        this.screenList[i].deviceId = this.autoPlayDevices[i].id
        this.screenList[i].type = this.autoPlayDevices[i].type
        this.screenList[i].deviceName = this.autoPlayDevices[i].label
        this.screenList[i].inProtocol = this.currentGroupInProtocol!
      }
      this.screenList[i].getUrl()
    }
  }

  private intervalChange() {
    if (this.polling.isStart && !this.polling.isPause) {
      this.doPolling()
    }
  }

  private pausePolling() {
    if (this.polling.isStart) {
      this.polling.isPause = true
      clearInterval(this.interval!)
    }
  }

  private resumePolling() {
    if (this.polling.isStart) {
      this.polling.isPause = false
      this.doPolling()
    }
  }

  private stopPolling() {
    if (this.polling.isStart) {
      this.polling.isStart = false
      this.polling.isPause = false
      clearInterval(this.interval!)
    }
  }

  /**
   * 轮巡
   */
  private pollingVideos() {
    console.log('轮巡')
    const length = this.pollingDevices.length
    this.currentPollingIndex = this.currentPollingIndex % length
    this.currentIndex = 0
    for (let i = 0; i < this.maxSize; i++) {
      this.screenList[i].reset()
      this.screenList[i].deviceId = this.pollingDevices[(this.currentPollingIndex + (i % length)) % length].id
      this.screenList[i].type = this.pollingDevices[(this.currentPollingIndex + (i % length)) % length].type
      this.screenList[i].deviceName = this.pollingDevices[(this.currentPollingIndex + (i % length)) % length].label
      this.screenList[i].inProtocol = this.currentGroupInProtocol!
      this.screenList[i].getUrl()
      if (this.currentIndex < this.maxSize - 1) {
        this.currentIndex++
      } else {
        this.currentIndex = 0
      }
    }
    this.currentPollingIndex = this.currentPollingIndex + this.maxSize
  }

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
      await screen.getUrl()
      if (screen.retry) {
        this.onRetry(screen)
      }
    }, timeout)
  }

  /**
   * 设置主子码流号
   */
  private onSetStreamNum(screen: Screen, streamNum: number) {
    screen.url = ''
    screen.streamNum = streamNum
    screen.getUrl()
  }

  /**
   * 录像回放
   */
  private onPlayback(screen: Screen) {
    screen.isLive = false
  }

  // 实时对讲
  private onIntercom(screen:any, flag:boolean) {
    this.intercomInfo = screen
    this.ifIntercom = flag
  }

  /**
   * 播放直播
   */
  private onPlaylive(screen: Screen) {
    screen.isLive = true
  }

  /**
   * 右键菜单
   */
  private openMenu(event: MouseEvent, node: any) {
    this.currentNode = node
    if (node.data.type === 'dir' || node.data.type === 'nvr') {
      event.preventDefault()
      var context = document.getElementById('mouse-right')
      context!.style.display = 'block'
      context!.style.left = event.x + 'px'
      context!.style.top = event.y + 'px'
      document.onclick = function() {
        var context = document.getElementById('mouse-right')
        context!.style.display = 'none'
      }
    }
  }

  /**
   * 关闭视频选择对话框
   * @param device 设备
   */
  private onDeviceDirClose(device: Device) {
    this.dialogs.deviceDir = false
    if (device) this.openScreen(device)
  }
}
</script>
<style lang="scss" scoped>
.sreen-wrap {
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
}
.covid {
  .sreen-wrap {
    height: 80vh;
    .screen-item {
      border: 1px solid #050926;
    }
  }
  .video-wrap {
    border: none;
  }
  .screen-banner {
    text-align: center;
    width: 100%;
    img {
      width: auto;
      height: 20vh;
    }
  }
  &__title {
    position: absolute;
    right: 20vw;
    top: 8.8vh;
    color: #fff;
    font-size: 4.2vh;
    letter-spacing: 0.1em;
  }
  padding: 0 10.1vw;
  background: #050926;
}
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
        background: #F5F7FA;
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
      background: rgba(255, 255, 255, 0.75);
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

.mouse-right {
  display: none;
  position: fixed;
  width: 140px;
  border: 1px solid #ccc;
  padding: 7px 10px;
  background-color: #fff;
  text-align: center;
  box-shadow: 1px 1px 5px #ccc;
}
</style>
