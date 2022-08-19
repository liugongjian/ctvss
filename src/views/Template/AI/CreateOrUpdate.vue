<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="160px"
      >
        <el-form-item v-if="form.templateId" label="AI模板Id:" prop="templateId">
          <el-input v-model="form.templateId" class="fixed-width" disabled />
        </el-form-item>
        <el-form-item label="AI模板名称:" prop="templateName" class="form-with-tip">
          <el-input v-model="form.templateName" class="fixed-width" :disabled="!createOrUpdateFlag" />
          <div class="form-tip">4-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。模板名称不能重复。</div>
        </el-form-item>
        <el-form-item label="启动方式" prop="enableType">
          <el-radio-group v-model="form.enableType">
            <el-radio :label="1">自动开启</el-radio>
            <el-radio :label="2">手动开启</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="模板全局阈值" prop="threshold" :rules="thresholdRules">
          <el-input v-model="form.threshold" class="fixed-width" clearable placeholder="请输入模板全局阈值（百分比）" />
          <el-popover placement="right-start" title="模板全局阈值说明" width="450" trigger="hover" style="margin-left: 5px;">
            <div>
              1. 模板全局阈值单位为百分比，只能输入1-100之间的正整数<br>
              2. 单个算法阈值为空时，默认采用全局阈值；否则算法阈值覆盖全局阈值<br>
            </div>
            <i slot="reference" class="el-icon-info" />
          </el-popover>
        </el-form-item>
        <el-form-item label="模板概要" prop="description">
          <el-input v-model="form.description" class="fixed-width" type="textarea" placeholder="请输入模板概要" />
        </el-form-item>
        <el-form-item label="AI能力列表" prop="templateAbilityList">
          <div v-for="(ability, abilityIndex) in form.templateAbilityList" :key="ability.abilityId" class="ability-row">
            <el-select v-model="ability.aIAbilityId" placeholder="请选择AI能力" class="ability-row_selectbox" @change="loadAbilityAlgorithms(ability)">
              <el-option v-for="(item, index) in systemAbilityList" :key="index" :label="item.name" :value="item.aIAbilityId" />
            </el-select>
            <i class="el-icon-remove-outline remove-param-icon" @click="removeTemplateAIAbility(ability, abilityIndex)" />
            <el-table v-if="ability.aIAbilityId" :ref="'multipleTable' + abilityIndex" :data="ability.algorithms" size="mini" class="ability-row_table" border @selection-change="handleSelectionChange($event, ability)">
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column prop="name" label="算法类型" min-width="180" align="center" />
              <el-table-column prop="frameCutFrequency" label="截帧频率（秒）" width="200" align="center">
                <template slot-scope="{row, $index}">
                  <el-form-item :rules="frequencyRules" :prop="'templateAbilityList.' + abilityIndex + '.algorithms.' + $index + '.frameCutFrequency'" :inline-message="true">
                    <el-input v-model="row.frameCutFrequency" size="mini" />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column prop="threshold" label="算法阈值（百分比）" min-width="160" align="center">
                <template slot-scope="{row, $index}">
                  <el-form-item :rules="row.code !== '10014' && thresholdRules" :prop="'templateAbilityList.' + abilityIndex + '.algorithms.' + $index + '.threshold'" :inline-message="true">
                    <el-input v-model="row.threshold" size="mini" :disabled="row.threshold === null || row.code === '10014'" />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column prop="needConfig" label="配置算法" min-width="160" align="center">
                <template slot="header">
                  配置算法&nbsp;
                  <el-popover placement="right-start" title="条件值约束" width="400" trigger="hover">
                    <div>
                      1. 算法分为 需要配置 和 无需配置 两种<br>
                      2. 如果勾选了需要配置的算法，必须对其进行配置<br>
                      3. 无需配置的算法对应按钮会被置灰<br>
                    </div>
                    <i slot="reference" class="el-icon-info" />
                  </el-popover>
                </template>
                <template slot-scope="scope">
                  <el-button v-if="scope.row.needConfig" class="fixed-width-botton" :type="scope.row.algorithmMetadata ? 'success' : 'primary'" size="mini" @click="configMetadata(scope.row)">{{ scope.row.algorithmMetadata ? '已配置' : '配置' }}</el-button>
                  <el-button v-else type="default" class="fixed-width-botton" size="mini" disabled>配置</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="dashed-div" @click="addTemplateAIAbility">+ 添加</div>
        </el-form-item>
        <el-form-item label="">
          <el-button :loading="loading" type="primary" @click="submit">{{ createOrUpdateFlag ? '新建' : '确定' }}</el-button>
          <el-button @click="back">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <template v-if="showSetDialog">
      <component
        :is="setDialogType"
        :current-algorithm="currentAlgorithm"
        @on-close="closeSetDialog"
      />
    </template>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { AIAbility, AIAbilityAlgorithm } from '@/type/Template'
