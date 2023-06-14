<template>
  <div class="algo">
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleTabType">
      <el-tab-pane v-for="tab in abilityList" :key="tab.id" :label="tab.name" :name="tab.id">
        <div v-loading="loading.algoList" class="algo__container">
          <ProdCard v-for="prod in algoList" :key="prod.id" :prod="prod" @changeStep="changeStep" />
        </div>
        <div class="algo__return">
          <el-button size="large" @click="cancel">取消</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-input
      v-model="searchApp"
      placeholder="请输入算法名称 / 描述"
      class="algo__search"
      clearable
      @keyup.enter.native="handleSearch"
      @clear="handleSearch"
    >
      <el-button slot="append" class="el-button-rect" @click="handleSearch"><svg-icon name="search" /></el-button>
    </el-input>
  </div>
</template>
<script lang='ts'>
import { getAbilityList, getAlgorithmList } from '@/api/ai-app'
import { Component, Prop, Mixins } from 'vue-property-decorator'
import ProdCard from './ProdCard.vue'
import AppMixin from '../../mixin/app-mixin'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'AlgoOption',
  components: {
    ProdCard
  }
})
export default class extends Mixins(AppMixin) {
  @Prop({ default: 0 }) private step!: number

  private loading = {
    algoList: false,
    abilityList: false
  }
  private activeName: String = '0'
  private searchApp: String = ''
  private abilityList: any = []
  private algoList: any = []

  private async mounted() {
    this.activeName = this.$route.query.abilityId + ''
    await this.getAbilityList()
    await this.getAlgorithmList()
  }

  /**
   * 获取能力分类
   */
  public async getAbilityList() {
    try {
      this.loading.abilityList = true
      const { aiAbilityList } = await getAbilityList({})
      this.abilityList = [ { id: '0', name: '全部' }, ...aiAbilityList ]
    } catch (e) {
      this.$alertError(e && e.message)
    } finally {
      this.loading.abilityList = false
    }
  }

  public get isIndustrialDetection() {
    return UserModule.tags && UserModule.tags.isIndustrialDetection && UserModule.tags.isIndustrialDetection === 'Y'
  }

  /**
   * 获取算法列表
   */
  private async getAlgorithmList() {
    try {
      this.loading.algoList = true
      let { aiAbilityAlgorithms } = await getAlgorithmList({ name: this.searchApp, abilityId: this.activeName })
      if (this.isIndustrialDetection) {
        // 工业缺陷检测算法需求 https://devops.ctcdn.cn/confluence/pages/viewpage.action?pageId=108086991
        aiAbilityAlgorithms = aiAbilityAlgorithms.map((algo) => {
          if (algo.name === '城市治理') {
            return {
              ...algo,
              newCode: '10037_industrial_detection',
              name: '工业缺陷检测',
              summary: '检测画面中是否存在裂缝、破损等，适用于工业场景对产品表面的缺陷检测。'
            }
          }
          return algo
        })
      }
      this.algoList = aiAbilityAlgorithms
    } catch (e) {
      this.$alertError(e && e.message)
    } finally {
      this.loading.algoList = false
    }
  }

  /**
   * 切换步骤
   */
  private changeStep(val: any) {
    this.$emit('update:step', val.step)
    val.prod && this.$emit('update:prod', val.prod)
  }

  /**
   * 切换能力类型
   */
  private async handleTabType() {
    this.searchApp = ''
    this.getAlgorithmList()
  }

  /**
   * TODO: 搜索算法
   */
  private async handleSearch() {
    this.getAlgorithmList()
  }

  /**
   * 返回应用列表
   */
  private cancel() {
    this.backToAppList()
  }
}
</script>
<style lang="scss" scoped>
.algo {
  position: relative;

  .algo__search {
    width: 260px;
    position: absolute;
    top: 4px;
    right: 4px;
  }

  .algo__return {
    border-top: 1px solid $borderGrey;
    margin-top: 15px;
    padding-top: 15px;

    ::v-deep .el-button {
      padding: 12px 40px;
    }
  }

  .algo__container {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  }
}
</style>
