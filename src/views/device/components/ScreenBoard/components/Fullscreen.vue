<template>
  <el-tooltip content="全屏" placement="top">
    <el-button class="screen-tools__btn">
      <svg-icon name="fullscreen" />
    </el-button>
  </el-tooltip>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Fullscreen'
})
export default class extends ComponentMixin {

}
</script>
