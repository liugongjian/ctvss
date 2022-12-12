<template>
  <div class="login-container">
    <div class="header">
      <div class="logo">
        <img src="@/assets/images/logo.svg">
        <span class="logo__subtitle">视频监控</span>
      </div>
    </div>
    <div class="login-container__body">
      <div class="login-container__body__left">
        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          autocomplete="on"
          label-position="left"
        >
          <div class="title-container">
            <h3 class="title">
              {{ !subUserLogin ? "主账号登录" : '子账号登录' }}
            </h3>
          </div>

          <el-form-item v-if="subUserLogin" prop="mainUserID">
            <span class="svg-container">
              <svg-icon name="user" />
            </span>
            <el-input
              ref="mainUserID"
              v-model="loginForm.mainUserID"
              placeholder="主账号ID"
              name="mainUserID"
              type="text"
              tabindex="1"
              autocomplete="on"
              @change="setIDQuery"
            />
          </el-form-item>
          <el-form-item v-if="subUserLogin" prop="userName">
            <span class="svg-container">
              <svg-icon name="user" />
            </span>
            <el-input
              ref="userName"
              v-model="loginForm.userName"
              placeholder="账号"
              name="userName"
              type="text"
              tabindex="1"
              autocomplete="on"
              @change="setNameQuery"
            />
          </el-form-item>
          <el-form-item v-else prop="mainUserName">
            <span class="svg-container">
              <svg-icon name="user" />
            </span>
            <el-input
              ref="mainUserName"
              v-model="loginForm.mainUserName"
              placeholder="邮箱"
              name="mainUserName"
              type="text"
              tabindex="1"
              autocomplete="on"
              @change="setNameQuery"
            />
          </el-form-item>

          <el-tooltip
            v-model="capsTooltip"
            content="大写键盘已打开"
            placement="right"
            manual
          >
            <el-form-item prop="password">
              <span class="svg-container">
                <svg-icon name="password" />
              </span>
              <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                placeholder="密码"
                name="password"
                tabindex="2"
                autocomplete="on"
                @keyup.native="checkCapslock"
                @blur="capsTooltip = false"
                @keyup.enter.native="handleLogin"
              />
              <span
                class="show-pwd"
                @click="showPwd"
              >
                <svg-icon :name="passwordType === 'password' ? 'eye-off' : 'eye-on'" />
              </span>
            </el-form-item>
          </el-tooltip>
          <div class="validate">
            <el-form-item prop="captcha" class="validate__input">
              <el-input
                ref="captcha"
                v-model="loginForm.captcha"
                placeholder="请输入验证码"
                name="captcha"
                type="text"
                tabindex="3"
              />
            </el-form-item>
            <img :src="captchaImg" class="validate__pic" @click="refreshCaptcha">
          </div>
          <div class="button-group">
            <el-button
              class="button-group__login"
              :loading="loading"
              type="primary"
              size="large"
              @click.native.prevent="handleLogin"
            >
              {{ "登录" }}
            </el-button>
          </div>
          <!-- <div class="login-switcher">
            <el-button
              type="text"
              @click.native.prevent="switchToSubUserLogin"
            >
              <svg-icon name="arrow-left" height="12px" /> {{ !subUserLogin ? "切换子账号" : "切换主账号" }}
            </el-button>
          </div> -->
          <!-- <div style="position:relative">
            <div class="tips">
              <span>{{ "账号" }} : admin </span>
              <span>{{ "密码" }} : {{ "随便填" }} </span>
            </div>
            <div class="tips">
              <span>{{ "账号" }} : editor </span>
              <span>{{ "密码" }} : {{ "随便填" }} </span>
            </div>

            <el-button
              class="thirdparty-button"
              type="primary"
              @click="showDialog=true"
            >
              {{ "第三方登录" }}
            </el-button>
          </div> -->
        </el-form>
      </div>
      <div class="login-container__body__right">
        <img src="@/assets/images/landing.png">
      </div>
    </div>
    <!-- <el-dialog
      title="第三方登录"
      :visible.sync="showDialog"
    >
      {{ "第三方登录" }}
      <br>
      <br>
      <br>
      <social-sign />
    </el-dialog> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { Dictionary } from 'vue-router/types/router'
