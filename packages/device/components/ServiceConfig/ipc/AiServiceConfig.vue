<template>
  <div v-loading="loading.tab" class="ai-service-config">
    <div v-if="appNums > 0">
      <el-button
        v-if="selectedList.length < appNums && !isView"
        type="text"
        @click="bindingApp"
      >
        + 绑定AI应用
      </el-button>
      <span class="config-title">已配置应用：</span>
      <el-table
        ref="nvrTable"
        v-loading="loading.table"
        :data="realSelectedList"
        max-height="300"
        fit
      >
        <el-table-column
          show-overflow-tooltip
          :prop="ipcAiConfigEnum.AppName"
          label="已添加应用"
          min-width="120"
        >
          <template slot-scope="{ row }">
            {{ row[ipcAiConfigEnum.AppName] }}
          </template>
        </el-table-column>
        <el-table-column :prop="ipcAiConfigEnum.AlgorithmType" label="算法类型">
          <template slot-scope="{ row }">
            {{ row[ipcAiConfigEnum.AlgorithmType] }}
          </template>
        </el-table-column>
        <el-table-column :prop="ipcAiConfigEnum.AnalyseType" label="分析类型">
          <template slot-scope="{ row }">
            {{ resourceAiType[row[ipcAiConfigEnum.AnalyseType]] }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="false"
          :prop="ipcAiConfigEnum.AnalyseRate"
          label="分析频率"
        >
          <template slot-scope="{ row }">
            {{ row[ipcAiConfigEnum.AnalyseRate] }}
          </template>
        </el-table-column>
        <el-table-column :prop="ipcAiConfigEnum.BillingMode" label="计费模式">
          <template slot-scope="{ row }">
            {{ billingModeType[row[ipcAiConfigEnum.BillingMode]] }}
          </template>
        </el-table-column>
        <el-table-column label="余量" min-width="110">
          <template slot-scope="{ row }">
            {{ remain(row) }}
          </template>
        </el-table-column>
        <!-- <el-table-column
          :prop="ipcAiConfigEnum.ConfigCheckArea"
          label="待配置检测区域"
        >
          <template slot-scope="{ row }">
            {{ row[ipcAiConfigEnum.ConfigCheckArea] === 'true' ? '是' : '否' }}
          </template>
        </el-table-column> -->
        <el-table-column :prop="ipcAiConfigEnum.Status" label="状态">
          <template slot-scope="{ row }">
            <status-badge
              :status="row[ipcAiConfigEnum.Status] === '0' ? 'off' : 'on'"
            />
            {{ row[ipcAiConfigEnum.Status] === '0' ? '停用' : '启用' }}
          </template>
        </el-table-column>
        <el-table-column v-if="checkPermission(['AdminDevice'])" label="操作" prop="action" width="180" fixed="right">
          <template slot-scope="{ row }">
            <el-button
              v-if="isView && row[ipcAiConfigEnum.NeedConfig] === '1'"
              type="text"
              @click="openCanvasDialog(row)"
            >
              算法配置
            </el-button>
            <el-button
              :disabled="row[ipcAiConfigEnum.Status] !== '0'"
              type="text"
              @click="unBindingApp(row.id)"
            >
              删除
            </el-button>
            <el-button
              v-if="isView && row[ipcAiConfigEnum.Status] === '0'"
              type="text"
              @click="changeRunningStatus(row)"
            >
              启用
            </el-button>
            <el-button
              v-if="isView && row[ipcAiConfigEnum.Status] === '1'"
              type="text"
              @click="changeRunningStatus(row)"
            >
              停用
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- <span v-if="!isView" class="config-description">
        <i class="el-icon-warning-outline" />
        {{ configDescription }}
      </span> -->
      <AiServiceBindingDialog
        v-if="showBindingDialog"
        :selected-list="selectedList"
        :real-package-remain="realPackageRemainObj"
        @on-close="closeDialog"
      />
      <!-- canvas画线 -->
      <algo-config
        v-if="canvasDialog"
        :device-id="configManager.deviceId"
        :canvas-if="canvasDialog"
        :config-algo-info="configAlgoInfo"
        :frame-image="frameImage"
      />
    </div>
    <div v-else>
      <span class="config-description">
        <i class="el-icon-warning-outline" />
        暂无创建好的AI应用，请先
        <el-button type="text" @click="showCreateAiAppDialog = true">创建AI应用</el-button>
        后，再添加到设备上。
      </span>
    </div>
    <ai-app-create-dialog
      v-model="showCreateAiAppDialog"
      @refresh="getAppNums"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Inject } from 'vue-property-decorator'
