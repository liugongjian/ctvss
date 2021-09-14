<template>
  <div class="app-container">
    <el-form ref="appForm" :model="form" :rules="rules" label-width="160px">
      <el-form-item label="算法类型" prop="algoName">
        <el-input v-model="form.algoName" :disabled="true" />
      </el-form-item>
      <el-form-item label="应用名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="分析类型" prop="analyseType">
        <el-select v-model="form.analyseType" placeholder="请选择分析类型">
          <el-option v-for="(val, key) in ResourceAiType" :key="key" :label="val" :value="key" />
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
              <el-time-picker
                v-model="scope.row.period"
                is-range
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择时间范围"
                value-format="HH:mm:ss"
              />
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
      <el-form-item v-if="prod.code === '10001' || (form.algorithm && form.algorithm.code === '10001')" prop="algorithmMetadata.FaceDbName" label="人脸库">
        <el-select v-model="form.algorithmMetadata.FaceDbName" placeholder="请选择人脸库" :loading="isfaceLibLoading">
          <el-option v-for="item in faceLibs" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <i class="el-icon-refresh" @click="refreshFaceLib" />
        <el-button type="text">+新建人脸库</el-button>
      </el-form-item>
      <el-form-item v-if="prod.code === '10006' || (form.algorithm && form.algorithm.code === '10006')" label="围栏区域">
        <el-alert
          title="围栏区域需在绑定设备后，在设备详情中进行设置。"
          type="info"
          show-icon
          :closable="false"
          class="mb5"
        />
      </el-form-item>
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
      <el-form-item label="回调地址">
        <el-input v-model="form.callbackUrl" />
      </el-form-item>
      <el-form-item label="验证类型">
        <el-radio-group v-model="form.validateType">
          <el-radio label="无验证" />
          <el-radio label="签名验证" />
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.validateType === '签名验证'" label="回调key">
        <el-input v-model="form.callbackKey" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item>
        <el-button v-if="!this.$route.query.id" @click="changeStep({step: 0})">上一步</el-button>
        <el-button type="primary" @click="onSubmit">立即{{ this.$route.query.id ? '更新' : '创建' }}</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getAIConfigGroupData } from '@/api/aiConfig'
import { getAppInfo, updateAppInfo, createApp } from '@/api/ai-app'
import { ResourceAiType } from '@/dics'

const getRule = (msg) => {
  return [{ required: true, trigger: 'blur', message: msg }]
}
@Component({
  name: 'AlgoDetail',
  components: {
  }
})
export default class extends Vue {
  @Prop() private prod!: any
  private breadCrumbContent: String = ''
  private ResourceAiType: any = ResourceAiType
  private form: any = {
    algorithmMetadata: {
      FaceDbName: ''
    }
  }
  private faceLibs = []
  private isfaceLibLoading = false
  private rules: any = {
    name: getRule('请输入应用名称'),
    analyseType: getRule('请输入分析类型'),
    effectPeriod: getRule('请输入生效时段'),
    'algorithmMetadata.FaceDbName': getRule('请输入人脸库'),
    confidence: getRule('请输入置信度')
  }
  private effectiveTime: any = []

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
      // 处理置信度
      this.form = { ...this.form, confidence: this.form.confidence * 100 }
    } else { // 新建
      const algorithmMetadata = { FaceDbName: '' }
      this.form = { algoName: this.prod.name, algorithmMetadata, availableperiod: [] }
    }
    const { groups } = await getAIConfigGroupData({})
    this.faceLibs = groups
  }
  // private updated() {
  //   this.prod && (this.form.name = this.prod.name)
  //   this.$route.query.appinfo && (this.form.name = this.appinfo.name)
  // }
  private editTransformEffectiveTime() {
    const effectiveTime = JSON.parse(this.form.effectiveTime)
    const period = effectiveTime.map(item => ({ period: [item.starttime, item.endtime] }))
    this.$set(this.form, 'availableperiod', period)
    if (effectiveTime.length === 1 && effectiveTime[0].starttime === '00:00:00' && effectiveTime[0].endtime === '23:59:59') {
      this.$set(this.form, 'effectPeriod', '全天')
    } else {
      this.$set(this.form, 'effectPeriod', '时间段')
    }
  }
  private editTransformFaceData() {
    this.form.algorithmMetadata.length !== 0
      ? (this.form.algorithmMetadata = JSON.parse(this.form.algorithmMetadata))
      : (this.form = { ...this.form, algorithmMetadata: { FaceDbName: '' } })
  }
  private changeStep(val: any) {
    this.$emit('update:step', val.step)
  }
  private cancel() {
    this.$router.push({ name: 'AI-AppList' })
  }
  private onSubmit() {
    const form: any = this.$refs.appForm
    form.validate(async(valid: any) => {
      if (valid) {
        this.submitValidAppInfo()
      }
    })
  }
  private async submitValidAppInfo() {
    this.generateEffectiveTime()
    let param = {
      ...this.form,
      effectiveTime: this.effectiveTime,
      callbackKey: this.form.validateType === '无验证' ? '' : this.form.callbackKey,
      algorithmMetadata: JSON.stringify(this.form.algorithmMetadata),
      confidence: this.form.confidence / 100
    }
    if (this.$route.query.id) {
      await updateAppInfo(param)
      this.$message.success('修改应用成功')
    } else {
      // 新建时带上算法ID
      param = { ...param, algorithmsId: this.prod.id }
      await createApp(param)
      this.$message.success('新建应用成功')
    }
    this.$router.push({ name: 'AI-AppList' })
  }
  private addPeriod() {
    this.form.availableperiod.push({ period: ['08:40:00', '09:40:00'] })
  }
  private deletePeriod(index) {
    this.form.availableperiod.splice(index, 1)
  }
  private async refreshFaceLib() {
    this.isfaceLibLoading = true
    const { groups } = await getAIConfigGroupData({ })
    this.faceLibs = groups
    this.isfaceLibLoading = false
  }
  private generateEffectiveTime() {
    if (this.form.effectPeriod === '全天') {
      this.effectiveTime = [{ starttime: '00:00:00', endtime: '23:59:59' }]
    } else {
      this.effectiveTime = this.form.availableperiod.map(element => {
        return {
          starttime: element.period[0],
          endtime: element.period[1]
        }
      })
    }
    this.effectiveTime = JSON.stringify(this.effectiveTime)
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  .confidence-info{
    display: inline-block;
    height: 45px;
    line-height: 100%;
    vertical-align: middle;
    margin-left: -71px;
    &>span:nth-child(2){
      margin-left: 10px;
      margin-right: 10px;
    }
  }
  .el-slider{
    width:500px;
    display: inline-block;
    ::v-deep .el-slider__input{
      width:60px;
      margin-right:80px;
    }
  }
  .el-input,.el-textarea,.el-table {
      width: 500px
  }
  .tabrow-add{
    padding-left: 180px;
  }
  .mb5{
    width: 500px;
  }
  .el-icon-refresh{
    margin-left: 20px;
    font-size: 16px;
    &:hover{
      cursor: pointer;
    }
  }
  .el-button--text {
    margin-left: 15px;
  }
}
</style>
