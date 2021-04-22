<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <div class="head">
        <div class="head__left">
          <el-button type="primary" @click="createRole">创建角色</el-button>
        </div>
        <div class="head__right">
          <el-input v-model="roleSearch" placeholder="请输入角色名/角色ID" @keyup.enter.native="getList">
            <el-button slot="append" class="el-button-rect" @click="getList"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="getList"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table :data="policyList">
        <el-table-column prop="roleName" label="角色名" />
        <el-table-column prop="roleId" label="角色ID" />
        <el-table-column prop="describe" label="角色描述" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="updatedTime" label="创建时间" />
        <el-table-column label="操作" width="140">
          <template slot-scope="scope">
            <el-button type="text" @click="editRole(scope.row)">管理</el-button>
            <el-button type="text" @click="deleteRole(scope.row)">删除</el-button>
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

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { iamDeleteRole, getIamRoleList } from '@/api/accessManage'
@Component({
  name: 'AccessManageRole'
})
export default class extends Vue {
  private isLoading: boolean = false
  private showDialog: boolean = false
  private policyList: any = []
  private roleSearch: string = ''
  private pager: any = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private mounted() {
    this.getList()
  }

  private async getList() {
    try {
      let params: any = {
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      this.isLoading = true
      let res: any = await getIamRoleList(params)
      this.policyList = []
      for (let i = 0; i < res.iamRoles.length; i++) {
        let obj: object = {
          policyName: res.iamRoles[i].policyName,
          describe: res.iamRoles[i].policyDesc,
          createTime: res.iamRoles[i].createdTime,
          updatedTime: res.iamRoles[i].updatedTime
        }
        this.policyList.push(obj)
      }
      this.pager.total = parseInt(res.totalNum)
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.isLoading = false
    }
  }

  private createRole() {
    this.$router.push({
      name: 'accessManage-role-create',
      query: {
        type: 'add'
      }
    })
  }
  private editRole(role: any) {
    this.$router.push({
      name: 'accessManage-role-create',
      query: {
        type: 'edit',
        roleId: role.id
      }
    })
  }
  private deleteRole(role: any) {
    this.$alertDelete({
      type: '用户',
      msg: `是否确认删除用户"${role.roleName}"`,
      method: iamDeleteRole,
      payload: { roleId: role.roleId },
      onSuccess: () => {
        this.getList()
      }
    })
  }
  private closeDialog(refresh: boolean) {
    this.showDialog = false
    if (refresh) {
      this.getList()
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
