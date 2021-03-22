<template>
  <div class="app-container">
    <el-card :class="{'collapsed': isCollapsed}">
      <div class="titleBar">
        <div class="titleBar__menu">
          <el-button @click="isCollapsed = !isCollapsed">
            <svg-icon name="hamburger" />
          </el-button>
          <div class="titleBar__menu__tools">
            <el-tooltip effect="dark" content="创建子部门" placement="top" :open-delay="300">
              <el-button type="text" @click="showDialog('add')"><svg-icon name="plus" style="color: #000000" /></el-button>
            </el-tooltip>
          </div>
        </div>
        <div class="titleBar__title">
          <span>通讯录</span>
          <span>{{ currentNode.data.groupName === '通讯录' ? '' : `/${currentNode.data.groupName}` }}</span>
        </div>
      </div>
      <div class="content">
        <el-main v-loading="loading.menu" class="content__menu">
          <el-tree
            ref="groupTree"
            :data="groupList"
            :props="props"
            node-key="groupName"
            highlight-current
            :expand-on-click-node="false"
            :default-expanded-keys="['通讯录']"
            current-node-key="通讯录"
            @current-change="setCurrentNode"
          >
            <span
              slot-scope="{node}"
              class="content__menu__item"
            >
              <span>
                <span>{{ node.label }}</span>
              </span>
              <span v-if="node.label !== '通讯录'" class="content__menu__item__btns">
                <el-tooltip effect="dark" content="修改子部门" placement="top" :open-delay="300">
                  <el-button type="text" @click="showDialog('edit', node)">
                    <svg-icon name="edit" class="content__menu__item__btns__icon" />
                  </el-button>
                </el-tooltip>
                <el-tooltip effect="dark" content="合并子部门" placement="top" :open-delay="300">
                  <el-button type="text" @click="showDialog('merge', node)">
                    <svg-icon name="combine" class="content__menu__item__btns__icon" />
                  </el-button>
                </el-tooltip>
              </span>
            </span>
          </el-tree>
        </el-main>
        <div class="content__body">
          <div class="head">
            <div class="head__left">
              <el-button type="primary" @click="createUser">创建成员</el-button>
              <el-button :disabled="currentNode.data.groupName === '通讯录'" @click="showDialog('edit', currentNode)">修改子部门</el-button>
            </div>
            <div class="head__right">
              <!-- <el-input v-model="userSearch" placeholder="请输入用户名/账号ID" @keyup.enter.native="getUserList">
                <el-button slot="append" class="el-button-rect" @click="getUserList"><svg-icon name="search" /></el-button>
              </el-input> -->
              <el-button class="el-button-rect" @click="getUserList"><svg-icon name="refresh" /></el-button>
            </div>
          </div>
          <el-table v-loading="loading.body" :data="userList">
            <el-table-column prop="iamUserName" label="用户名" />
            <el-table-column prop="iamUserId" label="账号ID" />
            <el-table-column prop="policyName" label="策略" />
            <el-table-column prop="createdTime" label="创建时间" />
            <el-table-column label="操作" width="140">
              <template slot-scope="scope">
                <el-button type="text" @click="editUser(scope.row.iamUserId)">编辑</el-button>
                <el-button type="text" @click="deleteUser(scope.row)">删除</el-button>
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
        </div>
      </div>
    </el-card>
    <UserGroupDialog v-if="isShowDialog" :dialog-data="dialogData" @on-close="closeAddDialog" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import UserGroupDialog from './components/dialogs/userGroupDialog.vue'
import { getGroupList, getUserList, deleteUser } from '@/api/accessManage'
@Component({
  name: 'AccessManageUser',
  components: {
    UserGroupDialog
  }
})
export default class extends Vue {
  private loading: any = {
    menu: false,
    body: false
  }
  private isShowDialog: boolean = false
  private isCollapsed: boolean = false
  private props: object = {
    isLeaf: 'leaf',
    label: 'groupName',
    children: 'children'
  }
  private userList: any = []
  private userSearch: string = ''
  private pager: object = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private dialogData: any = {}
  private groupList: any = [
    { groupName: '通讯录', groupId: '-1', leaf: false, children: [] }
  ]
  private currentNode: any = {
    data: {
      groupName: '通讯录',
      groupId: '-1'
    }
  }

  private mounted() {
    this.getGroups()
    this.getUserList()
  }

