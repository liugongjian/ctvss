<template>
  <DashboardContainer title="网络流量统计">
    <template v-slot:header>
      <el-select
        v-model="userType"
        size="small"
        @change="flowTypeChange"
      >
        <el-option
          v-for="time in timeList"
          :key="time.value"
          :label="time.label"
          :value="time.value"
        />
      </el-select>
    </template>
    <div id="flow-container" />
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import DashboardContainer from './DashboardContainer.vue'
import { getFlowData } from '@/api/dashboard'

@Component({
  name: 'DashboardDevice',
  components: { DashboardContainer }
})
export default class extends Vue {
  private timeList: Array<{ label: string; value: string }> = [
    {
      label: '最近12小时',
      value: '12'
    },
    {
      label: '最近6小时',
      value: '6'
    },
    {
      label: '最近3小时',
      value: '3'
    }
  ];
  private flowData = [];
  private userType = '12';
  private async created() {
    this.drawChart()
  }
  private flowTypeChange() {}
  private async drawChart() {
    const res = await getFlowData({})
    this.flowData = res
    const chart = new Chart({
      container: 'flow-container',
      autoFit: true,
      height: 300
    })
    chart.data(this.flowData)
    chart.scale({
      time: {
        range: [0, 1]
      },
      value: {
        nice: true
      }
    })

    chart.tooltip({
      showCrosshairs: true,
      shared: true
    })

    chart.legend({
      offsetY: 10,
      itemSpacing: 30,
      items: [
        {
          id: '1',
          name: 'OutFlow',
          value: '出网流量',
          marker: {
            symbol: 'square',
            style: {
              fill: '#F4C46C'
            },
            spacing: 5
          }
        },
        {
          id: '2',
          name: 'InFlow',
          value: '入网流量',
          marker: {
            symbol: 'square',
            style: {
              fill: '#6F9FC9'
            },
            spacing: 5
          }
        }
      ],
      itemName: {
        style: {
          fill: '#eeeeee'
          // fontSize: 14
        },
        formatter: (text, item) => item.value
      }
    })

    chart.axis('value', {
      label: {
        formatter: (val) => {
          return val
        }
      },
      title: {
        style: {
          fill: '#98CFFF',
          fontSize: 14
        }
      },
      grid: {
        line: {
          style: {
            stroke: '#434659'
          }
        }
      }
    })
    chart.scale('value', {
      alias: 'Mbps'
    })

    chart.line().position('time*value').color('type', ['#6F9FC9', '#F4C46C']).shape('smooth')

    // chart.point().position('time*value').color('type', ['#6F9FC9', '#F4C46C']).shape('circle')

    chart.render()
  }
}
</script>
<style lang="scss" scoped>
</style>
