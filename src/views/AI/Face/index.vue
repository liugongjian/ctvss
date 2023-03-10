<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">添加人脸库</el-button>
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
            <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
        <!--        <el-table-column type="selection" width="55" />-->
        <el-table-column prop="name" label="人脸库名称" align="center" :show-overflow-tooltip="true" />
        <el-table-column prop="description" label="描述" align="center" :show-overflow-tooltip="true" />
        <el-table-column prop="personCnt" label="人数" width="140" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="220" align="center" />
        <el-table-column prop="updateTime" label="更新时间" width="220" align="center" />
        <el-table-column label="操作" align="center" width="140">
          <template slot-scope="scope">
            <el-button type="text" @click="viewFace(scope.row)">查看</el-button>
            <el-button type="text" @click="editFace(scope.row)">编辑</el-button>
            <el-button type="text" @click="delFace([scope.row.id])">删除</el-button>
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
    <add-group-dialog
      v-if="showAddGroupDialog"
      :status="addDialogStatus"
      :data="editFaceInfo"
      @on-close="closeAddDialog"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AddGroupDialog from './components/AddGroup.vue'
import { listGroup, deleteGroup } from '@/api/face'

@Component({
  name: 'Face',
  components: {
    AddGroupDialog
  }
})
export default class extends Vue {
  private loading = false
  private showAddGroupDialog = false
  private addDialogStatus = 'add'
  private editFaceInfo = {}
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
      keyword: this.searchKey,
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    try {
      const res = await listGroup(params)
      this.dataList = res.groups
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
    this.showAddGroupDialog = true
  }

  private async handleFilter() {
    await this.getList()
  }

  private editFace(info) {
    this.editFaceInfo = info
    this.addDialogStatus = 'edit'
    this.showAddGroupDialog = true
  }

  private viewFace(row) {
    this.$router.push({
      path: '/ai/facelib/detail',
      query: {
        groupId: row.id,
        groupName: row.name
      }
    })
  }
  private delFace(ids) {
    this.$alertDelete({
      type: '提示',
      msg: '确定要删除选定人脸库吗',
      method: deleteGroup,
      payload: {
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
    this.showAddGroupDialog = false
    refresh && this.getList()
  }

  private async mounted() {
    if (this.$route.params.showAdd === 'Y') {
      this.handleCreate()
    }
    await this.getList()
  }
}
</script>
<style lang="scss" scoped>
.filter-container__search-group {
  margin-right: 10px;
}
</style>
