<template>
  <div class="app-container">
    <el-card :class="{'collapsed': isCollapsed, 'dragging': handleDrag.isDragging}">
      <div
        class="handle"
        :style="`left: ${handleDrag.width}px`"
        @mousedown="changeHandle($event)"
      />
      <div class="titleBar">
        <div ref="menu" class="titleBar__menu" :style="`width: ${handleDrag.width}px`">
          <el-button @click="isCollapsed = !isCollapsed">
            <svg-icon name="hamburger" />
          </el-button>
          <div class="titleBar__menu__tools">
            <el-tooltip effect="dark" content="刷新" placement="top" :open-delay="300">
              <el-button type="text" @click="initGroupTree"><svg-icon name="refresh" class="titleBar__menu__tools__icon" /></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="创建子部门" placement="top" :open-delay="300">
              <el-button type="text" @click="showDialog('add', currentNode)"><svg-icon name="plus" class="titleBar__menu__tools__icon" /></el-button>
            </el-tooltip>
          </div>
        </div>
        <div class="titleBar__title">
          <span>通讯录</span>
          <span>{{ currentNode.data.groupName === '通讯录' ? '' : `/${currentNode.data.groupName}` }}</span>
        </div>
      </div>
      <div class="content">
        <el-main v-loading="loading.menu" class="content__menu" :style="`width: ${handleDrag.width}px`">
          <el-tree
            ref="groupTree"
            :data="groupList"
            :props="props"
            node-key="groupId"
            highlight-current
            :expand-on-click-node="false"
            :default-expanded-keys="['']"
            current-node-key=""
            lazy
            :load="loadDirs"
            @current-change="setCurrentNode"
          >
            <span
              slot-scope="{node}"
              class="content__menu__item"
            >
              <span>{{ node.label }}</span>
              <span v-if="node.label !== '通讯录'" class="content__menu__item__btns">
                <el-tooltip effect="dark" content="添加子部门" placement="top" :open-delay="300">
                  <el-button type="text" @click="showDialog('add', node)">
                    <svg-icon name="plus" class="content__menu__item__btns__icon" />
                  </el-button>
                </el-tooltip>
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
  private handleDrag = {
    isDragging: false,
    start: 0,
    offset: 0,
    orginWidth: 200,
    width: 250
  }
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
      groupId: ''
    }
  }

  private mounted() {
    this.getUserList()
  }

  private changeHandle(e: any) {
    const $menu: any = this.$refs.menu
    this.handleDrag.isDragging = true
    this.handleDrag.start = e.x
    this.handleDrag.orginWidth = $menu.clientWidth

    window.addEventListener('mousemove', (e) => {
      if (!this.handleDrag.isDragging) return
      this.handleDrag.offset = this.handleDrag.start - e.x
      const width = this.handleDrag.orginWidth - this.handleDrag.offset
      if (width < 50) return
      this.handleDrag.width = width
    })
    window.addEventListener('mouseup', () => {
      this.handleDrag.isDragging = false
    })
  }

  private setCurrentNode(data: any, node: any) {
    this.currentNode = node
    this.getUserList()
  }

  private async initGroupTree() {
    let groupTree: any = this.$refs.groupTree
    try {
      this.loading.menu = true
      let res = await getGroupList({})
      groupTree.updateKeyChildren('', res.groups.map((group: any) => {
        return {
          groupName: group.groupName,
          groupId: group.groupId
        }
      }))
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.menu = false
    }
  }

  private async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) {
      return resolve([
        { groupName: '通讯录', groupId: '', leaf: false, children: [] }
      ])
    }
    try {
      const res = await getGroupList({
        parentGroupId: node.data.groupId
      })
      let dirs: any = res.groups.map((group: any) => {
        return {
          groupName: group.groupName,
          groupId: group.groupId
        }
      })
      resolve(dirs)
    } catch (e) {
      console.log(e)
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
    if (data) {
      this.initGroupTree()
      this.getUserList()
    }
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
        position: relative;
      }
    }
    .titleBar .el-button {
      &--medium {
        border-radius: 0;
        border: none;
        height: 100%;
      }
      &--default {
        background: $titleBackground;
      }
    }
    .el-tree {
      .el-tree-node {
        &__content {
          overflow: hidden;
        }
      }
    }
  }
  .handle {
    height: 100%;
    position: absolute;
    width: 8px;
    border-right: 1px solid $borderGrey;
    cursor: ew-resize;
    &:hover {
      border-right-color: #ccc;
    }
  }
  .titleBar {
    height: 40px;
    border-bottom: 1px solid $borderGrey;
    display: flex;
    background: $titleBackground;
    &__menu {
      width: 250px;
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
        &__icon {
          width: 16px !important;
          height: 16px !important;
          color: #000000;
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
      overflow-x: auto;
      width: 250px;
      height: 100%;
      flex-shrink: 0;
      transition: .2s;
      padding: 10px;
      &__item {
        flex: 1;
        position: relative;
        overflow: hidden;
        font-size: 14px;
        padding-right: 8px;
        &__btns {
          background: #F5F7FA;
          position: absolute;
          right: 5px;
          top: -10px;
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
    .handle {
      display: none;
    }
    .titleBar__menu {
      width: 50px !important;
    }
    .content__menu {
      width: 0px !important;
      padding-left: 0;
      padding-right: 0;
      border-right: 0px
    }
  }
  .dragging {
    cursor: ew-resize;

    .titleBar__menu, .content__menu {
      transition: none;
    }
    * {
      user-select:none;
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
