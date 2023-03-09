<template>
  <div class="video-service-config">
    <el-button type="text">+ 配置设备</el-button>
    <span class="config-title">已配置设备：</span>
    <el-table
      ref="nvrTable"
      v-loading="loading"
      :data="platformSelectedList"
      fit
    >
      <el-table-column show-overflow-tooltip :prop="platformConfigEnum.ChannelName" label="已配置设备" min-width="120">
        <template slot-scope="scope">
          {{ scope.row[platformConfigEnum.DeviceName] }}
        </template>
      </el-table-column>
      <el-table-column :prop="platformConfigEnum.BillingMode" label="计费模式">
        <template slot-scope="scope">
          {{ scope.row[platformConfigEnum.BillingMode] }}
        </template>
      </el-table-column>
      <el-table-column :prop="platformConfigEnum.Remain" label="订单号">
        <template slot-scope="scope">
          {{ scope.row[platformConfigEnum.BillingId] }}
        </template>
      </el-table-column>
      <el-table-column :prop="platformConfigEnum.ExpireTime" label="到期时间" min-width="170" />
      <el-table-column :prop="platformConfigEnum.StorageConfig" label="存储配置">
        <template slot-scope="scope">
          {{ scope.row[platformConfigEnum.StorageConfig] }}
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="action" width="80" fixed="right">
        <el-button type="text">删除</el-button>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { BillingEnum, BillingModeEnum, PlatformConfigEnum } from '@vss/device/enums/billing'
@Component({
  name: 'PlatformVideoServiceConfig'
})
export default class extends Vue {
  private platformConfigEnum = PlatformConfigEnum

  private loading = false

  private billingModeForm = {
    [BillingEnum.BillingMode]: BillingModeEnum.Packages,
    [BillingEnum.RecordStream]: 1,
    [BillingEnum.RecordTemplate]: '',
    [BillingEnum.Resource]: ''
  }
  private platformSelectedList = [{}]
}
</script>
<style lang="scss" scoped>
.video-service-config {
  .config-title {
    display: block;
    color: $textGrey;
  }
}
</style>