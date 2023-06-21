<template>
  <div class="access-restriction">
    <div class="access-restriction__title">
      <div class="access-restriction__title-text">访问安全设置</div>
      <el-button
        type="primary"
        size="mini"
        :disabled="loginStatus.loginStateCode === 1"
        @click="changeLoginDialog"
      >
        访问设置
      </el-button>
    </div>
    <p class="access-restriction__text">开启后，将支持用户在App客户局端登录</p>
    <div class="access-restriction__status">
      <span class="access-restriction__status-word">状态</span>
      <el-tooltip
        class="item"
        effect="dark"
        placement="top-start"
        popper-class="access-restriction__login-tooltip"
      >
        <div slot="content" class="access-restriction__cancel">
          如需注销App客户端账号，请点击
          <span
            class="access-restriction__cancel-text"
            @click="openCancelDialog"
          >注销账号</span>
        </div>
        <span class="access-restriction__status-text">
          <span
            class="access-restriction__status-badge"
            :class="{
              'access-restriction__status-badge-on':
                loginStatus.loginStateCode === 1
            }"
          ></span>
          {{ loginStatus.loginState }}
        </span>
      </el-tooltip>
    </div>

    <!-- 非页面主体内容 -->
    <el-dialog
      title="访问密码设置"
      :visible.sync="ifShowSetAccessPassword"
      width="50%"
      :before-close="handleClose"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="access-restriction__form"
      >
        <el-form-item label="设置密码" prop="password">
          <el-input
            :key="'password-' + passwordType.originalPwd"
            ref="password"
            v-model="form.password"
            :type="passwordType.password"
            placeholder="密码"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
          />
          <span class="show-pwd" @click="showPwd('password')">
            <svg-icon
              :name="
                passwordType.password === 'password' ? 'eye-off' : 'eye-on'
              "
            />
          </span>
        </el-form-item>
        <el-form-item label="重新输入密码" prop="confirmPwd">
          <el-input
            :key="'confirmPwd-' + passwordType.confirmPwd"
            ref="confirmPwd"
            v-model="form.confirmPwd"
            :type="passwordType.confirmPwd"
            placeholder="密码"
            name="confirmPwd"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
          />
          <span class="show-pwd" @click="showPwd('confirmPwd')">
            <svg-icon
              :name="
                passwordType.confirmPwd === 'password' ? 'eye-off' : 'eye-on'
              "
            />
          </span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="setLoginPassword">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :visible.sync="ifShowCancelDialog"
      width="770px"
      :before-close="handleCancelClose"
      class="access-restriction__cancel-dialog"
    >
      <el-steps
        :active="active"
        finish-status="success"
        process-status="process"
      >
        <el-step title="注意事项"></el-step>
        <el-step title="密码确认"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <div v-if="active === 0">
        <p>进行该操作前，请仔细阅读以下重要信息：</p>

        为保证用户（又称“您”）的账号、财产安全，在您提交请求前，请先确认并遵守如下事项：<br />
        该申请一旦完成即无法登录天翼云瞰App客户端。提交申请前，您应当确保天账号相关的所有App客户端业务均已无需使用。完成后，若因此而无法登录天翼云瞰App客户端或涉及使用App客户端的业务无法正常进行，天翼云瞰不承担任何责任。
        <p>敬请再次关注：</p>
        提交申请前，您应当确保天翼云账号相关的App客户端所有业务均已无需使用，接受无法登录/使用App客户端服务。<br />
        如果您希望保持与此账号相关联的天翼云瞰App客户端服务，请不要提交操作申请。
        <div class="access-restriction__cancel-dialog-check">
          <el-checkbox v-model="checked">
            已了解：天翼云瞰App客户端账号将无法登录，且无法使用App客户端的服务。
          </el-checkbox>
        </div>

        <div class="access-restriction__cancel-dialog-footer">
          <el-button style="margin-top: 12px" @click="handleCancelClose">
            取消
          </el-button>
          <el-button
            style="margin-top: 12px"
            type="primary"
            :disabled="!checked"
            @click="next"
          >
            下一步
          </el-button>
        </div>
      </div>

      <div v-if="active === 1">
        <div class="access-restriction__cancel-dialog-text">
          请输入密码进行二次确认：
        </div>
        <el-input
          :key="'dialogPwd-' + passwordType.confirmPwd"
          ref="dialogPwd"
          v-model="dialogPwd"
          :type="passwordType.dialogPwd"
          placeholder="密码"
          name="dialogPwd"
          tabindex="2"
          autocomplete="on"
          class="access-restriction__cancel-dialog-input"
        >
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
          <span slot="suffix" class="show-pwd" @click="showPwd('dialogPwd')">
            <svg-icon
              :name="
                passwordType.dialogPwd === 'password' ? 'eye-off' : 'eye-on'
              "
            />
          </span>
        </el-input>

        <div class="access-restriction__cancel-dialog-text">
          关闭后，将清空密码配置，账户将无法通过App客户端访问
        </div>

        <div class="access-restriction__cancel-dialog-footer">
          <el-button style="margin-top: 12px" @click="handleCancelClose">
            取消
          </el-button>
          <el-button style="margin-top: 12px" @click="prev">上一步</el-button>
          <el-button
            style="margin-top: 12px"
            type="primary"
            :disabled="!dialogPwd"
            @click="cancelUser"
          >
            确定
          </el-button>
        </div>
      </div>

      <div v-if="active === 2">
        <div class="access-restriction__cancel-dialog-text">
          已完成App端账号注销
        </div>
        <div class="access-restriction__cancel-dialog-footer">
          <el-button
            style="margin-top: 12px"
            type="primary"
            @click="finishThis"
          >
            完成
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Input } from 'element-ui'
import { getLoginState, setLoginPwd, cancelUser } from '@/api/accessManage'
import { encrypt } from '@/utils/encrypt'

