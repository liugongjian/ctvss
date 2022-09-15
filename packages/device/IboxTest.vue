<template>
  <div>
    <el-button @click="$router.push({name: 'IboxDeviceCreate', query: {parentDeviceId: '29941991915651403'}})">创建设备</el-button>
    <el-button @click="$router.push({name: 'IboxDeviceList', query: {deviceId: '29941991915651403'}})">设备列表</el-button>
    <el-button @click="$router.push({name: 'IboxDeviceDetail', query: {deviceId: '29942049897709940'}})">设备详情</el-button>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import layoutMxin from './mixin/layoutMixin'

@Component({
  name: 'Ibox'
})
export default class extends Mixins(layoutMxin) {
}
</script>
