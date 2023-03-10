<template>
  <div class="ai-service-config">
    <el-button type="text" @click="bindingApp">+ 添加AI应用</el-button>
    <span class="config-title">已配置应用：</span>
    <el-table
      ref="nvrTable"
      v-loading="loading"
      :data="ipcAiSelectedList"
      fit
    >
      <el-table-column show-overflow-tooltip :prop="ipcAiConfigEnum.AppName" label="已添加应用" min-width="120">
        <template slot-scope="scope">
          {{ scope.row[ipcAiConfigEnum.AppName] }}
        </template>
      </el-table-column>
      <el-table-column :prop="ipcAiConfigEnum.AlgorithmName" label="算法类型">
        <template slot-scope="scope">
          {{ scope.row[ipcAiConfigEnum.AlgorithmName] }}
        </template>
      </el-table-column>
      <el-table-column :prop="ipcAiConfigEnum.AnalyseType" label="分析类型">
        <template slot-scope="scope">
          {{ scope.row[ipcAiConfigEnum.AnalyseType] }}
        </template>
      </el-table-column>
      <el-table-column :prop="ipcAiConfigEnum.AnalyseRate" label="分析频率">
        <template slot-scope="scope">
          {{ scope.row[ipcAiConfigEnum.AnalyseRate] }}
        </template>
      </el-table-column>
      <el-table-column :prop="ipcAiConfigEnum.BillingMode" label="计费模式">
        <template slot-scope="scope">
          {{ scope.row[ipcAiConfigEnum.BillingMode] }}
        </template>
      </el-table-column>
      <el-table-column :prop="ipcAiConfigEnum.Remain" label="余量">
        <template slot-scope="scope">
          {{ scope.row[ipcAiConfigEnum.Remain] }}
        </template>
      </el-table-column>
      <el-table-column :prop="ipcAiConfigEnum.RemainZones" label="待配置检测区域">
        <template slot-scope="scope">
          {{ scope.row[ipcAiConfigEnum.RemainZones] }}
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="action" width="80" fixed="right">
        <el-button type="text">删除</el-button>
      </el-table-column>
    </el-table>
    <span class="config-description">
      <i class="el-icon-warning-outline" />
      {{ configDescription }}
    </span>
    <AiServiceBindingDialog v-if="showBindingDialog" @on-close="closeDialog" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { BillingEnum, BillingModeEnum, IpcAiConfigEnum } from '@vss/device/enums/billing'
import AiServiceBindingDialog from './AiServiceBindingDialog.vue'
@Component({
  name: 'IpcAiServiceConfig',
  components: {
    AiServiceBindingDialog
  }
})
export default class extends Vue {
  private ipcAiConfigEnum = IpcAiConfigEnum

  private loading = false
  private configDescription = '待配置检测区域的应用需在视频流上线后手动进行区域框选并启用AI分析，其他应用将在视频流上线后将自动启用AI分析'
  private showBindingDialog = false
  private billingModeForm = {
    [BillingEnum.BillingMode]: BillingModeEnum.Packages,
    [BillingEnum.RecordStream]: 1,
    [BillingEnum.RecordTemplate]: '',
    [BillingEnum.Resource]: ''
  }

  private ipcAiSelectedList = []

  private async mounted() {
    await this.getConfigList()
  }

  private async getConfigList() {
    try {
      this.loading = true
      await new Promise(resolve => {
        setTimeout(() => {
          resolve(this.ipcAiSelectedList = [{}])
        }, 500)
      })
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.loading = false
    }
  }

  private bindingApp() {
    this.showBindingDialog = true
  }

  private closeDialog(refresh) {
    this.showBindingDialog = false
    refresh && this.getConfigList()
  }
}
</script>
<style lang="scss" scoped>
.ai-service-config {
  .config-title,
  .config-description {
    display: block;
    color: $textGrey;
  }
}
</style>