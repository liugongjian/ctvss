<template>
  <div v-loading="loading" class="detail-wrap__edit">
    <video-create-form ref="form" :device-form="basicInfo" :device="device" :is-ibox="isIbox" :is-edit="true" />
    <div class="detail-wrap__edit__footer">
      <el-button v-loading="loading" size="medium" type="primary" @click="submit">确 定</el-button>
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

  private loading = false

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device.device
  }

  /**
   * 提交前验证
   */
  private async submit() {
    const form = this.$refs.form as VideoCreateForm
    // if (!this.isIbox) {
    //   await form.validateVideoForm() && form.beforeSubmit(this.doSubmit)
    // } else {
    //   await form.validateVideoForm() && this.doSubmit()
    // }
    await form.validateVideoForm() && this.doSubmit()
  }

  /**
   * 提交表单
   */
  private async doSubmit() {
    const form = this.$refs.form as VideoCreateForm
    // 设备参数
    const params: DeviceForm = {
      device: {
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
          DeviceEnum.Description
        ]),
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
      ...pick(form.videoForm, [...InVideoProtocolCreateParams[form.videoForm.inVideoProtocol]]),
      deviceIp: form.videoForm.deviceIp,
      devicePort: form.videoForm.devicePort
    }
    params.videos = [ videoDevice ]
    
    // 资源包参数
    const resourceParams = {
      deviceId: this.basicInfo.deviceId,
      deviceType: this.basicInfo.deviceType,
      resource: form.videoForm.resource
    }

    const currentVideoForm = this.device.videos[0][InVideoProtocolModelMapping[this.device.videos[0].inVideoProtocol]]
    let confirmFlag = true
    // 校验GB35114协议及认证方式是否变更
    if (
      currentVideoForm[DeviceEnum.EnabledGB35114] !== form.videoForm[DeviceEnum.EnabledGB35114]
      || (currentVideoForm[DeviceEnum.Gb35114Mode] && (currentVideoForm[DeviceEnum.Gb35114Mode] !== form.videoForm[DeviceEnum.Gb35114Mode]))
    ) {
      await this.$confirm('更改GB35114协议及认证方式，设备将立即下线并重新进行注册。是否确认修改?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).catch(() => {
        confirmFlag = false
      })
    }
    // 校验国标ID是否变更
    if (currentVideoForm[DeviceEnum.OutId] !== form.videoForm[DeviceEnum.OutId]) {
      await this.$confirm('更改国标ID会导致设备离线，流离线。是否确认修改?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).catch(() => {
        confirmFlag = false
      })
    }
    confirmFlag && this.updateVideoInfo(params, resourceParams)
  }

  /**
   * 更新操作
   */
  private async updateVideoInfo(params, resourceParams) {
    try {
      this.loading = true
      await this.updateDeviceApi(params)
      await updateDeviceResource(resourceParams)
      this.$alertSuccess('更新成功!')
      this.$emit('cancel')
      this.$emit('updateDevice')
    } catch (e) {
      this.$alertError(e.message)
    } finally {
      this.loading = false
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
