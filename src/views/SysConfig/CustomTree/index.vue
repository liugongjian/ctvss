<template>
  <div class="app-container platform-container">
    <el-card class="platform">
      <div class="platform__header">
        <span>设备树列表</span>
        <el-tooltip content="添加上级平台">
          <el-button type="primary" @click="handleCreate"><span>添加</span></el-button>
        </el-tooltip>
      </div>
      <div v-loading="loading.platform" class="platform__list">
        <ul>
          <li v-for="tree in treeList" :key="tree.platformId" :class="{'actived': currentTree && (currentTree.platformId === tree.platformId)}" @click="selectTree(tree)">
            <span><status-badge :status="tree.status" /> {{ tree.name }}</span>
            <div class="tools">
              <el-tooltip class="item" effect="dark" content="删除平台" placement="top" :open-delay="300">
                <el-button type="text" @click.stop="deleteTree(tree)"><svg-icon name="trash" /></el-button>
              </el-tooltip>
            </div>
          </li>
        </ul>
        <div v-if="treeList && !treeList.length && !loading.platform" class="empty-text">请创建向上级联平台</div>
      </div>
    </el-card>
    <el-card ref="deviceWrap" class="shared-devices">
      <div class="tree-wraper">
        <div class="tree">
          <el-tree
            key="device-el-tree-original"
            ref="dirTree"
            empty-text="暂无目录或设备"
            :data="dirList"
            node-key="id"
            highlight-current
            lazy
            :load="loadDirs"
            :props="treeProp"
            :current-node-key="defaultKey"
            @node-click="deviceRouter"
          >
            <span
              slot-scope="{node, data}"
              class="custom-tree-node"
              :class="{'online': data.deviceStatus === 'on'}"
            >
              <span class="node-name">
                <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                <span v-else class="node-dir">
                  <svg-icon name="dir" width="15" height="15" />
                  <svg-icon name="dir-close" width="15" height="15" />
                </span>
                <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
                <additional-status v-if="data.type === 'ipc'" :record-status="data.recordStatus" :alarm-info="data.alarmInfo" />
                {{ node.label }}
                <span class="sum-icon">{{ getSums(data) }}</span>
                <span class="alert-type">{{ renderAlertType(data) }}</span>
              </span>
            </span>
          </el-tree>
        </div>
        <div class="tree">tree2</div>
      </div>
    </el-card>
    <Dialogue
      v-if="dialog.visible"
      :title="dialog.title"
      @dialogSubmit="dialogSubmit"
      @dialogCancel="dialogCancel"
    >
      <el-form v-if="dialog.type === 'create'" :model="dialog.data">
        <el-form-item label="名称" prop="name" :rules="dialog.data.rule">
          <el-input v-model="dialog.data.name" autocomplete="off" />
        </el-form-item>
      </el-form>
    </Dialogue>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Provide } from 'vue-property-decorator'
import { describeShareDirs, deletePlatform, getPlatforms } from '@/api/upPlatform'
import StatusBadge from '@/components/StatusBadge/index.vue'
import Dialogue from './component/dialogue.vue'

@Component({
  name: 'UpPlatformList',
  components: {
    StatusBadge,
    Dialogue
  }
})
export default class extends Vue {
  private dialog = {
    type: '', // 处理的是哪个操作
    visible: false,
    title: '',
    data: {}
  }

  private treeList: Array<any> = []
  private currentTree: any = {}
  public maxHeight = null
  private tableMaxHeight = null

  public loading = {
    platform: false,
    dir: false,
    sharedDevices: false,
    startStop: false
  }

