<template>
  <div class="map-point-base-info">
    <el-descriptions v-if="markerInfo" title="基本信息" :column="1">
      <el-descriptions-item label="设备名称">
        <div class="deviceName">{{ markerInfo.deviceLabel }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="设备状态">
        {{ DeviceStatus[markerInfo.deviceStatus] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="流状态">
        {{ DeviceStatus[markerInfo.streamStatus] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="录制状态">
        {{ RecordStatus[markerInfo.recordStatus] || '-' }}
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="位置信息" :column="1">
      <el-descriptions-item label="经度">
        <el-input v-model="markerInfo.longitude" :disabled="!isEdit" />
      </el-descriptions-item>
      <el-descriptions-item label="纬度">
        <el-input v-model="markerInfo.latitude" :disabled="!isEdit" />
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="外观" :column="1">
       <el-descriptions-item label="颜色">
        <span class="map-point-base-info__color" :style="`background-color: ${color}`" @click="pickColor" />
        <sketch-picker v-if="ifPickColor" v-model="color" @input="colorChange" />
      </el-descriptions-item>
      <el-descriptions-item label="大小">
        <div class="map-point-base-info__small-box">
          <el-input v-model="markerInfo.info" :disabled="!isEdit" />宽
          <el-input v-model="markerInfo.info" :disabled="!isEdit" />高
        </div>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { DeviceStatus, RecordStatus } from '@/dics'
@Component({
  name: 'PointInfo',
  components: {
  }
})

export default class extends Vue {
  @Prop()
  private isEdit

  @Prop()
  private marker

  private color = '#1e78e0'
  private ifPickColor = false

  private colorMap = [
    '#1e78e0',
    '#007f1b',
    '#eab809',
    '#ee5007',
    '#b22727',
    '#a85cf9',
    '#5534a5',
    '#4b7be5',
    '#6fdfdf'
  ]

  markerInfo = {
    deviceLabel: '',
    deviceStatus: '',
    streamStatus: '',
    recordStatus: '',
    longitude: '',
    latitude: '',
    population: '',
    houseInfo: '',
    unitInfo: '',
    gbRegionNames: [],
    groupId: '',
    deviceColor: '#1e78e0'
  }

  private DeviceStatus = DeviceStatus
  private RecordStatus = RecordStatus

  private get deviceAddress() {
    let result = '-'
    if (this.markerInfo.gbRegionNames) {
      const regionNames = [...this.markerInfo.gbRegionNames]
      result = regionNames.reverse().join('/')
    }
    return result
  }

  @Watch('marker')
  private onInfoChange() {
    this.marker.deviceColor = this.marker.deviceColor || '#1e78e0'
    this.markerInfo = this.marker
  }

  mounted() {
    this.marker.deviceColor = this.marker.deviceColor || '#1e78e0'
    this.markerInfo = this.marker
  }

  save() {
    this.$emit('save', this.markerInfo)
  }

  private colorChange(val: any) {
    this.color = val.hex
  }

  private pickColor() {
    this.ifPickColor = !this.ifPickColor
  }

}
</script>

<style scoped lang="scss">
.map-point-base-info {

}
</style>
