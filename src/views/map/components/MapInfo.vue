<template>
  <div>
    <el-descriptions title="地图属性" :column="1" v-if="map">
      <template slot="extra">
        <svg-icon name="save" @click="save()" width="25" height="25" />
      </template>
      <el-descriptions-item label="中心经度">
        <el-input v-model="mapInfo.longitude" :disabled="!isEdit" />
      </el-descriptions-item>
      <el-descriptions-item label="中心纬度">
        <el-input v-model="mapInfo.latitude" :disabled="!isEdit" />
      </el-descriptions-item>
      <el-descriptions-item label="缩放等级">
        <el-input v-model="mapInfo.zoom" :disabled="!isEdit" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Prop, Watch} from 'vue-property-decorator'
@Component({
  name: 'mapInfo',
})

export default class extends Vue {
  @Prop()
  private isEdit: boolean

  @Prop()
  private map: any

  private mapInfo = {
    mapId: '',
    name: '',
    longitude: '',
    latitude: '',
    zoom: ''
  }

  @Watch('map')
  private onInfoChange() {
    this.mapInfo = { ...this.map }
  }

  @Watch('isEdit')
  private onEditChange() {
    if (!this.isEdit) {
      this.mapInfo = { ...this.map }
    }
  }

  mounted() {
    this.mapInfo = { ...this.map }
  }

  save() {
    this.$emit('save', this.mapInfo)
  }
}
</script>

<style>

</style>
