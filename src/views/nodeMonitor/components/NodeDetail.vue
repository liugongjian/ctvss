<template>
  <div class="node-detail">
    <div class="node-detail__header">
      <span class="node-detail__name">A-CENTOS-001</span>
      <span class="node-detail__external"><el-link type="primary">查看详情</el-link></span>
      <span
        class="node-detail__close"
        @click="closeNodeDetail()"
      ><i class="el-icon-close" /></span>
    </div>
    <el-tabs
      class="node-detail__tabs"
      type="card"
    >
      <el-tab-pane
        label="System"
        :lazy="true"
      >
        <el-collapse v-model="collapseList">
          <el-collapse-item
            title="System Load Average"
            name="1"
          >
            <div class="iframe-wrap">
              <iframe
                src="http://36.112.128.103:3000/d-solo/vTKBScuZz/streaminfo?orgId=2&var-streamName=lss.livepush.kijazz.cn%2Fa1%2Fs1&from=1584087514852&to=1584087814852&nsukey=Lbqjvypy8h2TFrLu%2FC1lJ9QG1kiHTVD9j4i4%2F4gC1gJHLF3BRmFk1%2BFrCAXmWf1kNdwr%2B5upfkAJHp42go09pGXYPXH4KI3If9DnXKQbvr48qA7rZ7MjeQM8r9IGvjRFz8lEqTlWPYy1Bgji7Cfw%2BWxnFSJhjsxAeeMYhtxrsqY%3D&panelId=2&theme=light"
                frameborder="0"
              />
            </div>
          </el-collapse-item>
          <el-collapse-item
            title="Total CPU Utilization"
            name="2"
          >
            <div class="iframe-wrap">
              <iframe
                src="http://36.112.128.103:3000/d-solo/vTKBScuZz/streaminfo?orgId=2&var-streamName=lss.livepush.kijazz.cn%2Fa1%2Fs1&from=1584087514852&to=1584087814852&nsukey=Lbqjvypy8h2TFrLu%2FC1lJ9QG1kiHTVD9j4i4%2F4gC1gJHLF3BRmFk1%2BFrCAXmWf1kNdwr%2B5upfkAJHp42go09pGXYPXH4KI3If9DnXKQbvr48qA7rZ7MjeQM8r9IGvjRFz8lEqTlWPYy1Bgji7Cfw%2BWxnFSJhjsxAeeMYhtxrsqY%3D&panelId=2&theme=light"
                frameborder="0"
              />
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
      <el-tab-pane
        label="Services"
        :lazy="true"
      >
        <el-tabs class="node-detail__service-tabs">
          <el-tab-pane
            label="SRS"
            :lazy="true"
          >
            <el-collapse v-model="collapseList">
              <el-collapse-item
                title="System Load Average"
                name="1"
              >
                <div class="iframe-wrap">
                  <iframe
                    src="http://36.112.128.103:3000/d-solo/vTKBScuZz/streaminfo?orgId=2&var-streamName=lss.livepush.kijazz.cn%2Fa1%2Fs1&from=1584087514852&to=1584087814852&nsukey=Lbqjvypy8h2TFrLu%2FC1lJ9QG1kiHTVD9j4i4%2F4gC1gJHLF3BRmFk1%2BFrCAXmWf1kNdwr%2B5upfkAJHp42go09pGXYPXH4KI3If9DnXKQbvr48qA7rZ7MjeQM8r9IGvjRFz8lEqTlWPYy1Bgji7Cfw%2BWxnFSJhjsxAeeMYhtxrsqY%3D&panelId=2&theme=light"
                    frameborder="0"
                  />
                </div>
              </el-collapse-item>
              <el-collapse-item
                title="Total CPU Utilization"
                name="2"
              >
                <div class="iframe-wrap">
                  <iframe
                    src="http://36.112.128.103:3000/d-solo/vTKBScuZz/streaminfo?orgId=2&var-streamName=lss.livepush.kijazz.cn%2Fa1%2Fs1&from=1584087514852&to=1584087814852&nsukey=Lbqjvypy8h2TFrLu%2FC1lJ9QG1kiHTVD9j4i4%2F4gC1gJHLF3BRmFk1%2BFrCAXmWf1kNdwr%2B5upfkAJHp42go09pGXYPXH4KI3If9DnXKQbvr48qA7rZ7MjeQM8r9IGvjRFz8lEqTlWPYy1Bgji7Cfw%2BWxnFSJhjsxAeeMYhtxrsqY%3D&panelId=2&theme=light"
                    frameborder="0"
                  />
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>
          <el-tab-pane
            label="Agent"
            :lazy="true"
          >
            <el-collapse v-model="collapseList">
              <el-collapse-item
                title="System Load Average"
                name="1"
              >
                <div class="iframe-wrap">
                  <iframe
                    src="http://36.112.128.103:3000/d-solo/vTKBScuZz/streaminfo?orgId=2&var-streamName=lss.livepush.kijazz.cn%2Fa1%2Fs1&from=1584087514852&to=1584087814852&nsukey=Lbqjvypy8h2TFrLu%2FC1lJ9QG1kiHTVD9j4i4%2F4gC1gJHLF3BRmFk1%2BFrCAXmWf1kNdwr%2B5upfkAJHp42go09pGXYPXH4KI3If9DnXKQbvr48qA7rZ7MjeQM8r9IGvjRFz8lEqTlWPYy1Bgji7Cfw%2BWxnFSJhjsxAeeMYhtxrsqY%3D&panelId=2&theme=light"
                    frameborder="0"
                  />
                </div>
              </el-collapse-item>
              <el-collapse-item
                title="Total CPU Utilization"
                name="2"
              >
                <div class="iframe-wrap">
                  <iframe
                    src="http://36.112.128.103:3000/d-solo/vTKBScuZz/streaminfo?orgId=2&var-streamName=lss.livepush.kijazz.cn%2Fa1%2Fs1&from=1584087514852&to=1584087814852&nsukey=Lbqjvypy8h2TFrLu%2FC1lJ9QG1kiHTVD9j4i4%2F4gC1gJHLF3BRmFk1%2BFrCAXmWf1kNdwr%2B5upfkAJHp42go09pGXYPXH4KI3If9DnXKQbvr48qA7rZ7MjeQM8r9IGvjRFz8lEqTlWPYy1Bgji7Cfw%2BWxnFSJhjsxAeeMYhtxrsqY%3D&panelId=2&theme=light"
                    frameborder="0"
                  />
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>
          <el-tab-pane
            label="FFmpeg"
            :lazy="true"
          >
            FFmpeg
          </el-tab-pane>
          <el-tab-pane
            label="DVR"
            :lazy="true"
          >
            DVR
          </el-tab-pane>
          <el-tab-pane
            label="Agent2"
            :lazy="true"
          >
            Agent
          </el-tab-pane>
          <el-tab-pane
            label="FFmpeg2"
            :lazy="true"
          >
            FFmpeg
          </el-tab-pane>
          <el-tab-pane
            label="DVR2"
            :lazy="true"
          >
            DVR
          </el-tab-pane>
          <el-tab-pane
            label="Agent3"
            :lazy="true"
          >
            Agent
          </el-tab-pane>
          <el-tab-pane
            label="FFmpeg3"
            :lazy="true"
          >
            FFmpeg
          </el-tab-pane>
          <el-tab-pane
            label="DVR3"
            :lazy="true"
          >
            DVR
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
      <el-tab-pane
        label="Alarms"
        :lazy="true"
      >
        <span slot="label">
          Alarms
          <div class="badge badge--critical">2</div>
          <div class="badge badge--warning">2</div>
        </span>
        <el-tabs class="node-detail__service-tabs">
          <el-tab-pane label="CRITICAL">
            <el-collapse v-model="collapseList">
              <el-collapse-item
                title="CPUUsageAlert"
                name="1"
              >
                <div class="alert-chart">
                  <div class="alert-chart__row">
                    <div class="alert-chart__row__label">
                      开始时间
                    </div>
                    <div class="alert-chart__row__content">
                      2020-03-05 10:13:25
                    </div>
                  </div>
                  <div class="alert-chart__row">
                    <div class="alert-chart__row__label">
                      Summary
                    </div>
                    <div class="alert-chart__row__content">
                      Instance SH CPU usage high
                    </div>
                  </div>
                  <div class="alert-chart__row">
                    <div class="alert-chart__row__label">
                      Description
                    </div>
                    <div class="alert-chart__row__content">
                      SH CPU usage above 85% (current value: 6.591451266666667)
                    </div>
                  </div>
                  <div class="alert-chart__row">
                    <div class="alert-chart__row__label">
                      Graph
                    </div>
                    <div class="alert-chart__row__content">
                      <div class="iframe-wrap">
                        <iframe
                          src="http://36.112.128.103:3000/d-solo/vTKBScuZz/streaminfo?orgId=2&var-streamName=lss.livepush.kijazz.cn%2Fa1%2Fs1&from=1584087514852&to=1584087814852&nsukey=Lbqjvypy8h2TFrLu%2FC1lJ9QG1kiHTVD9j4i4%2F4gC1gJHLF3BRmFk1%2BFrCAXmWf1kNdwr%2B5upfkAJHp42go09pGXYPXH4KI3If9DnXKQbvr48qA7rZ7MjeQM8r9IGvjRFz8lEqTlWPYy1Bgji7Cfw%2BWxnFSJhjsxAeeMYhtxrsqY%3D&panelId=2&theme=light"
                          frameborder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
              <el-collapse-item
                title="RAMUsageAlert"
                name="2"
              >
                <div class="alert-chart">
                  <div class="alert-chart__row">
                    <div class="alert-chart__row__label">
                      开始时间
                    </div>
                    <div class="alert-chart__row__content">
                      2020-03-05 10:13:25
                    </div>
                  </div>
                  <div class="alert-chart__row">
                    <div class="alert-chart__row__label">
                      Summary
                    </div>
                    <div class="alert-chart__row__content">
                      Instance SH CPU usage high
                    </div>
                  </div>
                  <div class="alert-chart__row">
                    <div class="alert-chart__row__label">
                      Description
                    </div>
                    <div class="alert-chart__row__content">
                      SH CPU usage above 85% (current value: 6.591451266666667)
                    </div>
                  </div>
                  <div class="alert-chart__row">
                    <div class="alert-chart__row__label">
                      Graph
                    </div>
                    <div class="alert-chart__row__content">
                      <div class="iframe-wrap">
                        <iframe
                          src="http://36.112.128.103:3000/d-solo/vTKBScuZz/streaminfo?orgId=2&var-streamName=lss.livepush.kijazz.cn%2Fa1%2Fs1&from=1584087514852&to=1584087814852&nsukey=Lbqjvypy8h2TFrLu%2FC1lJ9QG1kiHTVD9j4i4%2F4gC1gJHLF3BRmFk1%2BFrCAXmWf1kNdwr%2B5upfkAJHp42go09pGXYPXH4KI3If9DnXKQbvr48qA7rZ7MjeQM8r9IGvjRFz8lEqTlWPYy1Bgji7Cfw%2BWxnFSJhjsxAeeMYhtxrsqY%3D&panelId=2&theme=light"
                          frameborder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>
          <el-tab-pane label="WARNING">
            DVR
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'NodeDetail'
})
export default class extends Vue {
  private collapseList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  private closeNodeDetail() {
    this.$emit('close')
  }
}
</script>

