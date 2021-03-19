<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <!-- <div class="head">
        <div class="head__left">
          <el-button type="primary" @click="createPolicy">{{ `创建${this.typeObj[this.type]}策略` }}</el-button>
        </div>
        <div class="head__right">
          <el-input v-model="policyNameSearch" placeholder="请输入策略名" @keyup.enter.native="search">
            <el-button slot="append" class="el-button-rect" @click="search"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div> -->
      <el-table :data="policyList">
        <el-table-column prop="policyName" label="策略名" />
        <el-table-column prop="describe" label="策略描述" />
        <el-table-column prop="createTime" label="创建时间" />
        <!-- <el-table-column label="操作" width="140">
          <template slot-scope="scope">
            <el-button type="text" @click="viewPolicy">查看</el-button>
            <el-button type="text" @click="policyList.splice(scope.$index, 1)">管理</el-button>
            <el-button style="color: #A5A5A5" type="text" @click="policyList.splice(scope.$index, 1)">删除</el-button>
          </template>
        </el-table-column> -->
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

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getPolicyList } from '@/api/accessManage'
@Component({
  name: 'AccessManagePolicy'
})
export default class extends Vue {
  private isLoading: boolean = false
  private policyList: any = []
  private policyNameSearch: string = ''
  private pager: any = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private mounted() {
    this.getList()
  }

  private createPolicy() {
    this.$router.push(`/accessManage/policy/create`)
  }
  private viewPolicy() {
    this.$router.push(`/accessManage/policy/view`)
  }
  private search() {
  }
  private refresh() {
  }
  private async getList() {
    try {
      let params: any = {
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      this.isLoading = true
      let res: any = await getPolicyList(params)
      this.policyList = []
      for (let i = 0; i < res.iamPolices.length; i++) {
        let obj: object = {
          policyName: res.iamPolices[i].policyName,
          describe: res.iamPolices[i].policyDesc,
          createTime: res.iamPolices[i].createdTime
        }
        this.policyList.push(obj)
      }
      this.pager.total = res.totalNum
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.isLoading = false
    }
  }
  private handleSizeChange(val: number) {
    const pager: any = this.pager
    pager.pageSize = val
    pager.pageNum = 1
    this.getList()
  }
  private handleCurrentChange(val: number) {
    const pager: any = this.pager
    pager.pageNum = val
    this.getList()
  }
}
</script>

<style lang="scss" scoped>
  .head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    &__right {
      display: flex;
      .el-input {
        margin-right: 10px
      }
    }
  }
</style>
