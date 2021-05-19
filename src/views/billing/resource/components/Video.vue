<template>
  <div>
    <el-table v-loading="loading" :data="dataList">
      <el-table-column prop="id" label="编号" />
      <el-table-column prop="totalDeviceCount" label="可接入设备总数">
        <template slot-scope="{row}">
          {{ row.totalDeviceCount }}路
        </template>
      </el-table-column>
      <el-table-column prop="remainDeviceCount" label="接入设备余量">
        <template slot-scope="{row}">
          {{ row.remainDeviceCount }}路
        </template>
      </el-table-column>
      <el-table-column prop="rate" label="码率">
        <template slot-scope="{row}">
          {{ row.bitRate }}Mbps
        </template>
      </el-table-column>
      <el-table-column prop="storageTime" label="存储周期">
        <template slot-scope="{row}">
          {{ row.storageTime }}天
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="开通时间" min-width="140" />
      <el-table-column prop="expireTime" label="到期时间" min-width="140" />
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ResourceMixin from '../mixins/resource'

@Component({
  name: 'ResourceVideo'
})
export default class extends Mixins(ResourceMixin) {
  public type = 'VSS_VIDEO'
}
</script>