import { Form as ElForm, Input } from 'element-ui'
import { UserModule } from '@/store/modules/user'
import { GroupModule } from '@/store/modules/group'
import { removeTicket } from '@/utils/cookies'
import * as loginService from '@/services/loginService'
import { getCaptcha } from '@/api/users'

@Component({
  name: 'Login'
})
export default class extends Vue {
  private validateMainUserId = (rule: any, value: string, callback: Function) => {
    if (!value) {
      callback(new Error('主账号ID不能为空'))
    } else {
      callback()
    }
  }
  private validateUsername = (rule: any, value: string, callback: Function) => {
    if (!value) {
      callback(new Error('用户名不能为空'))
    } else {
      callback()
    }
  }
  private validateMainUsername = (rule: any, value: string, callback: Function) => {
    if (!value) {
      callback(new Error('邮箱不能为空'))
    } else {
      callback()
    }
  }
  private validatePassword = (rule: any, value: string, callback: Function) => {
    if (!value) {
      callback(new Error('密码不能为空'))
    } else {
      callback()
    }
  }
  private validateCaptcha = (rule: any, value: string, callback: Function) => {
    if (!value) {
      callback(new Error('验证码不能为空'))
    } else {
      callback()
    }
  }

  private loginForm = {
    mainUserID: '',
    mainUserName: '',
    userName: '',
    password: '',
    captcha: ''
  }
  private loginRules = {
    mainUserID: [{ validator: this.validateMainUserId, trigger: 'blur' }],
    userName: [{ validator: this.validateUsername, trigger: 'blur' }],
    mainUserName: [{ validator: this.validateMainUsername, trigger: 'blur' }],
    password: [{ validator: this.validatePassword, trigger: 'blur' }],
    captcha: [{ validator: this.validateCaptcha, trigger: 'blur' }]
  }
  private passwordType = 'password'
  private loading = false
  private showDialog = false
  private capsTooltip = false
  private redirect?: string
  private otherQuery: Dictionary<string> = {}
  private subUserLogin = false
  private captchaId = ''
  private captchaImg = ''

  @Watch('$route', { immediate: true })
  private onRouteChange(route: Route) {
    this.subUserLogin = (route.path === loginService.innerUrl.sub)
    // TODO: remove the "as Dictionary<string>" hack after v4 release for vue-router
    // See https://github.com/vuejs/vue-router/pull/2050 for details
    const query = route.query as Dictionary<string>
    if (query) {
      this.redirect = query.redirect
      this.otherQuery = this.getOtherQuery(query)
      if (this.subUserLogin) {
        this.loginForm.mainUserID = this.otherQuery.mainUserID || ''
        this.loginForm.userName = this.otherQuery.subUserName || ''
      }
    }
  }

  mounted() {
    this.refreshCaptcha()
    if (this.loginForm.userName === '') {
      (this.$refs.userName as Input).focus()
    } else if (this.loginForm.password === '') {
      (this.$refs.password as Input).focus()
    }
  }

  private setIDQuery(value: string) {
    if (this.subUserLogin) {
      const query = JSON.parse(JSON.stringify(this.$route.query))
      if (value) {
        query.mainUserID = value
      } else {
        delete query.mainUserID
      }
      this.$router.replace({
        query
      })
    }
  }

  private setNameQuery(value: string) {
    if (this.subUserLogin) {
      const query = JSON.parse(JSON.stringify(this.$route.query))
      if (value) {
        query.subUserName = value
      } else {
        delete query.subUserName
      }
      this.$router.replace({
        query
      })
    }
  }

  private checkCapslock(e: KeyboardEvent) {
    const { key } = e
    if (!key) return
    this.capsTooltip = key !== null && key.length === 1 && (key >= 'A' && key <= 'Z')
  }

  // private switchToSubUserLogin() {
  //   this.loginForm.userName = ''
  //   this.loginForm.password = ''
  //   this.subUserLogin = !this.subUserLogin
  //   const query = JSON.parse(JSON.stringify(this.$route.query))
  //   if (this.subUserLogin) {
  //     query.subUserLogin = '1'
  //   } else {
  //     delete query.subUserLogin
  //     delete query.mainUserID
  //   }
  //   this.$router.replace({
  //     query
  //   })
  // }
  private showPwd() {
    if (this.passwordType === 'password') {
      this.passwordType = ''
    } else {
      this.passwordType = 'password'
    }
    this.$nextTick(() => {
      (this.$refs.password as Input).focus()
    })
  }

