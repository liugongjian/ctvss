<template>
  <div class="resource-app-list" >
    <el-checkbox v-model="checkAllStat.checked" :indeterminate="checkAllStat.indeterminate" @change="checkAll"></el-checkbox>
    <el-checkbox-group v-model="checkboxList">
      <el-tabs v-loading="loading" v-model="currentAbilityId" type="card" @tab-click="changeAbility">
        <el-tab-pane v-for="ability in abilityList" :key="ability.id" :label="`${ability.name}(${ability.aiApps})`" :name="ability.id">
          <el-table
            v-loading="loading"
            tooltip-effect="dark"
            :data="appCollection[ability.id]"
            style="width: 100%;"
            empty-text="暂无AI应用，请在AI应用管理中创建"
            @row-click="toggleApp"
            ref="table"
          >
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column prop="name" label="应用名称">
              <template slot="header">应用名</template>
              <template slot-scope="scope"><span @click.stop><el-checkbox :label="scope.row.id" :disabled="checkAppDisable(scope.row.analyseType)">{{ scope.row.algorithm.name }}</el-checkbox></span></template>
            </el-table-column>
            <el-table-column label="算法类型" width="120">
              <template slot-scope="scope">{{ scope.row.algorithm.name }}</template>
            </el-table-column>
            <el-table-column prop="analyseType" label="分析类型">
              <template slot-scope="scope">
                {{ ResourceAiTypeDict[scope.row.analyseType] }}
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-checkbox-group>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Watch, VModel, Vue } from 'vue-property-decorator'
import { ResourceAiType } from '@vss/device/dicts/resource'
import { getAbilityList, getAppList } from '@vss/device/api/ai-app'

@Component({
  name: 'ResourceApps'
})
export default class extends Vue {
  // 所选AI应用
  @VModel() private selectedAppCollection: any
  // 当前AI资源包ID
  @Prop() private resourceId: string
  // 当前AI资源包算力
  @Prop() private resourceAiType: string
  private ResourceAiTypeDict = ResourceAiType
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
  // 全选勾选状态
  private checkAllStat = {
    checked: false,
    indeterminate: false
  }

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
    this.setCheckCheckAllStat()
  }

  private async mounted() {
    await this.getAbilityList()
    const allRequest = []
    this.abilityList.forEach(ability => {
      allRequest.push(this.getAppList(ability.id))
    })
    await Promise.all(allRequest)
    this.setCheckCheckAllStat()
  }

  /**
   * 获取算法类别
   */
  private async getAbilityList() {
    try {
      this.loading = true
      const { aiAbilityList } = await getAbilityList()
      if (aiAbilityList.length) {
        this.abilityList = aiAbilityList
        this.currentAbilityId = aiAbilityList[0].id
      }
    } catch(e) {
      this.$alertError(e.message)
    } finally {
      this.loading = false
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
  private async changeAbility() {
    await this.getAppList(this.currentAbilityId)
    this.setCheckCheckAllStat()
  }

  /**
   * 反选单个应用
   */
  private toggleApp(app) {
    if (app.analyseType > this.resourceAiType) {
      return
    }
    const index = this.checkboxList.indexOf(app.id)
    if (index > -1) {
      this.checkboxList.splice(index, 1)
    } else {
      this.checkboxList.push(app.id)
    }
  }

  /**
   * 根据App Id列表生成{aIAppId, aIType}
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

  /**
   * 设置全选和半选状态
   */
  private setCheckCheckAllStat() {
    let checked = false
    let indeterminate = false
    const currentAbilityCheckboxList = this.checkboxList.filter(id => this.appCollection[this.currentAbilityId].find(app => app.id === id))
    const checkboxLength = currentAbilityCheckboxList.length
    const allAppLenth = this.appCollection[this.currentAbilityId].length
    if (checkboxLength === allAppLenth) {
      checked = true
    } else if(checkboxLength > 0) {
      indeterminate = true
    }
    this.checkAllStat.checked = checked
    this.checkAllStat.indeterminate = indeterminate
  }

  private checkAll() {
    console.log('checkall', this.$refs.table)
    this.checkAllStat.indeterminate = false
    if (this.checkAllStat.checked) {
      console.log(this.appCollection)
    }
  }

  /**
   * 检查算力是否允许勾选
   */
  private checkAppDisable(aIType) {
    return aIType > this.resourceAiType
  }
}
</script>
<style lang="scss" scoped>
  .resource-app-list {
    min-height: 30px;
  }
</style>