@Component({
  name: 'LoginManage',
  components: {}
})
export default class extends Vue {
  private ifShowSetAccessPassword = false

  private ifShowCancelDialog = false

  private form: any = {}

  private active = 0

  private checked = false

  private pwdReg =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[.@$!%*#_~?&^])[A-Za-z0-9.@$!%*#_~?&^]{8,20}$/

  private passwordType: any = {
    password: 'password',
    confirmPwd: 'password',
    dialogPwd: 'password'
  }

  private dialogPwd = ''

  private loginStatus: any = {}

  async mounted() {
    await this.getLoginState()
  }

  private async getLoginState() {
    try {
      const res = await getLoginState()
      this.loginStatus = res
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private handleClose() {
    this.ifShowSetAccessPassword = false
  }
  private changeLoginDialog() {
    this.ifShowSetAccessPassword = true
  }

  private validatePassword = (rule: any, value: string, callback: Function) => {
    if (!value) {
      callback(new Error('密码不能为空'))
    } else if (!this.pwdReg.test(value)) {
      callback(
        new Error(
          '密码长度为8-20位，必须同时包含大写字母、小写字母、数字、特殊字符'
        )
      )
    } else {
      callback()
    }
  }
  private validateConfirmPwd = (
    rule: any,
    value: string,
    callback: Function
  ) => {
    if (this.form.password !== this.form.confirmPwd) {
      callback(new Error('两次密码输入不一致！'))
    } else {
      callback()
    }
  }

  private rules = {
    password: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { validator: this.validatePassword, trigger: ['blur', 'change'] }
    ],
    confirmPwd: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      { validator: this.validatePassword, trigger: ['blur', 'change'] },
      { validator: this.validateConfirmPwd, trigger: ['blur', 'change'] }
    ]
  }

  private checkCapslock(e: KeyboardEvent) {
    const { key } = e
    if (!key) return
    this.capsTooltip =
      key !== null && key.length === 1 && key >= 'A' && key <= 'Z'
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

  private openCancelDialog() {
    this.ifShowCancelDialog = true
  }

  private handleCancelClose() {
    this.ifShowCancelDialog = false
    this.active = 0
    this.checked = false
    this.dialogPwd = ''
  }

  private next() {
    if (this.active++ > 1) this.active = 0
  }

  private prev() {
    this.active--
  }

  private async setLoginPassword() {
    try {
      const { password } = this.form
      const params = {
        password: encrypt(password)
      }
      await setLoginPwd(params)
      await this.getLoginState()
      this.handleClose()
      this.handleCancelClose()
    } catch (error) {
      this.$message(error && error.message)
    }
  }

  private async cancelUser() {
    try {
      const password = encrypt(this.dialogPwd)
      const param = {
        password
      }
      await cancelUser(param)
      this.next()
    } catch (error) {
      this.$message(error && error.message)
    }
  }

  private async finishThis() {
    this.handleCancelClose()
    await this.getLoginState()
  }
}
</script>

<style lang="scss" scoped>
.access-restriction {
  &__text {
    margin-bottom: 0;
    font-size: 14px;
    color: #333;
    margin-top: 10px;
    padding-left: 16px;
  }

  &__title {
    padding-left: 16px;
    border-left: 8px solid #fa8334;
    height: 26px;
    line-height: 26px;
    font-size: 16px;
    font-weight: bold;
    margin: 10px 0 20px;

    &-text {
      width: 120px;
      display: inline-block;
    }
  }

  &__status {
    margin: 25px 0 0 15px;
    font-size: 0;
    // vertical-align: middle;
    // line-height: 12px;
    display: flex;
    align-items: center;

    &-word {
      display: inline-block;
      font-size: 12px;
    }

    &-text {
      margin-left: 16px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    &-badge {
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-right: 2px;
      background-color: $darkGray;

      &-on {
        background-color: $success;
      }
    }
  }

  ::v-deep .el-descriptions {
    &-item__label {
      text-align: right;
      min-width: 120px;
    }
  }

  ::v-deep .el-button {
    &--mini {
      margin-left: 26px;
      min-width: 140px;
    }
  }

  &__form {
    position: relative;
    //   width: 52%;
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

  &__cancel {
    &-dialog {
      ::v-deep {
        .el-step__head.is-process {
          color: #409eff;
          border-color: #409eff;
        }
        .el-step__title.is-process {
          color: #409eff;
          border-color: #409eff;
        }
        .el-input__suffix {
          top: 10px;
        }
      }

      &-check {
        margin: 50px 0 20px;
      }

      &-footer {
        text-align: right;
      }

      &-text {
        margin: 20px 0;
        color: #666;
        font-size: 14px;
      }

      &-input {
        width: 50%;
      }

      .show-pwd {
        margin: 0 10px;
      }
    }
  }
}
</style>
<style lang="scss">
.access-restriction__login-tooltip {
  .access-restriction__cancel-text {
    cursor: pointer;
    color: #409eff;
    position: relative;
    margin: 0 4px;
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 0;
      bottom: 0;
      border-bottom: 1px solid #409eff;
    }
  }
}
</style>
