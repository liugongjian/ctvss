<template>
  <div class="app-container">
    <div v-loading="loading.info" class="detail-wrap">
      <div v-if="info" class="btn-detail">
        <el-button v-if="checkPermission(['ScreenPreview', 'ReplayRecord'])" @click="goToPreview"><svg-icon name="live" /> 实时预览</el-button>
        <el-button v-if="!isVGroup && checkPermission(['AdminDevice'])" @click="edit"><svg-icon name="edit" /> 编辑</el-button>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="info">
          <div v-if="info">
            <info-list v-if="info && !isNVRChannel" label-width="110">
              <info-list-item label="设备类型:">{{ deviceType[info.deviceType] }}</info-list-item>
              <info-list-item label="设备名称:">{{ info.deviceName }}</info-list-item>
              <info-list-item label="设备ID:">{{ info.deviceId }}</info-list-item>
              <info-list-item label="厂商:">{{ info.deviceVendor || '-' }}</info-list-item>
              <info-list-item v-if="lianzhouFlag" label="设备地址:">{{ lianzhouAddress || '-' }}</info-list-item>
              <info-list-item v-if="lianzhouFlag" label="经纬度:">{{ `${info.deviceLongitude || '-'} : ${info.deviceLatitude || '-'}` }}</info-list-item>
              <template v-if="info.deviceType === 'nvr'">
                <info-list-item label="自动创建子设备:">{{ createSubDevice[info.createSubDevice] }}</info-list-item>
                <info-list-item label="实际通道数量:">{{ info.deviceStats && info.deviceStats.channelSize }}</info-list-item>
                <info-list-item label="可支持通道数量:">{{ info.deviceStats && info.deviceStats.maxChannelSize }}</info-list-item>
              </template>
            </info-list>
            <info-list v-if="info && isNVRChannel" label-width="110">
              <info-list-item label="设备ID:">{{ info.deviceId }}</info-list-item>
              <info-list-item v-if="info.deviceChannels.length" label="通道号:">{{ 'D' + info.deviceChannels[0].channelNum }}</info-list-item>
              <info-list-item v-if="info.deviceChannels.length" label="通道名称:">{{ info.deviceChannels[0].channelName }}</info-list-item>
              <info-list-item label="厂商:">{{ info.deviceVendor || '-' }}</info-list-item>
              <info-list-item v-if="lianzhouFlag" label="设备地址:">{{ lianzhouAddress || '-' }}</info-list-item>
              <info-list-item v-if="lianzhouFlag" label="经纬度:">{{ `${info.deviceLongitude || '-'} : ${info.deviceLatitude || '-'}` }}</info-list-item>
            </info-list>
            <info-list v-if="info" label-width="110">
              <info-list-item label="设备IP:">{{ info.deviceIp }}</info-list-item>
              <info-list-item label="设备端口:">{{ info.devicePort }}</info-list-item>
              <info-list-item label="主子码流数量:">{{ info.multiStreamSize }}</info-list-item>
              <info-list-item label="自动拉流:">{{ pullType[info.pullType] || '-' }}</info-list-item>
              <info-list-item label="设备状态:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    <status-badge :status="info.deviceStatus" />
                    {{ deviceStatus[info.deviceStatus] || '-' }}
                  </div>
                </div>
              </info-list-item>
              <info-list-item v-if="info.pullType === 1" label="自动拉取码流:">{{ autoStreamNumObj[info.autoStreamNum] }}</info-list-item>
              <template v-if="info.deviceType === 'ipc' || info.deviceType === 'platform'">
                <info-list-item v-for="num in info.multiStreamSize" :key="num" :label="`${autoStreamNumObj[num]}状态`">
                  <div class="info-list__edit">
                    <div class="info-list__edit--value">
                      <status-badge :status="getStreamStatus(info.deviceStreams, num) || 'false'" />
                      {{ deviceStatus[getStreamStatus(info.deviceStreams, num)] || '-' }}
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
              <info-list-item label="流传输模式:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    {{ streamTransType[info.streamTransType] || '-' }}
                  </div>
                </div>
              </info-list-item>
              <info-list-item v-for="resource in resources" :key="resource.label" :label="`${resourceType[resource.label]}:`">{{ (resource.value && '已绑定') || '未绑定' }}</info-list-item>
              <info-list-item label="设备描述:">{{ info.description || '-' }}</info-list-item>
              <info-list-item label="拉流地址:">
                {{ info.pullUrl || '-' }}
                <el-tooltip v-if="info.pullUrl" class="item" effect="dark" content="复制链接" placement="top">
                  <el-button type="text" @click="copyUrl(info.pullUrl)"><svg-icon name="copy" /></el-button>
                </el-tooltip>
              </info-list-item>
            </info-list>
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="!isVGroup" label="模板配置" name="template">
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

@Component({
  name: 'DeviceEhomeDetail'
})
export default class extends Mixins(detailMixin) {}
</script>

<style lang="scss" scoped>
  .app-container {
    ::v-deep {
      .info-list__title {
        margin: 10px 5px 0 5px;
      }
      .info-item .el-button {
        padding: 0;
      }
      .info-item  .el-tag--medium {
        height: 24px;
        line-height: 22px;
        margin-right: 5px;
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
