<template>
  <div class="map-point-base-info">
    <div class="map-point-base-info__header">
      <span class="map-point-base-info__header__title">兴趣点</span>
      <svg-icon v-if="interestInfo.tagId" name="delete" class="map-point-base-info__header__icon" @click="onDelete" />
    </div>
    <el-descriptions title="基本属性" :column="1">
      <el-descriptions-item label="名称">
        <el-input v-model="interestInfo.tagName" placeholder="兴趣点名称" @change="change" />
        <el-checkbox v-model="interestInfo.appearance.showLabel" @change="change">始终显示名称</el-checkbox>
      </el-descriptions-item>
      <el-descriptions-item label="备注">
        <el-input
          v-model="interestInfo.description"
          type="textarea"
          :rows="2"
          placeholder="请输入内容"
          maxlength="68"
          show-word-limit
          @change="change"
        />
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions v-if="!isAdd" title="位置信息" :column="1">
      <el-descriptions-item label="经度">
        <el-input v-model="interestInfo.points[0].longitude" @change="change" />
      </el-descriptions-item>
      <el-descriptions-item label="纬度">
        <el-input v-model="interestInfo.points[0].latitude" @change="change" />
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="外观" :column="1">
      <el-descriptions-item label="颜色">
        <el-color-picker v-model="color" size="mini" show-alpha :predefine="predefineColor" @change="colorChange" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script  lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { MapModule } from '@/store/modules/map'
import { validateIsLat, validateIsLng } from '@/views/Map/utils/validate'

@Component({
  name: 'InterestInfo',
  components: {}
})
export default class Interest extends Vue {
  @Prop() private isAdd: boolean

  @Prop() private predefineColor: []

  private color

  get interestInfo() {
    this.color = MapModule.interestInfo.appearance.color || '#FA8334'
    return MapModule.interestInfo
  }

  private colorChange(val: any) {
    this.color = val
    MapModule.interestInfo.appearance.color = this.color || ''
    this.change()
  }

  change() {
    if (this.interestInfo.tagId) {
      const checklnglat = validateIsLng(this.interestInfo.points[0].longitude) && validateIsLat(this.interestInfo.points[0].latitude)
      if (checklnglat) {
        this.$emit('change', { type: 'interest', info: this.interestInfo })
      } else {
        this.$alertError('请填写正确的经纬度')
      }
    }
  }

  onDelete() {
    this.$emit('delete', { id: this.interestInfo.tagId, type: this.interestInfo.type })
  }
}
</script>
