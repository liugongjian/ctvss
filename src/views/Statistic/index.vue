<template>
  <el-card>
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane label="设备统计" name="first">
        <div class="statistic-box">
          设备统计
          <el-row>
            <el-col :span="7">
              <div class="statistic-box__content">
                <p class="statistic-box__content__title">设备在线数<span>(在线/总数)</span></p>
                <p class="statistic-box__content__number"><span>3834</span>/23834</p>
              </div>
              <div id="chart1" class="statistic-box__chart" />
            </el-col>
            <el-col :span="7">
              <div class="statistic-box__content">
                <p class="statistic-box__content__title">设备在线数<span>(在线/总数)</span></p>
                <p class="statistic-box__content__number"><span>3834</span>/23834</p>
              </div>
              <div id="chart2" class="statistic-box__chart" />
            </el-col>
            <el-col :span="7">
              <div class="statistic-box__content">
                <p class="statistic-box__content__title">设备在线数<span>(在线/总数)</span></p>
                <p class="statistic-box__content__number"><span>3834</span>/23834</p>
              </div>
              <div id="chart3" class="statistic-box__chart" />
            </el-col>
          </el-row>
        </div>
        <el-table
          :data="tableData"
          style="width: 100%;"
        >
          <el-table-column
            prop="dir"
            label="所属目录"
            width="180"
          />
          <el-table-column
            prop="name"
            label="设备名称"
            width="180"
          />
          <el-table-column
            prop="gbId"
            label="国标ID"
          />
          <el-table-column
            prop="deviceId"
            label="设备ID"
          />
          <el-table-column
            prop="ip"
            label="ip"
          />
          <el-table-column
            prop="status"
            label="设备状态"
          >
            <span>{{ status || '-' }}</span>
          </el-table-column>
          <el-table-column
            prop="status"
            label="流状态"
          >
            <span>{{ status || '-' }}</span>
          </el-table-column>
          <el-table-column
            prop="status"
            label="录制状态"
          >
            <span>{{ status || '-' }}</span>
          </el-table-column>
          <el-table-column
            prop="ip"
            label="经度"
          />
          <el-table-column
            prop="ip"
            label="纬度"
          />
          <el-table-column
            prop="time"
            label="创建时间"
          />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
@Component({
  name: 'Statistic'
})
export default class extends Vue {
  private activeName: string = 'first'
  private chart: any = {}

  private tableData = []

  mounted() {
    this.drawChart()
  }

  private drawChart() {
    const data = [{ name: '在线', value: 80 }, { name: '离线', value: 20 }]

    this.chart = new Chart({
      container: 'chart1',
      width: 160,
      height: 160,
      autoFit: true,
      padding: 0
    })

    this.chart.data(data)

    this.chart.scale('value', {
      formatter: (val: number) => {
        const temp = val / 100 + '%'
        return temp
      }
    })

    this.chart.coordinate('theta', {
      radius: 0.95,
      innerRadius: 0.65
    })

    this.chart.legend(false)
    this.chart.tooltip(false)

    this.chart
      .annotation()
      .text({
        position: ['50%', '50%'],
        content: '在线率',
        style: {
          fontSize: 12,
          fill: '#8c8c8c',
          textAlign: 'center'
        },
        offsetY: -5
      })
      .text({
        position: ['50%', '50%'],
        content: `${data[0].value / 100}%`,
        style: {
          fontSize: 12,
          fill: '#8c8c8c',
          textAlign: 'center'
        },
        offsetX: 0,
        offsetY: 8
      })

    this.chart
      .interval()
      .adjust('stack')
      .position('value')
      .color('name', ['#FF9B1A', '#D1D1D1'])

    this.chart.render()
  }
}
</script>

<style lang="scss" scoped>
.statistic-box {
  ::v-deep .el-row {
    padding: 10px 0;

    .el-col {
      display: flex;
      border: 1px solid #d3d3d3;
      margin: calc((100% - 29.1667%*3)/6);
      padding: 10px 0;
    }
  }

  &__content {
    width: 200px;

    &__title {
      font-size: 12px;
      color: #a1a1a1;
      padding-left: 20px;

      span {
        color: #d3d3d3;
      }
    }

    &__number {
      padding-left: 20px;
      color: #0f0f0f;
      font-size: 16px;

      span {
        color: #9bcc56;
      }
    }
  }

  &__chart {
    // height: 200px;
  }
}
</style>
