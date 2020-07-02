<template>
  <div
    class="app-container"
    :class="[selectedNode ? `expanded ${containerClass}` : '']"
  >
    <div class="app-container__main">
      <div class="filter-bar clearfix">
        <el-form
          :inline="true"
          :model="filter"
        >
          <el-form-item label="区域">
            <el-select v-model="filter.region">
              <el-option
                label="广州"
                value="guanghzou"
              />
              <el-option
                label="上海"
                value="shanghai"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-select v-model="filter.order">
              <el-option
                label="按主机名"
                value="host"
              />
            </el-select>
          </el-form-item>
          <div class="pull-right">
            <el-form-item>
              <el-input
                v-model="filter.keyword"
                placeholder="搜索关键词"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary">
                搜索
              </el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>

      <div class="region-summary">
        <div class="region-summary__item">
          Total: <span class="region-summary__item--default">11 Nodes</span>
        </div>
        <div class="region-summary__item">
          Unreachable: <span class="region-summary__item--default">1</span>
        </div>
        <div class="region-summary__item">
          Critical: <span class="region-summary__item--critical">2</span>
        </div>
        <div class="region-summary__item">
          Warning: <span class="region-summary__item--warning">3</span>
        </div>
      </div>

      <div class="node-list">
        <div class="node-list__item node-list__item">
          <div
            class="node-list__item__box"
            @click="selectNode()"
          >
            <div class="node-list__item__header">
              <div class="node-list__item__title">
                A-CENTOS-003
              </div>
              <div class="node-list__item__bandwidth">
                <div class="node-list__item__bandwidth--up">
                  ↑ 500.22Mbps
                </div>
                <div class="node-list__item__bandwidth--down">
                  ↓ 5200.22Mbps
                </div>
              </div>
            </div>
            <div class="node-list__item__body">
              <div><label>内网: </label> 192.168.101.101</div>
              <div><label>公网: </label> 32.168.101.101</div>
            </div>
          </div>
        </div>
        <div class="node-list__item node-list__item--unreachable">
          <div
            class="node-list__item__box"
            @click="selectNode()"
          >
            <div class="node-list__item__header">
              <div class="node-list__item__title">
                A-CENTOS-003
              </div>
              <div class="node-list__item__bandwidth">
                <div class="node-list__item__bandwidth--up">
                  ↑ 500.22Mbps
                </div>
                <div class="node-list__item__bandwidth--down">
                  ↓ 5200.22Mbps
                </div>
              </div>
            </div>
            <div class="node-list__item__body">
              <div><label>内网: </label> 192.168.101.101</div>
              <div><label>公网: </label> 32.168.101.101</div>
            </div>
          </div>
        </div>
        <div class="node-list__item node-list__item--critical">
          <div
            class="node-list__item__box"
            @click="selectNode()"
          >
            <div class="node-list__item__header">
              <div class="node-list__item__badge">
                <div class="badge badge--critical">
                  2
                </div>
                <div class="badge badge--warning">
                  2
                </div>
              </div>
              <div class="node-list__item__title">
                A-CENTOS-003
              </div>
              <div class="node-list__item__bandwidth">
                <div class="node-list__item__bandwidth--up">
                  ↑ 500.22Mbps
                </div>
                <div class="node-list__item__bandwidth--down">
                  ↓ 5200.22Mbps
                </div>
              </div>
            </div>
            <div class="node-list__item__body">
              <div><label>内网: </label> 192.168.101.101</div>
              <div><label>公网: </label> 32.168.101.101</div>
            </div>
          </div>
        </div>
        <div class="node-list__item node-list__item--warning">
          <div
            class="node-list__item__box"
            @click="selectNode()"
          >
            <div class="node-list__item__header">
              <div class="node-list__item__badge">
                <div class="badge badge--warning">
                  2
                </div>
              </div>
              <div class="node-list__item__title">
                A-CENTOS-003
              </div>
              <div class="node-list__item__bandwidth">
                <div class="node-list__item__bandwidth--up">
                  ↑ 500.22Mbps
                </div>
                <div class="node-list__item__bandwidth--down">
                  ↓ 5200.22Mbps
                </div>
              </div>
            </div>
            <div class="node-list__item__body">
              <div><label>内网: </label> 192.168.101.101</div>
              <div><label>公网: </label> 32.168.101.101</div>
            </div>
          </div>
        </div>
        <div class="node-list__item node-list__item--warning">
          <div
            class="node-list__item__box"
            @click="selectNode()"
          >
            <div class="node-list__item__header">
              <div class="node-list__item__badge">
                <div class="badge badge--warning">
                  2
                </div>
              </div>
              <div class="node-list__item__title">
                A-CENTOS-003
              </div>
              <div class="node-list__item__bandwidth">
                <div class="node-list__item__bandwidth--up">
                  ↑ 500.22Mbps
                </div>
                <div class="node-list__item__bandwidth--down">
                  ↓ 5200.22Mbps
                </div>
              </div>
            </div>
            <div class="node-list__item__body">
              <div><label>内网: </label> 192.168.101.101</div>
              <div><label>公网: </label> 32.168.101.101</div>
            </div>
          </div>
        </div>
        <div class="node-list__item node-list__item--warning">
          <div
            class="node-list__item__box"
            @click="selectNode()"
          >
            <div class="node-list__item__header">
              <div class="node-list__item__badge">
                <div class="badge badge--warning">
                  2
                </div>
              </div>
              <div class="node-list__item__title">
                A-CENTOS-003
              </div>
              <div class="node-list__item__bandwidth">
                <div class="node-list__item__bandwidth--up">
                  ↑ 500.22Mbps
                </div>
                <div class="node-list__item__bandwidth--down">
                  ↓ 5200.22Mbps
                </div>
              </div>
            </div>
            <div class="node-list__item__body">
              <div><label>内网: </label> 192.168.101.101</div>
              <div><label>公网: </label> 32.168.101.101</div>
            </div>
          </div>
        </div>
        <div class="node-list__item node-list__item--warning">
          <div
            class="node-list__item__box"
            @click="selectNode()"
          >
            <div class="node-list__item__header">
              <div class="node-list__item__badge">
                <div class="badge badge--warning">
                  2
                </div>
              </div>
              <div class="node-list__item__title">
                A-CENTOS-003
              </div>
              <div class="node-list__item__bandwidth">
                <div class="node-list__item__bandwidth--up">
                  ↑ 500.22Mbps
                </div>
                <div class="node-list__item__bandwidth--down">
                  ↓ 5200.22Mbps
                </div>
              </div>
            </div>
            <div class="node-list__item__body">
              <div><label>内网: </label> 192.168.101.101</div>
              <div><label>公网: </label> 32.168.101.101</div>
            </div>
          </div>
        </div>
        <div class="node-list__item node-list__item">
          <div
            class="node-list__item__box"
            @click="selectNode()"
          >
            <div class="node-list__item__header">
              <div class="node-list__item__title">
                A-CENTOS-003
              </div>
              <div class="node-list__item__bandwidth">
                <div class="node-list__item__bandwidth--up">
                  ↑ 500.22Mbps
                </div>
                <div class="node-list__item__bandwidth--down">
                  ↓ 5200.22Mbps
                </div>
              </div>
            </div>
            <div class="node-list__item__body">
              <div><label>内网: </label> 192.168.101.101</div>
              <div><label>公网: </label> 32.168.101.101</div>
            </div>
          </div>
        </div>
        <div class="node-list__item node-list__item">
          <div
            class="node-list__item__box"
            @click="selectNode()"
          >
            <div class="node-list__item__header">
              <div class="node-list__item__title">
                A-CENTOS-003
              </div>
              <div class="node-list__item__bandwidth">
                <div class="node-list__item__bandwidth--up">
                  ↑ 500.22Mbps
                </div>
                <div class="node-list__item__bandwidth--down">
                  ↓ 5200.22Mbps
                </div>
              </div>
            </div>
            <div class="node-list__item__body">
              <div><label>内网: </label> 192.168.101.101</div>
              <div><label>公网: </label> 32.168.101.101</div>
            </div>
          </div>
        </div>
        <div class="node-list__item node-list__item">
          <div
            class="node-list__item__box"
            @click="selectNode()"
          >
            <div class="node-list__item__header">
              <div class="node-list__item__title">
                A-CENTOS-003
              </div>
              <div class="node-list__item__bandwidth">
                <div class="node-list__item__bandwidth--up">
                  ↑ 500.22Mbps
                </div>
                <div class="node-list__item__bandwidth--down">
                  ↓ 5200.22Mbps
                </div>
              </div>
            </div>
            <div class="node-list__item__body">
              <div><label>内网: </label> 192.168.101.101</div>
              <div><label>公网: </label> 32.168.101.101</div>
            </div>
          </div>
        </div>
      </div>
      <el-pagination
        background
        :page-size="20"
        :pager-count="5"
        layout="total, sizes, prev, pager, next, jumper"
        :total="1000"
      />
    </div>
    <div
      v-if="selectedNode"
      class="app-container__detail"
    >
      <node-detail @close="closeNodeDetail()" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import NodeDetail from './components/NodeDetail.vue'
