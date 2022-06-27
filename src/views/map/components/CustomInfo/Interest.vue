<template>
  <div class="map-point-base-info">
    <div class="map-point-base-info__header">
      <span class="map-point-base-info__header__title">兴趣点</span>
      <svg-icon name="delete" class="map-point-base-info__header__icon" />
    </div>
    <el-descriptions title="基本属性" :column="1">
      <el-descriptions-item label="名称">
        <el-input v-model="interestInfo.tagName" placeholder="兴趣点名称" />
        <el-checkbox v-model="interestInfo.appearance.showLabel">始终显示名称</el-checkbox>
      </el-descriptions-item>
      <el-descriptions-item label="备注">
        <el-input
          v-model="interestInfo.description"
          type="textarea"
          :rows="2"
          placeholder="请输入内容"
          maxlength="68"
          show-word-limit
        />
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions v-if="!isAdd" title="位置信息" :column="1">
      <el-descriptions-item label="经度">
        <el-input v-model="interestInfo.points[0].longitude" />
      </el-descriptions-item>
      <el-descriptions-item label="纬度">
        <el-input v-model="interestInfo.points[0].latitude" />
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="外观" :column="1">
      <el-descriptions-item label="颜色">
        <span class="map-point-base-info__color" :style="`background-color:${color}`" @click="pickColor" />
        <sketch-picker v-if="ifPickColor" :value="color" @input="colorChange" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script  lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import { Sketch } from 'vue-color'
import { MapModule } from '@/store/modules/map'

@Component({
  name: 'CustomInfo',
  components: {
    'sketch-picker': Sketch
  }
})

export default class Interest extends Vue {
  @Prop() private isAdd: boolean
  private ifPickColor = false
  private color

  get interestInfo() {
    this.color = MapModule.interestInfo.appearance.color
    return MapModule.interestInfo
  }

  private colorChange(val: any) {
    this.pickColorVisble = false
    const {r,g,b,a} = val.rgba
    const color = `rgba(${r},${g},${b},${a})`
    MapModule.interestInfo.appearance.color = color
    this.color = color
  }

  private pickColor() {
    this.ifPickColor = !this.ifPickColor
  }
}
</script>
