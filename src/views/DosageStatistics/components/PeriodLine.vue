<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-09 15:23:42
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-10 16:13:10
 * @FilePath: /vss-user-web/src/views/DosageStatistics/components/periodLine.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="dosage-statistics__chart">
    <div class="dosage-statistics__chart_period">
      <span>{{ chartTitle }}</span>
      <el-radio-group v-model="currentPeriod" size="mini" class="dosage-statistics__chart_period_radio">
        <el-radio-button v-for="item in periods" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="dosage-statistics__chart_content">
      <line-chart :chart-title="chartTitle" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import LineChart from './LineChart.vue'
import { periods } from '@/dics/dosageStatistics'


@Component({
  name: 'PeriodLine',
  components: { LineChart }
})

export default class extends Vue {

  @Prop() private chartTitle!: string

  private periods = periods
  private currentPeriod = 'today'

  mounted () {
    console.log('chartTitle=-===>', this.chartTitle)
  }

}
</script>
