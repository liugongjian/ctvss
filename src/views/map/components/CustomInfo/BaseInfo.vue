<template>
  <div class="map-point-base-info">
    <el-descriptions title="基本信息" :column="1">
      <el-descriptions-item label="设备名称">
        <!-- <div class="deviceName">{{ markerInfo.deviceLabel }}</div> -->
      </el-descriptions-item>
      <el-descriptions-item label="设备状态">
        <!-- {{ DeviceStatus[markerInfo.deviceStatus] || '-' }} -->
      </el-descriptions-item>
      <el-descriptions-item label="流状态">
        <!-- {{ DeviceStatus[markerInfo.streamStatus] || '-' }} -->
      </el-descriptions-item>
      <el-descriptions-item label="录制状态">
        <!-- {{ RecordStatus[markerInfo.recordStatus] || '-' }} -->
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="位置信息" :column="1">
      <el-descriptions-item label="经度">
        <!-- <el-input v-model="markerInfo.longitude" :disabled="!isEdit" /> -->
      </el-descriptions-item>
      <el-descriptions-item label="纬度">
        <!-- <el-input v-model="markerInfo.latitude" :disabled="!isEdit" /> -->
      </el-descriptions-item>
      <el-descriptions-item label="设备颜色">
        #fff
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script  lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'BaseInfo',
  components: {

  }
})
export default class BaseInfo extends Vue {
  private
}
</script>

<style  lang="scss" scoped>
</style>
