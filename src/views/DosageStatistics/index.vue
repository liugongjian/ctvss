<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-02 10:19:02
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-02 15:37:12
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
              <div>
                <line-chart />
              </div>
            </div>
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
}
</style>