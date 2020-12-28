<!-- 分屏预览 -->
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
                <span slot-scope="{node, data}" class="custom-tree-node">
                  <span class="node-name">
                    <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                    <span v-else class="node-dir">
                      <svg-icon name="dir" width="15" height="15" />
                      <svg-icon name="dir-close" width="15" height="15" />
                    </span>
                    <!-- <status-badge v-if="data.streamStatus" :status="data.streamStatus" /> -->
                    {{ node.label }}
                    <svg-icon v-if="checkTreeItemStatus(data)" name="playing" class="playing" />
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
            <template v-if="currentGroupId !== '80337930297556992'">
              <el-tooltip content="两分屏" placement="top">
                <el-button type="text" @click="changeMaxSize(2)"><svg-icon name="screen2" /></el-button>
              </el-tooltip>
              <el-tooltip content="四分屏" placement="top">
                <el-button type="text" @click="changeMaxSize(4)"><svg-icon name="screen4" /></el-button>
              </el-tooltip>
            </template>
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
              class="screen-item"
              :class="[{'actived': index === currentIndex && screenList.length > 1}, {'fullscreen': screen.isFullscreen}]"
              @click="selectScreen(index)"
            >
              <template v-if="screen.loaded">
                <replay-view
                  :device-id="screen.deviceId"
                  :is-fullscreen="screen.isFullscreen"
                  @onFullscreen="screen.fullscreen();fullscreen()"
                  @onExitFullscreen="screen.exitFullscreen();exitFullscreen()"
                />
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
    <device-dir v-if="dialogs.deviceDir" @on-close="onDeviceDirClose" />
  </div>
</template>
<script lang="ts">
import { Component, Watch, Mixins } from 'vue-property-decorator'
import ScreenMixin from './mixin/screenMixin'
import { Device } from '@/type/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import ReplayView from './components/ReplayView.vue'
import DeviceDir from './components/dialogs/DeviceDir.vue'

@Component({
  name: 'Record',
  components: {
    ReplayView,
    StatusBadge,
    DeviceDir
  }
})
export default class extends Mixins(ScreenMixin) {
  public maxSize = 1

  private get deviceId() {
    return this.$route.query.deviceId || null
  }

  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: String) {
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
    this.initScreen()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
    window.addEventListener('resize', this.checkFullscreen)
  }

  private destroyed() {
    this.screenList.forEach(screen => {
      screen.reset()
    })
    window.removeEventListener('resize', this.calMaxHeight)
    window.removeEventListener('resize', this.checkFullscreen)
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
  private openScreen(item: any) {
    if (item.type === 'ipc') {
      const screen = this.screenList[this.currentIndex]
      if (screen.deviceId) {
        screen.reset()
      }
      this.$nextTick(() => {
        screen.deviceId = item.id
        screen.deviceName = item.label
        screen.loaded = true
        if (this.currentIndex < (this.maxSize - 1)) this.currentIndex++
      })
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
      .offline .node-name {
        cursor: not-allowed;
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
  }
</style>
