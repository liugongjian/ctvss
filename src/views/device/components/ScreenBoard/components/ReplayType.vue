<template>
  <el-radio-group v-model="recordType" class="screen-tools__btn" @change="onChange">
    <el-radio-button :label="0">云端</el-radio-button>
    <el-radio-button :label="1">本地</el-radio-button>
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

  private recordType = null

  @Watch('screen.recordType', {
    immediate: true
  })
  onScreenChange() {
    this.recordType = this.screen.recordType
  }

  private onChange() {
    this.screen.recordType = this.recordType
    this.screen.init()
  }
}

</script>
