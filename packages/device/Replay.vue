<template>
  <div class="app-container">
    <common-layout>
      <template slot="leftHeader">
        <!-- TODO -->
        <el-tooltip effect="dark" content="一键播放根目录" placement="top" :open-delay="300">
          <el-button type="text" @click="handleTools(toolsEnum.AutoPlay)">
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
        <replay-tree
          ref="deviceTree"
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
        <div class="bottom-tools">
          <advanced-search
            :search-form="advancedSearchForm"
            @search="handleTools(toolsEnum.AdvanceSearch, $event)"
          />
          <template v-if="showRecordTool">
            <div class="bottom-tools__calander" :class="{ 'bottom-tools__calander__hidden': isCollapse }">
              <div class="bottom-tools__replay-type">
                <ReplayType :screen-manager="screenManager" :screen="currentScreen" @change="onReplayTypeChange" />
              </div>
              <DatePicker :screen="currentScreen" :inline="true" @change="onDateChange" />
            </div>
            <el-button class="bottom-tools__arrow" :class="{ 'bottom-tools__arrow__active': isCollapse }" type="text" @click="isCollapse = !isCollapse">
              <svg-icon name="arrow-down" />
            </el-button>
          </template>
        </div>
      </template>
      <template slot="rightBody">
        <!-- TODO -->
        <screen-board
          ref="screenBoard"
          class="screen-board"
          :is-live="false"
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
import ReplayTree from '@vss/device/components/Tree/ReplayTree.vue'
import DatePicker from '@vss/device/components/ScreenBoard/components/DatePicker.vue'
import ReplayType from '@vss/device/components/ScreenBoard/components/ReplayType.vue'
import Breadcrumb from '@vss/device/components/Breadcrumb.vue'
import { ScreenManager } from '@vss/device/services/Screen/ScreenManager'
import { ScreenModule } from '@vss/device/store/modules/screen'
import { DeviceInTypeEnum } from '@vss/device/enums'

@Component({
  name: 'Replay',
  components: {
    ReplayTree,
    ScreenBoard,
    Breadcrumb,
    DatePicker,
    ReplayType
  }
})
export default class extends Mixins(layoutMxin) {
  public deviceInType = DeviceInTypeEnum.Video
  private isLive = false
  private isCollapse = false
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
  
  /**
   * 录像管理器实例
   */
  private get recordManager() {
    return this.currentScreen && this.currentScreen.recordManager
  }

  /**
   * 是否显示录像管理工具
   */
  private get showRecordTool() {
    return (this.currentScreen && this.currentScreen.deviceId && !this.currentScreen.isLive) || (this.screenManager && this.screenManager.isSync)
  }

  public created() {
    ScreenModule.clearPlayingScreen()
  }

  public mounted() {
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
   * 切换日期
   */
  private onDateChange(date) {
    this.screenManager.changeReplayDate(date)
  }

  /**
   * 切换录像类型
   */
  private onReplayTypeChange(recordType) {
    this.screenManager.changeReplayType(recordType)
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

.bottom-tools {
  flex: 1;

  &__replay-type {
    border-top: 1px solid $border-color-light-1;
    margin: 0;
    padding-top: 5px;
    text-align: center;

    ::v-deep {
      .el-radio-button__inner {
        padding: 7px 25px;
      }
    }
  }

  &__calander {
    max-height: 1000px;
    transition: all 0.5s;
    overflow: hidden;

    &__hidden {
      max-height: 0;
    }

    .datepicker {
      height: 260px;
    }
  }

  &__arrow {
    display: inline-block;
    text-align: center;
    width: 100%;
    background: #fff;
    padding: 5px;

    &__active {
      svg {
        transform: rotate(180deg);
      }
    }
  }
}

</style>
