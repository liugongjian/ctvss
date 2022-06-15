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
        <el-input v-model="form.dirName" placeholder="请输入目录名称" class="form__input" />
      </el-form-item>
      <el-form-item label="所属行业">
        <el-select v-model="form.industryCode" class="form__input">
          <el-option value="04" label="04" />
        </el-select>
      </el-form-item>
      <el-form-item label="上级平台区域">
        <el-select v-model="form.gbRegionLevel" class="form__input">
          <el-option value="1" label="1" />
          <el-option value="2" label="2" />
          <el-option value="3" label="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" placeholder="请输入相关描述" class="form__input" />
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
import { createCascadeDir, modifyCascadeDir, describeShareDirs } from '@/api/upPlatform'

@Component({
  name: 'InnerDialog'
})
export default class extends Vue {
  @Prop()
  private selectedNode!: any

  @Prop()
  private platformId!: any

  @Prop()
  private type!: String

  @Prop()
  private mode!: String

  private form: any = {
    id: '',
    dirName: '',
    description: '',
    industryCode: '',
    gbRegionLevel: ''
  }
  private parentDir: String

  private async mounted() {
    switch (this.type) {
      case 'append':
        this.parentDirId = this.selectedNode?.data.id || '-1'
        break
      case 'edit': {
        try {
          const res = await describeShareDirs({
            platformId: this.platformId,
            dirId: this.selectedNode.data.id,
            pageSize: 1000
          })
          if (res.dirs.length > 0) {
            this.form = res.dirs[0]
          }
        } catch (e) {
          console.log(e)
        }
        break
      }
      case 'deleteGroup':
        // 接口没看到
        this.form = this.selectedNode.data
        break
      case 'deleteDevice':

        break
      default:
        break
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

  private async submit() {
    const param = { platformId: this.platformId, dirs: [{ ...this.form, parentDirId: this.parentDirId, dirType: this.parentDirId ? '1' : '0' }] }
    switch (this.type) {
      case 'append':
        await createCascadeDir(param)
        break
      case 'edit':
        await modifyCascadeDir(param)
        break
      case 'deleteGroup':
        break
      case 'deleteDevice':
        break
      default:
        break
    }
    this.$emit('inner-op', { type: this.type, form: this.form, parentDirId: this.parentDirId })
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
