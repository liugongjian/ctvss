<template>
  <div class="detail-wrap__edit">
    <video-create-form ref="form" :device-form="basicInfo" :device="device" :is-ibox="isIbox" :is-edit="true" @loaded="loading.resource = false" />
    <div class="detail-wrap__edit__footer">
      <el-button size="medium" type="primary" :loading="loading.resource" @click="submit">确 定</el-button>
      <el-button size="medium" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { InVideoProtocolModelMapping } from '@vss/device/dicts/index'
import { InVideoProtocolCreateParams } from '@vss/device/settings'
import { updateDevice } from '@vss/device/api/device'
import { updateDeviceResource } from '@vss/device/api/billing'
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
  @Prop({ default: () => updateDevice }) private updateDeviceApi: (params: any) => Promise<any>
  @Prop({ default: false }) public isIbox: boolean

  private loading = {
    resource: false
  }

  private mounted() {
    // 不是Ibox的情况需要等待资源包加载完成
    if (!this.isIbox) {
      this.loading.resource = true
    }
  }

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device.device
  }

  /**
   * 提交前验证
   */
  private async submit() {
    const form = this.$refs.form as VideoCreateForm
    if (!this.isIbox) {
      await form.validateVideoForm() && form.beforeSubmit(this.doSubmit)
    } else {
      await form.validateVideoForm() && this.doSubmit()
    }
  }

  /**
   * 提交表单
   */
  private async doSubmit() {
    const form = this.$refs.form as VideoCreateForm
    // 设备参数
    const params: DeviceForm = {
      device: {
        deviceId: this.basicInfo.deviceId,
        deviceVendor: form.videoForm.videoVendor,
        ...pick(form.videoForm, [
          DeviceEnum.DeviceChannelSize
        ])
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
      ...pick(form.videoForm, [...InVideoProtocolCreateParams[form.videoForm.inVideoProtocol]])
    }
    params.videos = [ videoDevice ]
    
    // 资源包参数
    const resourceParams = {
      deviceId: this.basicInfo.deviceId,
      ...form.videoForm.resource
    }
    try {
      // IBOX不提交资源包更新
      !this.isIbox && await updateDeviceResource(resourceParams)
      await this.updateDeviceApi(params)
      this.$alertSuccess('更新成功!')
      this.$emit('cancel')
      this.$emit('updateDevice')
    } catch (e) {
      this.$alertError(e.message)
    }
  }

  /**
   * 取消
   */
  private cancel() {
    this.$emit('cancel')
  }
}
</script>
