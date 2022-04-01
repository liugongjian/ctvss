<template>
  <el-radio-group v-if="isGb" v-model="recordType" class="screen-tools__btn" size="mini" :disabled="disabled" @change="onChange">
    <el-radio-button :label="0">云端</el-radio-button>
    <el-radio-button :label="1">设备</el-radio-button>
  </el-radio-group>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Screen } from '@/views/device/models/Screen/Screen'

@Component({
  name: 'ReplayType'
})
export default class extends Vue {
  @Prop()
  private screen: Screen

  @Prop({
    default: false
  })
  private disabled: boolean

  private recordType = null

  /* 是否为国标协议 */
  private get isGb() {
    return this.screen.inProtocol === 'gb28181'
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
