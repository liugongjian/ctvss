<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <div class="head">
        <el-row>
          <el-col :span="8">
            <el-steps :active="step+1" simple>
              <el-step title="选择AI算法" />
              <el-step title="创建AI应用" />
            </el-steps>
          </el-col>
        </el-row>
      </div>
      <div v-show="!step">
        <AlgoOption :step.sync="step" :prod.sync="prod" />
      </div>
      <div v-show="step">
        <AlgoDetail :step.sync="step" :prod="prod" />
      </div>
    </el-card>
  </div>
</template>
<script>
import AlgoOption from './component/algoOption.vue'
import AlgoDetail from './component/algoDetail.vue'
export default {
  components: { AlgoOption, AlgoDetail },
  data() {
    return {
      step: 0,
      prod: {}
    }
  },
  methods: {
  }
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