  private async mounted() {
    await this.getTreeList()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  /**
   * 查询上级平台列表
   */
  private async getTreeList() {
    try {
      this.loading.platform = true
      const res = await getPlatforms({
        pageNum: 1,
        pageSize: 1000
      })
      this.treeList = res.platforms
      if (this.currentTree.platformId) {
        const currentTree = this.platformList.find((tree: any) => tree.platformId === this.currentTree.platformId)
        this.currentTree = currentTree
      } else {
        this.initPlatform()
      }
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.platform = false
    }
  }

  /**
   * 初始化上级平台
   */
  private initPlatform() {
    if (this.treeList.length !== 0) {
      this.selectTree(this.treeList[0])
    }
  }

  /**
   * 删除上级平台
   */
  private deleteTree(tree: any) {
    this.$alertDelete({
      type: '设备',
      msg: `是否确认删除"${tree.name}"`,
      method: deletePlatform,
      payload: {
        platformId: tree.platformId
      },
      onSuccess: async() => {
        if (tree.platformId === this.currentTree.platformId) {
          this.currentTree = {}
        }
        await this.getTreeList()
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
  private selectTree(tree: any) {
    this.currentTree = tree
    this.initDirs()
  }

  private handleCreate() {
    this.dialog = {
      type: 'create',
      visible: true,
      title: '新建设备树',
      data: {
        name: '',
        rule: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  }

  @Provide('initDirs')
  public async initDirs() {

  }

  /**
   * 加载目录
   */
  public async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) return resolve([])
    try {
      const res = await describeShareDirs({
        // groupId: node.data.groupId,
        // dirId: node.data.type === 'group' ? 0 : node.data.dirId,
        // inProtocol: node.data.inProtocol,
        // platformId: this.currentPlatform.platformId
        dirId: node.data.dirId,
        inProtocol: node.data.inProtocol,
        platformId: this.currentPlatform.platformId,
        pageSize: 1000
      })

      const dirs = res.dirs.map((dir: any) => {
        return {
          ...dir,
          groupId: node.data.groupId,
          inProtocol: node.data.inProtocol,
          platformId: this.currentTree.platformId,
          type: 'dir',
          label: dir.dirName,
          id: dir.dirId
        }
      })
      resolve(dirs)
    } catch (e) {
      resolve([])
    }
  }

  /**
   * 计算最大高度
   */
  public calMaxHeight() {
    const deviceWrap: any = this.$refs.deviceWrap
    const size = deviceWrap.$el.getBoundingClientRect()
    const top = size.top
    const documentHeight = document.body.offsetHeight
    this.maxHeight = documentHeight - top - 90
    this.tableMaxHeight = this.maxHeight - 160
  }

  private dialogSubmit() {
    this.dialogCancel()
  }

  private dialogCancel() {
    this.dialog.visible = false
  }
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

  .platform-status {
    margin: 10px 10px 0 0;
  }
}

.platform-container {
  display: flex;

  ::v-deep .el-card__body {
    padding: 0;
    height: 100%;
  }

  .platform {
    margin-right: 10px;
    min-width: 260px;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid $borderGrey;
      padding: 15px;

      .el-button--primary {
        padding: 10px;
        margin-right: 10px;
      }

    }

    &__list {
      padding: 15px;
      min-height: 100px;

      ul {
        margin: 0;
        padding: 0;

        li {
          position: relative;
          list-style: none;
          height: 30px;
          line-height: 30px;
          cursor: pointer;
          border-radius: 4px;
          padding-left: 10px;

          span {
            display: block;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            word-break: break-all;
          }

          .status-badge {
            width: 5px;
            height: 5px;
          }

          svg {
            color: $darkGray;
            vertical-align: middle;
            margin-left: 3px;
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

            .el-button + .el-button {
              margin-left: 0;
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

  .device-list__tools {
    text-align: right;
    margin-bottom: 10px;
    position: relative;

    .cancle-btn {
      float: left;
    }
  }

  .shared-devices {
    flex: 1;
    .tree-wraper{
      height: 100%;
      display: flex;
      .tree{
        flex: 1;
      }
    }
  }
}

.el-form{
  .el-input {
        width: 80%;
    }
  .el-form-item__error{
    left: 64px;
  }
}

</style>
