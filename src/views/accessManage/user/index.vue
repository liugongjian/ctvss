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
          <span>{{ currentGroup.groupName === '通讯录' ? '' : `/${currentGroup.groupName}` }}</span>
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
                  <el-button type="text" @click="showDialog('edit')">
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
              <el-button :disabled="currentGroup.groupName === '通讯录'" @click="showDialog('edit')">修改子部门</el-button>
            </div>
            <div class="head__right">
              <el-input v-model="userSearch" placeholder="请输入用户名/账号ID" @keyup.enter.native="getUserList">
                <el-button slot="append" class="el-button-rect" @click="getUserList"><svg-icon name="search" /></el-button>
              </el-input>
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
                <el-button style="color: #A5A5A5" type="text" @click="deleteUser(scope.row.iamUserId)">删除</el-button>
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
import { nextTick } from 'process'
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
  private currentGroup: object = {
    groupName: '通讯录'
  }
  private userList: any = [1]
  private userSearch: string = ''
  private pager: object = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private dialogData: any = {}
  private groupList: any = [
    { groupName: '通讯录', leaf: false, children: [] }
  ]

  private mounted() {
    this.getGroups()
    this.getUserList()
  }

  private async getGroups() {
    this.loading.menu = true
    await setTimeout(() => {
      this.groupList[0].children = [
        { groupName: '分组1', groupId: 120, leaf: true },
        { groupName: '分组2', groupId: 121, leaf: true },
        { groupName: '分组3', groupId: 122, leaf: true },
        { groupName: '分组4', groupId: 123, leaf: true }
      ]
    }, 500)
    this.loading.menu = false
    // let params = {
    //   parentGroupId: -1
    // }
    // try {
    //   this.loading.menu = true
    //   this.groupList[0].children = await getGroupList(params)
    // } catch (e) {
    //   this.$message.error(e && e.message)
    // } finally {
    //   this.loading.menu = false
    // }
  }

  private async getUserList() {
    let pager: any = this.pager
    let params = {
      groupId: this.userSearch,
      pageNum: pager.pageNum,
      pageSize: pager.pageSize
    }
    // try {
    //   this.loading.body = true
    //   let res: any = await getUserList(params)
    //   this.userList = []
    //   for (let i = 0; i < res.iamUsers.length; i++) {
    //     let obj: object = {
    //       iamUserId: res.iamUsers.iamUserId,
    //       iamUserName: res.iamUsers.iamUserName,
    //       policyName: res.iamUsers.policyName,
    //       createTime: res.iamUsers.createTime
    //     }
    //     this.userList.push(obj)
    //   }
    //   pager.total = res.totalNum
    // } catch (e) {
    //   this.$message.error(e && e.message)
    // } finally {
    //   this.loading.body = false
    // }
  }

  private async deleteUser(id: any) {
    // try {
    //   await deleteUser({ iamUserId: id })
    //   this.$message.success('删除用户成功')
    // } catch (e) {
    //   this.$message.error(e && e.message)
    // }
  }

  private showDialog(type: any, node: any) {
    this.isShowDialog = true
    this.dialogData = {
      type: type,
      data: node.data
    }
    if (type === 'merge') {
      this.dialogData.groupList = this.groupList[0].children
    }
  }
  private closeAddDialog() {
    this.isShowDialog = false
    this.showDailogSign = false
    this.getGroups()
  }
  private createUser() {
    let currentGroup: any = this.currentGroup
    this.$router.push({
      path: `/accessManage/user/create`,
      query: {
        type: 'add',
        groupId: currentGroup.groupId
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
