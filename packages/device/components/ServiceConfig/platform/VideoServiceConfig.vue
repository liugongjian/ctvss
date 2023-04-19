<template>
  <div class="video-service-config">
    <div>
      <span v-if="isView" class="config-info">计费模式：{{ modeDetail[billingMode] }}</span>
      <el-radio-group v-else v-model="billingMode" :disabled="!isCreate" size="medium">
        <el-radio :label="billingModeEnum.OnDemand">{{ modeDetail[billingModeEnum.OnDemand] }}</el-radio>
        <el-radio :label="billingModeEnum.Packages">{{ modeDetail[billingModeEnum.Packages] }}</el-radio>
      </el-radio-group>
    </div>
    <div v-if="false">
      <el-button type="text" @click="bindingDevice">+ 配置设备</el-button>
      <span class="config-title">已配置设备：</span>
      <el-table
        ref="nvrTable"
        v-loading="loading"
        :data="selectedList"
        fit
      >
        <el-table-column show-overflow-tooltip :prop="platformConfigEnum.ChannelName" label="已配置设备" min-width="160">
          <template slot-scope="scope">
            <div class="device-name">
              <div class="device-id">{{ scope.row[platformConfigEnum.DeviceId] }}</div>
              <div>{{ scope.row[platformConfigEnum.DeviceName] }}</div>
            </div>
            <!-- {{ scope.row[platformConfigEnum.DeviceName] }} -->
          </template>
        </el-table-column>
        <el-table-column :prop="platformConfigEnum.BillingMode" label="计费模式">
          <template slot-scope="scope">
            {{ scope.row[platformConfigEnum.BillingMode] }}
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip :prop="platformConfigEnum.BillingId" label="订单号">
          <template slot-scope="scope">
            {{ scope.row[platformConfigEnum.BillingId] }}
          </template>
        </el-table-column>
        <el-table-column :prop="platformConfigEnum.ExpireTime" label="到期时间" min-width="170" />
        <el-table-column show-overflow-tooltip :prop="platformConfigEnum.StorageTime" label="存储配置">
          <template slot-scope="scope">
            {{ scope.row[platformConfigEnum.StorageTime] }}
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="action" width="80" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="unBindingDevice(scope.row.deviceId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <VideoServiceBindingDialog
        v-if="showBindingDialog"
        :selected-list="selectedList"
        @on-close="closeDialog"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Inject } from 'vue-property-decorator'
import { BillingEnum, BillingModeEnum, PlatformConfigEnum, ConfigModeEnum, ResourceTypeEnum } from '@vss/device/enums/billing'
import { BillingModeType } from '@vss/device/dicts/resource'
import VideoServiceBindingDialog from './VideoServiceBindingDialog.vue'
@Component({
  name: 'PlatformVideoServiceConfig',
  components: {
    VideoServiceBindingDialog
  }
})
export default class extends Vue {
  @Inject({ default: () => new Object() })
  private configManager

  private platformConfigEnum = PlatformConfigEnum
  private billingModeEnum = BillingModeEnum

  private loading = false
  private showBindingDialog = false
  private selectedList = []
  private billingMode = BillingModeEnum.OnDemand
  private modeDetail = {
    [BillingModeEnum.Packages]: '平台注册成功后再手动配置下级平台内设备，配置完成后平台内设备注册上线',
    [BillingModeEnum.OnDemand]: '按需计费，平台注册成功下级平台内设备自动注册上线'
  }

  private get isCreate() {
    return this.configManager.configMode === ConfigModeEnum.Create
  }

  private get isView() {
    return this.configManager.configMode === ConfigModeEnum.View
  }

  @Watch('selectedList', { deep: true })
  private selectedListChange(selectedList) {
    this.$emit('video-config-change', selectedList)
  }

  @Watch('billingMode', { deep: true })
  private async billingModeFormChange(form) {
    this.$emit('config-change', [{ billingMode: form[BillingEnum.BillingMode] }])
  }

  private async mounted() {
    await this.getConfigList()
  }

  private async getConfigList() {
    try {
      this.loading = true
      const videoInfo = this.configManager.initInfo.video
      if (videoInfo && videoInfo.length) {
        const info = videoInfo[0]
        this.billingModeForm[BillingEnum.BillingMode] = info.billingMode
        this.billingModeForm[BillingEnum.ResourceId] = info.resourceId
      }
    console.log(this.billingModeForm)
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 初始化计费模式
   */
  private initBillingMode() {
    if (this.configManager.configMode === ConfigModeEnum.Create) {
      // 如果存在资源包则默认资源包计费，否则默认按需计费
      if (this.configManager[ResourceTypeEnum.Video].length) {
        this.configForm[BillingEnum.BillingMode] = BillingModeEnum.Packages
      } else {
        this.configForm[BillingEnum.BillingMode] = BillingModeEnum.OnDemand
      }
    }
  }

  private bindingDevice() {
    this.showBindingDialog = true
  }

  private unBindingDevice(deviceId: number) {
    const target = this.selectedList.findIndex(device => device.deviceId === deviceId)
    if (target >= 0) this.selectedList.splice(target, 1)
  }

  private closeDialog(data) {
    console.log(data)
    this.showBindingDialog = false
    Array.isArray(data) && (
      this.selectedList.push(...data.map(item => {
        return item.billingMode === BillingModeEnum.Packages
          ? {
            [PlatformConfigEnum.DeviceName]: item.name,
            [PlatformConfigEnum.DeviceId]: item.id,
            [PlatformConfigEnum.BillingMode]: BillingModeType[item.billingMode],
            [PlatformConfigEnum.BillingId]: item.resource['workOrderNo'],
            [PlatformConfigEnum.ExpireTime]: item.resource['expireTime'],
            [PlatformConfigEnum.StorageTime]: `${item.resource['storageTime']}天`,
            [PlatformConfigEnum.Path]: item.path.map(item => item.id)
          }
          : {
            [PlatformConfigEnum.DeviceName]: item.name,
            [PlatformConfigEnum.DeviceId]: item.id,
            [PlatformConfigEnum.BillingMode]: BillingModeType[item.billingMode],
            [PlatformConfigEnum.BillingId]: '-',
            [PlatformConfigEnum.ExpireTime]: '永久',
            [PlatformConfigEnum.StorageTime]: item.RecordTemplateName || '默认30天存储录像模板',
            [PlatformConfigEnum.Path]: item.path.map(item => item.id)
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

  .devivce-name {
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .device-id {
    text-align: left;
    color: $primary;
  }

  .config-info,
  .el-radio {
    line-height: 50px;
  }
}
</style>