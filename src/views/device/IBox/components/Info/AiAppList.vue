<template>
  <div class="algo-container">
    <div v-if="step === -1 && !isAppDetail" class="tab-container">
      <div class="filter-container">
        <el-button type="primary" @click="addAlgo">添加AI应用</el-button>
      </div>
      <el-table :data="tableData">
        <el-table-column prop="name" label="算法类型" />
        <el-table-column label="描述" />
        <el-table-column label="当前算法版本" />
        <el-table-column label="告警次数" />
        <el-table-column label="关联设备" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" @click="appDetail(scope.row)">查看分析结果</el-button>
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
    </div>
    <ai-app-detail v-if="isAppDetail" @back="backToList" />
    <ai-app-edit v-if="step > -1" @back="backToList"/>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AiAppEdit from './AiAppEdit.vue'
import AiAppDetail from './AiAppDetail.vue'

@Component({
  name: 'AiAppList',
  components: {
    AiAppEdit,
    AiAppDetail
  }
})

export default class AiAppList extends Vue {
  public tableData = [{ name: 'test' }]
  private step: number = -1
  private prod: any = {}// 新建时传入组件的参数
  private isAppDetail: boolean = false
  async mounted() {

  }

  private handleMore(command) {
    console.log(command)
  }

  private appDetail(appInfo) {
    console.log(appInfo)
    this.isAppDetail = true
  }

  private backToList() {
    this.step = -1
    this.isAppDetail = false
  }

  private addAlgo() {
    this.step = 0
  }
}
</script>

<style lang="scss" scoped>
.algo-container {
  height: 100%;
  overflow-y: auto;
}
</style>
