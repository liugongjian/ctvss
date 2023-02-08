<template>
  <div class="app-container">
    <div v-loading="loading.info" class="detail-wrap">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="info">
          <div v-if="info">
            <detail-operation
              :in-protocol="inProtocol"
              :info="info"
              :is-vgroup="isVGroup"
              :is-nvr="isNVR"
              :is-auto-created="isAutoCreated"
            />
            <!-- <div class="detail__buttons">
              <el-button @click="goSuperior"><svg-icon name="superior" /> 返回上级</el-button>
              <el-button v-if="info.deviceType === 'nvr'" @click="goToChannels"><svg-icon name="list" /> 查看通道</el-button>
              <el-button v-if="(!isNVR && info.parentDeviceId === '-1') && checkPermission(['AdminDevice'])" @click="moveDir"><svg-icon name="move" /> 移动至</el-button>
              <el-button v-if="!isVGroup && checkPermission(['AdminDevice'])" @click="changeResourceDialog">配置资源包</el-button>
              <el-button v-if="!isVGroup && checkPermission(['AdminDevice'])" @click="edit"><svg-icon name="edit" /> 编辑</el-button>
              <el-button v-if="!isAutoCreated && checkPermission(['AdminDevice']) && !isVGroup" @click="deleteDevice(info)"><svg-icon name="trash" /> 删除</el-button>
              <el-button class="el-button-rect" @click="detailInit"><svg-icon name="refresh" /></el-button>
            </div> -->
            <!--状态信息-->
            <div class="detail__section">
              <div class="detail__title">状态信息</div>
              <el-descriptions :column="2">
                <el-descriptions-item label="设备状态">
                  <status-badge :status="info.deviceStatus" />
                  {{ deviceStatus[info.deviceStatus] || '-' }}
                </el-descriptions-item>
                <template v-if="info && !isNVR && !isPlatform">
                  <el-descriptions-item v-for="num in info.multiStreamSize" :key="num" :label="`${autoStreamNumObj[num]}状态`">
                    <status-badge :status="getStreamStatus(info.deviceStreams, num) || 'false'" />
                    {{ streamStatus[getStreamStatus(info.deviceStreams, num)] || '-' }}
                    <!-- <el-link v-if="getStreamStatus(info.deviceStreams, num) === 'on' && checkPermission(['AdminDevice']) && !isVGroup" @click="detailOperate('stopDevice', num)">停用{{ autoStreamNumObj[num] }}</el-link>
                    <el-link v-else-if="checkPermission(['AdminDevice']) && !isVGroup" @click="detailOperate('startDevice', num)">启用{{ autoStreamNumObj[num] }}</el-link> -->
                  </el-descriptions-item>
                  <el-descriptions-item label="录制状态">
                    <status-badge :status="recordStatusType[info.recordStatus]" />
                    {{ recordStatus[info.recordStatus] || '-' }}
                    <!-- <el-link v-if="[1, 2].includes(info.recordStatus) && checkPermission(['AdminDevice']) && !isVGroup" @click="detailOperate('stopRecord')">停止录像</el-link>
                    <el-link v-else-if="checkPermission(['AdminDevice']) && !isVGroup" @click="detailOperate('startRecord')">开始录像</el-link> -->
                  </el-descriptions-item>
                  <el-descriptions-item label="当前码率">
                    {{ info.bitrate ? (info.bitrate / 1024).toFixed(2) + 'Mbps' : '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="异常提示">
                    {{ info.errorMessage || '-' }}
                  </el-descriptions-item>
                </template>
              </el-descriptions>
            </div>
            <!--设备信息-->
            <div class="detail__section">
              <div class="detail__title">设备信息</div>
              <el-descriptions :column="2">
                <!--通用信息-->
                <el-descriptions-item label="设备ID">
                  {{ info.deviceId }}
                </el-descriptions-item>
                <template v-if="info && !isNVRChannel">
                  <el-descriptions-item label="设备名称">
                    {{ info.deviceName }}
                  </el-descriptions-item>
                  <el-descriptions-item label="设备类型">
                    {{ deviceType[info.deviceType] }}
                  </el-descriptions-item>
                  <el-descriptions-item label="设备厂商">
                    {{ info.deviceVendor || '-' }}
                  </el-descriptions-item>
                  <!-- <el-descriptions-item label="设备国标ID">
                    {{ info.gbId || '-' }}
                  </el-descriptions-item> -->
                  <el-descriptions-item label="设备地址">
                    {{ deviceAddress || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="info.industryCode" label="所属行业">
                    {{ industryMap[info.industryCode] }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="info.networkCode && networkFlag" label="网络标识">
                    {{ networkMap[info.networkCode] }}
                  </el-descriptions-item>
                  <el-descriptions-item label="经纬度">
                    {{ `${info.deviceLongitude} : ${info.deviceLatitude}` }}
                  </el-descriptions-item>
                  <el-descriptions-item label="设备IP">
                    {{ info.deviceIp || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="设备端口">
                    {{ info.devicePort || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="设备MAC地址">
                    {{ info.macAddr || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="版本">
                    {{ info.ehomeVersion === '5.0' ? 'EHOME2.0' : 'ISUP5.0' }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="info.ehomeVersion === '5.0'" label="凭证名称">
                    {{ info.userName || '-' }}
                  </el-descriptions-item>
                </template>
                <!--子通道信息-->
                <template v-if="info && isNVRChannel">
                  <el-descriptions-item v-if="info.deviceChannels.length" label="通道号">
                    {{ 'D' + info.deviceChannels[0].channelNum }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="info.deviceChannels.length" label="通道名称">
                    {{ info.deviceChannels[0].channelName }}
                  </el-descriptions-item>
                  <el-descriptions-item label="设备厂商">
                    {{ info.deviceVendor || '-' }}
                  </el-descriptions-item>
                </template>
                <!--NVR信息-->
                <template v-if="info.deviceType === 'nvr'">
                  <!-- <el-descriptions-item label="自动创建子设备">
                    {{ createSubDevice[info.createSubDevice] }}
                  </el-descriptions-item> -->
                  <el-descriptions-item :label="info.createSubDevice === 2 ? '实际通道数量' : '通道数量'">
                    {{ info.deviceStats && info.deviceStats.channelSize }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="info.createSubDevice === 2" label="可支持通道数量">
                    {{ info.deviceStats && info.deviceStats.maxChannelSize }}
                  </el-descriptions-item>
                  <el-descriptions-item label="在线流数量">
                    {{ info.deviceStats && info.deviceStats.onlineStreams }}
                  </el-descriptions-item>
                </template>
                <!--通用信息-->
                <el-descriptions-item label="经纬度">
                  {{ `${info.deviceLongitude} : ${info.deviceLatitude}` }}
                </el-descriptions-item>
                <el-descriptions-item label="主子码流数量">
                  {{ info.multiStreamSize }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    自动拉流
                    <el-popover
                      placement="top-start"
                      title="自动拉流"
                      width="400"
                      trigger="hover"
                      :open-delay="300"
                      :content="tips.pullType"
                    >
                      <svg-icon slot="reference" class="form-question" name="help" />
                    </el-popover>
                  </template>
                  {{ pullType[info.pullType] }}
                </el-descriptions-item>
                <el-descriptions-item v-if="info.pullType === 1" label="自动拉取码流">
                  {{ autoStreamNumObj[info.autoStreamNum] }}
                </el-descriptions-item>
                <!-- <el-descriptions-item label="优先TCP传输">
                  {{ transPriority[info.transPriority] || '-' }}
                </el-descriptions-item> -->
                <el-descriptions-item label="设备描述">
                  {{ info.description || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
            <!--EHOME服务信息-->
            <div class="detail__section">
              <div class="detail__title">EHOME服务信息</div>
              <el-descriptions v-if="groupInfo" :column="2">
                <el-descriptions-item label="接入区域">
                  {{ groupInfo.regionName || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="EHOME服务器地址">
                  {{ groupInfo.sipIp || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="EHOME服务器TCP端口">
                  {{ groupInfo.sipTcpPort || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="EHOME服务器UDP端口">
                  {{ groupInfo.sipUdpPort || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="设备/流事件" name="events">
          <detail-events v-if="activeName==='events'" :device-id="deviceId" :in-protocol="inProtocol" />
        </el-tab-pane>
        <el-tab-pane label="配置信息" name="config">
          <detail-config v-if="activeName==='config'" :device-id="deviceId" :in-protocol="info.inProtocol" />
        </el-tab-pane>
        <el-tab-pane v-if="info && info.deviceType === 'ipc' && checkPermission(['ScreenPreview'])" label="实时预览" name="preview">
          <detail-preview
            v-if="activeName==='preview'"
            :device-id="deviceId"
            :in-protocol="inProtocol"
            :device-name="info.deviceName"
            :streams="info.deviceStreams"
            :stream-size="info.multiStreamSize"
          />
        </el-tab-pane>
        <el-tab-pane v-if="info && info.deviceType === 'ipc' && checkPermission(['ReplayRecord'])" label="录像回放" name="replay">
          <detail-replay v-if="activeName==='replay'" :device-id="deviceId" :in-protocol="inProtocol" />
        </el-tab-pane>
        <el-tab-pane label="AI分析" name="ai">
          <detail-ai v-if="activeName==='ai'" :device-id="deviceId" :in-protocol="inProtocol" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <resource v-if="showResourceDialog" :device="info" :algo-tab-type-default="algoTabTypeDefault" @on-close="closeResourceDialog" />
    <SetAuthConfig v-if="dialog.setAuthConfig" @on-close="closeDialog('setAuthConfig')" />
    <move-dir v-if="dialog.moveDir" :in-protocol="inProtocol" :device="info" @on-close="closeDialog('moveDir')" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import detailMixin from '../mixin/detailMixin'
import DetailAi from '../components/DetailAi.vue'

@Component({
  name: 'DeviceEhomeDetail',
  components: {
    DetailAi
  }
})
export default class extends Mixins(detailMixin) {
  public async mounted() {
    this.getGroup()
  }
}
</script>

<style lang="scss" scoped>
  .detail-wrap {
    ::v-deep .el-descriptions-item__label {
      min-width: 150px;
    }
  }
</style>
