<template>
  <component :is="container">
    <el-card>
      <div class="dashboard-wrap-overview__item__card__content">
        <div class="dashboard-wrap-overview__cell">
          <p class="dashboard-wrap-overview__cell__head">成员</p>
          <p class="dashboard-wrap-overview__cell__content">
            <span class="dashboard-wrap-overview__num">{{ info.iamUserCnt }}</span>
          </p>
          <p class="dashboard-wrap-overview__cell__content dashboard-wrap-overview__cell__content__click" @click="createMember">
            <span class="dashboard-wrap-overview__cell__head">创建成员</span>
          </p>
        </div>
        <div class="column-line" />
        <div class="dashboard-wrap-overview__cell">
          <p class="dashboard-wrap-overview__cell__head">部门</p>
          <p class="dashboard-wrap-overview__cell__content">
            <span class="dashboard-wrap-overview__num">{{ info.iamGroupCnt }}</span>
          </p>
          <!-- <p class="dashboard-wrap-overview__cell__content dashboard-wrap-overview__cell__content__click" @click="createDepartment">
            <span class="dashboard-wrap-overview__cell__head">创建部门</span>
          </p> -->
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
    <el-divider />
    <el-card>
      <div class="dashboard-wrap-overview__item__card__content">
        <div class="dashboard-wrap-overview__cell">
          <p class="dashboard-wrap-overview__cell__head">登陆链接</p>
          <p class="dashboard-wrap-overview__cell__content">
            <span class="dashboard-wrap-overview__cell__link">成员登录链接：</span> {{ userLoginLink }} <svg-icon class="dashboard-wrap-overview__cell__content__click dashboard-wrap-overview__cell__copy" name="copy" @click="copyLink" />
          </p>
        </div>
      </div>
    </el-card>
  </component>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardLightContainer from '@/views/dashboard/components/DashboardLightContainer.vue'
import DashboardMixin from '@/views/dashboard/mixin/DashboardMixin'
import copy from 'copy-to-clipboard'
import settings from '@/settings'
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
  // private stats: any = {
  //   realUpstreamBandwidth: 0,
  //   realDownstreamBandwidth: 0,
  //   upstreamBandwidth: 0,
  //   downstreamBandwidth: 0,
  //   sum: 0,
  //   online: 0
  // }
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
    // this.getDeviceStates()
    // this.getBandwidthStates()
  }

  private async getInfo() {
    const res = await getIamInfo(null)
    console.log('⭐')
    console.log(res)
    this.info.iamUserCnt = res.iamUserCnt
    this.info.iamGroupCnt = res.iamGroupCnt
    this.info.iamRoleCnt = res.iamRoleCnt
    this.info.iamPolicyCnt = res.iamPolicyCnt
  }

  /**
   * 获取带宽数据
   */
  // private async getBandwidthStates() {
  //   const res = await getBandwidthStates(null)
  //   this.stats['realUpstreamBandwidth'] = res.realUpstreamBandwidth
  //   this.stats['realDownstreamBandwidth'] = res.realDownstreamBandwidth
  //   this.stats['upstreamBandwidth'] = res.upstreamBandwidth
  //   this.stats['downstreamBandwidth'] = res.downstreamBandwidth
  // }

  /**
   * 获取设备数据
   */
  // private async getDeviceStates() {
  //   const res = await getDeviceStates(null)
  //   const sum = Math.max(parseInt(res.sum), parseInt(res.online))
  //   const online = Math.min(parseInt(res.sum), parseInt(res.online))
  //   this.stats['sum'] = sum
  //   this.stats['online'] = online
  // }

  /**
   * 创建成员
   */
  private createMember() {
    console.log('创建成员')
    this.$router.push({
      name: `accessManage-user-create`,
      query: {
        type: 'add'
      }
    })
  }

  /**
   * 创建部门
   */
  private createDepartment() {
    console.log('创建部门')
  }

  /**
   * 创建自定义策略
   */
  private createPolicy() {
    console.log('创建自定义策略')
    this.$router.push({
      name: `accessManage-policy-create`
    })
  }

  /**
   * 创建角色
   */
  private createRole() {
    console.log('创建角色')
    // 创建角色 返回跳转不是 回退一个
    this.$router.push({
      name: `accessManage-role-create`
    })
  }

  /**
   * 复制链接
   */
  private copyLink() {
    console.log('复制链接')
    this.getUserLoginLink()
    copy(this.userLoginLink)
    this.$message.success('复制成功')
  }
  private getUserLoginLink() {
    const origin = window.location.origin
    const mainUserID = this.$store.state.user.mainUserID
    const link: string = `${origin}${settings.projectPrefix}/login/subAccount?&mainUserID=${mainUserID}`
    this.userLoginLink = link
  }
}
</script>
