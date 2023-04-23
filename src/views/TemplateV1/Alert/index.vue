<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="createTemplate">创建告警模板</el-button>
        <div class="filter-container__right">
          <el-input v-model="searchFrom.templateName" class="filter-container__search-group" placeholder="请输入告警模板名称" @keyup.enter.native="search">
            <el-button slot="append" class="el-button-rect" @click="search"><svg-icon name="search" /></el-button>
          </el-input>
        </div>
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        :data="templateList"
        fit
        class="template__table"
        @row-click="rowClick"
        @filter-change="filterChange"
        @sort-change="sortChange"
      >
        <el-table-column prop="templateName" label="模板名称" min-width="150" />
        <!-- <el-table-column
          key="AlarmPriority"
          column-key="AlarmPriority"
          prop="alarmPriority"
          min-width="150"
          :filters="filtersArray.alarmPriority"
        > -->
        <el-table-column
          key="AlarmPriority"
          column-key="AlarmPriority"
          prop="alarmPriority"
          min-width="150"
        >
          <template slot="header">
            <span class="filter">报警级别</span>
            <!-- <svg-icon class="filter" name="filter" width="15" height="15" /> -->
          </template>
          <template slot-scope="{row}">
            {{ getLabel('alarmPriority', row.alarmPriority) }}
          </template>
        </el-table-column>
        <!-- <el-table-column
          key="AlarmMethod"
          column-key="AlarmMethod"
          prop="alarmMethod"
          min-width="240"
          :filters="filtersArray.alarmMethod"
        > -->
        <el-table-column
          key="AlarmMethod"
          column-key="AlarmMethod"
          prop="alarmMethod"
          min-width="240"
        >
          <template slot="header">
            <span class="filter">报警方式</span>
            <!-- <svg-icon class="filter" name="filter" width="15" height="15" /> -->
          </template>
          <template slot-scope="{row}">
            {{ getLabel('alarmMethod', row.alarmMethod) | lengthFormat }}
          </template>
        </el-table-column>
        <el-table-column
          key="CreatedTime"
          column-key="CreatedTime"
          prop="createdTime"
          sortable="custom"
          label="创建时间"
          min-width="240"
        >
          <template slot-scope="{row}">
            {{ row.createdTime }}
          </template>
        </el-table-column>
        <el-table-column
          key="UpdatedTime"
          column-key="UpdatedTime"
          prop="updatedTime"
          sortable="custom"
          label="更新时间"
          min-width="240"
        >
          <template slot-scope="{row}">
            {{ row.updatedTime }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="备注" min-width="240" />
        <el-table-column prop="action" class-name="col-action" label="操作" width="250" fixed="right">
          <template slot-scope="{row}">
            <el-button type="text" @click.stop="edit(row)">编辑</el-button>
            <el-button type="text" @click.stop="deleteTemplate(row)">删除</el-button>
            <el-button type="text" @click.stop="viewBind(row)">查看绑定关系</el-button>
          </template>
        </el-table-column>
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
    <view-bind v-if="showViewBindDialog" :template-id="currentTemplateId" @on-close="closeViewBind" />
  </div>
</template>

<script lang='ts'>
import { deleteAlertTemplate, getAlertTemplates } from '@/api/template'
import { Component, Vue, Watch } from 'vue-property-decorator'
import viewBind from './Dialogs/ViewBind.vue'

@Component({
  components: { viewBind },
  name: 'alert-template',
  filters: {
    lengthFormat: (value: string) => {
      if (value && value.length > 15) {
        return value.slice(0, 15) + '...'
      } else {
        return value
      }
    }
  }
})
export default class extends Vue {
  private loading: boolean = false
  private showViewBindDialog = false
  private currentTemplateId: any = ''
  private searchFrom: any = {
    templateName: '',
    alarmPriority: [],
    alarmMethod: [],
    sortBy: '',
    sortDirection: ''
  }
  private filtersArray: any = {
    alarmPriority: [
      { text: '一级警情', value: '1' },
      { text: '二级警情', value: '2' },
      { text: '三级警情', value: '3' },
      { text: '四级警情', value: '4' }
    ],
    alarmMethod: [
      { text: '电话报警', value: '1' },
      { text: '设备报警', value: '2' },
      { text: '短信报警', value: '3' },
      { text: 'GPS报警', value: '4' },
      { text: '视频报警', value: '5' },
      { text: '设备故障报警', value: '6' },
      { text: '其他报警', value: '7' }
    ]
  }
  private alarmPriorityOptions: any = [
    { label: '一级警情', value: '1' },
    { label: '二级警情', value: '2' },
    { label: '三级警情', value: '3' },
    { label: '四级警情', value: '4' }
  ]
  private alarmMethodOptions: any = [
    {
      value: '1',
      label: '电话报警'
    },
    {
      value: '2',
      label: '设备报警',
      children: [
        { value: '1', label: '视频丢失报警' },
        { value: '2', label: '设备防拆报警' },
        { value: '3', label: '存储设备磁盘满报警' },
        { value: '4', label: '设备高温报警' },
        { value: '5', label: '设备低温报警' }
      ]
    },
    {
      value: '3',
      label: '短信报警'
    },
    {
      value: '4',
      label: 'GPS报警'
    },
    {
      value: '5',
      label: '视频报警',
      children: [
        { value: '1', label: '人工视频报警' },
        { value: '2', label: '运动目标检测报警' },
        { value: '3', label: '遗留物检测报警' },
        { value: '4', label: '物体移除检测报警' },
        { value: '5', label: '绊线检测报警' },
        { value: '6', label: '入侵检测报警' },
        { value: '7', label: '逆行检测报警' },
        { value: '8', label: '徘徊检测报警' },
        { value: '9', label: '流量统计报警' },
        { value: '10', label: '密度检测报警' },
        { value: '11', label: '视频异常检测报警' },
        { value: '12', label: '快速移动报警' }
      ]
    },
    {
      value: '6',
      label: '设备故障报警',
      children: [
        { value: '1', label: '存储设备磁盘故障报警' },
        { value: '2', label: '存储设备风扇故障报警' }
      ]
    },
    {
      value: '7',
      label: '其他报警'
    }
  ]
  private templateList: any = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  @Watch('templateList.length')
  private onTemplateListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private mounted() {
    this.getList()
  }
  private search() {
    this.pager.pageNum = 1
    this.getList()
  }
  private async getList() {
    let params = {
      templateName: this.searchFrom.templateName,
      sortBy: this.searchFrom.sortBy,
      sortDirection: this.searchFrom.sortDirection,
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    try {
      this.loading = true
      let res: any = await getAlertTemplates(params)
      this.templateList = res.alarmTemplates
      this.pager.total = res.totalNum
    } catch (e) {
      this.$message.error(`获取模板列表失败，原因：${e && e.message}`)
    } finally {
      this.loading = false
    }
  }
  private getLabel(type: string, value: any) {
    try {
      let arr: any = []
      switch (type) {
        case 'alarmPriority':
          arr.push(value)
          break
        case 'alarmMethod':
          arr = Object.keys(JSON.parse(value))
          break
      }
      let res: any = arr.map((str: any) => {
        let obj = this[`${type}Options`].find((item: any) => item.value === str)
        if (obj) {
          return obj.label
        } else {
          return 'undefined'
        }
      })
      res = [...new Set(res)].join('，')
      return res
    } catch (e) {
      console.log(e)
    }
  }
  private filterChange(filters: any) {
    for (let key in filters) {
      const values = filters[key]
      if (values.length) {
        this.searchFrom[key] = values
      } else {
        this.searchFrom[key] = []
      }
    }
  }
  private sortChange(sort: any) {
    if (sort.order) {
      this.searchFrom.sortBy = sort.column.columnKey
      this.searchFrom.sortDirection = sort.order === 'ascending' ? 'asc' : 'desc'
      this.search()
    }
  }
  private rowClick(row: any) {
    this.$router.push({
      path: '/template/alert/details',
      query: {
        templateId: row.templateId?.toString()
      }
    })
  }
  private edit(row: any) {
    this.$router.push({
      path: '/template/alert/update',
      query: {
        templateId: row.templateId?.toString()
      }
    })
  }
  private async deleteTemplate(row: any) {
    this.$alertDelete({
      type: '告警模板',
      msg: `确定删除告警模板"${row.templateName}"`,
      method: deleteAlertTemplate,
      payload: { templateId: row.templateId },
      onSuccess: this.getList
    })
  }
  private viewBind(row: any) {
    this.currentTemplateId = row.templateId
    this.showViewBindDialog = true
  }
  private async closeViewBind() {
    this.currentTemplateId = ''
    this.showViewBindDialog = false
  }
  private createTemplate() {
    this.$router.push('/template/alert/create')
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getList()
  }
}
</script>

<style lang="scss" scoped>
.filter-container__search-group {
  margin-right: 10px;
}

.template__table {
  ::v-deep .el-table__column-filter-trigger i {
    display: none;
  }

  ::v-deep .el-table__body {
    td {
      cursor: pointer;
    }

    .col-action {
      cursor: default;
    }
  }
}
</style>
