<template>
  <div v-loading="loading" class="detail-wrap__edit">
    <viid-create-form ref="form" :device-form="basicInfo" :device="device" :is-edit="true" />
    <div class="detail-wrap__edit__footer">
      <el-button size="medium" type="primary" @click="submit">确 定</el-button>
      <el-button size="medium" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Device, DeviceBasic, DeviceForm, ViidDeviceForm } from '@vss/device/type/Device'
import { InViidProtocolModelMapping } from '@vss/device/dicts/index'
import { InViidProtocolCreateParams } from '@vss/device/settings'
import { updateDevice } from '@vss/device/api/device'
import { DeviceEnum } from '@vss/device/enums'
import ViidCreateForm from '../../Form/ViidCreateForm.vue'
import { pick } from 'lodash'

@Component({
  name: 'ViidInfoEdit',
  components: {
    ViidCreateForm
  }
})
export default class extends Vue {
  @Prop() private device: Device

  private loading = false

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device[DeviceEnum.Device]
  }

  private async submit() {
    const form = this.$refs.form as ViidCreateForm
    await form.validateViidForm() && this.doSubmit()
  }

  private cancel() {
    this.$emit('cancel')
  }

  /**
   * 提交表单
   */
  private async doSubmit() {
    const form = this.$refs.form as ViidCreateForm
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
          DeviceEnum.Description,
          DeviceEnum.DeviceVendor,
          DeviceEnum.DeviceChannelSize
        ]),
      }
    }
    const viidDevice: ViidDeviceForm = {
      ...pick(form.viidForm, [
        DeviceEnum.InViidProtocol
      ])
    }
    // 补充协议信息
    viidDevice[InViidProtocolModelMapping[form.viidForm.inViidProtocol]] = {
      ...pick(form.viidForm, [...InViidProtocolCreateParams[form.viidForm.inViidProtocol]])
    }
    params.viids = [ viidDevice ]
    try {
      this.loading = true
      await updateDevice(params)
      this.$alertSuccess('更新成功!')
      this.$emit('cancel')
      this.$emit('updateDevice')
    } catch (e) {
      this.$alertError(e.message)
    } finally {
      this.loading = false
    }
  }
}
</script>
