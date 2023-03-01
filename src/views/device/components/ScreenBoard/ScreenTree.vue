<template>
  <div v-loading="loading.dir" class="dir-list">
    <div class="dir-list__tools">
      <el-tooltip
        v-if="isLive"
        class="item"
        effect="dark"
        content="轮巡根目录"
        placement="top"
        :open-delay="300"
      >
        <el-button
          v-if="!polling.isStart"
          type="text"
          @click="executeQueue(null, true, 'polling')"
        >
          <svg-icon name="polling-play" />
        </el-button>
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="一键播放根目录"
        placement="top"
        :open-delay="300"
      >
        <el-button
          type="text"
          @click="executeQueue(null, true, 'autoPlay')"
        >
          <svg-icon name="auto-play" />
        </el-button>
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="刷新目录"
        placement="top"
        :open-delay="300"
      >
        <el-button type="text" @click="initDirs">
          <svg-icon name="refresh" />
        </el-button>
      </el-tooltip>
    </div>
    <div
      class="dir-list__tree device-list__max-height"
      :class="{'dir-list__tree--live': isLive, 'dir-list__tree--replay': !isLive}"
    >
      <el-tree
        v-if="!advancedSearchForm.revertSearchFlag"
        key="screen-el-tree-original"
        ref="dirTree"
        empty-text="暂无目录或设备"
        :data="dirList"
        node-key="id"
        highlight-current
        lazy
        :load="loadDirs"
        :props="treeProp"
        @node-click="openScreen"
      >
        <span
          v-drop-screen="{node, isLive, view}"
          slot-scope="{node, data}"
          class="custom-tree-node"
          :class="{
            'online': data.deviceStatus === 'on',
            'offline': (data.deviceStatus !== 'on' && data.type === 'ipc'),
            'no-permission': !checkPermission(isLive ? ['ivs:GetLiveStream'] : ['ivs:GetCloudRecord'], data)
          }"
          @contextmenu="($event, node)"
        >
          <span class="node-name" :title="getTitle(data)">
            <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
            <span v-else class="node-dir">
              <svg-icon name="dir" width="15" height="15" />
              <svg-icon name="dir-close" width="15" height="15" />
            </span>
            <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
            <additional-status v-if="data.type === 'ipc'" :record-status="data.recordStatus" :alarm-info="data.alarmInfo" />
            {{ node.label }}
            <span class="sum-icon">{{ getSums(data) }}</span>
            <svg-icon v-if="checkTreeItemStatus(data)" name="playing" class="playing" />
          </span>
          <div class="tools" @click.stop.prevent>
            <el-tooltip
              class="item"
              effect="dark"
              content="切换主子码流"
              placement="top"
              :open-delay="500"
            >
              <StreamSelector v-if="data.type === 'ipc' && isLive && checkPermission(['ivs:GetLiveStream'], data)" :stream-size="data.multiStreamSize" :streams="data.deviceStreams" @onSetStreamNum="openScreen(data, ...arguments)" />
            </el-tooltip>
            <OperateSelector v-if="data.type !== 'ipc' && data.type !== 'role'" :is-live="isLive" @onSetOperateValue="setOperateValue($event, node)" />
          </div>
        </span>
      </el-tree>
      <el-tree
        v-else
        key="screen-el-tree-filter"
        ref="dirTree"
        empty-text="暂无目录或设备"
        :data="dirList"
        node-key="id"
        highlight-current
        :props="treeProp"
        default-expand-all
        @node-click="openScreen"
      >
        <span
          v-drop-screen="{node, isLive, view}"
          slot-scope="{node, data}"
          class="custom-tree-node"
          :class="{
            'online': data.deviceStatus === 'on',
            'offline': (data.deviceStatus !== 'on' && data.type === 'ipc'),
            'no-permission': !checkPermission(isLive ? ['ivs:GetLiveStream'] : ['ivs:GetCloudRecord'], data)
          }"
          @contextmenu="($event, node)"
        >
          <span class="node-name" :title="getTitle(data)">
            <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
            <span v-else class="node-dir">
              <svg-icon name="dir" width="15" height="15" />
              <svg-icon name="dir-close" width="15" height="15" />
            </span>
            <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
            <additional-status v-if="data.type === 'ipc'" :record-status="data.recordStatus" :alarm-info="data.alarmInfo" />
            {{ node.label }}
            <span class="sum-icon">{{ getSums(data) }}</span>
            <svg-icon v-if="checkTreeItemStatus(data)" name="playing" class="playing" />
          </span>
          <div class="tools" @click.stop.prevent>
            <el-tooltip
              class="item"
              effect="dark"
              content="切换主子码流"
              placement="top"
              :open-delay="500"
            >
              <StreamSelector v-if="data.type === 'ipc' && isLive && checkPermission(['ivs:GetLiveStream'], data)" class="set-stream" :stream-size="data.multiStreamSize" :streams="data.deviceStreams" @onSetStreamNum="openScreen(data, ...arguments)" />
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="更多操作"
              placement="top"
              :open-delay="300"
            >
              <OperateSelector v-if="data.type !== 'ipc' && data.type !== 'role'" :is-live="isLive" @onSetOperateValue="setOperateValue($event, node)" />
            </el-tooltip>
          </div>
        </span>
      </el-tree>
    </div>
    <div v-if="polling.isLoading || pollingStatus !== 'free'" class="polling-mask">
      <div class="polling-mask__tools">
        <div class="polling-mask__tools__status">
          <span v-if="pollingStatus === 'pause'">轮巡已暂停</span>
          <span v-else>{{ polling.isLoading ? '查询设备中...' : '当前轮巡中...' }}</span>
        </div>
        <div class="polling-mask__tools__item">
          <svg-icon
            name="clock"
            class="polling-mask__tools__clock"
            width="16px"
            height="16px"
          />
          <el-select
            v-model="polling.interval"
            class="polling-mask__tools__select"
            size="mini"
            placeholder="请选择"
            :disabled="polling.isLoading"
            @change="intervalChange"
          >
            <el-option
              v-for="item in pollingInterval"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div v-if="pollingStatus === 'working'" class="polling-mask__tools__item">
          <el-button size="mini" :disabled="polling.isLoading" @click="pausePolling()">
            <svg-icon name="pause" />暂停
          </el-button>
        </div>
        <div v-if="pollingStatus === 'pause'" class="polling-mask__tools__item">
          <el-button size="mini" :disabled="polling.isLoading" @click="resumePolling()">
            <svg-icon name="play" />继续
          </el-button>
        </div>
        <div class="polling-mask__tools__item">
          <el-button size="mini" :disabled="polling.isLoading" @click="stopPolling()">
            <svg-icon name="stop" />结束
          </el-button>
        </div>
      </div>
    </div>
    <div class="dir-list__bottom">
      <!-- 虚拟业务组暂不支持搜索 -->
      <advanced-search
        v-if="currentGroup.inProtocol && currentGroup.inProtocol !== 'vgroup'"
        :search-form="advancedSearchForm"
        @search="doSearch"
      />
      <slot name="bottom" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator'
