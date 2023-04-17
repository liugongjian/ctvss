<template>
  <el-card>
    <el-form ref="appForm" :model="form" :rules="rules" label-width="160px">
      <el-form-item label="算法类型" prop="algoName">
        <el-input v-model="form.algoName" :disabled="true" />
      </el-form-item>
      <el-form-item label="应用名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="分析类型" prop="analyseType">
        <el-select v-model="form.analyseType" placeholder="请选择分析类型" :disabled="parseInt(form.associateDevices) > 0">
          <el-option v-for="(val, key) in analyseAiType" :key="key" :label="val" :value="key" />
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
          <el-table-column
            label="生效时间段"
            prop="period"
            width="380"
          >
            <template slot-scope="scope">
              <el-form-item :prop="'availableperiod.' + scope.$index + '.period'" :rules="rules.period">
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
          <el-table-column
            prop="policyDescribe"
            label="操作"
            width="50"
          >
            <template slot-scope="scope">
              <el-link type="warning" @click="deletePeriod(scope.$index, scope.row)">移除</el-link>
            </template>
          </el-table-column>
        </el-table>
        <div class="tabrow-add">
          <el-link type="warning" @click="addPeriod">+ 增加生效时间段</el-link>
        </div>
      </el-form-item>
      <!-- 算法定制项--meta数据，考虑单独提取组件 -->
      <!-- 蜜蜂阈值 -->
      <el-form-item v-if="ifShow('10010')" label="蜜蜂数量阈值" prop="beeNumber">
        <el-input v-model="form.beeNumber" />
      </el-form-item>
      <!-- 人群感应检测 -->
      <el-form-item v-if="ifShow('10023')" label="人员数量阈值" prop="algorithmMetadata.crowdThreShold">
        <el-input v-model="form.algorithmMetadata.crowdThreShold" />
      </el-form-item>
      <!-- 车辆统计 -->
      <el-form-item v-if="ifShow('10019')" label="时间窗口" prop="algorithmMetadata.timeSlide">
        <el-select v-model="form.algorithmMetadata.timeSlide" placeholder="请选择时间窗口">
          <el-option v-for="(val,key) in getHourInterval(1,24)" :key="key" :label="val" :value="val" />
        </el-select>
        <span class="comment">小时</span>
      </el-form-item>
      <el-form-item v-if="ifShow('10019')" label="车辆数量阈值" prop="algorithmMetadata.vehiclesThreshold">
        <el-input v-model="form.algorithmMetadata.vehiclesThreshold" />
      </el-form-item>
      <!-- 实时在岗检测 -->
      <el-form-item v-if="ifShow('10024')" label="脱岗超时时间" prop="algorithmMetadata.offDutyThreShold">
        <el-input v-model="form.algorithmMetadata.offDutyThreShold" />
        <span class="comment">分钟</span>
        <template slot="label">
          脱岗超时时间
          <el-popover
            placement="top-start"
            width="400"
            trigger="hover"
            :open-delay="300"
            :content="tips.offDutyThreShold"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
      </el-form-item>
      <el-form-item v-if="ifShow('10024')" label="睡岗超时时间" prop="algorithmMetadata.sleepOnDutyThreShold">
        <el-input v-model="form.algorithmMetadata.sleepOnDutyThreShold" />
        <span class="comment">分钟</span>
        <template slot="label">
          睡岗超时时间
          <el-popover
            placement="top-start"
            width="400"
            trigger="hover"
            :open-delay="300"
            :content="tips.sleepOnDutyThreShold"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
      </el-form-item>
      <!-- 车辆违停 -->
      <el-form-item v-if="ifShow('10021')" label="临停时间" prop="algorithmMetadata.pvTime">
        <el-input v-model="form.algorithmMetadata.pvTime" />
        <span class="comment">分钟</span>
        <template slot="label">
          临停时间
          <el-popover
            placement="top-start"
            width="400"
            trigger="hover"
            :open-delay="300"
            :content="tips.pvTime"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
      </el-form-item>
      <!-- 车辆拥堵 -->
      <el-form-item v-if="ifShow('10022')" label="拥堵车辆阈值" prop="algorithmMetadata.jamThreshold">
        <el-input v-model="form.algorithmMetadata.jamThreshold" />
        <span class="comment">辆</span>
        <template slot="label">
          拥堵车辆阈值
          <el-popover
            placement="top-start"
            width="400"
            trigger="hover"
            :open-delay="300"
            :content="tips.jamThreshold"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
      </el-form-item>
      <!-- 人员徘徊 -->
      <el-form-item v-if="ifShow('10025')" prop="algorithmMetadata.lingerInterval" label="徘徊时间">
        <el-input v-model="form.algorithmMetadata.lingerInterval" />
        <span class="comment">分钟</span>
      </el-form-item>
      <el-form-item v-if="ifShow('10001','10016','10017', '10034')" prop="algorithmMetadata.FaceDbName" label="人脸库">
        <el-select v-model="form.algorithmMetadata.FaceDbName" placeholder="请选择人脸库" :loading="isfaceLibLoading">
          <el-option v-for="item in faceLibs" :key="item.id" :label="item.name" :value="item.id+''" />
        </el-select>
        <i class="el-icon-refresh" @click="refreshFaceLib" />
        <el-button type="text" @click="goFaceLib">+新建人脸库</el-button>
      </el-form-item>
      <el-form-item v-if="ifShow('10005')" prop="algorithmMetadata.pedThreshold" label="人员数量阈值">
        <el-input v-model="form.algorithmMetadata.pedThreshold" />
      </el-form-item>
      <el-form-item v-if="ifShow('10006')" label="围栏区域">
        <el-alert
          title="围栏区域需在绑定设备后，在设备详情中进行设置。"
          type="info"
          show-icon
          :closable="false"
          class="mb5"
        />
      </el-form-item>
      <!-- 摄像头遮挡 -->
      <el-form-item v-if="ifShow('10027')" label="视野遮挡阈值" prop="algorithmMetadata.areaThreshold">
        <el-input v-model="form.algorithmMetadata.areaThreshold" />
        <span class="comment">%</span>
      </el-form-item>
      <!-- 动物检测 -->
      <el-form-item v-if="ifShow('10033')" label="动物列表" prop="algorithmMetadata.animalDetectType">
        <el-checkbox-group v-model="form.algorithmMetadata.animalDetectType">
          <el-checkbox v-for="type in AnimalType" :key="type.label" :label="type.label" :disabled="true">{{ type.cname }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <!-- 垃圾投放站检测 -->
      <el-form-item v-if="ifShow('10026')" label="细分检测项" prop="algorithmMetadata.trashRecycleType">
        <el-checkbox-group v-model="form.algorithmMetadata.trashRecycleType">
          <el-checkbox v-for="type in TrashType" :key="type.label" :label="type.label">{{ type.cname }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <!-- 城市治理监测 -->
      <el-form-item v-if="ifShow('10037')" label="细分检测项" prop="algorithmMetadata.cityGovType">
        <el-select v-model="form.algorithmMetadata.cityGovType" multiple class="city-gov-type">
          <el-option v-for="type in CityGovType" :key="type.label" :value="type.label" :label="type.cname" />
        </el-select>
      </el-form-item>
      <!-- 安全帽反光服 -->
      <el-form-item v-if="ifShow('10004')" label="检测项" prop="algorithmMetadata.helmetReflectiveType">
        <el-checkbox-group v-model="form.algorithmMetadata.helmetReflectiveType">
          <el-checkbox v-for="type in HelmetClothType" :key="type.label" :label="type.label">{{ type.cname }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <!---->
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
      <el-form-item v-if="alertDisabled && !ifShow('10001', '10034', '10016')" prop="alertPeriod" class="inline-form-item">
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
      <el-select v-if="alertDisabled && !ifShow('10001', '10034', '10016')" v-model="interval.alertPeriod" class="interval-unit">
        <el-option key="second" label="秒" value="s" />
        <el-option key="minute" label="分" value="m" />
        <el-option key="hour" label="时" value="h" />
      </el-select>
      <br>
      <el-form-item v-if="alertDisabled && !ifShow('10001', '10034', '10016')" prop="alertTriggerThreshold" class="inline-form-item">
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
      <span v-if="alertDisabled && !ifShow('10001', '10034', '10016')" style="margin-left: 16px;">个</span>
      <br>
      <el-form-item v-if="alertDisabled" prop="alertSilencePeriod" class="inline-form-item">
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
      <el-select v-if="alertDisabled" v-model="interval.alertSilencePeriod" class="interval-unit">
        <el-option key="second" label="秒" value="s" />
        <el-option key="minute" label="分" value="m" />
        <el-option key="hour" label="时" value="h" />
      </el-select>
      <el-form-item>
        <el-button v-if="!$route.query.id" @click="changeStep({step: 0})">上一步</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script lang='ts'>
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { listGroup } from '@/api/face'
import { getAppInfo, updateAppInfo, createApp } from '@/api/ai-app'
import { ResourceAiType, TrashType, HelmetClothType, AnimalType, CityGovType } from '@/dics'
import AppMixin from '../../mixin/app-mixin'
import { formRule, formTips } from '../util/form-helper'

@Component({
  name: 'AlgoDetail',
  components: {
  }
})
export default class extends Mixins(AppMixin) {
  @Prop() private prod!: any
  private breadCrumbContent: String = ''
  private ResourceAiType: any = ResourceAiType
  private form: any = {
    algorithmMetadata: {
      trashRecycleType: [],
      cityGovType: [],
      helmetReflectiveType: [],
      animalDetectType: ['Bear']
    },
    beeNumber: 1
  }
  private faceLibs = []
  private isfaceLibLoading = false
  public rules: any = formRule
  private effectiveTime: any = []
  private tips: any = formTips
  private TrashType = TrashType
  private AnimalType = AnimalType
  private CityGovType = CityGovType
  private HelmetClothType: any = HelmetClothType
  private alertDisabled = false
  private interval = {
    alertPeriod: 's',
    alertSilencePeriod: 's'
  }

  get analyseAiType() {
    let res = Object.assign({}, ResourceAiType)
    if (this.ifShow('10019')) {
      delete res['AI-100']
    } else if (this.ifShow('10025', '10032')) {
      delete res['AI-100']
      delete res['AI-200']
    }
    return res
  }

  private ifShow(...codes) {
    let res = codes.filter(code => this.prod?.code === code || (this.form.algorithm && this.form.algorithm.code === code))
    return res.length > 0
  }
  private async mounted() {
    if (this.$route.query.id) { // 编辑
      const id = this.$route.query.id
      this.form = await getAppInfo({ id })
      this.$set(this.form, 'algoName', this.form.algorithm.name)
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
      this.form = { ...this.form, confidence: parseInt(this.form.confidence * 100 + '') }
      // 蜜蜂阈值特别处理
      if (this.form.algorithm?.code === '10010' || this.prod?.code === '10010') {
        this.form.beeNumber = this.form.confidence / 100
        this.form = { ...this.form, confidence: 60 }
      }
      if (this.form.alertPeriod > 0 || this.form.alertSilencePeriod > 0 || this.form.alertTriggerThreshold > 0) {
        this.alertDisabled = true
      }
      // eslint-disable-next-line eqeqeq
      if (this.form.alertPeriod == 0 && this.form.alertSilencePeriod == 0 && this.form.alertTriggerThreshold == 0) {
        this.form.alertPeriod = '0'
        this.form.alertSilencePeriod = '3'
        this.form.alertTriggerThreshold = '1'
      }
    } else { // 新建
      const algorithmMetadata = this.ifShow('10021') ? { pvTime: '10' } : this.form.algorithmMetadata
      this.form = {
        algoName: this.prod.name,
        algorithmMetadata,
        availableperiod: [],
        validateType: '无验证',
        confidence: 60,
        beeNumber: 1,
        alertTriggerThreshold: '1',
        alertPeriod: '0',
        alertSilencePeriod: '3'
      }
    }
    try {
      const { groups } = await listGroup({
        pageNum: 0,
        pageSize: 3000
      })
      this.faceLibs = groups
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
    const period = effectiveTime.map(item => ({ period: [item.start_time, item.end_time] }))
    this.$set(this.form, 'availableperiod', period)
    if (effectiveTime.length === 1 && effectiveTime[0].start_time === '00:00:00' && effectiveTime[0].end_time === '23:59:59') {
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
      : (this.form = { ...this.form, algorithmMetadata: { FaceDbName: '', pedThreshold: '' } })
  }

  private editTransformHelmetReflectiveType() {
    !this.form.algorithmMetadata.helmetReflectiveType && this.$set(this.form.algorithmMetadata, 'helmetReflectiveType', ['helmet', 'reflective'])
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
  private changeStep(val: any) {
    this.$emit('update:step', val.step)
  }

  /**
   * 步进控制
   */
  private cancel() {
    this.backToAppList()
  }

  /**
   * 提交
   */
  private onSubmit() {
    const form: any = this.$refs.appForm
    form.validate(async(valid: any) => {
      if (valid) {
        this.submitValidAppInfo()
      }
    })
  }

  /**
   * 提交
   */
  private async submitValidAppInfo() {
    this.generateEffectiveTime()
    let algorithmMetadata = this.form.algorithmMetadata
    Object.keys(algorithmMetadata).forEach(key => algorithmMetadata[key] === '' && delete algorithmMetadata[key])
    if (this.form.algorithm?.code === '10003' || this.prod?.code === '10003') {
      algorithmMetadata.faceRatio = '0.7'
    }
    let param = {
      ...this.form,
      effectiveTime: this.effectiveTime,
      callbackKey: this.form.validateType === '无验证' ? '' : this.form.callbackKey,
      algorithmMetadata: JSON.stringify(algorithmMetadata),
      confidence: this.form.confidence / 100,
      alertTriggerThreshold: this.alertDisabled ? this.form.alertTriggerThreshold : '0',
      alertPeriod: this.alertDisabled ? (this.interval.alertPeriod === 's' ? this.form.alertPeriod : this.interval.alertPeriod === 'm' ? +this.form.alertPeriod * 60 : +this.form.alertPeriod * 60 * 60).toString() : '0',
      alertSilencePeriod: this.alertDisabled ? (this.interval.alertSilencePeriod === 's' ? this.form.alertSilencePeriod : this.interval.alertSilencePeriod === 'm' ? +this.form.alertSilencePeriod * 60 : +this.form.alertSilencePeriod * 60 * 60).toString() : '0'
    }

    // 蜜蜂数量特殊处理
    if (this.form.algorithm?.code === '10010' || this.prod?.code === '10010') {
      param.confidence = this.form.beeNumber
    }
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
    const { groups } = await listGroup({
      pageNum: 0,
      pageSize: 3000
    })
    this.faceLibs = groups
    this.isfaceLibLoading = false
  }
  /**
   * 提交信息前，转换时间
   */
  private generateEffectiveTime() {
    if (this.form.effectPeriod === '全天') {
      this.effectiveTime = [{ start_time: '00:00:00', end_time: '23:59:59' }]
    } else {
      this.effectiveTime = this.form.availableperiod.map(element => {
        return {
          start_time: element.period[0],
          end_time: element.period[1]
        }
      })
    }
    this.effectiveTime = JSON.stringify(this.effectiveTime)
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

  .city-gov-type {
    width: 500px;

    ::v-deep .el-tag {
      margin-right: 8px;
    }
  }
}
</style>
