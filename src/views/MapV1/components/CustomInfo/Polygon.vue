<template>
  <div class="map-point-base-info">
    <div class="map-point-base-info__header">
      <span class="map-point-base-info__header__title">多边形</span>
      <svg-icon v-if="!isAdd" name="delete" class="map-point-base-info__header__icon" @click="onDelete" />
    </div>
    <el-descriptions title="基本属性" :column="1">
      <el-descriptions-item label="名称">
        <el-input v-model="polygonInfo.tagName" @change="change" />
      </el-descriptions-item>
      <el-descriptions-item label="备注">
        <el-input
          v-model="polygonInfo.description"
          type="textarea"
          :rows="2"
          placeholder="请输入内容"
          maxlength="68"
          show-word-limit
          @change="change"
        />
      </el-descriptions-item>
      <el-descriptions-item label="类型">
        <el-radio v-model="polygonInfo.type" label="HighLightArea" @change="change">区域围栏</el-radio>
        <el-radio v-model="polygonInfo.type" label="InterestBuilding" @change="change">建筑物样式</el-radio>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions v-if="polygonInfo.type === 'HighLightArea'" :column="1">
      <template slot="title">
        区域围栏外观
        <el-tooltip content="该外观属性仅在非蒙版的围栏下生效" placement="top">
          <svg-icon name="help" />
        </el-tooltip>
      </template>
      <el-descriptions-item label="背景">
        <el-color-picker v-model="fillColor" size="mini" :predefine="predefineColor" show-alpha @change="colorChange($event, 'fill')" />
      </el-descriptions-item>
      <el-descriptions-item label="边框">
        <el-color-picker v-model="strokeColor" size="mini" :predefine="predefineColor" show-alpha @change="colorChange($event, 'stroke')" />
        <div class="map-point-base-info__small">
          <el-input v-model="polygonInfo.appearance.strokeWeight" @change="change" />
        </div>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions v-if="polygonInfo.type === 'InterestBuilding'" title="建筑外观" :column="1">
      <el-descriptions-item label="楼顶颜色">
        <el-color-picker v-model="roofColor" size="mini" :predefine="predefineColor" show-alpha @change="colorChange($event, 'roof')" />
      </el-descriptions-item>
      <el-descriptions-item label="楼面颜色">
        <el-color-picker v-model="wallColor" size="mini" :predefine="predefineColor" show-alpha @change="colorChange($event, 'wall')" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script  lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { MapModule } from '@/store/modules/map'
import { validateNum } from '../../utils/validate'

@Component({
  name: 'PolygonInfo'
})
export default class Polygon extends Vue {
  @Prop() private isAdd: boolean

  @Prop() private predefineColor: []

  private fillColor
  private strokeColor
  private wallColor
  private roofColor

  get polygonInfo() {
    this.fillColor = MapModule.polygonInfo.appearance.fillColor || 'rgba(84,93,128,0.45)'
    this.strokeColor = MapModule.polygonInfo.appearance.strokeColor || '#ffc000'
    this.wallColor = MapModule.polygonInfo.appearance.wallColor || '#eab754'
    this.roofColor = MapModule.polygonInfo.appearance.roofColor || '#ffce6f'
    return MapModule.polygonInfo
  }

  private colorChange(val: any, type) {
    const alpha = (val && val.match(/rgba\(\d+, \d+, \d+, (\d+|0\.\d+)\)/)[1]) || ''
    switch (type) {
      case 'fill':
        this.fillColor = val
        MapModule.polygonInfo.appearance.fillColor = this.fillColor || ''
        MapModule.polygonInfo.appearance.fillOpacity = alpha
        break
      case 'stroke':
        this.strokeColor = val
        MapModule.polygonInfo.appearance.strokeColor = this.strokeColor || ''
        MapModule.polygonInfo.appearance.strokeOpacity = alpha
        break
      case 'roof':
        this.roofColor = val
        MapModule.polygonInfo.appearance.roofColor = this.roofColor || ''
        break
      case 'wall':
        this.wallColor = val
        MapModule.polygonInfo.appearance.wallColor = this.wallColor || ''
        break
    }
    this.change()
  }

  change() {
    if (this.polygonInfo.tagId) {
      const checkStrokeWeight = validateNum(this.polygonInfo.appearance.strokeWeight, 0, 20)
      if (this.polygonInfo.type === 'HighLightArea' && !checkStrokeWeight) {
        this.$alertError('边框大小范围为0~20')
      } else {
        this.$emit('change', { type: 'polygon', info: this.polygonInfo })
      }
    }
  }

  onDelete() {
    this.$emit('delete', { id: this.polygonInfo.tagId, type: this.polygonInfo.type })
  }
}
</script>
