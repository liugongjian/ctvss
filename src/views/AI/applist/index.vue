<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <div class="head">
        <el-row>
          <el-button type="warning" @click="addApp">新建AI应用</el-button>
        </el-row>
      </div>
      <el-row>
        <el-tabs v-model="activeTabName" type="border-card" @tab-click="handleTabType">
          <el-tab-pane v-for="item in tabInfo" :key="item.name" :label="item.label" :name="item.name">
            <div class="tableOp">
              <el-button @click="handleButtonClick('on-batch')">启用</el-button>
              <el-button @click="handleButtonClick('off-batch')">停用</el-button>
              <el-button @click="handleButtonClick('del-batch')">删除</el-button>
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
                  <template slot-scope="scope">{{ scope.row.date }}</template>
                </el-table-column>
                <el-table-column prop="name" label="算法类型" width="120" />
                <el-table-column prop="address" label="分析类型" />
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
                <el-table-column prop="device" label="关联设备数" />
                <el-table-column prop="status" label="状态">
                  <template slot-scope="scope"><span>{{ parseInt(scope.row.status) ? '启用' : '未启用' }}</span></template>
                </el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <div class="result-btn-wrapper">
                      <el-link type="warning" @click="appDetail(scope.row, 1)">分析结果</el-link>
                      <el-popover
                        placement="bottom"
                        popper-class="more"
                        trigger="click"
                      >
                        <div><el-link @click="appDetail(scope.row, 0)">应用详情</el-link></div>
                        <div><el-link @click="editApp(scope.row)">编辑</el-link></div>
                        <div v-if="!parseInt(scope.row.status)"><el-link @click="handleButtonClick('on-single', scope.row)">启用</el-link></div>
                        <div v-if="parseInt(scope.row.status)"><el-link @click="handleButtonClick('off-single', scope.row)">停用</el-link></div>
                        <div><el-link @click="handleButtonClick('del-single', scope.row)">删除</el-link></div>
                        <el-link slot="reference" type="warning">更多</el-link>
                      </el-popover>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                :current-page="pager.pageNum"
                :page-size="pager.pageSize"
                :total="pager.total"
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
@Component({
  name: 'AppList',
  components: {
  }
})
export default class extends Vue {
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private isLoading: boolean = false
  private activeTabName: String = 'all'
  private dialogVisible: boolean = false
  private clickType: String = ''
  private dialogTitle: String = ''
  private searchInput: String = ''
  private tabInfo: any = [{ label: '全部', name: 'all' },
    { label: '人脸识别', name: 'face' },
    { label: '人体识别', name: 'body' },
    { label: '场景识别', name: 'scene' }]
  private tableData: any = [{
    date: '人员布控03',
    name: '人员聚集',
    address: '分钟级',
    description: 'xxxxxxxxxxx',
    device: '3',
    status: '-1'
  }, {
    date: '人员布控03',
    name: '人员聚集',
    address: '分钟级',
    description: 'xxxxxxxxxxx',
    device: '3',
    status: '0'
  }, {
    date: '人员布控04',
    name: '人脸比对',
    address: '高算力',
    description: 'xxxxxxxxxxx',
    device: '3',
    status: '1'
  }, {
    date: '人员布控01',
    name: '人脸比对',
    address: '秒级',
    description: 'xxxxxxxxxxx',
    device: '3',
    status: '1'
  }, {
    date: '人员布控08',
    name: '人脸比对',
    address: '秒级',
    description: 'xxxxxxxxxxx',
    device: '3',
    status: '1'
  }, {
    date: '人员布控06',
    name: '人脸比对',
    address: '秒级',
    description: 'xxxxxxxxxxx',
    device: '3',
    status: '1'
  }, {
    date: '人员布控07',
    name: '人脸比对',
    address: '秒级',
    description: 'xxxxxxxxxxx',
    device: '3',
    status: '1'
  }]
  private multipleSelection: any = []
  $router: any
  private oprateApp: any

  private addApp() {
    this.$router.push({ path: '/AI/addapp', params: { appType: 1 } })
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
  private handleConfirm() {
    switch (this.clickType) {
      // 批量操作使用multipleSelection
      case 'on-batch':
        console.log('接口：打开')
        break
      case 'off-batch':
        console.log('接口：关闭')
        break
      case 'del-batch':
        console.log('接口：删除')
        break
      // 批量删除使用
      case 'on-single':
        console.log('接口：打开')
        break
      case 'off-single':
        console.log(this.oprateApp)
        break
      case 'del-single':
        console.log('接口：删除')
        break
    }
  }
  private closeDialog() {
    this.dialogVisible = false
  }
  private handleSearch() {
    console.log(this.searchInput)
    // await this.getData()
  }
  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    // await this.getData()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    // await this.getData()
  }
  private async handleTabType() {
    console.log(this.activeTabName)
    // await this.getData()
  }
  private editApp(appinfo) {
    this.$router.push({
      name: `AI-EditApp`,
      query: {
        appinfo
      }
    })
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
  .el-link{
    margin-right: 10px;
  }
}
::v-deep .el-dialog__body{
    text-align: center;
    margin-bottom: 30px;
}
</style>
