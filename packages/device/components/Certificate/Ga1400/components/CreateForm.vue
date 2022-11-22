<template>
  <el-form
    ref="dataForm"
    v-loading="loading"
    :rules="rules"
    :model="form"
    label-position="right"
    label-width="140px"
  >
    <el-form-item label="注册用户名" prop="username" class="form-with-tip">
      <el-input v-model="form.username" :disabled="isUpdate" />
    </el-form-item>
    <el-form-item v-if="isUpdate" label="旧密码:" prop="password">
      <el-input v-model="form.password" show-password auto-complete="new-password" />
    </el-form-item>
    <el-form-item label="密码:" prop="newPassword">
      <el-input v-model="form.newPassword" show-password auto-complete="new-password" />
      <div class="form-tip">修改凭证密码后，已使用该凭证接入的设备将会下线</div>
    </el-form-item>
    <el-form-item label="确认密码:" prop="confirmPassword">
      <el-input v-model="form.confirmPassword" show-password auto-complete="new-password" />
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
import { Component, Vue } from 'vue-property-decorator'
import { encrypt } from '@vss/base/utils/encrypt'
import { createGa1400Certificate, getGa1400Certificate, updateGa1400Certificate } from '@vss/device/api/certificate'

@Component({
  name: 'CreateGa1400CertificateForm'
})
export default class extends Vue {
  private loading = false
  private isUpdate = false
  private rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { validator: this.validateUserName, trigger: 'blur' }
    ],
    newPassword: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { validator: this.validatePass, trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      { validator: this.validatePass2, trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入旧密码', trigger: 'blur' },
      { validator: this.validateOldPass, trigger: 'blur' }
    ]
  }
  private form: any = {
    id: null,
    username: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    description: ''
  }

  private validateUserName(rule: any, value: string, callback: any) {
    if (!value) {
      callback(new Error('请输入用户名'))
    } else {
      if (!/^[0-9a-z]+$/.test(value)) {
        callback(new Error('用户名仅支持小写字母和数字'))
      } else {
        callback()
      }
    }
  }

  private validatePass(rule: any, value: string, callback: any) {
    if (!value && !this.isUpdate) {
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
    if (!value && !this.isUpdate) {
      callback(new Error('请再次输入密码'))
    } else if (value !== this.form.newPassword) {
      callback(new Error('两次输入密码不一致'))
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
          if (this.isUpdate) {
            data = {
              id: this.form.id,
              username: encrypt(this.form.username),
              description: this.form.description,
              password: encrypt(this.form.password),
              newPassword: encrypt(this.form.newPassword)
            }
            await updateGa1400Certificate(data)
          } else {
            this.form.password = this.form.newPassword
            data = {
              username: encrypt(this.form.username),
              description: this.form.description,
              password: encrypt(this.form.password)
            }
            await createGa1400Certificate(data)
          }
          onSuccess()
          if (this.isUpdate) {
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
    const params: any = this.$route.params
    this.form.id = params.id
    if (this.form.id) {
      this.isUpdate = true
      try {
        const res = await getGa1400Certificate({ id: this.form.id })
        this.form = {
          ...this.form,
          ...res
        }
      } catch (e) {
        this.$message.error(e && e.message)
      }
    }
  }
}
</script>
