<template>
  <div class="detail__section">
    <div class="detail__title">
      服务配置
      <div class="detail__buttons">
        <el-button
          v-if="checkPermission(['ivs:UpdateDevice'], deviceActions) && configMode === configModeEnum.View"
          type="text"
          @click="configMode = configModeEnum.Edit"
        >
          配置
        </el-button>
      </div>
    </div>
    <div v-if="hasServiceConfig || configMode === configModeEnum.Edit" v-loading="loading" class="service-config">
      <service-config
        ref="serviceConfig"
        v-model="resource"
        class="service-config"
        :config-mode="configMode"
        :tabs="tabs"
        :device-id="deviceId"
        :device-type="basicInfo && basicInfo.deviceType"
        :in-video-protocol="inVideoProtocol"
        :channel-size="basicInfo && basicInfo.deviceChannelSize"
        :device-stream-size="videoInfo && videoInfo.deviceStreamSize"
        @force-update="forceUpdate"
      />
      <div v-if="configMode === configModeEnum.Edit" class="service-config__edit__footer">
        <el-button size="mini" type="primary" @click="submit">确 定</el-button>
        <el-button v-if="!loading" size="mini" @click="cancel">取 消</el-button>
      </div>
    </div>
    <span v-if="!hasServiceConfig && configMode === configModeEnum.View" class="detail__empty-card">暂无服务配置</span>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator'
import { checkPermission } from '@vss/base/utils/permission'
import { Device, DeviceBasic, VideoDevice } from '@vss/device/type/Device'
import { ResourceTypeEnum, ConfigModeEnum } from '@vss/device/enums/billing'
import { DeviceTypeEnum } from '@vss/device/enums'
import { InVideoProtocolModelMapping } from '@vss/device/dicts'
import ServiceConfig from '@vss/device/components/ServiceConfig/index.vue'
import { updateDeviceResource } from '@vss/device/api/billing'

@Component({
  name: 'ServiceInfo',
  components: {
    ServiceConfig
  }
})
export default class extends Vue {
  @Inject({ default: () => () => null })
  public getActions!: Function
  private get deviceActions() {
    return this.getActions && this.getActions()
  }
  @Prop() private deviceId: string
  @Prop() private device: Device
  
  private resourceTypeEnum = ResourceTypeEnum
  private configModeEnum = ConfigModeEnum
  private checkPermission = checkPermission

  private configMode = ConfigModeEnum.View
  private loading = false
  private resource = {
    video: [],
    aI: [],
    viid: []
  }

  // 是否有服务配置
  private get hasServiceConfig() {
    return true
  }

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device && this.device.device
  }

  // 是否含视频
  public get hasVideo() {
    return this.device.videos && this.device.videos.length
  }

  // 视频接入协议
  private get inVideoProtocol() {
    return this.device.videos && this.device.videos.length && this.device.videos[0]?.inVideoProtocol
  }

  // 视频接入信息
  private get videoInfo(): VideoDevice {
    return this.inVideoProtocol && this.device.videos[0][InVideoProtocolModelMapping[this.inVideoProtocol]]
  }

  // 是否含视图库
  public get hasViid() {
    return this.device.viids && this.device.viids.length
  }

  private get tabs() {
    console.log('device-----', this.device)
    const tabs = []
    if (this.hasVideo) {
      tabs.push(ResourceTypeEnum.Video)
      // 仅IPC添加AItab
      if (this.basicInfo.deviceType === DeviceTypeEnum.Ipc) {
        tabs.push(ResourceTypeEnum.AI)
      }
    }
    // 视图tab添加
    if (this.hasViid) {
      tabs.push(ResourceTypeEnum.Viid)
    }
    return tabs
  }

  /**
   * 强制更新
   * @param isSubmit 是否更新表单
   */
  private forceUpdate(isSubmit: boolean) {
    if (isSubmit) {
      this.submit()
    } else {
      const serviceConfig = this.$refs.serviceConfig as any
      serviceConfig.init()
    }
  }

  private async submit() {
    const serviceConfig = this.$refs.serviceConfig as any
    const valid = await serviceConfig.validateServiceConfig()
    if (valid) {
      this.$message.error(valid.message)
    } else {
       try {
        this.loading = true
        await updateDeviceResource({
          deviceId: this.deviceId,
          deviceType: this.basicInfo.deviceType,
          resource: this.resource
        })
        this.configMode = ConfigModeEnum.View
        serviceConfig.init()
      } catch (e) {
        console.log(e)
      } finally {
        this.loading = false
      }
    }
  }

  private cancel() {
    this.configMode = ConfigModeEnum.View
    const serviceConfig = this.$refs.serviceConfig as any
    serviceConfig.init()
  }
  
}
</script>
<style lang="scss" scoped>
.service-config {
  margin: 0 20px;

  &__edit__footer {
    padding: 20px 0 0 20px;
  }
}
</style>
