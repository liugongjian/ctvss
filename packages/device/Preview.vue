<template>
  <div class="app-container">
    <common-layout>
      <template slot="leftHeader">
        <!-- TODO -->
        <el-tooltip effect="dark" content="轮巡根目录" placement="top" :open-delay="300">
          <el-button type="text" @click="handleTools(toolsEnum.Polling, null, statusEnum.On)">
            <svg-icon name="polling-play" />
          </el-button>
        </el-tooltip>
        <el-tooltip effect="dark" content="一键播放根目录" placement="top" :open-delay="300">
          <el-button type="text" @click="handleTools(toolsEnum.AutoPlay, null, statusEnum.On)">
            <svg-icon name="auto-play" />
          </el-button>
        </el-tooltip>
        <el-tooltip effect="dark" content="刷新目录" placement="top" :open-delay="300">
          <el-button type="text" @click="handleTools(toolsEnum.RefreshDirectory)">
            <svg-icon name="refresh" />
          </el-button>
        </el-tooltip>
      </template>
      <template slot="leftBody">
        <!-- TODO -->
        <preview-tree
          ref="deviceTree"
          v-loading="loading.tree"
          :load="treeLoad"
          :lazy="lazy"
          :data="treeSearchResult"
          @handle-node="handleTreeNode"
          @handle-tools="handleTools"
        />
        <polling-mask
          ref="pollingMask"
          :current-dir="currentDir"
          :screen-manager="screenManager"
          @polling-handle="handleTools"
        />
      </template>
      <template slot="leftBottom">
        <!-- TODO -->
        <advanced-search
          :search-form="advancedSearchForm"
          @search="handleTools(toolsEnum.AdvanceSearch, $event)"
        />
      </template>
      <template slot="rightBody">
        <!-- TODO -->
        <screen-board
          ref="screenBoard"
          class="screen-board"
          :is-live="true"
          :has-live-replay-selector="true"
        />
      </template>
    </common-layout>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import layoutMxin from '@vss/device/mixin/layoutMixin'
import ScreenBoard from '@vss/device/components/ScreenBoard/index.vue'
import PreviewTree from '@vss/device/components/Tree/PreviewTree.vue'
import Breadcrumb from '@vss/device/components/Breadcrumb.vue'
import { ScreenManager } from '@vss/device/services/Screen/ScreenManager'
import { ScreenModule } from '@vss/device/store/modules/screen'
import { DeviceInTypeEnum } from '@vss/device/enums'

@Component({
  name: 'Preview',
  components: {
    PreviewTree,
    ScreenBoard,
    Breadcrumb
  }
})
export default class extends Mixins(layoutMxin) {
  public deviceInType = DeviceInTypeEnum.Video
  // 分屏管理器实例
  public screenManager: ScreenManager = null

  // 视频队列执行器
  public get queueExecutor() {
    return this.screenManager && this.screenManager.refs.queueExecutor
  }

  // 当前选中的分屏
  public get currentScreen() {
    return this.screenManager && this.screenManager.currentScreen
  }

  public mounted() {
    ScreenModule.clearPlayingScreen()
    const screenBoard = this.$refs.screenBoard as ScreenBoard
    // @ts-ignore
    this.screenManager = screenBoard?.screenManager
    window.addEventListener('beforeunload', this.saveCache)
  }

  public destroyed() {
    this.saveCache()
    window.removeEventListener('beforeunload', this.saveCache)
  }

  /**
   * 树节点点击事件
   * @param item node信息
   */
  private handleTreeNode(item: any) {
    if (item.type !== this.deviceTypeEnum.Ipc) {
      this.deviceTree.loadChildren(item.id)
    }
    this.screenManager.openTreeItem(item, item.deviceStreamPullIndex)
  }

  /**
   * 保存分屏缓存
   */
  private saveCache() {
    this.screenManager.saveCache()
  }
}
</script>
<style lang="scss" scoped>
.screen-board {
  flex: 1;
  margin: -$margin-medium;
}
</style>
