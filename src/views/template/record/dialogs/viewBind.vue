<template>
  <el-dialog
    :title="查看绑定关系"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="500px"
    center
    @close="closeDialog"
  >
    <el-table>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Dir } from '@/type/dir'
import { createDir, updateDir } from '@/api/dir'

@Component({
  name: 'ViewBind'
})
export default class extends Vue {
  @Prop()
  private currentDir?: any
  private dialogVisible = true

  private mounted() {
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
</style>
