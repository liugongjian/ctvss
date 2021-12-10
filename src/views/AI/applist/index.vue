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
          <el-button type="primary" @click="addApp">新建AI应用</el-button>
          <!-- <el-button :disabled="batchDisabled" @click="batchStartOrStopApps(1)">启用</el-button>
          <el-button :disabled="batchDisabled" @click="batchStartOrStopApps(0)">停用</el-button> -->
          <el-button :disabled="batchDisabled" @click="batchDeleteApps()">删除</el-button>
          <div class="filter-container__right">
            <el-input v-model="searchInput" class="filter-container__search-group" placeholder="请输入应用名称 / 描述" clearable @keyup.enter.native="handleSearch" @clear="handleSearch">
              <el-button slot="append" class="el-button-rect" @click="handleSearch"><svg-icon name="search" /></el-button>
            </el-input>
            <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
          </div>
        </div>
        <el-row>
          <el-table
            ref="multipleTable"
            v-loading="loading.appList"
            :data="aiApps"
            tooltip-effect="dark"
            style="width: 100%"
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
                    <el-dropdown-item :command="{type: 'detail', app: scope.row}">应用详情</el-dropdown-item>
                    <!-- <el-dropdown-item v-if="parseInt(scope.row.appEnabled)" :command="{type: 'stop', app: scope.row}">停用</el-dropdown-item>
                    <el-dropdown-item v-if="!parseInt(scope.row.appEnabled)" :command="{type: 'start', app: scope.row}">启用</el-dropdown-item> -->
                    <el-dropdown-item :command="{type: 'edit', app: scope.row}">编辑</el-dropdown-item>
                    <el-dropdown-item :command="{type: 'delete', app: scope.row}">删除</el-dropdown-item>
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
import { Component, Mixins } from 'vue-property-decorator'
import { getAppList, getAbilityList, startOrStopApps, deleteApps } from '@/api/ai-app'
import { ResourceAiType } from '@/dics'
import AppMixin from '../mixin/app-mixin'

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

  private get batchDisabled() {
    return this.multipleSelection.length === 0
  }

  private async mounted() {
    await this.getAbilityList()
    this.getAppList()
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
      const { aiApps, pageNum, pageSize, totalNum } = await getAppList({ name: this.searchInput, pageNum: this.pager.pageNum, pageSize: this.pager.pageSize, abilityId: this.activeTabName })
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
    this.$router.push({ path: '/AI/create', params: { appType: 1 } })
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
      onSuccess: () => {
        this.getAppList()
        this.getAbilityList()
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
      onSuccess: () => {
        this.$message.success(`已通知${method}AI应用`)
        this.getAppList()
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
  private handleSearch() {
    this.pager.pageNum = 1
    this.getAppList()
  }

  /**
   * 刷新列表
   */
  public refresh() {
    this.getAppList()
  }

  /**
   * 删除应用回调
   */
  public onDeleteApp() {
    this.getAppList()
  }

  /**
   * 切换Tab
   */
  private handleTabType() {
    this.getAppList()
  }

  /**
   * 点击表格行进入详情
   */
  private rowClick(row: any, column: any) {
    if (column.property !== 'action' && column.property !== 'selection') {
      this.appDetail(row, '0')
    }
  }

  private handleSizeChange(val: number) {
    this.pager.pageSize = val
    this.getAppList()
  }

  private handleCurrentChange(val: number) {
    this.pager.pageNum = val
    this.getAppList()
  }
}
</script>

<style lang='scss' scoped>
.filter-container__search-group {
  margin-right: 10px;
}
.el-table {
  ::v-deep .el-table__row{
    cursor: pointer;
    .col-action, .col-selection {
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
</style>
