<template>
  <div>
    <el-table v-loading="loading" class="resource-table" :data="dataList" @row-click="rowClick($event, 'uploadBandwidth')">
      <el-table-column show-overflow-tooltip prop="workOrderNo" label="订单号">
        <template slot-scope="scope">
          <span class="device-id">{{ scope.row.workOrderNo }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="bandWidth" label="上行带宽总量">
        <template slot-scope="{row}">
          {{ row.bandWidth }}Mbps
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
          <el-button type="text" @click="rowClick(scope.row, 'uploadBandwidth')">查看绑定关系</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ResourceMixin from '../mixins/resource'

@Component({
  name: 'ResourceUploadBandwidth'
})
export default class extends Mixins(ResourceMixin) {
  public type = 'VSS_UPLOAD_BW'
}
</script>