import { queryAITemplate, createAITemplate, updateAITemplate, getAIAbilityList, getAbilityAlgorithmList } from '@/api/template'
import setFaceRecognition from './Dialogs/SetFaceRecognition.vue'
import setMaskDetection from './Dialogs/SetMaskDetection.vue'
import setPeopleGathering from './Dialogs/SetPeopleGathering.vue'
import setDangerArea from './Dialogs/SetDangerArea.vue'

@Component({
  name: 'create-or-update-callback-template',
  components: {
    setFaceRecognition,
    setMaskDetection,
    setPeopleGathering,
    setDangerArea
  }
})
export default class extends Vue {
  private codeTypeMap: { [index: string]: string } = {
    '10001': 'setFaceRecognition',
    '10003': 'setMaskDetection',
    '10005': 'setPeopleGathering',
    '10006': 'setDangerArea'
  }
  private algorithmDefaultThresholdMap: any = {
    '10001': '68',
    '10002': null,
    '10003': '50',
    '10004': '50',
    '10005': '30',
    '10006': '30',
    '10007': null,
    '10008': '25',
    '10009': '10',
    '10010': '10',
    '10011': null,
    '10012': null
  }
  private showSetDialog = false
  private setDialogType = ''
  private breadCrumbContent = ''
  private createOrUpdateFlag = false
  private currentAlgorithm: any
  private loading = false
  private rules = {
    templateName: [
      { required: true, message: '请输入AI模板名称', trigger: 'blur' },
      { validator: this.validateTemplateName, trigger: 'blur' }
    ]
  }
  private frequencyRules = {
    validator: this.validateFrequency,
    trigger: ['blur', 'change']
  }
  private thresholdRules = {
    validator: this.validateThreshold,
    trigger: ['blur', 'change']
  }
  private systemAbilityList: Array<AIAbility> = []
  private systemAbilityAlgorithmsMap: { [index: string]: AIAbilityAlgorithm[] } = {}
  private form: any = {
    templateName: '',
    enableType: null,
    description: '',
    threshold: '',
    templateAbilityList: []
  }

  private async mounted() {
    this.getSystemAIAbilityList()
    try {
      this.breadCrumbContent = this.$route.meta.title
      this.createOrUpdateFlag = this.$route.path !== '/template/ai/update'
      let query: any = this.$route.query
      if (query.templateId) {
        this.loading = true
        const res = await queryAITemplate({ templateId: query.templateId })
        res.threshold && (res.threshold = (res.threshold * 100).toString())
        res.threshold === 0 && (res.threshold = '')
        this.form = {
          ...res,
          templateId: query.templateId,
          templateAbilityList: []
        }
        const algorithmsGroupbyAbility: any = {}
        res.algorithms.forEach((algorithm: any) => {
          if (algorithm.aIAbilityId in algorithmsGroupbyAbility) {
            algorithmsGroupbyAbility[algorithm.aIAbilityId].push(algorithm)
          } else {
            algorithmsGroupbyAbility[algorithm.aIAbilityId] = [algorithm]
          }
        })
        const promiseArray = Object.keys(algorithmsGroupbyAbility).map(key => this.getSystemAbilityAlgorithmList(key))
        await Promise.all(promiseArray)
        for (let key in algorithmsGroupbyAbility) {
          const algorithms = algorithmsGroupbyAbility[key]
          const systemAlgorithms = this.systemAbilityAlgorithmsMap[key]
          const selectedRow: any = []
          const combinedAlgorithms = systemAlgorithms.map(systemAlgorithm => {
            const index = algorithms.findIndex((algorithm: any) => systemAlgorithm.aIAbilityAlgorithmId === algorithm.aIAbilityAlgorithmId)
            const rowData = {
              ...systemAlgorithm
            }
            if (index !== -1) {
              rowData.algorithmMetadata = algorithms[index].algorithmMetadata
              rowData.frameCutFrequency = algorithms[index].frameCutFrequency
              if (systemAlgorithm.code === '10001' || systemAlgorithm.code === '10010') {
                rowData.threshold = algorithms[index].threshold || ''
              } else {
                if (!this.algorithmDefaultThresholdMap[systemAlgorithm.code]) {
                  rowData.threshold = null
                } else {
                  rowData.threshold = (algorithms[index].threshold * 100).toString()
                }
              }
              rowData.threshold === '0' && (rowData.threshold = '')
              selectedRow.push(rowData)
            }
            return rowData
          })
          this.form.templateAbilityList.push({
            aIAbilityId: key,
            algorithms: combinedAlgorithms,
            selectedRow: selectedRow
          })
        }
        this.initTableSelection()
        this.loading = false
      } else {
        this.form = {
          templateName: '',
          enableType: 1,
          description: '',
          threshold: '70',
          templateAbilityList: []
        }
      }
    } catch (e) {
      this.loading = false
    }
  }

