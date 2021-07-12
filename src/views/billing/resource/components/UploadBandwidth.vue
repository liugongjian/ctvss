<template>
  <div>
    <el-table v-loading="loading" :data="dataList">
      <el-table-column prop="id" label="编号" />
      <el-table-column prop="uploadBandwidth" label="剩余上行带宽">
        <template slot-scope="{row}">
          {{ row.totalDeviceCount }}Mbps
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="开通时间" min-width="140" />
      <el-table-column prop="expireTime" label="到期时间" min-width="140" />
      <el-table-column prop="resourceType" label="资源类型">
        <template slot-scope="{row}">
          {{ row.resourceType === '' ? '' : ''}}
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
</style>
