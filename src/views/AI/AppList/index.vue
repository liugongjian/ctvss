<template>
  <div class="app-container">
    <el-alert
      title="设备与AI应用关联后，即可获得相应的AI算法分析能力。"
      type="info"
      show-icon
      :closable="false"
      class="mb10"
    />
    <el-tabs v-model="activeTabName" v-loading="loading.abilityList" type="border-card" @tab-click="handleTabType">
      <el-tab-pane v-for="item in tabInfo" :key="item.id" :label="item.name+' ('+item.aiApps+')'" :name="item.id">
        <div class="filter-container">
          <el-button v-if="checkPermission(['ivs:AdminApp'])" type="primary" @click="addApp">新建AI应用</el-button>
          <!-- <el-button :disabled="batchDisabled" @click="batchStartOrStopApps(1)">启用</el-button>
          <el-button :disabled="batchDisabled" @click="batchStartOrStopApps(0)">停用</el-button> -->
          <el-button v-if="checkPermission(['ivs:AdminApp'])" :disabled="batchDisabled" @click="batchDeleteApps()">删除</el-button>
          <div class="filter-container__right">
            <el-input v-model="searchInput" class="filter-container__search-group" placeholder="请输入应用名称 / 描述" clearable @keyup.enter.native="handleSearch" @clear="handleSearch">
              <el-button slot="append" class="el-button-rect" @click="handleSearch"><svg-icon name="search" /></el-button>
            </el-input>
            <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
          </div>
        </div>
        <el-divider />
        <div class="alarm-container">
          <div class="alarm-container__time">
            统计时间：
            <el-radio-group v-model="period.periodType" size="medium" @change="handleChange">
              <!-- <el-radio-group> -->
              <el-radio-button label="今天" />
              <el-radio-button label="近7天" />
              <el-radio-button label="自定义时间" />
            </el-radio-group>
            <el-date-picker
              v-if="period.periodType === '自定义时间'"
              v-model="period.period"
              type="daterange"
              value-format="timestamp"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleChange"
            />
          </div>
          <div class="alarm-container__alarm">
            <div>总告警次数：</div>
            <div v-loading="loading.appList" style="min-width: 31px;">{{ totalAlarm + '次' }}</div>
          </div>
        </div>
        <el-row>
          <el-table
            ref="multipleTable"
            v-loading="loading.appList"
            :data="aiApps"
            tooltip-effect="dark"
            style="width: 100%;"
            cell-class-name="tableCell"
            @selection-change="handleSelectionChange"
            @row-click="rowClick"
          >
            <el-table-column type="selection" prop="selection" class-name="col-selection" width="55" />
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
            <el-table-column prop="count" label="告警次数" />
            <el-table-column prop="associateDevices" label="关联设备数" />
            <!-- <el-table-column prop="appEnabled" label="状态">
              <template slot-scope="scope"><span>{{ parseInt(scope.row.appEnabled) ? '启用' : '未启用' }}</span></template>
            </el-table-column> -->
            <el-table-column label="操作" prop="action" class-name="col-action" width="150" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" @click="appDetail(scope.row, '2')">分析结果</el-button>
                <el-dropdown @command="handleMore">
                  <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="{ type: 'detail', app: scope.row }">应用详情</el-dropdown-item>
                    <!-- <el-dropdown-item v-if="parseInt(scope.row.appEnabled)" :command="{type: 'stop', app: scope.row}">停用</el-dropdown-item>
                    <el-dropdown-item v-if="!parseInt(scope.row.appEnabled)" :command="{type: 'start', app: scope.row}">启用</el-dropdown-item> -->
                    <el-dropdown-item v-if="checkPermission(['ivs:AdminApp'])" :command="{ type: 'edit', app: scope.row }">编辑</el-dropdown-item>
                    <el-dropdown-item v-if="checkPermission(['ivs:AdminApp'])" :command="{ type: 'delete', app: scope.row }">删除</el-dropdown-item>
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
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { getAppList, getAbilityList, startOrStopApps, deleteApps, getAiAlarm } from '@/api/ai-app'
import { ResourceAiType } from '@/dics'
import AppMixin from '../mixin/app-mixin'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'AppList'
})
export default class extends Mixins(AppMixin) {
  private pager = {
    pageNum: 1,
    pageSize: 10,
    totalNum: 0
  }
  private loading = {
    appList: false,
    abilityList: false
  }
  private activeTabName: Number = 0
  private resourceAiType: any = ResourceAiType
  private searchInput: String = ''
  private tabInfo: any = []
  private aiApps: any = []
  private multipleSelection: any = []
  public $router: any
  public totalAlarm = 0

