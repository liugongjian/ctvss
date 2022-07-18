<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">添加人脸库</el-button>
        <el-dropdown placement="bottom" @command="handleBatch">
          <el-button :disabled="!multipleSelection.length">批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="copy">复制</el-dropdown-item>
            <el-dropdown-item command="delete">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="filter-container__right">
          <el-input v-model="sortKey" class="filter-container__search-group" placeholder="请输入人脸库名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter">
            <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="组名" align="center" />
        <el-table-column prop="description" label="描述" align="center" />
        <el-table-column prop="num" label="人数" width="140" align="center" />
        <el-table-column prop="createdTime" label="创建时间" width="220" align="center" />
        <el-table-column prop="updatedTime" label="更新时间" width="220" align="center" />
        <el-table-column label="操作" align="center" width="140">
          <template slot-scope="scope">
            <el-button type="text" @click="viewFace(scope.row)">查看</el-button>
            <el-button type="text" @click="delFace(scope.row)">删除</el-button>
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
    <add-group-dialog v-if="showAddGroupDialog" @on-close="closeAddDialog" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AddGroupDialog from './components/AddGroup.vue'
import { listGroup } from '@/api/face'

@Component({
  name: 'Face',
  components: {
    AddGroupDialog
  }
})
export default class extends Vue {
  private loading = false
  private showAddGroupDialog = false
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private sortKey = ''
  private dataList: any = [
    // {
    //   name: 'aaa',
    //   description: '',
    //   num: '120',
    //   createdTime: '2010-12-2',
    //   updatedTime: '2022-12-1'
    // },
    // {
    //   name: 'bbb',
    //   description: '',
    //   num: '120',
    //   createdTime: '2010-12-2',
    //   updatedTime: '2022-12-1'
    // }
  ]
  private multipleSelection = []

  private async getList() {
    this.loading = true
    let params = {
      sortBy: this.sortKey,
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    try {
      const res = await listGroup(params)
      this.dataList = res.data
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private handleCreate() {
    this.showAddGroupDialog = true
  }

  private async handleFilter() {
    console.log('筛选')
  }
  private viewFace() {
    console.log('查看')
  }
  private delFace() {
    console.log('删除')
  }

  private async refresh() {
    await this.getList()
  }

  private handleSelectionChange(val) {
    console.log('handleSelectionChange', val)
    this.multipleSelection = val
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    // await this.getList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    // await this.getList()
  }

  private closeAddDialog(refresh: boolean) {
    this.showAddGroupDialog = false
    refresh && this.getList()
  }

  /**
   * 批量操作菜单
   */
  public handleBatch(command: any) {
    if (!this.multipleSelection.length) {
      this.$alertError('请先选择设备')
      return
    }
    switch (command) {
      case 'copy':
        console.log('复制')
        break
      case 'delete':
        console.log('删除')
        break
    }
  }

  private async mounted() {
    await this.getList()
  }
}
</script>
<style lang="scss" scoped>
.filter-container__search-group {
  margin-right: 10px;
}

.group-list__table {
  ::v-deep .el-table__body {
    td {
      cursor: pointer;
    }

    .col-action {
      cursor: default;
    }
  }
}

.group-name {
  cursor: pointer;

  &__id {
    color: $primary;
  }
}
</style>
