<!-- 分屏预览 -->
<template>
  <div v-loading="loading.group" class="app-container">
    <div class="filter-container">
      <el-select
        v-model="groupId"
        class="filter-group"
        placeholder="请选择业务组"
        :disabled="polling.isStart"
        @change="changeGroup"
      >
        <el-option
          v-for="item in groupList"
          :key="item.groupId"
          :label="item.groupName"
          :value="item.groupId"
        />
      </el-select>
    </div>
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div class="device-list" :class="{'device-list--collapsed': !isExpanded, 'device-list--dragging': dirDrag.isDragging}">
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
              <el-tooltip class="item" effect="dark" content="轮巡根目录" placement="top" :open-delay="300">
                <el-button v-if="!polling.isStart" type="text" @click="videosOnPolling(null, false)"><svg-icon name="polling-play" /></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="刷新目录" placement="top" :open-delay="300">
                <el-button type="text" @click="initDirs"><svg-icon name="refresh" /></el-button>
              </el-tooltip>
            </div>
            <div v-loading="loading.dir" class="dir-list__tree device-list__max-height" :style="{height: `${maxHeight}px`}">
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
                <span slot-scope="{node, data}" class="custom-tree-node" :class="{'offline': data.type === 'ipc' && data.streamStatus !== 'on'}" @contextmenu="($event, node)">
                  <span class="node-name">
                    <svg-icon :name="data.type" />
                    <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                    {{ node.label }}
                    <svg-icon v-if="checkTreeItemStatus(data)" name="playing" class="playing" />
                  </span>
                  <el-tooltip class="item" effect="dark" content="轮巡当前目录" placement="top" :open-delay="300">
                    <i class="polling">
                      <svg-icon v-if="data.type === 'nvr' || data.type === 'dir'" name="polling-play" width="16px" height="16px" @click.stop.prevent="videosOnPolling(node, true)" />
                    </i>
                  </el-tooltip>
                </span>
              </el-tree>
              <div v-if="polling.isStart" class="polling-mask">
                <div class="polling-mask__tools">
                  <div class="polling-mask__tools__status">
                    <span v-if="!polling.isPause">当前轮巡中...</span>
                    <span v-else>轮巡已暂停</span>
                  </div>
                  <div class="polling-mask__tools__item">
                    <svg-icon name="clock" class="polling-mask__tools__clock" width="16px" height="16px" />
                    <el-select v-model="polling.interval" class="polling-mask__tools__select" size="mini" placeholder="请选择" @change="intervalChange">
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
        </div>
        <div class="device-list__right">
          <div class="device__tools">
            <label>分屏数:</label>
            <el-tooltip content="单分屏" placement="top">
              <el-button type="text" @click="changeMaxSize(1)"><svg-icon name="screen1" /></el-button>
            </el-tooltip>
            <el-tooltip content="四分屏" placement="top">
              <el-button type="text" @click="changeMaxSize(4)"><svg-icon name="screen4" /></el-button>
            </el-tooltip>
            <el-tooltip content="九分屏" placement="top">
              <el-button type="text" @click="changeMaxSize(9)"><svg-icon name="screen9" /></el-button>
            </el-tooltip>
            <el-tooltip content="十六分屏" placement="top">
              <el-button type="text" @click="changeMaxSize(16)"><svg-icon name="screen16" /></el-button>
            </el-tooltip>
            <div class="device__tools--right">
              <el-tooltip content="全屏" placement="top">
                <el-button type="text" @click="fullscreen"><svg-icon name="fullscreen" /></el-button>
              </el-tooltip>
            </div>
          </div>
          <div class="screen-list" :class="[`screen-size--${maxSize}`, {'fullscreen': isFullscreen}]">
            <div
              v-for="(screen, index) in screenList"
              :key="index"
              v-loading="screen.loading"
              class="screen-item"
              :class="[{'actived': index === currentIndex && !polling.isStart}, {'fullscreen': screen.isFullscreen}]"
              @click="selectScreen(index)"
            >
              <template v-if="screen.loaded">
                <template v-if="screen.isLive">
                  <div class="live-view">
                    <player
                      v-if="screen.url"
                      :type="screen.type"
                      :url="screen.url"
                      :is-live="true"
                      :is-ws="true"
                      :is-fullscreen="screen.isFullscreen"
                      :auto-play="true"
                      :has-control="false"
                      :has-playback="true"
                      :device-name="screen.deviceName"
                      @onRetry="onRetry(screen)"
                      @onPlayback="onPlayback(screen)"
                      @onFullscreen="screen.fullscreen();fullscreen()"
                      @onExitFullscreen="screen.exitFullscreen();exitFullscreen()"
                    />
                    <div v-else class="tip-text">无信号</div>
                  </div>
                </template>
                <template v-else>
                  <replay-view :device-id="screen.deviceId" :has-playlive="true" @onPlaylive="onPlaylive(screen)" />
                </template>
                <div class="screen-header">
                  <div class="device-name">{{ screen.deviceName }}</div>
                  <div class="screen__tools">
                    <el-tooltip content="关闭视频">
                      <el-button class="screen__close" type="text" @click="screen.reset()">
                        <svg-icon name="close" width="12" height="12" />
                      </el-button>
                    </el-tooltip>
                  </div>
                </div>
              </template>
              <div v-else class="tip-text tip-select-device">
                <el-button type="text" @click="selectDevice(screen)">请选择设备</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <div id="mouse-right" class="mouse-right" @click="videosOnPolling(null, true)">
      轮巡当前目录
    </div>
    <device-dir v-if="dialogs.deviceDir" @on-close="onDeviceDirClose" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Mixins } from 'vue-property-decorator'
