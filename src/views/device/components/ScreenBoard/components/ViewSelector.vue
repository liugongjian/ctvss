<template>
  <el-radio-group v-model="screenManager.view" class="screen-tools__btn" size="mini">
    <el-tooltip content="分屏视图" placement="top">
      <el-radio-button label="screen"><svg-icon name="timeline" width="15" height="15" /></el-radio-button>
    </el-tooltip>
    <el-tooltip content="列表视图" placement="top">
      <el-radio-button label="list"><svg-icon name="list" width="15" height="15" /></el-radio-button>
    </el-tooltip>
  </el-radio-group>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'ViewSelector'
})
export default class extends ComponentMixin {}
</script>
<style lang="scss" scoped>
.screen-tools__btn {
  ::v-deep .el-radio-button .el-radio-button__inner {
    padding: 5px 9px;
  }
}
</style>
