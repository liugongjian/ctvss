<template>
  <div class="reset-container">
    <div class="header">
      <div class="logo">
        <img src="@/assets/images/logo.svg">
        <span class="logo__subtitle">智能视图服务</span>
      </div>
    </div>
    <div class="reset-container__body">
      <div class="reset-container__body_headline">重置密码</div>
      <div class="reset-container__body_sub_headline">您可能因被要求重置密码而需进行密码重置</div>
      <el-form
        ref="form"
        v-loading="loading"
        :model="form"
        :rules="rules"
        label-position="right"
        label-width="150px"
        class="reset-container__body_form"
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
            @keyup.enter.native="handleResetSubUserPassword"
          />
          <span class="show-pwd" @click="showPwd('confirmPwd')">
            <svg-icon
              :name="passwordType.confirmPwd === 'password' ? 'eye-off' : 'eye-on'"
            />
          </span>
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="handleResetSubUserPassword">提 交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Form as ElForm, Input } from 'element-ui'
import { UserModule } from '@/store/modules/user'
import * as loginService from '@/services/loginService'

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

  private form: any = {
    mainUserID: '',
    subUserName: '',
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
    const query = this.$route.query
    if (query.mainUserID && query.subUserName) {
      this.form.mainUserID = query.mainUserID
      this.form.subUserName = query.subUserName
    } else {
      this.$message.error('状态异常，请重新登录')
      this.$router.push(`${loginService.innerUrl.sub}?redirect=%2Fdashboard`)
    }
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

  private handleResetSubUserPassword() {
    (this.$refs.form as ElForm).validate(async(valid: boolean) => {
      if (valid) {
        try {
          this.loading = true
          const result: any = await UserModule.ResetIAMPassword(this.form)
          if (result.code === 7) {
            this.showOriginalPwdError = true
          } else {
            this.$message.success('重置密码成功！')
            this.$router.push({
              path: `${loginService.innerUrl.sub}`,
              query: this.$route.query
            })
          }
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
// References: https://www.zhangxinxu.com/wordpress/2018/01/css-caret-color-first-line/
@supports (-webkit-mask: none) and (not (cater-color: $loginCursorColor)) {
  .reset-container .el-input {
    input { color: $text; }
    input:first-line { color: $text; }
  }
}

.reset-container {
  height: 100%;
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
    width: 1100px;
    margin: 100px auto 0;

    &_headline {
      font-size: 26px;
      font-weight: bold;
      margin-bottom: 20px;
    }

    &_sub_headline {
      font-size: 22px;
    }

    &_form {
      position: relative;
      width: 52%;
      margin: 40px 0 60px 20px;

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
  }
}
</style>
