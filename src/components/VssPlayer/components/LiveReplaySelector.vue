<!-- 录像回放 / 实时预览切换 -->
<template>
  <el-tooltip v-if="isLive" content="录像回放" placement="top">
    <div class="control__btn" @click.stop.prevent="toggleLiveReplay">
      <svg-icon name="playback2" width="18px" height="18px" />
    </div>
  </el-tooltip>
  <el-tooltip v-else content="播放实时监控" placement="top">
    <div class="control__btn" @click.stop.prevent="toggleLiveReplay">
      <svg-icon name="ipc" width="18px" height="18px" />
    </div>
  </el-tooltip>
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

  private toggleLiveReplay() {
    this.$emit('dispatch', {
      eventType: 'toggleLiveReplay',
      payload: !this.isLive
    })
  }
}

</script>
