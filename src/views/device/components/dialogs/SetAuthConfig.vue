<template>
  <el-dialog
    title="鉴权配置"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="500px"
    center
    @close="closeDialog"
  >
    <el-form
      ref="dataForm"
      :model="form"
      label-position="right"
      label-width="80px"
    >
      <el-form-item label="主KEY:">
        <el-input v-model="form.key" />
      </el-form-item>
      <el-form-item label="备KEY:">
        <el-input v-model="form.key2" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="closeDialog">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'SetAuthConfig'
})
export default class extends Vue {
  private dialogVisible = true
  private form = {
    key: '',
    key2: ''
  }

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }
  private choose() {}
}
</script>
<style lang="scss" scoped>
</style>
