<template>
  <div class="detail-wrap__edit-wrap">
    <el-form
      ref="videoForm"
      class="detail-wrap__edit"
      :rules="rules"
      :model="deviceForm"
      label-position="right"
      label-width="135px"
    >
      1
    </el-form>

    <div class="detail-wrap__edit__footer">
      <el-button size="medium" type="primary" :loading="loading.submit" @click="submit">确 定</el-button>
      <el-button size="medium" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import * as dicts from '@vss/device/dicts'
import { DeviceEnum, DeviceInTypeEnum, InNetworkTypeEnum, OutNetworkTypeEnum } from '@vss/device/enums'
import { Device, DeviceBasic, Industry } from '@vss/device/type/Device'
import AddressCascader from '../../AddressCascader.vue'
import deviceFormMixin from '@vss/device/mixin/deviceFormMixin'

@Component({
  name: 'VideoInfoEdit',
  components: {
    StatusBadge,
    AddressCascader
  }
})
export default class extends Mixins(deviceFormMixin) {
  @Prop() private device: Device

  private dicts = dicts
  private deviceEnum = DeviceEnum
  private deviceInTypeEnum = DeviceInTypeEnum
  private inNetworkTypeEnum = InNetworkTypeEnum
  private outNetworkTypeEnum = OutNetworkTypeEnum
  private deviceVendor = dicts.DeviceVendor
  private industryMap = dicts.IndustryMap
  private networkMap = dicts.NetworkMap
  public deviceForm = {}

  @Watch('device', {
    immediate: true
  })
  private onDeviceChange() {
    const basicInfo = this.device.device
    this.deviceForm = {
      // step0
      [DeviceEnum.DeviceName]: basicInfo.deviceName,
      [DeviceEnum.DeviceType]: basicInfo.deviceType,
      [DeviceEnum.DeviceInType]: DeviceInTypeEnum.VideoAndViid,
      [DeviceEnum.InNetworkType]: this.device.inNetworkType,
      [DeviceEnum.OutNetworkType]: this.device.outNetworkType,
      // step1
      longlat: 'required',
      [DeviceEnum.DeviceLongitude]: '0.000000',
      [DeviceEnum.DeviceLatitude]: '0.000000',
      [DeviceEnum.DeviceVendor]: '',
      [DeviceEnum.Region]: '',
      [DeviceEnum.InOrgRegion]: '',
      [DeviceEnum.InOrgRegionLevel]: null,
      [DeviceEnum.IndustryCode]: '',
      [DeviceEnum.NetworkCode]: '7',
      [DeviceEnum.Description]: '',
      [DeviceEnum.DeviceIp]: '',
      [DeviceEnum.DevicePort]: '',
      [DeviceEnum.DevicePoleId]: '',
      [DeviceEnum.DeviceMac]: '',
      [DeviceEnum.DeviceSerialNumber]: '',
      [DeviceEnum.DeviceModel]: ''
    }
  }

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device.device
  }

  // 设备行业信息
  private get industry(): Industry {
    return this.device.industry
  }

  // 视频接入协议
  private get inVideoProtocol() {
    return this.device.videos && this.device.videos[0]!.inVideoProtocol
  }

  // 是否含视频
  private get hasVideo() {
    return this.device.videos && this.device.videos.length
  }

  // 是否含视图库
  private get hasViid() {
    return this.device.viids && this.device.viids.length
  }

  private mounted() {
    this.getRegionList()
  }

  private submit() {
    this.$emit('cancel')
  }

  private cancel() {
    this.$emit('cancel')
  }
}
</script>
