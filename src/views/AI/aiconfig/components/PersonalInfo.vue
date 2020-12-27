<template>
  <div>
    <el-button type="primary" @click="showAddPesronDialog=true">添加人员</el-button>
    <el-table v-loading="loading" class="personal-info__table" :data="dataList" fit>
      <el-table-column prop="profile" label="头像">
        <template slot-scope="{row}">
          {{ row.profile }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="certificate" label="身份证号" />
      <el-table-column prop="description" label="描述" />
    </el-table>
    <el-pagination
      :current-page="pager.pageNum"
      :page-size="pager.pageSize"
      :total="pager.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <AddPersonal v-if="showAddPesronDialog" @on-close="showAddPesronDialog=false" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AddPersonal from './dialogs/AddPersonal'

@Component({
  name: 'PersonalInfo',
  components: {
    AddPersonal
  }
})
export default class extends Vue {
  private showAddPesronDialog = false
  private loading = false
  private dataList = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 20
  }

  private getPersonalList() {

  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getPersonalList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getPersonalList()
  }
}
</script>

<style lang="scss" scoped>
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
</style>
