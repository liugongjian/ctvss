<template>
  <component :is="container" title="AI能力">
    <template slot="header">
      <el-button type="primary" class="dash-btn" @click="$router.push('/dashboard/visualization-dashboard')">可视化大屏</el-button>
    </template>
    <p class="dashboard-wrap-overview__cell__head">人脸识别</p>
    <div class="dashboard-wrap-overview__cell__list">
      <el-button size="medium" type="text" @click="goRouter(6)">未带口罩</el-button>
      <div class="column-line" />
      <el-button size="medium" type="text" @click="goRouter(4)">人员布控</el-button>
    </div>
    <p class="dashboard-wrap-overview__cell__head">人体识别</p>
    <div class="dashboard-wrap-overview__cell__list">
      <el-button size="medium" type="text" @click="goRouter(8)">人员聚集</el-button>
      <div class="column-line" />
      <el-button size="medium" type="text" @click="goRouter(5)">吸烟检测</el-button>
      <div class="column-line" />
      <el-button size="medium" type="text" @click="goRouter(7)">安全帽反光服检测</el-button>
      <div class="column-line" />
      <el-button size="medium" type="text" @click="goRouter(12)">人体属性</el-button>
    </div>
    <p class="dashboard-wrap-overview__cell__head">场景识别</p>
    <div class="dashboard-wrap-overview__cell__list">
      <el-button size="medium" type="text" @click="goRouter(9)">危险区域检测</el-button>
      <div class="column-line" />
      <el-button size="medium" type="text" @click="goRouter(10)">烟雾明火</el-button>
      <div class="column-line" />
      <el-button size="medium" type="text" @click="goRouter(11)">冲压机</el-button>
      <div class="column-line" />
      <el-button size="medium" type="text" @click="goRouter(13)">蜜蜂密度</el-button>
    </div>
  </component>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DashboardLightContainer from './DashboardLightContainer.vue'

@Component({
  name: 'DashboardAIAbility',
  components: {
    DashboardLightContainer
  }
})
export default class extends Vue {
  private get container() {
    return 'DashboardLightContainer'
  }

  private goRouter(type: any) {
    let params: any = {
      path: '/dashboard/ai',
      query: {
        type,
        isLight: true
      }
    }
    this.$router.push(params)
  }
}
</script>
