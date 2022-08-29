<template>
  <div class="detail-wrap__edit-wrap">
    <el-form
      ref="videoForm"
      class="detail-wrap__edit"
      :rules="rules"
      :model="videoForm"
      label-position="right"
      label-width="135px"
    >
      <el-form-item label="接入协议:" :prop="deviceEnum.InVideoProtocol">
        <el-radio
          v-for="(value, key) in dicts.InVideoProtocolByDeviceType[basicInfo.deviceType]"
          :key="key"
          v-model="videoForm.inVideoProtocol"
          :label="key"
          @change="inVideoProtocolChange"
        >
          {{ value }}
        </el-radio>
      </el-form-item>
    </el-form>

    <div class="detail-wrap__edit__footer">
      <el-button size="medium" type="primary" :loading="loading.submit" @click="submit">确 定</el-button>
      <el-button size="medium" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import VideoFormMixin from '@vss/device/mixin/videoFormMixin'
import StatusBadge from '@/components/StatusBadge/index.vue'
import * as dicts from '@vss/device/dicts'
import { DeviceEnum, DeviceInTypeEnum, InNetworkTypeEnum, OutNetworkTypeEnum } from '@vss/device/enums'
import { Device, DeviceBasic, Industry, VideoDevice } from '@vss/device/type/Device'
import AddressCascader from '../../AddressCascader.vue'

@Component({
  name: 'VideoInfoEdit',
  components: {
    StatusBadge,
    AddressCascader
  }
})
export default class extends Mixins(VideoFormMixin) {
  @Prop() private device: Device

  private dicts = dicts
  private deviceEnum = DeviceEnum
  private deviceInTypeEnum = DeviceInTypeEnum
  private inNetworkTypeEnum = InNetworkTypeEnum
  private outNetworkTypeEnum = OutNetworkTypeEnum
  private deviceVendor = dicts.DeviceVendor
  private industryMap = dicts.IndustryMap
  private networkMap = dicts.NetworkMap
  public videoForm = {}

  @Watch('device', {
    immediate: true
  })
  private onDeviceChange() {
    this.videoForm = {
      [DeviceEnum.InVideoProtocol]: this.inVideoProtocol,
      [DeviceEnum.VideoVendor]: '',
      [DeviceEnum.InVersion]: '2016',
      [DeviceEnum.DeviceChannelSize]: 1,
      [DeviceEnum.InUserName]: '',
      [DeviceEnum.InType]: '',
      [DeviceEnum.PullUrl]: '',
      [DeviceEnum.UserName]: '',
      [DeviceEnum.Password]: '',
      [DeviceEnum.EnableDomain]: 2,
      [DeviceEnum.DeviceDomain]: '',
      [DeviceEnum.DeviceIp]: '',
      [DeviceEnum.DevicePort]: '',
      [DeviceEnum.DeviceStreamSize]: 1,
      [DeviceEnum.DeviceStreamAutoPull]: 1,
      [DeviceEnum.DeviceStreamPullIndex]: 1,
      [DeviceEnum.PushType]: 1,
      [DeviceEnum.StreamTransProtocol]: 'tcp',
      [DeviceEnum.OutId]: '',
      [DeviceEnum.Tags]: '',
      [DeviceEnum.Resources]: [],
      vssAIApps: [],
      aIApps: []
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

  // 视频接入信息
  private get videoInfo(): VideoDevice {
    return this.inVideoProtocol && this.device.videos[0]![dicts.InVideoProtocolModelMapping[this.inVideoProtocol]]
  }

  private mounted() {
  }

  private submit() {
    this.$emit('cancel')
  }

  private cancel() {
    this.$emit('cancel')
  }
}
</script>