import { getSums } from '@/utils/device'
import { Device } from '@/type/Device'
import { loadTreeNode } from '@/api/customTree'
import { VGroupModule } from '@/store/modules/vgroup'
import IndexMixin from '@/views/device/mixin/indexMixin'
import StatusBadge from '@/components/StatusBadge/index.vue'
import StreamSelector from '@/views/device/components/StreamSelector.vue'
import OperateSelector from '@/views/device/components/OperateSelector.vue'
import AdvancedSearch from '@/views/device/components/AdvancedSearch.vue'
import AdditionalStatus from '../AdditionalStatus.vue'
import { ScreenManager } from '@/views/device/services/Screen/ScreenManager'
import { dropScreen } from './directives/dropScreen'

@Component({
  name: 'ScreenTree',
  components: {
    StatusBadge,
    StreamSelector,
    OperateSelector,
    AdvancedSearch,
    AdditionalStatus
  },
  directives: {
    'drop-screen': dropScreen
  }
})
export default class extends Mixins(IndexMixin) {
  @Prop()
  private screenManager: ScreenManager

  @Prop()
  public isLive: boolean

  private getSums = getSums

  /* 轮巡及一键播放 */
  private pollingStatus: string = 'free'

  private pollingInterval = [
    {
      value: 5,
      label: '5秒'
    },
    {
      value: 10,
      label: '10秒'
    },
    {
      value: 20,
      label: '20秒'
    },
    {
      value: 40,
      label: '40秒'
    },
    {
      value: 60,
      label: '1分钟'
    },
    {
      value: 180,
      label: '3分钟'
    },
    {
      value: 300,
      label: '5分钟'
    },
    {
      value: 600,
      label: '10分钟'
    },
    {
      value: 1800,
      label: '30分钟'
    }
  ]

  /* 轮询配置 */
  private polling = {
    interval: 20,
    isLoading: false
  }

