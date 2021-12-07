<template>
  <el-form
    ref="dataForm"
    v-loading="loading"
    :rules="rules"
    :model="form"
    label-position="right"
    label-width="140px"
  >
    <el-form-item label="用户别" prop="userName" class="form-with-tip">
      <el-input v-model="form.userName" :disabled="disabled" />
    </el-form-item>
    <el-form-item v-if="disabled" label="旧密码:" prop="password">
      <el-input v-model="form.password" show-password />
    </el-form-item>
    <el-form-item label="密码:" prop="newPassword">
      <el-input v-model="form.newPassword" show-password />
      <div class="form-tip">修改凭证密码后，已使用该凭证接入的设备将会下线</div>
    </el-form-item>
    <el-form-item label="确认密码:" prop="confirmPassword">
      <el-input v-model="form.confirmPassword" show-password />
    </el-form-item>
    <el-form-item label="描述:" prop="description">
      <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入凭证描述，如凭证介绍或用途" />
    </el-form-item>
    <el-form-item label="">
      <slot />
    </el-form-item>
  </el-form>
</template>
<script lang='ts'>
import { Base64 } from 'js-base64'
import { Component, Vue } from 'vue-property-decorator'
import { createCertificate, queryCertificate, updateCertificate } from '@/api/certificate/ga1400'
import { GA1400 } from '@/type/certificate'

@Component({
  name: 'CreateGb28181CertificateForm'
})
export default class extends Vue {
  private loading = false
  private disabled = false
  private rules = {
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { validator: this.validateUserName, trigger: 'blur' }
    ],
    newPassword: [
      { validator: this.validatePass, trigger: 'blur' }
    ],
    confirmPassword: [
      { validator: this.validatePass2, trigger: 'blur' }
    ],
    password: [
      { validator: this.validateOldPass, trigger: 'blur' }
    ]
  }
  private form: GA1400 = {
    userName: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    description: ''
  }

  private validatePass(rule: any, value: string, callback: any) {
    if (!value && !this.disabled) {
      callback(new Error('请输入密码'))
    } else {
      // if (this.form.newPassword !== '') {
      //   const form: any = this.$refs.dataForm
      //   form.validateField('confirmPassword')
      // }
      callback()
    }
  }

  private validatePass2(rule: any, value: string, callback: any) {
    if (!value && !this.disabled) {
      callback(new Error('请再次输入密码'))
    } else if (value !== this.form.newPassword) {
      callback(new Error('两次输入密码不一致'))
    } else {
      callback()
    }
  }

  private validateUserName(rule: any, value: string, callback: any) {
    if (!value) {
      callback(new Error('请输入用户名'))
    } else if (this.form.userType === 'normal') {
      if (!/^[0-9]+$/.test(value)) {
        callback(new Error('非匿名用户ID仅能填写数字'))
      } else {
        callback()
      }
    } else {
      callback()
    }
  }

  private validateOldPass(rule: any, value: string, callback: any) {
    if (this.form.newPassword && !value) {
      callback(new Error('更改密码时必须输入旧密码'))
    } else {
      callback()
    }
  }

  private submit(onSuccess: Function) {
    const form: any = this.$refs.dataForm
    let data: any = {}
    form.validate(async(valid: any) => {
      if (valid) {
        this.loading = true
        try {
          if (this.disabled) {
            data = {
              userName: this.form.userName,
              userType: this.form.userType,
              description: this.form.description,
              password: 'YTVjIX' + Base64.encode(this.form.password as string) + 'ZmZUBl',
              newPassword: 'YmNjIW' + Base64.encode(this.form.newPassword as string) + '1mZSNl'
            }
            await updateCertificate(data)
          } else {
            this.form.password = this.form.newPassword
            data = {
              userName: this.form.userName,
              userType: this.form.userType,
              description: this.form.description,
              password: 'YTVjIX' + Base64.encode(this.form.password as string) + 'ZmZUBl'
            }
            await createCertificate(data)
          }
          onSuccess()
          if (this.disabled) {
            this.$message.success('修改GA1400凭证成功！')
          } else {
            this.$message.success('新建GA1400凭证成功！')
          }
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.loading = false
        }
      } else {
        console.log('error submit!!')
        return false
      }
    })
  }

  private async mounted() {
    let params: any = this.$route.params
    if (params.userName) {
      this.disabled = true
      this.$set(this.form, 'userName', params.userName)
      try {
        const res = await queryCertificate({ userName: this.form.userName })
        this.$set(this.form, 'userType', res.userType)
        this.$set(this.form, 'description', res.description)
      } catch (e) {
        this.$message.error(e && e.message)
      }
    }
  }
}
</script>
