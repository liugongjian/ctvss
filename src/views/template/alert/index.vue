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
        <el-table-column
          key="alertLevel"
          column-key="alertLevel"
          prop="alertLevel"
          min-width="150"
          :filters="filtersArray.alertLevel"
        >
          <template slot="header">
            <span class="filter">报警级别</span>
            <svg-icon class="filter" name="filter" width="15" height="15" />
          </template>
          <template slot-scope="{row}">
            {{ getLabel('alertLevel', row.alertLevel) }}
          </template>
        </el-table-column>
        <el-table-column
          key="alertType"
          column-key="alertType"
          prop="alertType"
          min-width="150"
          :filters="filtersArray.alertType"
        >
          <template slot="header">
            <span class="filter">报警方式</span>
            <svg-icon class="filter" name="filter" width="15" height="15" />
          </template>
          <template slot-scope="{row}">
            {{ getLabel('alertType', row.alertType) }}
          </template>
        </el-table-column>
        <el-table-column prop="date" label="有效期（天）" min-width="150" />
        <el-table-column
          key="createTime"
          column-key="createTime"
          prop="createTime"
          sortable="custom"
          label="创建时间"
          min-width="240"
        >
          <template slot-scope="{row}">
            {{ row.createTime }}
          </template>
        </el-table-column>
        <el-table-column
          key="updateTime"
          column-key="updateTime"
          prop="updateTime"
          sortable="custom"
          label="更新时间"
          min-width="240"
        >
          <template slot-scope="{row}">
            {{ row.updateTime }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="备注" min-width="240" />
        <el-table-column prop="action" class-name="col-action" label="操作" width="250" fixed="right">
          <template slot-scope="{row}">
            <el-button type="text" @click="edit(row)">编辑</el-button>
            <el-button type="text" @click="deleteTemplate(row)">删除</el-button>
            <el-button type="text" @click="viewBind(row)">查看绑定关系</el-button>
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
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'alert-template',
})
export default class extends Vue {
  private loading: boolean = false
  private currentTemplateId: any = ''
  private searchFrom: any = {
    templateName: '',
    alertLevel: [],
    alertType: [],
    createTimeSortType: '',
    updateTimeSortType: ''
  }
  private filtersArray: any = {
    alertLevel: [
      { text: '一级警情', value: 1 },
      { text: '二级警情', value: 2 },
      { text: '三级警情', value: 3 },
      { text: '四级警情', value: 4 }
    ],
    alertType: [
      { text: '电话报警', value: 1 },
      { text: '设备报警', value: 2 },
      { text: '短信报警', value: 3 },
      { text: 'GPS报警', value: 4 },
      { text: '视频报警', value: 5 },
      { text: '设备故障报警', value: 6 },
      { text: '其他报警', value: 7 }
    ]
  }
  private templateList: any = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private mounted() {
    this.getList()
  }
  private search() {
    this.pager.pageNum = 1
    this.getList()
  }
  private async getList() {
    this.templateList = [
      {
        templateName: '模板名称1',
        alertLevel: 1,
        alertType: 1,
        date: 12,
        createTime: '2021-05-12 10:20:27',
        updateTime: '2021-05-12 10:20:27',
        description: '告警备注'
      },
      {
        templateName: '模板名称2',
        alertLevel: 2,
        alertType: 2,
        date: 12,
        createTime: '2021-05-12 10:20:27',
        updateTime: '2021-05-12 10:20:27',
        description: '告警备注'
      },
      {
        templateName: '模板名称3',
        alertLevel: 3,
        alertType: 3,
        date: 12,
        createTime: '2021-05-12 10:20:27',
        updateTime: '2021-05-12 10:20:27',
        description: '告警备注'
      },
      {
        templateName: '模板名称4',
        alertLevel: 4,
        alertType: 4,
        date: 12,
        createTime: '2021-05-12 10:20:27',
        updateTime: '2021-05-12 10:20:27',
        description: '告警备注'
      }
    ]
  }
  private getLabel(type: string, value: any) {
    let Obj = this.filtersArray[type].find((item: any) => item.value === value)
    if (Obj) {
      return Obj.text
    } else {
      return 'undefined'
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
    console.log(this.searchFrom);
    
  }
  private sortChange(sort: any) {
    if (sort.order) {
      this.searchFrom[`${sort.prop}SortType`] = sort.order
    } else {
      this.searchFrom[`${sort.prop}SortType`] = ''
    }
    console.log(this.searchFrom);
  }
  private rowClick(row: any) {
    console.log(row);
    
  }
  private edit(row: any) {
    this.$router.push({
      path: '/template/alert/update',
      query: {
        templateId: row.templateId?.toString()
      }
    })
  }
  private deleteTemplate(row: any) {
    
  }
  private viewBind(row: any) {
    
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
