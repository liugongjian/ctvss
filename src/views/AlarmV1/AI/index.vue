<template>
  <div class="app-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="AI告警列表" name="list" />
        <el-tab-pane label="AI告警统计" name="stats" />
      </el-tabs>
      <common-layout v-if="activeTab === 'list'" ref="deviceWrap">
        <template slot="leftHeader">
          <el-tooltip effect="dark" content="刷新目录" placement="top" :open-delay="300">
            <el-button type="text" @click="initDirsAlarm">
              <svg-icon name="refresh" />
            </el-button>
          </el-tooltip>
        </template>
        <template slot="leftBody">
          <!-- <AIAlarmTreeV1
            ref="deviceTree"
            @handle-node="handleTreeNode"
          /> -->
          <div class="dir-list">
            <div class="dir-list__tree device-list__max-height">
              <div class="dir-list__tree--root" :class="{ 'actived': isRootDir }" @click="gotoRoot"><svg-icon name="component" width="12px" />根目录</div>
              <el-tree
                ref="deviceTree"
                v-loading="treeLoading"
                empty-text="暂无目录或设备"
                :data="dirList"
                node-key="id"
                highlight-current
                lazy
                :load="treeLoadAiV1"
                :props="treeProp"
                :current-node-key="defaultKey"
                @node-click="handleTreeNode"
              >
                <span
                  slot-scope="{ node, data }"
                  class="custom-tree-node"
                  :class="{ 'online': data.deviceStatus === 'on' }"
                >
                  <span class="node-name">
                    <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                    <span v-else class="node-dir">
                      <svg-icon name="dir" width="15" height="15" />
                      <svg-icon name="dir-close" width="15" height="15" />
                    </span>
                    <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
                    {{ data.label }}
                    <span class="alert-type">{{ renderAlertType(data) }}</span>
                  </span>
                </span>
              </el-tree>
            </div>
          </div>
        </template>
        <template slot="rightHeader">
          <div class="breadcrumb">
            <span class="breadcrumb__item" @click="gotoRoot">根目录</span>
            <span
              v-for="item in breadcrumbItems"
              :key="item.id"
              class="breadcrumb__item"
              @click="deviceRouter(item)"
            >
              {{ item.label }}
            </span>
          </div>
        </template>
        <template slot="rightBody">
          <router-view :max-height="maxHeight" />
        </template>
      </common-layout>
      <Statics v-if="activeTab === 'stats'" />
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Mixins, Provide } from 'vue-property-decorator'
import layoutMxin from '@vss/device/mixin/layoutMixin'
// import AIAlarmTreeV1 from '@vss/device/components/Tree/AIAlarmTreeV1.vue'
import Statics from './Statics.vue'
import { getDeviceTree } from '@/api/device'
import { getGroups } from '@/api/group'
import { renderAlertType } from '@/utils/device'

@Component({
  name: 'Alarm',
  components: {
    // AIAlarmTreeV1,
    Statics
  }
})
export default class extends Mixins(layoutMxin) {
  public parentDir = null
  public currentDir = null
  public dialog: any = {
    createDir: false
  }
  private activeTab = 'list'
  private currentNodeData: any = {}

  public dirList = []

  private treeLoading = false
  private renderAlertType = renderAlertType

  public breadcrumbItems = []

  public get defaultKey() {
    const id = this.$route.query.deviceId || this.$route.query.dirId
    if (!id) {
      return null
    }
    return id
  }

  public get isRootDir() {
    return !this.$route.query.deviceId
  }

  public treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }

  public async mounted() {
    await this.initDirsAlarm()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  public maxHeight = null
  public calMaxHeight() {
    const deviceWrap: any = this.$refs.deviceWrap
    const size = deviceWrap.$el.getBoundingClientRect()
    const top = size.top
    const documentHeight = document.body.offsetHeight
    this.maxHeight = documentHeight - top - 22
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  /**
   * 树节点点击事件
   * @param data node信息
   */
  @Provide('handleTreeNode')
  private async handleTreeNode(data: any) {

    if (data.type === 'ipc' || data.id === ''){
      const { id } = data
      let router
      if ( id === '' ){
        router = {
          name: 'AIAlarmList',
          query: {
            deviceId: id
          }
        }
      } else {
        router = {
          name: 'AIAlarmList',
          query: {
            deviceId: data.id,
            type: data.type,
            path: data.path.map(item => item.id).join(',')
          }
        }
      }
      const deviceTree: any = this.$refs.deviceTree
      deviceTree.setCurrentKey(id.length === 0 ? null : id)
      this.breadcrumbItems = data.path
      this.currentNodeData = data
      this.$router.push(router)
    }
  }


    /**
   * 设备页面路由
   */
  public async deviceRouter(dest: any) {
    this.handleTreeNode(dest)

  }


  private async gotoRoot() {
    this.handleTreeNode({ id: '' })
    this.breadcrumbItems = []
  }


  /**
   * V1版本加载设备树
   * @param node 节点信息
   */
  public async treeLoadAiV1(node, resolve) {
    if (node.level === 0) return []
    const dirs = await this.getTreeV1(node)
    resolve(dirs)
  }

  /**
   * 获取菜单树
   */
  private async getTreeV1(node: any) {
    try {
      const devices: any = await getDeviceTree({
        groupId: node.data.groupId,
        id: node.data.type === 'group' ? 0 : node.data.id,
        inProtocol: node.data.inProtocol,
        type: node.data.type === 'group' ? undefined : node.data.type
      })

      const dirs: any = devices.dirs.map((dir: any) => {
        return {
          ...dir,
          id: dir.id,
          groupId: node.data.groupId,
          label: dir.label,
          inProtocol: node.data.inProtocol,
          isLeaf: dir.isLeaf,
          type: dir.type,
          path: node.data.path.concat([dir]),
          parentId: node.data.id
        }
      })
      return dirs
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 目录初始化
   */
  public async initDirsAlarm() {
    try {
      this.treeLoading = true
      const res = await getGroups({
        pageSize: 1000
      })
      this.dirList = []
      res.groups.forEach((group: any) => {
        group.inProtocol !== 'vgroup' &&
          this.dirList.push({
            id: group.groupId,
            groupId: group.groupId,
            label: group.groupName,
            inProtocol: group.inProtocol,
            type: 'group',
            parentId: '0',
            path: [
              {
                id: group.groupId,
                label: group.groupName,
                type: 'group'
              }
            ],
            isLeaf: false
          })
      })
    } catch (e) {
      this.dirList = []
    } finally {
      this.treeLoading = false
    }
  }

  /**
   * 树节点加载完成后执行的钩子
   * @param node 父节点信息
   * @param res 接口返回信息
   * @returns 子节点信息
   */
  public async onTreeLoadedHook(node, res) {
    return res.dirs
  }

}
</script>
<style lang="scss" scoped>
  .warning-info {
    text-align: center;
    line-height: 10vh;
    height: 10vh;
  }
  .common-layout__right__body{
    overflow: auto;
  }
  .dir-list {
    width: 100%;
    &__tree--root {
        position: relative;
        padding: 5px 5px 7px;
        margin-bottom: 5px;
        cursor: pointer;
        color: #6e7c89;
          &.actived {
            background: #f3f3f3;
          }

          .sum-icon {
            color: #888;
          }
          svg {
            margin-right: 5px;
          }
    }
  }

</style>
