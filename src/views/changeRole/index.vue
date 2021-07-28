<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <div class="head">
        <div class="head__left">
          <el-button v-if="inRole" type="primary" @click="exitRole">退出角色</el-button>
        </div>
        <div class="head__right">
          <el-input v-model="roleSearch" placeholder="请输入角色名/授权账号" clearable @keyup.enter.native="getList">
            <el-button slot="append" class="el-button-rect" @click="getList"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="getList"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table :data="roleList">
        <el-table-column prop="roleId" label="角色ID" />
        <el-table-column prop="roleName" label="角色名" />
        <el-table-column prop="description" label="角色描述" min-width="160" />
        <el-table-column prop="userName" label="角色授权账号" />
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === true" type="success">使用中</el-tag>
            <el-tag v-else type="">未使用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" />
        <el-table-column prop="usedTime" label="最后使用时间" />
        <el-table-column label="操作" width="140">
          <template slot-scope="scope">
            <el-button type="text" :disabled="scope.row.status === true" @click="useRole(scope.row)">使用角色</el-button>
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
import { getUserRoleList } from '@/api/accessManage'
import { UserModule } from '@/store/modules/user'
@Component({
  name: 'AccessManageRole'
})
export default class extends Vue {
  private isLoading: boolean = false
  private showDialog: boolean = false
  private roleList: any = []
  private roleSearch: string = ''
  private pager: any = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private get inRole() {
    return UserModule.mainUserRoleId !== ''
  }

  private mounted() {
    this.getList()
  }

  private async getList() {
    try {
      let params: any = {
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize,
        roleName: this.roleSearch || undefined
      }
      this.isLoading = true
      let res: any = await getUserRoleList(params)
      this.roleList = res.vssRoles.map((role: any) => ({
        ...role,
        status: role.roleId === UserModule.mainUserRoleId
      }))
      this.pager.total = parseInt(res.totalNum)
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.isLoading = false
    }
  }

  private async exitRole() {
    await this.useRole(false)
  }
  private useRole(role: any) {
    this.$msgbox({
      title: role ? '确认切换？' : '确认退出？',
      message: role ? `确认切换到角色 ${role.roleName} 吗？` : '确认退出当前使用角色吗？',
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      beforeClose: async(action: any, instance: any, done: Function) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          instance.confirmButtonText = role ? '切换中...' : '退出中...'
          try {
            await UserModule.switchRole({ role, needWebRequest: true })
            done()
          } catch (e) {
            this.$message.error(e.message)
          } finally {
            instance.confirmButtonLoading = false
            instance.confirmButtonText = '确定'
          }
        } else {
          done()
        }
      }
    }).then(() => {
      this.$message({
        type: 'success',
        message: role ? `切换角色 ${role.roleName} 成功` : '退出角色成功'
      })
      // 重新获取第一页
      this.pager.pageNum = 1
      this.getList()
    }).catch((e: any) => {
      if (e === 'cancel' || e === 'close') return
      this.$message.error(e)
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
