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
        <div v-if="verifyResult.state" class="form-tip form-tip-avatar">
          <p>图片格式：JPG、JPEG、PNG、GIF。</p>
          <p>图片大小：图片大小不超过 5M。</p>
          <p>图片像素：大于 5×5 像素，小于 4096×4096 像素。人脸尺寸建议大于 64×64 像素。</p>
        </div>
        <div v-if="!verifyResult.state" class="form-tip form-tip-avatar error">
          <p>{{ verifyResult.msg }}</p>
        </div>
      </el-form-item>
      <el-form-item label="姓名:" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" maxlength="64" />
      </el-form-item>
      <el-form-item label="人员编号:" prop="number">
        <el-input v-model="form.number" placeholder="请输入人员编号" maxlength="64"/>
      </el-form-item>
      <el-form-item label="描述:" prop="description">
        <el-input v-model="form.description" type="textarea" placeholder="请输入描述" maxlength="255" />
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
  private verifyResult = {
    state: true,
    msg: ''
  }
  private form: Record<string, any> = {
    imageString: null,
    imageName: null,
    name: null,
    number: null,
    description: null
  }
  private rules = {
    imageString: [
      { required: true, message: '请选择图片', trigger: 'blur' }
    ],
    name: [
      { required: true, message: '请输入姓名', trigger: 'blur' },
      { max: 64, message: '姓名长度不能超过64个字', trigger: 'blur' }
    ],
    number: [
      { validator: this.validateCertificate, trigger: 'blur' }
    ]
  }

  private async verifyImage(value) {
    try {
      const result = await verify({
        pic: encodeBase64(value)
      })
      if (result.verifyCode !== '0') {
        this.verifyResult = {
          state: false,
          msg: result.message
        }
      } else {
        this.verifyResult = {
          state: true,
          msg: ''
        }
      }
    } catch (e) {
      this.verifyResult = {
        state: false,
        msg: e.message
      }
    }
  }

  private validateCertificate(rule: any, value: string, callback: any) {
    if (value && value.length > 64) {
      callback(new Error('人员编号长度不能超过64位'))
    } else {
      callback()
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
      const form: any = this.$refs.form
      form.clearValidate('imageString')
      this.needVerify = true
      this.form.imageString = e.target.result
      this.verifyImage(this.form.imageString)
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
    if (this.loading) return
    const form: any = this.$refs.form
    form.validate((valid: any) => {
      if (valid && this.verifyResult.state) {
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
  margin-bottom: -20px;

  p {
    margin: 2px 0;
    line-height: 120%;
  }
  &.error {
    color: #f5212d;
  }
}
</style>
