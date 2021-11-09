<template>
  <div class="app-container">
    <div v-loading="loading.info" class="detail-wrap">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="info">
          <div v-if="info">
            <div class="detail__buttons">
              <el-button @click="goSuperior"><svg-icon name="superior" /> 返回上级</el-button>
              <el-button v-if="info.deviceType === 'nvr'" @click="goToChannels"><svg-icon name="list" /> 查看通道</el-button>
              <el-button v-if="(!isNVR && info.parentDeviceId === '-1') && checkPermission(['AdminDevice'])" @click="moveDir"><svg-icon name="move" /> 移动至</el-button>
              <el-button v-if="!isVGroup && checkPermission(['AdminDevice'])" @click="edit"><svg-icon name="edit" /> 编辑</el-button>
              <!--自动创建的子通道不允许删除-->
              <el-button v-if="!isAutoCreated && checkPermission(['AdminDevice'])" @click="deleteDevice(info)"><svg-icon name="trash" /> 删除</el-button>
            </div>
            <!--状态信息-->
            <div class="detail__section">
              <div class="detail__title">状态信息</div>
              <el-descriptions :column="2">
                <el-descriptions-item label="设备状态">
                  <status-badge :status="info.deviceStatus" />
                  {{ deviceStatus[info.deviceStatus] || '-' }}
                </el-descriptions-item>
                <template v-if="info && !isNVR">
                  <el-descriptions-item label="流状态">
                    <status-badge :status="info.streamStatus" />
                    {{ deviceStatus[info.streamStatus] || '-' }}
                    <el-link v-if="info.streamStatus === 'on' && checkPermission(['*'])" @click="stopDevice(info)">停用流</el-link>
                    <el-link v-else-if="checkPermission(['*'])" @click="startDevice(info)">启用流</el-link>
                  </el-descriptions-item>
                  <el-descriptions-item label="录制状态">
                    <status-badge :status="recordStatusType[info.recordStatus]" />
                    {{ recordStatus[info.recordStatus] || '-' }}
                    <el-link v-if="info.recordStatus === 1 && checkPermission(['*'])" @click="stopRecord(info)">停止录像</el-link>
                    <el-link v-else-if="checkPermission(['*'])" @click="startRecord(info)">开始录像</el-link>
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
                  <el-descriptions-item label="设备地址">
                    {{ (lianzhouFlag ? lianzhouAddress : address) || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="lianzhouFlag" label="经纬度">
                    {{ `${info.deviceLongitude} : ${info.deviceLatitude}` }}
                  </el-descriptions-item>
                  <el-descriptions-item label="设备IP">
                    {{ info.deviceIp || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="设备端口">
                    {{ info.devicePort || '-' }}
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
                <!--通用信息-->
                <el-descriptions-item label="设备国标ID">
                  {{ info.gbId || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="GB28181账号">
                  {{ info.userName }}
                </el-descriptions-item>
                <!--NVR信息-->
                <template v-if="info.deviceType === 'nvr'">
                  <el-descriptions-item label="自动创建子设备">
                    {{ createSubDevice[info.createSubDevice] }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="info.createSubDevice === 2 ? '实际通道数量' : '通道数量'">
                    {{ info.deviceStats && info.deviceStats.channelSize }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="info.createSubDevice === 2" label="可支持通道数量">
                    {{ info.deviceStats && info.deviceStats.maxChannelSize }}
                  </el-descriptions-item>
                  <el-descriptions-item label="在线流数量">
                    {{ info.deviceStats && info.deviceStats.onlineSize }}
                  </el-descriptions-item>
                </template>
                <!--平台信息-->
                <template v-if="info.deviceType === 'platform'">
                  <el-descriptions-item label="通道数量">
                    {{ info.deviceStats && info.deviceStats.channelSize }}
                  </el-descriptions-item>
                  <el-descriptions-item label="在线流数量">
                    {{ info.deviceStats && info.deviceStats.onlineSize }}
                  </el-descriptions-item>
                </template>
                <!--通用信息-->
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
                <el-descriptions-item label="信令传输模式">
                  {{ sipTransType[info.sipTransType] || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="流传输模式">
                  {{ streamTransType[info.streamTransType] || '-' }}
                </el-descriptions-item>
                <el-descriptions-item v-if="info.deviceType === 'nvr' || info.deviceType === 'ipc'">
                  <template slot="label">
                    优先TCP传输
                    <el-popover
                      placement="top-start"
                      title="优先TCP传输"
                      width="400"
                      trigger="hover"
                      :open-delay="300"
                      :content="tips.transPriority"
                    >
                      <svg-icon slot="reference" class="form-question" name="help" />
                    </el-popover>
                  </template>
                  {{ transPriority[info.transPriority] || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="设备描述">
                  {{ info.description || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
            <!--SIP服务信息-->
            <div class="detail__section">
              <div class="detail__title">SIP服务信息</div>
              <el-descriptions v-if="groupInfo" :column="2">
                <el-descriptions-item label="接入区域">
                  {{ groupInfo.regionName || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="SIP服务器ID">
                  {{ groupInfo.sipId || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="SIP服务器域">
                  {{ groupSipDomain || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="SIP服务器地址">
                  {{ groupInfo.sipIp || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="SIP服务器TCP端口">
                  {{ groupInfo.sipTcpPort || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="SIP服务器UDP端口">
                  {{ groupInfo.sipUdpPort || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="!isVGroup" label="配置信息" name="config">
          <detail-config v-if="activeName==='config'" :device-id="deviceId" :in-protocol="inProtocol" />
          <!-- <template-bind v-if="activeName==='config'" :device-id="deviceId" :in-protocol="inProtocol" /> -->
        </el-tab-pane>
        <el-tab-pane v-if="info.deviceType === 'ipc' && checkPermission(['ScreenPreview'])" label="实时预览" name="preview">
          <detail-preview v-if="activeName==='preview'" :device-id="deviceId" :in-protocol="inProtocol" />
        </el-tab-pane>
        <el-tab-pane v-if="info.deviceType === 'ipc' && checkPermission(['ReplayRecord'])" label="录像回放" name="replay">
          <detail-replay v-if="activeName==='replay'" :device-id="deviceId" :in-protocol="inProtocol" />
        </el-tab-pane>
        <el-tab-pane label="AI分析" name="ai">
          <detail-ai v-if="activeName==='ai'" :device-id="deviceId" :in-protocol="inProtocol" />
        </el-tab-pane>
      </el-tabs>
      <canvas-draw v-if="canvasDialog" :device-id="deviceId" :in-protocol="inProtocol" :canvas-if="canvasDialog" />
    </div>
    <set-auth-config v-if="dialog.setAuthConfig" @on-close="closeDialog('setAuthConfig')" />
    <move-dir v-if="dialog.moveDir" :in-protocol="inProtocol" :device="info" :is-batch="false" @on-close="closeDialog('moveDir', ...arguments)" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import detailMixin from '../mixin/detailMixin'
import { provinceMapping, cityMapping } from '@/assets/region/cities'
import DetailAi from '../components/DetailAi.vue'

@Component({
  name: 'DeviceGb28181Detail',
  components: {
    DetailAi
  }
})
export default class extends Mixins(detailMixin) {
  public async mounted() {
    this.getGroup()
  }

  private get address() {
    let info: any = this.info
    if (!info.gbRegion) return null
    let provinceCode: number = parseInt(info.gbRegion.substring(0, 2))
    let cityCode: number = parseInt(info.gbRegion.substring(0, 4))
    return provinceMapping[provinceCode] + ' / ' + cityMapping[cityCode]
  }

  private canvasDialog = false;
  private openCanvasDialog() {
    this.canvasDialog = true
  }
  private closeCanvasDialog() {
    this.canvasDialog = false
  }
}
</script>
<style lang="scss" scoped>
  .detail-wrap {
    ::v-deep .el-descriptions-item__label {
      min-width: 130px;
    }
  }
</style>
