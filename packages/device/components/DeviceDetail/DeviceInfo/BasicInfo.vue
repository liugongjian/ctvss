<template>
  <el-descriptions :column="2">
    <el-descriptions-item label="设备名称">{{ basicInfo.deviceName }}</el-descriptions-item>
    <el-descriptions-item label="接入方式">18100000000</el-descriptions-item>
    <el-descriptions-item label="设备类型">{{ dicts.DeviceType[basicInfo.deviceType] }}</el-descriptions-item>
    <el-descriptions-item label="设备ID">{{ basicInfo.deviceId }}</el-descriptions-item>
    <el-descriptions-item label="经纬度">{{ basicInfo.deviceLongitude }} : {{ basicInfo.deviceLatitude }}</el-descriptions-item>
    <el-descriptions-item label="接入区域">缺失</el-descriptions-item>
    <el-descriptions-item label="所属行业">{{ industry.industryName || '-' }}</el-descriptions-item>
    <el-descriptions-item label="设备地址">缺失</el-descriptions-item>
    <el-descriptions-item label="设备厂商">{{ basicInfo.deviceVendor || '-' }}</el-descriptions-item>
  </el-descriptions>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import dicts from '@vss/device/dicts'

@Component({
  name: 'BasicInfo',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  @Prop() private device

  private dicts = dicts

  // 设备基本信息
  private get basicInfo() {
    return this.device.device
  }

  // 设备行业信息
  private get industry() {
    return this.device.industry
  }
}
</script>
