<template>
  <div>
    <el-descriptions title="地图属性" :column="1">
      <template slot="extra">
        <svg-icon name="save" @click="save()" width="25" height="25" />
      </template>
      <el-descriptions-item label="中心经度">
        <el-input v-model="map.longitude" disabled />
      </el-descriptions-item>
      <el-descriptions-item label="中心纬度">
        <el-input v-model="map.latitude" disabled />
      </el-descriptions-item>
      <el-descriptions-item label="缩放等级">
        <el-input v-model="map.zoom" disabled />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { mapObject } from '../models/vmap'
@Component({
  name: 'mapInfo',
})

export default class extends Vue {
  @Prop()
  private map: any

  save() {
    this.$emit('save')
  }
}
</script>

<style>

</style>