import { DeviceModule } from '@/store/modules/device'
import { Group } from '@/type/group'
import { Device } from '@/type/device'
import ScreenMixin from './mixin/screenMixin'
import StatusBadge from '@/components/StatusBadge/index.vue'
import Screen from './models/Screen'
import Player from './components/Player.vue'
import ReplayView from './components/ReplayView.vue'
import DeviceDir from './components/dialogs/DeviceDir.vue'
import { getDeviceTree } from '@/api/device'
import { clear } from 'console'

@Component({
  name: 'Screen',
  components: {
    Player,
    ReplayView,
    DeviceDir,
    StatusBadge
  }
})
export default class extends Mixins(ScreenMixin) {
  public maxSize = 4
  private currentPollingIndex = 0
  private isZoom = false
  private polling = {
    interval: 10,
    isStart: false,
    isPause: false
  }
  private interval?: NodeJS.Timeout
  private currentNode?: Record<string, any> = {
    data: {}
  }
  private pollingDevices: Record<string, any>[] = []
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

  private mounted() {
    this.getGroupList('screen')
    this.initScreen()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
    window.addEventListener('resize', this.checkFullscreen)
  }

  private beforeDestroy() {
    this.interval && clearInterval(this.interval)
  }

  private destroyed() {
    this.screenList.forEach(screen => {
      screen.reset()
    })
    window.removeEventListener('resize', this.calMaxHeight)
    window.removeEventListener('resize', this.checkFullscreen)
  }

  /**
   * 切换业务组
   */
  public async changeGroup() {
    const currentGroup = this.groupList.find((group: Group) => group.groupId === this.groupId)
    await DeviceModule.SetGroup(currentGroup)
    this.$router.push({
      name: 'screen',
      query: {
        groupId: this.currentGroupId
      }
    })
    await this.initDirs()
  }

  /**
   * 清空初始化树状态默认方法
   */
  public async initTreeStatus() {}

  /**
   * 打开分屏视频
   */
  private openScreen(item: any, node?: any) {
    if (this.polling.isStart) {
      this.$message({
        message: '请先关闭轮巡再进行选择',
        type: 'warning'
      })
      return
    }
    if (item.type === 'ipc' && item.streamStatus === 'on') {
      const screen = this.screenList[this.currentIndex]
      if (screen.deviceId) {
        screen.reset()
      }
      screen.deviceId = item.id
      screen.deviceName = item.label
      screen.getUrl()
      if (this.currentIndex < (this.maxSize - 1)) this.currentIndex++
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
   * 需要轮巡的视频
   */
  private async videosOnPolling(node:any, isDir: boolean) {
    this.pollingDevices = []
    if (node) {
      this.currentNode = node
    }
    if (!isDir) {
      console.log('轮巡根目录')
      this.dirList.forEach((item: any) => {
        if (item.type === 'ipc' && item.streamStatus === 'on') {
          this.pollingDevices.push(item)
        }
      })
    } else {
      console.log('查询node下设备')
      let data = await getDeviceTree({
        groupId: this.currentGroupId,
        id: this.currentNode!.data.id,
        type: this.currentNode!.data.type
      })
      data.dirs.forEach((item: any) => {
        if (item.type === 'ipc' && item.streamStatus === 'on') {
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
      this.interval = setInterval(this.pollingVideos, this.polling.interval * 1000)
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
      this.screenList[i].deviceId = this.pollingDevices[(this.currentPollingIndex + i % length) % length].id
      this.screenList[i].deviceName = this.pollingDevices[(this.currentPollingIndex + i % length) % length].label
      this.screenList[i].getUrl()
      if (this.currentIndex < (this.maxSize - 1)) {
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
  private onRetry(screen: Screen) {
    setTimeout(async() => {
      screen.url = ''
      await screen.getUrl()
      if (screen.retry) {
        this.onRetry(screen)
      }
    }, 30 * 1000)
  }

  /**
   * 录像回放
   */
  private onPlayback(screen: Screen) {
    screen.isLive = false
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
  .device-list {
    &__left {
      .playing {
        color: $success;
      }
      .polling {
        position: absolute;
        right: 0;
        top: 4px;
        outline: none;
        .svg-icon {
          color: $text;
        }
      }
      .offline .node-name {
        cursor: not-allowed;
        color: #aaa;
        .svg-icon {
          color: #ccc;
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
      .polling-mask {
        position: absolute;
        display: flex;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        background: rgba(255, 255, 255, .75);
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
