<template>
  <div class="app-container">
    <common-layout>
      <template slot="leftHeader">
        <!-- TODO -->
        <el-tooltip effect="dark" content="子目录排序" placement="top" :open-delay="300">
          <el-button type="text" @click="handleTools(toolsEnum.SortDirectory)"><svg-icon name="sort" /></el-button>
        </el-tooltip>
        <el-tooltip effect="dark" content="添加目录" placement="top" :open-delay="300">
          <el-button type="text" @click="handleTools(toolsEnum.AddDirectory)"><svg-icon name="plus" /></el-button>
        </el-tooltip>
        <el-tooltip effect="dark" content="刷新目录" placement="top" :open-delay="300">
          <el-button type="text" @click="handleTools(toolsEnum.RefreshDirectory)"><svg-icon name="refresh" /></el-button>
        </el-tooltip>
      </template>
      <template slot="leftBody">
        <!-- TODO -->
        <device-tree
          ref="deviceTree"
          v-loading="loading.tree"
          :load="treeLoad"
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
        <span @click="1">根目录</span>
        <span
          v-for="item in ['目录1', '目录2', '目录3']"
          :key="item"
          @click="1"
        >
          {{ item }}
        </span>
      </template>
      <template slot="rightBody">
        <!-- TODO -->
        <router-view />
      </template>
    </common-layout>
    <create-dir v-if="dialog[toolsEnum.EditDirectory]" :parent-dir="parentDir" :current-dir="currentDir" @on-close="handleTools(toolsEnum.CloseDialog, toolsEnum.EditDirectory, $event)" />
    <sort-dir v-if="dialog[toolsEnum.SortDirectory]" @on-close="handleTools(toolsEnum.CloseDialog, toolsEnum.SortDirectory, $event)" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import layoutMxin from './mixin/layoutMixin'
import DeviceTree from './components/Tree/DeviceTree.vue'
import SortDir from './components/SortDir.vue'
import CreateDir from './components/CreateDir.vue'

@Component({
  name: 'Device',
  components: {
    DeviceTree,
    SortDir,
    CreateDir
  }
})
export default class extends Mixins(layoutMxin) {
}
</script>
