<template>
  <div class="map-point-base-info">
    <div class="map-point-base-info__header">
      <span class="map-point-base-info__header__title">兴趣点</span>
      <svg-icon name="delete" class="map-point-base-info__header__icon" />
    </div>
    <el-descriptions title="基本属性" :column="1">
      <el-descriptions-item label="名称">
        <el-input v-model="mapInfo.name" placeholder="兴趣点名称" />
        <el-checkbox v-model="checked">始终显示名称</el-checkbox>
      </el-descriptions-item>
      <el-descriptions-item label="备注">
        <el-input
          v-model="mapInfo.name"
          type="textarea"
          :rows="2"
          placeholder="请输入内容"
          maxlength="68"
          show-word-limit
        />
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="位置信息" :column="1">
      <el-descriptions-item label="经度">
        <el-input v-model="mapInfo.longitude" />
      </el-descriptions-item>
      <el-descriptions-item label="纬度">
        <el-input v-model="mapInfo.latitude" />
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="外观" :column="1">
      <el-descriptions-item label="颜色">
        <span class="map-point-base-info__color" :style="`background-color: ${color}`" @click="pickColor" />
        <sketch-picker v-if="ifPickColor" v-model="color" @input="colorChange" />
      </el-descriptions-item>
      <el-descriptions-item label="大小">
        <div class="map-point-base-info__small-box">
          <el-input v-model="mapInfo.info" />宽
          <el-input v-model="mapInfo.info" />高
        </div>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script  lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Sketch } from 'vue-color'

@Component({
  name: 'CustomInfo',
  components: {
    'sketch-picker': Sketch
  }
})

export default class Interest extends Vue {
  private color = '#1e78e0'
  private ifPickColor = false
  private checked = true
  private mapInfo = {
    mapId: '',
    name: '',
    longitude: '',
    latitude: '',
    zoom: ''
  }
  private colorChange(val: any) {
    this.color = val.hex
  }

  private pickColor() {
    this.ifPickColor = !this.ifPickColor
  }
}
</script>
