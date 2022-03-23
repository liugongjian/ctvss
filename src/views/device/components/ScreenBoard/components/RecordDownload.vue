<template>
  <el-tooltip content="录像下载" placement="top">
    <el-button class="screen-tools__btn" @click="closeAll">
      <svg-icon name="download" width="16" height="16" />
    </el-button>
  </el-tooltip>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import ComponentMixin from './mixin'

@Component({
  name: 'Cleaner'
})
export default class extends ComponentMixin {

}
</script>
