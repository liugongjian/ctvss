<template>
  <el-radio-group v-model="screenManager.view" class="screen-tools__btn" size="mini">
    <el-radio-button label="screen"><svg-icon name="timeline" /></el-radio-button>
    <el-radio-button label="list"><svg-icon name="list" /></el-radio-button>
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
