<template>
  <el-card>
    <el-form
      ref="form"
      v-loading="loading"
      :model="form"
      :rules="rules"
      label-position="right"
      label-width="150px"
      class="change-password-form"
    >
      <el-form-item prop="originalPwd" label="原始密码">
        <el-input
          :key="'originalPwd-' + passwordType.originalPwd"
          ref="originalPwd"
          v-model="form.originalPwd"
          :type="passwordType.originalPwd"
          placeholder="原始密码"
          name="originalPwd"
          tabindex="1"
          autocomplete="on"
          @focus="showOriginalPwdError = false"
        />
        <span class="show-pwd" @click="showPwd('originalPwd')">
          <svg-icon
            :name="passwordType.originalPwd === 'password' ? 'eye-off' : 'eye-on'"
          />
        </span>
        <span v-if="showOriginalPwdError" class="error-tip">原始密码错误</span>
      </el-form-item>
      <el-form-item prop="newPwd" label="新密码">
        <el-input
          :key="'newPwd-' + passwordType.newPwd"
          ref="newPwd"
          v-model="form.newPwd"
          :type="passwordType.newPwd"
          placeholder="新密码"
          name="newPwd"
          tabindex="2"
        />
        <span class="show-pwd" @click="showPwd('newPwd')">
          <svg-icon
            :name="passwordType.newPwd === 'password' ? 'eye-off' : 'eye-on'"
          />
        </span>
        <span class="form-item-tip">密码长度为8-20位，必须同时包含大写字母、小写字母、数字、特殊字符</span>
      </el-form-item>
      <el-form-item prop="confirmPwd" label="确认密码">
        <el-input
          :key="'confirmPwd-' + passwordType.confirmPwd"
          ref="confirmPwd"
          v-model="form.confirmPwd"
          :type="passwordType.confirmPwd"
          placeholder="确认密码"
          name="confirmPwd"
          tabindex="3"
          @keyup.enter.native="handleChangePassword"
        />
        <span class="show-pwd" @click="showPwd('confirmPwd')">
          <svg-icon
            :name="passwordType.confirmPwd === 'password' ? 'eye-off' : 'eye-on'"
          />
        </span>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="handleChangePassword">提 交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Form as ElForm, Input } from 'element-ui'
import { UserModule } from '@/store/modules/user'
import * as loginService from '@/services/loginService'

@Component({
  name: 'changePassword'
})
export default class extends Vue {
  private passwordType: any = {
    originalPwd: 'password',
    newPwd: 'password',
    confirmPwd: 'password'
  }

  private validatePassword = (rule: any, value: string, callback: Function) => {
    if (!value) {
      callback(new Error('密码不能为空'))
    } else if (!this.pwdReg.test(value)) {
      callback(new Error('密码长度为8-20位，必须同时包含大写字母、小写字母、数字、特殊字符'))
    } else {
      callback()
    }
  }
  private validateConfirmPwd = (rule: any, value: string, callback: Function) => {
    if (this.form.newPwd !== this.form.confirmPwd) {
      callback(new Error('两次密码输入不一致！'))
    } else {
      callback()
    }
  }

  private form = {
    originalPwd: '',
    newPwd: '',
    confirmPwd: ''
  }
  private rules = {
    originalPwd: [
      { required: true, message: '请输入原始密码', trigger: 'blur' }
    ],
    newPwd: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { validator: this.validatePassword, trigger: ['blur', 'change'] }
    ],
    confirmPwd: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      { validator: this.validatePassword, trigger: ['blur', 'change'] },
      { validator: this.validateConfirmPwd, trigger: ['blur', 'change'] }
    ]
  }

  private pwdReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[.@$!%*#_~?&^])[A-Za-z0-9.@$!%*#_~?&^]{8,20}$/
  private showOriginalPwdError = false
  private loading = false

  mounted() {
    if (this.form.originalPwd === '') {
      (this.$refs.originalPwd as Input).focus()
    } else if (this.form.newPwd === '') {
      (this.$refs.newPwd as Input).focus()
    }
  }

  private showPwd(type: any) {
    if (this.passwordType[type] === 'password') {
      this.passwordType[type] = ''
    } else {
      this.passwordType[type] = 'password'
    }
    this.$nextTick(() => {
      (this.$refs[type] as Input).focus()
    })
  }

  private async logout() {
    const data: any = await UserModule.LogOut()
    if (data.iamUserId) {
      this.$router.push(`${loginService.innerUrl.sub}?redirect=%2Fdashboard&mainUserID=${data.mainUserID}`)
    } else {
      this.$router.push(`${loginService.innerUrl.main}?redirect=%2Fdashboard`)
    }
  }

  get isMainUser() {
    return !UserModule.iamUserId
  }

  private handleChangePassword() {
    (this.$refs.form as ElForm).validate(async(valid: boolean) => {
      if (valid) {
        try {
          this.loading = true
          if (this.isMainUser) {
            await UserModule.ChangePassword(this.form)
          } else {
            const subUserName = UserModule.name
            const mainUserID = UserModule.mainUserID
            const { originalPwd, newPwd, confirmPwd } = this.form
            const param = {
              mainUserID,
              subUserName,
              originalPwd,
              newPwd,
              confirmPwd
            }
            await UserModule.ResetIAMPassword(param)
          }

          this.$message.success('修改密码成功！')
          this.logout()
        } catch (err) {
          if (err.code === 7) {
            this.showOriginalPwdError = true
          } else {
            this.$message.error('修改密码失败，失败原因：' + err.message)
          }
        } finally {
          this.loading = false
        }
      } else {
        return false
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.change-password-form {
  position: relative;
  width: 40%;
  margin: 60px 0 60px 20px;

  .show-pwd {
    position: absolute;
    right: 10px;
    font-size: 16px;
    color: $darkGray;
    cursor: pointer;
    user-select: none;
  }

  ::v-deep .el-form-item {
    margin-bottom: 30px;

    .error-tip {
      font-size: 12px;
      color: $danger;
      line-height: 1;
      position: absolute;
      top: 100%;
      left: 0;
      padding-top: 6px;
    }

    .form-item-tip {
      font-size: 12px;
      color: $darkGray;
      line-height: 1;
      position: absolute;
      top: 100%;
      left: 0;
      padding-top: 6px;
    }
  }

  ::v-deep .el-form-item.is-error {
    .error-tip {
      display: none;
    }

    .form-item-tip {
      display: none;
    }
  }
}
</style>
