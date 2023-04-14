<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-04-13 09:50:21
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-04-14 10:09:05
 * @FilePath: /vss-user-web/src/views/Dashboard/components/DashboardResourcePackage.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <component :is="container" title="资源包">
    <div class="dashboard-wrap-overview__item__card__content">
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">视频包</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num">{{ packageData.video }}</span> 个
        </p>
        <el-button v-if="packageData.video" type="text" @click="goRouter('video')">详情</el-button>
      </div>
      <div class="column-line" />
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">AI包</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num">{{ packageData.ai }}</span> 个
        </p>
        <p class="dashboard-wrap-overview__cell__bottom">
          <el-button v-if="packageData.ai" type="text" @click="goRouter('ai')">详情</el-button>
        </p>
      </div>
      <div class="column-line" />
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">上行带宽包</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num">{{ packageData.uploadBandwidth }}</span> 个
        </p>
        <el-button v-if="packageData.uploadBandwidth" type="text" @click="goRouter('uploadBandwidth')">详情</el-button>
      </div>
      <div class="column-line" />
      <div class="dashboard-wrap-overview__cell">
        <p class="dashboard-wrap-overview__cell__head">下行带宽包</p>
        <p class="dashboard-wrap-overview__cell__content">
          <span class="dashboard-wrap-overview__num">{{ packageData.downloadBandwidth }}</span> 个
        </p>
        <el-button v-if="packageData.downloadBandwidth" type="text" @click="goRouter('downloadBandwidth')">详情</el-button>
      </div>
    </div>
  </component>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import DashboardLightContainer from './DashboardLightContainer.vue'
import { getResourceCount } from '@/api/dashboard'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'DashboardResourcePackage',
  components: {
    DashboardLightContainer
  }
})
export default class extends Vue {
  private packageData = {
    ai: 0,
    downloadBandwidth: 0,
    uploadBandwidth: 0,
    video: 0
  }
  private get container() {
    return 'DashboardLightContainer'
  }

  // public get isPrivateUser() {
  //   return UserModule.tags && UserModule.tags.networkType !== 'public'
  // }

  @Watch('packageData')
  getPackageData(packageData: any) {
    this.$emit('ai-change', packageData)
  }

  private mounted() {
    this.getResourceCount()
  }

  private async getResourceCount() {
    const res = await getResourceCount(null)
    this.packageData = res
  }

  private goRouter(type: any) {
    this.$router.push({
      path: '/billing/resource',
      query: {
        type
      }
    })
  }
}
</script>
