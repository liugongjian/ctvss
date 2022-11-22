<template>
  <div class="algo-container">
    <div v-if="step === -1 && !isAppDetail" class="tab-container">
      <div class="filter-container">
        <el-button type="primary" @click="addApp">添加AI应用</el-button>
      </div>
      <el-table v-loading="loading.table" :data="tableData" fit>
        <el-table-column prop="name" label="应用名称" min-width="120" />
        <el-table-column prop="algorithmName" label="算法类型" min-width="120" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip min-width="120" />
        <el-table-column label="当前算法版本" min-width="120">
          <template slot-scope="">
            <span>1.0.0</span>
          </template>
        </el-table-column>
        <el-table-column label="最新版本" min-width="120">
          <template slot-scope="">
            <span>1.0.0</span>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="告警次数" min-width="120" />
        <el-table-column prop="deviceNum" label="关联设备" min-width="120" />
        <el-table-column prop="analyseType" label="分析类型" min-width="120">
          <template slot-scope="scope">
            <span>{{ ResourceAiType[scope.row.analyseType] }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="当前算法版本" /> -->
        <!-- <el-table-column label="告警次数" /> -->
        <!-- <el-table-column prop="deviceIds" label="关联设备" /> -->
        <el-table-column label="操作" fixed="right" min-width="120">
          <template slot-scope="scope">
            <el-button type="text" @click="appDetail(scope.row)">
              查看分析结果
            </el-button>
            <el-dropdown trigger="hover" @command="handleMore">
              <el-button type="text">更多</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{type: 1, app: scope.row}">
                  <span>编辑</span>
                </el-dropdown-item>
                <el-dropdown-item :command="{type: 2, app: scope.row}">
                  <span>删除</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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

    <ai-app-detail
      v-if="isAppDetail"
      :app-detail-id="appDetailId"
      @back="backToList"
    />
    <ai-app-add
      v-if="step > -1"
      :initial-step="step"
      :is-ibox-edit="isIboxEdit"
      @back="backToList"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide } from 'vue-property-decorator'
import AiAppAdd from './AiAppAdd.vue'
import AiAppDetail from './AiAppDetail.vue'
import { describeIboxApps, deleteIboxApps } from '@/api/ibox'
import { ResourceAiType } from '@/dics'
import { getAiAlarm } from '@/api/ai-app'

@Component({
  name: 'AiAppList',
  components: {
    AiAppAdd,
    AiAppDetail
  }
})
export default class AiAppList extends Vue {
  public tableData = []
  private step: number = -1
  private prod: any = {} // 新建时传入组件的参数
  private isAppDetail: boolean = false
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

  private app: any

  @Provide('appInfo')
  public getAppInfo() {
    return this.app
  }

  private async mounted() {
    try {
      this.loading.table = true
      await this.getAppList()
      await this.getAlarms()
    } catch (e) {
      console.log(e)
    } finally {
      this.loading.table = false
    }
  }

  public async getAlarms() {
    this.alarms = []
    const promiseArray = []
    this.tableData.forEach((app) => {
      // const deviceIds = JSON.parse(app.deviceIds)
      // if (deviceIds) {
      //   deviceIds.forEach(deviceId => promiseArray.push(this.getAlarm(app.appId, deviceId)))
      // }
      promiseArray.push(this.getAlarm(app.appId))
    })
    await Promise.all(promiseArray)
    const alarms = {}
    this.alarms.forEach(item => {
      alarms[item.appId] = alarms[item.appId] ? alarms[item.appId] + item.count : item.count
    })
    this.tableData = this.tableData.map(item => ({ ...item, count: alarms[item.appId] || 0 }))
  }

  // public async getAlarm(appId, deviceId) {
  //   const res = await getAiAlarm({
  //     appId,
  //     deviceId
  //   })
  //   this.alarms.push(res)
  // }
  public async getAlarm(appId) {
    const res = await getAiAlarm({
      appId
    })
    this.alarms.push(res)
  }

  private async getAppList() {
    const iboxId: any = this.$route.query.deviceId
    const { iboxApps, pageNum, pageSize, totalNum }: any =
      await describeIboxApps({
        ...this.pager,
        iboxId
      })
    this.pager = { pageSize, pageNum, totalNum }
    this.tableData = iboxApps.map(app => {
      const deviceIds = JSON.parse(app.deviceIds)
      return {
        ...app, deviceNum: deviceIds ? deviceIds.length : 0
      }
    })
  }

  private handleMore(command) {
    switch (command.type) {
      case 1:
        this.isIboxEdit = true
        this.step = 1
        this.app = command.app
        break
      case 2:
        this.deleteApp(command.app)
        break
    }
  }

  private async deleteApp(row: any) {
    this.$alertDelete({
      type: '应用',
      msg: `是否确认删除应用："${row.name}"`,
      method: deleteIboxApps,
      payload: { appIds: [row.appId], iboxId: row.iboxId },
      onSuccess: this.getAppList
    })
  }

  private appDetail(appInfo) {
    this.appDetailId = appInfo.appId
    this.isAppDetail = true
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    this.getAppList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    this.getAppList()
  }

  private backToList() {
    this.getAppList()
    this.resetStatus()
  }

  private resetStatus() {
    this.step = -1
    this.isAppDetail = false
    this.isIboxEdit = false
    this.app = undefined
  }

  private addApp() {
    this.step = 0
  }
}
</script>

<style lang="scss" scoped>
.algo-container {
  height: calc(100% - 70px);
  overflow-y: auto;
}
</style>
