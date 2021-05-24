<template>
  <div class="app-container platform-container">
    <el-card class="platform">
      <div class="platform__header">
        <el-tooltip content="添加上级平台">
          <el-button type="primary" @click="handleCreate"><svg-icon name="plus" /></el-button>
        </el-tooltip>
        <el-input v-model="platformKeyword" class="platform__header--search" placeholder="请输入关键词" clearable>
          <svg-icon slot="append" name="search" />
        </el-input>
      </div>
      <div class="platform__list">
        <ul>
          <li v-for="platform in filteredPlatformList" :key="platform.platformId" :class="{'actived': currentPlatform && (currentPlatform.platformId === platform.platformId)}" @click="selectPlatform(platform)">
            <span><svg-icon name="dot" /> {{ platform.name }}</span>
            <div class="tools">
              <el-tooltip class="item" effect="dark" content="查看平台详情" placement="top" :open-delay="300">
                <el-button type="text" @click.stop="viewPlatform(platform)"><svg-icon name="documentation" /></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="编辑平台" placement="top" :open-delay="300">
                <el-button type="text" @click.stop="editPlatform(platform)"><svg-icon name="edit" /></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="删除平台" placement="top" :open-delay="300">
                <el-button type="text" @click.stop="deletePlatform(platform)"><svg-icon name="trash" /></el-button>
              </el-tooltip>
            </div>
          </li>
        </ul>
      </div>
    </el-card>
    <el-card ref="deviceWrap" class="shared-devices">
      <div class="filter-container">
        <el-button type="primary" @click="addDevices">添加资源</el-button>
        <el-popover
          placement="top-start"
          title="添加资源"
          width="400"
          trigger="hover"
          :open-delay="300"
          :content="tips.addDevices"
        >
          <svg-icon slot="reference" class="filter-container__button-question" name="help" />
        </el-popover>
        <div class="filter-container__right">
          <el-input class="filter-container__search-group" placeholder="请输入关键词" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <div class="device-list" :class="{'device-list--collapsed': !isExpanded, 'device-list--dragging': dirDrag.isDragging}">
        <el-button class="device-list__expand" @click="toggledirList">
          <svg-icon name="hamburger" />
        </el-button>
        <div
          class="device-list__handle"
          :style="`left: ${dirDrag.width}px`"
          @mousedown="changeWidthStart($event)"
        />
        <div ref="dirList" class="device-list__left" :style="`width: ${dirDrag.width}px`">
          <div class="dir-list" :style="`width: ${dirDrag.width}px`">
            <div class="dir-list__tools">
              <el-tooltip class="item" effect="dark" content="刷新目录" placement="top" :open-delay="300">
                <el-button type="text" @click="initDirs"><svg-icon name="refresh" /></el-button>
              </el-tooltip>
            </div>
            <div v-loading="loading.dir" class="dir-list__tree device-list__max-height" :style="{height: `${maxHeight}px`}">
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
          <div class="device-list__max-height" :style="{height: `${maxHeight}px`}">
            <el-table v-loading="loading.sharedDevices" :data="dataList" fit>
              <el-table-column prop="name" label="名称" min-width="160" />
              <el-table-column prop="action" label="操作" width="80" fixed="right">
                <template slot-scope="{row}">
                  <el-button type="text" @click="deleteCertificate(row)">移除</el-button>
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
    <AddDevices v-if="dialog.addDevices" :platform="currentPlatform" @on-close="dialog.addDevices = false" />
    <PlatformDetail v-if="dialog.platformDetail" :platform-id="currentPlatformDetail.platformId" @on-close="dialog.platformDetail = false" />
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Provide } from 'vue-property-decorator'
import { describeShareGroups, describeShareDirs, getPlatforms, deletePlatform, cancleShareDevice } from '@/api/upPlatform'
import AddDevices from './compontents/dialogs/AddDevices.vue'
import PlatformDetail from './compontents/dialogs/PlatformDetail.vue'

