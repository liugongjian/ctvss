<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-02-14 16:58:39
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-02-20 17:16:16
 * @FilePath: /vss-user-web/src/views/AccessManage/User/Dashboard.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <el-card>
    <el-card class="dashboard-wrap-overview__container">
      <div class="dashboard-wrap-overview__item__card__content">
        <div class="dashboard-wrap-overview__cell">
          <p class="dashboard-wrap-overview__cell__head">主账号 ID</p>
          <p class="dashboard-wrap-overview__cell__content">
            <span class="dashboard-wrap-overview__num">{{ mainUserID }}</span>
          </p>
        </div>
        <div class="column-line" />
        <div class="dashboard-wrap-overview__cell">
          <p class="dashboard-wrap-overview__cell__head">子用户</p>
          <p class="dashboard-wrap-overview__cell__content">
            <span class="dashboard-wrap-overview__num">{{ info.iamUserCnt }}</span>
          </p>
          <p class="dashboard-wrap-overview__cell__content dashboard-wrap-overview__cell__content__click" @click="createMember">
            <span class="dashboard-wrap-overview__cell__head">创建子用户</span>
          </p>
        </div>
        <div class="column-line" />
        <div class="dashboard-wrap-overview__cell">
          <p class="dashboard-wrap-overview__cell__head">部门</p>
          <p class="dashboard-wrap-overview__cell__content">
            <span class="dashboard-wrap-overview__num">{{ info.iamGroupCnt }}</span>
          </p>
          <p class="dashboard-wrap-overview__cell__content dashboard-wrap-overview__cell__content__click" @click="createDepartment">
            <span class="dashboard-wrap-overview__cell__head">创建部门</span>
          </p>
        </div>
        <div class="column-line" />
        <div class="dashboard-wrap-overview__cell">
          <p class="dashboard-wrap-overview__cell__head">自定义策略</p>
          <p class="dashboard-wrap-overview__cell__content">
            <span class="dashboard-wrap-overview__num">{{ info.iamPolicyCnt }}</span>
          </p>
          <p class="dashboard-wrap-overview__cell__content dashboard-wrap-overview__cell__content__click" @click="createPolicy">
            <span class="dashboard-wrap-overview__cell__head">创建自定义策略</span>
          </p>
        </div>
        <div class="column-line" />
        <div class="dashboard-wrap-overview__cell">
          <p class="dashboard-wrap-overview__cell__head">角色</p>
          <p class="dashboard-wrap-overview__cell__content">
            <span class="dashboard-wrap-overview__num">{{ info.iamRoleCnt }}</span>
          </p>
          <p class="dashboard-wrap-overview__cell__content dashboard-wrap-overview__cell__content__click" @click="createRole">
            <span class="dashboard-wrap-overview__cell__head">创建角色</span>
          </p>
        </div>
        <!-- <div class="column-line" />
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">在线设备数</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num dashboard-wrap-overview__num__light">{{ stats.online }}</span>
          <span> / {{ stats.sum }}</span>
        </p>
      </div> -->
      </div>
    </el-card>
    <el-card v-if="ifShowAccess" class="dashboard-wrap-overview__container">
      <h2>访问安全设置</h2>
      <p>开启后，将支持用户使用App端、PC客户端登录</p>
      <el-button type="primary" @click="openPasswordDialog">访问设置</el-button>
    </el-card>
    <el-card class="dashboard-wrap-overview__container">
      <div class="dashboard-wrap-overview__item__card__content">
        <div class="dashboard-wrap-overview__cell">
          <p class="dashboard-wrap-overview__cell__head">登录链接</p>
          <p class="dashboard-wrap-overview__cell__content">
            <span class="dashboard-wrap-overview__cell__link">成员登录链接：</span> {{ userLoginLink }}
            <svg-icon class="dashboard-wrap-overview__cell__content__click dashboard-wrap-overview__cell__copy" name="copy" @click="copyLink" />
          </p>
        </div>
      </div>
    </el-card>

    <!-- 非页面主体内容  dialog弹层   -->
    <el-dialog
      title="访问密码设置"
      :visible="ifShowPasswordDialog"
      :before-close="closePasswordDialog"
      :destroy-on-close="true"
      custom-class="dashboard__set-password"
      width="40%"
    >
      <el-form
        ref="passwordForm"
        :model="passwordForm"
        :rules="rules"
        class="dashboard__set-password__password-form"
      >
        <el-form-item label="设置密码" prop="password">
          <el-input
            key="password"
            ref="password"
            v-model="passwordForm.password"
            :type="passwordType.password"
            placeholder="请输入密码"
            name="password"
            tabindex="2"
          />
          <span class="show-pwd" @click="showPwd('password')">
            <svg-icon
              :name="passwordType.password === 'password' ? 'eye-off' : 'eye-on'"
            />
          </span>
          <span class="form-item-tip">密码长度为8-20位，必须同时包含大写字母、小写字母、数字、特殊字符</span>
        </el-form-item>
        <el-form-item label="重新输入密码" prop="confirmPassword">
          <el-input
            key="confirmPassword"
            ref="confirmPassword"
            v-model="passwordForm.confirmPassword"
            :type="passwordType.confirmPassword"
            placeholder="请再次输入密码"
            name="confirmPassword"
            tabindex="3"
            @keyup.enter.native="sureChangePassword"
          />
          <span class="show-pwd" @click="showPwd('confirmPassword')">
            <svg-icon
              :name="passwordType.confirmPassword === 'password' ? 'eye-off' : 'eye-on'"
            />
          </span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sureChangePassword">确 定</el-button>
        <el-button @click="closePasswordDialog">取 消</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardLightContainer from '@/views/Dashboard/components/DashboardLightContainer.vue'
