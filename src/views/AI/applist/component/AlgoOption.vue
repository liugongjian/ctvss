<template>
  <div>
    <el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabType">
        <el-tab-pane v-for="tab in tabInfo" :key="tab.id" :label="tab.name" :name="tab.id">
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
import { getAbilityList, getAlgorithmList } from '@/api/ai-app'
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

  private test: any = {}
  private activeName: String = '0'
  private searchApp: String = ''
  private tabInfo: any = []
  private prodInfo: any = []

  private async mounted() {
    const { aiAbilityList } = await getAbilityList()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.tabInfo = [ { id: '0', name: '全部' }, ...aiAbilityList ]
    const { aiAbilityAlgorithms } = await getAlgorithmList({ abilityName: this.searchApp, abilityId: this.activeName })
    this.prodInfo = aiAbilityAlgorithms
  }

  private changeStep(val: any) {
    this.$emit('update:step', val.step)
    val.prod && this.$emit('update:prod', val.prod)
  }
  private cancel() {
    this.$router.push({ name: 'AI-AppList' })
  }
  private async handleTabType() {
    const { aiAbilityAlgorithms } = await getAlgorithmList({ abilityName: this.searchApp, abilityId: this.activeName })
    this.prodInfo = aiAbilityAlgorithms
  }
}
</script>
<style lang="scss" scoped>
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
    &+.el-button{
      margin-top: 20px;
    }
}
</style>
