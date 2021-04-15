<template>
  <div class="login-container">
    <div class="header">
      <div class="logo">
        <img src="@/assets/images/logo.png">
      </div>
    </div>
    <div class="login-container__body">
      <div class="login-container__body__left">
        <span>重置密码</span>
        <span>您可能因被要求重置密码而需进行密码重置</span>
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
      </div>
      <div class="login-container__body__right">
        <img src="@/assets/images/landing.png">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Form as ElForm, Input } from 'element-ui'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'resetPassword'
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
      callback(new Error('密码格式不正确'))
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
      { validator: this.validatePassword, trigger: 'blur' }
    ],
    confirmPwd: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      { validator: this.validatePassword, trigger: 'blur' },
      { validator: this.validateConfirmPwd, trigger: 'blur' }
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
      this.$router.push(`/login?redirect=%2Fdashboard&subUserLogin=1&mainUserID=${data.mainUserID}`)
    } else {
      this.$router.push(`/login?redirect=%2Fdashboard`)
    }
  }

  private handleResetSubUserPassword() {
    (this.$refs.form as ElForm).validate(async(valid: boolean) => {
      if (valid) {
        try {
          this.loading = true
          await UserModule.ChangePassword(this.form)
          this.$message.success('重置密码成功！')
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

<style lang="scss">
// References: https://www.zhangxinxu.com/wordpress/2018/01/css-caret-color-first-line/
@supports (-webkit-mask: none) and (not (cater-color: $loginCursorColor)) {
  .login-container .el-input {
    input { color: $text; }
    input::first-line { color: $text; }
  }
}

.login-container {
  .el-input {
    display: inline-block;
    width: 85%;

    input {
      background: #fff;
      border: 0px;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $text;
      -webkit-appearance: none;

      &:-webkit-autofill {
        background: none;
        box-shadow: 0 0 0px 1000px #fff inset !important;
        -webkit-text-fill-color: $text !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid #C6C6C6;
    background: #fff;
    border-radius: 5px;
    color: $text;
  }
}
</style>

<style lang="scss" scoped>
.login-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: $loginBg;

  .header {
    height: 50px;
    width: 100%;
    background-color: #31313b;
    line-height: 50px;
    position: fixed;
    z-index: 100;

    .logo {
      float: left;
      color: #fff;
      margin-left: 15px;
      height: 100%;
      display: flex;
      align-items: center;
      img {
        height: 30px;
      }
    }
  }

  &__body {
    display: flex;
    width: 1100px;
    margin: 70px auto 0 auto;

    &__left {
      flex: 1;
    }

    &__right {
      flex: 1;
      img {
        width: 100%;
      }
    }
  }

  .login-form {
    position: relative;
    border-right: 1px solid #ddd;
    margin: 120px 60px 0 0;
    padding-right: 60px;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: #a5b1b7;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $text;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $darkGray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }

  .button-group {
    display: flex;
    margin-bottom: 10px;
    justify-content: space-between;
    &__login {
      width: 100%;
    }
  }

  .login-switcher {
    text-align: center;
    svg {
      vertical-align: middle;
    }
  }
}
</style>
