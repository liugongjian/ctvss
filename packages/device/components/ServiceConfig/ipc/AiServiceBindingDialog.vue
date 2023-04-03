<template>
  <el-dialog
    class="binding-dialog"
    title="绑定AI应用"
    center
    :visible="true"
    append-to-body
    @close="closeDialog"
  >
    <el-form
      ref="bindingForm"
      :model="configForm"
      :rules="rules"
      label-width="0px"
    >
      <el-form-item prop="resource">
        <billing-mode-selector
          ref="configForm"
          v-model="billingModeForm"
          :real-package-remain="realPackageRemain"
          :resource-type="resourceTypeEnum.AI"
        />
      </el-form-item>
      <div class="resource-title">
        <span class="config-title">待配置AI应用：</span>
        <span class="config-title__after">{{ `已选中 ${selectedApps.length} 项` }}</span>
      </div>
      <el-form-item prop="apps">
        <el-tabs
          v-model="activeTabId"
          v-loading="loading.abilityList"
          type="card"
          @tab-click="handleTabType"
        >
          <el-tab-pane
            v-for="item in tabInfo"
            :key="item.id"
            :label="item.name+' ('+item.aiApps+')'"
            :name="item.id"
          >
            <el-table
              :ref="`appTable${item.id}`"
              v-loading="loading.appList"
              :data="aiApps"
              tooltip-effect="dark"
              max-height="350"
              cell-class-name="tableCell"
              @row-click="rowClick"
              @selection-change="handleSelectionChange"
              @select-all="handleSelectionChange"
            >
              <el-table-column type="selection" prop="selection" class-name="col-selection" width="55" fixed="left" />
              <el-table-column label="应用名称" min-width="120">
                <template slot-scope="scope">
                  <span class="app-name">{{ scope.row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="算法类型" min-width="120">
                <template slot-scope="scope">{{ scope.row.algorithm.name }}</template>
              </el-table-column>
              <el-table-column prop="analyseType" label="分析类型">
                <template slot-scope="scope"><span>{{ resourceAiType[scope.row.analyseType] }}</span></template>
              </el-table-column>
              <el-table-column prop="description" label="描述" show-overflow-tooltip />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button type="primary" @click="submit">确 定</el-button>
      <el-button @click="closeDialog(false)">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { BillingEnum, BillingModeEnum, ResourceTypeEnum } from '@vss/device/enums/billing'
import BillingModeSelector from '../components/BillingModeSelector.vue'
import { getAppList, getAbilityList } from '@vss/ai/api'
import { ResourceAiType } from '@vss/ai/dics/app'
@Component({
  name: 'IpcAiServiceBindingDialog',
  components: {
    BillingModeSelector
  }
})
export default class extends Vue {
  @Prop({ default: () => [] })
  private selectedList: Array<any>

  @Prop({ default: () => new Object() })
  private realPackageRemain

  private resourceTypeEnum = ResourceTypeEnum
  private billingEnum = BillingEnum
  private billingModeForm = {
    [BillingEnum.BillingMode]: '',
    [BillingEnum.ResourceId]: '',
    [BillingEnum.Resource]: {}
  }
  
  private activeTabId: Number = 0
  private resourceAiType: any = ResourceAiType
  private tabInfo: any = []
  private aiApps: any = []
  private selectedAppIdsSet = new Set()
  private selectedApps: Array<any> = []
  private configForm = {
    resource: {},
    apps: []
  }
  private rules = {
    apps: [
      { validator: this.validateApps }
    ]
  }
  private loading = {
    appList: false,
    abilityList: false
  }

  @Watch('billingModeForm.billingMode')
  private billingModeChange() {
    this.getAppList()
  }

  private async mounted() {
    await this.getAbilityList()
    this.activeTabId = this.tabInfo[0] && this.tabInfo[0].id
    await this.getAppList()
  }

  /**
   * 切换Tab
   */
  private async handleTabType() {
    this.getAppList()
  }

  /**
   * 点击表行勾选当前行
   */
  private rowClick(row) {
    (this.$refs[`appTable${this.activeTabId}`][0] as any).toggleRowSelection(row)
  }

  /**
   * 获取能力类型
   */
  private async getAbilityList() {
    try {
      this.loading.abilityList = true
      const { aiAbilityList } = await getAbilityList({})
      aiAbilityList.forEach(aiAbility => {
        aiAbility.aiApps = Math.abs(aiAbility.aiApps - this.selectedList.filter(item => item.algorithmType === aiAbility.name).length)
      })
      this.tabInfo = aiAbilityList
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.abilityList = false
    }
  }

  /**
   * 查询应用列表
   */
  private async getAppList() {
    try {
      this.loading.appList = true
      const { aiApps } = await getAppList({ abilityId: this.activeTabId })
      this.aiApps = aiApps.filter(aiApp => {
        return this.selectedList.findIndex(item => item.appId === aiApp.id) === -1
      })
      if (this.billingModeForm[BillingEnum.BillingMode] === BillingModeEnum.OnDemand) {
        this.aiApps = this.aiApps.filter(item => item.analyseType !== 'AI-300')
      }
      await this.$nextTick(() => this.toggleSelection())
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.appList = false
    }
  }

  /**
   * 表格多选框变化
   */
  private handleSelectionChange(apps) {
    // 初始化勾选项时不触发
    if (this.loading.appList) return
    this.aiApps.forEach(row => {
      if (apps.some(app => (app as any).id === row.id)) {
        if (!this.selectedAppIdsSet.has(row.id)) {
          this.selectedAppIdsSet.add(row.id)
          this.selectedApps.push(row)
        }
      } else {
        this.selectedAppIdsSet.delete(row.id)
        const target = this.selectedApps.findIndex(app => app.id === row.id)
        if (target >= 0) this.selectedApps.splice(target, 1)
      }
    })
  }

  /**
   * 初始化选择默认勾选项
   */
  private toggleSelection() {
    this.aiApps.forEach(row => {
      if (this.selectedAppIdsSet.has(row.id)) {
        (this.$refs[`appTable${this.activeTabId}`][0] as any).toggleRowSelection(row)
      }
    })
  }

  /**
   * 提交
   */
  private async submit() {
    const bindingForm: any = this.$refs.bindingForm
    const configForm: any = this.$refs.configForm
    const configFormValid = await configForm.validateConfigForm()
    bindingForm.validate((valid) => {
      if (valid && configFormValid) {
        this.closeDialog(this.selectedApps.map(app => {
          return {
            ...app,
            ...this.billingModeForm
          }
        }))
      }
    })
  }

  private closeDialog(data) {
    this.$emit('on-close', data)
  }

  /**
   * 校验app
   */
  private validateApps(rule: any, value: string, callback: Function) {
    const remainDeviceCount = this.billingModeForm[BillingEnum.BillingMode] === BillingModeEnum.Packages ? this.billingModeForm[BillingEnum.Resource]['remainDeviceCount'] : Infinity
    if (!this.selectedApps.length) {
      callback(new Error('请选择AI应用'))
    } else if (remainDeviceCount !== undefined && this.selectedApps.length > remainDeviceCount) {
      callback(new Error('所选的AI应用数量须不大于AI资源包剩余数量'))
    } else {
      callback()
    }
  }
}
</script>
<style lang="scss" scoped>
.binding-dialog {
  .el-form {
    margin: 0;

    .el-form-item {
      max-width: 100%;
    }
  }

  .resource-title {
    display: flex;
    margin-bottom: 10px;

    .config-title {
      color: $textGrey;

      &__after {
        color: $primary;
      }
    }
  }

  ::v-deep .el-dialog__body {
    max-height: 60vh;
    overflow: auto;
    padding-top: 0;
    margin-bottom: 25px;
  }

  ::v-deep .el-table__row {
    cursor: pointer;
  }

  .el-pagination {
    ::v-deep .el-select {
      max-width: 100px !important;
    }
  }
}
</style>