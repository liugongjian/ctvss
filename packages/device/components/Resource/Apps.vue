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
// import { AIApp } from '@vss/device/type/Resource'

@Component({
  name: 'ResourceApps'
})
export default class extends Vue {
  // 所选AI应用
  @VModel() private savedAppCollection: { [resourceId: string ]: any[] }
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
  public currentAbilityId = null
  // 所选应用列表与资源包的映射关系，用于切换资源包后的数据缓存
  private selectionCollection = {}
  // 克隆列表用于切换算法类型后恢复所勾选的数据
  private cloneSelectionCollection = {}
  // 上一次所选的resourceId
  private lastResourceId = null


  @Watch('resourceId')
  private onResourceIdChange(resourceId) {
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
    if (this.savedAppCollection[this.resourceId].length) {
      if (!this.selectionCollection[this.resourceId]) {
        this.selectionCollection[this.resourceId] = {}
        const apps = flatten(Object.values(this.appCollection))
        this.savedAppCollection[this.resourceId].forEach(app => {
          // 找出AI应用源数据
          const selectedApp: any = apps.find((sourceApp: any) => app.aIAppId === sourceApp.id)
          if (selectedApp) {
            // 得到AI应用的算法类别ID
            const abilityId = selectedApp.abilityId
            if (!this.selectionCollection[this.resourceId][abilityId]) {
              this.selectionCollection[this.resourceId][abilityId] = []
            }
            // 将源数据添加到selectionCollection
            this.selectionCollection[this.resourceId][abilityId].push(selectedApp)
          }
        })
      }
    } else {
      // 切换AI资源包后保持原来AI应用的勾选，但是不符合算力类型的应用需要排除
      const removeAITypes = new Set()
      let removeCount = 0
      const collection = cloneDeep(this.selectionCollection)
      const lastResourceCollection = collection[this.lastResourceId]
      for (const abilityId in lastResourceCollection) {
        lastResourceCollection[abilityId].forEach((app, index) => {
          if (app.analyseType > this.resourceAiType) {
            removeAITypes.add(app.analyseType)
            removeCount++
            lastResourceCollection[abilityId][index] = null
          }
        })
        lastResourceCollection[abilityId] = lastResourceCollection[abilityId].filter(app => app)
      }
      this.selectionCollection[this.resourceId] = lastResourceCollection
      if (removeCount > 0) {
        const typesString = Array.from(removeAITypes).map((type: string) => ResourceAiType[type])
        this.$message.info(`${ResourceAiType[this.resourceAiType]}的资源包不能绑定${typesString.join('、')}的应用，已取消${removeCount}个应用的勾选`)
      }
    }
    this.lastResourceId = this.resourceId
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
  public async getAppList(abilityId) {
    try {
      this.loading = true
      const res = await getAppList({ abilityId, pageSize: 9999 })
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
    this.savedAppCollection[this.resourceId] = this.generateSelectedAppCollection()
  }

  /**
   * 切换算法类型后恢复勾选
   */
  private recoverSelection() {
    try {
      const table: any = this.$refs[`table${this.currentAbilityId}`]
      const selections = this.cloneSelectionCollection[this.resourceId][this.currentAbilityId]
      if (selections) {
        const apps = this.appCollection[this.currentAbilityId].filter(app => selections.some(selection => selection.id === app.id))
        table[0].clearSelection()
        apps && apps.forEach(row => {
          table[0].toggleRowSelection(row, true)
        })
      } else {
        table[0].clearSelection()
      }
    } catch (e) {}
  }

  /**
   * 点击行勾选
   */
  private onRowClick(row) {
    const table: any = this.$refs[`table${this.currentAbilityId}`]
    if (this.checkAppSelecable(row)) {
      table[0].toggleRowSelection(row)
    }
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
