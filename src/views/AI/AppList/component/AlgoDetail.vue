<template>
  <el-card>
    <el-form ref="appForm" :model="form" :rules="rules" label-width="160px">
      <el-form-item label="算法类型" prop="algoName">
        <el-input v-model="form.algoName" disabled />
      </el-form-item>
      <el-form-item label="应用名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="分析类型" prop="analyseType">
        <el-select
          v-model="form.analyseType"
          placeholder="请选择分析类型"
          :disabled="parseInt(form.associateDevices) > 0"
        >
          <el-option
            v-for="(val, key) in analyseAiType"
            :key="key"
            :label="val"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="生效时段" prop="effectPeriod">
        <el-radio-group v-model="form.effectPeriod">
          <el-radio label="全天" />
          <el-radio label="时间段" />
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.effectPeriod === '时间段'">
        <el-table
          ref="policyList"
          max-height="500"
          :data="form.availableperiod"
        >
          <el-table-column label="生效时间段" prop="period" width="380">
            <template slot-scope="scope">
              <el-form-item
                :prop="'availableperiod.' + scope.$index + '.period'"
                :rules="rules.period"
              >
                <el-time-picker
                  v-model="scope.row.period"
                  is-range
                  range-separator="~"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围"
                  value-format="HH:mm:ss"
                  format="HH:mm"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="policyDescribe" label="操作" width="50">
            <template slot-scope="scope">
              <el-link
                type="warning"
                @click="deletePeriod(scope.$index, scope.row)"
              >
                移除
              </el-link>
            </template>
          </el-table-column>
        </el-table>
        <div class="tabrow-add">
          <el-link type="warning" @click="addPeriod">+ 增加生效时间段</el-link>
        </div>
      </el-form-item>
      <!-- 算法定制项--meta数据，考虑单独提取组件 -->
      <component
        :is="formComponent"
        v-if="formComponent && form"
        :form="form"
      />
      <el-form-item label="置信度" prop="confidence">
        <el-slider
          v-model="form.confidence"
          show-input
          :show-input-controls="false"
        />
        <div class="confidence-info">
          <span>%</span>
          <span>~</span>
          <span>100%</span>
        </div>
      </el-form-item>
      <!-- <el-form-item label="回调地址">
        <el-input v-model="form.callbackUrl" />
      </el-form-item>
      <el-form-item label="验证类型">
        <el-radio-group v-model="form.validateType">
          <el-radio label="无验证" />
          <el-radio label="签名验证" />
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.validateType === '签名验证'" label="回调key" prop="callbackKey">
        <el-input v-model="form.callbackKey" />
      </el-form-item> -->
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" />
      </el-form-item>
      <el-divider content-position="left">告警配置</el-divider>
      <el-form-item>
        <template slot="label">
          告警配置:
          <el-popover
            placement="top-start"
            title="告警配置"
            width="400"
            trigger="hover"
            :open-delay="300"
            :content="tips.alertDisabled"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
        <el-switch
          v-model="alertDisabled"
          active-color="#fa8334"
          inactive-color="#C0C4CC"
        />
      </el-form-item>
      <el-form-item
        v-if="alertDisabled && !ifShow('10001', '10034')"
        prop="alertPeriod"
        class="inline-form-item"
      >
        <template slot="label">
          告警周期:
          <el-popover
            placement="top-start"
            title="告警周期"
            width="400"
            trigger="hover"
            :open-delay="300"
            :content="tips.alertPeriod"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
        <el-input v-model="form.alertPeriod" class="alarm" />
      </el-form-item>
      <el-select
        v-if="alertDisabled && !ifShow('10001', '10034')"
        v-model="interval.alertPeriod"
        class="interval-unit"
      >
        <el-option key="second" label="秒" value="s" />
        <el-option key="minute" label="分" value="m" />
        <el-option key="hour" label="时" value="h" />
      </el-select>
      <br>
      <el-form-item
        v-if="alertDisabled && !ifShow('10001', '10034')"
        prop="alertTriggerThreshold"
        class="inline-form-item"
      >
        <template slot="label">
          告警数量阈值:
          <el-popover
            placement="top-start"
            title="告警数量阈值"
            width="400"
            trigger="hover"
            :open-delay="300"
            :content="tips.alertTriggerThreshold"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
        <el-input v-model="form.alertTriggerThreshold" class="alarm" />
      </el-form-item>
      <span
        v-if="alertDisabled && !ifShow('10001', '10034')"
        style="margin-left: 16px;"
      >个</span>
      <br>
      <el-form-item
        v-if="alertDisabled"
        prop="alertSilencePeriod"
        class="inline-form-item"
      >
        <template slot="label">
          静默时间:
          <el-popover
            placement="top-start"
            title="静默时间"
            width="400"
            trigger="hover"
            :open-delay="300"
            :content="tips.alertSilencePeriod"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
        <el-input v-model="form.alertSilencePeriod" class="alarm" />
      </el-form-item>
      <el-select
        v-if="alertDisabled"
        v-model="interval.alertSilencePeriod"
        class="interval-unit"
      >
        <el-option key="second" label="秒" value="s" />
        <el-option key="minute" label="分" value="m" />
        <el-option key="hour" label="时" value="h" />
      </el-select>
      <el-form-item>
        <el-button
          v-if="!$route.query.id && !isIboxEdit"
          @click="changeStepPrev"
        >
          上一步
        </el-button>
        <el-button
          v-if="!isSelectDevice || isIboxEdit"
          type="primary"
          @click="onSubmit"
        >
          确定
        </el-button>
        <el-button
          v-if="isSelectDevice && !isIboxEdit"
          type="primary"
          @click="changeStepNext"
        >
          下一步
        </el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Inject } from 'vue-property-decorator'
