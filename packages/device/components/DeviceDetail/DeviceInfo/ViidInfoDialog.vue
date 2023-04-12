<template>
  <el-dialog
    title="添加视图"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="900px"
    center
    @close="closeDialog"
  >
    <div class="create-wrap">
      <div class="create-wrap__body">
        <viid-create-form ref="form" :device-form="basicInfo" :device="device" />
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
import { InViidProtocolModelMapping } from '@vss/device/dicts/index'
import { InViidProtocolAllowParams } from '@vss/device/settings'
import { DeviceEnum } from '@vss/device/enums'
import { DeviceForm, ViidDeviceForm } from '@vss/device/type/Device'
import { createDevice } from '@vss/device/api/device'
import { pick } from 'lodash'
import ViidCreateForm from '../../Form/ViidCreateForm.vue'

@Component({
  name: 'ViidInfoDialog',
  components: {
    ViidCreateForm
  }
})
export default class extends Vue {
  @Prop() private device: Device
  private deviceEnum = DeviceEnum
  private dialogVisible = true
  private submitting = false

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device[DeviceEnum.Device]
  }

  private async submit() {
    const form = this.$refs.form as ViidCreateForm
    const viidForm = form.viidForm
    if (form.validateViidForm()) {
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
          ])
        },
        [DeviceEnum.Resource]: viidForm.resource,
      }
      // 补充视图接入信息
      const viidDevice: ViidDeviceForm = {
        ...pick(viidForm, [
          DeviceEnum.InViidProtocol
        ])
      }
      // 补充协议信息
      viidDevice[InViidProtocolModelMapping[form.viidForm.inViidProtocol]] = {
        ...pick(viidForm, [...InViidProtocolAllowParams[form.viidForm.inViidProtocol]])
      }
      params.viids = [ viidDevice ]
      try {
        // 提交创建表单
        await createDevice(params)
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
