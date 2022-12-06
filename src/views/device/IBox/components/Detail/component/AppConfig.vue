<template>
  <el-dialog title="配置AI应用" :visible="true" width="80%" center @close="cancel">
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleTabType">
      <el-tab-pane
        v-for="tab in abilityList"
        :key="tab.id"
        :label="tab.name"
        :name="tab.id"
      >
        <el-table
          v-if="activeName===tab.id"
          ref="appTable"
          v-loading="loading.table"
          :data="tableData"
          style="width: 100%;"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="应用名称" />
          <el-table-column prop="algorithmName" label="算法类型" />
          <el-table-column prop="description" label="描述" show-overflow-tooltip />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getAbilityList } from '@/api/ai-app'
import { describeIboxApps } from '@/api/ibox'
import { ResourceAiType } from '@/dics'

@Component({
  name: 'AppConfig',
  components: {}
})
export default class AiAppList extends Vue {
  public tableData = []
  private abilityList: any = []
  private activeName = '1'
  private loading = {
    table: false
  }

  private pager = {
    pageSize: 1000,
    pageNum: 1,
    totalNum: 0
  }

  private isIboxEdit = false
  private appDetailId = ''
  private ResourceAiType = ResourceAiType

  private selectedApps = []

  private async mounted() {
    this.loading.table = true
    try {
      await this.getAbilityList()
      await this.getAppList()
      await this.getLoadedAppList()
    } catch (e) {
      console.log(e)
    } finally {
      this.loading.table = false
    }
  }

  public async getAbilityList() {
    try {
      const { aiAbilityList } = await getAbilityList({})
      this.abilityList = aiAbilityList
    } catch (e) {
      this.$alertError(e && e.message)
    }
  }

  private async getLoadedAppList() {
    const path: any = this.$route.query.path
    const iboxId: any = path.split(',')[0]
    const deviceId: any = path.split(',').pop()
    const { iboxApps }: any = await describeIboxApps({
      ...this.pager,
      iboxId,
      deviceId,
      aiAbilityId: this.activeName
    })
    const tableRef: any = this.$refs.appTable[0]
    if (iboxApps.length > 0) {
      const selectedIds = iboxApps.map(app => app.appId)
      const selectedRows = this.tableData.filter(item => selectedIds.includes(item.appId))
      selectedRows.forEach(row => {
        tableRef.toggleRowSelection(row, true)
      })
    }
  }

  private async getAppList() {
    this.loading.table = true
    const path: any = this.$route.query.path
    const iboxId: any = path.split(',')[0]
    const { iboxApps, pageNum, pageSize, totalNum }: any =
      await describeIboxApps({
        ...this.pager,
        iboxId,
        // deviceId,
        aiAbilityId: this.activeName
      })
    this.pager = { pageSize, pageNum, totalNum }
    this.tableData = iboxApps
    this.loading.table = false
  }

  private async handleTabType() {
    this.loading.table = true
    try {
      await this.getAppList()
      await this.getLoadedAppList()
    } catch (e) {
      console.log(e)
    } finally {
      this.loading.table = false
    }
  }

  private handleSelectionChange(val) {
    this.selectedApps = val
  }

  private cancel() {
    this.$emit('close')
  }

  private submit() {
    this.$emit('bind', this.selectedApps)
    this.$emit('close')
  }
}
</script>

<style lang="scss" scoped>
.algo-container {
  height: calc(100% - 40px);
  overflow-y: auto;
}
</style>
