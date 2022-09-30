<template>
  <div class="algo-container">
    <div class="tab-container">
      <div class="filter-container">
        <el-button type="primary" @click="editApp">配置AI应用</el-button>
      </div>
      <el-table v-loading="loading.table" :data="tableData">
        <el-table-column prop="name" label="应用名称" />
        <el-table-column prop="algorithmName" label="算法类型" />
        <el-table-column prop="analyseType" label="状态">
          <template slot-scope="scope">
            <span>{{ ResourceAiType[scope.row.analyseType] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" @click="algoConfig(scope.row)">
              算法配置
            </el-button>
            <el-button type="text" @click="bindOrUnbind(scope.row)">
              解绑
            </el-button>
            <el-button type="text" @click="startOrStop(scope.row)">
              启用
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
    <app-config v-if="dialogVisible.app" @close="closeDialogue" />
    <algo-config
      v-if="dialogVisible.algo"
      :device-id="deviceId"
      :canvas-if="dialogVisible.algo"
      :config-algo-info="configAlgoInfo"
      :frame-image="frameImage"
      :meta="meta"
      @add-meta="addMeta"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide } from 'vue-property-decorator'
import { describeIboxApps, deleteIboxApps, updateIboxApp } from '@/api/ibox'
import AppConfig from './component/AppConfig.vue'
import AlgoConfig from '../Info/AlgoConfig/index.vue'
import { ResourceAiType } from '@/dics'

@Component({
  name: 'AiConfig',
  components: {
    AppConfig,
    AlgoConfig
  }
})
export default class AiAppList extends Vue {
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

  private algoConfig(row) {
    this.dialogVisible.algo = true
    this.app = row
    this.initMetaFromApp(row)
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

  private bindOrUnbind(row) {
    this.$alertDelete({
      type: '应用',
      msg: `是否确认解绑应用："${row.name}"`,
      method: deleteIboxApps,
      payload: { appIds: [row.appId], iboxId: row.iboxId },
      onSuccess: this.getAppList
    })
  }

  private startOrStop(row) {
    this.$alertDelete({
      type: '应用',
      msg: `是否确认停用应用："${row.name}"`,
      method: deleteIboxApps,
      payload: { appIds: [row.appId], iboxId: row.iboxId },
      onSuccess: this.getAppList
    })
  }

  private editApp() {
    this.dialogVisible.app = true
  }

  private addMeta(meta) {
    console.log('meta:', meta)
    // 转化meta为detectZone
    const { DangerZone } = JSON.parse(meta.algorithmMetadata)
    console.log('DangerZone:', DangerZone)
    const submitDetectzone = [DangerZone.map((zone) => +zone)]
    console.log('submitDetectzone:', submitDetectzone)
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
