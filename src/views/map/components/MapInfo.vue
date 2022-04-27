<template>
  <div class="mapInfo">
    <el-descriptions v-if="map" title="地图属性" :column="1">
      <template slot="extra">
        <svg-icon name="save" width="25" height="25" @click="save()" />
      </template>
      <el-descriptions-item label="中心经度">
        <el-input v-model="mapInfo.longitude" :disabled="!isEdit" />
      </el-descriptions-item>
      <el-descriptions-item label="中心纬度">
        <el-input v-model="mapInfo.latitude" :disabled="!isEdit" />
      </el-descriptions-item>
      <el-descriptions-item label="缩放比例">
        <span>{{ zoomDesc }}</span>
        <!--<el-input v-model="mapInfo.zoom" :disabled="!isEdit" />-->
        <!--<el-select v-model="mapInfo.zoom" :disabled="!isEdit">-->
        <!--<el-option v-for="item in zoomMap" :label="item.val" :value="item.key"></el-option>-->
        <!--</el-select>-->
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
@Component({
  name: 'mapInfo'
})

export default class extends Vue {
  @Prop()
  private isEdit: boolean

  @Prop()
  private map: any

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

  private mapInfo = {
    mapId: '',
    name: '',
    longitude: '',
    latitude: '',
    zoom: ''
  }

  @Watch('map')
  private onInfoChange() {
    this.mapInfo = { ...this.map, zoom: this.map?.zoom.toString() }
  }

  @Watch('isEdit')
  private onEditChange() {
    if (!this.isEdit) {
      this.mapInfo = { ...this.map, zoom: this.map?.zoom.toString() }
    }
  }

  mounted() {
    this.mapInfo = { ...this.map, zoom: this.map?.zoom.toString() }
  }

  save() {
    this.$emit('save', this.mapInfo)
  }
}
</script>

<!--<style lang="scss" scoped>-->
<!--.mapInfo {-->
<!--  ::v-deep .el-input .el-input__inner {-->
<!--    height: 18px !important;-->
<!--  }-->
<!--  ::v-deep .el-input&#45;&#45;medium .el-input__icon {-->
<!--    line-height: 18px;-->
<!--  }-->
<!--}-->
<!--</style>-->
