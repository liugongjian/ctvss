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
            <div class="dir-list__tools" />
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
                :current-node-key="defaultKey"
                @node-click="openScreen"
              >
                <span slot-scope="{node, data}" class="custom-tree-node">
                  <span class="node-name">
                    <svg-icon :name="data.type" color="#6e7c89" />
                    {{ node.label }}
                    <status-badge v-if="checkTreeItemStatus(data)" status="on" />
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
                  :auto-play="true"
                  :has-control="false"
                />
                <div v-else class="tip-text">无信号</div>
                <el-tooltip content="关闭视频">
                  <el-button class="screen__close" type="text" @click="screen.reset()">
                    <i class="el-icon-close" />
                  </el-button>
                </el-tooltip>
              </template>
              <div v-else class="tip-text">请选择设备</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Mixins } from 'vue-property-decorator'
import DeviceMixin from './mixin'
import { DeviceModule } from '@/store/modules/device'
import { getGroups } from '@/api/group'
import { Group } from '@/type/group'
import StatusBadge from '@/components/StatusBadge/index.vue'
import Screen from './models/Screen'
import Player from './components/Player.vue'

@Component({
  name: 'Screen',
  components: {
    Player,
    StatusBadge
  }
})
export default class extends Mixins(DeviceMixin) {
  private currentIndex = 0
  private maxSize = 4
  private screenList: Array<Screen> = []
  private isFullscreen = false

  private get defaultKey() {
    const id = this.$route.query.deviceId || this.$route.query.id
    if (!id) {
      return null
    }
    return id
  }

  private mounted() {
    this.getGroupList()
    this.initScreen()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
    window.addEventListener('resize', this.checkFullscreen)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
    window.removeEventListener('resize', this.checkFullscreen)
  }

  /**
   * 获取组列表
   */
  private async getGroupList() {
    this.loading.group = true
    let params = {
      pageSize: 1000
    }
    const res = await getGroups(params)
    this.groupList = res.groups
    if (this.groupList.length) {
      if (!this.$route.query.groupId) {
        await DeviceModule.SetGroup(this.groupList[0])
        this.$route.query.groupId = this.groupList[0]
        this.$router.push({
          name: 'screen',
          query: {
            groupId: this.currentGroupId
          }
        })
      } else {
        const currentGroup = this.groupList.find((group: Group) => group.groupId === this.$route.query.groupId)
        await DeviceModule.SetGroup(currentGroup)
      }
      await this.initDirs()
    }
    this.loading.group = false
  }

  /**
   * 切换业务组
   */
  private async changeGroup() {
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
   * 初始化分屏
   */
  private initScreen() {
    // this.screenList = []
    // for (let i = 0; i < this.maxSize; i++) {
    //   const screen = new Screen()
    //   this.screenList.push(screen)
    // }
    let screenList: Array<Screen> = []
    let startIndex = 0
    if (this.screenList.length) {
      screenList = this.screenList.slice(0, this.maxSize)
      startIndex = screenList.length
    }
    for (let i = startIndex; i < this.maxSize; i++) {
      const screen = new Screen()
      screenList.push(screen)
    }
    this.screenList = screenList
  }

  /**
   * 打开分屏视频
   */
  private openScreen(item: any, node?: any) {
    if (item.type === 'ipc') {
      const screen = this.screenList[this.currentIndex]
      if (screen.deviceId) {
        screen.reset()
      }
      screen.deviceId = item.id
      screen.getUrl()
      if (this.currentIndex < (this.maxSize - 1)) this.currentIndex++
    }
  }

  /**
   * 选择分屏
   */
  private async selectScreen(index: number) {
    this.currentIndex = index
  }

  /**
   * 切换分屏数量
   */
  private changeMaxSize(size: number) {
    this.maxSize = size
    this.initScreen()
  }

  /**
   * 全屏
   */
  private fullscreen() {
    const element: any = document.documentElement
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    }
  }

  /**
   * 检查是否全屏
   */
  private checkFullscreen() {
    const doc: any = document
    this.isFullscreen = !!(doc.webkitIsFullScreen || doc.mozFullScreen || doc.msFullscreenElement || doc.fullscreenElement)
  }

  /**
   * 检查设备树中的设备项是否选择
   */
  private checkTreeItemStatus(item: any) {
    if (item.type !== 'ipc') return false
    return !!this.screenList.find(screen => screen.deviceId === item.id)
  }
}
</script>
<style lang="scss" scoped>
  .device-list {
    &__left {
      .dir-list {
        &__tree {
          .custom-tree-node {
            .status-badge {
              margin-left: 2px;
              margin-top: -2px;
            }
          }
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
  .screen-list {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    .screen-item {
      display: flex;
      flex: 1 0 50%;
      position: relative;
      background: #333;
      border: 2px solid #fff;
      justify-content: center;
      align-items: center;
      &.actived {
        border-color: $primary
      }
      ::v-deep .el-loading-mask {
        background: #333;
      }
      .tip-text {
        color: #fff;
      }
      ::v-deep video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        outline: none;
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
</style>
