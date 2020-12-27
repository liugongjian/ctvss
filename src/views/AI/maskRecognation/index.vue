<template>
  <div class="app-container">
    <el-card>
      <div v-if="hasFiltered" class="filter-container filter-buttons">
        <div v-for="{key, value} in filterButtons" :key="key" class="filter-button" @click="clearFilter(key)">
          <label>{{ alertParams[key] }}</label>
          <span v-if="key === 'alertType'">{{ alertType[value] }}</span>
          <span v-if="key === 'alertLevel'">{{ alertLevel[value] }}</span>
          <svg-icon class="filter-button__close" name="close" width="10" height="10" />
        </div>
      </div>
      <el-table ref="table" v-loading="loading.table" class="alert-list__table" :data="alertList" fit @row-click="rowClick" @filter-change="filterChange">
        <el-table-column
          key="alertLevel"
          column-key="alertLevel"
          prop="level"
          label="告警级别"
          min-width="170"
          :filters="filtersArray.AlertLevel"
          :filter-multiple="false"
        >
          <template slot="header">
            <span class="filter">告警级别</span>
            <svg-icon class="filter" name="filter" width="15" height="15" />
          </template>
          <template slot-scope="{row}">
            {{ alertLevel[row.level] }}
          </template>
        </el-table-column>
        <el-table-column
          key="alertType"
          column-key="alertType"
          prop="type"
          label="告警类型"
          min-width="170"
          :filters="filtersArray.AlertType"
          :filter-multiple="false"
        >
          <template slot="header">
            <span class="filter">告警类型</span>
            <svg-icon class="filter" name="filter" width="15" height="15" />
          </template>
          <template slot-scope="{row}">
            {{ alertType[row.type] }}
          </template>
        </el-table-column>
        <el-table-column prop="datetime" label="触发时间" min-width="170" />
      </el-table>
      <el-pagination
        :current-page="pager.pageNum"
        :page-size="pager.pageSize"
        :total="pager.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
    <DashboardAlertLiveDetailDialog v-if="dialog" @on-close="closeDialog" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { AlertLevel, AlertType, AlertParams } from '@/dics'
import { GroupModule } from '@/store/modules/group'
import DashboardAlertLiveDetailDialog from '@/views/AI/maskRecognation/components/DetailDialog.vue'

@Component({
  name: 'MaskRecognation',
  components: {
    DashboardAlertLiveDetailDialog
  }
})

export default class extends Vue {
  private alertLevel = AlertLevel
  private alertType = AlertType
  private alertParams = AlertParams
  private alertList: Array<any> = []
  private currentItem = null
  private dialog = false
  private filter: any = {
    alertLevel: '',
    alertType: ''
  }
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 20
  }
  private loading = {
    table: false
  }

  private get currentGroupId() {
    return GroupModule.group?.groupId
  }

  private get hasFiltered() {
    return !!(this.filter.alertLevel || this.filter.alertType)
  }

  private get filterButtons() {
    const buttons = []
    for (let key in this.filter) {
      const value = this.filter[key]
      if (value) {
        buttons.push({
          key,
          value
        })
      }
    }
    return buttons
  }

  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: String) {
    if (!groupId) return
    this.$nextTick(() => {
      this.getAlertList()
    })
  }

  @Watch('filter', { immediate: true, deep: true })
  private onFilterChange() {
    this.getAlertList()
  }

  private handleCreate() {
    this.$router.push({
      path: '/stream/create'
    })
  }

  private async getAlertList() {
    this.loading.table = true
    // let params = {
    //   pageNum: this.pager.pageNum,
    //   pageSize: this.pager.pageSize,
    //   groupId: this.currentGroupId
    // }
    try {
      this.alertList = [
        {
          id: 1,
          level: 'normal',
          type: 1,
          datetime: '2020-12-23 13:32:40'
        },
        {
          id: 2,
          level: 'normal',
          type: 1,
          datetime: '2020-12-23 13:32:40'
        },
        {
          id: 3,
          level: 'normal',
          type: 2,
          datetime: '2020-12-23 13:32:40'
        },
        {
          id: 4,
          level: 'serious',
          type: 3,
          datetime: '2020-12-23 13:32:40'
        },
        {
          id: 5,
          level: 'serious',
          type: 3,
          datetime: '2020-12-23 13:32:40'
        },
        {
          id: 6,
          level: 'normal',
          type: 1,
          datetime: '2020-12-23 13:32:40'
        }
      ]
      this.pager.total = 100
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.table = false
    }
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getAlertList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getAlertList()
  }

  private rowClick(alertItem: any, column: any) {
    console.log('rowclick')
    this.openDialog(alertItem)
  }

  // 筛选类型
  private filtersArray = {
    AlertLevel: this.dictToFilterArray(AlertLevel),
    AlertType: this.dictToFilterArray(AlertType)
  }

  /**
   * 将字典转为筛选数组
   */
  private dictToFilterArray(dict: any) {
    const filterArray = []
    for (let key in dict) {
      filterArray.push({
        text: dict[key],
        value: key
      })
    }
    return filterArray
  }

  /**
   * 当表格的筛选条件发生变化
   */
  private filterChange(filters: any) {
    for (let key in filters) {
      const values = filters[key]
      if (values.length) {
        this.filter[key] = values[0]
      } else {
        this.filter[key] = ''
      }
    }
  }

  /**
   * 清空指定筛选条件
   */
  private clearFilter(key: string) {
    this.filter[key] = ''
    const table: any = this.$refs.table
    table.clearFilter(key)
  }

  private openDialog(item: any) {
    this.dialog = true
    this.currentItem = item
  }

  private closeDialog() {
    this.dialog = false
  }
}
</script>
<style lang="scss" scoped>
  .filter-buttons {
    display: flex;
    .filter-button {
      position: relative;
      border: 1px solid #ddd;
      border-radius: 4px;
      line-height: 26px;
      padding-right: 24px;
      margin-right: 10px;
      overflow: hidden;
      transition: border 100ms;
      cursor: pointer;
      label {
        display: inline-block;
        background: #f1f1f1;
        padding: 0 10px;
        margin-right: 8px;
        cursor: pointer;
      }
      &__close {
        position: absolute;
        right: 6px;
        top: 8px;
        color: #bbb;
        transition: border 100ms;
      }
      &:hover {
        border-color: $primary;
        .filter-button__close {
          color: $primary;
        }
      }
    }
  }
  .alert-list__table {
    ::v-deep .el-table__row {
      cursor: pointer;
    }
  }
</style>
