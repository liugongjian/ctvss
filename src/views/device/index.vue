<template>
  <div v-loading="loading.group" class="app-container">
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div class="device-list" :style="{height: `${maxHeight}px`}" :class="{'device-list--collapsed': !isExpanded, 'device-list--dragging': dirDrag.isDragging}">
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
              <el-tooltip v-if="!isVGroup && checkPermission(['AdminDevice'], {id: currentGroupId}) && !advancedSearchForm.revertSearchFlag" class="item" effect="dark" content="子目录排序" placement="top" :open-delay="300">
                <el-button type="text" @click.stop="openDialog('sortChildren', {id: '0'})"><svg-icon name="sort" /></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="刷新目录" placement="top" :open-delay="300">
                <el-button type="text" @click="initDirs"><svg-icon name="refresh" /></el-button>
              </el-tooltip>
              <el-tooltip v-if="!isVGroup && checkPermission(['AdminDevice'], {id: currentGroupId}) && !advancedSearchForm.revertSearchFlag" class="item" effect="dark" content="添加目录" placement="top" :open-delay="300">
                <el-button type="text" @click="openDialog('createDir')"><svg-icon name="plus" /></el-button>
              </el-tooltip>
              <el-tooltip v-if="false" class="item" effect="dark" content="目录设置" placement="top" :open-delay="300">
                <el-button type="text"><i class="el-icon-setting" /></el-button>
              </el-tooltip>
            </div>
            <div v-loading="loading.dir" class="dir-list__tree device-list__max-height">
              <div class="dir-list__tree--root" :class="{'actived': isRootDir}" @click="gotoRoot">
                <svg-icon name="component" width="12px" />
                根目录
                <span class="sum-icon">{{ `(${rootSums.online}/${rootSums.total})` }}</span>
                <el-tooltip v-if="currentGroup.inProtocol === 'gb28181'" class="item" effect="dark" content="导出全部搜索结果" placement="top" :open-delay="300">
                  <el-button type="text" style="float: right; padding-top: 0; padding-bottom: 0;" :disabled="!advancedSearchForm.revertSearchFlag" @click.stop="exportSearchResult"><svg-icon :class="{export: !!advancedSearchForm.revertSearchFlag}" name="export" /></el-button>
                </el-tooltip>
              </div>
              <el-tree
                v-if="!advancedSearchForm.revertSearchFlag"
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
                  <div v-if="!isVGroup && checkPermission(['AdminDevice'], data)" class="tools">
                    <template v-if="data.type !== 'ipc'">
                      <el-tooltip class="item" effect="dark" content="子目录排序" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="openDialog('sortChildren', data, node)"><svg-icon name="sort" /></el-button>
                      </el-tooltip>
                    </template>
                    <template v-if="data.type === 'dir' && !isVGroup && checkPermission(['AdminDevice'])">
                      <el-tooltip class="item" effect="dark" content="添加子目录" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="openDialog('createDir', data)"><svg-icon name="plus" /></el-button>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark" content="编辑目录" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="openDialog('updateDir', data)"><svg-icon name="edit" /></el-button>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark" content="删除目录" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="deleteDir(data)"><svg-icon name="trash" /></el-button>
                      </el-tooltip>
                    </template>
                  </div>
                </span>
              </el-tree>
              <el-tree
                v-else
                key="device-el-tree-filter"
                ref="dirTree"
                empty-text="暂无目录或设备"
                :data="dirList"
                node-key="id"
                highlight-current
                :props="treeProp"
                :current-node-key="defaultKey"
                default-expand-all
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
                  <div v-if="!isVGroup && checkPermission(['AdminDevice'], data)" class="tools">
                    <template v-if="data.type === 'dir' && !isVGroup && checkPermission(['AdminDevice'])">
                      <el-tooltip class="item" effect="dark" content="编辑目录" placement="top" :open-delay="300">
                        <el-button type="text" @click.stop="openDialog('updateDir', data)"><svg-icon name="edit" /></el-button>
                      </el-tooltip>
                    </template>
                  </div>
                </span>
              </el-tree>
            </div>
            <!-- 虚拟业务组暂不支持搜索 -->
            <advanced-search v-if="currentGroup.inProtocol && currentGroup.inProtocol !== 'vgroup'" :search-form="advancedSearchForm" @search="doSearch" />
          </div>
        </div>
        <div class="device-list__right">
          <div class="breadcrumb">
            <span class="breadcrumb__item" @click="gotoRoot">根目录</span>
            <span
              v-for="item in breadcrumb"
              :key="item.id"
              class="breadcrumb__item"
              @click="deviceRouter(item)"
            >
              {{ item.label }}
            </span>
          </div>
          <div class="device-list__max-height" :style="{height: `${maxHeight - 40}px`}">
            <router-view />
          </div>
        </div>
      </div>
    </el-card>
    <record-events v-if="dialog.recordEvents" :in-protocol="currentGroupInProtocol" :current-dir="currentDir" :group-id="currentGroupId" @on-close="closeDialog('recordEvents', ...arguments)" />
    <create-dir v-if="dialog.createDir" :parent-dir="parentDir" :current-dir="currentDir" :group-id="currentGroupId" @on-close="closeDialog('createDir', ...arguments)" />
    <sort-children v-if="dialog.sortChildren" :in-protocol="currentGroupInProtocol" :current-dir="sortDir" :group-id="currentGroupId" @on-close="closeDialog('sortChildren', ...arguments)" />
  </div>
