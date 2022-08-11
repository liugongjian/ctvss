<template>
  <div class="device-container">
    <div class="detail-wrap">
      <el-tabs v-model="activeRouteName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="DeviceInfo" />
        <el-tab-pane label="设备/流事件" name="DeviceEvents" />
        <el-tab-pane label="配置信息" name="DeviceConfig" />
        <el-tab-pane label="实时预览" name="DevicePreview" />
        <el-tab-pane label="录像回放" name="DeviceReplay" />
        <el-tab-pane label="AI分析" name="DeviceAI" />
        <el-tab-pane label="视图数据" name="DeviceVIID" />
      </el-tabs>
      <router-view />
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
  private handleClick(activeRouteName: string) {
    this.$router.push(activeRouteName)
  }

  @Watch('$route.name', { immediate: true })
  private routeChange(activeRouteName: string) {
    this.activeRouteName = activeRouteName
  }
}
</script>
