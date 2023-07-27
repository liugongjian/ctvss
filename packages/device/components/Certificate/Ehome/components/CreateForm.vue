<template>
  <el-form
    ref="dataForm"
    v-loading="loading"
    :rules="rules"
    :model="form"
    label-position="right"
    label-width="140px"
  >
    <el-form-item label="名称" prop="userName" class="form-with-tip">
      <el-input v-model="form.userName" :disabled="isEdit" />
      <div class="form-tip">
        仅支持输入小写字母和数字
      </div>
      <!-- <div v-if="form.userType === 'anonymous'" class="form-tip">当选择匿名密码为国标设备凭证时，用户别名仅用于凭证管理，便于记忆。</div>
      <div v-else class="form-tip">设备注册时将使用当前输入值作为SIP用户认证ID。</div> -->
    </el-form-item>
    <el-form-item v-if="isEdit" label="旧密码:" prop="password">
      <el-input v-model="form.password" show-password />
    </el-form-item>
    <el-form-item label="密码:" prop="newPassword">
      <el-input v-model="form.newPassword" show-password />
      <div v-if="isEdit" class="form-tip">
        凭证密码修改后，对于已绑定该凭证的在线设备，新的密码校验将在下次设备上线时起效
      </div>
    </el-form-item>
    <el-form-item label="确认密码:" prop="confirmPassword">
      <el-input v-model="form.confirmPassword" show-password />
    </el-form-item>
    <el-form-item label="描述:" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="3"
        placeholder="请输入凭证描述，如凭证介绍或用途"
      />
    </el-form-item>
    <el-form-item label="">
      <slot />
    </el-form-item>
  </el-form>
</template>
<script lang='ts'>
import { encrypt } from '@vss/base/utils/encrypt'
import { Component, Vue } from 'vue-property-decorator'
import {
  createEhomeCertificate,
  getEhomeCertificate,
  updateEhomeCertificate
} from '@vss/device/api/certificate'
import { EHOME } from '@vss/device/type/Certificate'

@Component({
  name: 'CreateEhomeECertificateForm'
})
export default class extends Vue {
  private loading = false
  private isEdit = false
  private editDisable = false
  private rules = {
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { validator: this.validateUserName, trigger: 'blur' }
    ],
    newPassword: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { validator: this.validatePass, trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认密码', trigger: 'blur' },
      { validator: this.validatePass2, trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入旧密码', trigger: 'blur' },
      { validator: this.validateOldPass, trigger: 'blur' }
    ]
  }

  private form: EHOME = {
    userType: 'normal',
    userName: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    description: ''
  }

  private validatePass(rule: any, value: string, callback: any) {
    if (!value && !this.isEdit) {
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
    if (!value && !this.isEdit) {
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
      if (!/^[0-9a-z]+$/.test(value)) {
        callback(new Error('用户名仅支持小写字母和数字'))
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
          if (this.isEdit) {
            data = {
              inProtocol: 'ehome',
              userName: encrypt(this.form.userName),
              userType: this.form.userType,
              description: this.form.description,
              password: encrypt(this.form.password),
              newPassword: encrypt(this.form.newPassword),
              version: '2.0'
            }
            await updateEhomeCertificate(data)
          } else {
            this.form.password = this.form.newPassword
            data = {
              inProtocol: 'ehome',
              userName: encrypt(this.form.userName),
              userType: this.form.userType,
              description: this.form.description,
              password: encrypt(this.form.password),
              version: '2.0'
            }
            await createEhomeCertificate(data)
          }
          onSuccess()
          if (this.isEdit) {
            this.$message.success('修改ISUP凭证成功！')
          } else {
            this.$message.success('新建ISUP凭证成功！')
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
    if (params.userName) {
      this.isEdit = true
      this.$set(this.form, 'userName', params.userName)
      try {
        const res = await getEhomeCertificate({
          inProtocol: 'ehome',
          userName: this.form.userName
        })
        this.$set(this.form, 'userType', res.userType)
        this.$set(this.form, 'description', res.description)
      } catch (e) {
        this.$message.error(e && e.message)
      }
    }
  }
}
</script>