<style lang="scss" scoped>
  .node-detail {

    .iframe-wrap {
      position: relative;
      overflow: hidden;
      height: 200px;
    }
    iframe {
      position: relative;
      top: -24px;
      width: 100%;
      height: 224px;
    }

    .badge {
      border-radius: 100%;
      display: inline-block;
      width: 20px;
      height: 20px;
      color: #fff;
      text-align: center;
      font-size: 12px;
      line-height: 18px;
      margin-left: 5px;
    }
    .badge--critical {
      background: $red;
    }
    .badge--warning {
      background: $yellow;
    }

    &__header {
      position: relative;
      padding: 24px 16px;
    }
    &__close {
      position: absolute;
      right: 16px;
      top: 17px;
      font-size: 24px;
      cursor: pointer;
    }
    &__name {
      font-weight: bold;
    }
    &__external {
      margin-left: 16px;
      vertical-align: bottom;
    }
    &__tabs {
      > ::v-deep .el-tabs__header {
        padding-left: 16px;

        .el-tabs__item {
          background: #f1f1f1;
        }
        .el-tabs__item.is-active {
          background: #fff;
        }
      }
      > ::v-deep .el-tabs__content {
        padding: 0 16px;
      }
      ::v-deep .el-collapse {
        border: none;
      }
      ::v-deep .el-collapse-item:last-child {
        margin-bottom: 0;
      }
      ::v-deep .el-collapse-item__header {
        position: relative;
        padding-left: 20px;
        font-weight: bold;
      }
      ::v-deep .el-collapse-item__arrow {
        position: absolute;
        left: 0;
      }
      ::v-deep .el-collapse-item__wrap {
        border: none;
      }
    }
    &__service-tabs {
      ::v-deep .el-tabs__nav-next, ::v-deep .el-tabs__nav-prev {
        top: -2px;
      }
    }

    .alert-chart {
      &__row {
        display: flex;
        align-items: center;
        line-height: 150%;;
        &__label {
          width: 120px;
          text-align: center;
          padding: 12px;
        }
        &__content {
          flex: 1;
          border-left: 2px solid #fff;
          padding: 12px;
        }
      }
      &__row:nth-child(odd) {
        background: #f1f1f1;
      }
    }
  }
</style>
