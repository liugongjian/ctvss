<template>
  <div class="pointInfo">
    <el-descriptions v-if="markerInfo" title="基本信息" :column="1">
      <template v-if="isEdit" slot="extra">
        <svg-icon name="save" width="25" height="25" @click="save()" />
      </template>
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
      <!-- <el-descriptions-item label="设备角度">
        <el-input v-model="markerInfo.viewRadius" :disabled="!isEdit" />
      </el-descriptions-item>
      <el-descriptions-item label="可视角度">
        <el-input v-model="markerInfo.viewAngle" :disabled="!isEdit" />
      </el-descriptions-item>
      <el-descriptions-item label="可视半径.">
        <el-input v-model="markerInfo.viewRadius" :disabled="!isEdit" />
      </el-descriptions-item> -->
    </el-descriptions>
<!--    <el-descriptions title="一标三实" :column="1">-->
<!--      <el-descriptions-item label="地址">-->
<!--        <el-input v-model="deviceAddress" disabled :title="deviceAddress" />-->
<!--      </el-descriptions-item>-->
<!--      <el-descriptions-item label="人口信息">-->
<!--        <el-input v-model="markerInfo.population" :disabled="!isEdit" :title="markerInfo.population" />-->
<!--      </el-descriptions-item>-->
<!--      <el-descriptions-item label="房屋信息">-->
<!--        <el-input v-model="markerInfo.houseInfo" :disabled="!isEdit" :title="markerInfo.houseInfo" />-->
<!--      </el-descriptions-item>-->
<!--      <el-descriptions-item label="单位信息">-->
<!--        <el-input v-model="markerInfo.unitInfo" :disabled="!isEdit" :title="markerInfo.unitInfo" />-->
<!--      </el-descriptions-item>-->
<!--    </el-descriptions>-->
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
    gbRegionNames: []
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
    this.markerInfo = this.marker
  }

  mounted() {
    this.markerInfo = this.marker
  }

  save() {
    this.$emit('save', this.markerInfo)
  }
}
</script>

<style scoped lang="scss">
  .deviceName{
    max-width: 78px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