  private setCurrentNode(data: any, node: any) {
    this.currentNode = node
    this.getUserList()
  }

  private async getGroups() {
    let params = {}
    try {
      this.loading.menu = true
      let res = await getGroupList(params)
      this.groupList[0].children = res.groups.map((group: any) => {
        return {
          groupName: group.groupName,
          groupId: group.groupId,
          leaf: true
        }
      })
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.menu = false
    }
  }

  private async getUserList() {
    let pager: any = this.pager
    let params = {
      groupId: this.currentNode.data.groupId,
      pageNum: pager.pageNum,
      pageSize: pager.pageSize
    }
    try {
      this.loading.body = true
      let res: any = await getUserList(params)
      this.userList = res.iamUsers.map((iamUser: any) => {
        return {
          iamUserId: iamUser.iamUserId,
          iamUserName: iamUser.iamUserName,
          policyName: iamUser.policyName,
          createdTime: iamUser.createdTime
        }
      })
      pager.total = res.totalNum
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.body = false
    }
  }

  private async deleteUser(user: any) {
    this.$alertDelete({
      type: '用户',
      msg: `是否确认删除用户"${user.iamUserName}"`,
      method: deleteUser,
      payload: { iamUserId: user.iamUserId },
      onSuccess: () => {
        this.getUserList()
      }
    })
  }

  private showDialog(type: any, node: any) {
    this.isShowDialog = true
    this.dialogData = {
      type: type,
      data: node && node.data
    }
    if (type === 'merge') {
      this.dialogData.groupList = this.groupList[0].children
    }
  }
  private closeAddDialog(data: any) {
    if (data === 'merge') {
      this.currentNode = {
        data: {
          groupName: '通讯录',
          groupId: '-1'
        }
      }
    }
    this.isShowDialog = false
    this.showDailogSign = false
    this.getGroups()
    this.getUserList()
  }
  private createUser() {
    this.$router.push({
      path: `/accessManage/user/create`,
      query: {
        type: 'add',
        groupId: this.currentNode.data.groupId
      }
    })
  }
  private editUser(id: any) {
    this.$router.push({
      path: `/accessManage/user/create`,
      query: {
        type: 'edit',
        userId: id
      }
    })
  }
  private handleSizeChange(val: number) {
    const pager: any = this.pager
    pager.pageSize = val
    pager.pageNum = 1
    this.getUserList()
  }
  private handleCurrentChange(val: number) {
    const pager: any = this.pager
    pager.pageNum = val
    this.getUserList()
  }
}
</script>

<style lang='scss' scoped>
  $borderGrey: #EEEEEE;
  $titleBackground: #F8F8F8;
  ::v-deep {
    .el-card {
      &__body {
        padding: 0;
      }
    }
    .titleBar .el-button {
      &--medium {
        border-radius: 0;
        border: none;
        border-right: 1px solid $borderGrey;
        height: 100%;
      }
      &--default {
        background: $titleBackground;
      }
    }
  }
  .titleBar {
    height: 40px;
    border-bottom: 1px solid $borderGrey;
    display: flex;
    background: $titleBackground;
    &__menu {
      width: 250px;
      border-right: 1px solid $borderGrey;
      overflow: hidden;
      transition: .2s;
      display: flex;
      justify-content: space-between;
      &__tools {
        .el-button {
          border: none;
          margin: 0;
          margin-right: 10px;
          font-size: 20px;
        }
      }
    }
    &__title {
      padding-left: 20px;
      display: flex;
      align-items: center;
    }
  }
  .content {
    height: 85vh;
    min-height: 0;
    display: flex;
    &__menu {
      width: 250px;
      border-right: 1px solid $borderGrey;
      height: 100%;
      flex-shrink: 0;
      overflow: hidden;
      transition: .2s;
      padding: 10px;
      &__item {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;
        &__btns {
          display: none;
          &__icon {
            color: #6E7C89;
          }
        }
        &:hover .content__menu__item__btns {
          display: block;
        }
      }
    }
    &__body {
      overflow: auto;
      width: 100%;
      padding: 20px;
      flex-shrink: 1;
    }
  }
  .collapsed {
    .titleBar__menu {
      width: 50px;
    }
    .content__menu {
      width: 0px;
      padding-left: 0;
      padding-right: 0;
      border-right: 0px
    }
  }
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
