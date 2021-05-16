<template>
  <div>
    <el-table v-loading="loading" :data="dataList">
      <el-table-column prop="id" label="编号" width="120" />
      <el-table-column prop="name" label="资源包" width="300" />
      <el-table-column prop="amountDevice" label="可用设备总数（路）" />
      <el-table-column prop="remainedDevice" label="设备余量（路）" />
      <el-table-column prop="rate" label="码率" />
      <el-table-column prop="bandwidth" label="带宽" />
      <el-table-column prop="duration" label="存储周期" />
      <el-table-column prop="startDatetime" label="开通时间" />
      <el-table-column prop="endDatetime" label="到期时间" />
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ResourceMixin from '../mixins/resource'

@Component({
  name: 'ResourceBandwidth'
})
export default class extends Mixins(ResourceMixin) {
  public type = 'bandwidth'
}
</script>
