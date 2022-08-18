<template>
  <div>
    <div class="detail__buttons">
      <el-button type="text">编辑</el-button>
      <el-button type="text">配置资源包</el-button>
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
        <status-badge :status="videoInfo.deviceStatus.isOnline" />
        {{ dicts.DeviceStatus[videoInfo.deviceStatus.isOnline] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="流状态">
        <status-badge :status="videoInfo.stream.streamStatus" />
        {{ dicts.StreamStatus[videoInfo.stream.streamStatus] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="录制状态">
        <status-badge :status="dicts.RecordStatusType[videoInfo.stream.recordStatus]" />
        {{ dicts.RecordStatus[videoInfo.stream.recordStatus] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="当前码率">缺失</el-descriptions-item>
      <el-descriptions-item label="异常提示">缺失</el-descriptions-item>
    </el-descriptions>

    <!-- 接入信息 -->
    <el-descriptions title="接入信息" :column="2">
      <el-descriptions-item v-if="checkVisible('deviceChannelSize')" label="deviceChannelSize">{{ videoInfo.outId || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible('outId')" label="国标ID">{{ videoInfo.outId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="GB28181凭证">缺失</el-descriptions-item>
      <el-descriptions-item label="协议类型">缺失</el-descriptions-item>
      <el-descriptions-item label="设备IP">{{ basicInfo.deviceIp }}</el-descriptions-item>
      <el-descriptions-item label="设备端口">{{ basicInfo.devicePort }}</el-descriptions-item>
      <el-descriptions-item label="设备MAC地址">{{ basicInfo.deviceMac }}</el-descriptions-item>
      <el-descriptions-item label="杆号">{{ basicInfo.devicePoleId }}</el-descriptions-item>
      <el-descriptions-item label="信令传输模式">缺失</el-descriptions-item>
      <el-descriptions-item label="自动拉流">{{ dicts.DeviceStreamAutoPull[basicInfo.deviceStreamAutoPull] }}</el-descriptions-item>
      <el-descriptions-item label="优先TCP传输">缺失</el-descriptions-item>
      <el-descriptions-item label="流传输模式">{{ dicts.StreamTransType[videoInfo.stream.streamTransType] }}</el-descriptions-item>
    </el-descriptions>

    <!-- SIP信息 -->
    <el-descriptions title="SIP信息" :column="2">
      <el-descriptions-item label="SIP服务器ID">{{ videoInfo.sipId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器域">{{ sipDomain }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器地址">{{ videoInfo.sipIp || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器TCP端口">{{ videoInfo.sipTcpPort || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器UDP端口">{{ videoInfo.sipUdpPort || '-' }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import * as dicts from '@vss/device/dicts'
import * as enums from '@vss/device/enums'
import { checkVisible } from '@vss/device/utils/param'

@Component({
  name: 'VideoInfo',
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

  // 视频接入协议
  private get inVideoProtocol() {
    return this.device.videos && this.device.videos[0]!.inVideoProtocol
  }

  // 视频接入信息
  private get videoInfo() {
    console.log(dicts.VideoInProtocolModelMapping[this.inVideoProtocol])
    return this.inVideoProtocol && this.device.videos[0]![dicts.VideoInProtocolModelMapping[this.inVideoProtocol]]
  }

  // SIP服务器域
  public get sipDomain() {
    return this.videoInfo && this.videoInfo.sipId && this.videoInfo.sipId.toString().substr(0, 10)
  }

  private checkVisible(prop) {
    return checkVisible(this.basicInfo.deviceType, this.inVideoProtocol, prop)
  }
}
</script>
