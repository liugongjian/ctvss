<template>
  <div class="app-container platform-container">
    <el-card class="platform">
      <div class="platform__header">
        <el-tooltip content="添加上级平台">
          <el-button type="primary" @click="handleCreate"><svg-icon name="plus" /></el-button>
        </el-tooltip>
        <el-input class="platform__header--search" placeholder="请输入关键词" @keyup.enter.native="handleFilter">
          <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
        </el-input>
      </div>
      <div class="platform__list">
        <ul>
          <li>
            <span><svg-icon name="dot" /> 测试平台名称长的名称长的名称长的名称</span>
            <div class="tools">
              <el-tooltip class="item" effect="dark" content="编辑平台" placement="top" :open-delay="300">
                <el-button type="text" @click.stop=""><svg-icon name="edit" /></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="删除平台" placement="top" :open-delay="300">
                <el-button type="text" @click.stop=""><svg-icon name="trash" /></el-button>
              </el-tooltip>
            </div>
          </li>
          <li>
            <span><svg-icon name="dot" /> 测试平台名称长的名称长的名称长的名称</span>
            <div class="tools">
              <el-tooltip class="item" effect="dark" content="编辑平台" placement="top" :open-delay="300">
                <el-button type="text" @click.stop=""><svg-icon name="edit" /></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="删除平台" placement="top" :open-delay="300">
                <el-button type="text" @click.stop=""><svg-icon name="trash" /></el-button>
              </el-tooltip>
            </div>
          </li>
          <li>
            <span><svg-icon name="dot" /> 测试平台</span>
            <div class="tools">
              <el-tooltip class="item" effect="dark" content="编辑平台" placement="top" :open-delay="300">
                <el-button type="text" @click.stop=""><svg-icon name="edit" /></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="删除平台" placement="top" :open-delay="300">
                <el-button type="text" @click.stop=""><svg-icon name="trash" /></el-button>
              </el-tooltip>
            </div>
          </li>
        </ul>
      </div>
    </el-card>
    <el-card class="shared-devices">
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">添加资源</el-button>
        <div class="filter-container__right">
          <el-input class="filter-container__search-group" placeholder="请输入关键词" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <div class="device-list">
        <div class="device-list__left">
          <div class="dir-list">
            <div v-loading="loading.dir" class="dir-list__tree device-list__max-height">
              <el-tree
                ref="dirTree"
                empty-text="暂无目录或设备"
                :data="dirList"
                node-key="id"
                highlight-current
                lazy
                :load="loadDirs"
                :props="treeProp"
              >
                <span
                  slot-scope="{node, data}"
                  class="custom-tree-node"
                >
                  <span class="node-name">
                    <svg-icon v-if="data.type !== 'dir'" :name="data.type" width="15" height="15" />
                    <span v-else class="node-dir">
                      <svg-icon name="dir" width="15" height="15" />
                      <svg-icon name="dir-close" width="15" height="15" />
                    </span>
                    {{ node.label }}
                  </span>
                </span>
              </el-tree>
            </div>
          </div>
        </div>
        <div class="device-list__right">
          <div class="breadcrumb">
            <span class="breadcrumb__item" @click="gotoRoot">根目录</span>
            <span
              v-for="item in breadcrumb"
              :key="item.id"
              class="breadcrumb__item"
            >
              {{ item.label }}
            </span>
          </div>
          <div class="device-list__max-height">
            <el-table v-loading="loading.sharedDevices" :data="dataList" fit>
              <el-table-column prop="name" label="名称" min-width="160" />
              <el-table-column prop="action" label="操作" width="220" fixed="right">
                <template slot-scope="{row}">
                  <el-button type="text" @click="edit(row)">编辑</el-button>
                  <el-button type="text" @click="edit(row)">选择通道</el-button>
                  <el-button type="text" @click="edit(row)">启用</el-button>
                  <el-button type="text" @click="deleteCertificate(row)">删除</el-button>
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
      </div>
    </el-card>
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { Platform } from '@/type/platform'
import { getDeviceTree } from '@/api/device'
import { getGroups } from '@/api/group'

