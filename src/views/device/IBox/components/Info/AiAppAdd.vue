<template>
  <div class="app-container">
    <div v-if="!isIboxEdit" class="process">
      <el-steps :active="step" simple>
        <el-step title="选择AI算法">
          <span slot="icon">1</span>
        </el-step>
        <el-step title="创建AI应用">
          <span slot="icon">2</span>
        </el-step>
        <el-step title="选择分析设备">
          <span slot="icon">3</span>
        </el-step>
      </el-steps>
    </div>
    <div v-if="step === 0" :key="0">
      <AlgoOption
        :step.sync="step"
        :prod.sync="prod"
        direction="next"
        @back="backToList"
      />
    </div>
    <div v-else-if="step === 1" :key="1">
      <AlgoDetail
        :step.sync="step"
        :prod.sync="prod"
        :is-select-device="true"
        :algo-param.sync="algoParam"
        :algo-param-submit.sync="algoParamSubmit"
        :is-ibox-edit="isIboxEdit"
        @submit="onSubmit"
        @back="backToList"
      />
    </div>
    <div v-else-if="step === 2" :key="2">
      <AlgoDevice
        :step.sync="step"
        :prod.sync="prod"
        :submitting.sync="submitting"
        @back="backToList"
        @submit="onSubmit"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Inject } from 'vue-property-decorator'
import AlgoOption from '@/views/AI/AppList/component/AlgoOption.vue'
import AlgoDetail from '@/views/AI/AppList/component/AlgoDetail.vue'
import AlgoDevice from './AlgoDevice.vue'
import AppMixin from '@/views/AI/mixin/app-mixin' // 考虑优化的mixin
import { createIboxApp, updateIboxApp } from '@/api/ibox'

@Component({
  name: 'AiAppAdd',
  components: {
    AlgoOption,
    AlgoDetail,
    AlgoDevice
  }
})
export default class extends Mixins(AppMixin) {
  @Inject('appInfo')
  public appInfo!: any

  @Prop({}) initialStep!: number
  @Prop({}) isIboxEdit!: boolean
  private step: number = 0
  public prod: any = {} // 新建时传入组件的参数
  private isLoading: boolean = false
  private algoParam: any = null
  private algoParamSubmit: any = null
  private submitting = false
  private get header() {
    return this.$route.query.id ? '编辑' : '创建'
  }

  private mounted() {
    this.step = this.initialStep
  }

  private async onSubmit(treeParam) {
    try {
      const param = {
        ...this.algoParamSubmit,
        ...treeParam,
        iboxId: this.$route.query.deviceId
      }
      const submitFunc = this.appInfo() ? updateIboxApp : createIboxApp
      await submitFunc({
        ...param,
        algoConf: param.algorithmMetadata,
        algorithmId: param.algorithmsId
      })
      this.backToList()
      this.$message.success('操作成功')
    } catch (e) {
      this.$message.error(e)
      this.submitting = false
    }
  }

  private backToList() {
    this.$emit('back')
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
  padding: 5px 0;

  .el-steps--simple {
    width: 575px;
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
