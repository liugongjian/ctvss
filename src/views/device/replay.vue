<!-- 分屏预览 -->
<template>
  <div v-loading="loading.group" class="app-container">
    <div class="filter-container">
      <el-select
        v-model="groupId"
        class="filter-group"
        placeholder="请选择业务组"
        @change="changeGroup"
      >
        <el-option
          v-for="item in groupList"
          :key="item.groupId"
          :label="item.groupName"
          :value="item.groupId"
        />
      </el-select>
    </div>
    <el-card ref="deviceWrap" class="device-list-wrap">
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
                <el-button type="text" @click="initDirs"><i class="el-icon-refresh" /></el-button>
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
                :current-node-key="deviceId"
                @node-click="selectDevice"
              >
                <span slot-scope="{node, data}" class="custom-tree-node">
                  <span class="node-name">
                    <svg-icon :name="data.type" color="#6e7c89" />
                    {{ node.label }}
                  </span>
                </span>
              </el-tree>
            </div>
          </div>
        </div>
        <div class="device-list__right">
          <div class="breadcrumb">
            <span
              v-for="item in breadcrumb"
              :key="item.id"
              class="breadcrumb__item"
            >
              {{ item.label }}
            </span>
          </div>
          <replay v-if="deviceId" />
          <div v-else class="empty-text">
            请先选择左侧设备
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Mixins } from 'vue-property-decorator'
import DeviceMixin from './mixin'
import { DeviceModule } from '@/store/modules/device'
import { getGroups } from '@/api/group'
import { Group } from '@/type/group'
import StatusBadge from '@/components/StatusBadge/index.vue'
import Replay from './components/Replay.vue'

@Component({
  name: 'Record',
  components: {
    Replay,
    StatusBadge
  }
})
export default class extends Mixins(DeviceMixin) {
  private currentIndex = 0
  private maxSize = 4
  private screenList: Array<Screen> = []
  private isFullscreen = false

  private get deviceId() {
    return this.$route.query.deviceId || null
  }

  private mounted() {
    this.getGroupList()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  /**
   * 获取组列表
   */
  private async getGroupList() {
    this.loading.group = true
    let params = {
      pageSize: 1000
    }
    const res = await getGroups(params)
    this.groupList = res.groups
    if (this.groupList.length) {
      if (!this.$route.query.groupId) {
        await DeviceModule.SetGroup(this.groupList[0])
        this.$route.query.groupId = this.groupList[0]
        this.$router.push({
          name: 'replay',
          query: {
            groupId: this.currentGroupId
          }
        })
      } else {
        const currentGroup = this.groupList.find((group: Group) => group.groupId === this.$route.query.groupId)
        await DeviceModule.SetGroup(currentGroup)
      }
      await this.initDirs()
    }
    this.loading.group = false
  }

  /**
   * 切换业务组
   */
  private async changeGroup() {
    const currentGroup = this.groupList.find((group: Group) => group.groupId === this.groupId)
    await DeviceModule.SetGroup(currentGroup)
    this.$router.push({
      name: 'replay',
      query: {
        groupId: this.currentGroupId
      }
    })
    await this.initDirs()
  }

  /**
   * 清空初始化树状态默认方法
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
    }
  }

  /**
   * 选择录像回放设备
   */
  private selectDevice(item: any, node: any) {
    DeviceModule.SetBreadcrumb(this.getDirPath(node).reverse())
    if (item.type === 'ipc') {
      this.$router.push({
        name: 'replay',
        query: {
          groupId: this.currentGroupId,
          deviceId: item.id,
          path: this.breadcrumb.map((item: any) => item.id).join(',')
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.device-list__right {
  .replay-wrap {
    padding: 15px;
  }
  .empty-text {
    margin-top: 35px;
  }
}
</style>
