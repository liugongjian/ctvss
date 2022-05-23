
<!-- 实时预览 -->
<template>
  <div v-loading="loading.group" class="app-container">
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div
        class="device-list"
        :style="`height: ${maxHeight}px`"
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
          <ScreenTree
            v-if="screenManager"
            :style="`width: ${dirDrag.width}px`"
            :height="maxHeight"
            :screen-manager="screenManager"
            :is-live="isLive"
          />
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

@Component({
  name: 'Live',
  components: {
    ScreenTree
  }
})
export default class extends Mixins(ScreenMixin) {
  private isLive = true
}
</script>
