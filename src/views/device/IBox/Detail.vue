<template>
  <div class="device-container">
    <div class="detail-wrap">
      <div class="detail-wrap__header">
        <el-page-header content="设备详情" @back="back" />
        <el-tabs v-model="activeRouteName" @tab-click="handleClick">
          <el-tab-pane label="基本信息" name="IBoxDeviceInfo" />
          <el-tab-pane label="实时预览" name="IBoxDevicePreview" />
          <!-- <el-tab-pane label="设备事件" name="IBoxDeviceEvents" /> -->
          <el-tab-pane label="AI配置" name="IBoxDeviceAiConfig" />
          <el-tab-pane label="AI分析" name="IBoxDeviceAi" />
          <!-- <el-tab-pane label="其他配置" name="IBoxDeviceConfig" /> -->
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

@Component({
  name: 'DeviceDetail'
})
export default class extends Vue {
  public activeRouteName: string = 'IBoxDeviceInfo'
  public refreshCount = -1
  private tabToName = {
    preview: 'IBoxDevicePreview'
  }

  mounted() {
    const { tab = '' } = this.$route.query
    if (tab) {
      this.activeRouteName = this.tabToName.preview
      this.$router.push({ name: this.activeRouteName, query: { deviceId: this.deviceId, path: this.$route.query.path } })
    }
  }

  private get deviceId() {
    return this.$route.query.deviceId.toString()
  }

  public handleClick(tab) {
    this.$router.push({ name: tab.name, query: { deviceId: this.deviceId, path: this.$route.query.path } })
  }

  @Watch('$route.name', { immediate: true })
  private routeChange(activeRouteName: string) {
    this.activeRouteName = activeRouteName
  }

  @Inject('handleTools')
  private handleTools!: Function

  public back() {
    this.handleTools('refreshDirectory')
  }
}
</script>
