<template>
  <el-tabs v-model="currentAbilityId" v-loading="loading" class="resource-app-list" type="card" @tab-click="changeAbility">
    <el-tab-pane v-for="ability in abilityList" :key="ability.id" :label="`${ability.name}(${ability.aiApps})`" :name="ability.id">
      <el-table
        :ref="`table${ability.id}`"
        v-loading="loading"
        tooltip-effect="dark"
        :data="appCollection[ability.id]"
        style="width: 100%;"
        empty-text="暂无AI应用，请在AI应用管理中创建"
        @selection-change="handleSelectionChange"
        @row-click="onRowClick"
      >
        <el-table-column
          type="selection"
          :selectable="checkAppSelecable"
          width="55"
        >
        </el-table-column>
        <el-table-column prop="name" label="应用名称" />
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
</template>
<script lang='ts'>
import { Component, Prop, Watch, VModel, Vue } from 'vue-property-decorator'
import { ResourceAiType } from '@vss/device/dicts/resource'
import { getAbilityList, getAppList } from '@vss/device/api/ai-app'
import { cloneDeep, flatten } from 'lodash'
import { AIApp } from '@vss/device/type/Resource'

@Component({
  name: 'ResourceApps'
})
export default class extends Vue {
  // 所选AI应用
  @VModel() private selectedAppCollection: { [resourceId: string ]: AIApp[] }
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
  // 所选应用列表与资源包的映射关系，用于切换资源包后的数据缓存
  private selectionCollection = {}
  // 克隆列表用于切换算法类型后恢复所勾选的数据
  private cloneSelectionCollection = {}

  @Watch('resourceId')
  private onResourceIdChange() {
    this.initSelection()
  }

  private async mounted() {
    try {
      this.loading = true
      await this.getAbilityList()
      const allRequest = []
      this.abilityList.forEach(ability => {
        allRequest.push(this.getAppList(ability.id))
      })
      await Promise.all(allRequest)
      this.initSelection()
    } catch (e) {
      this.$alertError(e)
    }
    finally {
      this.loading = false
    }
  }

  /**
   * 初始化数据
   */
  private initSelection() {
    if (this.selectedAppCollection[this.resourceId]) {
      if (!this.selectionCollection[this.resourceId]) {
        this.selectionCollection[this.resourceId] = {}
        this.selectionCollection[this.resourceId][this.currentAbilityId] = this.selectedAppCollection[this.resourceId].map(app => {
          return {
            id: app.aIAppId
          }
        })
      }
    } else {
      this.selectionCollection[this.resourceId] = {}
    }
    this.cloneSelectionCollection = cloneDeep(this.selectionCollection)
    this.recoverSelection()
  }

  /**
   * 获取算法类别
   */
  private async getAbilityList() {
    const { aiAbilityList } = await getAbilityList()
    if (aiAbilityList.length) {
      this.abilityList = aiAbilityList
      this.currentAbilityId = aiAbilityList[0].id
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
    } catch (e) {
      this.$alertError(e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 切换算法类别
   */
  private async changeAbility() {
    this.cloneSelectionCollection = cloneDeep(this.selectionCollection)
    await this.getAppList(this.currentAbilityId)
    this.recoverSelection()
  }

  /**
   * 根据App Id列表生成{aIAppId, aIType}
   */
  private generateSelectedAppCollection() {
    const collection: any = flatten(Object.values(this.selectionCollection[this.resourceId]))
    return collection.map(app => {
      return {
        aIAppId: app.id,
        aIType: app.analyseType
      }
    })
  }

  /**
   * 勾选回调
   */
  private handleSelectionChange(val) {
    if (!this.selectionCollection[this.resourceId]) {
      this.selectionCollection[this.resourceId] = {}
    }
    this.selectionCollection[this.resourceId][this.currentAbilityId] = val
    this.selectedAppCollection[this.resourceId] = this.generateSelectedAppCollection()
  }

  /**
   * 切换算法类型后恢复勾选
   */
  private recoverSelection() {
    try {
      const selections = this.cloneSelectionCollection[this.resourceId][this.currentAbilityId]
      const apps = this.appCollection[this.currentAbilityId].filter(app => selections.some(selection => selection.id === app.id))
      const table: any = this.$refs[`table${this.currentAbilityId}`]
      table[0].clearSelection()
      apps && apps.forEach(row => {
        table[0].toggleRowSelection(row, true)
      })
    } catch (e) {}
  }

  /**
   * 点击行勾选
   */
  private onRowClick(row) {
    const table: any = this.$refs[`table${this.currentAbilityId}`]
    table[0].toggleRowSelection(row)
  }

  /**
   * 检查算力是否允许勾选
   */
  private checkAppSelecable(row) {
    return row.analyseType <= this.resourceAiType
  }
}
</script>
<style lang="scss" scoped>
  .resource-app-list {
    min-height: 30px;
  }
</style>