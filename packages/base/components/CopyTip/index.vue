<template>
  <el-tooltip v-if="copyValue" class="item" effect="dark" :content="content" placement="top">
    <el-button class="copy-button" type="text" @click="doCopy"><svg-icon name="copy" /></el-button>
  </el-tooltip>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import copy from 'copy-to-clipboard'

@Component({
  name: 'CopyTip'
})
export default class extends Vue {
  @Prop({ default: '' }) private copyValue!: string
  @Prop({ default: '复制' }) private content!: string

  /**
   * 一键复制
   */
  public doCopy() {
    copy(this.copyValue)
    this.$message.success('复制成功')
  }
}
</script>

<style lang="scss" scoped>
.copy-button {
  padding: 0;
}
</style>