// import { getAIConfigGroupData } from '@/api/aiConfig'
import { listGroup } from '@/api/face'
import { getAppInfo, updateAppInfo, createApp } from '@/api/ai-app'
import { describeIboxApp } from '@/api/ibox'
import { TrashType, HelmetClothType, AnimalType } from '@vss/ai/dics/contants'
import { ResourceAiType } from '@/dics'
import AppMixin from '../../mixin/app-mixin'
import { FormRef } from '@vss/ai/dics'
import AlgoConfigs from '@vss/ai/component/AlgoConfig'
import { formRule, formTips } from '@vss/ai/util/form-helper'

@Component({
  name: 'AlgoDetail',
  components: {
    ...AlgoConfigs.components
  }
})
export default class extends Mixins(AppMixin) {
  @Prop() private step!: number
  @Prop({ default: false }) public isSelectDevice!: boolean
  @Prop() public algoParam!: any
  @Prop() public algoParamSubmit!: any
  @Prop({ default: false }) public isIboxEdit!: boolean

  @Inject('appInfo')
  public appInfo!: any

  private breadCrumbContent: String = ''
  private ResourceAiType: any = ResourceAiType
  private faceLibs = []
  private isfaceLibLoading = false
  public rules: any = formRule
  private tips: any = formTips
  private TrashType = TrashType
  private AnimalType = AnimalType
  private HelmetClothType: any = HelmetClothType
  get analyseAiType() {
    const res = Object.assign({}, ResourceAiType)
    if (this.ifShow('10019')) {
      delete res['AI-100']
    } else if (this.ifShow('10025', '10032') || this.isSelectDevice) { // ibox
      delete res['AI-100']
      delete res['AI-200']
    }
    return res
  }

  private ifShow(...codes) {
    const res = codes.filter(
      (code) =>
        this.prod?.code === code ||
        (this.form.algorithm && this.form.algorithm.code === code)
    )
    return res.length > 0
  }

  get algoCode() {
    return this.prod?.code || (this.form.algorithm && this.form.algorithm.code)
  }

  get formComponent() {
    const names = Object.keys(AlgoConfigs.components)
    if (names.includes('form' + this.algoCode)) {
      return 'form' + this.algoCode
    } else if (FormRef[this.algoCode]) {
      return 'form' + FormRef[this.algoCode]
    } else {
      return null
    }
  }

