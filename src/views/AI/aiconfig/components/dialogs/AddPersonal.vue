<template>
  <el-dialog
    title="添加人员"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">关闭</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'AddPersonal'
})
export default class extends Vue {
  private dialogVisible = true

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }
}
</script>
<style lang="scss" scoped>
</style>
