<template>
  <div>
    <el-button type="primary" @click="showAddPesronDialog=true">添加人员</el-button>
    <el-table v-loading="loading" class="personal-info__table" :data="dataList" fit>
      <el-table-column prop="imgString" label="头像">
        <template slot-scope="{row}">
          <div class="image-container">
            <img :src="row.imageString">
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="cardId" label="身份证号" />
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
    <AddPersonal v-if="showAddPesronDialog" @on-close="closeDialog" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AddPersonal from './dialogs/AddPersonal.vue'
import { getPersonalList } from '@/api/ai'

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
  private created() {
    this.getPersonalList()
  }

  private async getPersonalList() {
    try {
      this.loading = true
      const res: any = await getPersonalList({
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      })
      this.dataList = res.faces
      this.pager.total = res.totalNum
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getPersonalList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getPersonalList()
  }

  private async closeDialog(refresh: boolean) {
    this.showAddPesronDialog = false
    if (refresh) {
      await this.getPersonalList()
    }
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

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100px;
  background-color: #d9d9d9;

  img {
    max-width: 100px;
    max-height: 100px;
  }
}
</style>
