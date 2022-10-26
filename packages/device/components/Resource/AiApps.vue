<template>
  <el-checkbox-group v-model="checkboxList">
    <el-tabs v-model="currentAbilityId" type="card" @tab-click="changeAbility">
      <el-tab-pane v-for="ability in abilityList" :key="ability.id" :label="`${ability.name}(${ability.aiApps})`" :name="ability.id">
        <el-table
          v-loading="loading"
          tooltip-effect="dark"
          :data="appCollection[ability.id]"
          style="width: 100%;"
          empty-text="暂无AI应用，请在AI应用管理中创建"
        >
          <el-table-column prop="name" label="应用名称">
            <template slot-scope="scope"><el-checkbox :label="scope.row.id">{{ scope.row.algorithm.name }}</el-checkbox></template>
          </el-table-column>
          <el-table-column label="算法类型" width="120">
            <template slot-scope="scope">{{ scope.row.algorithm.name }}</template>
          </el-table-column>
          <el-table-column prop="analyseType" label="分析类型">
            <template slot-scope="scope">
              {{ ResourceAiType[scope.row.analyseType] }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" show-overflow-tooltip />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-checkbox-group>
</template>
<script lang='ts'>
import { Component, Prop, Watch, VModel, Vue } from 'vue-property-decorator'
import { AIApp } from '@vss/device/type/Resource'
import { ResourceAiType } from '@vss/device/dicts'
import { getAbilityList, getAppList } from '@vss/device/api/ai-app'
@Component({
  name: 'ResourceAiApps'
})
export default class extends Vue {
  // 所选AI应用
  @VModel() private selectedAppCollection: any
  // 当前AI资源包ID
  @Prop() private resourceId: string
  private ResourceAiType = ResourceAiType
  private loading = false
  // 能力列表
  private abilityList = []
  // 所有应用列表集合
  private appCollection = {}
  // 当前能力类别
  private currentAbilityId = null
  // 所选应用列表
  private checkboxList = []
  // 所选应用列表与资源包的映射关系，用于切换资源包后的数据缓存
  private checkboxCollection = {}

  @Watch('resourceId', {
    immediate: true
  })
  private onResourceIdChange() {
    // 初始化已勾选的应用ID
    if (this.selectedAppCollection[this.resourceId]) {
      this.checkboxList = this.selectedAppCollection[this.resourceId].map(app => app.aIAppId)
    } else {
      this.checkboxList = []
    }
  }
  
  @Watch('checkboxList')
  private onCheckboxListChange() {
    this.checkboxCollection[this.resourceId] = this.checkboxList
    this.selectedAppCollection[this.resourceId] = this.generateSelectedAppCollection()
  }

  private async mounted() {
    await this.getAbilityList()
    this.abilityList.forEach(ability => {
      this.getAppList(ability.id)
    })
  }

  /**
   * 获取算法类别
   */
  private async getAbilityList() {
    try {
      const { aiAbilityList } = await getAbilityList()
      if (aiAbilityList.length) {
        this.abilityList = aiAbilityList
        this.currentAbilityId = aiAbilityList[0].id
      }
    } catch(e) {
      this.$alertError(e.message)
    }
  }

  /**
   * 获取AI应用列表
   */
  private async getAppList(abilityId) {
    try {
      this.loading = true
      const res = await getAppList({ abilityId })
      this.$set(this.appCollection, abilityId, res.aiApps)
    } catch(e) {
      this.$alertError(e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 切换算法类别
   */
  private changeAbility() {
    this.getAppList(this.currentAbilityId)
  }

  /**
   * 根据App Id列表生成{aIAppId, aiType}
   */
  private generateSelectedAppCollection() {
    const allAppList: any = Object.values(this.appCollection).reduce((all: any[], appList: any[]) => {
      return [...all, ...appList]
    }, [])
    const appMapping = {}
    allAppList.forEach(app => {
      appMapping[app.id] = app
    })
    return this.checkboxList.map(id => {
      return {
        aIAppId: id,
        aIType: appMapping[id].analyseType
      }
    })
  }
}
</script>