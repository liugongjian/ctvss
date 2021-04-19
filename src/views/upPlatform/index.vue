<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">添加上级平台</el-button>
        <div class="filter-container__right">
          <el-input v-model="userName" class="filter-container__search-group" placeholder="请输入关键词" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="dataList" fit>
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="action" label="操作" width="220" fixed="right">
          <template slot-scope="{row}">
            <el-button type="text" @click="edit(row)">编辑</el-button>
            <el-button type="text" @click="edit(row)">选择通道</el-button>
            <el-button type="text" @click="edit(row)">启用</el-button>
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
import { Platform } from '@/type/platform'

@Component({
  name: 'UpPlatformList'
})
export default class extends Vue {
  private loading = false
  private dataList: Array<Platform> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private async refresh() {
    await this.getList()
  }

  private async mounted() {
    await this.getList()
  }

  private async getList() {
    this.loading = true
    try {
      this.dataList = [
        {
          name: '名称'
        }
      ]
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
    this.$router.push('up-platform/create')
  }

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList()
  }

  // private edit(row: GB28181) {
  //   this.$router.push({
  //     name: 'gb28181-update',
  //     params: {
  //       userName: row.userName
  //     }
  //   })
  // }

  // private async deleteCertificate(row: GB28181) {
  //   this.$alertDelete({
  //     type: 'GB28181凭证',
  //     msg: `是否确认删除GB28181凭证"${row.userName}"`,
  //     method: deleteCertificate,
  //     payload: { userName: row.userName },
  //     onSuccess: this.getList
  //   })
  // }
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
