<!-- 分屏预览 -->
<template>
  <div v-loading="loading.group" class="app-container">
    <div class="filter-container">
      <el-select
        v-model="groupId"
        class="filter-group"
        placeholder="请选择业务组"
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
              <el-tooltip class="item" effect="dark" content="刷新目录" placement="top" :open-delay="300">
                <el-button type="text" @click="initDirs"><i class="el-icon-refresh" /></el-button>
              </el-tooltip>
            </div>
            <div v-loading="loading.dir" class="dir-list__tree device-list__max-height" :style="{height: `${maxHeight}px`}">
              <el-button size="mini" class="dir-list__tree polling-button" @click="videosOnPolling(-1)">轮巡根目录</el-button>
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
                <span slot-scope="{node, data}" class="custom-tree-node" :class="{'offline': data.type === 'ipc' && data.streamStatus !== 'on'}" @contextmenu="openMenu($event, node)">
                  <span class="node-name">
                    <svg-icon :name="data.type" />
                    <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                    {{ node.label }}
                    <svg-icon v-if="checkTreeItemStatus(data)" name="playing" class="playing" />
                    <i v-if="data.type === 'nvr' || data.type === 'dir'" class="el-icon-video-play" style="float: right;" @click="videosOnPolling(1)" />
                  </span>
                </span>
              </el-tree>
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
          <div class="tool-buttons">
            <el-button @click="electronicZoom">{{ electronicZoomInfo?'关闭电子放大':'开启电子放大' }}</el-button>
            <el-button v-if="polling.isStart" @click="stopPolling()">停止轮巡</el-button>
            <el-select v-if="polling.isStart" v-model="polling.interval" class="tool-buttons--select" placeholder="请选择" @change="intervalChange">
              <el-option
                v-for="item in pollingInterval"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="screen-list" :class="[`screen-size--${maxSize}`, {'fullscreen': isFullscreen}]">
            <div
              v-for="(screen, index) in screenList"
              :key="index"
              v-loading="screen.loading"
              class="screen-item"
              :class="{'actived': index === currentIndex}"
              @click="selectScreen(index)"
            >
              <template v-if="screen.loaded">
                <player
                  v-if="screen.url"
                  :type="screen.type"
                  :url="screen.url"
                  :is-live="true"
                  :auto-play="true"
                  :has-control="false"
                  :is-zoom="electronicZoomInfo"
                  :device-name="screen.deviceName"
                  @onRetry="onRetry(screen)"
                />
                <div v-else class="tip-text">无信号</div>
                <div class="screen-header">
                  <div class="device-name">{{ screen.deviceName }}</div>
                  <el-tooltip content="关闭视频">
                    <el-button class="screen__close" type="text" @click="screen.reset()">
                      <i class="el-icon-close" />
                    </el-button>
                  </el-tooltip>
                </div>
              </template>
              <div v-else class="tip-text">请选择设备</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <div id="mouse-right" class="mouse-right" @click="videosOnPolling(1)">
      轮巡
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Mixins } from 'vue-property-decorator'
import { DeviceModule } from '@/store/modules/device'
import { Group } from '@/type/group'
import ScreenMixin from './mixin/screenMixin'
import StatusBadge from '@/components/StatusBadge/index.vue'
import Screen from './models/Screen'
import Player from './components/Player.vue'
import { getDeviceTree } from '@/api/device'
import { clear } from 'console'

@Component({
  name: 'Screen',
  components: {
    Player,
    StatusBadge
  }
})
export default class extends Mixins(ScreenMixin) {
  public maxSize = 4
  private currentPollingIndex = 0
  private isZoom = false
  private electronicZoomInfo = false
  private polling = {
    interval: 5,
    isStart: false
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
   * 需要轮训的视频
   */
  private async videosOnPolling(dir: number) {
    this.polling.isStart = true
    this.pollingDevices = []
    if (dir === -1) {
      console.log('轮训根目录')
      this.dirList.forEach((item: any) => {
        if (item.type === 'ipc' && item.streamStatus === 'on') {
          this.pollingDevices.push(item)
        }
      })
    } else {
      console.log('查询dir下设备')
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
    this.interval && clearInterval(this.interval)
    this.interval = setInterval(this.pollingVideos, this.polling.interval * 1000)
  }

  private intervalChange() {
    console.log(this.polling.interval)
    if (this.polling.isStart) {
      this.interval && clearInterval(this.interval)
      this.interval = setInterval(this.pollingVideos, this.polling.interval * 1000)
    }
  }

  private stopPolling() {
    if (this.polling.isStart) {
      this.polling.isStart = false
      clearInterval(this.interval!)
    }
  }

  /**
   * 轮训
   */
  private pollingVideos() {
    console.log('轮训')
    const length = this.pollingDevices.length
    this.currentIndex = 0
    for (let i = 0; i < this.maxSize; i++) {
      this.screenList[i].deviceId = this.pollingDevices[(this.currentPollingIndex + i) % length].id
      this.screenList[i].deviceName = this.pollingDevices[(this.currentPollingIndex + i) % length].label
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
   * 右键菜单
   */
  public openMenu(event: MouseEvent, node: any) {
    console.log(event, node)
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
   * 是否开启电子放大
   */
  private electronicZoom() {
    if (this.electronicZoomInfo) {
      this.electronicZoomInfo = false
      this.$message({
        message: '已关闭电子放大',
        type: 'warning'
      })
    } else {
      this.electronicZoomInfo = true
      this.$message({
        message: '已开启电子放大',
        type: 'success'
      })
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
      .polling {
        color: blue;
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

    .device__tools {
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      border-bottom: 1px solid $borderGrey;
      background: #f8f8f8;
      transition: padding-left .2s;
      label {
        margin-right: 10px;
      }
      .el-button {
        color: #5a5e66;
        padding: 0;
      }
      &--right {
        float: right;
        .el-button {
          font-size: 16px;
        }
      }
    }
  }

  .tool-buttons {
    height: 40px;

    &--select {
      margin-left: 10px;
    }
  }

  .screen-list {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    .screen-item {
      display: flex;
      flex: 1 0 50%;
      position: relative;
      background: #333;
      border: 3px solid #fff;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      &.actived {
        border-color: $primary;
        &:before {
          content: ' ';
          position: absolute;
          z-index: 10;
          width: 30px;
          height: 30px;
          left: -15px;
          top: -15px;
          background: $primary;
          transform: rotate(45deg);
        }
      }
      ::v-deep .el-loading-mask {
        background: #333;
      }
      .tip-text {
        color: #fff;
      }
      ::v-deep video,
      ::v-deep .video-wrap {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        outline: none;
      }
      ::v-deep .video-wrap {
        display: flex;
        align-items: center;
        overflow: hidden;
      }
      .screen__close {
        position: absolute;
        z-index: 10;
        right: 10px;
        top: 10px;
        font-size: 18px;
        color: #fff;
        padding: 0;
      }
      .device-name {
        position: absolute;
        z-index: 10;
        left: 15px;
        top: 15px;
        color: #fff;
      }
    }
    &.screen-size--9 .screen-item {
      flex-basis: 33%;
    }
    &.screen-size--16 .screen-item {
      flex-basis: 25%;
    }
    &.fullscreen {
      position: fixed;
      z-index: 1001;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }

  .mouse-right {
    display: none;
    position: fixed;
    width: 140px;
    border: 1px solid #dcdfe6;
    padding: 5px 10px;
    background-color: white;
    text-align: center;
  }
</style>
