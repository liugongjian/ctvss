<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">新建回调模板</el-button>
        <div class="filter-container__right">
          <el-input v-model="callbackTemplateName" class="filter-container__search-group" placeholder="请输入回调模板名称" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table ref="table" v-loading="loading" :data="dataList" fit class="template__table">
        <el-table-column prop="templateName" label="模板名称" min-width="240" />
        <el-table-column prop="description" label="模板备注" min-width="260" />
        <el-table-column prop="createdTime" label="创建时间" width="200" />
        <el-table-column prop="action" class-name="col-action" label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="update(scope.row)">编辑</el-button>
            <el-button type="text" @click="deleteTemplate(scope.row)">删除</el-button>
            <el-button type="text" @click="viewBind(scope.row)">查看绑定关系</el-button>
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
import { deleteCallbackTemplate, getCallbackTemplates } from '@/api/template'
import { CallbackTemplate } from '@/type/Template'
import { dateFormatInTable } from '@/utils/date'
import { Component, Vue, Watch } from 'vue-property-decorator'
import ViewBind from './Dialogs/ViewBind.vue'

@Component({
  name: 'record-template',
  components: {
    ViewBind
  }
})
export default class extends Vue {
  private loading = false
  private callbackTemplateName = ''
  private dataList: Array<CallbackTemplate> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private dateFormatInTable = dateFormatInTable
  private showViewBindDialog = false
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
  private async viewBind(row: CallbackTemplate) {
    this.currentTemplateId = row.templateId
    this.showViewBindDialog = true
  }
  private async closeViewBind() {
    this.currentTemplateId = ''
    this.showViewBindDialog = false
  }
  private async getList() {
    try {
      this.loading = true
      let params = {
        templateName: this.callbackTemplateName || undefined,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      const res = await getCallbackTemplates(params)
      this.loading = false
      this.dataList = res.templates
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(`获取回调模板失败，原因：${e && e.message}`)
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
    this.$router.push('/template/callback/create')
  }

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList()
  }

  private async deleteTemplate(row: CallbackTemplate) {
    this.$alertDelete({
      type: '回调模板',
      msg: `确定删除回调模板"${row.templateName}"`,
      method: deleteCallbackTemplate,
      payload: { templateId: row.templateId },
      onSuccess: this.getList
    })
  }

  private update(row: CallbackTemplate) {
    this.$router.push({
      path: '/template/callback/update',
      query: {
        templateId: row.templateId!.toString()
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
    td {
      cursor: pointer;
    }

    .col-action {
      cursor: default;
    }
  }
}
</style>
