<template>
  <div class="app-container">
    <el-page-header content="成员详情" @back="back" />
    <el-card class="dashboard-wrap-overview__detail__card">
      <div class="dashboard-wrap-overview__detail__head">
        <div class="dashboard-wrap-overview__detail__name">张三</div>
        <div class="dashboard-wrap-overview__detail__button">
          <el-button @click="gotoEdit">编辑基本信息</el-button>
          <el-button @click="goDelete">删除成员</el-button>
        </div>
      </div>
      <el-descriptions class="detail" column="2">
        <el-descriptions-item label="账号ID"><p class="detail__content">kooriookami</p></el-descriptions-item>
        <el-descriptions-item label="访问方式"><p class="detail__content">kooriookami</p></el-descriptions-item>
        <el-descriptions-item label="创建时间"><p class="detail__content">kooriookami</p></el-descriptions-item>
        <el-descriptions-item label="手机"><p class="detail__content">kooriookami</p></el-descriptions-item>
        <el-descriptions-item label="备注"><p class="detail__content">kooriookami</p></el-descriptions-item>
        <el-descriptions-item label="登录链接"><p class="detail__content">kooriookami</p></el-descriptions-item>
      </el-descriptions>
      <!-- <div class="dashboard-wrap-overview__detail__info">
        <div class="dashboard-wrap-overview__detail__list">
          <p class="dashboard-wrap-overview__detail__message">账号ID：</p>
          <p class="dashboard-wrap-overview__detail__message">访问方式：</p>
          <p class="dashboard-wrap-overview__detail__message">创建时间：</p>
        </div>
        <div class="dashboard-wrap-overview__detail__list">
          <p class="dashboard-wrap-overview__detail__message">手机：</p>
          <p class="dashboard-wrap-overview__detail__message">备注：</p>
          <p class="dashboard-wrap-overview__detail__message">登录链接：</p>
        </div>
      </div> -->
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardLightContainer from '@/views/dashboard/components/DashboardLightContainer.vue'
import DashboardMixin from '@/views/dashboard/mixin/DashboardMixin'
import settings from '@/settings'
import { getUserDetail, deleteUser } from '@/api/iamDashboard'

@Component({
  name: 'DashboardUserDetail',
  components: {
    DashboardLightContainer
  }
})
export default class extends Mixins(DashboardMixin) {
  private detail: any = {
    iamUserId: '',
    iamUserName: '',
    createdTime: '',
    updatedTime: '',
    policyName: '',
    policyDocument: '',
    policyId: '',
    phone: '',
    email: ''
  }

  private subUserLoginLink: string = ''
  private nodeKeyPath: any = '-1'

  private get container() {
    return 'DashboardLightContainer'
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
    this.detail['iamUserId'] = '199052089002737664' // 测试 编辑跳转
    this.detail['iamUserName'] = 'res.iamUserName' // 测试 编辑跳转
    const res = await getUserDetail(null)
    // console.log('用户详情')
    // console.log(res)
    this.detail['iamUserId'] = '199052089002737664'
    this.detail['iamUserName'] = res.iamUserName
    this.detail['createdTime'] = res.createdTime
    this.detail['updatedTime'] = res.updatedTime
    this.detail['policyName'] = res.policyName
    this.detail['policyDocument'] = res.policyDocument
    this.detail['policyId'] = res.policyId
    this.detail['phone'] = res.phone
    this.detail['email'] = res.email
  }

  /**
   * 回退
   */
  private back() {
    // this.$router.push(`/accessManage/policy`)
    this.$router.go(-1)
  }

  /*
   * 编辑
   */
  private gotoEdit() {
    this.getSubuserLoginLink(this.detail['iamUserName'])
    this.$router.push({
      name: `accessManage-user-create`,
      query: {
        type: 'edit',
        userId: this.detail['iamUserId'],
        subUserLoginLink: this.subUserLoginLink
        // nodeKeyPath: this.nodeKeyPath
      }
    })
  }
  private getSubuserLoginLink(userName: any) {
    const origin = window.location.origin
    const mainUserID = this.$store.state.user.mainUserID
    const link: string = `${origin}${settings.projectPrefix}/login/subAccount?&subUserName=${userName}&mainUserID=${mainUserID}`
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
  color: #888888;
  text-align: right;
  min-width: 90px;
}
.detail__content {
  color: #000000;
}
</style>
