<template>
  <div>
    <el-descriptions :column="2">
      <el-descriptions-item label="设备名称">{{ basicInfo.deviceName }}</el-descriptions-item>
      <el-descriptions-item label="接入方式">
        <span v-if="hasVideo" class="device-in-type">{{ dicts.DeviceInType[deviceInTypeEnum.Video] }}</span>
        <span v-if="hasViid" class="device-in-type">{{ dicts.DeviceInType[deviceInTypeEnum.Viid] }}</span>
        <span class="device-in-type__buttons">
          <el-button v-if="!hasVideo" type="text" @click="openDialog(deviceInTypeEnum.Video)">添加视频</el-button>
          <el-button v-if="!hasViid && !isIbox" type="text" @click="openDialog(deviceInTypeEnum.Viid)">添加视图</el-button>
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="设备类型">{{ dicts.DeviceType[basicInfo.deviceType] }}</el-descriptions-item>
      <el-descriptions-item label="设备ID">{{ basicInfo.deviceId }}</el-descriptions-item>
      <el-descriptions-item label="接入网络">{{ dicts.InNetworkType[device.inNetworkType] }}</el-descriptions-item>
      <!-- <el-descriptions-item label="播放网络">{{ dicts.OutNetworkType[device.outNetworkType] }}</el-descriptions-item> -->
      <el-descriptions-item label="经纬度">{{ basicInfo.deviceLongitude }} : {{ basicInfo.deviceLatitude }}</el-descriptions-item>
      <el-descriptions-item label="接入区域">{{ regionTxt }}</el-descriptions-item>
      <el-descriptions-item label="所属行业">{{ industryTxt }}</el-descriptions-item>
      <el-descriptions-item label="网络标识">{{ networkTxt }}</el-descriptions-item>
      <el-descriptions-item label="设备地址">{{ orgRegionTxt }}</el-descriptions-item>
      <el-descriptions-item label="设备厂商">{{ basicInfo.deviceVendor || '-' }}</el-descriptions-item>
      <el-descriptions-item label="设备IP">{{ basicInfo.deviceIp || '-' }}</el-descriptions-item>
      <el-descriptions-item label="设备端口">{{ basicInfo.devicePort }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DevicePoleId)" label="杆号">{{ basicInfo.devicePoleId || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceMac)" label="设备MAC地址">{{ basicInfo.deviceMac || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceSerialNumber)" label="设备SN码">{{ basicInfo.deviceSerialNumber || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceModel)" label="设备型号">{{ basicInfo.deviceModel || '-' }}</el-descriptions-item>
      <el-descriptions-item label="设备描述">{{ basicInfo.description || '-' }}</el-descriptions-item>
    </el-descriptions>
    <video-info-dialog v-if="dialog[deviceInTypeEnum.Video]" :device="device" @on-close="closeDialog([deviceInTypeEnum.Video], ...arguments)" />
    <viid-info-dialog v-if="dialog[deviceInTypeEnum.Viid]" :device="device" @on-close="closeDialog([deviceInTypeEnum.Viid], ...arguments)" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import * as dicts from '@vss/device/dicts'
import { DeviceEnum, DeviceInTypeEnum } from '@vss/device/enums'
import { Device, DeviceBasic, VideoDevice, Industry } from '@vss/device/type/Device'
import { checkVideoVisible } from '@vss/device/utils/param'
import { translateIndustry, translateNetwork, translateOrgRegion, translateResourceRegion } from '@vss/device/api/dict'
import VideoInfoDialog from './VideoInfoDialog.vue'
import ViidInfoDialog from './ViidInfoDialog.vue'

@Component({
  name: 'BasicInfo',
  components: {
    VideoInfoDialog,
    ViidInfoDialog
  }
})
export default class extends Vue {
  @Prop() private device: Device
  @Prop({ default: false }) public isIbox: boolean

  private dicts = dicts
  private deviceInTypeEnum = DeviceInTypeEnum
  private deviceEnum = DeviceEnum
  private dialog = {
    [DeviceInTypeEnum.Video]: false,
    [DeviceInTypeEnum.Viid]: false
  }

  private regionTxt = '-'
  private industryTxt = '-'
  private networkTxt = '-'
  private orgRegionTxt = '-'

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device.device || {}
  }

  // 视频接入协议
  private get inVideoProtocol() {
    return this.device.videos && this.device.videos.length && this.device.videos[0]?.inVideoProtocol
  }

  // 视频接入信息
  private get videoInfo(): VideoDevice {
    return (this.inVideoProtocol && this.device.videos[0][dicts.InVideoProtocolModelMapping[this.inVideoProtocol]]) || {}
  }

  // 设备行业信息
  private get industry(): Industry {
    return this.device.industry || {}
  }

  // 是否含视频
  private get hasVideo() {
    return this.device.videos && this.device.videos.length
  }

  // 是否含视图库
  private get hasViid() {
    return this.device.viids && this.device.viids.length
  }

  // 根据设备类型 & 接入协议判断字段是否显示
  private checkVisible(prop) {
    return checkVideoVisible.call(this.videoInfo, this.basicInfo.deviceType, this.inVideoProtocol, prop, { isIbox: this.isIbox })
  }

  @Watch('basicInfo.deviceId', { immediate: true })
  private onDeviceChange() {
    this.getRegionTxt()
    this.getNetworkTxt()
    this.getIndustryTxt()
    this.getOrgRegionTxt()
  }

  private async getRegionTxt() {
    try {
      if (!this.device.region) {
        throw null
      }
      const res = await translateResourceRegion({ code: this.device.region })
      this.regionTxt = res.name
    } catch (e) {
      this.regionTxt = '-'
    }
  }

  private async getNetworkTxt() {
    try {
      if (!this.device.industry.networkCode) {
        throw null
      }
      const res = await translateNetwork({ code: this.device.industry.networkCode })
      this.networkTxt = res.name
    } catch (e) {
      this.networkTxt = '-'
    }
  }

  private async getIndustryTxt() {
    try {
      if (!this.device.industry.industryCode) {
        throw null
      }
      const res = await translateIndustry({ code: this.device.industry.industryCode })
      this.industryTxt = res.name
    } catch (e) {
      this.industryTxt = '-'
    }
  }

  private async getOrgRegionTxt() {
    try {
      if (!this.device.industry.inOrgRegion) {
        throw null
      }
      const res = await translateOrgRegion({ gbRegion: this.device.industry.inOrgRegion, gbRegionLevel: this.device.industry.inOrgRegionLevel })
      this.orgRegionTxt = res.name
    } catch (e) {
      this.orgRegionTxt = '-'
    }
  }

  /**
   * 打开弹出框
   */
  private openDialog(type: string) {
    this.dialog[type] = true
  }

  /**
   * 关闭弹出框
   */
  private closeDialog(type: string, isRefresh: boolean) {
    this.dialog[type] = false
    if (type && isRefresh === true) {
      this.$emit('updateDevice')
    }
  }
}
</script>
<style lang="scss" scoped>
.device-in-type__buttons {
  margin-left: $margin-medium;

  .el-button--text {
    padding: 0;
  }
}
</style>
