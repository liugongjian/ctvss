<template>
  <component :is="container" title="AI分析">
    <!-- <template slot="header">
      <el-button type="primary" class="dash-btn" @click="$router.push('/dashboard/visualization-dashboard')">可视化大屏</el-button>
    </template> -->
    <div v-if="checkPermission(['ivs:GetApp'])">
      <div id="pieAI" />
    </div>
  </component>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardMixin from '../mixin/DashboardMixin'
import DashboardLightContainer from './DashboardLightContainer.vue'
import { getDeviceStates } from '@/api/dashboard'
import { Chart, Util } from '@antv/g2'

@Component({
  name: 'DashboardAIAnalysis',
  components: {
    DashboardLightContainer
  }
})
export default class extends Mixins(DashboardMixin) {

  private pieAI: any = null

  private currentPieChart: any = {}

  private get container() {
    return 'DashboardLightContainer'
  }

  private mounted() {
    this.getData()
  }

  private getData() {
    this.getDevice()
  }

   private async getDevice() {
    try {
      const res = await getDeviceStates()
      const { video, viid } = res

      this.pieDataVideo = this.formatDeviceData(video, 'video')

      this.drawPieToday('pieAI', 'pieAI', this.pieDataVideo)

      const { enable, sum } = viid

      if (enable === 1 && Number(sum) !== 0) {
        this.ifShowViidPie = true
        this.$nextTick(() => {
          this.pieDataViid = this.formatDeviceData(viid, 'viid')
          this.drawPieToday('pieViidToday', 'pieViidToday', this.pieDataViid)
        })
      }

      this.$nextTick(()=>{
        this.chartHandle()
      })

    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

   private drawPieToday(container, chartDom, data) {
    this.currentPieChart[chartDom] && this.currentPieChart[chartDom].destroy()

    this[chartDom] = new Chart({
      container,
      autoFit: true,
      width: 700,
      height: 260
    })

    this[chartDom].scale('percent', {
      formatter: (val) => {
        val = val * 100 + '%'
        return val
      }
    })

    this[chartDom].coordinate('theta', {
      radius: 0.5,
      innerRadius: 0.6
    })

    this[chartDom].data(data)

    this[chartDom].tooltip({
      showTitle: false,
      showMarkers: false,
      itemTpl:
        '<li class="g2-tooltip-list-item"><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
    })

    this[chartDom]
      .interval()
      .adjust('stack')
      .position('percent')
      .color('item', ['#36A1FF', '#41CBCB', '#56CB77', '#FBD44B'])
      .style({ opacity: 0.4 })
      .state({
        active: {
          style: (element) => {
            const shape = element.shape
            return {
              matrix: Util.zoom(shape, 1.1)
            }
          }
        }
      })
      .label('percent', () => {
        return {
          style: {
            fontSize: 12,
            fontWeight: 'bold',
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)'
          },
          layout: [
            { percent: 'pie-spider' },
            {
              percent: 'limit-in-plot',
              cfg: { action: 'translate' }
            }
          ],
          labelHeight: 20,
          labelLine: {
            style: {
              lineWidth: 0.5
            }
          },
          content: (data) => {
            return `${this.pieTodayToText[data.item]}:${data.value}`
          }
        }
      })
      .tooltip('item*percent*value', (item, percent, value) => {
        percent = (percent * 100).toFixed(2) + '%'
        return {
          name: this.pieTodayToText[item],
          value: value
        }
      })

    this[chartDom].legend(false)

    this[chartDom].interaction('element-single-selected')

    this[chartDom].render()

    this.currentPieChart[chartDom] = this[chartDom]
  }

  public goRouter(type: any) {
    const params: any = {
      path: '/dashboard/ai',
      query: {
        type,
        isLight: true
      }
    }
    this.$router.push(params)
  }

   private formatDeviceData(res, kind) {
    const {
      offline = 0,
      online = 0,
      sum = 0,
      unregistered = 0,
      deactivate = 0
    } = res

    let data = {}

    if (kind === 'viid') {
      data = {
        offline,
        online,
        deactivate
      }
    } else {
      data = {
        offline,
        online,
        deactivate,
        unregistered
      }
    }

    const result = Object.keys(data).map((item) => ({
      item: item,
      value: data[item],
      percent: data[item] / sum,
      text: ''
    }))

    return result
  }

  private chartHandle() {
    // const init = document.createEvent('Event')
    // init.initEvent('resize', true, true)
    // window.dispatchEvent(init)

    this.$nextTick(() => {
      const event = new Event('resize')
      window.dispatchEvent(event)
    })
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
