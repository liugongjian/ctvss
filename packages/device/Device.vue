<template>
  <div class="app-container">
    <common-layout>
      <template slot="leftHeader">
        <el-tooltip v-if="checkPermission([policyEnum.UpdateDevice], rootActions)" effect="dark" content="子目录排序" placement="top" :open-delay="300">
          <el-button type="text" @click="handleTools(toolsEnum.SortDirectory)">
            <svg-icon name="sort" />
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="checkPermission([policyEnum.UpdateDevice], rootActions)" effect="dark" content="添加目录" placement="top" :open-delay="300">
          <el-button type="text" @click="handleTools(toolsEnum.AddDirectory)">
            <svg-icon name="plus" />
          </el-button>
        </el-tooltip>
        <el-tooltip effect="dark" content="刷新目录" placement="top" :open-delay="300">
          <el-button type="text" @click="handleTools(toolsEnum.RefreshDirectory)">
            <svg-icon name="refresh" />
          </el-button>
        </el-tooltip>
      </template>
      <template slot="leftBody">
        <!-- TODO -->
        <device-tree
          ref="deviceTree"
          v-loading="loading.tree"
          :lazy="lazy"
          :data="treeSearchResult"
          @handle-node="handleTreeNode"
          @handle-tools="handleTools"
        />
      </template>
      <template slot="leftBottom">
        <!-- TODO -->
        <advanced-search
          :search-form="advancedSearchForm"
          @search="handleTools(toolsEnum.AdvanceSearch, $event)"
        />
      </template>
      <template slot="rightHeader">
        <!-- TODO -->
        <breadcrumb
          ref="breadcrumb"
          @node-change="handleTreeNode"
        />
      </template>
      <template slot="rightBody">
        <router-view />
      </template>
    </common-layout>
    <create-dir
      v-if="dialog[toolsEnum.EditDirectory]"
      :parent-dir="parentDir"
      :current-dir="currentDir"
      @on-close="handleTools(toolsEnum.CloseDialog, toolsEnum.EditDirectory, $event)"
    />
    <sort-dir
      v-if="dialog[toolsEnum.SortDirectory]"
      :sort-dir="sortDir"
      @on-close="handleTools(toolsEnum.CloseDialog, toolsEnum.SortDirectory, $event)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Provide } from 'vue-property-decorator'
import layoutMxin from '@vss/device/mixin/layoutMixin'
import DeviceTree from '@vss/device/components/Tree/DeviceTree.vue'
import SortDir from '@vss/device/components/SortDir.vue'
import CreateDir from '@vss/device/components/CreateDir.vue'
import Breadcrumb from '@vss/device/components/Breadcrumb.vue'

@Component({
  name: 'Device',
  components: {
    DeviceTree,
    SortDir,
    CreateDir,
    Breadcrumb
  }
})
export default class extends Mixins(layoutMxin) {
  /**
   * 树节点点击事件
   * @param data node信息
   */
  @Provide('handleTreeNode')
  private async handleTreeNode(data: any) {
    const { id, type } = data || {}
    this.deviceTree.setCurrentKey(id)
    if (type === this.deviceTypeEnum.Ipc) {
      this.$router.push({
        name: 'DeviceInfo',
        query: {
          ...this.$route.query,
          type: type,
          deviceId: id,
          deviceName: data.name,
          dirId: ''
        }
      })
    } else {
      this.deviceTree.loadChildren(id)
      this.$router.push({
        name: 'DeviceList',
        query: {
          ...this.$route.query,
          type: type,
          dirId: id,
          deviceName: data.name,
          deviceId: id
        }
      })
    }
  }
}
</script>
