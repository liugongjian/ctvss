<template>
  <div class="app-container">
    <el-page-header content="成员详情" @back="back" />
    <el-card class="dashboard-wrap-overview__detail__card">
      <div class="dashboard-wrap-overview__detail__head">
        <div class="dashboard-wrap-overview__detail__name">{{ detail.iamUserName }}</div>
        <div class="dashboard-wrap-overview__detail__button">
          <el-button @click="gotoEdit">编辑基本信息</el-button>
          <el-button @click="goDelete">删除成员</el-button>
        </div>
      </div>
      <el-descriptions class="detail" :column="column">
        <el-descriptions-item label="账号ID">
          <p class="detail__content">{{ detail.iamUserId || '-' }}</p>
        </el-descriptions-item>
        <el-descriptions-item label="访问方式">
          <p class="detail__content">{{ detail.visit || '-' }}</p>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          <p class="detail__content">{{ detail.createdTime || '-' }}</p>
        </el-descriptions-item>
        <el-descriptions-item label="手机">
          <p class="detail__content">{{ detail.phone || '-' }}</p>
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          <p class="detail__content">{{ detail.email || '-' }}</p>
        </el-descriptions-item>
        <el-descriptions-item label="登录链接">
          <p class="detail__content">{{ subUserLoginLink || '-' }}</p>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardLightContainer from '@/views/Dashboard/components/DashboardLightContainer.vue'
import DashboardMixin from '@/views/Dashboard/mixin/DashboardMixin'
import * as loginService from '@/services/loginService'
import { getUserDetail, deleteUser } from '@/api/iamDashboard'

@Component({
  name: 'DashboardUserDetail',
  components: {
    DashboardLightContainer
  }
})
export default class extends Mixins(DashboardMixin) {
  private column = 2
  private detail: any = {
    iamUserId: '',
    iamUserName: '',
    createdTime: '',
    updatedTime: '',
    policyName: '',
    policyDocument: '',
    policyId: '',
    visit: '',
    phone: '',
    email: ''
  }

  private subUserLoginLink: string = ''
  private nodeKeyPath: any = '-1'

  private get container() {
    return 'DashboardLightContainer'
  }

  private get query() {
    return this.$route.query
  }

  private mounted() {
    this.intervalTime = 10 * 60 * 1000
    this.setInterval(this.getData)
  }

  /**
   * 获取数据
   */
  private getData() {
    this.getUserDetail()
  }

  /**
   * 获取用户详情
   */
  private async getUserDetail() {
    const params = {
      iamUserId: this.query.userId
    }
    const res = await getUserDetail(params)
    this.detail['iamUserId'] = res.iamUserId
    this.detail['iamUserName'] = res.iamUserName
    this.detail['createdTime'] = res.createdTime
    this.detail['updatedTime'] = res.updatedTime
    this.detail['policyName'] = res.policyName
    this.detail['policyDocument'] = res.policyDocument
    this.detail['policyId'] = res.policyId
    this.detail['phone'] = res.phone
    this.detail['email'] = res.email
    if (res.consoleEnabled === '1' && res.apiEnabled === '1') {
      this.detail['visit'] = '控制台登录、编程访问'
    } else if (res.consoleEnabled === '1' && res.apiEnabled === '2') {
      this.detail['visit'] = '控制台登录'
    } else if (res.consoleEnabled === '2' && res.apiEnabled === '2') {
      this.detail['visit'] = ''
    } else if (res.consoleEnabled === '2' && res.apiEnabled === '1') {
      this.detail['visit'] = '编程访问'
    }
    this.getSubuserLoginLink(this.detail['iamUserName'])
  }

  /**
   * 回退
   */
  private back() {
    this.$router.go(-1)
  }

  /*
   * 编辑
   */
  private gotoEdit() {
    this.getSubuserLoginLink(this.detail['iamUserName'])
    this.$router.push({
      name: 'AccessManageUserCreate',
      query: {
        type: 'edit',
        userId: this.detail['iamUserId'],
        groupId: this.$route.query.groupId,
        subUserLoginLink: this.subUserLoginLink
      }
    })
  }
  private getSubuserLoginLink(userName: any) {
    const origin = window.location.origin
    const mainUserID = this.$store.state.user.mainUserID
    const link = `${origin}${loginService.innerUrl.prefix}${loginService.innerUrl.sub}?&subUserName=${userName}&mainUserID=${mainUserID}`
    this.subUserLoginLink = link
  }

  /**
   * 删除用户
   */
  private goDelete() {
    this.$alertDelete({
      type: '用户',
      msg: `是否确认删除用户"${this.detail.iamUserName}"`,
      method: deleteUser,
      payload: { iamUserId: this.detail.iamUserId },
      onSuccess: () => {
        // 删除用户之后返回上一级，改变了
        this.back()
      }
    })
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-descriptions-item__label {
  color: #888;
  text-align: right;
  min-width: 90px;
}

.detail__content {
  margin-top: 0;
  color: #000;
}
</style>
