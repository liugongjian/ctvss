<template>
  <component :is="container" title="AI能力">
    <template slot="header">
      <el-button type="primary" class="dash-btn" @click="$router.push('/dashboard/visualization-dashboard')">可视化大屏</el-button>
    </template>
    <div v-if="checkPermission(['ivs:GetApp'])">
      <div v-for="item in aiInfos" :key="item.name">
        <p class="dashboard-wrap-overview__cell__head">{{ item.name }}</p>
        <div class="dashboard-wrap-overview__cell__list">
          <span v-for="app in item.apps.slice(0,5)" :key="app.id">
            <el-button size="medium" type="text" @click="goToApp(app.id)">{{ app.name }}</el-button>
          </span>
          <span v-if="item.apps.length > 5">
            <el-button class="dashboard-wrap-overview__cell__list__more-text" size="medium" type="text">...</el-button>
          </span>
        </div>
      </div>
      <div>
        <el-button class="applist-btn" size="medium" type="text" @click="$router.push({name: 'AIAppList'})">
          查看全部<svg-icon name="arrow-right" />
        </el-button>
      </div>
    </div>
  </component>
</template>

<script lang="ts">
import { AlertType } from '@/dics'
import { UserModule } from '@/store/modules/user'
import { Component, Mixins } from 'vue-property-decorator'
import { AiGroups } from '../helper/aiGroups'
import DashboardMixin from '../mixin/DashboardMixin'
import DashboardLightContainer from './DashboardLightContainer.vue'

@Component({
  name: 'DashboardAIAbility',
  components: {
    DashboardLightContainer
  }
})
export default class extends Mixins(DashboardMixin) {
  private alertType = AlertType
  private aiGroups = AiGroups
  private aiInfos = []

  private get container() {
    return 'DashboardLightContainer'
  }

  private async mounted() {
    this.aiInfos = await this.getAiApps()
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

  public goRouter(type: any) {
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

    &__more-text {
      cursor: none;
    }
  }

  .applist-btn {
    float: right;
    margin-top: -20px;

    span {
      svg {
        margin-left: 5px;
      }
    }
  }
</style>
