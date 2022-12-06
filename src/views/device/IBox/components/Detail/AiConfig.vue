<template>
  <div class="algo-container">
    <div class="tab-container">
      <div class="filter-container">
        <el-button type="primary" @click="editApp">配置AI应用</el-button>
      </div>
      <el-table v-loading="loading.table" :data="tableData">
        <el-table-column prop="name" label="应用名称" />
        <el-table-column label="算法类型">
          <template slot-scope="scope">
            <span>{{ ResourceAiType[scope.row.analyseType] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <status-badge :status="(scope.row.status === '[0]' ? 'off' : 'on')" />
            <span>{{ scope.row.status === "[0]" ? '停用' : '启用' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" @click="algoConfig(scope.row)">
              算法配置
            </el-button>
            <el-button type="text" @click="unbind(scope.row)"> 解绑 </el-button>
            <el-button type="text" @click="startOrStop(scope.row)">
              {{ scope.row.status === '[0]' ? '启用' : '停用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="pager.pageNum"
        :page-size="pager.pageSize"
        :total="pager.totalNum"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <app-config
      v-if="dialogVisible.app"
      @bind="bindApps"
      @close="closeDialogue"
    />
    <algo-config
      v-if="dialogVisible.algo"
      :device-id="deviceId"
      :canvas-if="dialogVisible.algo"
      :config-algo-info="configAlgoInfo"
      :frame-image="frameImage"
      :frame-loading="frameLoading"
      :meta="meta"
      :need-config="true"
      @add-meta="addMeta"
    />
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import {
  describeIboxApps,
  startIboxApps,
  stopIboxApps,
  unBindIboxApps,
  bindIboxApps,
  configureIboxAlgorithm
} from '@/api/ibox'
import AppConfig from './component/AppConfig.vue'
import AlgoConfig from '../Info/AlgoConfig/index.vue'
import { ResourceAiType } from '@/dics'
import AlgoMixin from '@/views/device/IBox/mixin/algoMixin'

@Component({
  name: 'AiConfig',
  components: {
    AppConfig,
    AlgoConfig,
    StatusBadge
  }
})
export default class AiAppList extends Mixins(AlgoMixin) {
  public tableData = []
  public dialogVisible = {
    app: false,
    algo: false
  }

  private configAlgoInfo = {}
  private pager = {
    pageSize: 20,
    pageNum: 1,
    totalNum: 0
  }

  private loading = {
    table: false
  }

  private isIboxEdit = false
  private appDetailId = ''
  private ResourceAiType = ResourceAiType
  private app = null

  private mounted() {
    this.getAppList()
  }

  private async getAppList() {
    this.loading.table = true
    const path: any = this.$route.query.path
    const iboxId: any = path.split(',')[0]
    const deviceId: any = path.split(',').pop()
    const { iboxApps, pageNum, pageSize, totalNum }: any =
      await describeIboxApps({
        ...this.pager,
        iboxId,
        deviceId
      })
    this.pager = { pageSize, pageNum, totalNum }
    this.tableData = iboxApps
    this.loading.table = false
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    this.getAppList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    this.getAppList()
  }

  private async algoConfig(row) {
    try {
      this.initMetaFromApp(row)
      this.app = row
      this.dialogVisible.algo = true
      await this.initFrame()
      this.frameLoading = 'correct'
    } catch (e) {
      console.log(e)
      this.frameLoading = 'error'
    } finally {
      this.$forceUpdate()
    }
  }

  private initMetaFromApp(appInfo) {
    const detectZones = JSON.parse(appInfo.detectZones)[0]
    const algorithmMetadata = {
      DangerZone: detectZones.map((zone) => zone + '')
    }
    this.meta = {
      algorithmMetadata: JSON.stringify(algorithmMetadata),
      deviceId: undefined
    }
  }

  private unbind(row) {
    const path: any = this.$route.query.path
    const iboxId: any = path.split(',')[0]
    const deviceId: any = path.split(',').pop()
    this.$alertHandle({
      titleConfirmHide: true,
      handleName: '解除绑定',
      type: '',
      msg: `是否解绑应用："${row.name}"`,
      method: unBindIboxApps,
      payload: { appIds: [row.appId], iboxId, deviceId },
      onSuccess: this.getAppList
    })
  }

  private startOrStop(row) {
    const func = row.status === '[0]' ? startIboxApps : stopIboxApps
    const path: any = this.$route.query.path
    const iboxId: any = path.split(',')[0]
    const deviceId: any = path.split(',').pop()
    this.$alertHandle({
      titleConfirmHide: true,
      handleName: `${row.status !== '[0]' ? '停用' : '启用'}应用`,
      type: '',
      msg: `是否确认${row.status !== '[0]' ? '停用' : '启用'}应用："${row.name}"`,
      method: func,
      payload: { appIds: [row.appId], iboxId, deviceId },
      onSuccess: this.getAppList
    })
  }

  private editApp() {
    this.dialogVisible.app = true
  }

  private async addMeta(meta) {
    try {
      // 转化meta为detectZone
      const { DangerZone } = JSON.parse(meta.algorithmMetadata)
      const submitDetectzone = DangerZone.map((zone) => +zone)
      const { appId, iboxId, algorithmsId } = this.app
      const { deviceId } = this.$route.query
      await configureIboxAlgorithm({
        appId,
        iboxId,
        deviceId,
        algorithmsId,
        detectZone: JSON.stringify(submitDetectzone)
      })
      this.$message.success('提交成功')
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.getAppList()
    }
  }

  private async bindApps(apps) {
    const path: any = this.$route.query.path
    const iboxId: any = path.split(',')[0]
    const deviceId: any = path.split(',').pop()
    const appIds = apps.map((app) => +app.appId)
    try {
      await bindIboxApps({ appIds, iboxId, deviceId })
      this.getAppList()
      this.$message.success('操作成功')
    } catch (e) {
      this.$message.error(e)
    }
  }

  private closeDialogue() {
    this.dialogVisible.app = false
  }

  public closeCanvasDialog() {
    this.dialogVisible.algo = false
  }
}
</script>

<style lang="scss" scoped>
.algo-container {
  height: calc(100% - 40px);
  overflow-y: auto;
}
</style>
