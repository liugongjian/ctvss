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
          <el-tab-pane label="AI分析" name="DeviceAI" />
          <el-tab-pane label="视图数据" name="DeviceVIID" />
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
import { Component, Vue, Watch } from 'vue-property-decorator'

@Component({
  name: 'DeviceDetail'
})
export default class extends Vue {
  private activeRouteName: string = 'DeviceInfo'

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
    this.$router.push({ name: 'DeviceList' })
    console.log('back')
  }
}
</script>
