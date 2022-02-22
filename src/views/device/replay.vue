<!-- 录像回放 -->
<template>
  <div v-loading="loading.group" class="app-container">
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
              <el-tooltip class="item" effect="dark" content="刷新目录" placement="top" :open-delay="300">
                <el-button type="text" @click="initDirs"><svg-icon name="refresh" /></el-button>
              </el-tooltip>
            </div>
            <div v-loading="loading.dir" class="dir-list__tree device-list__max-height" :style="{height: `${maxHeight}px`}">
              <el-tree
                v-if="!search.revertSearchFlag"
                key="replay-el-tree-original"
                ref="dirTree"
                empty-text="暂无目录或设备"
                :data="dirList"
                node-key="id"
                highlight-current
                lazy
                :load="loadDirs"
                :props="treeProp"
                :default-expand-all="!!search.searchKey"
                @node-click="openScreen"
              >
                <span
                  slot-scope="{node, data}"
                  class="custom-tree-node"
                  :class="{'online': data.deviceStatus === 'on', 'offline': (data.deviceStatus !== 'on' && data.type === 'ipc')}"
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
                      content="一键播放"
                      placement="top"
                      :open-delay="300"
                    >
                      <el-button
                        v-if="data.type === 'nvr' || data.type === 'dir' || data.type === 'group'"
                        type="text"
                        @click="videosOnAutoPlay(node, true)"
                      >
                        <svg-icon name="auto-play" />
                      </el-button>
                    </el-tooltip>
                  </div>
                </span>
              </el-tree>
              <el-tree
                v-else
                key="replay-el-tree-filter"
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
                      content="一键播放"
                      placement="top"
                      :open-delay="300"
                    >
                      <el-button
                        v-if="data.type === 'nvr' || data.type === 'dir' || data.type === 'group'"
                        type="text"
                        @click="videosOnAutoPlay(node, true)"
                      >
                        <svg-icon name="auto-play" />
                      </el-button>
                    </el-tooltip>
                  </div>
                </span>
              </el-tree>
            </div>
            <div v-if="currentGroup.inProtocol === 'gb28181'" class="dir-list__search">
              <el-dropdown placement="top-start" @command="changeSearchStatus">
                <el-button class="dir-list__search-button" :type="search.statusKey === 'all' ? 'default': 'primary'" size="mini" style="margin-right: 5px!important">
                  <svg-icon name="filter" />
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="option in search.statusOptions" :key="option.label" :command="option.value">
                    <i v-if="search.statusKey === option.value" class="el-icon-check" />{{ option.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-tooltip class="item" effect="dark" content="支持国标ID、设备IP、设备名查询" placement="top-start">
                <!-- TIPS 需要处理为空时候的直接回车 -->
                <el-input v-model="search.inputKey" size="mini" placeholder="支持国标ID、设备IP、设备名查询" @keyup.enter.native="enterKeySearch" />
              </el-tooltip>
              <el-button class="dir-list__search-button" type="primary" size="mini" icon="el-icon-search" :disabled="!search.inputKey.length" @click="filterSearchResult" />
              <el-button v-if="search.revertSearchFlag" class="dir-list__search-button" type="primary" size="mini" @click="revertSearchResult">
                <svg-icon name="revert" />
              </el-button>
            </div>
          </div>
        </div>
        <div class="device-list__right">
          <div class="device__tools">
            <div class="device__tools--right">
              <el-dropdown trigger="click" placement="bottom-start" @command="handleScreenSize">
                <el-tooltip content="选择分屏" placement="top">
                  <el-button>
                    <svg-icon name="screen" />
                  </el-button>
                </el-tooltip>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="(item, index) in replayScreenSizeList"
                    :key="index"
                    :command="item.value"
                    :class="{'el-dropdown-item__active': item.value === screenSize}"
                  >
                    <span class="el-dropdown-menu__screen-icon"><svg-icon :name="`screen${item.value}`" /></span>
                    <label>{{ item.label }}</label>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-tooltip content="全屏" placement="top">
                <el-button type="text" @click="fullscreen"><svg-icon name="fullscreen" /></el-button>
              </el-tooltip>
            </div>
          </div>
          <div class="screen-list" :class="[{'fullscreen': isFullscreen}]">
            <div class="screen-wrap" :class="`screen-size--${screenSize}`">
              <div
                v-for="(screen, index) in screenList"
                :key="index"
                class="screen-item"
                :style="`grid-area: item${index}`"
                :class="[{'actived': index === currentIndex && screenList.length > 1}, {'fullscreen': screen.isFullscreen}]"
                @click="selectScreen(index)"
              >
                <template v-if="screen.loaded">
                  <player-container :on-can-play="screen.onCanPlay" :calendar-focus="screen.calendarFocus">
                    <div slot="header" class="screen-header">
                      <!-- <div class="device-name">{{ screen.deviceName }}</div> -->
                      <div class="screen__tools">
                        <el-tooltip content="关闭视频">
                          <el-button class="screen__close" type="text" @click="screen.reset()">
                            <svg-icon name="close" width="12" height="12" />
                          </el-button>
                        </el-tooltip>
                      </div>
                    </div>
                    <replay-view
                      :device-id="screen.deviceId"
                      :in-protocol="currentGroupInProtocol"
                      :is-fullscreen="screen.isFullscreen"
                      :has-playlive="false"
                      :screen="screen"
                      :default-volume="screen.volume"
                      @onCurrentDateChange="onCurrentDateChange(screen, ...arguments)"
                      @onCurrentTimeChange="onCurrentTimeChange(screen, ...arguments)"
                      @onReplayTypeChange="onReplayTypeChange(screen, ...arguments)"
                      @onCalendarFocus="onCalendarFocus(screen, ...arguments)"
                      @onCanPlay="playEvent(screen, ...arguments)"
                      @onVolumeChange="onVolumeChange(screen, ...arguments)"
                      @onFullscreen="screen.fullscreen();fullscreen()"
                      @onExitFullscreen="screen.exitFullscreen();exitFullscreen()"
                    />
                  </player-container>
                </template>
                <div v-else class="tip-text tip-select-device">
                  <el-button type="text" @click="selectDevice(screen)">请选择设备</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    <device-dir v-if="dialogs.deviceDir" @on-close="onDeviceDirClose" />
  </div>
</template>
<script lang="ts">
import { Component, Watch, Mixins } from 'vue-property-decorator'
import ScreenMixin from './mixin/screenMixin'
import { Device } from '@/type/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import ReplayView from './components/ReplayView.vue'
import PlayerContainer from './components/PlayerContainer.vue'
import DeviceDir from './components/dialogs/DeviceDir.vue'
import { renderAlertType, getSums } from '@/utils/device'
import { VGroupModule } from '@/store/modules/vgroup'
import { getDeviceTree } from '@/api/device'

@Component({
  name: 'Record',
  components: {
    ReplayView,
    StatusBadge,
    DeviceDir,
    PlayerContainer
  }
})
export default class extends Mixins(ScreenMixin) {
  private renderAlertType = renderAlertType
  private getSums = getSums
  public screenSize = '1'
  public maxSize = 1

  private get deviceId() {
    return this.$route.query.deviceId || null
  }

  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: String) {
    this.search = {
      ...this.search,
      inputKey: '',
      searchKey: '',
      statusKey: 'all',
      revertSearchFlag: false
    }
    if (!groupId) return
    this.$nextTick(() => {
      this.currentIndex = 0
      this.screenList.forEach(screen => {
        screen.reset()
      })
      this.initDirs()
    })
  }

  private mounted() {
    this.initSearchStatus()
    this.initScreen()
    this.calMaxHeight()
    this.initScreenCache('replay')
    window.addEventListener('resize', this.calMaxHeight)
    window.addEventListener('resize', this.checkFullscreen)
  }

  private beforeDestroy() {
    this.setScreenCache({ type: 'replay' })
  }

  private destroyed() {
    VGroupModule.resetVGroupInfo()
    this.screenList.forEach(screen => {
      screen.reset()
    })
    window.removeEventListener('resize', this.calMaxHeight)
    window.removeEventListener('resize', this.checkFullscreen)
    // window.removeEventListener('beforeunload', () => this.setScreenCache('replay'))
  }

  /**
   * 打开分屏视频
   */
  private openScreen(item: any) {
    // 设置虚拟业务组相关信息
    VGroupModule.SetRoleID(item.roleId || '')
    VGroupModule.SetRealGroupId(item.realGroupId || '')
    VGroupModule.SetRealGroupInProtocol(item.realGroupInProtocol || '')

    if (item.type === 'ipc' || item.type === 'stream') {
      const screen = this.screenList[this.currentIndex]
      if (screen.deviceId) {
        screen.reset()
      }
      if (this.currentIndex < (this.maxSize - 1)) this.currentIndex++
      this.$nextTick(() => {
        screen.deviceId = item.id
        screen.deviceName = item.label
        screen.loaded = true
      })
    }
  }

  /**
   * 一键播放
   */
  private async videosOnAutoPlay(node: any, isRoot: boolean) {
    this.autoPlayDevices = []
    if (node) {
      this.currentNode = node
      // 设置虚拟业务组相关信息
      VGroupModule.SetRoleID(this.currentNode!.data.roleId || '')
      VGroupModule.SetRealGroupId(this.currentNode!.data.realGroupId || '')
      VGroupModule.SetRealGroupInProtocol(this.currentNode!.data.realGroupInProtocol || '')
    }
    if (!isRoot) {
      this.dirList.forEach((item: any) => {
        if (item.type === 'ipc') {
          this.autoPlayDevices.push(item)
        }
      })
    } else {
      if (this.$route.query.searchKey) {
        node.data.children.forEach((item: any) => {
          if (item.type === 'ipc') {
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
          if (item.type === 'ipc') {
            this.autoPlayDevices.push(item)
          }
        })
      }
    }
    if (!this.autoPlayDevices.length) {
      this.$alert(`当前设备数需大于0才可开始自动播放`, '提示', {
        confirmButtonText: '确定'
      })
    }
    this.currentIndex = 0
    for (let i = 0; i < this.maxSize; i++) {
      this.screenList[i].reset()
      if (!this.autoPlayDevices[i]) {
        continue
      } else {
        this.openScreen(this.autoPlayDevices[i])
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
  }
</style>
