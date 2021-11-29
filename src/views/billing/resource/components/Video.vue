<template>
  <div>
    <el-table v-loading="loading" class="resource-table" :data="dataList" @row-click="rowClick($event, 'video')">
      <el-table-column show-overflow-tooltip prop="workOrderNo" label="订单号">
        <template slot-scope="scope">
          <span class="device-id">{{ scope.row.workOrderNo }}</span>
        </template>
      </el-table-column>
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
      <el-table-column label="订购类型">
        <template slot-scope="{row}">
          {{ row.isTrialOrder === '1' ? '试用' : '商用' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template slot-scope="scope">
          <el-button type="text" @click="rowClick(scope.row, 'video')">查看绑定关系</el-button>
        </template>
      </el-table-column>
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
