<template>
  <el-tooltip content="关闭所有分屏" placement="top">
    <el-button class="screen-tools__btn" :disabled="disabled" @click="closeAll">
      <svg-icon name="close-all" width="16" height="16" />
    </el-button>
  </el-tooltip>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Cleaner'
})
export default class extends ComponentMixin {
  @Prop()
  private disabled: boolean

  private closeAll() {
    this.screenManager.clearAllScreen()
  }
}
</script>
