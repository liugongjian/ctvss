<template>
  <component :is="container" title="AI能力">
    <template slot="header">
      <el-button type="primary" class="dash-btn" @click="$router.push('/dashboard/visualization-dashboard')">可视化大屏</el-button>
    </template>
    <div v-for="group in aiGroups" :key="group.name">
      <p class="dashboard-wrap-overview__cell__head">{{ group.name }}</p>
      <div class="dashboard-wrap-overview__cell__list">
        <span v-for="aiType in group.children" :key="aiType">
          <el-button size="medium" type="text" @click="goRouter(aiType)">{{ alertType[aiType] }}</el-button>
        </span>
      </div>
    </div>
  </component>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DashboardLightContainer from './DashboardLightContainer.vue'
import { UserModule } from '@/store/modules/user'
import { AlertType } from '@/dics'
import { AiGroups } from '../helper/aiGroups'

@Component({
  name: 'DashboardAIAbility',
  components: {
    DashboardLightContainer
  }
})
export default class extends Vue {
  private alertType = AlertType
  private aiGroups = AiGroups

  private get container() {
    return 'DashboardLightContainer'
  }

  private mounted() {
    // TODO: Hardcode 300015
    if (UserModule.mainUserID === '300015') {
      this.aiGroups = [
        {
          name: '人脸识别',
          children: [4]
        }, {
          name: '人体识别',
          children: [8]
        }, {
          name: '场景识别',
          children: [10, 17]
        }
      ]
    }
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
<style lang="scss" scoped>
  .dashboard-wrap-overview__cell__list {
    span {
      margin-right: 15px;
    }
  }
</style>
