<template>
  <el-button class="screen-tools__btn">
    <svg-icon name="fullscreen" />
  </el-button>
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
