<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-02 10:19:02
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-07 16:29:04
 * @FilePath: /vss-user-web/src/views/DosageStatistics/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="container" class="app-container dosage-statistics">
    <el-card>
      <el-tabs v-model="activeName">
        <el-tab-pane label="设备" name="device">
          <div class="dosage-statistics__info">
            <h2 class="dosage-statistics__info_title">今日设备接入</h2>
            <div class="dosage-statistics__info_detail">
              <div class="dosage-statistics__info_detail_item">
                <p>24路</p>
                <div>接入设备总数</div>
              </div>
            </div>
          </div>
          <div class="dosage-statistics__info">
            <div class="dosage-statistics__info_chart">
              <span>设备接入详情</span>
              <div class="dosage-statistics__info_chart_condition">
                <span class="dosage-statistics__info_chart_condition__item dosage-statistics__info_chart_condition__item_active">今天</span>
                <span class="dosage-statistics__info_chart_condition__item">昨天</span>
                <span class="dosage-statistics__info_chart_condition__item">近七天</span>
                <span class="dosage-statistics__info_chart_condition__item">近一个月</span>
              </div>
            </div>
            <line-chart />
          </div>
        </el-tab-pane>
        <el-tab-pane label="带宽" name="bandwidth">带宽</el-tab-pane>
        <el-tab-pane label="存储" name="storage">存储</el-tab-pane>
        <el-tab-pane label="AI服务" name="service">AI服务</el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import LineChart from './components/LineChart.vue'
@Component({
  name: 'DosageStatistics',
  components: { LineChart }
})
export default class extends Vue {
    private activeName = 'device'
}
</script>

<style lang="scss" scoped>
.dosage-statistics {
  &__info_detail {
    padding: 10px;
    position: relative;
  }

  &__info_chart {
    margin-left: 1px;

    &_condition {
      &__item {
        display: inline-block;
        margin-left: -1px;
        border: 1px solid gray;
        padding: 0 10px;

        &_active {
          z-index: 1;
          border: 1px solid red;
        }
      }
    }
  }
}
</style>