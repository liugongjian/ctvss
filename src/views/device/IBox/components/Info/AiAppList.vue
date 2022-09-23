<template>
  <div class="algo-container">
    <div v-if="step === -1 && !isAppDetail" class="tab-container">
      <div class="filter-container">
        <el-button type="primary" @click="addApp">添加AI应用</el-button>
      </div>
      <el-table :data="tableData">
        <el-table-column prop="name" label="算法名" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="analyseType" label="分析类型" />
        <!-- <el-table-column label="当前算法版本" /> -->
        <!-- <el-table-column label="告警次数" /> -->
        <el-table-column prop="deviceIds" label="关联设备" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" @click="appDetail(scope.row)">
              查看分析结果
            </el-button>
            <el-dropdown trigger="hover" @command="handleMore">
              <el-button type="text">更多</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="1">
                  <span>操作1</span>
                </el-dropdown-item>
                <el-dropdown-item :command="2">
                  <span>操作2</span>
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

    <ai-app-detail v-if="isAppDetail" @back="backToList" />
    <ai-app-add v-if="step > -1" @back="backToList" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AiAppAdd from './AiAppAdd.vue'
import AiAppDetail from './AiAppDetail.vue'
import { describeIboxApps } from '@/api/ibox'

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
    pageNum: 1
  }
  private mounted() {
    this.getAppList()
  }

  private async getAppList() {
    const iboxId: any = this.$route.query.deviceId
    const { IboxApps }: any = await describeIboxApps({ ...this.pager, iboxId })
    this.tableData = IboxApps
  }

  private handleMore(command) {
    console.log(command)
  }

  private appDetail(appInfo) {
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
    this.step = -1
    this.isAppDetail = false
  }

  private addApp() {
    this.step = 0
  }
}
</script>

<style lang="scss" scoped>
.algo-container {
  height: calc(100% - 40px);
  overflow-y: auto;
}
</style>
