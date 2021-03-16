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
          <span>region1/region2</span>
        </div>
      </div>
      <div class="content">
        <div class="content__menu">
          <el-tree
            ref="groupTree"
            :props="props"
            :load="loadNode"
            lazy
            node-key="name"
            highlight-current
            :expand-on-click-node="false"
            :default-expanded-keys="['通讯录']"
            current-node-key="通讯录"
            @current-change="currentKeyChange"
          >
            <span
              slot-scope="{node}"
              class="content__menu__item"
            >
              <span>
                <span>{{ node.label }}</span>
              </span>
              <span v-if="node.label !== '通讯录'" class="content__menu__item__btns">
                <el-button type="text" @click="showDialog('edit', node.label)">
                  <i class="el-icon-setting" style="color: #000000" />
                </el-button>
              </span>
            </span>
          </el-tree>
        </div>
        <div class="content__body">
          <div class="head">
            <div class="head__left">
              <el-button type="primary" @click="createUser">创建成员</el-button>
              <el-button :disabled="currentNode.label === '通讯录'" @click="showDialog('edit', currentNode.label)">修改子部门</el-button>
            </div>
            <div class="head__right">
              <el-input v-model="policyNameSearch" placeholder="请输入用户名/账号ID" @keyup.enter.native="1">
                <el-button slot="append" class="el-button-rect" @click="1"><svg-icon name="search" /></el-button>
              </el-input>
              <el-button class="el-button-rect" @click="1"><svg-icon name="refresh" /></el-button>
            </div>
          </div>
          <el-table :data="policyList">
            <el-table-column prop="userName" label="用户名" />
            <el-table-column prop="ID" label="账号ID" />
            <el-table-column prop="policyName" label="策略" />
            <el-table-column prop="operate" label="创建时间" />
            <el-table-column label="操作" width="140">
              <template slot-scope="scope">
                <el-button type="text" @click="policyList.splice(scope.$index, 1)">管理</el-button>
                <el-button style="color: #A5A5A5" type="text" @click="policyList.splice(scope.$index, 1)">删除</el-button>
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
    <CreateUserGroup v-if="showAddGroupDialog" :dialog-data="dialogData" @on-close="closeAddDialog" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import CreateUserGroup from './components/dialogs/CreateUserGroup.vue'
@Component({
  name: 'accessManageUser',
  components: {
    CreateUserGroup
  }
})
export default class extends Vue {
  private showAddGroupDialog: boolean = false
  private isCollapsed: boolean = false
  private props: object = {
    isLeaf: 'leaf',
    label: 'name',
    children: 'zones'
  }
  private currentNode: object = {
    label: '通讯录'
  }
  private policyList: any = [1]
  private policyNameSearch: string = ''
  private pager: object = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private dialogData: object = {
    groupId: '',
    type: ''
  }

  private mounted() {
    this.type = this.$route.meta.type
    const groupTree: any = this.$refs.groupTree
    groupTree.setCurrentKey = '通讯录'
    const currentNode: any = this.currentNode
    currentNode.label = groupTree.getCurrentNode().name
  }

  private loadNode(node: any, resolve: any) {
    if (node.level === 0) {
      return resolve([{ name: '通讯录' }])
    } else if (node.level === 1) {
      setTimeout(() => {
        return resolve([
          { name: '分组1', leaf: true },
          { name: '分组2', leaf: true },
          { name: '分组3', leaf: true },
          { name: '分组4', leaf: true }
        ])
      }, 500)
    }
  }
  private currentKeyChange(data: any, node: any) {
    this.currentNode = node
  }
  private showDialog(type: any, groupId: any) {
    this.dialogData = {
      type,
      groupId
    }
    this.showAddGroupDialog = true
  }
  private closeAddDialog(refresh: boolean) {
    this.showAddGroupDialog = false
    // refresh && this.getData()
  }
  private createUser() {
    this.$router.push(`/accessManage/user/create`)
  }
  private handleSizeChange(val: number) {
    const pager: any = this.pager
    pager.pageSize = val
    this.getList()
  }
  private handleCurrentChange(val: number) {
    const pager: any = this.pager
    pager.pageNum = val
    this.getList()
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
