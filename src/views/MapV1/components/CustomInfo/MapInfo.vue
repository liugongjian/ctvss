<template>
  <div class="map-point-base-info">
    <el-descriptions title="地图属性" :column="1">
      <template slot="extra">
        <svg-icon name="save" width="25" height="25" @click="save()" />
      </template>
      <el-descriptions-item label="中心经度">
        <el-input v-model="mapInfo.longitude" :disabled="!isEdit" @change="change" />
      </el-descriptions-item>
      <el-descriptions-item label="中心纬度">
        <el-input v-model="mapInfo.latitude" :disabled="!isEdit" @change="change" />
      </el-descriptions-item>
      <el-descriptions-item label="缩放比例">
        <span>{{ zoomDesc }}</span>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { MapModule } from '@/store/modules/map'

@Component({
  name: 'MapInfo'
})
export default class MapInfo extends Vue {
  @Prop()
  private isEdit: boolean

  get mapInfo() {
    return MapModule.mapInfo
  }

  private zoomMap = [
    { key: '20', val: '1:10m' },
    { key: '19', val: '1:10m' },
    { key: '18', val: '1:25m' },
    { key: '17', val: '1:50m' },
    { key: '16', val: '1:100m' },
    { key: '15', val: '1:200m' },
    { key: '14', val: '1:500m' },
    { key: '13', val: '1:1km' },
    { key: '12', val: '1:2km' },
    { key: '11', val: '1:5km' },
    { key: '10', val: '1:10km' },
    { key: '9', val: '1:20km' },
    { key: '8', val: '1:30km' },
    { key: '7', val: '1:50km' },
    { key: '6', val: '1:100km' },
    { key: '5', val: '1:200km' },
    { key: '4', val: '1:500km' },
    { key: '3', val: '1:1000km' }
  ]

  private get zoomDesc() {
    const zoomGrade = Math.round(Number(this.mapInfo.zoom))
    const zoom = this.zoomMap.filter(item => item.key === zoomGrade.toString())
    if (zoom.length === 1) {
      return zoom[0].val
    } else {
      return '-'
    }
  }
  save() {
    this.$emit('save', this.mapInfo)
  }
  change() {
    this.$emit('change', { type: 'map', info: this.mapInfo })
  }
}
</script>
<style scoped lang="scss">
::v-deep .el-descriptions__extra {
  cursor: pointer;
}
</style>