// @ts-ignore
import { on, off } from 'element-ui/lib/utils/dom.js'

@Component({
  components: {
    NodeDetail
  }
})
export default class extends Vue {
  private selectedNode: boolean | null = null

  private containerOffsetTop: number = 0
  private containerClass: string = 'node-detail-init'

  private filter = {
    region: '',
    order: '',
    keyword: ''
  }

  private mounted(): void {
    let $container: HTMLElement | null = document.querySelector('.app-main')
    this.containerOffsetTop = $container!.offsetTop
    on(window, 'scroll', this.scrollChange)
  }

  private destroyed(): void {
    off(window, 'scroll', this.scrollChange)
  }

  private selectNode(): void {
    this.selectedNode = true
  }

  private closeNodeDetail(): void {
    this.selectedNode = null
  }

  private scrollChange(): void {
    if (!this.selectedNode) return
    let currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop
    this.containerClass = currentScrollTop >= this.containerOffsetTop ? 'node-detail-fixed' : 'node-detail-init'
  }
}
</script>

<style lang="scss" scoped>
$detail-width: 580px;
$detail-width-mini: 450px;
$detail-width-mini2: 400px;

.app-container {
  display: flex;

  &__detail {
    width: $detail-width;
    min-width: $detail-width;
    border-left: 1px solid $lightGray;
    margin: -20px;
    margin-left: 20px;
    flex: 0 0 $detail-width;
    background: #fff;
    box-shadow: -1px -1px 4px rgba(0, 21, 41, 0.08);
    @media screen and (max-width: 1500px) {
      width: $detail-width-mini;
      min-width: $detail-width-mini;
      flex: 0 0 $detail-width-mini;
    }
    @media screen and (max-width: 1300px) {
      width: $detail-width-mini2;
      min-width: $detail-width-mini2;
      flex: 0 0 $detail-width-mini2;
    }
  }
}

