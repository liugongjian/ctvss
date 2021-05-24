<template>
  <div class="dashboard-wrap-overview__item dashboard-wrap-overview__tab-pane">
    <el-card class="dashboard-wrap-overview__item__card">
      <el-tabs v-model="activePane" @tab-click="1">
        <!-- <el-tab-pane label="网络流量统计" name="flow">
          <DashboardFlow
            v-if="activePane === 'flow'"
            :is-light="true"
            :height="34"
          />
        </el-tab-pane> -->
        <el-tab-pane label="设备接入统计" name="device">
          <DashboardDeviceChart
            v-if="activePane === 'device'"
            :is-light="true"
            :height="34"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DashboardFlow from '@/views/dashboard/components/DashboardFlow.vue'
import DashboardDeviceChart from '@/views/dashboard/components/DashboardDeviceChart.vue'

@Component({
  name: 'DashboardFlowAndDevice',
  components: {
    DashboardFlow,
    DashboardDeviceChart
  }
})
export default class extends Vue {
  private activePane = 'device'

  private get container() {
    return 'DashboardLightContainer'
  }
}
</script>

<style lang="scss" scoped>
  .dashboard-wrap-overview__tab-pane {
    .el-card {
      ::v-deep {
        .el-card__body {
          padding-top: 5px;
        }
        .el-tabs__item {
          font-weight: bold;
        }
      }
      .el-tabs {
        ::v-deep {
          .el-tabs__active-bar {
            display: none
          }
          .el-tabs__item {
            color: $text;
            cursor: default;
          }
        }
      }
    }
  }
</style>