  private validateFrequency(rule: any, value: string, callback: Function) {
    const frequenceReg = /^\d+$/
    if (!frequenceReg.test(value)) {
      callback(new Error('截图频率必须是正整数'))
    } else {
      callback()
    }
  }

  private validateThreshold(rule: any, value: string, callback: Function) {
    const thresholdReg = /^\d+$/
    if ((value !== '' && value !== null) && (!thresholdReg.test(value) || Number(value) < 1 || Number(value) > 100)) {
      callback(new Error('请输入1-100之间的正整数'))
    } else {
      callback()
    }
  }

  private validateTemplateName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-()（）_\s]{4,64}$/u.test(value)) {
      callback(new Error('AI模板名称格式错误'))
    } else if (/^[\s]|[\s]$/.test(value)) {
      callback(new Error('不能以空格作为名称的首尾。'))
    } else {
      callback()
    }
  }

  private back() {
    this.$router.push('/template/ai')
  }

  private configMetadata(algorithm: AIAbilityAlgorithm) {
    if (algorithm.code in this.codeTypeMap) {
      this.currentAlgorithm = algorithm
      this.setDialogType = this.codeTypeMap[algorithm.code]
      this.setDialogType && (this.showSetDialog = true)
    } else {
      this.$message.error(`未配置的code类型：${algorithm.code}`)
    }
  }

  private closeSetDialog(params: any) {
    this.showSetDialog = false
    if (params.refresh) {
      this.currentAlgorithm.algorithmMetadata = params.val
    }
  }

  private initTableSelection() {
    this.$nextTick(() => {
      this.form.templateAbilityList.forEach((templateAbility: any, index: any) => {
        templateAbility.selectedRow.forEach((row: any) => {
          const refTables: any = this.$refs['multipleTable' + index]
          refTables[0].toggleRowSelection(row, true)
        })
      })
    })
  }

  private handleSelectionChange(value: any, ability: any) {
    ability.selectedRow = value
  }

  private addTemplateAIAbility() {
    this.form.templateAbilityList.push({
    })
  }
  private removeTemplateAIAbility(ability: any, index: any) {
    this.form.templateAbilityList.splice(index, 1)
  }

  private async getSystemAIAbilityList() {
    try {
      const res = await getAIAbilityList({
        pageNum: 1,
        pageSize: 999
      })
      this.systemAbilityList = res.aIAbilities
    } catch (e) {
      // 异常处理
    }
  }

  private async getSystemAbilityAlgorithmList(aIAbilityId: string) {
    try {
      const res = await getAbilityAlgorithmList({ aIAbilityId })
      const algorithms = res.algorithms.map((algorithm: any) => ({
        ...algorithm,
        aIAbilityAlgorithmId: algorithm.algorithmId,
        frameCutFrequency: 5,
        threshold: this.algorithmDefaultThresholdMap[algorithm.code],
        algorithmMetadata: '',
        aIAbilityName: res.detail,
        algorithmName: algorithm.name
      }))
      this.systemAbilityAlgorithmsMap[aIAbilityId] = algorithms
    } catch (e) {
      this.$message.error(`查询id为 ${aIAbilityId} 的AI能力算法列表失败！`)
      return Promise.reject(new Error(`查询id为 ${aIAbilityId} 的AI能力算法列表失败`))
    }
  }

  private async loadAbilityAlgorithms(ability: AIAbility) {
    try {
      const aIAbilityId = ability.aIAbilityId
      if (this.systemAbilityAlgorithmsMap[aIAbilityId]) {
        this.$set(ability, 'algorithms', JSON.parse(JSON.stringify(this.systemAbilityAlgorithmsMap[aIAbilityId])))
      } else {
        const res = await getAbilityAlgorithmList({ aIAbilityId })
        const algorithms = res.algorithms.map((algorithm: any) => ({
          ...algorithm,
          aIAbilityAlgorithmId: algorithm.algorithmId,
          frameCutFrequency: 5,
          threshold: this.algorithmDefaultThresholdMap[algorithm.code],
          algorithmMetadata: '',
          aIAbilityName: res.detail,
          algorithmName: algorithm.name
        }))
        this.systemAbilityAlgorithmsMap[aIAbilityId] = algorithms
        this.$set(ability, 'algorithms', algorithms)
      }
    } catch (e) {
      // 异常处理
      console.log('e: ', e)
    }
  }

  private submit() {
    if (!this.form.templateAbilityList || !this.form.templateAbilityList.length) {
      this.$message.error('AI模板中至少配置一项AI能力！')
      return
    }
    const abilityIdList = this.form.templateAbilityList.map((templateAbility: any) => templateAbility.aIAbilityId)
    const hasDuplicate = abilityIdList.some((id: any) => abilityIdList.indexOf(id) !== abilityIdList.lastIndexOf(id))
    if (hasDuplicate) {
      this.$message.error('存在重复AI能力，请检查！')
      return
    }
    const noRowSelected = this.form.templateAbilityList.some((templateAbility: any) => !templateAbility.selectedRow || !templateAbility.selectedRow.length)
    if (noRowSelected) {
      this.$message.error('AI能力中至少配置一种算法！')
      return
    }
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        const algorithms: any = []
        this.form.templateAbilityList.forEach((ability: AIAbility) => {
          if (ability && ability.selectedRow) {
            algorithms.push(...ability.selectedRow.map((algorithm: any) => ({
              aIAbilityId: ability.aIAbilityId,
              aIAbilityAlgorithmId: algorithm.aIAbilityAlgorithmId,
              algorithmMetadata: algorithm.needConfig ? algorithm.algorithmMetadata : '',
              frameCutFrequency: algorithm.frameCutFrequency || undefined,
              threshold: algorithm.threshold ? (algorithm.code === '10001' || algorithm.code === '10010' ? algorithm.threshold : (Number(algorithm.threshold) / 100).toString()) : algorithm.threshold,
              needConfig: algorithm.needConfig,
              aIAbilityName: algorithm.aIAbilityName,
              algorithmName: algorithm.algorithmName
            })))
          }
        })
        let aIAbilityName = ''
        let algorithmName = ''
        const needConfig = algorithms.some((algorithm: any) => {
          if (algorithm.needConfig && !algorithm.algorithmMetadata) {
            aIAbilityName = algorithm.aIAbilityName
            algorithmName = algorithm.algorithmName
          }
          return algorithm.needConfig && !algorithm.algorithmMetadata
        })
        if (needConfig) {
          this.$message.error(`${aIAbilityName}的${algorithmName}算法尚未配置！`)
          return
        }
        const needDefaultThreshold = algorithms.some((algorithm: any) => {
          if (algorithm.threshold === '' && this.form.threshold === '') {
            aIAbilityName = algorithm.aIAbilityName
            algorithmName = algorithm.algorithmName
          }
          return algorithm.threshold === '' && this.form.threshold === ''
        })
        if (needDefaultThreshold) {
          this.$message.error(`${aIAbilityName}的${algorithmName}算法配置信息不完整！`)
          return
        }
        this.loading = true
        const param: any = {
          templateId: this.form.templateId || undefined,
          templateName: this.form.templateName,
          description: this.form.description,
          enableType: this.form.enableType,
          threshold: this.form.threshold ? (this.form.threshold / 100).toString() : undefined,
          algorithms: algorithms.map((algorithm: any) => ({ ...algorithm, threshold: algorithm.threshold || undefined }))
        }
        try {
          if (this.form.templateId) {
            await updateAITemplate(param)
          } else {
            await createAITemplate(param)
          }
          this.loading = false
          this.$message.success(this.form.templateId ? 'AI模板编辑成功' : 'AI模板创建成功')
          this.back()
        } catch (e) {
          this.loading = false
          this.$message.error(e && e.message)
        }
      } else {
        console.log('校验不通过')
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.fixed-width.el-input,
.fixed-width.el-select,
.fixed-width.el-textarea {
  width: 600px;
}

.ability-row {
  margin-bottom: 10px;

  &_selectbox {
    margin-bottom: 8px;
  }

  &_table {
    margin-left: 40px;
    width: 60%;
  }
}

.remove-param-icon {
  font-size: 18px;
  margin-left: 10px;
}

.dashed-div {
  width: 600px;
  height: 36px;
  min-width: 600px;
  text-align: center;
  cursor: pointer;
  border: 1px dashed transparent;
  border-radius: 4px;
  background:
    linear-gradient(white, white) padding-box,
    repeating-linear-gradient(-45deg, #dcdfe6 0, #dcdfe6 0.5em, white 0, white 0.85em);
}

.fixed-width-botton {
  width: 68px;
}
</style>
