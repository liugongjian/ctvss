<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">新建GB28181凭证</el-button>
        <div class="filter-container__right">
          <div class="filter-container__select">
            <el-select v-model="userType" placeholder="选择匿名方式" clearable>
              <el-option v-for="(value, key) in anonymousType" :key="key" :label="value" :value="key" />
            </el-select>
          </div>
          <el-input v-model="userName" class="filter-container__search-group" placeholder="请输入SIP用户认证ID/用户别名" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect" icon="el-icon-search" @click="handleFilter" />
          </el-input>
          <el-button class="el-button-rect" icon="el-icon-refresh" @click="refresh" />
        </div>
      </div>
      <el-table v-loading="loading" :data="dataList" fit>
        <el-table-column label="SIP用户认证ID/用户别名" min-width="100">
          <template slot-scope="{row}">
            {{ row.userName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="是否匿名">
          <template slot-scope="{row}">
            {{ anonymousType[row.userType] }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="160" />
        <el-table-column prop="createdTime" label="创建时间" :formatter="dateFormatInTable" min-width="160" />
        <el-table-column prop="action" label="操作" width="150" fixed="right">
          <template slot-scope="{row}">
            <el-button type="text" @click="edit(row)">编辑</el-button>
            <el-button type="text" @click="deleteCertificate(row)">删除</el-button>
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
import { AnonymousType } from '@/dics'
import { dateFormatInTable } from '@/utils/date'
import { getList, deleteCertificate } from '@/api/certificate/gb28181'
import { GB28181 } from '@/type/certificate'

@Component({
  name: 'CertificateGb28181List'
})
export default class extends Vue {
  private anonymousType = AnonymousType
  private userType = ''
  private userName = ''
  private loading = false
  private dataList: Array<GB28181> = [{
    userName: 'gb_user1',
    userType: 'abnormal',
    description: '用于上海园区监控',
    createdTime: 1594260926566
  }, {
    userName: 'gb_user2',
    userType: 'normal',
    description: '用于上海园区监控',
    createdTime: 1594260926566
  }]
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private dateFormatInTable = dateFormatInTable

  private refresh() {
    console.log('resfresh')
  }

  private async mounted() {
    await this.getList()
  }

  private async getList() {
    this.loading = true
    let params = {
      userName: this.userName,
      userType: this.userType,
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    const res = await getList(params)
    this.dataList = res.gbCerts
    this.pager.total = res.totalNum
    this.pager.pageNum = res.pageNum
    this.pager.pageSize = res.pageSize
    this.loading = false
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
    this.$router.push('/certificate/gb28181/create')
  }

  private async handleFilter() {
    await this.getList()
  }

  private edit(row: GB28181) {
    this.$router.push({
      name: 'gb28181-update',
      params: {
        userName: row.userName
      }
    })
  }

  private async deleteCertificate(row: GB28181) {
    await deleteCertificate({ userName: row.userName })
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  &__search-group {
    margin-right: 10px;
  }
  &__select {
    display: inline;
    margin-right: 10px;
  }
}
</style>
