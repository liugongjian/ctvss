<template>
  <el-dialog
    title="配置资源包"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="900px"
    center
    append-to-body
    @close="closeDialog"
  >
    <service-config
      ref="serviceConfig"
      v-model="resource"
      class="service-config"
      :config-mode="configMode"
      :tabs="tabs"
      :device-id="device.deviceId"
      :device-type="device.deviceType"
      @is-inited="initedStatusChange"
    />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="loading" @click="submit">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ResourceTypeEnum, ConfigModeEnum } from '@vss/device/enums/billing'
import { DeviceTypeEnum } from '@vss/device/enums'
import ServiceConfig from '@vss/device/components/ServiceConfig/index.vue'
import { updateDeviceResource } from '@vss/device/api/billing'

@Component({
  name: 'ServiceConfigDialog',
  components: {
    ServiceConfig
  }
})
export default class extends Vue {
  @Prop({ default: {} })
  private device

  private resourceTypeEnum = ResourceTypeEnum
  private configModeEnum = ConfigModeEnum

  private dialogVisible = true
  private loading = false
  private configMode = ConfigModeEnum.Edit
  private resource = {
    video: [],
    aI: [],
    viid: []
  }

  // 是否含视频
  public get hasVideo() {
    return true
  }

  // 是否含视图库
  public get hasViid() {
    return false
  }

  private get tabs() {
    const tabs = []
    if (this.hasVideo) {
      tabs.push(ResourceTypeEnum.Video)
      // 仅IPC添加AItab
      if (this.device.deviceType === DeviceTypeEnum.Ipc) {
        tabs.push(ResourceTypeEnum.AI)
      }
    }
    // 视图tab添加
    if (this.hasViid) {
      tabs.push(ResourceTypeEnum.Viid)
    }
    return tabs
  }

  private initedStatusChange(flag) {
    this.loading = !flag
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
          deviceId: this.device.deviceId,
          deviceType: this.device.deviceType,
          resource: this.resource
        })
        this.closeDialog(true)
      } catch (e) {
        console.log(e)
      } finally {
        this.loading = false
      }
    }
  }

  /**
   * 关闭弹窗
   */
  private closeDialog(isRefresh = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
  .form {
    margin: 0;
  }
</style>
