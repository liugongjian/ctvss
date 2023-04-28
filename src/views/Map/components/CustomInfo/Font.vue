<template>
  <div class="map-point-base-info">
    <div class="map-point-base-info__header">
      <span class="map-point-base-info__header__title">文本</span>
      <svg-icon v-if="fontInfo.tagId" name="delete" class="map-point-base-info__header__icon" @click="onDelete" />
    </div>
    <el-descriptions title="基本属性" :column="1">
      <el-descriptions-item label="名称">
        <el-input v-model="fontInfo.tagName" @change="change" />
      </el-descriptions-item>
      <el-descriptions-item label="备注">
        <div class="map-point-base-info__small-box">
          <el-input
            v-model="fontInfo.description"
            type="textarea"
            :rows="2"
            placeholder="请输入内容"
            maxlength="68"
            show-word-limit
            @change="change"
          />
        </div>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions v-if="!isAdd" title="位置信息" :column="1">
      <el-descriptions-item label="经度">
        <el-input v-model="fontInfo.points[0].longitude" @change="change" />
      </el-descriptions-item>
      <el-descriptions-item label="纬度">
        <el-input v-model="fontInfo.points[0].latitude" @change="change" />
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="外观" :column="1">
      <el-descriptions-item label="颜色">
        <el-color-picker v-model="color" size="mini" show-alpha :predefine="predefineColor" @change="colorChange" />
      </el-descriptions-item>
      <el-descriptions-item label="大小">
        <div class="map-point-base-info__small">
          <el-input v-model="fontInfo.appearance.fontSize" @change="change" />
        </div>
        <div class="map-point-base-info__textInfo">
          <span class="map-point-base-info__font-weight map-point-base-info__font" :class="{ active: fontInfo.appearance.bolder }" @click="changeStyle('bolder')">B</span>
          <span class="map-point-base-info__font-style map-point-base-info__font" :class="{ active: fontInfo.appearance.italic }" @click="changeStyle('italic')">I</span>
        </div>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script  lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { MapModule } from '@/store/modules/map'
import { validateIsLat, validateIsLng, validateNum } from '../../utils/validate'

@Component({
  name: 'FontInfo'
})
export default class Font extends Vue {
  @Prop() private isAdd: boolean

  @Prop() private predefineColor: []
  private color

  get fontInfo() {
    this.color = MapModule.fontInfo.appearance.color || '#333'
    return MapModule.fontInfo
  }

  private colorChange(val: any) {
    this.color = val
    MapModule.fontInfo.appearance.color = this.color || ''
    this.change()
  }

  private changeStyle(type) {
    if (type === 'bolder') {
      const old = MapModule.fontInfo.appearance.bolder || false
      MapModule.fontInfo.appearance.bolder = !old
    } else if (type === 'italic') {
      const old = MapModule.fontInfo.appearance.italic || false
      MapModule.fontInfo.appearance.italic = !old
    }
    this.change()
  }

  change() {
    if (this.fontInfo.tagId) {
      const checklnglat = validateIsLng(this.fontInfo.points[0].longitude) && validateIsLat(this.fontInfo.points[0].latitude)
      const checkFontSize = validateNum(this.fontInfo.appearance.fontSize, 1, 60)
      if (!checklnglat) {
        this.$alertError('请填写正确的经纬度')
      } else if (!checkFontSize) {
        this.$alertError('字体大小范围为1~60')
      } else {
        this.$emit('change', { type: 'font', info: this.fontInfo })
      }
    }
  }

  onDelete() {
    this.$emit('delete', { id: this.fontInfo.tagId, type: this.fontInfo.type })
  }
}
</script>
