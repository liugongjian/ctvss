<!-- 实时查看云台操作日志 -->
<template>
  <el-tooltip content="实时查看云台操作日志" placement="top">
    <div class="control__btn" :class="{'selected': visiable}" @click.stop.prevent="showOptLog">
      <svg-icon name="check-log" width="18px" height="18px" />
    </div>
  </el-tooltip>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'OptLogStarter'
})
export default class extends ComponentMixin {
  @Prop()
  private optLogVisiable: boolean

  private visiable = false
  
  private showOptLog() {
    this.visiable = !this.optLogVisiable
    this.$emit('showOptLog', this.visiable)
  }
}

</script>
