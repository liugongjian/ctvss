<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2022-12-05 10:30:47
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-14 19:21:05
 * @FilePath: /vss-user-web/src/views/Dashboard/components/DashboardFlowAndDevice.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
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
            chart-name="device"
          />
        </el-tab-pane>
        <el-tab-pane label="带宽使用统计" name="bandwidth">
          <DashboardDeviceChart
            v-if="activePane === 'bandwidth'"
            :is-light="true"
            :height="34"
            chart-name="bandwidth"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DashboardFlow from '@/views/Dashboard/components/DashboardFlow.vue'
import DashboardDeviceChart from '@/views/Dashboard/components/DashboardDeviceChart.vue'

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
            // display: none;
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
