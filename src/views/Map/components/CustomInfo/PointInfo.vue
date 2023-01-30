<template>
  <div class="map-point-base-info">
    <div class="map-point-base-info__header">
      <span class="map-point-base-info__header__title">监控点位</span>
      <svg-icon v-if="!isAdd" name="delete" class="map-point-base-info__header__icon" @click="onDelete" />
    </div>
    <el-descriptions title="基本信息" :column="1">
      <el-descriptions-item label="设备名称">
        <div class="deviceName">{{ markerInfo.deviceLabel }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="设备状态">
        <status-badge :status="markerInfo.deviceStatus" />
        {{ DeviceStatus[markerInfo.deviceStatus] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="流状态">
        <status-badge :status="markerInfo.streamStatus" />
        {{ DeviceStatus[markerInfo.streamStatus] || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="录制状态">
        <status-badge :status="RecordStatusType[markerInfo.recordStatus]" />
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
        <el-color-picker v-model="color" size="mini" :predefine="predefineColor" show-alpha :disabled="!isEdit" @change="colorChange" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { DeviceStatus, RecordStatus, RecordStatusType } from '@/dics'
import { MapModule } from '@/store/modules/map'
import { validateIsLng, validateIsLat } from '../../utils/validate'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'PointInfo',
  components: {
    StatusBadge
  }
})
export default class extends Vue {
  @Prop() private isAdd: boolean
  @Prop()
  private isEdit: boolean

  @Prop() private predefineColor: []

  private color

  private DeviceStatus = DeviceStatus
  private RecordStatus = RecordStatus
  private RecordStatusType = RecordStatusType

  get markerInfo() {
    this.color = MapModule.markerInfo.appearance.color || '#FA8334'
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
    this.color = val
    MapModule.markerInfo.appearance.color = this.color || ''
    this.change()
  }

  change() {
    const checklnglat = validateIsLng(this.markerInfo.longitude) && validateIsLat(this.markerInfo.latitude)
    if (checklnglat) {
      this.$emit('change', { type: 'marker', info: this.markerInfo })
    } else {
      this.$alertError('请填写正确的经纬度')
    }
  }

  onDelete() {
    this.$emit('delete', { type: 'marker', info: this.markerInfo })
  }
}
</script>
