<template>
  <div>
    <el-table v-loading="loading" class="resource-table" :data="dataList" @row-click="rowClick($event, 'downloadBandwidth')">
      <el-table-column prop="id" label="编号">
        <template slot-scope="scope">
          <span class="device-id">{{ scope.row.resourceId.substr(0, 10) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="bandWidth" label="下行带宽总量">
        <template slot-scope="{row}">
          {{ row.bandWidth }}Mbps
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="开通时间" min-width="140" />
      <el-table-column prop="expireTime" label="到期时间" min-width="140" />
      <el-table-column prop="resourceType" label="资源类型">
        <template slot-scope="{row}">
          {{ row.resourceType === '' ? '' : '' }}
        </template>
      </el-table-column>
      <el-table-column label="订购类型">
        <template slot-scope="{row}">
          {{ row.isTrialOrder === '1' ? '试用' : '商用' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template slot-scope="scope">
          <el-button type="text" @click="rowClick(scope.row, 'downloadBandwidth')">查看绑定关系</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ResourceMixin from '../mixins/resource'

@Component({
  name: 'ResourceDownloadBandwidth'
})
export default class extends Mixins(ResourceMixin) {
  public type = 'VSS_DOWNLOAD_BW'
}
</script>
