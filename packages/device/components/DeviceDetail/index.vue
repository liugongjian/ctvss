<template>
  <div class="device-container">
    <div class="detail-wrap">
      <div class="detail-wrap__header">
        <el-page-header content="设备详情" @back="back" />
        <el-tabs v-model="activeRouteName" @tab-click="handleClick">
          <el-tab-pane label="基本信息" name="DeviceInfo" />
          <el-tab-pane label="配置信息" name="DeviceConfig" />
          <el-tab-pane label="设备事件" name="DeviceEvents" />
          <el-tab-pane label="实时预览" name="DevicePreview" />
          <el-tab-pane label="录像回放" name="DeviceReplay" />
          <el-tab-pane label="AI分析" name="DeviceAi" />
          <el-tab-pane label="视图数据" name="DeviceViid" />
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
import { ToolsEnum, DeviceTypeEnum } from '@vss/device/enums/index'
import detailMixin from '@vss/device/mixin/deviceMixin'

@Component({
  name: 'DeviceDetail'
})
export default class extends Mixins(detailMixin) {
  @Inject('handleTools')
  private handleTools!: Function
  private activeRouteName = 'DeviceInfo'

  @Watch('$route.name', { immediate: true })
  private routeChange(activeRouteName: string) {
    this.activeRouteName = activeRouteName
  }

  public async mounted() {
    await this.getDevice()
  }

  private handleClick(tab) {
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