  /* 轮询设备队列 */
  private devicesQueue: Device[] = []

  /* 当前选中的分屏 */
  private get currentScreen() {
    return this.screenManager && this.screenManager.currentScreen
  }

  /* 视频队列执行器 */
  private get queueExecutor() {
    return this.screenManager && this.screenManager.refs.queueExecutor
  }

  /* 分屏数量 */
  private get maxSize() {
    return this.screenManager && this.screenManager.size
  }

  /* 视图类型 */
  private get view() {
    return this.screenManager && this.screenManager.view
  }

  /* 监听业务组切换 */
  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: String, oldGroupId: String) {
    // 停止轮巡
    this.pollingStatus !== 'free' && this.stopPolling()
    // 初始化分屏
    this.screenManager.initScreenList()
    this.screenManager.inProtocol = this.currentGroupInProtocol
    // search为inject变量，不能直接整体赋值为其他，否则inject会失效
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
    if (oldGroupId) {
      const query = {
        searchKey: '',
        deviceStatusKeys: '',
        streamStatusKeys: '',
        deviceAddresses: '',
        matchKeys: ''
      }
      this.$router.replace({
        query
      })
    }
    if (!groupId) return
    this.$nextTick(() => {
      this.initDirs()
    })
  }

  @Watch('screenManager.screenManagerStatus', { deep: true })
  private onScreenManagerChange(screenManagerStatus) {
    this.pollingStatus = screenManagerStatus.executeQueueConfig.status
  }

  private mounted() {
    this.initSearchStatus()
  }

  /**
   * 打开分屏
   */
  private openScreen(item: any, streamNum?: number) {
    this.screenManager.openTreeItem(item, streamNum)
  }

  /**
   * 检查设备树中的设备项是否选择
   */
  private checkTreeItemStatus(item: any) {
    if (item.type !== 'ipc') return false
    return !!this.screenManager.screenList.find(screen => screen.deviceId === item.id)
  }

  /**
   * 更多操作
   */
  private setOperateValue(value: 'polling' | 'autoPlay', node: any) {
    this.executeQueue(node, false, value)
  }

  /**
   * 获取需要执行的视频队列并按策略执行
   * @param node 起始树节点
   * @param isRoot 是否为根节点
   * @param policy 执行策略
   */
  private async executeQueue(node: any, isRoot: boolean, policy: 'polling' | 'autoPlay') {
    const devicesQueue: Device[] = []
    const dirTree: any = this.$refs.dirTree
    if (node) {
      this.currentNode = node
      // 设置虚拟业务组相关信息
      VGroupModule.SetRoleID(this.currentNode!.data.roleId || '')
      VGroupModule.SetRealGroupId(this.currentNode!.data.realGroupId || '')
      VGroupModule.SetRealGroupInProtocol(this.currentNode!.data.realGroupInProtocol || '')
    }
    policy === 'polling' && (this.polling.isLoading = true)
    if (isRoot) {
      for (let i = 0, length = this.dirList.length; i < length; i++) {
        await this.deepDispatchTree(dirTree, dirTree.getNode(this.dirList[i].id), devicesQueue, policy)
      }
    } else {
      await this.deepDispatchTree(dirTree, node, devicesQueue, policy)
    }
    policy === 'polling' && (this.polling.isLoading = false)
    if (this.queueExecutor) {
      this.screenManager.devicesQueue = devicesQueue
      this.queueExecutor.executeDevicesQueue(policy)
    }
  }

  /**
   * 深度优先遍历目录树
   * @param dirTree 目录树DOM
   * @param node 当前node节点
   * @param deviceArr 存储有效设备的数组
   * @param policy 播放事件策略（一键播放/轮巡）
   * @param playType 播放视频类型（实时预览/录像回放）
   */
  private async deepDispatchTree(dirTree: any, node: any, deviceArr: any[], policy?: 'polling' | 'autoPlay') {
    // 当为一键播放时，加载设备数超过最大屏幕数则终止遍历
    if (policy === 'autoPlay' && deviceArr.length >= this.maxSize) return
    if (node.data.type === 'ipc') {
      // 实时预览的一键播放和轮巡需要判断设备是否在线，录像回放的一键播放不需要
      // 需要执行IAM的判断逻辑，判断是否有对应的操作权限
      const perms = this.isLive ? ['ivs:GetLiveStream'] : ['ivs:GetCloudRecord']
      if (this.checkPermission(perms, node.data) && (node.data.deviceStatus === 'on' || !this.screenManager.isLive)) {
        if (!node.data.inProtocol) {
          node.data.inProtocol = this.currentGroupInProtocol
        }
        deviceArr.push(node.data)
      }
    } else {
      // 不为搜索树时需要调接口添加node的children
      if (!this.advancedSearchForm.revertSearchFlag) {
        let data
        if (this.isCustomTree) {
          const res = await loadTreeNode({
            dirId: node!.data.id
          })
          res.dirs = res.dirs.map(dir => ({
            ...dir,
            ...dir.authMap
          }))
          data = this.setDirsStreamStatus(res.dirs)
        } else {
          data = await this.getAuthActionsDeviceTree({
            groupId: this.currentGroupId,
            id: node!.data.id,
            type: node!.data.type,
            'self-defined-headers': {
              'role-id': node!.data.roleId || '',
              'real-group-id': node!.data.realGroupId || ''
            }
          }, node)
        }
        dirTree.updateKeyChildren(node.data.id, data)
        node.expanded = true
        node.loaded = true
      }
      if (node.data.children && node.data.children.length) {
        for (let i = 0, len = node.data.children.length; i < len; i++) {
          const item = node.data.children[i]
          // 子节点继承node的虚拟业务组信息
          if (node!.data.type === 'group') {
            item.roleId = node.data.roleId
            item.realGroupId = node.data.id
            item.realGroupInProtocol = node.data.inProtocol
          } else {
            item.roleId = node.data.roleId
            item.realGroupId = node.data.realGroupId
            item.realGroupInProtocol = node.data.realGroupInProtocol
          }
          await this.deepDispatchTree(dirTree, dirTree.getNode(item.id), deviceArr, policy)
          // 当为一键播放时，加载设备数超过最大屏幕数则终止遍历
          if (policy === 'autoPlay' && deviceArr.length >= this.maxSize) return
        }
      }
    }
  }

  /**
   * 改变轮巡时间
   */
  private intervalChange(val: number) {
    this.screenManager.executeQueueConfig.interval = val
  }

  /**
   * 停止轮巡
   */
  private stopPolling() {
    if (this.queueExecutor) {
      this.queueExecutor.stopPolling()
    }
  }

  /**
   * 暂停轮巡
   */
  private pausePolling() {
    if (this.queueExecutor) {
      this.queueExecutor.pausePolling()
    }
  }

  /**
   * 继续轮巡
   */
  private resumePolling() {
    if (this.queueExecutor) {
      this.queueExecutor.resumePolling()
    }
  }

  /**
   * 获取无权限提示
   */
  getTitle(data: any) {
    const perms = this.isLive ? ['ivs:GetLiveStream'] : ['ivs:GetCloudRecord']
    const title = this.isLive ? '无该设备实时预览权限' : '无该设备录像回放权限'
    if (!this.checkPermission(perms, data)) {
      return title
    } else {
      return ''
    }
  }
}