  private async refreshCaptcha() {
    try {
      const data = await getCaptcha()
      this.captchaId = data.captchaId
      this.captchaImg = data.img
    } catch (e) {
      this.$message.error('获取验证码图片失败，请点击刷新!')
    }
  }

  private handleLogin() {
    (this.$refs.loginForm as ElForm).validate(async(valid: boolean) => {
      if (valid) {
        try {
          this.loading = true
          UserModule.ResetToken()
          await GroupModule.ResetGroup()
          await GroupModule.ResetGroupList()
          const loginData: any = {
            password: this.loginForm.password,
            captchaId: this.captchaId,
            captcha: this.loginForm.captcha,
            platform: 'web'
          }
          if (this.subUserLogin) {
            loginData.mainUserID = this.loginForm.mainUserID
            loginData.userName = this.loginForm.userName
          } else {
            loginData.userName = this.loginForm.mainUserName
          }
          const result: any = await UserModule.Login(loginData)
          removeTicket(loginService.casUrl.type)
          if (this.subUserLogin && result.code === 8) {
            this.$router.push({
              path: '/reset-password',
              query: this.$route.query
            })
          } else {
            this.$router.push({
              path: this.redirect || '/',
              query: this.otherQuery
            })
          }
        } catch (err) {
          if (this.subUserLogin && err.code === 8) {
            this.$router.push({
              path: '/reset-password',
              query: this.$route.query
            })
          } else {
            this.refreshCaptcha()
            this.$message.error('登录失败，失败原因：' + err.message)
          }
        } finally {
          this.loading = false
        }
      } else {
        return false
      }
    })
  }

  private getOtherQuery(query: Dictionary<string>) {
    return Object.keys(query).reduce((acc, cur) => {
      if (cur !== 'redirect') {
        acc[cur] = query[cur]
      }
      return acc
    }, {} as Dictionary<string>)
  }
}
</script>

<style lang="scss">
// References: https://www.zhangxinxu.com/wordpress/2018/01/css-caret-color-first-line/
@supports (-webkit-mask: none) and (not (cater-color: $loginCursorColor)) {
  .login-container .el-input {
    input { color: $text; }
    input:first-line { color: $text; }
  }
}

.login-container {
  .el-input {
    display: inline-block;
    width: 85%;

    .el-input__inner {
      vertical-align: middle;
      line-height: 1px;
    }

    input {
      background: #fff;
      border: 0;
      border-radius: 0;
      padding: 12px 5px 12px 15px;
      color: $text;
      appearance: none;

      &:-webkit-autofill {
        background: none;
        box-shadow: 0 0 0 1000px #fff inset !important;
        -webkit-text-fill-color: $text !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid #c6c6c6;
    background: #fff;
    border-radius: 5px;
    color: $text;
  }
}
</style>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: $loginBg;

  .header {
    height: 50px;
    width: 100%;
    background-color: #f7f7f7;
    border-bottom: 1px solid #eee;
    line-height: 50px;
    position: fixed;
    z-index: 100;

    .logo {
      float: left;
      font-weight: bold;
      margin-left: 15px;
      height: 100%;
      display: flex;
      align-items: center;

      &__subtitle {
        color: $text;
        font-size: 16px;
        border-left: 1px solid #aaa;
        height: 20px;
        line-height: 20px;
        margin-left: 15px;
        padding-left: 15px;
      }

      img {
        height: 30px;
      }
    }
  }

  &__body {
    display: flex;
    width: 1100px;
    margin: 70px auto 0;

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
      margin: 0 auto 40px;
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

  .validate {
    display: flex;
    align-items: center;
    margin-bottom: 25px;

    &__input {
      flex-grow: 1;
      margin-bottom: 0;

      ::v-deep .el-form-item__content {
        line-height: 48px;
      }
    }

    &__pic {
      margin-left: 9px;
      min-width: 85px;
      height: 50px;
      border-radius: 4px;
      background: rgba(238, 238, 238, 100%);
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
