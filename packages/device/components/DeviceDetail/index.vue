<template>
  <div v-loading="deviceLoading" class="device-container">
    <div class="detail-wrap">
      <div class="detail-wrap__header">
        <el-page-header content="设备详情" @back="back" />
        <el-tabs v-model="activeRouteName" @tab-click="handleClick">
          <el-tab-pane label="基本信息" :name="DeviceDetailTab.DeviceInfo" />
          <el-tab-pane v-if="hasVideo" label="配置信息" :name="DeviceDetailTab.DeviceConfig" />
          <el-tab-pane v-if="hasVideo" label="设备事件" :name="DeviceDetailTab.DeviceEvents" />
          <el-tab-pane v-if="hasVideo" label="实时预览" :name="DeviceDetailTab.DevicePreview" />
          <el-tab-pane v-if="hasVideo" label="录像回放" :name="DeviceDetailTab.DeviceReplay" />
          <el-tab-pane v-if="hasVideo" label="AI分析" :name="DeviceDetailTab.DeviceAi" />
          <el-tab-pane v-if="hasViid" label="视图数据" :name="DeviceDetailTab.DeviceViid" />
        </el-tabs>
      </div>
      <div v-if="device.device" class="detail-wrap__body">
        <div class="detail-wrap__body__content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch, Inject } from 'vue-property-decorator'
import { ToolsEnum, DeviceTypeEnum, DeviceDetailTab } from '@vss/device/enums/index'
import detailMixin from '@vss/device/mixin/deviceMixin'

@Component({
  name: 'DeviceDetail'
})
export default class extends Mixins(detailMixin) {
  @Inject('handleTools')
  private handleTools!: Function
  private activeRouteName = DeviceDetailTab.DeviceInfo
  private DeviceDetailTab = DeviceDetailTab

  @Watch('$route.name', { immediate: true })
  private routeChange(activeRouteName: DeviceDetailTab) {
    this.activeRouteName = activeRouteName
  }

  public async mounted() {
    await this.getDevice()
  }

  public destroyed() {
    this.clearDevice()
  }

  private handleClick(tab) {
    if (tab.name === DeviceDetailTab.DeviceInfo) {
      this.getDevice(this.deviceId, true)
    }
    this.$router.push({ name: tab.name, query: { deviceId: this.deviceId } })
  }

  private back() {
    if (this.deviceType === DeviceTypeEnum.Ipc) {
      this.handleTools(ToolsEnum.GoBack, 1)
    } else {
      this.handleTools(ToolsEnum.GoBack, 0)
    }
  }
}
</script>
