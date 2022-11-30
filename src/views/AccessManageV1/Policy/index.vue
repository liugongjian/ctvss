<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <div class="head">
        <div class="head__left">
          <el-button type="primary" @click="createPolicy">{{ `新建自定义策略` }}</el-button>
        </div>
        <div class="head__right">
          <el-input v-model="policyNameSearch" placeholder="请输入策略名" clearable @keyup.enter.native="search">
            <el-button slot="append" class="el-button-rect" @click="search">
              <svg-icon name="search" />
            </el-button>
          </el-input>
          <!-- <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button> -->
        </div>
      </div>
      <el-table :data="policyList">
        <el-table-column prop="policyName" label="策略名" min-width="100" />
        <el-table-column prop="policyDesc" label="策略描述" :show-overflow-tooltip="true" min-width="160" />
        <el-table-column prop="scope" label="策略归属域" width="140">
          <template slot-scope="scope">
            <el-button v-if="scope.row.policyScope === 'ctyun'" type="danger" size="mini">系统策略</el-button>
            <el-button v-else type="success" size="mini">自定义策略</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="policyType" label="策略类型" width="140">
          <template slot-scope="scope">
            {{ scope.row.policyType === 'subUser' ? '子用户策略' : '角色策略' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280">
          <template slot-scope="scope">
            <el-button type="text" @click="viewBind(scope.row)">查看绑定关系</el-button>
            <el-button type="text" @click="editPolicy(scope.row)">{{ scope.row.policyScope === 'local' ? '编辑策略' : '查看策略' }}</el-button>
            <el-button v-if="scope.row.policyScope === 'local'" style="color: #a5a5a5;" type="text" @click="deletePolicy(scope.row)">删除策略</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="pager.pageNum" :page-size="pager.pageSize" :total="pager.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
    <view-bind v-if="showViewBindDialog" :policy-id="currentPolicyId" @on-close="closeViewBind" />
  </div>
</template>

<script lang="ts">
import { deletePolicy, getPolicyList } from '@/api/accessManage'
import { Component, Vue } from 'vue-property-decorator'
import ViewBind from './components/ViewBind.vue'
@Component({
  components: { ViewBind },
  name: 'AccessManagePolicy'
})
export default class extends Vue {
  private showViewBindDialog = false
  private currentPolicyId = ''
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
  /**
   * 查看绑定关系
   */
  private async viewBind(row: any) {
    this.currentPolicyId = row.policyId
    this.showViewBindDialog = true
  }
  private async closeViewBind() {
    this.currentPolicyId = ''
    this.showViewBindDialog = false
  }

  private createPolicy() {
    this.$router.push('/access-manage/policy/create')
  }
  private editPolicy(row: any) {
    this.$router.push({
      path: '/access-manage/policy/edit',
      query: {
        policyId: row.policyId,
        policyScope: row.policyScope
      }
    })
  }

  private deletePolicy(row: any) {
    if (row.policyScope === 'Ctyun') {
      this.$message.error('无法删除系统内置策略!')
      return
    }
    this.$alertDelete({
      type: '自定义策略',
      msg: `是否确认删除自定义策略"${row.policyName}"`,
      method: deletePolicy,
      payload: { policyId: row.policyId },
      onSuccess: () => {
        this.getList()
      }
    })
  }
  private search() {
    this.getList()
  }
  private async getList() {
    try {
      let params: any = {
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize,
        policyName: this.policyNameSearch,
        policyType: 'subUser'
      }
      this.isLoading = true
      let res: any = await getPolicyList(params)
      this.policyList = res.iamPolices
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
      margin-right: 0;
    }
  }
}
</style>