import DashboardMixin from '@/views/Dashboard/mixin/DashboardMixin'
import copy from 'copy-to-clipboard'
import * as loginService from '@/services/loginService'
import { getIamInfo, setAccessPassword, ifAccess } from '@/api/iamDashboard'
import { Form as ElForm, Input } from 'element-ui'
import { encrypt } from '@/utils/encrypt'

@Component({
  name: 'DashboardIam',
  components: {
    DashboardLightContainer
  }
})
export default class extends Mixins(DashboardMixin) {
  private info: any = {
    iamUserCnt: 0,
    iamGroupCnt: 0,
    iamRoleCnt: 0,
    iamPolicyCnt: '0'
  }

  private userLoginLink: any = ''
  private mainUserID: any = ''

  private ifShowAccess: boolean = true
  private ifShowPasswordDialog: boolean = false

  private pwdReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[.@$!%*#_~?&^])[A-Za-z0-9.@$!%*#_~?&^]{8,20}$/

  private passwordForm = {
    password: '',
    confirmPassword: ''
  }

  private passwordType = {
    password: 'password',
    confirmPassword: 'password'
  }

  private get container() {
    return 'DashboardLightContainer'
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
  private validateConfirmPassword = (rule: any, value: string, callback: Function) => {
    if (this.passwordForm.password !== this.passwordForm.confirmPassword) {
      callback(new Error('两次密码输入不一致！'))
    } else {
      callback()
    }
  }

  private rules = {
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { validator: this.validatePassword, trigger: ['blur', 'change'] }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      { validator: this.validatePassword, trigger: ['blur', 'change'] },
      { validator: this.validateConfirmPassword, trigger: ['blur', 'change'] }
    ]
  }

  private async mounted() {
    this.intervalTime = 10 * 60 * 1000
    this.setInterval(this.getData)
    await this.getIfShowAccess()
  }

  /**
   * 获取概览数据
   */
  private getData() {
    this.getInfo()
    this.getUserLoginLink()
  }

  private async getInfo() {
    const res = await getIamInfo(null)
    this.info.iamUserCnt = res.iamUserCnt
    this.info.iamGroupCnt = res.iamGroupCnt
    this.info.iamRoleCnt = res.iamRoleCnt
    this.info.iamPolicyCnt = res.iamPolicyCnt
  }

  /**
   * 创建成员，跳转到用户页面
   */
  private createMember() {
    this.$router.push({
      name: 'AccessManageUser',
      query: {
        type: 'add'
      }
    })
  }

  /**
   * 创建部门，跳转到用户页面
   */
  private createDepartment() {
    this.$router.push({
      name: 'AccessManageUser',
      query: {
        type: 'add'
      }
    })
  }

  /**
   * 创建自定义策略
   */
  private createPolicy() {
    this.$router.push({
      name: 'AccessManagePolicyCreate'
    })
  }

  /**
   * 创建角色
   */
  private createRole() {
    // 创建角色 返回跳转不是 回退一个
    this.$router.push({
      name: 'AccessManageRoleCreate',
      query: {
        type: 'add'
      }
    })
  }

  /**
   * 复制链接
   */
  private copyLink() {
    this.getUserLoginLink()
    copy(this.userLoginLink)
    this.$message.success('复制成功')
  }
  private getUserLoginLink() {
    const origin = window.location.origin
    this.mainUserID = this.$store.state.user.mainUserID
    const link = `${origin}${loginService.innerUrl.prefix}${loginService.innerUrl.sub}?&mainUserID=${this.mainUserID}`
    this.userLoginLink = link
  }

  private openPasswordDialog() {
    this.ifShowPasswordDialog = true
  }

  private closePasswordDialog() {
    this.ifShowPasswordDialog = false
    this.passwordForm = {
      password: '',
      confirmPassword: ''
    }
    this.passwordType = {
      password: 'password',
      confirmPassword: 'password'
    }
  }

  private showPwd(type: string) {
    if (this.passwordType[type] === 'password') {
      this.passwordType[type] = ''
    } else {
      this.passwordType[type] = 'password'
    }
    this.$nextTick(() => {
      (this.$refs[type] as Input).focus()
    })
  }

  private async getIfShowAccess() {
    try {
      const res = await ifAccess() as unknown as any
      const { visible } = res
      this.ifShowAccess = visible
    } catch (error) {
      this.$message.error(error)
    }
  }

  private sureChangePassword() {
    (this.$refs.passwordForm as ElForm).validate(async(valid: boolean) => {
      if (valid) {
        try {
          const password = encrypt(this.passwordForm.password)
          const param = {
            password,
            version: '2.0'
          }
          await setAccessPassword(param)
          this.$message.success('访问安全设置密码成功')
        } catch (error) {
          this.$message.error(error)
        } finally {
          this.closePasswordDialog()
        }
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.dashboard {
  &__set-password {
    position: relative;
    width: 40%;
    margin: 60px 0 60px 20px;

    &__password-form {
      .show-pwd {
        position: absolute;
        right: 10px;
        font-size: 16px;
        color: $darkGray;
        cursor: pointer;
        user-select: none;
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
