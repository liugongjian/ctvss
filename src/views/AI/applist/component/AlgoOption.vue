<template>
  <div>
    <el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabType">
        <el-tab-pane v-for="tab in tabInfo" :key="tab.name" :label="tab.label" :name="tab.name">
          <div class="card-container">
            <ProdCard v-for="prod in prodInfo" :key="prod.id" :prod="prod" @changeStep="changeStep" />
          </div>
          <el-button @click="cancel">取消</el-button>
        </el-tab-pane>
      </el-tabs>
      <el-input v-model="searchApp" placeholder="请输入应用名称 / 描述" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" />
      </el-input>
    </el-row>
  </div>
</template>
<script lang='ts'>
import { getAlgorithmList } from '@/api/aiApp'
import { Component, Vue, Prop } from 'vue-property-decorator'
import ProdCard from './ProdCard.vue'

@Component({
  name: 'AlgoOption',
  components: {
    ProdCard
  }
})
export default class extends Vue {
  @Prop({ default: 0 }) private step!: number

  private activeName: String = 'all'
  private searchApp: String
  private tabInfo: any = [
    { label: '全部', name: 'all' },
    { label: '人脸识别', name: 'face' },
    { label: '人体识别', name: 'body' },
    { label: '场景识别', name: 'scene' }
  ]
  private prodInfo: any = [{ id: 1, name: '人流量统计', detail: '适用于3米以上的中远距离俯拍，以头部为识别目标统计图片中的瞬时人数；无人数上限，广泛适用于机场、车站、商场、展会、景区等人群密集场所。' },
    { id: 2, name: '人流量统计', detail: '适用于3米以上的中远距离俯拍，以头部为识别目标统计图片中的瞬时人数；无人数上限，广泛适用于机场、车站、商场、展会、景区等人群密集场所。' }, 
    { id: 3, name: '人流量统计', detail: '适用于3米以上的中远距离俯拍，以头部为识别目标统计图片中的瞬时人数；无人数上限，广泛适用于机场、车站、商场、展会、景区等人群密集场所。' }]

  private async mounted() {
    const { algorithms } = await getAlgorithmList('')
    this.prodInfo = algorithms
    console.log(algorithms)
  }

  private changeStep(val: any) {
    this.$emit('update:step', val.step)
    val.prod && this.$emit('update:prod', val.prod)
  }
  private cancel() {
    this.$router.push({ name: 'AI-AppList' })
  }
  private handleTabType() {

  }
}
</script>
<style scoped>
.input-with-select {
    width: 260px;
    position: absolute;
    top:-7px;
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
    justify-content:flex-start;
    align-content: flex-start;
    height: 60vh;
    min-width: 1200px;
    min-height: 400px;
}
</style>
