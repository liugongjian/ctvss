<template>
  <div class="app-container">
    <div v-loading="loading.info" class="detail-wrap">
      <div v-if="info" class="btn-detail">
        <el-button v-if="checkPermission(['ivs:GetLiveStream', 'ivs:GetCloudRecord'], actions)" @click="goToPreview(checkPermission(['ivs:GetLiveStream'], actions) ? 'preview' : 'replay')"><svg-icon name="live" /> 实时预览</el-button>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="info">
          <div v-if="info">
            <info-list abel-width="100">
              <info-list-item label="设备类型:">{{ deviceType[info.deviceType] }}</info-list-item>
              <info-list-item label="设备名称:">{{ info.deviceName }}</info-list-item>
              <info-list-item label="设备ID:">{{ info.deviceId }}</info-list-item>
              <info-list-item label="地点:">{{ info.devicePosition || '-' }}</info-list-item>
              <info-list-item label="设备型号:">{{ info.deviceModel || '-' }}</info-list-item>
              <info-list-item label="硬件:">{{ info.deviceHardware || '-' }}</info-list-item>
              <info-list-item label="固件:">{{ info.deviceFirmware || '-' }}</info-list-item>
              <info-list-item label="公网IP地址:">{{ info.devicePubIp }}</info-list-item>
              <info-list-item label="公网端口:">{{ info.devicePubPort }}</info-list-item>
              <info-list-item label="局域网IP地址:">{{ info.deviceIp }}</info-list-item>
              <info-list-item label="局域网端口:">{{ info.devicePort }}</info-list-item>
              <info-list-item label="厂商:">{{ info.deviceVendor || '-' }}</info-list-item>
              <info-list-item label="流状态:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    <status-badge :status="info.streamStatus" />
                    {{ streamStatus[info.streamStatus] || '-' }}
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
              <info-list-item label="设备描述:">{{ info.description || '-' }}</info-list-item>
            </info-list>
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="!isVGroup" label="模板配置" name="template">
          <template-bind v-if="activeName==='template'" :device-id="deviceId" :in-protocol="info.inProtocol" />
        </el-tab-pane>
        <!-- <el-tab-pane label="AI分析" name="ai">
          <detail-ai v-if="activeName==='ai'" :device-id="deviceId" :in-protocol="inProtocol" />
        </el-tab-pane> -->
      </el-tabs>
    </div>
    <SetAuthConfig v-if="dialog.setAuthConfig" @on-close="closeDialog('setAuthConfig')" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import detailMixin from '../mixin/detailMixin'
import DetailAi from '../components/DetailAi.vue'

@Component({
  name: 'DeviceRtmpDetail',
  components: {
    DetailAi
  }
})
export default class extends Mixins(detailMixin) {}
</script>
<style lang="scss" scoped>
  .app-container {
    ::v-deep {
      .info-list__title {
        margin: 10px 5px 0;
      }

      .info-item .el-button {
        padding: 0;
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
