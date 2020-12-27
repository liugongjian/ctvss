<template>
  <el-dialog
    title="添加人员"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="30%"
    @close="closeDialog"
  >
    <el-form
      ref="form"
      v-loading="loading"
      :rules="rules"
      :model="form"
      label-position="right"
      label-width="80px"
    >
      <el-form-item label="头像:" prop="profile">
        <el-upload
          action=""
          class="avatar-uploader"
          :show-file-list="false"
          :on-change="getImage"
          :auto-upload="false"
        >
          <img v-if="form.profile" :src="form.profile" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </el-upload>
      </el-form-item>
      <el-form-item label="姓名:" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="描述:" prop="description">
        <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">确定</el-button>
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
  private loading = false
  private form: Record<string, any> = {
    profile: null,
    name: null,
    description: null
  }
  private rules = {
    profile: [
      { required: true, message: '请选择图片', trigger: 'blur' }
    ],
    name: [
      { required: true, message: '请输入姓名', trigger: 'blur' }
    ]
  }

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }

  private getImage(file: any) {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isImage) {
      this.$message.error('不支持该格式')
      return
    }
    const reader = new FileReader()
    reader.readAsDataURL(file.raw)
    reader.onload = (e: any) => {
      this.form.profile = e.target.result
      console.log(this.form.profile)
    }
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate((valid: any) => {
      if (valid) {
        console.log('valid')
      } else {
        return false
      }
    })
  }
}
</script>
<style lang="scss" scoped>
  .avatar-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    width: 178px;
    height: 178px;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
