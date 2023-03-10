<template>
  <div class="video-service-config">
    <el-button v-if="selectedList.length < channelSize" type="text" @click="bindingChannel">+ 配置通道</el-button>
    <span class="config-title">已配置通道：</span>
    <el-table
      ref="nvrTable"
      v-loading="loading"
      :data="selectedList"
      fit
    >
      <el-table-column show-overflow-tooltip :prop="nvrConfigEnum.ChannelName" label="已配置通道" min-width="90">
        <template slot-scope="scope">
          {{ scope.row[nvrConfigEnum.ChannelName] }}
        </template>
      </el-table-column>
      <el-table-column :prop="nvrConfigEnum.BillingMode" label="计费模式">
        <template slot-scope="scope">
          {{ scope.row[nvrConfigEnum.BillingMode] }}
        </template>
      </el-table-column>
      <el-table-column :prop="nvrConfigEnum.Remain" label="余量" min-width="110">
        <template slot-scope="scope">
          {{ scope.row[nvrConfigEnum.Remain] }}
        </template>
      </el-table-column>
      <el-table-column :prop="nvrConfigEnum.ExpireTime" label="到期时间" min-width="160" />
      <el-table-column show-overflow-tooltip :prop="nvrConfigEnum.StorageTime" label="存储配置">
        <template slot-scope="scope">
          {{ scope.row[nvrConfigEnum.StorageTime] }}
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="action" width="80" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="unBindingChannel(scope.row.deviceChannelNum)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <VideoServiceBindingDialog
      v-if="showBindingDialog"
      :selected-list="selectedList"
      :channel-size="channelSize"
      :device-stream-size="deviceStreamSize"
      @on-close="closeDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { BillingModeEnum, NvrConfigEnum } from '@vss/device/enums/billing'
import { BillingModeType } from '@vss/device/dicts/resource'
import VideoServiceBindingDialog from './VideoServiceBindingDialog.vue'
@Component({
  name: 'NvrVideoServiceConfig',
  components: {
    VideoServiceBindingDialog
  }
})
export default class extends Vue {
  @Prop({ default: 0 })
  private channelSize: number

  @Prop({ default: 0 })
  private deviceStreamSize: number

  private nvrConfigEnum = NvrConfigEnum

  private loading = false
  private showBindingDialog = false
  private selectedList = []

  @Watch('channelSize')
  private channelSizeChange(channelSize: number) {
    this.selectedList = this.selectedList.filter(item => item.deviceChannelNum <= channelSize)
  }

  private async mounted() {
    await this.getConfigList()
  }

  private async getConfigList() {
    try {
      this.loading = true
      await new Promise(resolve => {
        setTimeout(() => {
          resolve(this.selectedList = [])
        }, 500)
      })
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.loading = false
    }
  }

  private bindingChannel() {
    this.showBindingDialog = true
  }

  private unBindingChannel(channleNum: number) {
    const target = this.selectedList.findIndex(channel => channel.deviceChannelNum === channleNum)
    if (target >= 0) this.selectedList.splice(target, 1)
  }

  private closeDialog(data) {
    console.log(data)
    this.showBindingDialog = false
    Array.isArray(data) && (
      this.selectedList.push(...data.map(item => {
        return item.billingMode === BillingModeEnum.Packages
          ? {
            [NvrConfigEnum.DeviceChannelNum]: item.deviceChannelNum,
            [NvrConfigEnum.ChannelName]: item.name,
            [NvrConfigEnum.BillingMode]: BillingModeType[item.billingMode],
            [NvrConfigEnum.Remain]: `${item.resource['remainDeviceCount']}路 / ${item.resource['totalDeviceCount']}路`,
            [NvrConfigEnum.ExpireTime]: item.resource['expireTime'],
            [NvrConfigEnum.StorageTime]: `${item.resource['storageTime']}天`
          }
          : {
            [NvrConfigEnum.DeviceChannelNum]: item.deviceChannelNum,
            [NvrConfigEnum.ChannelName]: item.name,
            [NvrConfigEnum.BillingMode]: BillingModeType[item.billingMode],
            [NvrConfigEnum.Remain]: '-',
            [NvrConfigEnum.ExpireTime]: '永久',
            [NvrConfigEnum.StorageTime]: item.RecordTemplateName || '默认30天存储录像模板'
          }
      }))
    )
  }
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