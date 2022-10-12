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
      <div class="detail-wrap__body">
        <div class="detail-wrap__body__content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Inject } from 'vue-property-decorator'
import { ToolsEnum } from '../../enums/index'

@Component({
  name: 'DeviceDetail'
})
export default class extends Vue {
  @Inject('handleTools')
  private handleTools!: Function
  private activeRouteName = 'DeviceInfo'

  private get deviceId() {
    return this.$route.query.deviceId.toString()
  }

  private handleClick(tab) {
    this.$router.push({ name: tab.name, query: { deviceId: this.deviceId } })
  }

  @Watch('$route.name', { immediate: true })
  private routeChange(activeRouteName: string) {
    this.activeRouteName = activeRouteName
  }

  private back() {
    this.handleTools([ToolsEnum.GoToDeviceList])
  }
}
</script>
