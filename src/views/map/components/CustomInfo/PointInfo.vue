<template>
  <div class="map-point-base-info">
    <el-descriptions title="基本信息" :column="1">
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
        <el-input v-model="markerInfo.longitude" :disabled="!isEdit" @change="change" />
      </el-descriptions-item>
      <el-descriptions-item label="纬度">
        <el-input v-model="markerInfo.latitude" :disabled="!isEdit" @change="change" />
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="外观" :column="1">
      <el-descriptions-item label="颜色">
        <span class="map-point-base-info__color" :style="`background-color: ${color}`" @click="pickColor" />
        <sketch-picker v-if="ifPickColor" :value="color" @input="colorChange" />
      </el-descriptions-item>
<!--      <el-descriptions-item label="大小">-->
<!--        <div class="map-point-base-info__small-box">-->
<!--          <el-input v-model="markerInfo.info" :disabled="!isEdit" />宽-->
<!--          <el-input v-model="markerInfo.info" :disabled="!isEdit" />高-->
<!--        </div>-->
<!--      </el-descriptions-item>-->
    </el-descriptions>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { DeviceStatus, RecordStatus } from '@/dics'
import { Sketch } from 'vue-color'
import { MapModule } from '@/store/modules/map'
import { validateIsLng, validateIsLat } from '../../utils/validate'

@Component({
  name: 'PointInfo',
  components: {
    'sketch-picker': Sketch
  }
})
export default class extends Vue {
  @Prop()
  private isEdit: boolean

  private color
  private ifPickColor = false

  private DeviceStatus = DeviceStatus
  private RecordStatus = RecordStatus

  get markerInfo() {
    this.color = MapModule.markerInfo.appearance.color || '#1e78e0'
    return MapModule.markerInfo
  }

  // private get deviceAddress() {
  //   let result = '-'
  //   if (this.markerInfo.gbRegionNames) {
  //     const regionNames = [...this.markerInfo.gbRegionNames]
  //     result = regionNames.reverse().join('/')
  //   }
  //   return result
  // }

  private colorChange(val: any) {
    this.pickColorVisble = false
    const { r, g, b, a } = val.rgba
    const color = `rgba(${r},${g},${b},${a})`
    this.color = color
  }

  private pickColor() {
    if (this.isEdit) {
      this.ifPickColor = !this.ifPickColor
      if (!this.ifPickColor) { // 关闭状态，表示选取颜色结束
        MapModule.markerInfo.appearance.color = this.color
        this.change()
      }
    }
  }

  change() {
    const checklnglat = validateIsLng(this.markerInfo.longitude) && validateIsLat(this.markerInfo.latitude)
    if (checklnglat) {
      this.$emit('change', { type: 'marker', info: this.markerInfo })
    } else {
      this.$alertError('请填写正确的经纬度')
    }
  }
}
</script>

<style scoped lang="scss">
.map-point-base-info {

}
</style>
