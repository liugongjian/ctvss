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
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.OnlineChannels)" label="在线流数量">{{ basicInfo.deviceStats.onlineChannels }}</el-descriptions-item>
      <el-descriptions-item label="当前码率">{{ videoInfo.stream.bitrate ? (videoInfo.stream.bitrate / 1024).toFixed(2) + 'Mbps' : '-' }}</el-descriptions-item>
      <el-descriptions-item label="异常提示">{{ videoInfo.errorMsg }}</el-descriptions-item>
    </el-descriptions>

    <!-- 接入信息 -->
    <el-descriptions title="接入信息" :column="2">
      <el-descriptions-item label="协议类型">{{ dicts.InVideoProtocol[inVideoProtocol] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.OutId)" :label="dicts.VideoParamLabel[inVideoProtocol].outId">{{ videoInfo.outId || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.InVersion)" :label="dicts.VideoParamLabel[inVideoProtocol].inVersion">{{ videoInfo.inVersion || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.InUserName)" :label="dicts.VideoParamLabel[inVideoProtocol].inUserName">{{ videoInfo.inUserName || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.DeviceChannelSize)" label="通道数量">{{ basicInfo.deviceChannelSize }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.DeviceMac)" label="设备MAC地址">{{ videoInfo.deviceMac }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.DevicePoleId)" label="杆号">{{ videoInfo.devicePoleId }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.SipTransType)" label="信令传输模式">{{ dicts.SipTransType[videoInfo.sipTransType] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.DeviceStreamSize)" label="主子码流数量">{{ dicts.DeviceStreamSize[videoInfo.deviceStreamSize] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.DeviceStreamAutoPull)" label="自动拉流">{{ dicts.DeviceStreamAutoPull[videoInfo.deviceStreamAutoPull] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.DeviceStreamPullIndex)" label="自动拉取码流">{{ dicts.DeviceStreamPullIndex[videoInfo.deviceStreamPullIndex] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.StreamTransProtocol)" label="优先TCP传输">{{ dicts.StreamTransProtocol[videoInfo.streamTransProtocol] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.StreamTransType)" label="流传输模式">{{ dicts.StreamTransType[videoInfo.stream.streamTransType] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.InType)" label="视频流接入方式">{{ dicts.InType[videoInfo.inType] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.PushType)" label="自动激活推流地址">{{ dicts.PushType[videoInfo.pushType] }}</el-descriptions-item>
      <template v-if="basicInfo.deviceVendor === '其他' || checkVisible(enums.DeviceEnum.OnlyPullUrl)">
        <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.PullUrl)" label="拉流地址">{{ videoInfo.pullUrl }}</el-descriptions-item>
      </template>
      <template v-else>
        <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.UserName)" label="用户名">{{ videoInfo.userName }}</el-descriptions-item>
        <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.DeviceDomain)" label="设备域名">{{ videoInfo.deviceDomain }}</el-descriptions-item>
        <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.DeviceIp)" label="设备IP">{{ basicInfo.deviceIp }}</el-descriptions-item>
        <el-descriptions-item v-if="checkVisible(enums.DeviceEnum.DevicePort)" label="设备端口">{{ basicInfo.devicePort }}</el-descriptions-item>
      </template>
    </el-descriptions>

    <!-- 国标SIP信息 -->
    <el-descriptions v-if="checkVisible(enums.DeviceEnum.Gb28181SipInfo)" title="SIP信息" :column="2">
      <el-descriptions-item label="SIP服务器ID">{{ videoInfo.sipId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器域">{{ sipDomain }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器地址">{{ videoInfo.sipIp || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器TCP端口">{{ videoInfo.sipTcpPort || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器UDP端口">{{ videoInfo.sipUdpPort || '-' }}</el-descriptions-item>
    </el-descriptions>

    <!-- EHOME SIP信息 -->
    <el-descriptions v-if="checkVisible(enums.DeviceEnum.EhomeSipInfo)" title="EHOME服务信息" :column="2">
      <el-descriptions-item label="EHOME服务器地址">{{ videoInfo.sipIp || '-' }}</el-descriptions-item>
      <el-descriptions-item label="EHOME服务器TCP端口">{{ videoInfo.sipTcpPort || '-' }}</el-descriptions-item>
      <el-descriptions-item label="EHOME服务器UDP端口">{{ videoInfo.sipUdpPort || '-' }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import * as dicts from '@vss/device/dicts'
import * as enums from '@vss/device/enums'
import { checkVideoVisible } from '@vss/device/utils/param'
import { Device, VideoDevice } from '@vss/device/type/Device'

@Component({
  name: 'VideoInfo',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  @Prop() private device: Device
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
  private get videoInfo(): VideoDevice {
    return this.inVideoProtocol && this.device.videos[0]![dicts.InVideoProtocolModelMapping[this.inVideoProtocol]]
  }

  // SIP服务器域
  public get sipDomain() {
    return this.videoInfo && this.videoInfo.sipId && this.videoInfo.sipId.toString().substr(0, 10)
  }

  // 根据设备类型 & 接入协议判断字段是否显示
  private checkVisible(prop) {
    return checkVideoVisible.call(this.videoInfo, this.basicInfo.deviceType, this.inVideoProtocol, prop)
  }
}
</script>
