<template>
  <div v-loading="loading.tab" class="ai-service-config">
    <div v-if="appNums > 0">
      <el-button v-if="selectedList.length < appNums" type="text" @click="bindingApp">+ 绑定AI应用</el-button>
      <span class="config-title">已配置应用：</span>
      <el-table
        ref="nvrTable"
        v-loading="loading.table"
        :data="selectedList"
        max-height="300"
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
        <el-table-column :prop="ipcAiConfigEnum.Remain" label="余量" min-width="110">
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
          <template slot-scope="scope">
            <el-button type="text" @click="unBindingApp(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <span class="config-description">
        <i class="el-icon-warning-outline" />
        {{ configDescription }}
      </span>
      <AiServiceBindingDialog
        v-if="showBindingDialog"
        :selected-list="selectedList"
        @on-close="closeDialog"
      />
    </div>
    <div v-else>
      <span class="config-description">
        <i class="el-icon-warning-outline" />
        暂无创建好的AI应用，请先
        <el-button type="text">创建AI应用</el-button>
        后，再添加到设备上。
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { BillingModeEnum, IpcAiConfigEnum } from '@vss/device/enums/billing'
import { BillingModeType, ResourceAiType } from '@vss/device/dicts/resource'
import { getAppList } from '@vss/ai/api'
import AiServiceBindingDialog from './AiServiceBindingDialog.vue'
@Component({
  name: 'IpcAiServiceConfig',
  components: {
    AiServiceBindingDialog
  }
})
export default class extends Vue {
  private ipcAiConfigEnum = IpcAiConfigEnum
  
  private configDescription = '待配置检测区域的应用需在视频流上线后手动进行区域框选并启用AI分析，其他应用将在视频流上线后将自动启用AI分析'
  private showBindingDialog = false

  private appNums = 0
  private selectedList = []
  private loading = {
    tab: false,
    table: false
  }

  private async mounted() {
    await this.getAppNums()
    this.appNums && this.getConfigList()
  }

  private async getConfigList() {
    try {
      this.loading.table = true
      await new Promise(resolve => {
        setTimeout(() => {
          resolve(this.selectedList = [])
        }, 500)
      })
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.loading.table = false
    }
  }

  private async getAppNums() {
    try {
      this.loading.tab = true
      const { totalNum } = await getAppList({ abilityId: 0 })
      this.appNums = totalNum
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.loading.tab = false
    }
  }

  private bindingApp() {
    this.showBindingDialog = true
  }

  private unBindingApp(appId: number) {
    const target = this.selectedList.findIndex(app => app.id === appId)
    if (target >= 0) this.selectedList.splice(target, 1)
  }

  private closeDialog(data) {
    this.showBindingDialog = false
    console.log(data)
    Array.isArray(data) && (
      this.selectedList.push(...data.map(item => {
        return item.billingMode === BillingModeEnum.Packages
          ? {
            [IpcAiConfigEnum.AppId]: item.id,
            [IpcAiConfigEnum.AppName]: item.name,
            [IpcAiConfigEnum.AlgorithmName]: item.abilityName,
            [IpcAiConfigEnum.AnalyseType]: ResourceAiType[item.analyseType],
            [IpcAiConfigEnum.AnalyseRate]: item.analyseType,
            [IpcAiConfigEnum.BillingMode]: BillingModeType[item.billingMode],
            [IpcAiConfigEnum.Remain]: `${item.resource['remainDeviceCount']}路 / ${item.resource['totalDeviceCount']}路`,
            [IpcAiConfigEnum.RemainZones]: `${item.resource['storageTime']}天`,
          }
          : {
            [IpcAiConfigEnum.AppId]: item.id,
            [IpcAiConfigEnum.AppName]: item.name,
            [IpcAiConfigEnum.AlgorithmName]: item.abilityName,
            [IpcAiConfigEnum.AnalyseType]: ResourceAiType[item.analyseType],
            [IpcAiConfigEnum.AnalyseRate]: item.analyseType,
            [IpcAiConfigEnum.BillingMode]: BillingModeType[item.billingMode],
            [IpcAiConfigEnum.Remain]: '-',
            [IpcAiConfigEnum.RemainZones]: `${item.resource['storageTime']}天`,
          }
      }))
    )
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