.node-detail-init {
  ::v-deep .node-detail__tabs {
    .el-tab-pane .el-collapse {
      max-height: calc(100vh - 220px);
      overflow: auto;
    }
  }
}

.node-detail-fixed {
  ::v-deep .node-detail__tabs {
    .el-tab-pane .el-collapse {
      max-height: calc(100vh - 140px);
      overflow: auto;
    }
  }
}

.node-detail-fixed {
  padding-right: $detail-width + 20px;
  @media screen and (max-width: 1500px) {
    padding-right: $detail-width-mini + 20px;
  }
  @media screen and (max-width: 1300px) {
    padding-right: $detail-width-mini2 + 20px;
  }
  .app-container__detail {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    overflow: auto;
  }
}

.filter-bar {
  border-bottom: 1px solid $lightGray;
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
}
.badge--critical {
  background: $red;
}
.badge--warning {
  background: $yellow;
}

.region-summary {
  display: flex;
  padding-top: 16px;
  padding-bottom: 8px;

  &__item {
    margin-right: 24px;
    color: $darkGray;

    span {
      font-weight: bold;
    }
    &--critical {
      color: $red;
    }
    &--warning {
      color: $yellow;
    }
    &--default {
      color: #333;
    }
  }
}

.node-list {
  display: flex;
  flex-flow: row wrap;
  margin: 0 -8px;
  clear: both;

  &__item {
    flex: 0 0 20%;
    max-width: 20%;

    &__box {
      position: relative;
      border: 1px solid $lightGray;
      background: #fff;
      margin: 8px;
      padding: 8px;
      border-radius: 5px;
      cursor: pointer;

      &:hover {
        box-shadow: 1px 1px 8px rgba(0,0,0,.3);
      }
    }
    &__header {
      background: #f3f3f3;
      padding: 18px 0;
      border-radius: 5px;
    }
    &__badge {
      position: absolute;
      top: 3px;
      right: 3px;

      .badge {
        margin-left: 4px;
      }
    }
    &__title {
      text-align: center;
      font-weight: bold;
    }
    &__bandwidth {
      display: flex;
      justify-content: center;
      margin-top: 8px;
      font-size: 12px;
      white-space: nowrap;

      div {
        margin: 0 8px;
      }

      &--up {
        color: #1869e3;
      }
      &--down {
        color: #6c9f09;
      }
    }
    &__body {
      padding: 8px 8px 0;
      div {
        margin: 12px 0;
      }
      label {
        color: $darkGray;
        margin-right: 8px;
      }
    }

    // unreachable
    &--unreachable {
      .node-list__item {
        &__box {
          border: 1px solid #a0a0a0;
          background: #eaeaea;
        }
        &__header {
          background: #d8d8d8;
        }
        &__body {
          label {
            color: #777;
          }
        }
      }
    }
    // critical
    &--critical {
      .node-list__item {
        &__box {
          border: 1px solid #ec8e8e;
          background: #fff4f4;
        }
        &__header {
          background: #ffdede;
        }
        &__body {
          label {
            color: #bf5c5c;
          }
        }
      }
    }
    // warning
    &--warning {
      .node-list__item {
        &__box {
          border: 1px solid #FEC171;
          background: #fff6eb;
        }
        &__header {
          background: #ffefd9;
        }
        &__body {
          label {
            color: #d99e52;
          }
        }
      }
    }
  }

  @media screen and (max-width: 1400px) {
    &__item {
      flex: 0 0 25%;
      max-width: 25%;
    }
  }

  @media screen and (max-width: 900px) {
    &__item {
      flex: 0 0 33.33%;
      max-width: 33.33%;
    }
  }
}

.app-container.expanded {
  .node-list {
    @media screen and (max-width: 1900px) {
      &__item {
        flex: 0 0 25%;
        max-width: 25%;
      }
    }

    @media screen and (max-width: 1600px) {
      &__item {
        flex: 0 0 33.33%;
        max-width: 33.33%;
      }
    }

    @media screen and (max-width: 1400px) {
      &__item {
        flex: 0 0 50%;
        max-width: 50%;
      }
    }

    @media screen and (max-width: 1100px) {
      &__item {
        flex: 0 0 100%;
        max-width: 100%;
      }
    }
  }
  @media screen and (max-width: 1500px) {
    .filter-bar  {
      .pull-right {
        float: none;
      }
    }
  }
  @media screen and (max-width: 1300px) {
    ::v-deep .el-pagination  {
      .el-pagination__total, .el-pagination__sizes, .el-pagination__jump {
        display: none;
      }
    }
  }
}
</style>