  private async mounted() {
    if (this.$route.query.id || (this.appInfo && this.appInfo())) {
      // 编辑
      if (this.$route.query.id) {
        const id = this.$route.query.id
        this.form = await getAppInfo({ id })
        this.$set(this.form, 'algoName', this.form.algorithm.name)
      } else {
        const appInfo = this.appInfo()
        const { iboxApp }: any = await describeIboxApp({
          appId: appInfo.appId,
          iboxId: appInfo.iboxId
        })
        this.form = iboxApp
        this.$set(this.form, 'algoName', this.form.algorithmName)
        this.$set(this.form, 'algorithmMetadata', this.form.algoConf)
      }

      if (this.form.callbackKey.length === 0) {
        this.$set(this.form, 'validateType', '无验证')
      } else {
        this.$set(this.form, 'validateType', '签名验证')
      }
      // 处理生效时间段
      this.editTransformEffectiveTime()
      // 处理人脸库选项
      this.editTransformFaceData()
      // 处理老安全帽反光服meta
      this.editTransformHelmetReflectiveType()
      // 处理告警静默参数
      this.editTransformInterval()
      // 处理置信度
      this.form = {
        ...this.form,
        confidence: parseInt(this.form.confidence * 100 + '')
      }
      // 蜜蜂阈值特别处理
      if (
        this.form.algorithm?.code === '10010' ||
        this.prod?.code === '10010'
      ) {
        this.form.beeNumber = this.form.confidence / 100
        this.form = { ...this.form, confidence: 60 }
      }
      if (
        this.form.alertPeriod > 0 ||
        this.form.alertSilencePeriod > 0 ||
        this.form.alertTriggerThreshold > 0
      ) {
        this.alertDisabled = true
      }
      // eslint-disable-next-line eqeqeq
      if (
        this.form.alertPeriod == 0 &&
        this.form.alertSilencePeriod == 0 &&
        this.form.alertTriggerThreshold == 0
      ) {
        this.form.alertPeriod = '0'
        this.form.alertSilencePeriod = '3'
        this.form.alertTriggerThreshold = '1'
      }
    } else {
      // 新建
      const algorithmMetadata = this.ifShow('10021')
        ? { pvTime: '10' }
        : this.form.algorithmMetadata
      this.form = {
        algoName: this.prod.name,
        algorithmMetadata,
        availableperiod: [],
        validateType: '无验证',
        confidence: 60,
        effectPeriod: '全天',
        beeNumber: 1,
        alertTriggerThreshold: '1',
        alertPeriod: '0',
        alertSilencePeriod: '3'
      }
      this.isSelectDevice && (this.form.analyseType = 'AI-300') // IBOX默认选择分析类型
      if (this.algoParam) {
        this.form = this.algoParam
        this.alertDisabled = this.algoParam.alertDisabled
      }
    }
    try {
      if (this.ifShow('10001', '10034')) {
        const { data } = await listGroup({
          pageNum: 0,
          pageSize: 3000
        })
        this.faceLibs = data
      }
    } catch (e) {
      this.$alertError(e && e.message)
    }
  }

  private editTransformInterval() {
    this.transformInterval('alertPeriod')
    this.transformInterval('alertSilencePeriod')
  }

  private transformInterval(pName) {
    if (this.form[pName] % 60 === 0) {
      // eslint-disable-next-line eqeqeq
      if (this.form[pName] == 0) {
        this.interval[pName] = 's'
      } else if (this.form[pName] / 60 < 60) {
        this.interval[pName] = 'm'
        this.form[pName] = this.form[pName] / 60
      } else {
        this.interval[pName] = 'h'
        this.form[pName] = this.form[pName] / 60 / 60
      }
    } else {
      this.interval[pName] = 's'
    }
  }

  /**
   * 处理生效时间段
   */
  private editTransformEffectiveTime() {
    const effectiveTime = JSON.parse(this.form.effectiveTime)
    const period = effectiveTime.map((item) => ({
      period: [item.start_time, item.end_time]
    }))
    this.$set(this.form, 'availableperiod', period)
    if (
      effectiveTime.length === 1 &&
      effectiveTime[0].start_time === '00:00:00' &&
      effectiveTime[0].end_time === '23:59:59'
    ) {
      this.$set(this.form, 'effectPeriod', '全天')
    } else {
      this.$set(this.form, 'effectPeriod', '时间段')
    }
  }

  /**
   * 处理人脸选项信息
   */
  private editTransformFaceData() {
    this.form.algorithmMetadata.length !== 0
      ? (this.form.algorithmMetadata = JSON.parse(this.form.algorithmMetadata))
      : (this.form = {
        ...this.form,
        algorithmMetadata: { FaceDbName: '', pedThreshold: '' }
      })
  }

  private editTransformHelmetReflectiveType() {
    !this.form.algorithmMetadata.helmetReflectiveType &&
      this.$set(this.form.algorithmMetadata, 'helmetReflectiveType', [
        'helmet',
        'reflective'
      ])
  }

