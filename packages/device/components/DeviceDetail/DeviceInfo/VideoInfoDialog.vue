<template>
  <el-dialog
    title="添加视频"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="900px"
    center
    @close="closeDialog"
  >
    <div class="create-wrap">
      <div class="create-wrap__body">
        <video-create-form ref="form" :device-form="basicInfo" :device="device" />
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Device, DeviceBasic } from '@vss/device/type/Device'
import { InVideoProtocolModelMapping } from '@vss/device/dicts/index'
import { InVideoProtocolAllowParams } from '@vss/device/settings'
import { DeviceEnum } from '@vss/device/enums'
import { DeviceForm, VideoDeviceForm } from '@vss/device/type/Device'
import { createDevice } from '@vss/device/api/device'
import { pick } from 'lodash'
import VideoCreateForm from '../../Form/VideoCreateForm.vue'

@Component({
  name: 'VideoInfoDialog',
  components: {
    VideoCreateForm
  }
})
export default class extends Vue {
  @Prop({ default: () => createDevice }) private createDeviceApi: Function
  @Prop() private device: Device
  private dialogVisible = true
  private submitting = false

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device[DeviceEnum.Device]
  }

  /**
   * 提交
   */
  private async submit() {
    const form = this.$refs.form as VideoCreateForm
    const videoForm = form.videoForm
    if (form.validateVideoForm()) {
      const videoDevice: VideoDeviceForm = {
        ...pick(videoForm, [
          DeviceEnum.InVideoProtocol
        ])
      }
      const params: DeviceForm = {
        [DeviceEnum.Device]: {
          ...pick(this.basicInfo, [
            DeviceEnum.DeviceId,
            DeviceEnum.DeviceType,
            DeviceEnum.DeviceName,
            DeviceEnum.DeviceLongitude,
            DeviceEnum.DeviceLatitude,
            DeviceEnum.DeviceIp,
            DeviceEnum.DevicePort,
            DeviceEnum.DeviceMac,
            DeviceEnum.DevicePoleId,
            DeviceEnum.DeviceSerialNumber,
            DeviceEnum.DeviceModel,
            DeviceEnum.Description,
            DeviceEnum.DeviceVendor,
            DeviceEnum.DeviceChannelSize
          ]),
        },
        [DeviceEnum.Resource]: videoForm.resource,
      }
      // 补充视频协议信息
      videoDevice[InVideoProtocolModelMapping[videoForm.inVideoProtocol]] = {
        ...pick(videoForm, [...InVideoProtocolAllowParams[videoForm.inVideoProtocol]])
      }
      // 删除视频中的Resource
      delete videoDevice[InVideoProtocolModelMapping[videoForm.inVideoProtocol]].resource
      params[DeviceEnum.Videos] = [ videoDevice ]
      try {
        // 提交创建表单
        await this.createDeviceApi(params)
        this.closeDialog(true)
      } catch (e) {
        this.$alertError(e.message)
      }
    }
  }

  private closeDialog(isRefresh = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
.create-wrap__body {
  padding: 0;
}

.dialog-footer {
  text-align: center;
}
</style>
