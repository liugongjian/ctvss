<template>
  <div>
    <div class="detail__buttons">
      <el-button type="text" @click="edit">编辑</el-button>
      <el-dropdown>
        <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :command="{type: 'delete'}">删除</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 状态信息 -->
    <el-descriptions title="状态信息" :column="2">
      <el-descriptions-item label="视图接入">
        <status-badge :status="viidInfo.DeviceStatus.IsOnline" />
        {{ dicts.DeviceStatus[viidInfo.DeviceStatus.IsOnline] || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 接入信息 -->
    <el-descriptions title="接入信息" :column="2">
      <el-descriptions-item label="协议类型">{{ dicts.inViidProtocol }}</el-descriptions-item>
      <el-descriptions-item label="视图ID">{{ viidInfo.OutId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="GA1400凭证">{{ viidInfo.InUserName }}</el-descriptions-item>
      <el-descriptions-item label="平台IP">{{ viidInfo.Ip }}</el-descriptions-item>
      <el-descriptions-item label="端口">{{ viidInfo.Port }}</el-descriptions-item>
    </el-descriptions>

    <!-- 视图库信息 -->
    <el-descriptions title="视图库信息" :column="2">
      <el-descriptions-item label="视图库IP">{{ viidInfo.ViidServerIp }}</el-descriptions-item>
      <el-descriptions-item label="视图库端口号">{{ viidInfo.ViidServerPort }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import * as dicts from '@vss/device/dicts'
import { DeviceEnum } from '@vss/device/enums'
import { Device, DeviceBasic, ViidDevice } from '@vss/device/type/Device'

@Component({
  name: 'ViidInfo',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  @Prop() private device: Device
  private dicts = dicts
  private deviceEnum = DeviceEnum

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device.Device
  }

  // 视图库接入协议
  private get inViidProtocol() {
    return this.device.Viids && this.device.Viids[0]!.InViidProtocol
  }

  // 视图库接入信息
  private get viidInfo(): ViidDevice {
    return this.inViidProtocol && this.device.Viids[0]![dicts.InViidProtocolModelMapping[this.inViidProtocol]]
  }

  // 进入编辑模式
  private edit() {
    this.$emit('edit')
  }
}
</script>
