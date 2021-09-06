<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <div class="head">
        <el-row>
          <el-button type="warning" @click="addApp">新建AI应用</el-button>
        </el-row>
      </div>
      <el-row>
        <el-tabs v-model="activeTabName" @tab-click="handleTabType">
          <el-tab-pane v-for="item in tabInfo" :key="item.id" :label="item.name+' ('+item.aiApps+')'" :name="item.id">
            <div class="tableOp">
              <el-button :disabled="disabled" @click="handleButtonClick('on-batch')">启用</el-button>
              <el-button :disabled="disabled" @click="handleButtonClick('off-batch')">停用</el-button>
              <el-button :disabled="disabled" @click="handleButtonClick('del-batch')">删除</el-button>
              <el-input v-model="searchInput" placeholder="请输入应用名称 / 描述" class="input-with-select" @keyup.enter.native="handleSearch">
                <el-button slot="append" icon="el-icon-search" @click="handleSearch" />
              </el-input>
            </div>
            <el-row>
              <el-table
                ref="multipleTable"
                :data="tableData"
                tooltip-effect="dark"
                style="width: 100%"
                cell-class-name="tableCell"
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column label="应用名称" width="120">
                  <template slot-scope="scope">{{ scope.row.name }}</template>
                </el-table-column>
                <el-table-column label="算法类型" width="120">
                  <template slot-scope="scope">{{ scope.row.algorithm.name }}</template>
                </el-table-column>
                <el-table-column prop="analyseType" label="分析类型" />
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
                <el-table-column prop="joinDeviceNum" label="关联设备数" />
                <el-table-column prop="appEnabled" label="状态">
                  <template slot-scope="scope"><span>{{ parseInt(scope.row.appEnabled) ? '启用' : '未启用' }}</span></template>
                </el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <div class="result-btn-wrapper">
                      <el-button type="text" @click="appDetail(scope.row, 1)">分析结果</el-button>
                      <el-popover
                        placement="bottom"
                        popper-class="more"
                        trigger="click"
                      >
                        <div class="poper-wrapper"><el-button type="text" @click="appDetail(scope.row, 0)">应用详情</el-button></div>
                        <div class="poper-wrapper"><el-button type="text" @click="editApp(scope.row)">编辑</el-button></div>
                        <div v-if="!parseInt(scope.row.appEnabled)" class="poper-wrapper"><el-button type="text" @click="handleButtonClick('on-single', scope.row)">启用</el-button></div>
                        <div v-if="parseInt(scope.row.appEnabled)" class="poper-wrapper"><el-button type="text" @click="handleButtonClick('off-single', scope.row)">停用</el-button></div>
                        <div class="poper-wrapper"><el-button type="text" @click="handleButtonClick('del-single', scope.row)">删除</el-button></div>
                        <el-button slot="reference" type="text">更多</el-button>
                      </el-popover>
                    </div>
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
      </el-row>
    </el-card>
    <el-dialog
      :title="dialogTitle"
      :visible="dialogVisible"
      :close-on-click-modal="false"
      center
      width="500px"
      @close="closeDialog"
    >
      <span>您确定要{{ dialogTitle }}吗？</span>
      <div slot="footer" align="center">
        <el-button type="primary" @click="handleConfirm">{{ '确定' }}</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getAppList, getAbilityList, startOrStopApps, deleteApps } from '@/api/ai-app'
@Component({
  name: 'AppList',
  components: {
  }
})
export default class extends Vue {
  private pager = {
    pageNum: 1,
    pageSize: 10,
    totalNum: 0
  }
  private isLoading: boolean = false
  private activeTabName: Number = 0
  private dialogVisible: boolean = false
  private clickType: String = ''
  private dialogTitle: String = ''
  private searchInput: String = ''
  private tabInfo: any = []
  private tableData: any = []
  private multipleSelection: any = []
  $router: any
  private oprateApp: any

  private async mounted() {
    const { aiAbilityList } = await getAbilityList()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let totalApps = 0
    aiAbilityList.forEach(element => {
      typeof element.aiApps === 'string' ? totalApps += Number(element.aiApps) : totalApps += element.aiApps
    })
    this.tabInfo = [ { aiApps: totalApps, id: '0', name: '全部' }, ...aiAbilityList ]
    this.queryTableData()
  }

  private async queryTableData() {
    const { aiApps, pageNum, pageSize, totalNum } = await getAppList({ name: this.searchInput, pageNum: this.pager.pageNum, pageSize: this.pager.pageSize, abilityId: this.activeTabName })
    this.pager = { pageNum, pageSize, totalNum }
    this.tableData = aiApps
  }

  private addApp() {
    this.$router.push({ path: '/AI/create', params: { appType: 1 } })
  }
  private appDetail(appinfo: any, tabNum: number) {
    this.$router.push({
      name: `AI-AppDetail`,
      query: {
        appname: appinfo.name,
        tabNum
      }
    })
  }
  private handleSelectionChange(val: any) {
    this.multipleSelection = val
  }
  private handleButtonClick(btnType: String, app: any = null) {
    this.dialogVisible = true
    this.clickType = btnType
    btnType.startsWith('on') ? (this.dialogTitle = '启用应用') : (btnType.startsWith('off') ? this.dialogTitle = '停用应用' : this.dialogTitle = '删除应用')
    app && (this.oprateApp = app)
  }
  private async handleConfirm() {
    switch (this.clickType) {
      // 批量操作使用multipleSelection
      case 'on-batch':
        await startOrStopApps({ id: this.multipleSelection.map(item => item.id), startOrStop: 1 })
        break
      case 'off-batch':
        await startOrStopApps({ id: this.multipleSelection.map(item => item.id), startOrStop: 0 })
        break
      case 'del-batch':
        await deleteApps({ id: this.multipleSelection.map(item => item.id) })
        break
      // 批量删除使用
      case 'on-single':
        await startOrStopApps({ id: [this.oprateApp.id], startOrStop: 1 })
        break
      case 'off-single':
        await startOrStopApps({ id: [this.oprateApp.id], startOrStop: 0 })
        break
      case 'del-single':
        await deleteApps({ id: [this.oprateApp.id] })
        break
    }
    this.queryTableData()
    this.dialogVisible = false
  }
  private closeDialog() {
    this.dialogVisible = false
  }
  private handleSearch() {
    this.pager.pageNum = 1
    this.queryTableData()
  }
  private handleSizeChange(val: number) {
    this.pager.pageSize = val
    this.queryTableData()
  }

  private handleCurrentChange(val: number) {
    this.pager.pageNum = val
    this.queryTableData()
  }
  private handleTabType() {
    this.queryTableData()
  }
  private editApp(appinfo) {
    this.$router.push({
      name: `AI-EditApp`,
      query: {
        id: appinfo.id
      }
    })
  }
  get disabled() {
    return this.multipleSelection.length === 0
  }
}
</script>

<style lang='scss' scoped>
.input-with-select {
    float: right;
    width: 260px;
}
.el-table{
  min-width: 1000px;
  ::v-deep .el-table__row{
      height: 57px;
  }
}
.tableOp{
  min-width: 1000px;
}
.head,.tableOp{
  margin-bottom: 20px;
}
.result-btn-wrapper{
  & > .el-button{
    margin-right: 10px;
  }
}
.poper-wrapper{
  & > .el-button{
    color: #000;
  }
}
::v-deep .el-dialog__body{
  text-align: center;
  margin-bottom: 30px;
}
</style>
