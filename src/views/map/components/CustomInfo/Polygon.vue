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
        <el-radio v-model="polygonInfo.type" label="HighLightArea" :disabled="!isAdd" @change="change">区域围栏</el-radio>
        <el-radio v-model="polygonInfo.type" label="InterestBuilding" :disabled="!isAdd" @change="change">建筑物样式</el-radio>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions v-if="polygonInfo.type === 'HighLightArea'" title="区域围栏外观" :column="1">
      <el-descriptions-item label="背景">
        <!-- <span class="map-point-base-info__color" :style="`background-color: ${fillColor}`" @click="pickColor('fill')" />
        <sketch-picker v-if="fillPick" :value="fillColor" @input="colorChange($event, 'fill')" /> -->
        <el-color-picker v-model="fillColor" size="mini" :predefine="predefineColor" @change="colorChange($event, 'fill')" />
      </el-descriptions-item>
      <el-descriptions-item label="边框">
        <!-- <span class="map-point-base-info__color" :style="`background-color: ${strokeColor}`" @click="pickColor('stroke')" /> -->
        <el-color-picker v-model="strokeColor" size="mini" :predefine="predefineColor" @change="colorChange($event, 'stroke')" />
        <div class="map-point-base-info__small">
          <el-input v-model="polygonInfo.appearance.strokeWeight" />
        </div>
        <!-- <sketch-picker v-if="strokePick" :value="strokeColor" @input="colorChange($event,'stroke')" /> -->
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions v-if="polygonInfo.type === 'InterestBuilding'" title="建筑外观" :column="1">
      <el-descriptions-item label="楼顶颜色">
        <!-- <span class="map-point-base-info__color" :style="`background-color: ${roofColor}`" @click="pickColor('roof')" />
        <sketch-picker v-if="roofPick" :value="roofColor" @input="colorChange($event,'roof')" /> -->
        <el-color-picker v-model="roofColor" size="mini" :predefine="predefineColor" @change="colorChange($event, 'roof')" />
      </el-descriptions-item>
      <el-descriptions-item label="楼面颜色">
        <!-- <span class="map-point-base-info__color" :style="`background-color: ${wallColor}`" @click="pickColor('wall')" />
        <sketch-picker v-if="wallPick" :value="wallColor" @input="colorChange($event, 'wall')" /> -->
        <el-color-picker v-model="wallColor" size="mini" :predefine="predefineColor" @change="colorChange($event, 'wall')" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script  lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Sketch } from 'vue-color'
import { MapModule } from '@/store/modules/map'

@Component({
  name: 'PolygonInfo',
  components: {
    'sketch-picker': Sketch
  }
})
export default class Polygon extends Vue {
  @Prop() private isAdd: boolean

  @Prop() private predefineColor: []

  private fillColor
  private fillPick = false
  private strokeColor
  private strokePick = false
  private wallColor
  private wallPick = false
  private roofColor
  private roofPick = false

  get polygonInfo() {
    this.fillColor = MapModule.polygonInfo.appearance.fillColor || '#545d80'
    this.strokeColor = MapModule.polygonInfo.appearance.strokeColor || '#ffc000'
    this.wallColor = MapModule.polygonInfo.appearance.wallColor || '#eab754'
    this.roofColor = MapModule.polygonInfo.appearance.roofColor || '#ffce6f'
    return MapModule.polygonInfo
  }

  private colorChange(val: any, type) {
    // const { r, g, b, a } = val.rgba
    // const color = `rgba(${r},${g},${b},${a})`
    switch (type) {
      case 'fill':
        this.fillColor = val
        MapModule.polygonInfo.appearance.fillColor = this.fillColor
        break
      case 'stroke':
        this.strokeColor = val
        MapModule.polygonInfo.appearance.strokeColor = this.strokeColor
        break
      case 'roof':
        this.roofColor = val
        MapModule.polygonInfo.appearance.roofColor = this.roofColor
        break
      case 'wall':
        this.wallColor = val
        MapModule.polygonInfo.appearance.wallColor = this.wallColor
        break
    }
    this.change()
  }

  private pickColor(type) {
    switch (type) {
      case 'fill':
        this.fillPick = !this.fillPick
        if (!this.fillPick) {
          MapModule.polygonInfo.appearance.fillColor = this.fillColor
          this.change()
        }
        break
      case 'stroke':
        this.strokePick = !this.strokePick
        if (!this.strokePick) {
          MapModule.polygonInfo.appearance.strokeColor = this.strokeColor
          this.change()
        }
        break
      case 'roof':
        this.roofPick = !this.roofPick
        if (!this.roofPick) {
          MapModule.polygonInfo.appearance.roofColor = this.roofColor
          this.change()
        }
        break
      case 'wall':
        this.wallPick = !this.wallPick
        if (!this.wallPick) {
          MapModule.polygonInfo.appearance.wallColor = this.wallColor
          this.change()
        }
        break
    }
  }

  change() {
    if (!this.isAdd) {
      this.$emit('change', { type: 'polygon', info: this.polygonInfo })
    }
  }

  onDelete() {
    this.$emit('delete', { id: this.polygonInfo.tagId, type: this.polygonInfo.type })
  }
}
</script>
