<template>
  <div class="service-config">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="视频" name="video">
        <component
          :is="VideoConfigService" 
          :channel-size="channelSize"
          :device-stream-size="deviceStreamSize"
        />
      </el-tab-pane>
      <el-tab-pane v-if="deviceType === deviceTypeEnum.Ipc" label="AI" name="ai">
        <component
          :is="AiConfigService"
          :channel-size="channelSize"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue, VModel, Prop, Watch } from 'vue-property-decorator'
import { DeviceTypeEnum } from '@vss/device/enums/index'
import IpcVideoServiceConfig from './ipc/VideoServiceConfig.vue'
import NvrVideoServiceConfig from './nvr/VideoServiceConfig.vue'
import PlatformVideoServiceConfig from './platform/VideoServiceConfig.vue'
import IpcAiServiceConfig from './ipc/AiServiceConfig.vue'

@Component({
  name: 'ServiceConfig',
  components: {
    IpcVideoServiceConfig,
    NvrVideoServiceConfig,
    PlatformVideoServiceConfig,
    IpcAiServiceConfig
  }
})
export default class extends Vue {
  @Prop({ default: DeviceTypeEnum.Ipc })
  private deviceType: DeviceTypeEnum

  @Prop({ default: 0 })
  private channelSize: number

  @Prop({ default: 0 })
  private deviceStreamSize: number

  @VModel() private resource

  private deviceTypeEnum = DeviceTypeEnum
  private activeTab = 'video'

  private VideoConfigServiceDics = {
    [DeviceTypeEnum.Ipc]: 'IpcVideoServiceConfig',
    [DeviceTypeEnum.Nvr]: 'NvrVideoServiceConfig',
    [DeviceTypeEnum.Platform]: 'PlatformVideoServiceConfig',
  }

  private AiConfigServiceDics = {
    [DeviceTypeEnum.Ipc]: 'IpcAiServiceConfig'
  }

  private get VideoConfigService() {
    return this.VideoConfigServiceDics[this.deviceType]
  }

  private get AiConfigService() {
    return this.AiConfigServiceDics[this.deviceType]
  }

  @Watch('deviceType')
  private deviceTypeChange() {
    this.activeTab = 'video'
  }
}
</script>

<style lang="scss" scoped>
.service-config {
  ::v-deep {
    .el-tabs__header {
      margin: 0;
    }

    .el-tabs__item {
      font-size: $text-size-medium;
    }

    .el-tabs__content {
      border: 1px solid #dfe4ed;
      border-top: none;
      padding: 10px 20px 0;
    }
  }
}
</style>