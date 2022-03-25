<template>
  <el-tooltip content="录像下载" placement="top">
    <div class="control__btn" @click="sliceDownload">
      <svg-icon name="download" width="16" height="16" />
      <SliceDownload
        v-if="dialog.slice"
        :screen="screen"
        @on-close="closeSliceDownload"
      />
    </div>
  </el-tooltip>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import SliceDownload from '../dialogs/SliceDownload.vue'

@Component({
  name: 'Cleaner',
  components: { SliceDownload }
})
export default class extends Vue {
  @Prop()
  private screen: Screen

  private dialog = {
    slice: false
  }

  /**
   * 切片下载
   */
  private sliceDownload() {
    this.dialog.slice = true
  }

  /**
   * 关闭切片下载弹出框
   */
  private closeSliceDownload() {
    this.dialog.slice = false
  }
}
</script>
