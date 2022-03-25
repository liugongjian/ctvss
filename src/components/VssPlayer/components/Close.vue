<!-- 关闭视频 -->
<template>
  <el-tooltip content="关闭视频">
    <el-button class="close" type="text" @click="close">
      <svg-icon name="close" width="14" height="14" />
    </el-button>
  </el-tooltip>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Close'
})
export default class extends ComponentMixin {
  private close() {
    this.$emit('dispatch', {
      eventType: 'close'
    })
  }
}
</script>

<style lang="scss" scoped>
  .close {
    padding: 5px 8px;
    height: auto;
    line-height: 100%;
    color: #fff;
    background: rgba(0, 0, 0, 0.4);
  }
</style>
