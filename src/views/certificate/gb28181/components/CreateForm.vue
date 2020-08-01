<template>
  <el-form
    ref="dataForm"
    v-loading="loading"
    :rules="rules"
    :model="form"
    label-position="right"
    label-width="140px"
  >
    <el-form-item label="是否匿名:" prop="anonymous" class="form-with-tip">
      <el-switch v-model="form.anonymous" />
      <div class="form-tip">当选择匿名密码为国标设备凭证时，设备注册时将使用设备ID作为SIP用户认证ID。</div>
    </el-form-item>
    <el-form-item :label="form.anonymous ? '用户别名:' : 'SIP用户认证ID:'" prop="userName" class="form-with-tip">
      <el-input v-model="form.userName" :disabled="disabled" />
      <div v-if="form.anonymous" class="form-tip">当选择匿名密码为国标设备凭证时，用户别名仅用于凭证管理，便于记忆。</div>
      <div v-else class="form-tip">设备注册时将使用当前输入值作为SIP用户认证ID。</div>
    </el-form-item>
    <el-form-item v-if="disabled" label="旧密码:" prop="oldPassword">
      <el-input v-model="form.oldPassword" show-password />
    </el-form-item>
    <el-form-item label="密码:" prop="password">
      <el-input v-model="form.password" show-password />
    </el-form-item>
    <el-form-item label="确认密码:" prop="confirmPassword">
      <el-input v-model="form.confirmPassword" show-password />
    </el-form-item>
    <el-form-item label="描述:" prop="description">
      <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入业务组描述，如业务介绍或用途" />
    </el-form-item>
    <el-form-item label="">
      <slot />
    </el-form-item>
  </el-form>
</template>
<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator'
import { InProtocolType, OutProtocolType } from '@/dics'
import { createCertificate, queryCertificate, updateCertificate } from '@/api/certificate/gb28181'
import { GB28181 } from '@/type/certificate'
import { th } from 'date-fns/locale'

@Component({
  name: 'CreateGb28181CertificateForm'
})
export default class extends Vue {
  private loading = false
  private disabled = false
  private rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
      { validator: this.validatePass, trigger: 'blur' }
    ],
    confirmPassword: [
      { validator: this.validatePass2, trigger: 'blur' }
    ],
    oldPassword: [
      { validator: this.validateOldPass, trigger: 'blur' }
    ]
  }
  private form: GB28181 = {
    userType: 'normal',
    userName: '',
    oldPassword: '',
    password: '',
    confirmPassword: '',
    description: ''
  }

  private validatePass(rule: any, value: string, callback: any) {
    if (!value && !this.disabled) {
      callback(new Error('请输入密码'))
    } else {
      if (this.form.password !== '') {
        const form: any = this.$refs.dataForm
        form.validateField('confirmPassword')
      }
      callback()
    }
  }

  private validatePass2(rule: any, value: string, callback: any) {
    if (!value && !this.disabled) {
      callback(new Error('请再次输入密码'))
    } else if (value !== this.form.password) {
      callback(new Error('两次输入密码不一致'))
    } else {
      callback()
    }
  }

  private validateOldPass(rule: any, value: string, callback: any) {
    if (this.form.password && !value) {
      callback(new Error('更改密码时必须输入旧密码'))
    } else {
      callback()
    }
  }

  private submit(onSuccess: Function) {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        this.loading = true
        try {
          if (this.disabled) {
            await updateCertificate(this.form)
          } else {
            await createCertificate(this.form)
          }
          onSuccess()
        } catch (e) {
          this.$message.error(e)
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
      this.loading = true
      try {
        const res = await queryCertificate({ userName: this.form.userName })
        this.form = res
      } catch (e) {
        this.$message.error(e)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
