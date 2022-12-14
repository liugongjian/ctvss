<template>
  <div class="detail__section">
    <div class="detail__title">设备录像统计</div>
    <el-date-picker
      v-model="currentDate"
      size="mini"
      type="month"
      placeholder="选择月"
      :picker-options="pickerOptions"
    />
    <div class="statistics-container">
      <div class="statistics-container__left">
        <div class="statistics-container__left__content">
          <p class="statistics-container__label">
            <span>录制天数</span>
          </p>
          <p class="statistics-container__label">
            <span class="statistics-container__num--light">{{ recordActive }}</span>
            <span class="statistics-container__num"> / {{ recordTotal }}</span>
          </p>
        </div>
      </div>
      <div class="statistics-container__right">
        <div id="chartContainer" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { getDeviceRecordStatistic } from '@/api/device'
import { Chart } from '@antv/g2'

@Component({
  name: 'RecordStatistics'
})
export default class extends Vue {
  @Prop({ default: '' })
  private deviceId

  @Prop({ default: '' })
  private inProtocol

  private currentDate: any = new Date((new Date() as any).getYear() + 1900, new Date().getMonth(), 0, 24)
  private recordActive = 0
  private chart = null
  private pickerOptions = {
    disabledDate(time) {
      const timedDelta = new Date().getTime() - time.getTime()
      return timedDelta > 366 * 24 * 60 * 60 * 1000 || timedDelta < 0
    }
  }

  private get recordTotal() {
    return new Date(this.currentDate.getYear(), this.currentDate.getMonth() + 1, 0).getDate()
  }

  @Watch('currentDate', { immediate: true })
  private async currentDateChange(val) {
    const res = await getDeviceRecordStatistic({
      deviceId: this.deviceId,
      inProtocol: this.inProtocol,
      type: 'cloud',
      startTime: Math.floor(this.currentDate.getTime() / 1000),
      endTime: Math.floor(new Date(this.currentDate.getYear() + 1900, this.currentDate.getMonth() + 1, 0, 24).getTime() / 1000)
    })
    this.recordActive = (res.records && res.records.length) || 0
    document.getElementById('chartContainer').innerHTML = ''
    this.drawChat()
  }

  private mounted() {
    this.drawChat()
  }

  private getMonthData() {
    return new Date((new Date() as any).getYear() + 1900, new Date().getMonth(), 0, 24)
  }

  private drawChat() {
    const data = [
      { type: '录制天数', value: this.recordActive },
      { type: '无录制天数', value: this.recordTotal - this.recordActive }
    ]
    this.chart = new Chart({
      container: 'chartContainer',
      autoFit: true,
      height: 170
    })
    this.chart.data(data)
    this.chart.legend(false)
    this.chart.tooltip({
      showMarkers: false
    })
    this.chart.coordinate('theta', {
      radius: 0.9,
      innerRadius: 0.6
    })
    this.chart
      .interval()
      .adjust('stack')
      .position('value')
      .color('type', ['#fa8334', '#eceef1'])

    this.chart.tooltip({
      showTitle: false,
      showMarkers: false,
      customItems: (items) => {
        return [...items].map(item => {
          return {
            ...item,
            value: item.value + '天'
          }
        })
      }
    })

    this.chart.annotation().text({
      position: ['50%', '50%'],
      content: '录制比例',
      style: {
        fontSize: 12,
        fill: '#8c8c8c',
        fontWeight: 300,
        textBaseline: 'bottom',
        textAlign: 'center'
      },
      offsetY: -12
    })

    this.chart.annotation().text({
      position: ['50%', '50%'],
      content: (100 * data[0].value / (data[0].value + data[1].value)).toFixed(1) + '%',
      style: {
        fontSize: 18,
        fill: '#000',
        fontWeight: 500,
        textAlign: 'center'
      },
      offsetY: 10
    })

    this.chart.interaction('cursor')
    this.chart.render()
  }
}
</script>
<style lang="scss" scoped>
.statistics-container {
  display: flex;
  flex-direction: row;
  width: 350px;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  padding: 8px;
  margin-top: 10px;

  &__left {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    &__content {
      display: flex;
      flex-direction: column;
    }
  }

  &__right {
    flex: 1;
  }

  &__label {
    margin: 8px 0;
  }

  &__num {
    font-size: 24px;
  }

  &__num--light {
    font-size: 24px;
    color: #70b603;
  }
}
</style>