</template>
<script lang="ts">
import { Component, Watch, Mixins, Provide } from 'vue-property-decorator'
import IndexMixin from './mixin/indexMixin'
import { DeviceModule } from '@/store/modules/device'
import CreateDir from './components/dialogs/CreateDir.vue'
import SortChildren from './components/dialogs/SortChildren.vue'
import RecordEvents from './components/dialogs/RecordEvents.vue'
import AdvancedSearch from '@/views/device/components/AdvancedSearch.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import AdditionalStatus from './components/AdditionalStatus.vue'
import { deleteDir } from '@/api/dir'
import { renderAlertType, getSums } from '@/utils/device'
import { checkPermission } from '@/utils/permission'
import { VGroupModule } from '@/store/modules/vgroup'
import { exportSearchResult } from '@/api/device'

@Component({
  name: 'Device',
  components: {
    CreateDir,
    StatusBadge,
    SortChildren,
    AdvancedSearch,
    AdditionalStatus,
    RecordEvents
  }
})
export default class extends Mixins(IndexMixin) {
  private checkPermission = checkPermission
  private renderAlertType = renderAlertType
  private getSums = getSums
  private parentDir = null
  private currentDir = null
  private sortDir: any = null
  private sortNode = null
  private dialog = {
    recordEvents: false,
    createDir: false,
    sortChildren: false
  }

  private mounted() {
    this.initSearchStatus()
    // this.getGroupList()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    VGroupModule.resetVGroupInfo()
    window.removeEventListener('resize', this.calMaxHeight)
  }

  @Watch('$route.query')
  private onRouterChange() {
    !this.defaultKey && this.gotoRoot()
  }

  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: string, oldGroupId: string) {
    this.advancedSearchForm.deviceStatusKeys = []
    this.advancedSearchForm.streamStatusKeys = []
    this.advancedSearchForm.deviceAddresses = {
      code: '',
      level: ''
    }
    this.advancedSearchForm.matchKeys = []
    this.advancedSearchForm.inputKey = ''
    this.advancedSearchForm.searchKey = ''
    this.advancedSearchForm.revertSearchFlag = false
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
  private openDialog(type: string, payload: any, node?: any) {
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
      case 'recordEvents':
        if (payload) {
          this.currentDir = payload
        }
        this.dialog.recordEvents = true
        break
      case 'sortChildren':
        if (payload) {
          this.sortDir = payload
          this.sortNode = node
        }
        this.dialog.sortChildren = true
    }
  }

  /**
   * 关闭对话框
   */
  private closeDialog(type: string, payload: any) {
    // @ts-ignore
    this.dialog[type] = false
    switch (type) {
      case 'sortChildren':
        if (payload === true) {
          if (this.sortDir.id === '0') {
            this.initDirs()
          } else {
            this.loadDirChildren(this.sortDir.id, this.sortNode)
          }
          (this.sortDir.id === this.$route.query.dirId || this.sortDir.id === this.$route.query.deviceId) && DeviceModule.SetIsSorted(true)
        }
        break
      case 'recordEvents':
      case 'createDir':
      case 'updateDir':
        this.currentDir = null
        this.parentDir = null
        if (payload === true) {
          this.initDirs()
        }
        break
    }
  }

  /**
   * 返回根目录
   */
  @Provide('gotoRoot')
  private async gotoRoot() {
    const dirTree: any = this.$refs.dirTree
    dirTree.setCurrentKey(null)
    await DeviceModule.ResetBreadcrumb()
    await VGroupModule.resetVGroupInfo()
    this.deviceRouter({
      id: '0',
      type: 'dir'
    })
  }

  // 导出搜索结果
  public async exportSearchResult() {
    try {
      const search = this.advancedSearchForm
      const data: any = {
        groupId: this.currentGroupId,
        inProtocol: this.currentGroupInProtocol,
        deviceStatusKeys: search.deviceStatusKeys.join(',') || undefined,
        streamStatusKeys: search.streamStatusKeys.join(',') || undefined,
        matchKeys: search.matchKeys.join(',') || undefined,
        deviceAddresses: search.deviceAddresses.code ? search.deviceAddresses.code + ',' + search.deviceAddresses.level : undefined,
        searchKey: search.searchKey || undefined,
        sortBy: 'OrderSequence',
        sortDirection: 'asc',
        pageSize: 5000,
        pageNum: 1
      }
      const res = await exportSearchResult(data)
      this.downloadFileUrl(`${data.inProtocol}导出设备表格`, res.exportFile)
    } catch (e) {
      console.log(e)
    }
  }

  // 下载表格
  public downloadFileUrl(fileName: string, file: any) {
    const blob = this.base64ToBlob(`data:application/zip;base64,${file}`)
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${fileName}.xlsx`
    link.click()
  }

  // base64转blob
  public base64ToBlob(base64: any) {
    const arr = base64.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  private recordMessageEvent() {
    console.log(111)
  }
}
</script>
