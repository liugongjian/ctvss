<template>
  <div class="app-container">
    <span class="title">选择设备:</span>
    <el-radio-group v-model="isDevice">
      <el-radio :label="'on'">完成后立即启用分析</el-radio>
      <el-radio :label="'off'">暂不选择分析设备</el-radio>
    </el-radio-group>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import AppMixin from '@/views/AI/mixin/app-mixin' // 考虑优化的mixin

@Component({
  name: 'AlgoDevice',
  components: {
  }
})
export default class extends Mixins(AppMixin) {
  @Prop() private step!: number
  @Prop() private prod!: any
  private isDevice: string = 'on'
  private back() {
    this.backToAppList()
  }
}
</script>
<style lang="scss" scoped>
.title {
  margin-right: 25px;
}
</style>
