<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <div v-if="!this.$route.query.appinfo" class="head">
        <el-row>
          <el-col :span="8">
            <el-steps :active="step+1" simple>
              <el-step title="选择AI算法"><span slot="icon">1</span></el-step>
              <el-step title="创建AI应用"><span slot="icon">2</span></el-step>
            </el-steps>
          </el-col>
        </el-row>
      </div>
      <div v-if="!step && !this.$route.query.appinfo">
        <AlgoOption :step.sync="step" :prod.sync="prod" />
      </div>
      <div v-if="step || this.$route.query.appinfo">
        <AlgoDetail :step.sync="step" :prod="prod" />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AlgoOption from './component/AlgoOption.vue'
import AlgoDetail from './component/AlgoDetail.vue'

@Component({
  name: 'AddApp',
  components: {
    AlgoOption,
    AlgoDetail
  }
})
export default class extends Vue {
    private step: Number = 0
    private prod: any = {}// 新建时传入组件的参数
    private isLoading: boolean = false
}
</script>
<style scoped>
.input-with-select {
    width: 260px;
    position: absolute;
    top:0;
    right: 0;
}
.el-row{
    position: relative;
}
.card-container{
    overflow: auto;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content:space-around;
    align-content: flex-start;
    height: 60vh;
    min-width: 1200px;
    min-height: 400px;
}
.head{
   margin-bottom: 20px;
}
</style>
