<template>
  <div class="app-container">
    <el-page-header content="成员详情" @back="back" />
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">添加人员</el-button>
        <el-dropdown placement="bottom" @command="handleBatch">
          <el-button :disabled="!multipleSelection.length">批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="copy">复制</el-dropdown-item>
            <el-dropdown-item command="delete">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="filter-container__right">
          <el-input v-model="searchKey" class="filter-container__search-group" placeholder="请输入人员名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter">
            <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="imgString" label="头像">
          <template slot-scope="{row}">
            <div class="image-container">
<!--              <img :src="decodeBase64(row.picUrls[0])">-->
              <img :src="row.picUrls[0]">
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="number" label="人员编号" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="updatedTime" label="创建时间" />
        <el-table-column prop="createdTime" label="更新时间" />
        <el-table-column label="操作" align="center" width="140">
          <template slot-scope="scope">
            <el-button type="text" @click="editPerson(scope.row)">编辑</el-button>
            <el-button type="text" @click="delPerson([scope.row.id])">删除</el-button>
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
    <add-personal v-if="showAddPesronDialog" @on-close="closeAddDialog" />
    <copy-personal
      v-if="showCopyPesronDialog"
      :persons="multipleSelection"
      :group-id="groupId"
      @on-close="closeCopyDialog"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AddPersonal from './components/AddPersonal.vue'
import CopyPersonal from './components/CopyPersonal.vue'
import { decodeBase64 } from '@/utils/base64'
import { listPerson, deletePerson } from '@/api/face'

@Component({
  name: 'Personal',
  components: {
    AddPersonal,
    CopyPersonal
  }
})
export default class extends Vue {
  private groupId = ''
  private loading = false
  private decodeBase64 = decodeBase64
  private showAddPesronDialog = false
  private showCopyPesronDialog = false
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private searchKey = ''
  private dataList: any = [
    {
      picUrls: [''],
      id: 'a001',
      name: 'aaa',
      number: '',
      description: '',
      updatedTime: '',
      createdTime: ''
    }
  ]
  private multipleSelection = []

  private async getList() {
    this.loading = true
    let params = {
      groupId: this.groupId,
      keyword: this.searchKey,
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    try {
      const res = await listPerson(params)
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
    console.log('新建')
    this.showAddPesronDialog = true
  }

  private async handleFilter() {
    console.log('筛选')
  }
  private editPerson() {
    console.log('编辑')
  }
  private delPerson(ids) {
    console.log('delPerson', ids)
    this.$alertDelete({
      type: '提示',
      msg: '确定要删除选定人员信息吗',
      method: deletePerson,
      payload: {
        groupId: this.groupId,
        ids
      },
      onSuccess: this.getList
    })
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
    await this.getList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getList()
  }

  private closeAddDialog(refresh: boolean) {
    this.showAddPesronDialog = false
    refresh && this.getList()
  }

  private closeCopyDialog() {
    this.showCopyPesronDialog = false
  }

  /**
   * 批量操作菜单
   */
  public handleBatch(command: any) {
    if (!this.multipleSelection.length) {
      this.$alertError('请先选择人员')
      return
    }
    switch (command) {
      case 'copy':
        console.log('复制')
        this.showCopyPesronDialog = true
        break
      case 'delete':
        console.log('删除')
        this.delPerson(this.multipleSelection.map(item => item.id))
        break
    }
  }

  private back() {
    this.$router.go(-1)
  }

  private async mounted() {
    console.log(this.$route.query.groupId)
    this.groupId = this.$route.query.groupId as string
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
