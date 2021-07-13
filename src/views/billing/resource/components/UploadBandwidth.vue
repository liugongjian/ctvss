<template>
  <div>
    <el-table v-loading="loading" class="resource-table" :data="dataList" @row-click="rowClick($event, 'uploadBandwidth')">
      <el-table-column prop="id" label="编号" />
      <el-table-column prop="uploadBandwidth" label="剩余上行带宽">
        <template slot-scope="{row}">
          {{ row.totalDeviceCount }}Mbps
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="开通时间" min-width="140" />
      <el-table-column prop="expireTime" label="到期时间" min-width="140" />
      <el-table-column label="资源类型">
        <template slot-scope="{row}">
          {{ row.isTrialOrder === '1' ? '试用' : '商用' }}
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
<style lang="scss" scoped>
.resource-table {
  ::v-deep .el-table__row {
    cursor: pointer;
  }
}
</style>
