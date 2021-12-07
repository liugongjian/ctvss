<template>
  <div class="app-container">
    <div v-loading="loading.info" class="detail-wrap">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="info">
          <div v-if="info">
            <div class="detail__buttons">
              <el-button @click="goSuperior"><svg-icon name="superior" /> 返回上级</el-button>
              <el-button v-if="(!isNVR && info.parentDeviceId === '-1') && checkPermission(['AdminDevice'])" @click="moveDir"><svg-icon name="move" /> 移动至</el-button>
              <el-button v-if="!isVGroup && checkPermission(['AdminDevice'])" @click="edit"><svg-icon name="edit" /> 编辑</el-button>
              <el-button v-if="!isAutoCreated && checkPermission(['AdminDevice']) && !isVGroup" @click="deleteDevice(info)"><svg-icon name="trash" /> 删除</el-button>
            </div>
            <!--状态信息-->
            <div class="detail__section">
              <div class="detail__title">状态信息</div>
            </div>
            <!--设备信息-->
            <div class="detail__section">
              <div class="detail__title">设备信息</div>
              <el-descriptions :column="2">
                <!--通用信息-->
                <el-descriptions-item label="设备ID">
                  {{ info.deviceId }}
                </el-descriptions-item>
                <el-descriptions-item label="设备名称">
                  {{ info.deviceName }}
                </el-descriptions-item>
                <el-descriptions-item label="设备类型">
                  {{ deviceType[info.deviceType] }}
                </el-descriptions-item>
                <el-descriptions-item label="设备厂商">
                  {{ info.deviceVendor || '-' }}
                </el-descriptions-item>
                <el-descriptions-item v-if="info.address" label="设备地址">
                  {{ info.address }}
                </el-descriptions-item>
                <el-descriptions-item v-if="info.deviceLongitude || info.deviceLatitude" label="经纬度">
                  {{ `${info.deviceLongitude || '-'} : ${info.deviceLatitude || '-'}` }}
                </el-descriptions-item>
                <el-descriptions-item label="设备IP">
                  {{ info.deviceIp || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="设备端口">
                  {{ info.devicePort || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <move-dir v-if="dialog.moveDir" :in-protocol="inProtocol" :device="info" :is-batch="false" @on-close="closeDialog('moveDir', ...arguments)" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import detailMixin from '../mixin/detailMixin'

@Component({
  name: 'DeviceGa1400Detail'
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
      min-width: 130px;
    }
  }
</style>
