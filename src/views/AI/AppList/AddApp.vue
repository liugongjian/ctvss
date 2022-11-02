<template>
  <div class="app-container">
    <el-page-header :content="`${header}AI应用`" @back="back" />
    <div v-if="!$route.query.id" class="process">
      <el-steps :active="step" simple>
        <el-step title="选择AI算法"><span slot="icon">1</span></el-step>
        <el-step title="创建AI应用"><span slot="icon">2</span></el-step>
      </el-steps>
    </div>
    <div v-if="!step && !$route.query.id">
      <AlgoOption :step.sync="step" :prod.sync="prod" />
    </div>
    <div v-if="step || $route.query.id">
      <AlgoDetail :step.sync="step" :prod="prod" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import AlgoOption from './component/AlgoOption.vue'
import AlgoDetail from './component/AlgoDetail.vue'
import AppMixin from '../mixin/app-mixin' // 考虑优化的mixin

@Component({
  name: 'AddApp',
  components: {
    AlgoOption,
    AlgoDetail
  }
})
export default class extends Mixins(AppMixin) {
  private step: Number = 0
  private prod: any = {}// 新建时传入组件的参数
  private isLoading = false
  private get header() {
    return this.$route.query.id ? '编辑' : '创建'
  }

  private back() {
    this.backToAppList()
  }
}
</script>
<style lang="scss" scoped>
.input-with-select {
  width: 260px;
  position: absolute;
  top: 0;
  right: 0;
}

.el-row {
  position: relative;
}

.card-container {
  overflow: auto;
  display: flex;
  flex-direction: row;
  /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties */
  flex-wrap: wrap;
  justify-content: space-around;
  align-content: flex-start;
  height: 60vh;
  min-width: 1200px;
  min-height: 400px;
}

.process {
  margin-bottom: 20px;
  padding: 20px 0 5px;
  border-top: 1px solid $borderGrey2;

  .el-steps--simple {
    width: 400px;
    background: none;
    padding: 0;

    ::v-deep {
      .el-step.is-simple .el-step__head {
        padding-right: 15px;
      }

      .el-step.is-simple .el-step__arrow:before,
      .el-step.is-simple .el-step__arrow:after {
        background: $textGrey;
        width: 2px;
      }

      .el-step__title {
        font-weight: bold;
      }

      .el-step__icon {
        width: 35px;
        height: 35px;
        font-size: 16px;
        font-weight: bold;
      }

      .is-process {
        .el-step__icon {
          background: $primary;
          color: #fff;
          border-color: $primary;
        }
      }

      .is-wait,
      .is-finish {
        color: $textGrey;

        .el-step__icon {
          border-color: $textGrey;
        }
      }

      .is-finish {
        .el-step__icon {
          background: #bbb;
          color: #fff;
          border-color: #bbb;
        }
      }
    }
  }
}
</style>
