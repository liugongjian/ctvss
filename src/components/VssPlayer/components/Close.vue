<!-- 关闭视频 -->
<template>
  <el-tooltip content="关闭视频">
    <el-button type="text">
      <svg-icon name="close" width="18" height="18" />
    </el-button>
  </el-tooltip>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Snapshot'
})
export default class extends ComponentMixin {
}
</script>
