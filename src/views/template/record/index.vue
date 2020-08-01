<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">新建录制模板</el-button>
        <div class="filter-container__right">
          <el-input v-model="recordTemplateName" class="filter-container__search-group" placeholder="请输入录制模板名称" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect" icon="el-icon-search" />
          </el-input>
          <el-button class="el-button-rect" icon="el-icon-refresh" @click="refresh" />
        </div>
      </div>
      <el-table v-loading="loading" :data="dataList" fit>
        <el-table-column prop="templateName" label="模板名称" min-width="150" />
        <el-table-column prop="storeType" label="录制类别" min-width="100">
          <template slot-scope="{row}">
            <span v-html="row.recordType === 1 ? '自动录制' : '按需录制'" />
          </template>
        </el-table-column>
        <el-table-column prop="interval" label="周期时长" min-width="100">
          <template slot-scope="{row}">
            <span>{{ row.interval + '分钟' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="storeType" label="存储格式" min-width="100">
          <template slot-scope="{row}">
            <span v-html="row.storeType.join(', ')" />
          </template>
        </el-table-column>
        <el-table-column prop="storageTime" label="存储时长" min-width="100">
          <template slot-scope="{row}">
            <span>{{ row.storageTime + '分钟' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column prop="action" label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="update(scope.row)">编辑</el-button>
            <el-button type="text" @click="deleteTemplate(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="pager.pageIndex"
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
import { RecordTemplate } from '@/type/template'
import { dateFormatInTable } from '@/utils/date'
import { getRecordTemplates, deleteRecordTemplate } from '@/api/template'

@Component({
  name: 'record-template'
})
export default class extends Vue {
  private loading = false
  private recordTemplateName = ''
  private dataList: Array<RecordTemplate> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 20
  }

  private dateFormatInTable = dateFormatInTable

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
        keyWord: this.recordTemplateName,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      const res = await getRecordTemplates(params)
      this.loading = false
      this.dataList = res.templates.map((template: any) => {
        template.storeType = ['hls']
        template.interval = (template.hlsParam || template.mpParam || template.flvParam).interval / 60
        template.storageTime = (template.hlsParam || template.mpParam || template.flvParam).storageTime / 60
        return template
      })
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(`获取录制模板失败，原因：${e}`)
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
    this.$router.push('/template/record/create')
  }

  private async handleFilter() {
    await this.getList()
  }

  private async deleteTemplate(row: RecordTemplate) {
    this.$alertDelete({
      type: '录制模板',
      msg: `确定删除录制模板"${row.templateName}"`,
      method: deleteRecordTemplate,
      payload: { templateId: row.templateId },
      onSuccess: this.getList
    })
  }

  private update(row: RecordTemplate) {
    this.$router.push({
      path: '/template/record/update',
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
</style>
