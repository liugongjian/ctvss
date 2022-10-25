<template>
  <div class="detail-wrap__edit">
    <video-create-form ref="form" :device-form="basicInfo" :device="device" :is-ibox="isIbox" :is-edit="true" />
    <div class="detail-wrap__edit__footer">
      <el-button size="medium" type="primary" @click="submit">确 定</el-button>
      <el-button size="medium" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { InVideoProtocolModelMapping } from '@vss/device/dicts/index'
import { InVideoProtocolAllowParams } from '@vss/device/settings'
import { updateDevice } from '@vss/device/api/device'
import { pick } from 'lodash'
import { DeviceEnum } from '@vss/device/enums'
import { Device, DeviceBasic, DeviceForm, VideoDeviceForm } from '@vss/device/type/Device'
import VideoCreateForm from '../../Form/VideoCreateForm.vue'

@Component({
  name: 'VideoInfoEdit',
  components: {
    VideoCreateForm
  }
})
export default class extends Vue {
  @Prop() private device: Device
  @Prop({ default: () => updateDevice }) private updateDeviceApi: Promise<any>
  @Prop({ default: false }) public isIbox: boolean

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device.device
  }

  private async submit() {
    const form = this.$refs.form as VideoCreateForm
    if (form.validateVideoForm()) {
      const params: DeviceForm = {
        device: {
          deviceId: this.basicInfo.deviceId
        }
      }
      // 补充视频接入信息
      const videoDevice: VideoDeviceForm = {
        ...pick(form.videoForm, [
          DeviceEnum.InVideoProtocol
        ])
      }
      // 补充协议信息
      videoDevice[InVideoProtocolModelMapping[form.videoForm.inVideoProtocol]] = {
        ...pick(form.videoForm, [...InVideoProtocolAllowParams[form.videoForm.inVideoProtocol]])
      }
      params.videos = [ videoDevice ]
      try {
        await this.updateDeviceApi(params)
        this.$alertSuccess('更新成功!')
        this.$emit('cancel')
          this.$emit('updateDevice')
      } catch (e) {
        this.$alertError(e.message)
      }
    }
  }

  private cancel() {
    this.$emit('cancel')
  }
}
</script>
