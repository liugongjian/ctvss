<template>
  <div>
    <el-descriptions title="基本信息" :column="1">
      <el-descriptions-item label="设备名称">
        {{ marker.deviceLabel }}
      </el-descriptions-item>
      <el-descriptions-item label="设备状态">
        {{ DeviceStatus[marker.deviceStatus] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="流状态">
        {{ DeviceStatus[marker.streamStatus] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="录制状态">
        {{ RecordStatus[marker.recordStatus] || '-' }}
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="位置信息" :column="1">
      <el-descriptions-item label="经度">
        <el-input v-model="marker.longitude" :disabled="!isEdit" />
      </el-descriptions-item>
      <el-descriptions-item label="纬度">
        <el-input v-model="marker.latitude" :disabled="!isEdit" />
      </el-descriptions-item>
      <!-- <el-descriptions-item label="设备角度">
        <el-input v-model="marker.viewRadius" :disabled="!isEdit" />
      </el-descriptions-item>
      <el-descriptions-item label="可视角度">
        <el-input v-model="marker.viewAngle" :disabled="!isEdit" />
      </el-descriptions-item>
      <el-descriptions-item label="可视半径.">
        <el-input v-model="marker.viewRadius" :disabled="!isEdit" />
      </el-descriptions-item> -->
    </el-descriptions>
    <el-descriptions title="一标三实" :column="1">
      <el-descriptions-item label="地址">
        <el-input v-model="deviceAddress" disabled />
      </el-descriptions-item>
      <el-descriptions-item label="人口信息">
        <el-input v-model="marker.population" :disabled="!isEdit" />
      </el-descriptions-item>
      <el-descriptions-item label="房屋信息">
        <el-input v-model="marker.houseInfo" :disabled="!isEdit" />
      </el-descriptions-item>
      <el-descriptions-item label="单位信息">
        <el-input v-model="marker.unitInfo" :disabled="!isEdit" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { DeviceStatus, RecordStatus } from '@/dics'
@Component({
  name: 'Map',
  components: {
  }
})

export default class extends Vue {
  @Prop()
  private isEdit

  @Prop()
  private marker

  private DeviceStatus = DeviceStatus
  private RecordStatus = RecordStatus

  private get deviceAddress() {
    return this.marker.gbRegionNames && this.marker.gbRegionNames.reverse().join('/')
  }
}
</script>

<style>

</style>