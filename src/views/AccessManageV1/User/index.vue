<template>
  <div ref="container" class="app-container">
    <el-card :class="{ 'collapsed': isCollapsed, 'dragging': handleDrag.isDragging }">
      <div class="handle" :style="`left: ${handleDrag.width}px`" @mousedown="changeHandle($event)" />
      <div class="titleBar">
        <div ref="menu" class="titleBar__menu" :style="`width: ${handleDrag.width}px`">
          <el-button @click="isCollapsed = !isCollapsed">
            <svg-icon name="hamburger" />
          </el-button>
          <div class="titleBar__menu__tools">
            <el-tooltip effect="dark" content="刷新" placement="top" :open-delay="300">
              <el-button type="text" @click="initGroupTree">
                <svg-icon name="refresh" class="titleBar__menu__tools__icon" />
              </el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="创建子部门" placement="top" :open-delay="300">
              <el-button type="text" @click="showDialog('add', currentNode)">
                <svg-icon name="plus" class="titleBar__menu__tools__icon" />
              </el-button>
            </el-tooltip>
          </div>
        </div>
        <div class="titleBar__title">
          <span>{{ nodePath }}</span>
        </div>
      </div>
      <div class="user-content" :style="`height: ${maxHeight}px`">
        <el-main v-loading="loading.menu" class="user-content__menu" :style="`width: ${handleDrag.width}px`">
          <el-tree
            ref="groupTree" :props="props" node-key="groupId" highlight-current :expand-on-click-node="false" :default-expanded-keys="['-1']" current-node-key="-1" lazy :load="loadGroups"
            @current-change="setCurrentNode"
          >
            <span slot-scope="{ node }" class="user-content__menu__item">
              <span>{{ node.label }}</span>
              <span v-if="node.label !== '通讯录'" class="user-content__menu__item__btns">
                <el-tooltip effect="dark" content="添加部门" placement="top" :open-delay="300">
                  <el-button type="text" @click.prevent="showDialog('add', node)">
                    <svg-icon name="plus" class="user-content__menu__item__btns__icon" />
                  </el-button>
                </el-tooltip>
                <el-tooltip effect="dark" content="修改部门" placement="top" :open-delay="300">
                  <el-button type="text" @click.prevent="showDialog('edit', node)">
                    <svg-icon name="edit" class="user-content__menu__item__btns__icon" />
                  </el-button>
                </el-tooltip>
                <el-tooltip effect="dark" content="合并部门" placement="top" :open-delay="300">
                  <el-button type="text" @click.prevent="showDialog('merge', node)">
                    <svg-icon name="combine" class="user-content__menu__item__btns__icon" />
                  </el-button>
                </el-tooltip>
              </span>
            </span>
          </el-tree>
        </el-main>
        <div class="user-content__body">
          <div class="head">
            <div class="head__left">
              <el-button type="primary" @click="createUser">创建成员</el-button>
              <el-button :disabled="currentNode.data.groupName === '通讯录'" @click="showDialog('edit', currentNode)">修改部门</el-button>
            </div>
            <div class="head__right">
              <!-- <el-input v-model="userSearch" placeholder="请输入用户名/账号ID" @keyup.enter.native="getUserList">
                <el-button slot="append" class="el-button-rect" @click="getUserList"><svg-icon name="search" /></el-button>
              </el-input> -->
              <el-button class="el-button-rect" @click="getUserList">
                <svg-icon name="refresh" />
              </el-button>
            </div>
          </div>
          <el-table v-loading="loading.body" :data="userList" :height="tableMaxHeight">
            <el-table-column prop="iamUserName" label="用户名" width="160">
              <template slot-scope="{ row }">
                <span class="click__user" @click="getDetail(row)">{{ row.iamUserName || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="iamUserId" label="账号ID" width="220" />
            <el-table-column prop="policies" label="策略名" width="250">
              <template slot-scope="{ row }">
                <span>{{ row.policies || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="关联信息" width="140" align="center">
              <template slot-scope="{ row }">
                <template v-if="row.phone">
                  <el-tooltip effect="dark" placement="top">
                    <div slot="content">
                      <span>{{ formatToolTip(row) }}</span>
                      <span
                        v-if="row.phoneVerified === 0 || row.phoneVerified === 2"
                        :class="['resend-button', row.secondCnt > 0 ? 'disabled' : '']"
                        @click="verifyPhone(row)"
                      >
                        {{ `重新发送验证${row.secondCnt > 0 ? '(' + row.secondCnt + ')': ''}` }}
                      </span>
                    </div>
                    <svg-icon v-if="row.phoneVerified === 0" name="mobile-unknown"></svg-icon>
                    <svg-icon v-else-if="row.phoneVerified === 1" name="mobile-success" style="color: #52c41a;"></svg-icon>
                    <svg-icon v-else-if="row.phoneVerified === 2" name="mobile-fail" style="color: #f5212d;"></svg-icon>
                  </el-tooltip>
                </template>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="createdTime" label="创建时间" width="200" />
            <el-table-column label="操作" fixed="right" width="480">
              <template slot-scope="scope">
                <el-button type="text" @click="getPermission(scope.row)">查看权限</el-button>
                <el-button type="text" @click="getUserBind(scope.row)">查看绑定关系</el-button>
                <el-button type="text" @click="getDetail(scope.row)">详情</el-button>
                <el-button type="text" @click="editUser(scope.row)">编辑</el-button>
                <el-button type="text" @click="copyLink(scope.row)">复制登录链接</el-button>
                <el-button type="text" @click="resetSubPwd(scope.row)">重置密码</el-button>
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
    <PreviewPermission v-if="showPreviewPermission" :dialog-data="previewDialogData" @on-close="closePreviewDialog" />
    <UserViewBind v-if="showUserViewBind" :dialog-data="userViewBindData" @on-close="closeUserViewBind" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import UserGroupDialog from './components/dialogs/userGroupDialog.vue'
import { getGroupList, getUserList, deleteUser, verifyPhone } from '@/api/accessManage'
import { changeIAMPassword } from '@/api/users'
import { encrypt } from '@/utils/encrypt'
import copy from 'copy-to-clipboard'
import * as loginService from '@/services/loginService'
import PreviewPermission from './components/dialogs/PreviewPermission.vue'
import UserViewBind from './components/dialogs/UserViewBind.vue'
import { generateTimer } from '@/utils/index'

@Component({
  name: 'AccessManageUser',
  components: {
    UserGroupDialog,
    PreviewPermission,
    UserViewBind
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
  private showPreviewPermission = false
  private showUserViewBind = false
  private previewDialogData = {}
  private userViewBindData = {}
  private nodePath = '通讯录'
  private nodeKeyPath: any = '-1'
  private isShowDialog = false
  private isCollapsed = false
  private props: object = {
    label: 'groupName',
    children: 'children'
  }
  private userList: any = []
  private userSearch = ''
  private pager: any = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private dialogData: any = {}
  private currentNode: any = {
    data: {
      groupName: '通讯录',
      groupId: '-1'
    }
  }
  private subUserLoginLink = ''
  private maxHeight = null
  private tableMaxHeight = null

  @Watch('userList.length')
  private onUserListChange(data: any) {
    data === 0 &&
      this.pager.pageNum > 1 &&
      this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private getPermission(row) {
    this.previewDialogData = {
      dialogType: 'get',
      dialogTitle: '查看权限',
      iamUserId: row.iamUserId
    }
    this.showPreviewPermission = true
  }

  private getUserBind(row) {
    this.userViewBindData = {
      parentGroupId: this.currentNode.data.groupId,
      iamUserId: row.iamUserId
    }
    this.showUserViewBind = true
  }

  private closePreviewDialog() {
    this.showPreviewPermission = false
  }

  private closeUserViewBind() {
    this.showUserViewBind = false
  }

  private mounted() {
    this.$route.params.nodeKeyPath &&
      (this.nodeKeyPath = this.$route.params.nodeKeyPath)
    this.initGroupTree('')
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  /**
   * 格式化手机号
   */
  private formatToolTip(row: any) {
    const phoneStr = row.phone.slice(0, 3) + '*****' + row.phone.slice(-3)
    const tipMap = {
      '0': '，该消息通道未验证',
      '1': '，已验证该消息通道',
      '2': '，短信发送失败，请确认信息是否填写正确'
    }
    const tipStr = tipMap[row.phoneVerified]
    return phoneStr + tipStr
  }

  private async verifyPhone(row: any) {
    if (row.secondCnt <= 0) {
      try {
        await verifyPhone({
          iamUserId: row.iamUserId
        })
        this.$message.success('验证短信发送成功!')
        generateTimer(row, 60)
      } catch (err) {
        this.$message.error(err && err.message)
        if (err && err.code === 3) {
          const regResult = (err.message || '').match(/等待(\d+)/)
          const secondCnt = regResult && regResult[1]
          if (secondCnt > 0) {
            generateTimer(row, secondCnt)
          }
        }
      }
    }
  }

  /**
   * 计算最大高度
   */
  public calMaxHeight() {
    const container: any = this.$refs.container
    const size = container.getBoundingClientRect()
    const top = size.top
    const documentHeight = document.body.offsetHeight
    this.maxHeight = documentHeight - top - 90
    this.tableMaxHeight = this.maxHeight - 135
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
    this.nodePath = ''
    this.nodeKeyPath = ''
    this.getNodePath(node).forEach((nodeObj: any) => {
      this.nodePath +=
        nodeObj.groupId === '-1'
          ? `${nodeObj.groupName}`
          : ` / ${nodeObj.groupName}`
      this.nodeKeyPath +=
        nodeObj.groupId === '-1' ? `${nodeObj.groupId}` : `/${nodeObj.groupId}`
    })
    this.$route.params.nodeKeyPath = this.nodeKeyPath
    this.pager.pageNum = 1
    this.getUserList()
  }

  private getNodePath(node: any) {
    const curentNodePath: any = []
    this.findParentNode(node, curentNodePath)
    return curentNodePath
  }

  private findParentNode(node: any, curentNodePath: any) {
    if (node.parent !== null) {
      curentNodePath.unshift({
        groupName: node.data.groupName,
        groupId: node.data.groupId
      })
      this.findParentNode(node.parent, curentNodePath)
    }
  }

  private async initGroupTree(type: any) {
    const groupTree: any = this.$refs.groupTree
    try {
      this.loading.menu = true
      const nodeKeyPathArr: any = this.nodeKeyPath.split('/')
      for (let i = 0; i < nodeKeyPathArr.length; i++) {
        const node: any = groupTree.getNode(nodeKeyPathArr[i])
        if (!node) break
        this.currentNode = node
        if (i !== nodeKeyPathArr.length - 1 || type === 'add') {
          await this.loadChildrenNodes(nodeKeyPathArr[i])
          node.expanded = true
        }
      }
      groupTree.setCurrentKey(this.currentNode.data.groupId)
      this.setCurrentNode(this.currentNode.data, this.currentNode)
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.menu = false
    }
  }

  private async loadChildrenNodes(key: string) {
    try {
      const groupTree: any = this.$refs.groupTree
      const data = await getGroupList({
        parentGroupId: key
      })
      groupTree.updateKeyChildren(
        key,
        data.groups.map((group: any) => {
          return {
            groupName: group.groupName,
            groupId: group.groupId
          }
        })
      )
    } catch (e) {
      console.log(e)
    }
  }

  private async loadGroups(node: any, resolve: Function) {
    if (node.level === 0) {
      return resolve([{ groupName: '通讯录', groupId: '-1', children: [] }])
    }
    try {
      const res = await getGroupList({
        parentGroupId: node.data.groupId
      })
      const dirs: any = res.groups.map((group: any) => {
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
    const pager: any = this.pager
    const params = {
      groupId: this.currentNode.data.groupId,
      pageNum: pager.pageNum,
      pageSize: pager.pageSize
    }
    try {
      this.loading.body = true
      const res: any = await getUserList(params)
      this.userList = res.iamUsers.map((iamUser: any) => {
        return {
          iamUserId: iamUser.iamUserId,
          iamUserName: iamUser.iamUserName,
          policies: iamUser.policies.map(policy => policy.policyName).join('|'),
          phone: iamUser.phone,
          phoneVerified: iamUser.phoneVerified,
          createdTime: iamUser.createdTime,
          secondCnt: 0
        }
      })
      pager.total = res.totalNum
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.body = false
    }
  }

  private getSubuserLoginLink(userName: any) {
    const origin = window.location.origin
    const mainUserID = this.$store.state.user.mainUserID
    const link = `${origin}${loginService.innerUrl.prefix}${loginService.innerUrl.sub}?subUserName=${userName}&mainUserID=${mainUserID}`
    this.subUserLoginLink = link
  }

  private copyLink(row: any) {
    this.getSubuserLoginLink(row.iamUserName)
    copy(this.subUserLoginLink)
    this.$message.success('复制成功')
  }

  private resetSubPwd(row: any) {
    this.$prompt('请输入新密码', '重置子账号密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[.@$!%*#_~?&^])[A-Za-z0-9.@$!%*#_~?&^]{8,20}$/,
      inputErrorMessage:
        '密码长度为8-20位，必须同时包含大写字母、小写字母、数字、特殊字符',
      inputPlaceholder: '8-20位，必须同时包含大小写字母、数字、特殊字符',
      closeOnClickModal: false,
      beforeClose: async(action, instance, done) => {
        if (action === 'confirm') {
          try {
            await changeIAMPassword({
              newPassword: encrypt(instance.inputValue),
              subUserName: encrypt(row.iamUserName),
              version: '2.0'
            })
            this.$message.success(`重置子账号 ${row.iamUserName} 密码成功！`)
            done()
          } catch (err) {
            this.$message.error(
              `重置子账号 ${row.iamUserName} 密码失败，原因：${
                err && err.message
              }！`
            )
          }
        } else {
          done()
        }
      }
    }).catch((err) => {
      console.log('err: ', err)
    })
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
  }

  private closeAddDialog(data: any) {
    this.isShowDialog = false
    if (data) {
      this.initGroupTree(data.type)
      this.getUserList()
    }
  }
  private createUser() {
    this.$router.push({
      name: 'AccessManageUserCreate',
      query: {
        type: 'add',
        groupId: this.currentNode.data.groupId,
        nodeKeyPath: this.nodeKeyPath
      }
    })
  }
  private editUser(row: any) {
    this.getSubuserLoginLink(row.iamUserName)
    this.$router.push({
      name: 'AccessManageUserCreate',
      query: {
        type: 'edit',
        userId: row.iamUserId,
        groupId: this.currentNode.data.groupId,
        subUserLoginLink: this.subUserLoginLink,
        nodeKeyPath: this.nodeKeyPath
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
  private getDetail(user: any) {
    this.getSubuserLoginLink(user.iamUserName)
    // 传递参数去获取用户详情数据
    this.$router.push({
      name: 'AccessManageUserDetail',
      query: {
        type: 'edit',
        userId: user.iamUserId,
        groupId: this.currentNode.data.groupId,
        subUserLoginLink: this.subUserLoginLink,
        nodeKeyPath: this.nodeKeyPath
      }
    })
  }
}
</script>

<style lang='scss' scoped>
$borderGrey: #eee;
$titleBackground: #f8f8f8;

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
    transition: 0.2s;
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
        color: #000;
      }
    }
  }

  &__title {
    padding-left: 20px;
    display: flex;
    align-items: center;
  }
}

.user-content {
  height: 85vh;
  min-height: 0;
  display: flex;

  &__menu {
    overflow-x: auto;
    width: 250px;
    height: 100%;
    flex-shrink: 0;
    transition: 0.2s;
    padding: 10px;

    &__item {
      flex: 1;
      position: relative;
      overflow: hidden;
      font-size: 14px;
      padding-right: 8px;

      &__btns {
        background: #f5f7fa;
        position: absolute;
        right: 5px;
        top: -10px;
        display: none;

        &__icon {
          color: #6e7c89;
        }
      }

      &:hover .user-content__menu__item__btns {
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

  .user-content__menu {
    width: 0 !important;
    padding-left: 0;
    padding-right: 0;
    border-right: 0;
  }
}

.dragging {
  cursor: ew-resize;

  .titleBar__menu,
  .user-content__menu {
    transition: none;
  }

  * {
    user-select: none;
  }
}

.head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;

  &__right {
    display: flex;

    .el-input {
      margin-right: 10px;
    }
  }
}

:hover .click__user {
  cursor: pointer;
}

.resend-button {
  margin-left: 5px;
  font-size: 12px;
  line-height: 1;
  text-decoration: underline;
  cursor: pointer;
  color: $primary;
}

.resend-button.disabled {
  color: $disabled-color;
  cursor: wait;
}
</style>
