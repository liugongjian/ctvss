<!-- 实时预览 -->
<template>
  <div v-loading="loading.group" class="app-container">
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div
        class="device-list"
        :style="`height: ${maxHeight}px`"
        :class="{ 'device-list--collapsed': !isExpanded, 'device-list--dragging': dirDrag.isDragging }"
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
          <ScreenTree
            v-if="screenManager"
            :style="`width: ${dirDrag.width}px`"
            :height="maxHeight"
            :screen-manager="screenManager"
            :is-live="isLive"
          >
            <template v-if="showRecordTool" slot="bottom">
              <div class="device-list__calander" :class="{ 'device-list__calander__hidden': isCollapse }">
                <div class="device-list__replay-type">
                  <ReplayType :screen-manager="screenManager" :screen="currentScreen" @change="onReplayTypeChange" />
                </div>
                <DatePicker :screen="currentScreen" :inline="true" @change="onDateChange" />
              </div>
              <el-button class="device-list__arrow" :class="{ 'device-list__arrow__active': isCollapse }" type="text" @click="isCollapse = !isCollapse">
                <svg-icon name="arrow-down" />
              </el-button>
            </template>
          </ScreenTree>
        </div>
        <ScreenBoard
          ref="screenBoard"
          class="device-list__right"
          :is-live="isLive"
          :in-protocol="currentGroupInProtocol"
          :has-live-replay-selector="true"
        />
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ScreenMixin from './mixin/screenMixin'
import ScreenTree from './components/ScreenBoard/ScreenTree.vue'
import DatePicker from './components/ScreenBoard/components/DatePicker.vue'
import ReplayType from './components/ScreenBoard/components/ReplayType.vue'

@Component({
  name: 'Replay',
  components: {
    ScreenTree,
    DatePicker,
    ReplayType
  }
})
export default class extends Mixins(ScreenMixin) {
  private isLive = false
  private isCollapse = false

  private get recordManager() {
    return this.currentScreen && this.currentScreen.recordManager
  }

  private get showRecordTool() {
    return (this.currentScreen && this.currentScreen.deviceId && !this.currentScreen.isLive) || this.screenManager.isSync
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
}
</script>
<style lang="scss" scoped>
  .device-list__replay-type {
    border-top: 1px solid $borderGrey;
    margin-top: -30px;
    padding-top: 95px;
    text-align: center;

    ::v-deep {
      .el-radio-button__inner {
        padding: 7px 25px;
      }
    }
  }

  .device-list__calander {
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

  .device-list__arrow {
    display: inline-block;
    text-align: center;
    width: 100%;
    background: #fff;
    padding: 0 0 5px;

    &__active {
      svg {
        transform: rotate(180deg);
      }
    }
  }
</style>