  private getHourInterval = (min, max) => {
    let pivot = min
    const arr = []
    while (pivot <= max) {
      arr.push(pivot + '')
      ++pivot
    }
    return arr
  }

  /**
   * 步进控制
   */
  private changeStepPrev() {
    this.$emit('update:step', this.step - 1)
    this.$emit('update:algo-param', null)
    this.$emit('update:algo-param-submit', null)
  }

  private changeStepNext() {
    const form: any = this.$refs.appForm
    form.validate(async(valid: any) => {
      if (valid) {
        let param: any = this.generateAlgoParam()
        const appInfo = this.appInfo()
        param = {
          ...param,
          algorithmsId: this.prod.id || appInfo.algorithmId
        }
        this.$emit('update:step', this.step + 1)
        this.$emit('update:prod', this.prod)
        this.$emit('update:algo-param', {
          ...this.form,
          alertDisabled: this.alertDisabled
        })
        this.$emit('update:algo-param-submit', param)
      }
    })
  }

  /**
   * 提交
   */
  private onSubmit() {
    const form: any = this.$refs.appForm
    form.validate(async(valid: any) => {
      if (valid) {
        this.isIboxEdit ? this.editIboxApp() : this.submitValidAppInfo()
      }
    })
  }

  private editIboxApp() {
    let param: any = this.generateAlgoParam()
    const appInfo = this.appInfo()
    param = {
      ...param,
      algorithmsId: this.prod.id || appInfo.algorithmId
    }
    this.$emit('update:algo-param-submit', param)
    this.$emit('submit', {})
  }

  /**
   * 提交
   */
  private async submitValidAppInfo() {
    let param: any = this.generateAlgoParam()
    try {
      if (this.$route.query.id) {
        // 如果有关联的设备则不能传analyseType参数
        if (parseInt(param.associateDevices) > 0) {
          delete param.analyseType
        }
        await updateAppInfo(param)
      } else {
        // 新建时带上算法ID
        param = { ...param, algorithmsId: this.prod.id }
        await createApp(param)
      }
      this.$message.success(`${this.$route.query.id ? '修改' : '新建'}应用成功`)
      this.backToAppList()
    } catch (e) {
      this.$alertError(e && e.message)
    }
  }

  /**
   * 增加生效时间段选项
   */
  private addPeriod() {
    if (this.form.availableperiod.length > 4) {
      this.$message.error('不能设置超过5个时间段')
    } else {
      this.form.availableperiod.push({ period: ['08:40:00', '09:40:00'] })
    }
  }

  /**
   * 删除生效时间段选项
   */
  private deletePeriod(index) {
    this.form.availableperiod.splice(index, 1)
  }

  /**
   * 刷新获取最新的人脸库
   */
  private async refreshFaceLib() {
    this.isfaceLibLoading = true
    const { data } = await listGroup({
      pageNum: 0,
      pageSize: 3000
    })
    this.faceLibs = data
    this.isfaceLibLoading = false
  }

  /**
   * 新窗口前往人脸库
   */
  private goFaceLib() {
    const addr = this.$router.resolve({
      name: 'facelib'
    })
    window.open(addr.href, '_blank')
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  .confidence-info {
    display: inline-block;
    height: 45px;
    line-height: 100%;
    vertical-align: middle;
    margin-left: -71px;

    & > span:nth-child(2) {
      margin-left: 10px;
      margin-right: 10px;
    }
  }

  .el-slider {
    width: 500px;
    display: inline-block;

    ::v-deep .el-slider__input {
      width: 60px;
      margin-right: 80px;
    }
  }

  .el-input,
  .el-textarea,
  .el-table {
    width: 500px;
  }

  .tabrow-add {
    padding-left: 180px;
  }

  .mb5 {
    width: 500px;
  }

  .el-icon-refresh {
    margin-left: 20px;
    font-size: 16px;

    &:hover {
      cursor: pointer;
    }
  }

  .el-button--text {
    margin-left: 15px;
  }

  .comment {
    padding-left: 10px;
    color: $textGrey;
  }

  .el-form-item.is-error.el-form-item--medium {
    margin-bottom: 20px;
  }

  .alarm {
    width: 112px;
    margin-right: 18px;

    & + .el-select {
      width: 80px;
    }
  }

  .inline-form-item {
    width: fit-content;
    display: inline-block;
  }

  .interval-unit {
    width: 65px;
  }
}
</style>
