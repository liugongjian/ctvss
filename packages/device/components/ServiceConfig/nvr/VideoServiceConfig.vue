<template>
  <div class="video-service-config">
    <el-button type="text">+ 配置通道</el-button>
    <span class="config-title">已配置通道：</span>
    <el-table
      ref="nvrTable"
      v-loading="loading"
      :data="nvrSelectedList"
      fit
    >
      <el-table-column show-overflow-tooltip :prop="nvrConfigEnum.ChannelName" label="已配置通道" min-width="120">
        <template slot-scope="scope">
          {{ scope.row[nvrConfigEnum.ChannelName] }}
        </template>
      </el-table-column>
      <el-table-column :prop="nvrConfigEnum.BillingMode" label="计费模式">
        <template slot-scope="scope">
          {{ scope.row[nvrConfigEnum.BillingMode] }}
        </template>
      </el-table-column>
      <el-table-column :prop="nvrConfigEnum.Remain" label="余量">
        <template slot-scope="scope">
          {{ scope.row[nvrConfigEnum.Remain] }}
        </template>
      </el-table-column>
      <el-table-column :prop="nvrConfigEnum.ExpireTime" label="到期时间" min-width="170" />
      <el-table-column :prop="nvrConfigEnum.StorageConfig" label="存储配置">
        <template slot-scope="scope">
          {{ scope.row[nvrConfigEnum.StorageConfig] }}
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
import { BillingEnum, BillingModeEnum, NvrConfigEnum } from '@vss/device/enums/billing'
@Component({
  name: 'NvrVideoServiceConfig'
})
export default class extends Vue {
  private nvrConfigEnum = NvrConfigEnum

  private loading = false

  private billingModeForm = {
    [BillingEnum.BillingMode]: BillingModeEnum.Packages,
    [BillingEnum.RecordStream]: 1,
    [BillingEnum.RecordTemplate]: '',
    [BillingEnum.Resource]: ''
  }

  private nvrSelectedList = [{}]
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