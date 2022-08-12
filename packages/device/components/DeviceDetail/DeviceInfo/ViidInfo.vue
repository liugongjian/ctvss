<template>
  <div>
    <!-- 状态信息 -->
    <el-descriptions title="状态信息" :column="2">
      <el-descriptions-item label="设备状态">
        <status-badge :status="viidInfo.deviceStatus.isOnline" />
        {{ dicts.DeviceStatus[viidInfo.deviceStatus.isOnline] || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 接入信息 -->
    <el-descriptions title="接入信息" :column="2">
      <el-descriptions-item label="视图ID">{{ viidInfo.outId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="GA1400凭证">缺失</el-descriptions-item>
      <el-descriptions-item label="协议类型">缺失</el-descriptions-item>
      <el-descriptions-item label="设备IP">{{ basicInfo.deviceIp }}</el-descriptions-item>
      <el-descriptions-item label="设备端口">{{ basicInfo.devicePort }}</el-descriptions-item>
    </el-descriptions>

    <!-- 视图库信息 -->
    <el-descriptions title="视图库信息" :column="2">
      <el-descriptions-item label="视图库IP">缺失</el-descriptions-item>
      <el-descriptions-item label="视图库端口号">缺失</el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import dicts from '../../../dicts'
import enums from '../../../enums'

@Component({
  name: 'ViidInfo',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  @Prop() private device
  private dicts = dicts
  private enums = enums

  // 设备基本信息
  private get basicInfo() {
    return this.device.device
  }

  // 视频接入信息
  private get viidInfo() {
    return this.device.viids && this.device.viids[0]!.gA1400Device
  }
}
</script>
