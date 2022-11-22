<template>
  <div>
    <div class="detail__buttons">
      <el-button v-if="checkToolsVisible(toolsEnum.EditDevice, [policyEnum.AdminDevice]) && !(isChannel && isIbox)" type="text" @click="edit">编辑</el-button>
      <el-button v-if="checkVisible(deviceEnum.Resources) && checkToolsVisible(toolsEnum.UpdateResource, [policyEnum.AdminDevice])" type="text">配置资源包</el-button>
      <el-dropdown
        v-adaptive-hiding="adaptiveHideTag"
        @command="handleTools($event, handleData, inVideoProtocol)"
      >
        <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
        <el-dropdown-menu slot="dropdown" :class="{ adaptiveHideTag }">
          <div v-if="checkToolsVisible(toolsEnum.StopDevice)">
            <el-dropdown-item v-if="streamStatus === statusEnum.On && checkToolsVisible(toolsEnum.StopDevice)" :command="toolsEnum.StopDevice">停用流</el-dropdown-item>
            <el-dropdown-item v-else :command="toolsEnum.StartDevice">启用流</el-dropdown-item>
          </div>
          <div v-if="checkToolsVisible(toolsEnum.StartRecord) && !isIbox">
            <el-dropdown-item v-if="recordStatus === statusEnum.On" :command="toolsEnum.StopRecord">停止录像</el-dropdown-item>
            <el-dropdown-item v-else :command="toolsEnum.StartRecord">开始录像</el-dropdown-item>
          </div>
          <!-- <el-dropdown-item v-if="hasViid && checkToolsVisible(toolsEnum.DeleteDevice)" :command="toolsEnum.DeleteDevice">删除</el-dropdown-item> -->
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 状态信息 -->
    <el-descriptions title="状态信息" :column="2">
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceStatus)" label="视频接入">
        <status-badge :status="videoInfo.deviceStatus.isOnline" />
        {{ dicts.DeviceStatus[videoInfo.deviceStatus.isOnline] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.StreamStatus)" label="视频流">
        <status-badge :status="streamStatus" />
        {{ dicts.StreamStatus[streamStatus] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.RecordStatus)" label="视频录制">
        <status-badge :status="recordStatus" />
        {{ dicts.RecordStatus[recordStatus] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceChannelSize)" label="通道数量">{{ basicInfo.deviceChannelSize }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.OnlineChannels)" label="在线流数量">{{ basicInfo.deviceStats && basicInfo.deviceStats.onlineChannels || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.Bitrate)" label="当前码率">{{ streamInfo.bitrate ? (streamInfo.bitrate / 1024).toFixed(2) + 'Mbps' : '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.ErrorMsg)" label="异常提示">{{ videoInfo.errorMsg || '-' }}</el-descriptions-item>
    </el-descriptions>

    <!-- 接入信息 -->
    <el-descriptions title="接入信息" :column="2">
      <el-descriptions-item v-if="checkVisible(deviceEnum.InVideoProtocol)" label="协议类型">{{ dicts.InVideoProtocol[inVideoProtocol] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.OutId)" :label="dicts.VideoParamLabel[inVideoProtocol][deviceEnum.OutId]">{{ videoInfo.outId || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.InVersion)" :label="dicts.VideoParamLabel[inVideoProtocol][deviceEnum.InVersion]">{{ videoInfo.inVersion || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.InUserName)" :label="dicts.VideoParamLabel[inVideoProtocol][deviceEnum.InUserName]">{{ videoInfo.inUserName || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.SipTransType)" label="信令传输模式">{{ dicts.SipTransType[videoInfo.sipTransType] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceStreamSize)" label="主子码流数量">{{ dicts.DeviceStreamSize[videoInfo.deviceStreamSize] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceStreamAutoPull)" label="自动拉流">{{ dicts.DeviceStreamAutoPull[videoInfo.deviceStreamAutoPull] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceStreamPullIndex)" label="自动拉取码流">{{ dicts.DeviceStreamPullIndex[videoInfo.deviceStreamPullIndex] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.StreamTransProtocol)" label="优先TCP传输">{{ dicts.StreamTransProtocol[videoInfo.streamTransProtocol] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.StreamTransType)" label="流传输模式">{{ dicts.StreamTransType[streamInfo.streamTransType] || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.InType)" label="视频流接入方式">{{ dicts.InType[videoInfo.inType] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.PushType)" label="自动激活推流地址">{{ dicts.PushType[videoInfo.pushType] }}</el-descriptions-item>
      <el-descriptions-item v-if="checkVisible(deviceEnum.PushUrl)" label="推流地址">
        {{ videoInfo.pushUrl }}
        <el-tooltip v-if="videoInfo.pushUrl" class="item" effect="dark" content="复制链接" placement="top">
          <el-button class="copy-button" type="text" @click="copyUrl(videoInfo.pushUrl)"><svg-icon name="copy" /></el-button>
        </el-tooltip>
      </el-descriptions-item>
      <template v-if="basicInfo[deviceEnum.DeviceVendor] === '其他' || checkVisible(deviceEnum.OnlyPullUrl)">
        <el-descriptions-item v-if="checkVisible(deviceEnum.PullUrl)" label="拉流地址">
          {{ videoInfo.pullUrl }}
          <el-tooltip v-if="videoInfo.pullUrl" class="item" effect="dark" content="复制链接" placement="top">
            <el-button class="copy-button" type="text" @click="copyUrl(videoInfo.pullUrl)"><svg-icon name="copy" /></el-button>
          </el-tooltip>
        </el-descriptions-item>
      </template>
      <template v-else>
        <el-descriptions-item v-if="checkVisible(deviceEnum.UserName)" label="用户名">{{ videoInfo.userName }}</el-descriptions-item>
        <el-descriptions-item v-if="checkVisible(deviceEnum.DeviceDomain)" label="设备域名">{{ videoInfo.deviceDomain }}</el-descriptions-item>
        <el-descriptions-item v-if="checkVisible(deviceEnum.Ip)" label="接入IP">{{ videoInfo.deviceIp }}</el-descriptions-item>
        <el-descriptions-item v-if="checkVisible(deviceEnum.Port)" label="端口">{{ +videoInfo.devicePort === 0 ? '-' : videoInfo.devicePort }}</el-descriptions-item>
      </template>
    </el-descriptions>

    <!-- 国标SIP信息 -->
    <el-descriptions v-if="checkVisible(deviceEnum.Gb28181SipInfo)" title="SIP信息" :column="2">
      <el-descriptions-item label="SIP服务器ID">{{ videoInfo.sipId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器域">{{ sipDomain }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器地址">{{ videoInfo.sipIp || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器TCP端口">{{ videoInfo.sipTcpPort || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SIP服务器UDP端口">{{ videoInfo.sipUdpPort || '-' }}</el-descriptions-item>
    </el-descriptions>

    <!-- EHOME SIP信息 -->
    <el-descriptions v-if="checkVisible(deviceEnum.EhomeSipInfo)" title="EHOME服务信息" :column="2">
      <el-descriptions-item label="EHOME服务器地址">{{ videoInfo.sipIp || '-' }}</el-descriptions-item>
      <el-descriptions-item label="EHOME服务器TCP端口">{{ videoInfo.sipTcpPort || '-' }}</el-descriptions-item>
      <el-descriptions-item label="EHOME服务器UDP端口">{{ videoInfo.sipUdpPort || '-' }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import * as dicts from '@vss/device/dicts'
import { DeviceEnum, StatusEnum, ToolsEnum } from '@vss/device/enums'
import { PolicyEnum } from '@vss/base/enums/iam'
import { checkVideoVisible } from '@vss/device/utils/param'
import { Device, VideoDevice } from '@vss/device/type/Device'
import copy from 'copy-to-clipboard'

@Component({
  name: 'VideoInfo',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  @Inject('handleTools')
  private handleTools!: Function
  @Inject('checkToolsVisible')
  private checkToolsVisible!: Function
  @Prop() private device: Device
  @Prop({ default: false }) private isIbox: boolean
  private dicts = dicts
  private deviceEnum = DeviceEnum
  private statusEnum = StatusEnum
  private toolsEnum = ToolsEnum
  private policyEnum = PolicyEnum
  private adaptiveHideTag = 'adaptiveHideTag'

  // 设备基本信息
  private get basicInfo() {
    return this.device.device
  }

  // 视频接入协议
  private get inVideoProtocol() {
    return this.device.videos && this.device.videos.length && this.device.videos[0]?.inVideoProtocol
  }

  // 视频接入信息
  private get videoInfo(): VideoDevice {
    return this.inVideoProtocol && this.device.videos[0][dicts.InVideoProtocolModelMapping[this.inVideoProtocol]]
  }

  // SIP服务器域
  public get sipDomain() {
    return this.videoInfo && this.videoInfo.sipId && this.videoInfo.sipId.toString().substr(0, 10)
  }

  // 流信息
  public get streamInfo() {
    return this.videoInfo && this.videoInfo.streams.length && this.videoInfo.streams.find(stream => stream.streamNum === this.videoInfo.deviceStreamPullIndex)
  }

  // 流状态
  public get streamStatus() {
    return this.streamInfo && this.streamInfo.streamStatus
  }

  // 录制状态
  public get recordStatus() {
    return this.streamInfo && this.streamInfo.recordStatus
  }

  // 是否含视图库
  private get hasViid() {
    return this.device.viids && this.device.viids.length
  }

  // 是否为通道
  private get isChannel() {
    return this.basicInfo.deviceChannelNum > -1
  }

  // 操作所需的数据
  private get handleData() {
    return {
      ...this.basicInfo,
      ...this.streamInfo
    }
  }

  // 根据设备类型 & 接入协议判断字段是否显示
  private checkVisible(prop) {
    return checkVideoVisible.call({ ...this.videoInfo, ...this.basicInfo, isIbox: this.isIbox }, this.basicInfo.deviceType, this.inVideoProtocol, prop)
  }

  // 进入编辑模式
  private edit() {
    this.$emit('edit')
  }

  /**
   * 一键复制
   */
  public copyUrl(text: string) {
    copy(text)
    this.$message.success('复制成功')
  }
}
</script>
<style lang="scss" scoped>
  .copy-button {
    padding: 0;
  }
</style>