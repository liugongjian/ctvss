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
          <div class="form-tip">4-16位，可包含大小写字母、数字、中文、中划线。模板名称不能重复。</div>
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
                  <el-form-item :rules="thresholdRules" :prop="'templateAbilityList.' + abilityIndex + '.algorithms.' + $index + '.threshold'" :inline-message="true">
                    <el-input v-model="row.threshold" size="mini" />
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
    <SetFaceLibrary
      v-if="setFaceLibraryDialog"
      :current-algorithm="currentAlgorithm"
      @on-close="closeSetFaceLibraryDialog"
    />
    <SetNumThreshold
      v-if="setNumThresholdDialog"
      :current-algorithm="currentAlgorithm"
      @on-close="closeSetNumThresholdDilaog"
    />
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { AIAbility, AIAbilityAlgorithm } from '@/type/template'
import { queryAITemplate, createAITemplate, updateAITemplate, getAIAbilityList, getAbilityAlgorithmList } from '@/api/template'
import SetFaceLibrary from './dialogs/setFaceLibrary.vue'
import SetNumThreshold from './dialogs/setNumThreshold.vue'

@Component({
  name: 'create-or-update-callback-template',
  components: {
    SetFaceLibrary,
    SetNumThreshold
  }
})
export default class extends Vue {
  private breadCrumbContent = ''
  private createOrUpdateFlag = false
  private loading = false
  private setFaceLibraryDialog = false
  private setNumThresholdDialog = false
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
  private systemAbilityAlgorithmsMap: {[index: string]: AIAbilityAlgorithm[]} = {}
  private form: any = {
    templateName: '',
    enableType: 2,
    description: '',
    threshold: 60,
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
          console.log('algorithms: ', algorithms)
          const systemAlgorithms = this.systemAbilityAlgorithmsMap[key]
          const selectedRow: any = []
          const combinedAlgorithms = systemAlgorithms.map(systemAlgorithm => {
            const index = algorithms.findIndex((algorithm: any) => systemAlgorithm.aIAbilityAlgorithmId == algorithm.aIAbilityAlgorithmId)
            const rowData = {
              ...systemAlgorithm
            }
            if (index !== -1) {
              rowData.algorithmMetadata = algorithms[index].algorithmMetadata
              rowData.frameCutFrequency = algorithms[index].frameCutFrequency
              rowData.threshold = algorithms[index].threshold
              selectedRow.push(rowData)
            }
            return rowData
          })
          this.form.templateAbilityList.push({
            aIAbilityId: key,
            algorithms: combinedAlgorithms,
            selectedRow: selectedRow
          })
          console.log('this.form.templateAbilityList: ', this.form.templateAbilityList)
        }
        this.initTableSelection()
        this.loading = false
      } else {
        // do nothing
      }
    } catch (e) {
      console.log('e: ', e)
      this.loading = false
    }
  }

  private validateFrequency(rule: any, value: string, callback: Function) {
    console.log('value: ', value)
    const frequenceReg = /^\d+$/
    if (!frequenceReg.test(value)) {
      callback(new Error('截图频率必须是正整数'))
    } else {
      callback()
    }
  }

  private validateThreshold(rule: any, value: string, callback: Function) {
    const thresholdReg = /^\d+$/
    if (value && (!thresholdReg.test(value) || Number(value) < 1 || Number(value) > 100)) {
      callback(new Error('请输入1-100之间的正整数'))
    } else {
      callback()
    }
  }

  private validateTemplateName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-]{4,16}$/u.test(value)) {
      callback(new Error('AI模板名称格式错误'))
    } else {
      callback()
    }
  }

  private back() {
    this.$router.push('/template/ai')
  }

  private configMetadata(algorithm: AIAbilityAlgorithm) {
    this.currentAlgorithm = algorithm
    switch (algorithm.code) {
      case '10001':
        this.setFaceLibraryDialog = true
        break
      case '10002':
        this.setNumThresholdDialog = true
        break
      default:
        this.$message.error(`未配置的code类型：${algorithm.code}`)
    }
  }

  private closeSetFaceLibraryDialog(params: any) {
    this.setFaceLibraryDialog = false
    if (params.refresh) {
      console.log('params.val: ', params.val)
      this.currentAlgorithm.algorithmMetadata = params.val
    }
  }

  private closeSetNumThresholdDilaog(params: any) {
    this.setNumThresholdDialog = false
    if (params.refresh) {
      console.log('params.val: ', params.val)
      this.currentAlgorithm.algorithmMetadata = params.val
    }
  }

  private initTableSelection() {
    this.$nextTick(() => {
      this.form.templateAbilityList.forEach((templateAbility: any, index: any) => {
        templateAbility.selectedRow.forEach((row: any) => {
          const refTables: any = this.$refs['multipleTable' + index]
          console.log('refTable: ', refTables[0])
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
        threshold: 98,
        algorithmMetadata: ''
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
          threshold: 98,
          algorithmMetadata: ''
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
      this.$message.error('AI模板需要配置至少一个AI能力，请检查！')
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
      this.$message.error('AI能力下需要至少选择一个AI算法，请检查！')
      return
    }
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        const algorithms: any = []
        this.form.templateAbilityList.forEach((ability: AIAbility) => {
          if (ability && ability.selectedRow) {
            algorithms.push(...ability.selectedRow.map(algorithm => ({
              aIAbilityId: ability.aIAbilityId,
              aIAbilityAlgorithmId: algorithm.aIAbilityAlgorithmId,
              algorithmMetadata: algorithm.needConfig ? algorithm.algorithmMetadata : '',
              frameCutFrequency: algorithm.frameCutFrequency || undefined,
              threshold: algorithm.threshold || undefined,
              needConfig: algorithm.needConfig
            })))
          }
        })
        const needConfig = algorithms.some((algorithm: any) => algorithm.needConfig && !algorithm.algorithmMetadata)
        if (needConfig) {
          this.$message.error('存在需要配置但尚未配置的算法，请检查！')
          return
        }
        this.loading = true
        const param: any = {
          templateId: this.form.templateId || undefined,
          templateName: this.form.templateName,
          description: this.form.description,
          enableType: this.form.enableType,
          threshold: this.form.threshold ? Number(this.form.threshold) : undefined,
          algorithms: algorithms
        }
        console.log('this.form.templateId: ', this.form.templateId)
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
  .fixed-width.el-input, .fixed-width.el-select, .fixed-width.el-textarea {
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
  background: linear-gradient(white,white) padding-box,
  repeating-linear-gradient(-45deg,#dcdfe6 0, #dcdfe6 0.5em, white 0,white 0.85em);
}

.fixed-width-botton {
  width: 68px;
}
</style>
