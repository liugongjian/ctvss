<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">新建推送策略</el-button>
        <div class="filter-container__right">
          <el-input v-model="notificationPolicyName" class="filter-container__search-group" placeholder="请输入策略名" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table ref="table" v-loading="loading" :data="dataList" fit class="template__table">
        <el-table-column prop="templateName" label="策略名" min-width="240" />
        <el-table-column prop="description" label="策略描述" min-width="260" />
        <el-table-column prop="enableType" label="推送方式" min-width="160">
          <template slot-scope="scope">
            {{ scope.row.enableType === 1 ? '自动启用' : '手动启用' }}
          </template>
        </el-table-column>
        <el-table-column prop="enableType" label="推送时段" min-width="160">
          <template slot-scope="scope">
            {{ scope.row.enableType === 1 ? '自动启用' : '手动启用' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="推送频率" width="200" />
        <el-table-column prop="createdTime" label="消息类型" width="200" />
        <el-table-column prop="createdTime" label="子类型" width="200" />
        <el-table-column prop="createdTime" label="创建时间" width="200" />
        <el-table-column prop="updatedTime" label="更新时间" width="200" />
        <el-table-column prop="action" class-name="col-action" label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <template>
              <el-button v-if="scope.row.status" type="text">开启</el-button>
              <el-button v-else type="text">关闭</el-button>
            </template>
            <el-button type="text" @click="update(scope.row)">编辑策略</el-button>
            <el-button type="text" @click="deleteTemplate(scope.row)">删除策略</el-button>
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
import { Component, Vue, Watch } from 'vue-property-decorator'
import { INotifictionPolicy } from '@/type/notification'
import { dateFormatInTable } from '@/utils/date'
import { getAITemplates, deleteAITemplate } from '@/api/template'

@Component({
  name: 'ai-template'
})
export default class extends Vue {
  private loading = false
  private notificationPolicyName = ''
  private dataList: Array<INotifictionPolicy> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private dateFormatInTable = dateFormatInTable
  private currentTemplateId: any

  @Watch('dataList.length')
  private onDataListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private async mounted() {
    await this.getList()
  }

  private async refresh() {
    await this.getList()
  }

  private async getList() {
    try {
      this.loading = true
      let params = {
        templateName: this.notificationPolicyName || undefined,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      const res = await getAITemplates(params)
      this.loading = false
      this.dataList = res.aITemplates
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(`获取策略列表失败，原因：${e && e.message}`)
      this.loading = false
    }
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getList()
  }

  private handleCreate() {
    this.$router.push('/notification/policy/create')
  }

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList()
  }

  private async deleteTemplate(row: INotifictionPolicy) {
    this.$alertDelete({
      type: 'AI模板',
      msg: `确定删除AI模板"${row.name}"`,
      method: deleteAITemplate,
      payload: { templateId: row.id },
      onSuccess: this.getList
    })
  }

  private update(row: INotifictionPolicy) {
    this.$router.push({
      path: '/notification/policy/update',
      query: {
        templateId: row.id!.toString()
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.filter-container__search-group {
  margin-right: 10px;
}

.template__table {
  ::v-deep .el-table__body {
    // td {
    //   cursor: pointer;
    // }
    .col-action {
      cursor: default;
    }
  }
}
</style>
