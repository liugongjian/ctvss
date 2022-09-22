<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">新建GA1400凭证</el-button>
        <div class="filter-container__right">
          <el-input v-model="username" class="filter-container__search-group" placeholder="请输入凭证用户名" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="dataList" fit>
        <el-table-column label="凭证用户名" min-width="100">
          <template slot-scope="{row}">
            {{ row.username || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="160" />
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
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
import { Component, Vue, Watch } from 'vue-property-decorator'
import { getGa1400CertificateList, deleteGa1400Certificate } from '@vss/device/api/certificate'
import { GA1400 } from '@vss/device/type/Certificate'

@Component({
  name: 'CertificateGb28181List'
})
export default class extends Vue {
  private username = ''
  private loading = false
  private dataList: Array<GA1400> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  @Watch('dataList.length')
  private onDataListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private async refresh() {
    await this.getList()
  }

  private async mounted() {
    await this.getList()
  }

  private async getList() {
    this.loading = true
    let params = {
      username: this.username,
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    try {
      const res = await getGa1400CertificateList(params)
      this.dataList = res.data
      this.pager.total = res.total
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
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
    this.$router.push('/certificate/ga1400/create')
  }

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList()
  }

  private edit(row: GA1400) {
    this.$router.push({
      name: 'ga1400-update',
      params: {
        username: row.username
      }
    })
  }

  private async deleteCertificate(row: any) {
    this.$alertDelete({
      type: 'GA1400凭证',
      msg: `是否确认删除GA1400凭证"${row.username}"`,
      method: deleteGa1400Certificate,
      payload: { username: row.username, id: row.id },
      onSuccess: this.getList
    })
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
