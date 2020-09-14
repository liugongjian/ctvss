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
                    <svg-icon :name="data.type" color="#6e7c89" />
                    <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
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
            <el-tooltip content="两分屏" placement="top">
              <el-button type="text" @click="changeMaxSize(2)"><svg-icon name="screen2" /></el-button>
            </el-tooltip>
            <el-tooltip content="四分屏" placement="top">
              <el-button type="text" @click="changeMaxSize(4)"><svg-icon name="screen4" /></el-button>
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
              class="screen-item"
              :class="{'actived': index === currentIndex}"
              @click="selectScreen(index)"
            >
              <template v-if="screen.loaded">
                <replay-view :device-id="screen.deviceId" />
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
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Mixins } from 'vue-property-decorator'
import ScreenMixin from './mixin/screenMixin'
import { DeviceModule } from '@/store/modules/device'
import { getGroups } from '@/api/group'
import { Group } from '@/type/group'
import StatusBadge from '@/components/StatusBadge/index.vue'
import ReplayView from './components/ReplayView.vue'

@Component({
  name: 'Record',
  components: {
    ReplayView,
    StatusBadge
  }
})
export default class extends Mixins(ScreenMixin) {
  public maxSize = 1

  private get deviceId() {
    return this.$route.query.deviceId || null
  }

  private mounted() {
    this.getGroupList('replay')
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
   * 切换业务组
   */
  public async changeGroup() {
    const currentGroup = this.groupList.find((group: Group) => group.groupId === this.groupId)
    await DeviceModule.SetGroup(currentGroup)
    this.$router.push({
      name: 'replay',
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
      ::v-deep .replay-view {
        flex: 1;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .filter-container {
          position: absolute;
          right: 50px;
          top: 6px;
          .el-date-editor {
            .el-input__inner {
              background: #555;
              color: #fff;
              border: none;
              font-size: 12px;
              height: 28px;
              line-height: 28px;
            }
            .el-input__icon {
              line-height: 28px;
            }
          }
          .el-radio-group {
            .el-radio-button__inner {
              padding: 6px 7px;
              background: #555;
              color: #fff;
              border: none;
            }
            .el-radio-button.is-active .el-radio-button__inner {
              background: $primary;
            }
          }
        }
        .replay-player {
          margin-top: 40px;
          display: flex;
          flex: 1;
          flex-direction: column;
          .video-wrap {
            flex: 1;
            position: relative;
            video {
              position: absolute;
              background: #000;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
          }
        }
        .replay-time-list {
          background: #fff;
          margin-top: 40px;
          padding: 15px;
        }
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
        top: 11px;
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
</style>