import {
  BillingModeEnum,
  IpcAiConfigEnum,
  ConfigModeEnum
} from '@vss/device/enums/billing'
import { BillingModeType, ResourceAiType } from '@vss/device/dicts/resource'
import { getAppList } from '@vss/ai/api'
import AiServiceBindingDialog from './AiServiceBindingDialog.vue'
import AiAppCreateDialog from './AiAppCreateDialog.vue'
import { getAlgoStreamFrameShot } from '@vss/device/api/ai-app'
import { startAppResource, stopAppResource } from '@vss/device/api/device'
import { checkPermission } from '@vss/base/utils/permission'
@Component({
  name: 'IpcAiServiceConfig',
  components: {
    AiServiceBindingDialog,
    AiAppCreateDialog
  }
})
export default class extends Vue {
  @Inject({ default: () => new Object() })
  private configManager

  private ipcAiConfigEnum = IpcAiConfigEnum
  private billingModeType = BillingModeType
  private resourceAiType = ResourceAiType

  private checkPermission = checkPermission
  private configDescription =
    '待配置检测区域的应用需在视频流上线后手动进行区域框选并启用AI分析，其他应用将在视频流上线后将自动启用AI分析'
  private showBindingDialog = false
  private showCreateAiAppDialog = false

  private appNums = 0
  private selectedList = []
  private realSelectedList = []
  private initPackageRemainObj = {}
  private realPackageRemainObj = {}
  private loading = {
    tab: false,
    table: false
  }
  // 是否显示画框弹窗
  private canvasDialog = false
  // 配置算法信息
  private configAlgoInfo: any = {}
  // 封面
  private frameImage = null

  private remain(row) {
    return row[IpcAiConfigEnum.BillingMode] === BillingModeEnum.Packages
      ? `${row[IpcAiConfigEnum.RemainDeviceCount]}路 / ${
          row[IpcAiConfigEnum.TotalDeviceCount]
        }路`
      : '-'
  }

  private get isView() {
    return this.configManager.configMode === ConfigModeEnum.View
  }

  @Watch('selectedList', { deep: true })
  private selectedListChange(selectedList) {
    this.realPackageRemainObj = { ...this.initPackageRemainObj }
    selectedList.forEach((item) => {
      if (item.billingMode === BillingModeEnum.Packages) {
        if (this.initPackageRemainObj[item.resourceId] === undefined) {
          this.initPackageRemainObj[item.resourceId] = +item.remainDeviceCount
          this.realPackageRemainObj[item.resourceId] =
            +item.remainDeviceCount - 1
        } else {
          this.realPackageRemainObj[item.resourceId] =
            this.realPackageRemainObj[item.resourceId] - 1
        }
      }
    })
    this.realSelectedList = selectedList.map((item) => {
      return {
        ...item,
        [IpcAiConfigEnum.RemainDeviceCount]:
          this.realPackageRemainObj[item.resourceId]
      }
    })
    this.$emit(
      'config-change',
      selectedList.map((item) => {
        return {
          billingMode: item.billingMode,
          appId: item.appId,
          analyseType: item.analyseType,
          resourceId: item.resourceId
        }
      })
    )
  }

  private async mounted() {
    await this.getAppNums()
  }

