<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-02 10:19:02
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-09 20:47:13
 * @FilePath: /vss-user-web/src/views/DosageStatistics/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="container" class="app-container dosage-statistics">
    <el-card>
      <el-tabs v-model="activeName">
        <el-tab-pane label="设备" name="device">
          <div v-if="activeName === 'device'">
            <div class="dosage-statistics__info">
              <h2 class="dosage-statistics__info_title">今日设备接入</h2>
              <div class="dosage-statistics__info_detail">
                <div class="dosage-statistics__info_detail_item">
                  <p>24路</p>
                  <div>
                    接入设备总数 
                    <el-tooltip class="item" effect="dark" content="接入详情：总设备数+在用设备数" placement="top">
                      <i class="el-icon-info dosage-statistics__info_detail_item_icon" />
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>
            <period-line chart-title="设备接入详情" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="带宽" name="bandwidth">
          <div v-if="activeName === 'bandwidth'">
            <div class="dosage-statistics__info">
              <h2 class="dosage-statistics__info_title">今日带宽用量</h2>
              <div class="dosage-statistics__info_detail">
                <div class="dosage-statistics__info_detail_item">
                  <p>24路</p>
                  <div>
                    接入设备总数
                  </div>
                </div>
              </div>
            </div>
            <period-line chart-title="带宽用量详情" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="存储" name="storage">
          <div v-if="activeName === 'storage'">
            <div class="dosage-statistics__info">
              <h2 class="dosage-statistics__info_title">今日设备接入</h2>
              <div class="dosage-statistics__info_detail">
                <div class="dosage-statistics__info_detail_item">
                  <p>24路</p>
                  <div>
                    接入设备总数 
                    <el-tooltip class="item" effect="dark" content="接入详情：总设备数+在用设备数" placement="top">
                      <i class="el-icon-info dosage-statistics__info_detail_item_icon" />
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>
            <period-line chart-title="存储用量详情" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="AI服务" name="service">
          <div v-if="activeName === 'service'">
            <div class="dosage-statistics__info">
              <h2 class="dosage-statistics__info_title">今日设备接入</h2>
              <div class="dosage-statistics__info_detail">
                <div class="dosage-statistics__info_detail_item">
                  <p>24路</p>
                  <div>
                    接入设备总数
                  </div>
                </div>
              </div>
            </div>
            <period-line chart-title="AI服务用量详情" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import PeriodLine from './components/PeriodLine.vue'


@Component({
  name: 'DosageStatistics',
  components: { PeriodLine }
})
export default class extends Vue {
    private activeName = 'device'
}
</script>

<style lang="scss" scoped>
.dosage-statistics {
  &__info {
    border: 1px solid $color-grey-6;
    width: 260px;
    margin: 10px 0;

    &_title {
      padding-left: 20px;
      font-size: 16px;
    }

    &_detail {
      width: 200px;
      margin: 10px auto;
      padding: 20px 10px;
      background-color: $color-grey-6;

      &_item {
        padding: 0  20px;

        p {
          font-size: 20px;
          font-weight: bolder;
          margin: 10px 0;
        }

        div {
          font-size: 14px;
          color: $color-grey-3;
        }

        &_icon {
          font-size: 18px;
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
    padding: 20px;

    &_period {
      display: flex;

      &_radio {
        margin-left: auto;
      }
    }

    &_content {

    }
  }
}
</style>