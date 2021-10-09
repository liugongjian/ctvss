<template>
  <component :is="container" title="AI能力">
    <template slot="header">
      <el-button type="primary" class="dash-btn" @click="$router.push('/dashboard/visualization-dashboard')">可视化大屏</el-button>
    </template>
    <div v-for="item in aiInfos" :key="item.name">
      <p class="dashboard-wrap-overview__cell__head">{{ item.name }}</p>
      <div class="dashboard-wrap-overview__cell__list">
        <span v-for="app in item.apps.slice(0,5)" :key="app.id">
          <el-button size="medium" type="text" @click="goRouter(app.id)">{{ app.name }}</el-button>
        </span>
        <span v-if="item.apps.length > 5">
          <el-button class="dashboard-wrap-overview__cell__list__more-text" size="medium" type="text">...</el-button>
        </span>
      </div>
    </div>
    <div>
      <el-button class="applist-btn" size="medium" type="text" @click="$router.push({name: 'AI-AppList'})">查看全部>></el-button>
    </div>
  </component>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DashboardLightContainer from './DashboardLightContainer.vue'
import { AlertType } from '@/dics'
import { AiGroups } from '../helper/aiGroups'
import { getAppList } from '@/api/ai-app'

@Component({
  name: 'DashboardAIAbility',
  components: {
    DashboardLightContainer
  }
})
export default class extends Vue {
  private alertType = AlertType
  private aiGroups = AiGroups
  private aiInfos = []

  private get container() {
    return 'DashboardLightContainer'
  }

  private goRouter(appid: any) {
    const addr = this.$router.resolve({
      name: 'AI-AppDetail',
      query: {
        appid,
        tabNum: '1'
      }
    })
    window.open(addr.href, '_blank')
  }
  private mounted() {
    this.getAiApps()
  }

  private async getAiApps() {
    const { aiApps } = await getAppList({ pageSize: 3000 })
    let algoSet = new Set()
    aiApps.forEach(app => {
      if (algoSet.has(app.algorithm.id)) {
        this.aiInfos[this.aiInfos.findIndex(value => value.id === app.algorithm.id)].apps.push(app)
      } else {
        this.aiInfos.push({ id: app.algorithm.id, name: app.algorithm.name, apps: [app] })
      }
      algoSet.add(app.algorithm.id)
    })
  }
}
</script>
<style lang="scss" scoped>
  .dashboard-wrap-overview__cell__list {
    span {
      margin-right: 15px;
    }
    &__more-text {
      cursor: none;
    }
  }
  .applist-btn {
    float: right;
    margin-top: -20px;
  }
</style>