  private get batchDisabled() {
    return this.multipleSelection.length === 0
  }

  public get isIndustrialDetection() {
    return UserModule.tags && UserModule.tags.isIndustrialDetection && UserModule.tags.isIndustrialDetection === 'Y'
  }

  @Watch('period.periodType')
  private periodTypeUpdated(newVal) {
    switch (newVal) {
      case '今天':
        this.period.period = [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)]
        break
      case '近7天':
        this.period.period = [this.getDateBefore(6), new Date().setHours(23, 59, 59, 999)]
        break
      case '自定义时间':
        this.period.period = [this.getDateBefore(6), new Date().setHours(0, 0, 0, 0)]
        break
    }
  }

  private async mounted() {
    await this.getAbilityList()
    await this.getAppList()
    this.getAlarms()
  }

  /**
   * 获取能力类型
   */
  public async getAbilityList() {
    try {
      this.loading.abilityList = true
      const { aiAbilityList } = await getAbilityList({})
      let totalApps = 0
      aiAbilityList.forEach(element => {
        typeof element.aiApps === 'string' ? totalApps += Number(element.aiApps) : totalApps += element.aiApps
      })
      this.tabInfo = [ { aiApps: totalApps, id: '0', name: '全部' }, ...aiAbilityList ]
    } catch (e) {
      this.alertError(e && e.message)
    } finally {
      this.loading.abilityList = false
    }
  }

  /**
   * 查询应用列表
   */
  public async getAppList() {
    try {
      this.loading.appList = true
      let { aiApps, pageNum, pageSize, totalNum } = await getAppList({ name: this.searchInput, pageNum: this.pager.pageNum, pageSize: this.pager.pageSize, abilityId: this.activeTabName })
      if (this.isIndustrialDetection) {
        // 工业缺陷检测算法需求
        aiApps = aiApps.map((aiApp) => {
          if (aiApp.algorithm.name === '城市治理') {
            aiApp.algorithm.name = '工业缺陷检测'
          }
          return aiApp
        })
      }
      this.pager = { pageNum, pageSize, totalNum }
      this.aiApps = aiApps
    } catch (e) {
      this.alertError(e && e.message)
    } finally {
      this.loading.appList = false
    }
  }

  /**
   * 创建应用
   */
  private addApp() {
    this.$router.push({ path: '/ai/create', query: { appType: 1, abilityId: this.activeTabName } })
  }

  /**
   * 批量删除应用
   */
  public batchDeleteApps() {
    const h: Function = this.$createElement
    this.$alertDelete({
      type: '应用',
      msg: h('div', undefined, [
        h(
          'span',
          undefined,
          '删除操作不能恢复，确定要删除选中的AI应用吗？'
        ),
        h(
          'div',
          { class: 'batch-list' },
          this.multipleSelection.map((app) => {
            return h('p', undefined, [
              h('span', undefined, app.name)
            ])
          })
        )
      ]),
      method: deleteApps,
      payload: { id: this.multipleSelection.map(item => item.id) },
      onSuccess: async() => {
        await this.getAbilityList()
        await this.getAppList()
        this.getAlarms()
      }
    })
  }

  /**
   * 批量启用/停用应用
   */
  public batchStartOrStopApps(startOrStop) {
    const method = startOrStop ? '启用' : '停用'
    const h: Function = this.$createElement
    this.$alertHandle({
      handleName: method,
      type: '应用',
      msg: h('div', undefined, [
        h(
          'span',
          undefined,
          `确定要${method}选中的AI应用吗？`
        ),
        h(
          'div',
          { class: 'batch-list' },
          this.multipleSelection.map((app) => {
            return h('p', undefined, [
              h('span', undefined, app.name)
            ])
          })
        )
      ]),
      method: startOrStopApps,
      payload: {
        id: this.multipleSelection.map(item => item.id),
        startOrStop
      },
      onSuccess: async() => {
        this.$message.success(`已通知${method}AI应用`)
        await this.getAppList()
        this.getAlarms()
      }
    })
  }

  /**
   * 表格行多选回调
   */
  private handleSelectionChange(val: any) {
    this.multipleSelection = val
  }

  /**
   * 更多菜单
   */
  private handleMore(command: any) {
    switch (command.type) {
      case 'detail':
        this.appDetail(command.app, '0')
        break
      case 'edit':
        this.editApp(command.app)
        break
      case 'delete':
        this.deleteApp(command.app)
        break
      case 'stop':
        this.startOrStopApp(command.app, 0)
        break
      case 'start':
        this.startOrStopApp(command.app, 1)
        break
    }
  }

  /**
   * 过滤搜索
   */
  private async handleSearch() {
    this.pager.pageNum = 1
    await this.getAppList()
    this.getAlarms()
  }

  /**
   * 刷新列表
   */
  public async refresh() {
    await this.getAppList()
    this.getAlarms()
  }

  /**
   * 删除应用回调
   */
  public async onDeleteApp() {
    await this.getAppList()
    this.getAlarms()
  }

  /**
   * 切换Tab
   */
  private async handleTabType() {
    await this.getAppList()
    this.getAlarms()
  }

  /**
   * 点击表格行进入详情
   */
  private rowClick(row: any, column: any) {
    if (column.property !== 'action' && column.property !== 'selection') {
      this.appDetail(row, '0')
    }
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getAppList()
    this.getAlarms()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getAppList()
    this.getAlarms()
  }

  public async getAlarms() {
    this.loading.appList = true
    // 每次请求先清空
    this.alarms = []
    try {
      this.getAlarm(0, this.period.period)
      const promiseArray = this.aiApps.map(item => this.getAlarm(item.id, this.period.period))
      await Promise.all(promiseArray)
      this.aiApps = this.aiApps.map(app => {
        const result = this.alarms.filter(alarm => alarm.appId === app.id)
        return { ...app, count: result[0].count }
      })
      // 获取总告警数
    } catch (e) {
      console.log(e)
    } finally {
      this.loading.appList = false
    }
  }

  public async getAlarm(appId, period) {
    if (appId) {
      const res = await getAiAlarm({ appId, startTime: period[0], endTime: this.period.periodType === '自定义时间' ? period[1] + this.msOfADay : period[1] })
      this.alarms.push(res)
    } else {
      const { count } = await getAiAlarm({ appId, abilityId: this.activeTabName, startTime: period[0], endTime: this.period.periodType === '自定义时间' ? period[1] + this.msOfADay : period[1] })
      this.totalAlarm = count
    }
  }
}
</script>

<style lang='scss' scoped>
.filter-container__search-group {
  margin-right: 10px;
}

.el-table {
  ::v-deep .el-table__row {
    cursor: pointer;

    .col-action,
    .col-selection {
      cursor: default;
    }
  }

  .app-name {
    color: $primary;
  }
}

.list__buttons {
  min-width: 1000px;
}

.list__op {
  margin-bottom: 10px;
}

::v-deep .el-dialog__body {
  text-align: center;
  margin-bottom: 30px;
}

.alarm-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;

  &__alarm {
    & > div {
      display: inline-block;
      height: 36px;
      line-height: 36px;
      vertical-align: middle;
    }

    & > div:nth-of-type(2) {
      background: $primary;
      margin-left: 5px;
    }
  }
}
</style>