@Component({
  name: 'UpPlatformList'
})
export default class extends Vue {
  private dirList: Array<any> = []
  private dataList: any = []
  private breadcrumb: any = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  public loading = {
    dir: false,
    sharedDevices: false
  }

  public treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  private refresh() {
    this.getList()
  }

  private mounted() {
    this.getList()
    this.initDirs()
  }

  private async getList() {
    this.loading.sharedDevices = true
    try {
      this.dataList = [
        {
          name: '名称'
        }
      ]
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.sharedDevices = false
    }
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getList()
  }

  private handleCreate() {
    this.$router.push('up-platform/create')
  }

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList()
  }

  public async initDirs() {
    try {
      this.loading.dir = true
      const res = await getGroups({
        pageSize: 1000
      })
      this.dirList = res.groups.map((group: any) => {
        return {
          id: group.groupId,
          label: group.groupName,
          type: 'dir' // TODO: 改成group
        }
      })
      this.$nextTick(() => {
        // this.initTreeStatus()
      })
    } catch (e) {
      this.dirList = []
      console.log(e)
    } finally {
      this.loading.dir = false
    }
  }

  /**
   * 加载目录
   */
  public async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) return resolve([])
    try {
      const res = await getDeviceTree({
        groupId: this.currentGroupId,
        id: node.data.id,
        type: node.data.type
      })
      resolve(res.dirs)
    } catch (e) {
      resolve([])
    }
  }

  /**
   * 返回根目录
   */
  private async gotoRoot() {
    // const dirTree: any = this.$refs.dirTree
    // dirTree.setCurrentKey(null)
    // await DeviceModule.ResetBreadcrumb()
    // this.deviceRouter({
    //   id: '0',
    //   type: 'dir'
    // })
  }

  // private edit(row: GB28181) {
  //   this.$router.push({
  //     name: 'gb28181-update',
  //     params: {
  //       userName: row.userName
  //     }
  //   })
  // }

  // private async deleteCertificate(row: GB28181) {
  //   this.$alertDelete({
  //     type: 'GB28181凭证',
  //     msg: `是否确认删除GB28181凭证"${row.userName}"`,
  //     method: deleteCertificate,
  //     payload: { userName: row.userName },
  //     onSuccess: this.getList
  //   })
  // }
}
</script>

<style lang="scss" scoped>
.filter-container {
  &__search-group {
    margin-right: 10px;
  }
  &__select {
    display: inline;
    margin-right: 10px;
  }
}

.platform-container {
  display: flex;

  ::v-deep .el-card__body {
    padding: 0;
  }

  .platform {
    margin-right: 10px;
    width: 280px;

    &__header {
      border-bottom: 1px solid $borderGrey;
      padding-bottom: 10px;
      padding: 15px;

      .el-button--primary {
        padding: 10px;
        margin-right: 10px;
      }

      &--search {
        width: 202px;
      }
    }

    &__list {
      ul {
        margin: 0;
        padding: 15px;
        li {
          position: relative;
          list-style: none;
          height: 30px;
          line-height: 30px;
          cursor: pointer;
          span {
            display: block;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            word-break: break-all;
          }

          svg {
            color: $darkGray;
          }

          .tools {
            position: absolute;
            display: none;
            right: 0;
            top: 0;
            background: $treeHover;
            .el-button {
              padding: 5px;
            }
            .el-button+.el-button {
              margin-left: 0px;
            }
          }

          &:hover {
            background: $treeHover;
            .tools {
              display: block;
            }
          }
        }
      }
    }
  }

  .shared-devices {
    flex: 1;

    .filter-container {
      padding: 15px;
      margin: 0;
      border-bottom: 1px solid $borderGrey;
    }

    .device-list__max-height {
      padding: 15px;
    }
  }
}
</style>