  private async getConfigList() {
    try {
      this.loading.table = true
      const aiInfo = this.configManager.initInfo.aI
      if (aiInfo && aiInfo.length) {
        const res = aiInfo
        res.forEach((item) => {
          if (item.billingMode === BillingModeEnum.Packages) {
            if (this.initPackageRemainObj[item.resourceId] === undefined) {
              this.initPackageRemainObj[item.resourceId] =
                +item.remainDeviceCount + 1
            } else {
              this.initPackageRemainObj[item.resourceId]++
            }
          }
        })
        this.selectedList = res
      }
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
      this.appNums && this.getConfigList()
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
    const target = this.selectedList.findIndex((app) => app.id === appId)
    if (target >= 0) this.selectedList.splice(target, 1)
    if (this.configManager.configMode === ConfigModeEnum.View) {
      this.$emit('force-update')
    }
  }

  private closeDialog(data) {
    this.showBindingDialog = false
    Array.isArray(data) &&
      this.selectedList.push(
        ...data.map((item) => {
          return item.billingMode === BillingModeEnum.Packages
            ? {
                [IpcAiConfigEnum.AppId]: item.id,
                [IpcAiConfigEnum.AppName]: item.name,
                [IpcAiConfigEnum.AlgorithmType]: item.algorithm.name,
                [IpcAiConfigEnum.AbilityName]: item.abilityName,
                [IpcAiConfigEnum.AnalyseType]: item.analyseType,
                [IpcAiConfigEnum.AnalyseRate]: item.analyseType,
                [IpcAiConfigEnum.BillingMode]: item.billingMode,
                [IpcAiConfigEnum.ResourceId]: item.resourceId,
                [IpcAiConfigEnum.RemainDeviceCount]:
                  item.resource['remainDeviceCount'],
                [IpcAiConfigEnum.TotalDeviceCount]:
                  item.resource['totalDeviceCount'],
                [IpcAiConfigEnum.ConfigCheckArea]: `${item.resource['configCheckArea']}`,
                [IpcAiConfigEnum.NeedConfig]: `${item.resource['needConfig']}`,
                [IpcAiConfigEnum.Status]: '0'
              }
            : {
                [IpcAiConfigEnum.AppId]: item.id,
                [IpcAiConfigEnum.AppName]: item.name,
                [IpcAiConfigEnum.AlgorithmType]: item.algorithm.name,
                [IpcAiConfigEnum.AbilityName]: item.abilityName,
                [IpcAiConfigEnum.AnalyseType]: item.analyseType,
                [IpcAiConfigEnum.AnalyseRate]: item.analyseType,
                [IpcAiConfigEnum.BillingMode]: item.billingMode,
                [IpcAiConfigEnum.ResourceId]: '',
                [IpcAiConfigEnum.ConfigCheckArea]: `${item.resource['configCheckArea']}`,
                [IpcAiConfigEnum.NeedConfig]: `${item.resource['needConfig']}`,
                [IpcAiConfigEnum.Status]: '0'
              }
        })
      )
  }

  /**
   * 打开画框弹窗
   */
  private openCanvasDialog(rowInfo: any) {
    const param = {
      frames: [
        {
          stream: this.configManager.deviceId,
          inProtocol: this.configManager.inVideoProtocol
        }
      ]
    }
    getAlgoStreamFrameShot(param)
      .then((res) => {
        if (res) {
          const { frames = [] } = res
          const { frame = '' } = frames[0] || []
          if (!frame) {
            this.$message.warning('暂时获取不到截图，请稍后再试')
          } else {
            this.canvasDialog = true
            this.configAlgoInfo = rowInfo
            this.frameImage = frame
          }
        }
      })
      .catch((e) => {
        this.$alertError(e.message)
      })
  }

  /**
   * 启用/停用AI应用
   */
  private async changeRunningStatus(rowInfo: any) {
    this.loading.table = true
    const status = parseInt(rowInfo.status)
    const param = {
      inProtocol: this.configManager.inVideoProtocol,
      deviceId: this.configManager.deviceId,
      appIds: [rowInfo.appId]
    }
    console.log(rowInfo)
    // startAppResource
    if (status) {
      stopAppResource(param)
        .then(() => {
          this.loading.table = false
          this.$message.success(`停用 ${rowInfo.appName} 成功！`)
          this.$emit('force-update')
        })
        .catch((e) => {
          this.loading.table = false
          this.$message.error(
            `停用 ${rowInfo.appName} 失败，原因：${e && e.message}`
          )
        })
    } else {
      startAppResource(param)
        .then(() => {
          this.loading.table = false
          this.$message.success(`启用 ${rowInfo.appName} 成功！`)
          this.$emit('force-update')
        })
        .catch((e) => {
          this.loading.table = false
          this.$message.error(
            `启用 ${rowInfo.appName} 失败，原因：${e && e.message}`
          )
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.ai-service-config {
  padding-bottom: 20px;

  .config-title,
  .config-description {
    display: block;
    color: $textGrey;
    margin: 5px 0;
  }
}
</style>
