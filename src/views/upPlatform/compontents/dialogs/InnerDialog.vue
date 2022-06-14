<template>
  <el-dialog
    width="30%"
    :title="title"
    :visible="true"
    append-to-body
    @close="closeDialog"
  >
    <el-form v-if="type === 'append' || type === 'edit'" :label-position="'right'" label-width="130px">
      <el-form-item label="分组名">
        <el-input v-model="form.label" placeholder="请输入目录名称" class="form__input" />
      </el-form-item>
      <el-form-item v-if="mode === 'vgroup'" label="所属行业">
        <el-select v-model="form.IndustryCode" class="form__input">
          <el-option value="flv" label="FLV" />
          <el-option value="hls" label="HLS" />
          <el-option value="rtc" label="Webrtc" />
        </el-select>
      </el-form-item>
      <el-form-item label="上级平台区域">
        <el-select v-model="form.GbRegionLevel" class="form__input">
          <el-option value="flv" label="FLV" />
          <el-option value="hls" label="HLS" />
          <el-option value="rtc" label="Webrtc" />
        </el-select>
      </el-form-item>
      <el-form-item v-model="form.Description" label="描述">
        <el-input placeholder="请输入相关描述" class="form__input" />
      </el-form-item>
    </el-form>
    <div v-else class="delete-content">
      确定{{ title }}?
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">确 定</el-button>
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
  private selectedNode!: any

  @Prop()
  private type!: String

  @Prop()
  private mode!: String

  private form: any = null
  private parentDir: String

  mounted() {
    switch (this.type) {
      case 'append':
        this.parentDir = this.selectedNode?.data.id || null
        this.form = {
          id: '283749',
          DirName: '',
          DirType: '0',
          Description: '',
          IndustryCode: '',
          NetworkCode: '',
          GbRegionLevel: '',
          type: 'vgroup'
        }
        break
      case 'edit':
        this.form = this.selectedNode.data
        break
      case 'deleteGroup':
        this.form = this.selectedNode.data
        break
      case 'deleteDevice':
        return '删除设备'
      default:
        return '提示'
    }
  }

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
      default:
        return '提示'
    }
  }

  private closeDialog() {
    this.$emit('close-inner')
  }

  private submit() {
    this.$emit('inner-op', { type: this.type, form: this.form, parentDir: this.parentDir })
  }
}
</script>
<style lang="scss" scoped>
.delete-content {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