@Component({
  name: 'UpPlatformList',
  components: {
    AddDevices,
    PlatformDetail
  }
})
export default class extends Vue {
  private dirList: Array<any> = []
  private platformList: Array<any> = []
  private dataList: any = []
  private breadcrumb: any = []
  private platformKeyword = ''
  private currentPlatform: any = {}
  private currentPlatformDetail = null
  public isExpanded = true
  public maxHeight = 1000
  public dirDrag = {
    isDragging: false,
    start: 0,
    offset: 0,
    orginWidth: 200,
    width: 250
  }
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  public loading = {
    platform: false,
    dir: false,
    sharedDevices: false
  }
  public dialog = {
    addDevices: false,
    platformDetail: false
  }
  public treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }
  public tips = {
    addDevices: '下方列表显示已共享的设备，点击"添加资源"添加想要共享的设备。'
  }

  private get filteredPlatformList() {
    if (!this.platformKeyword) {
      return this.platformList
    } else {
      return this.platformList.filter((platform: any) => {
        return ~platform.name.indexOf(this.platformKeyword)
      })
    }
  }

  private refresh() {
    this.getList()
  }

  private mounted() {
    this.getPlatformList()
    this.getList()
    this.initDirs()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  /**
   * 查询上级平台列表
   */
  private async getPlatformList() {
    try {
      this.loading.platform = true
      const res = await getPlatforms({
        pageNum: 1,
        pageSize: 1000
      })
      this.platformList = res.platforms
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.platform = false
    }
  }

  /**
   * 删除上级平台
   */
  private deletePlatform(platform: any) {
    this.$alertDelete({
      type: '设备',
      msg: `是否确认删除设备"${platform.name}"`,
      method: deletePlatform,
      payload: {
        platformId: platform.platformId
      },
      onSuccess: () => {
        this.getPlatformList()
      }
    })
  }

  /**
   * 编辑上级平台
   */
  private editPlatform(platform: any) {
    this.$router.push({
      path: '/up-platform/gb28121-update',
      query: {
        platformId: platform.platformId
      }
    })
  }

  /**
   * 选择平台
   */
  private selectPlatform(platform: any) {
    this.currentPlatform = platform
    this.initDirs()
  }

  /**
   * 查看平台详情
   */
  private viewPlatform(platform: any) {
    this.dialog.platformDetail = true
    this.currentPlatformDetail = platform
  }

  private async getList() {
    this.loading.sharedDevices = true
    try {
      this.dataList = [
        {
          name: '名称'
        },
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
    this.$router.push('/up-platform/gb28121-create')
  }

  private addDevices() {
    this.dialog.addDevices = true
  }

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList()
  }

  @Provide('initDirs')
  public async initDirs() {
    try {
      this.loading.dir = true
      const res = await describeShareGroups({
        platformId: this.currentPlatform.platformId,
        pageSize: 1000
      })
      this.dirList = []
      res.groups.forEach((group: any) => {
        group.inProtocol === 'gb28181' && (
          this.dirList.push({
            groupId: group.groupId,
            label: group.groupName,
            inProtocol: group.inProtocol,
            gbId: group.gbId
          })
        )
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
      const res = await describeShareDirs({
        groupId: node.data.groupId,
        dirId: node.data.type === 'group' ? 0 : node.data.id,
        inProtocol: node.data.inProtocol,
        platformId: this.currentPlatform.platformId
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

  /**
   * 计算最大高度
   */
  public calMaxHeight() {
    const deviceWrap: any = this.$refs.deviceWrap
    const size = deviceWrap.$el.getBoundingClientRect()
    const top = size.top
    const documentHeight = document.body.offsetHeight
    this.maxHeight = documentHeight - top - 129
    console.log(this.maxHeight)
  }

  /**
   * 收起/展开目录列表
   */
  public toggledirList() {
    this.isExpanded = !this.isExpanded
  }

  /**
   * 设置左侧宽度
   */
  public changeWidthStart(e: MouseEvent) {
    const $dirList: any = this.$refs.dirList
    this.dirDrag.isDragging = true
    this.dirDrag.start = e.x
    this.dirDrag.orginWidth = $dirList.clientWidth

    window.addEventListener('mousemove', (e) => {
      if (!this.dirDrag.isDragging) return
      this.dirDrag.offset = this.dirDrag.start - e.x
      const width = this.dirDrag.orginWidth - this.dirDrag.offset
      if (width < 50) return
      this.dirDrag.width = width
    })
    window.addEventListener('mouseup', () => {
      this.dirDrag.isDragging = false
    })
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
  &__button-question {
    margin-left: 10px;
    color: rgba(0, 0, 0, 0.6);
  }
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
    width: 250px;

    &__header {
      border-bottom: 1px solid $borderGrey;
      padding-bottom: 10px;
      padding: 15px;

      .el-button--primary {
        padding: 10px;
        margin-right: 10px;
      }

      ::v-deep .el-input-group__append {
        padding: 0 10px;
      }

      &--search {
        width: 172px;
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
          border-radius: 4px;
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

          &.actived {
            background: $primary;
            color: #fff;
            .tools {
              background: $primary;
            }
            svg {
              color: #fff;
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
