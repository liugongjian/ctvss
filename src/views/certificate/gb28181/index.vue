<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">新建GB28181凭证</el-button>
        <div class="filter-container__right">
          <el-input v-model="groupName" class="filter-container__search-group" placeholder="请输入GB28181凭证" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect" icon="el-icon-search" />
          </el-input>
          <el-button class="el-button-rect" icon="el-icon-refresh" @click="refresh" />
        </div>
      </div>
      <el-table :data="dataList" fit>
        <el-table-column label="用户名" min-width="100">
          <template slot-scope="{row}">
            {{ row.username || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="是否匿名">
          <template slot-scope="{row}">
            {{ anonymousType[row.anonymous] }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="160" />
        <el-table-column prop="createdTime" label="创建时间" :formatter="dateFormatInTable" min-width="160" />
        <el-table-column prop="action" label="操作" width="150" fixed="right">
          <template slot-scope="{row}">
            <el-button type="text" @click="edit(row)">编辑</el-button>
            <el-button type="text">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="pager.currentIndex"
        :page-size="pager.size"
        :total="pager.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { AnonymousType } from '@/dics'
import { dateFormatInTable } from '@/utils/date'

@Component({
  name: 'CertificateGb28181List'
})
export default class extends Vue {
  private anonymousType = AnonymousType
  private groupName = ''
  private dataList = [{
    id: 1,
    username: 'gb_user1',
    anonymous: false,
    description: '用于上海园区监控',
    createdTime: 1594260926566
  }, {
    id: 2,
    username: 'gb_user2',
    anonymous: false,
    description: '用于上海园区监控',
    createdTime: 1594260926566
  }]
  private pager = {
    total: 0,
    currentIndex: 1,
    size: 10
  }

  private dateFormatInTable = dateFormatInTable

  private refresh() {
    console.log('resfresh')
  }

  private getList() {
    console.log('getList')
  }

  private handleSizeChange(val: number) {
    console.log('sizeChange')
  }

  private handleCurrentChange(val: number) {
    console.log('currentChange')
  }

  private handleCreate() {
    this.$router.push('/certificate/gb28181/create')
  }

  private handleFilter() {
    console.log('filter')
  }

  private edit(row: any) {

  }
}
</script>

<style lang="scss" scoped>
.filter-container__search-group {
  margin-right: 10px;
}
</style>
