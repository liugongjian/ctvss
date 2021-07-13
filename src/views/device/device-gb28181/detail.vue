<template>
  <div class="app-container">
    <div v-loading="loading.info" class="detail-wrap">
      <div v-if="info" class="btn-detail">
        <el-button v-if="info.deviceType === 'ipc'" @click="goToPreview"><svg-icon name="live" /> 实时预览</el-button>
        <el-button v-if="info.deviceType === 'nvr'" @click="goToChannels"><svg-icon name="list" /> 查看通道</el-button>
        <el-button v-if="checkPermission(['*'])" @click="edit"><svg-icon name="edit" /> 编辑</el-button>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="info">
          <div>
            <info-list v-if="info && !isNVRChannel" label-width="110">
              <info-list-item label="设备类型:">{{ deviceType[info.deviceType] }}</info-list-item>
              <info-list-item label="设备名称:">{{ info.deviceName }}</info-list-item>
              <info-list-item label="设备ID:">{{ info.deviceId }}</info-list-item>
              <info-list-item label="厂商:">{{ info.deviceVendor || '-' }}</info-list-item>
              <info-list-item label="设备地址:">{{ address || '-' }}</info-list-item>
              <info-list-item label="设备IP:">{{ info.deviceIp || '-' }}</info-list-item>
              <info-list-item label="端口:">{{ info.devicePort || '-' }}</info-list-item>
              <template v-if="info.deviceType === 'ipc' || info.deviceType === 'platform'">
                <info-list-item label="设备国标ID:">{{ info.gbId }}</info-list-item>
              </template>
              <template v-if="info.deviceType === 'nvr'">
                <info-list-item label="设备国标ID:">{{ info.gbId }}</info-list-item>
                <info-list-item label="自动创建子设备:">{{ createSubDevice[info.createSubDevice] }}</info-list-item>
                <info-list-item :label="info.createSubDevice === 2 ? '实际通道数量:' : '通道数量:'">{{ info.deviceStats && info.deviceStats.channelSize }}</info-list-item>
                <info-list-item v-if="info.createSubDevice === 2" label="可支持通道数量:">{{ info.deviceStats && info.deviceStats.maxChannelSize }}</info-list-item>
                <info-list-item label="在线流数量:">{{ info.deviceStats && info.deviceStats.onlineSize }}</info-list-item>
              </template>
              <template v-if="info.deviceType === 'platform'">
                <info-list-item label="通道数量:">{{ info.deviceStats && info.deviceStats.channelSize }}</info-list-item>
                <info-list-item label="在线流数量:">{{ info.deviceStats && info.deviceStats.onlineSize }}</info-list-item>
              </template>
              <info-list-item label="GB28181账号:">{{ info.userName }}</info-list-item>
            </info-list>
            <info-list v-if="info && isNVRChannel" label-width="110">
              <info-list-item label="设备ID:">{{ info.deviceId }}</info-list-item>
              <info-list-item v-if="info.deviceChannels.length" label="通道号:">{{ 'D' + info.deviceChannels[0].channelNum }}</info-list-item>
              <info-list-item v-if="info.deviceChannels.length" label="通道名称:">{{ info.deviceChannels[0].channelName }}</info-list-item>
              <info-list-item label="厂商:">{{ info.deviceVendor || '-' }}</info-list-item>
              <info-list-item label="设备国标ID:">{{ info.gbId }}</info-list-item>
            </info-list>
            <info-list v-if="info" label-width="110">
              <info-list-item label="自动拉流:">{{ pullType[info.pullType] }}</info-list-item>
              <info-list-item label="设备状态:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    <status-badge :status="info.deviceStatus" />
                    {{ deviceStatus[info.deviceStatus] || '-' }}
                  </div>
                </div>
              </info-list-item>
              <template v-if="info.deviceType === 'ipc' || info.deviceType === 'platform'">
                <info-list-item label="流状态:">
                  <div class="info-list__edit">
                    <div class="info-list__edit--value">
                      <status-badge :status="info.streamStatus" />
                      {{ deviceStatus[info.streamStatus] }}
                    </div>
                  </div>
                </info-list-item>
                <info-list-item label="录制状态:">
                  <div class="info-list__edit">
                    <div class="info-list__edit--value">
                      <status-badge :status="info.recordStatus === 1 ? 'red' : ''" />
                      {{ recordStatus[info.recordStatus] }}
                    </div>
                  </div>
                </info-list-item>
              </template>
              <info-list-item label="信令传输模式:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    {{ sipTransType[info.sipTransType] || '-' }}
                  </div>
                </div>
              </info-list-item>
              <info-list-item label="流传输模式:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    {{ streamTransType[info.streamTransType] || '-' }}
                  </div>
                </div>
              </info-list-item>
              <info-list-item v-if="info.deviceType === 'nvr' || info.deviceType === 'ipc'" label="优先TCP传输:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    {{ transPriority[info.transPriority] || '-' }}
                  </div>
                </div>
              </info-list-item>
              <info-list-item v-for="resource in resources" :key="resource.label" :label="`${resourceType[resource.label]}:`">{{ (resource.value && '已绑定') || '未绑定' }}</info-list-item>
              <info-list-item label="设备描述:">{{ info.description || '-' }}</info-list-item>
            </info-list>
          </div>
        </el-tab-pane>
        <el-tab-pane label="模板配置" name="template">
          <template-bind v-if="activeName==='template'" :device-id="deviceId" :in-protocol="inProtocol" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <SetAuthConfig v-if="dialog.setAuthConfig" @on-close="closeDialog('setAuthConfig')" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import detailMixin from '../mixin/detailMixin'
import { provinceMapping, cityMapping } from '@/assets/region/cities'

@Component({
  name: 'DeviceGb28181Detail'
})
export default class extends Mixins(detailMixin) {
  private get address() {
    let info: any = this.info
    if (!info.gbRegion) return null
    let provinceCode: number = parseInt(info.gbRegion.substring(0, 2))
    let cityCode: number = parseInt(info.gbRegion.substring(0, 4))
    return provinceMapping[provinceCode] + ' / ' + cityMapping[cityCode]
  }
}
</script>
<style lang="scss" scoped>
  .app-container {
    ::v-deep {
      .info-list__title {
        margin: 10px 5px 0 5px;
      }
    }
  }

  .detail-wrap {
    position: relative;
    padding-top: 6px;
    .btn-detail {
      position: absolute;
      top: -12px;
      right: 0;
      z-index: 9;
    }
  }

  .info-edit {
    position: absolute;
    right: 40px;
    z-index: 10;
  }

  .address-maker {
    background: $borderGrey;
    border-radius: 5px;
    padding: 15px 0;
    margin-bottom: 20px;

    .el-button--text {
      padding: 0;
    }
  }

  .auth-config {
    position: relative;

    &__edit {
      position: absolute;
      top: 0;
      right: 10px;
      padding: 0;
    }
  }

  .template-edit {
    float: right;
    padding: 0;
    margin: 0;
  }

</style>