</script>
<style lang="scss" scoped>
.dir-list__tree {
  position: relative;

  &--live .offline .node-name {
    cursor: not-allowed;
  }

  .no-permission .node-name {
    cursor: not-allowed;
  }
}

.dir-list {
  position: relative;
  user-select: none;

  .playing {
    color: $success;
  }

  .custom-tree-node .tools {
    display: block;
    background: #fff;
    right: -10px;
    line-height: 26px;
    padding-right: 10px;

    i {
      display: block;
      padding: 5px 0;

      &:hover {
        .svg-icon {
          margin-right: 5px;
          color: #313941;
        }
      }
    }

    .set-stream {
      ::v-deep .controls__popup {
        left: auto;
        right: -5px;
      }
    }
  }

  .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content,
  .dir-list__tree .el-tree-node__content:hover {
    .custom-tree-node .tools {
      background: #f5f7fa;
    }
  }

  .polling-mask {
    position: absolute;
    display: flex;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    background: rgba(255, 255, 255, 75%);
    align-items: center;

    &__tools {
      width: 100%;
      text-align: center;
      font-size: 12px;
      margin-top: -30%;

      &__item {
        margin-bottom: 15px;
      }

      &__clock {
        vertical-align: middle;
      }

      &__status {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 30px;
      }

      &__select {
        width: 86px;
        margin-left: 5px;
      }

      .el-button--mini {
        width: 100px;
      }

      /* stylelint-disable-next-line no-descending-specificity */
      .svg-icon {
        color: inherit;
      }
    }
  }
}
</style>
