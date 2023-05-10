<template>
  <div v-loading="deviceLoading" class="device-container">
    <div class="detail-wrap">
      <div class="detail-wrap__header">
        <el-page-header content="设备详情" @back="back" />
        <el-tabs v-model="activeRouteName" @tab-click="handleClick">
          <el-tab-pane label="基本信息" :name="deviceDetailTab.DeviceInfo" />
          <el-tab-pane v-if="checkTabsVisible(deviceDetailTab.DeviceConfig)" label="配置信息" :name="deviceDetailTab.DeviceConfig" />
          <el-tab-pane v-if="checkTabsVisible(deviceDetailTab.DeviceEvents)" label="设备事件" :name="deviceDetailTab.DeviceEvents" />
          <el-tab-pane v-if="checkTabsVisible(deviceDetailTab.DevicePreview)" label="实时预览" :name="deviceDetailTab.DevicePreview" />
          <el-tab-pane v-if="checkTabsVisible(deviceDetailTab.DeviceReplay)" label="录像回放" :name="deviceDetailTab.DeviceReplay" />
          <el-tab-pane v-if="checkTabsVisible(deviceDetailTab.DeviceAi)" label="AI分析" :name="deviceDetailTab.DeviceAi" />
          <el-tab-pane v-if="checkTabsVisible(deviceDetailTab.DeviceViid)" label="视图数据" :name="deviceDetailTab.DeviceViid" />
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
import { Component, Mixins, Watch, Inject, Provide } from 'vue-property-decorator'
import { ToolsEnum, DeviceTypeEnum, DeviceDetailTab } from '@vss/device/enums/index'
import { Device } from '@vss/device/type/Device'
import { checkDeviceToolsVisible, checkDeviceTabsVisible } from '@vss/device/utils/param'
import { checkPermission } from '@vss/base/utils/permission'
import detailMixin from '@vss/device/mixin/deviceMixin'

@Component({
  name: 'DeviceDetail'
})
export default class extends Mixins(detailMixin) {
  @Inject('handleTools')
  private handleTools!: Function
  private activeRouteName = DeviceDetailTab.DeviceInfo
  private deviceDetailTab = DeviceDetailTab

  @Watch('$route.name', { immediate: true })
  private routeChange(activeRouteName: DeviceDetailTab) {
    this.activeRouteName = activeRouteName
  }

  @Watch('$route.query.deviceId', {
    immediate: true
  })
  public async deviceIdChange(deviceId) {
    this.device = {} as Device
    this.getDevice(deviceId)
  }

  public destroyed() {
    this.clearDevice()
  }

  /**
   * 切换TAB
   */
  private handleClick(tab) {
    if (tab.name === DeviceDetailTab.DeviceInfo) {
      this.getDevice(this.deviceId, true)
    }
    this.$router.push({
      name: tab.name,
      query: {
        ...this.$route.query,
        deviceId: this.deviceId
      }
    })
  }

  /**
   * 返回
   */
  private back() {
    if (this.deviceType === DeviceTypeEnum.Ipc) {
      this.handleTools(ToolsEnum.GoBack, 1)
    } else {
      this.handleTools(ToolsEnum.GoBack, 0)
    }
  }

  /**
   * 判断是否显示tools
   * @param prop 字段名
   * @param permissions 策略名
   * @param row 具体信息
   */
  @Provide('checkToolsVisible')
  private checkToolsVisible(prop, permissions?) {
    const data = {
      deviceType: this.deviceType,
      inProtocol: this.inProtocol,
      deviceFrom: this.deviceFrom,
      isRoleShared: this.isRoleShared,
      deviceChannelNum: this.deviceChannelNum
    }
    return checkDeviceToolsVisible(this.deviceType, prop, data) && checkPermission(permissions)
  }

  /**
   * 判断是否显示tabs
   * @param prop 字段名
   * @param permissions 策略名
   * @param row 具体信息
   */
  private checkTabsVisible(prop, permissions?) {
    const data = {
      deviceType: this.deviceType,
      hasVideo: this.hasVideo,
      hasViid: this.hasViid,
      deviceFrom: this.deviceFrom,
      isRoleShared: this.isRoleShared
    }
    return checkDeviceTabsVisible(this.deviceType, prop, data) && checkPermission(permissions)
  }
}
</script>
