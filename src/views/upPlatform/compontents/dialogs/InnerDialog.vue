<template>
  <el-dialog
    width="30%"
    :title="title"
    :visible="true"
    append-to-body
    @close="closeDialog"
  >
    <el-form :label-position="'right'" label-width="130px">
      <el-form-item label="分组名">
        <el-input placeholder="请输入目录名称" class="form__input" />
      </el-form-item>
      <el-form-item label="上级平台区域">
        <el-select class="form__input">
          <el-option value="flv" label="FLV" />
          <el-option value="hls" label="HLS" />
          <el-option value="rtc" label="Webrtc" />
        </el-select>
      </el-form-item>
      <el-form-item label="描述">
        <el-input placeholder="请输入相关描述" class="form__input" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'InnerDialog'
})
export default class extends Vue {
  @Prop()
  private platformId!: any

  @Prop()
  private type!: String

  private get title() {
    switch (this.type) {
      case 'append':
        return '新建目录'
      case 'edit':
        return '编辑目录'
      case 'deleteGroup':
        return '删除目录'
      case 'deleteDevice':
        return '删除设备'
    }
  }

  private closeDialog() {
    this.$emit('close-inner')
  }
}
</script>
<style lang="scss" scoped>
.app {
  padding: 0;
}
</style>
