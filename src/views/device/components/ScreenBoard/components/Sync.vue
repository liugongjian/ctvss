<template>
  <div class="screen-tools__btn" :class="{'selected': isSync}" @click="toggleSync">
    <el-tooltip v-if="isSync" content="当前为同步回放模式" placement="top">
      <svg-icon class="sync" name="sync" width="16" height="16" />
    </el-tooltip>
    <el-tooltip v-else content="当前为异步回放模式" placement="top">
      <svg-icon name="async" width="16" height="16" />
    </el-tooltip>
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Sync'
})
export default class extends ComponentMixin {
  private get isSync() {
    return this.screenManager.isSync
  }

  private toggleSync() {
    this.screenManager.isSync = !this.screenManager.isSync
    this.$message(`已切换为${this.screenManager.isSync ? '同步' : '异步'}回放模式`)
  }
}
</script>
<style lang="scss" scoped>
.sync {
  color: $primary;
}
</style>
