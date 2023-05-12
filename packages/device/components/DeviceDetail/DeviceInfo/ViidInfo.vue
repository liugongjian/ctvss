<template>
  <div>
    <div class="detail__buttons">
      <el-button v-if="checkToolsVisible(toolsEnum.EditDevice, [policyEnum.UpdateDevice], deviceActions)" type="text" @click="edit">编辑</el-button>
      <!-- <el-dropdown v-if="hasVideo" @command="handleTools($event, basicInfo, inViidProtocol)">
        <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-if="checkToolsVisible(toolsEnum.DeleteDevice, [policyEnum.UpdateDevice])" :command="toolsEnum.DeleteDevice">删除</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown> -->
    </div>
    <!-- 状态信息 -->
    <el-descriptions title="状态信息" :column="2">
      <el-descriptions-item label="视图接入">
        <status-badge :status="viidInfo.deviceStatus.isOnline" />
        {{ dicts.DeviceStatus[viidInfo.deviceStatus.isOnline] || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 接入信息 -->
    <el-descriptions title="接入信息" :column="2">
      <el-descriptions-item label="协议类型">{{ dicts.InViidProtocol[inViidProtocol] }}</el-descriptions-item>
      <el-descriptions-item label="视图ID">{{ viidInfo.outId || '-' }}</el-descriptions-item>
      <!-- <el-descriptions-item v-if="checkVisible(deviceEnum.LowerApsId)" label="视图编码">{{ viidInfo.lowerApsId || '-' }}</el-descriptions-item> -->
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceType)" label="接入类型">{{ dicts.ViidDeviceType[viidInfo.deviceType] }}</el-descriptions-item>
      <el-descriptions-item label="GA1400凭证">{{ viidInfo.inUserName }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.Ip)" label="平台IP">{{ viidInfo.ip }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.Port)" label="端口">{{ viidInfo.port }}</el-descriptions-item>
    </el-descriptions>

    <!-- 视图库信息 -->
    <el-descriptions title="视图库信息" :column="2">
      <el-descriptions-item label="视图库IP">{{ viidInfo.viidIp }}</el-descriptions-item>
      <el-descriptions-item label="视图库端口号">{{ viidInfo.viidPort }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import * as dicts from '@vss/device/dicts'
import { DeviceEnum, ToolsEnum } from '@vss/device/enums'
import { PolicyEnum } from '@vss/base/enums/iam'
import { Device, DeviceBasic, ViidDevice } from '@vss/device/type/Device'
import { checkViidVisible } from '@vss/device/utils/param'

@Component({
  name: 'ViidInfo',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  @Inject({ default: () => ({}) })
  public getActions!: Function
  private get deviceActions() {
    return this.getActions && this.getActions()
  }
  @Inject('handleTools')
  private handleTools!: Function
  @Inject('checkToolsVisible')
  private checkToolsVisible!: Function
  @Prop() private device: Device
  private dicts = dicts
  private deviceEnum = DeviceEnum
  private toolsEnum = ToolsEnum
  private policyEnum = PolicyEnum

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device.device
  }

  // 视图库接入协议
  private get inViidProtocol() {
    return this.device.viids && this.device.viids.length && this.device.viids[0]?.inViidProtocol
  }

  // 视图库接入信息
  private get viidInfo(): ViidDevice {
    return this.inViidProtocol && this.device.viids[0][dicts.InViidProtocolModelMapping[this.inViidProtocol]]
  }

  // 是否含视频
  private get hasVideo() {
    return this.device.videos && this.device.videos.length
  }

  // 进入编辑模式
  private edit() {
    this.$emit('edit')
  }

  private checkVisible(prop) {
    return checkViidVisible.call(this.viidInfo, this.basicInfo.deviceType, this.inViidProtocol, prop)
  }
}
</script>
