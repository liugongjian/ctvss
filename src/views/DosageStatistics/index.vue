<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-02 10:19:02
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-28 14:51:41
 * @FilePath: /vss-user-web/src/views/DosageStatistics/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="container" class="app-container dosage-statistics">
    <el-card>
      <el-tabs v-model="activeName" @tab-click="changeTab">
        <el-tab-pane label="设备" name="device">
          <div v-if="activeName === 'device'">
            <div class="dosage-statistics__info">
              <h2 class="dosage-statistics__info_title">今日设备接入</h2>
              <div class="dosage-statistics__info_detail">
                <div class="dosage-statistics__info_detail_item">
                  <p>{{ deviceNum }}</p>
                  <div>
                    接入设备总数
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="接入详情：总设备数+在用设备数"
                      placement="top"
                    >
                      <i
                        class="el-icon-info dosage-statistics__info_detail_item_icon"
                      />
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>
            <period-line chart-kind="device" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="带宽" name="bandwidth">
          <div v-if="activeName === 'bandwidth'">
            <div class="dosage-statistics__info">
              <h2 class="dosage-statistics__info_title">今日带宽用量</h2>
              <div class="dosage-statistics__info_detail">
                <div class="dosage-statistics__info_detail_item">
                  <p>0GB</p>
                  <div>上行总流量</div>
                </div>
                <div class="dosage-statistics__info_detail_item">
                  <p>0GB</p>
                  <div>上行带宽峰值</div>
                </div>
                <div class="dosage-statistics__info_detail_item">
                  <p>0GB</p>
                  <div>下行总流量</div>
                </div>
                <div class="dosage-statistics__info_detail_item">
                  <p>0GB</p>
                  <div>下行带宽峰值</div>
                </div>
              </div>
            </div>
            <period-line chart-kind="bandwidth" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="存储" name="storage">
          <div v-if="activeName === 'storage'">
            <div class="dosage-statistics__info">
              <h2 class="dosage-statistics__info_title">今日设备接入</h2>
              <div class="dosage-statistics__info_detail">
                <div class="dosage-statistics__info_detail_item">
                  <p>{{ storage.totalStorage }} GB</p>
                  <div>当前存储量</div>
                </div>
                <div class="dosage-statistics__info_detail_item">
                  <p>{{ storage.videoStorage }} GB</p>
                  <div>视频存储量</div>
                </div>
                <div class="dosage-statistics__info_detail_item">
                  <p>{{ storage.viidStorage }} GB</p>
                  <div>视图存储量</div>
                </div>
              </div>
            </div>
            <period-line chart-kind="storage" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="AI服务" name="service">
          <div v-if="activeName === 'service'">
            <div class="dosage-statistics__info">
              <h2 class="dosage-statistics__info_title">今日设备接入</h2>
              <div class="dosage-statistics__info_detail">
                <div
                  v-for="item in volumes"
                  :key="item.type"
                  class="dosage-statistics__info_detail_item"
                >
                  <p>{{ item.value }}</p>
                  <div>{{ ResourceAiType[item.type] }}</div>
                </div>
              </div>
            </div>
            <period-line chart-kind="service" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import PeriodLine from './components/PeriodLine.vue'

import {
  getDeviceStatistics,
  getAIStatistics,
  getStorageStatistics
} from '@/api/dosageStatistics'

@Component({
  name: 'DosageStatistics',
  components: {
    PeriodLine
  }
})
export default class extends Vue {
  private activeName: any = ''

  private deviceNum = 0

  private volumes: any = {}

  private storage: any = {
    totalStorage: 0,
    videoStorage: 0,
    viidStorage: 0
  }

  private ResourceAiType = {
    'AI-100': '分钟级算力单元',
    'AI-200': '秒级算力单元',
    'AI-300': '高算力单元'
  }
  
  private tabsInfo = {
    device: {
      func: 'getDevice'
    },
    bandwidth: {
      func: 'getBandwidth'
    },
    storage: {
      func: 'getStorage'
    },
    service: {
      func: 'getService'
    }
  }

    @Watch('activeName', { immediate: true })
  private onActiveNameChange(val: string){
    if (!val) return 
    this[this.tabsInfo[val]['func']]()
  }

  mounted() {
    this.initActiveName()
  }

  private initActiveName(){
    const { tab } = this.$route.query
    this.activeName = tab ? tab : 'device'
  }

  private changeTab(){
    this.$router.push({
      query: {
        tab: this.activeName
      }
    })
  }


  private async getDevice() {
    try {
      const res = await getDeviceStatistics()
      const { deviceNum } = res
      this.deviceNum = deviceNum
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private async getService() {
    try {
      const res = await getAIStatistics()
      const { volumes } = res
      this.volumes = volumes
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private async getStorage() {
    try {
      const res = await getStorageStatistics()
      const { totalStorage, videoStorage, viidStorage } = res
      this.storage = { totalStorage, videoStorage, viidStorage }
    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private async getBandwidth(){
    console.log('等啊等')
  }
}
</script>

<style lang="scss" scoped>
.dosage-statistics {
  &__info {
    border: 1px solid $color-grey-6;
    display: inline-block;
    margin: $margin-small 0;
    border-radius: $border-radius;
    padding: $padding-primary 0;

    &_title {
      padding-left: $padding-primary;
      font-size: $text-size-large;
      margin: 0 0 $margin-medium $margin-medium;
    }

    &_detail {
      display: flex;
      justify-content: space-evenly;
      padding: 0 $padding-primary;

      &_item {
        width: 170px;
        padding: $padding-primary $padding-small;
        background-color: $color-grey-7;
        border-radius: $border-radius;
        margin: 0 $margin-medium;

        p {
          font-size: $text-size-x-large;
          font-weight: bolder;
          margin: $margin-small 0;
        }

        div {
          font-size: $text-size-medium;
          color: $color-grey-3;
        }

        &_icon {
          font-size: $text-size-large;
          vertical-align: top;
          cursor: pointer;
        }
      }
    }
  }

  // &__info_chart {
  //   &_condition {
  //     &__item {
  //       display: inline-block;
  //       margin-right: -1px;
  //       border: 1px solid gray;
  //       padding: 0 10px;

  //       &_active {
  //         z-index: 1;
  //         border: 1px solid red;
  //         position: relative;
  //       }
  //     }
  //   }
  // }

  ::v-deep &__chart {
    border: 1px solid $color-grey-6;
    padding: $padding-primary;
    margin-top: $margin-medium;

    &_period {
      display: flex;

      &_select {
        margin-right: 20px;
      }

      &_condition {
        margin-left: auto;
      }
    }
  }
}
</style>
