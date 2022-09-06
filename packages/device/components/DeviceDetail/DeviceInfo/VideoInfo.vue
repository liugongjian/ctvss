<template>
  <div>
    <div class="detail__buttons">
      <el-button type="text" @click="edit">编辑</el-button>
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
      <el-descriptions-item label="视频接入">
        <status-badge :status="videoInfo.DeviceStatus.IsOnline" />
        {{ dicts.DeviceStatus[videoInfo.DeviceStatus.IsOnline] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="视频流">
        <status-badge :status="streamStatus" />
        {{ dicts.StreamStatus[streamStatus] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="视频录制">
        <status-badge :status="recordStatus" />
        {{ dicts.RecordStatus[recordStatus] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.OnlineChannels)" label="在线流数量">{{ basicInfo.DeviceStats.OnlineChannels }}</el-descriptions-item>
      <el-descriptions-item label="当前码率">{{ streamInfo.Bitrate ? (streamInfo.Bitrate / 1024).toFixed(2) + 'Mbps' : '-' }}</el-descriptions-item>
      <el-descriptions-item label="异常提示">{{ videoInfo.ErrorMsg }}</el-descriptions-item>
    </el-descriptions>

    <!-- 接入信息 -->
    <el-descriptions title="接入信息" :column="2">
      <el-descriptions-item label="协议类型">{{ dicts.InVideoProtocol[inVideoProtocol] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.OutId)" :label="dicts.VideoParamLabel[inVideoProtocol][deviceEnum.OutId]">{{ videoInfo.OutId || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.InVersion)" :label="dicts.VideoParamLabel[inVideoProtocol][deviceEnum.InVersion]">{{ videoInfo.InVersion || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.InUserName)" :label="dicts.VideoParamLabel[inVideoProtocol][deviceEnum.InUserName]">{{ videoInfo.InUserName || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceChannelSize)" label="通道数量">{{ basicInfo.DeviceChannelSize }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceMac)" label="设备MAC地址">{{ videoInfo.DeviceMac }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DevicePoleId)" label="杆号">{{ videoInfo.DevicePoleId }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.SipTransType)" label="信令传输模式">{{ dicts.SipTransType[videoInfo.SipTransType] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceStreamSize)" label="主子码流数量">{{ dicts.DeviceStreamSize[videoInfo.DeviceStreamSize] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceStreamAutoPull)" label="自动拉流">{{ dicts.DeviceStreamAutoPull[videoInfo.DeviceStreamAutoPull] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceStreamPullIndex)" label="自动拉取码流">{{ dicts.DeviceStreamPullIndex[videoInfo.DeviceStreamPullIndex] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.StreamTransProtocol)" label="优先TCP传输">{{ dicts.StreamTransProtocol[videoInfo.StreamTransProtocol] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.StreamTransType)" label="流传输模式">{{ dicts.StreamTransType[streamInfo.StreamTransType] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.InType)" label="视频流接入方式">{{ dicts.InType[videoInfo.InType] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.PushType)" label="自动激活推流地址">{{ dicts.PushType[videoInfo.PushType] }}</el-descriptions-item>
      <template v-if="basicInfo[deviceEnum.DeviceVendor] === '其他' || checkVisible(deviceEnum.OnlyPullUrl)">
        <el-descriptions-item v-if="checkVisible(deviceEnum.PullUrl)" label="拉流地址">{{ videoInfo.PullUrl }}</el-descriptions-item>
      </template>
      <template v-else>
        <el-descriptions-item v-if="checkVisible(deviceEnum.UserName)" label="用户名">{{ videoInfo.UserName }}</el-descriptions-item>
        <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceDomain)" label="设备域名">{{ videoInfo.DeviceDomain }}</el-descriptions-item>
        <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceIp)" label="设备IP">{{ basicInfo.DeviceIp }}</el-descriptions-item>
        <el-descriptions-item v-if="checkVisible(deviceEnum.DevicePort)" label="设备端口">{{ basicInfo.DevicePort }}</el-descriptions-item>
      </template>
    </el-descriptions>

    <!-- 国标SIP信息 -->
    <el-descriptions v-if="checkVisible(deviceEnum.Gb28181SipInfo)" title="SIP信息" :column="2">
      <el-descriptions-item label="SIP服务器ID">{{ videoInfo.SipId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器域">{{ sipDomain }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器地址">{{ videoInfo.SipIp || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器TCP端口">{{ videoInfo.SipTcpPort || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器UDP端口">{{ videoInfo.SipUdpPort || '-' }}</el-descriptions-item>
    </el-descriptions>

    <!-- EHOME SIP信息 -->
    <el-descriptions v-if="checkVisible(deviceEnum.EhomeSipInfo)" title="EHOME服务信息" :column="2">
      <el-descriptions-item label="EHOME服务器地址">{{ videoInfo.SipIp || '-' }}</el-descriptions-item>
      <el-descriptions-item label="EHOME服务器TCP端口">{{ videoInfo.SipTcpPort || '-' }}</el-descriptions-item>
      <el-descriptions-item label="EHOME服务器UDP端口">{{ videoInfo.SipUdpPort || '-' }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import * as dicts from '@vss/device/dicts'
import { DeviceEnum, StatusEnum } from '@vss/device/enums'
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
  private deviceEnum = DeviceEnum

  // 设备基本信息
  private get basicInfo() {
    return this.device.Device
  }

  // 视频接入协议
  private get inVideoProtocol() {
    return this.device.Videos && this.device.Videos[0]!.InVideoProtocol
  }

  // 视频接入信息
  private get videoInfo(): VideoDevice {
    return this.inVideoProtocol && this.device.Videos[0]![dicts.InVideoProtocolModelMapping[this.inVideoProtocol]]
  }

  // SIP服务器域
  public get sipDomain() {
    return this.videoInfo && this.videoInfo.SipId && this.videoInfo.SipId.toString().substr(0, 10)
  }

  // 流信息
  public get streamInfo() {
    return this.videoInfo && this.videoInfo.Streams.length && this.videoInfo.Streams[this.videoInfo.DeviceStreamPullIndex - 1]
  }

  // 流状态
  public get streamStatus() {
    const streamStataus = this.videoInfo && this.videoInfo.Streams.length && this.videoInfo.Streams.some(stream => stream.StreamStatus === StatusEnum.On)
    return streamStataus ? StatusEnum.On : StatusEnum.Off
  }

  // 录制状态
  public get recordStatus() {
    return this.streamInfo && this.streamInfo.RecordStatus
  }

  // 根据设备类型 & 接入协议判断字段是否显示
  private checkVisible(prop) {
    return checkVideoVisible.call(this.videoInfo, this.basicInfo.DeviceType, this.inVideoProtocol, prop)
  }

  // 进入编辑模式
  private edit() {
    this.$emit('edit')
  }
}
</script>
