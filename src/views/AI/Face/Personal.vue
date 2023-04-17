<template>
  <div class="app-container">
    <el-page-header @back="back">
      <div slot="content">
        成员详情（
        <el-tooltip :content="groupName" placement="top">
          <span class="pageHeader">{{ groupName }}</span>
        </el-tooltip>
        ）
      </div>
    </el-page-header>
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">添加人员</el-button>
        <el-dropdown placement="bottom" @command="handleBatch">
          <el-button :disabled="!multipleSelection.length">
            批量操作<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="copy">复制</el-dropdown-item>
            <el-dropdown-item command="delete">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="filter-container__right">
          <el-input
            v-model="searchKey"
            class="filter-container__search-group"
            placeholder="请输入关键字"
            clearable
            maxlength="64"
            @keyup.enter.native="handleFilter"
            @clear="handleFilter"
          >
            <el-button
              slot="append"
              class="el-button-rect"
              @click="handleFilter"
            >
              <svg-icon name="search" />
            </el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh">
            <svg-icon name="refresh" />
          </el-button>
        </div>
      </div>
      <el-table
        v-loading="loading"
        class="personal-info__table"
        :data="dataList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="imgString" label="头像">
          <template slot-scope="{ row }">
            <div class="image-container">
              <el-image :src="row.faceCropUrls[0]"></el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="姓名"
          :show-overflow-tooltip="true"
        />
        <el-table-column prop="number" label="人员编号" />
        <el-table-column
          prop="description"
          label="描述"
          :show-overflow-tooltip="true"
        />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="updateTime" label="更新时间" />
        <el-table-column label="操作" align="center" width="140">
          <template slot-scope="scope">
            <el-button type="text" @click="editPerson(scope.row)">
              编辑
            </el-button>
            <el-button type="text" @click="delPerson([scope.row.id])">
              删除
            </el-button>
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
    <add-personal
      v-if="showAddPesronDialog"
      :group-id="groupId"
      :status="addDialogStatus"
      :data="editPersonInfo"
      @on-close="closeAddDialog"
    />
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
  private groupName = ''
  private loading = false
  private showAddPesronDialog = false
  private showCopyPesronDialog = false
  private addDialogStatus = 'add'
  private editPersonInfo = {}
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private searchKey = ''
  private dataList: any = []
  private multipleSelection = []

  private async getList() {
    this.loading = true
    const params = {
      groupId: this.groupId,
      keyword: this.searchKey,
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    try {
      const res = await listPerson(params)
      this.dataList = res.persons
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
    this.addDialogStatus = 'add'
    this.showAddPesronDialog = true
  }

  private async handleFilter() {
    await this.getList()
  }
  private editPerson(info) {
    this.editPersonInfo = info
    this.addDialogStatus = 'edit'
    this.showAddPesronDialog = true
  }
  private delPerson(ids) {
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
        this.showCopyPesronDialog = true
        break
      case 'delete':
        this.delPerson(this.multipleSelection.map((item) => item.id))
        break
    }
  }

  private back() {
    this.$router.go(-1)
  }

  private async mounted() {
    this.groupId = this.$route.query.groupId as string
    this.groupName = this.$route.query.groupName as string
    await this.getList()
  }
}
</script>
<style lang="scss" scoped>
.pageHeader {
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
}

.filter-container__search-group {
  margin-right: 10px;
}

.personal-info__table {
  margin-top: 10px;

  ::v-deep .el-table__body {
    td {
      cursor: pointer;
    }

    .col-action {
      cursor: default;
    }
  }
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100px;
  background-color: transparent;

  img {
    max-width: 100px;
    max-height: 100px;
  }
}
</style>
