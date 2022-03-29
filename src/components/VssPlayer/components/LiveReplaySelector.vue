<!-- 录像回放 / 实时预览切换 -->
<template>
  <span v-if="isButton">
    <el-tooltip v-if="isLive" content="播放录像回放" placement="top">
      <div class="control__btn control__live-replay-selector" @click.stop.prevent="toggleLiveReplay">
        <svg-icon name="playback2" />
      </div>
    </el-tooltip>
    <el-tooltip v-else content="播放实时预览" placement="top">
      <div class="control__btn control__live-replay-selector" @click.stop.prevent="toggleLiveReplay">
        <svg-icon name="ipc" />
      </div>
    </el-tooltip>
  </span>
  <div v-else class="toggle-live-replay">
    <el-button v-if="isLive" type="text" size="small" @click.stop.prevent="toggleLiveReplay">
      播放录像回放
    </el-button>
    <el-button v-else type="text" size="small" @click.stop.prevent="toggleLiveReplay">
      播放实时预览
    </el-button>
  </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'LiveReplaySelector'
})
export default class extends ComponentMixin {
  @Prop()
  private isLive

  @Prop({
    default: true
  })
  private isButton

  private toggleLiveReplay() {
    this.$emit('dispatch', {
      eventType: 'toggleLiveReplay'
    })
  }
}

</script>
