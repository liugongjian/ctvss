<template>
  <div>
    <el-descriptions :column="2">
      <el-descriptions-item label="设备名称">{{ basicInfo.deviceName }}</el-descriptions-item>
      <el-descriptions-item label="接入方式">
        <span v-if="hasVideo" class="device-in-type">{{ dicts.DeviceInType[deviceInTypeEnum.Video] }}</span>
        <span v-if="hasViid" class="device-in-type">{{ dicts.DeviceInType[deviceInTypeEnum.Viid] }}</span>
        <span class="device-in-type__buttons">
          <el-button v-if="!hasVideo" type="text" @click="openDialog(deviceInTypeEnum.Video)">添加视频</el-button>
          <el-button v-if="!hasViid" type="text" @click="openDialog(deviceInTypeEnum.Viid)">添加视图</el-button>
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="设备类型">{{ dicts.DeviceType[basicInfo.deviceType] }}</el-descriptions-item>
      <el-descriptions-item label="设备ID">{{ basicInfo.deviceId }}</el-descriptions-item>
      <el-descriptions-item label="经纬度">{{ basicInfo.deviceLongitude }} : {{ basicInfo.deviceLatitude }}</el-descriptions-item>
      <el-descriptions-item label="接入区域">缺失</el-descriptions-item>
      <el-descriptions-item label="所属行业">{{ industry.industryName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="设备地址">缺失</el-descriptions-item>
      <el-descriptions-item label="设备厂商">{{ basicInfo.deviceVendor || '-' }}</el-descriptions-item>
      <el-descriptions-item label="设备IP">{{ basicInfo.deviceIp }}</el-descriptions-item>
      <el-descriptions-item label="设备端口">{{ basicInfo.devicePort }}</el-descriptions-item>
      <el-descriptions-item label="接入网络">{{ dicts.InNetworkType[device.inNetworkType] }}</el-descriptions-item>
      <el-descriptions-item label="播放网络">{{ dicts.OutNetworkType[device.outNetworkType] }}</el-descriptions-item>
    </el-descriptions>
    <video-info-dialog v-if="dialog[deviceInTypeEnum.Video]" :device="device" @on-close="closeDialog([deviceInTypeEnum.Video], ...arguments)" />
    <viid-info-dialog v-if="dialog[deviceInTypeEnum.Viid]" :device="device" @on-close="closeDialog([deviceInTypeEnum.Viid], ...arguments)" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import * as dicts from '@vss/device/dicts'
import { DeviceInTypeEnum } from '@vss/device/enums'
import { Device, DeviceBasic, Industry } from '@vss/device/type/Device'
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

  private dicts = dicts
  private deviceInTypeEnum = DeviceInTypeEnum
  private dialog = {
    [DeviceInTypeEnum.Video]: false,
    [DeviceInTypeEnum.Viid]: false
  }

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device.device
  }

  // 设备行业信息
  private get industry(): Industry {
    return this.device.industry
  }

  // 是否含视频
  private get hasVideo() {
    return this.device.videos && this.device.videos.length
  }

  // 是否含视图库
  private get hasViid() {
    return this.device.viids && this.device.viids.length
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
    console.log(isRefresh)
    this.dialog[type] = false
    if (type && isRefresh === true) {
      this.$emit('update')
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
