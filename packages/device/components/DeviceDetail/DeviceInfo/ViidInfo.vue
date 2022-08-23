<template>
  <div>
    <div class="detail__buttons">
      <el-button type="text">编辑</el-button>
      <el-dropdown>
        <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :command="{type: 'delete'}">删除</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
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
import * as dicts from '@vss/device/dicts'
import * as enums from '@vss/device/enums'

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

  // 视图库接入协议
  private get inViidProtocol() {
    return this.device.viids && this.device.viids[0]!.inViidProtocol
  }

  // 视图库接入信息
  private get viidInfo() {
    return this.inViidProtocol && this.device.viids[0]![dicts.InViidProtocolModelMapping[this.inViidProtocol]]
  }
}
</script>
