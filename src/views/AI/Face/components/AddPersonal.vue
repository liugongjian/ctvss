<template>
  <el-dialog
    :title="status === 'add' ? '添加人员' : '编辑人员'"
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
      label-width="100px"
    >
      <el-form-item label="头像:" prop="imageString">
        <el-upload
          action=""
          class="avatar-uploader"
          :show-file-list="false"
          :on-change="getImage"
          :auto-upload="false"
        >
          <img v-if="form.imageString" :src="form.imageString" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </el-upload>
        <div class="form-tip form-tip-avatar">
          <p>图片格式：JPG、JPEG、PNG、GIF。</p>
          <p>图片大小：图片大小不超过 5M。</p>
          <p>图片像素：大于 5×5 像素，小于 4096×4096 像素。人脸尺寸建议大于 64×64 像素。</p>
        </div>
      </el-form-item>
      <el-form-item label="姓名:" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="人员编号:" prop="cardId">
        <el-input v-model="form.number" placeholder="请输入身份证号" />
      </el-form-item>
      <el-form-item label="描述:" prop="description">
        <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">确定</el-button>
      <el-button @click="closeDialog(false)">关闭</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { encodeBase64 } from '@/utils/base64'
import { addPerson, verify, editPerson } from '@/api/face'

@Component({
  name: 'AddPersonal'
})
export default class extends Vue {
  @Prop()
  private groupId: string
  @Prop()
  private status: string
  @Prop()
  private data: any

  private dialogVisible = true
  private loading = false
  private needVerify = false
  private form: Record<string, any> = {
    imageString: null,
    imageName: null,
    name: null,
    number: null,
    description: null
  }
  private rules = {
    imageString: [
      { required: true, message: '请选择图片', trigger: 'blur' },
      { validator: this.validateImage, trigger: 'blur' }
    ],
    name: [
      { required: true, message: '请输入姓名', trigger: 'blur' }
    ],
    number: [
      { message: '请输入身份证号', trigger: 'blur' },
      { validator: this.validateCertificate, trigger: 'blur' }
    ]
  }

  private validateCertificate(rule: any, value: string, callback: any) {
    if (value && !/^[0-9]{17}[0-9a-zA-Z]{1}$/.test(value)) {
      callback(new Error('身份证格式错误'))
    } else {
      callback()
    }
  }

  private async validateImage(rule: any, value: string, callback: any) {
    if (!this.needVerify) {
      callback()
    } else {
      try {
        const result = await verify({
          pic: encodeBase64(value)
        })
        if (value && result.verifyCode !== '0') {
          // callback(new Error('请上传正常的人脸头像'))
          callback(new Error(result.message))
        } else {
          callback()
        }
      } catch (e) {
        callback(new Error(e.message))
      }
    }
  }

  private closeDialog(refresh: boolean) {
    this.dialogVisible = false
    this.$emit('on-close', refresh)
  }

  private getImage(file: any) {
    const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/jpg' || file.raw.type === 'image/png' || file.raw.type === 'image/gif'
    if (!isImage) {
      this.$message.error('不支持该格式')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      this.$message.error('图片大小不超过 5M')
      return
    }
    const reader = new FileReader()
    reader.readAsDataURL(file.raw)
    this.form.imageName = file.raw.name
    reader.onload = (e: any) => {
      this.needVerify = true
      this.form.imageString = e.target.result
    }
  }

  private async addPersonalInfo() {
    try {
      this.loading = true
      const params = {
        groupId: this.groupId,
        name: this.form.name,
        number: this.form.number,
        description: this.form.description,
        pics: [encodeBase64(this.form.imageString)]
      }
      await addPerson(params)
      this.closeDialog(true)
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async changePersonalInfo() {
    try {
      this.loading = true
      const params = {
        id: this.form.id,
        groupId: this.groupId,
        name: this.form.name,
        number: this.form.number,
        description: this.form.description,
        pics: this.needVerify ? [encodeBase64(this.form.imageString)] : []
      }
      await editPerson(params)
      this.closeDialog(true)
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private submit() {
    const form: any = this.$refs.form
    form.validate((valid: any) => {
      if (valid) {
        if (this.status === 'add') {
          this.addPersonalInfo()
        } else {
          this.changePersonalInfo()
        }
      } else {
        return false
      }
    })
  }

  private mounted() {
    if (this.status === 'edit') {
      this.form = {
        ...this.data,
        imageString: this.data.faceCropUrls[0]
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.avatar-uploader {
  display: flex;
  justify-content: center;
  align-items: center;
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
  max-width: 178px;
  max-height: 178px;
  display: block;
}

.form-tip-avatar {
  position: relative;

  p {
    margin: 2px 0;
    line-height: 120%;
  }
}
</style>
