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
    <el-card class="dashboard-wrap-overview__container">
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

    <!-- 非页面主题内容  dialog弹层   -->
    <el-dialog
      title="访问密码设置"
      :visible="ifShowPasswordDialog"
      :before-close="closePasswordDialog"
    >
      <el-form>
        <el-form-item label="密码">
          123
        </el-form-item>
      </el-form>
    </el-dialog>
  </el-card>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardLightContainer from '@/views/Dashboard/components/DashboardLightContainer.vue'
import DashboardMixin from '@/views/Dashboard/mixin/DashboardMixin'
import copy from 'copy-to-clipboard'
import * as loginService from '@/services/loginService'
import { getIamInfo } from '@/api/iamDashboard'

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

  private ifShowPasswordDialog: boolean = false

  private get container() {
    return 'DashboardLightContainer'
  }

  private mounted() {
    this.intervalTime = 10 * 60 * 1000
    this.setInterval(this.getData)
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
  }
}
</script>
