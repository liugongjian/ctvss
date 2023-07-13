<template>
  <el-radio-group v-if="isGb" v-model="recordType" class="screen-tools__btn" size="mini" :disabled="disabled" @change="onChange">
    <el-radio-button :label="0">云端111</el-radio-button>
    <el-radio-button :disabled="view === 'list'" :label="1">设备</el-radio-button>
  </el-radio-group>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Screen } from '@vss/device/services/Screen/Screen'
import { ScreenManager } from '@vss/device/services/Screen/ScreenManager'

@Component({
  name: 'ReplayType'
})
export default class extends Vue {
  @Prop()
  private screen: Screen
  @Prop()
  private screenManager: ScreenManager

  @Prop({
    default: false
  })
  private disabled: boolean

  private recordType = null

  /* 是否为国标协议 */
  private get isGb() {
    return this.screen.inProtocol === 'gb28181'
  }

  /* 视图类型 */
  private get view() {
    return this.screenManager && this.screenManager.view
  }

  @Watch('screen.recordType', {
    immediate: true
  })
  onScreenChange() {
    this.recordType = this.screen.recordType
  }

  private onChange() {
    this.$emit('change', this.recordType)
  }
}

</script>

<style lang="scss" scoped>
.screen-tools__btn{
  margin-top: -100px;
}
</style>
