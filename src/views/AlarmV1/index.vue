<template>
  <div v-loading="loading.group" class="app-container">
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div v-if="$route.query.inProtocol !== 'gb28181'" class="warning-info">暂仅支持国标协议的设备告警信息查询</div>
      <div v-show="$route.query.inProtocol === 'gb28181'" class="device-list" :class="{'device-list--collapsed': !isExpanded, 'device-list--dragging': dirDrag.isDragging}" :style="{height: `${maxHeight}px`}">
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
            <div v-loading="loading.dir" class="dir-list__tree device-list__max-height">
              <div class="dir-list__tree--root" :class="{'actived': isRootDir}" @click="gotoRoot"><svg-icon name="component" width="12px" />根目录</div>
              <el-tree
                ref="dirTree"
                empty-text="暂无目录或设备"
                :data="dirList"
                node-key="id"
                highlight-current
                lazy
                :load="loadDirs"
                :props="treeProp"
                :current-node-key="defaultKey"
                @node-click="alarmRouter"
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
                    {{ node.label }} <span class="alert-type">{{ renderAlertType(data) }}</span>
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
              @click="alarmRouter(item)"
            >
              {{ item.label }}
            </span>
          </div>
          <div class="device-list__max-height" :style="{height: `${maxHeight}px`}">
            <router-view :group-id="currentGroupId" :max-height="maxHeight" />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Watch, Mixins } from 'vue-property-decorator'
import IndexMixin from '@/views/device/mixin/indexMixin'
import { DeviceModule } from '@/store/modules/device'
import { deleteDir } from '@/api/dir'
import { renderAlertType } from '@/utils/device'
import { checkPermission } from '@/utils/permission'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'Alarm',
  components: {
    StatusBadge
  }
})
export default class extends Mixins(IndexMixin) {
  private renderAlertType = renderAlertType
  private parentDir = null
  private currentDir = null
  private dialog = {
    createDir: false
  }

  private mounted() {
    // this.getGroupList()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  @Watch('$route.query')
  private onRouterChange() {
    this.$nextTick(() => {
      !this.defaultKey && this.gotoRoot()
    })
  }

  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: string, oldGroupId: string) {
    if (!groupId) return
    this.$nextTick(() => {
      if (oldGroupId || !this.defaultKey) {
        this.gotoRoot()
      }
      this.initDirs()
    })
  }

  /**
   * 删除目录
   */
  private deleteDir(dir: any) {
    this.$alertDelete({
      type: '目录',
      msg: `是否确认删除目录"${dir.label}"`,
      method: deleteDir,
      payload: { dirId: dir.id },
      onSuccess: () => {
        this.initDirs()
        if (dir.id === this.$route.query.dirId) {
          this.gotoRoot()
        }
      }
    })
  }

  /**
   * 打开对话框
   */
  private openDialog(type: string, payload: any) {
    switch (type) {
      case 'createDir':
        if (payload) {
          this.parentDir = payload
        }
        this.dialog.createDir = true
        break
      case 'updateDir':
        if (payload) {
          this.currentDir = payload
        }
        this.dialog.createDir = true
        break
    }
  }

  /**
   * 关闭对话框
   */
  private closeDialog(type: string, payload: any) {
    // @ts-ignore
    this.dialog[type] = false
    switch (type) {
      case 'createDir':
      case 'updateDir':
        this.currentDir = null
        this.parentDir = null
        if (payload) {
          this.initDirs()
        }
    }
  }

  /**
   * 返回根目录
   */
  private async gotoRoot() {
    const dirTree: any = this.$refs.dirTree
    dirTree.setCurrentKey(null)
    await DeviceModule.ResetBreadcrumb()
    this.alarmRouter({
      groupId: this.currentGroupId,
      id: '0',
      type: 'dir'
    })
  }

  /**
   * deviceRouter-改alarmRouter
   */
  private async alarmRouter(item: any, node?: any) {
    const dirTree: any = this.$refs.dirTree
    let _node: any
    if (!node) {
      _node = dirTree.getNode(item.id)
      if (_node) {
        if (!_node.loaded) {
          this.loadDirChildren(item.id, _node)
        }
        _node.parent.expanded = true
        dirTree.setCurrentKey(item.id)
      }
    } else {
      _node = node
      _node.expanded = true
    }
    _node && DeviceModule.SetBreadcrumb(this.getDirPath(_node).reverse())
    let router: any
    let query: any = {}
    switch (item.type) {
      case 'platformDir':
      case 'dir':
        router = {
          name: 'AlarmList'
        }
        query = {
          dirId: item.id
        }
        break
      case 'platform':
        router = {
          name: 'AlarmList'
        }
        query = {
          dirId: item.id,
          deviceId: item.id
        }
        break
      case 'nvr':
        router = {
          name: 'AlarmList'
        }
        query = {
          deviceId: item.id
        }
        break
      case 'ipc':
        router = {
          name: 'AlarmList'
        }
        query = {
          deviceId: item.id
        }
        break
    }
    router.query = {
      inProtocol: this.currentGroup!.inProtocol,
      groupId: item.groupId,
      type: item.type,
      path: this.breadcrumb.map((item: any) => item.id).join(','),
      ...query
    }
    if (JSON.stringify(this.$route.query) === JSON.stringify(router.query)) return
    this.$router.push(router)
  }

  /**
   * 初始化目录状态
   */
  public async initTreeStatus() {
    const dirTree: any = this.$refs.dirTree
    const path: string | (string | null)[] | null = this.$route.query.path
    const keyPath = path ? path.toString().split(',') : null
    if (keyPath) {
      for (let i = 0; i < keyPath.length; i++) {
        const _key = keyPath[i]
        const node = dirTree.getNode(_key)
        if (node) {
          await this.loadDirChildren(_key, node)
          if (i === keyPath.length - 1) {
            DeviceModule.SetBreadcrumb(this.getDirPath(node).reverse())
          }
        }
      }
    } else if (this.dirList.length && this.dirList.every((dir: any) => dir.type === 'dir')) {
      // 如果根目录下无设备，则跳转至第一个目录下
      this.alarmRouter(this.dirList[0])
    }
  }
}
</script>
<style scoped>
  .warning-info {
    text-align: center;
    line-height: 10vh;
    height: 10vh;
  }
</style>
