<template>
  <div class="algo-container">
    <div v-if="step === -1" class="tab-container">
      <div class="filter-container">
        <el-button type="primary" @click="addAlgo">添加算法</el-button>
      </div>
      <el-table>
        <el-table-column label="算法类型" />
        <el-table-column label="描述" />
        <el-table-column label="当前算法版本" />
        <el-table-column label="告警次数" />
        <el-table-column label="关联设备" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" @click="upgrade(scope.row)">升级</el-button>
            <el-button type="text" @click="uninstall(scope.row)">卸载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-page-header content="返回算法列表" @back="backToList" />
      <algo-option :step.sync="step" :prod.sync="prod" direction="prev" @back="backToList" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import AlgoOption from '@/views/AI/applist/component/AlgoOption.vue'

@Component({
  name: 'AiManage',
  components: {
    AlgoOption
  }
})

export default class IBoxList extends Vue {
  public tableData = []
  private step: number = -1
  private prod: any = {}// 新建时传入组件的参数
  async mounted() {

  }

  @Watch('prod', {
    immediate: true,
    deep: true
  })
  private onProdChanged() {
    console.log('this.prod:', this.prod)
    // 这里发送请求
  }

  private backToList() {
    this.step = -1
  }

  private addAlgo() {
    this.step = 0
  }

  private upgrade(algo) {
    console.log(algo)
  }

  private uninstall(algo) {

  }
}
</script>

<style lang="scss" scoped>
.algo-container {
  height: 100%;
  overflow-y: auto;
}
</style>
