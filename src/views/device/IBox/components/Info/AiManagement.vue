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
        <el-table-column label="操作" />
      </el-table>
    </div>
    <algo-option v-else :step.sync="step" :prod.sync="prod" direction="prev" @back="backToList" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
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

  private backToList() {
    this.step = -1
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
