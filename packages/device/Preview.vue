<template>
  <div class="app-container">
    <common-layout>
      <template slot="leftHeader">
        <!-- TODO -->
        <el-tooltip effect="dark" content="轮巡根目录" placement="top" :open-delay="300">
          <el-button type="text" @click="handleLeftHeaderTools('polling')"><svg-icon name="polling-play" /></el-button>
        </el-tooltip>
        <el-tooltip effect="dark" content="一键播放根目录" placement="top" :open-delay="300">
          <el-button type="text" @click="handleLeftHeaderTools('autoPlay')"><svg-icon name="auto-play" /></el-button>
        </el-tooltip>
        <el-tooltip effect="dark" content="刷新目录" placement="top" :open-delay="300">
          <el-button type="text" @click="handleLeftHeaderTools('refresh')"><svg-icon name="refresh" /></el-button>
        </el-tooltip>
      </template>
      <template slot="leftBody">
        <!-- TODO -->
        <preview-tree
          ref="deviceTree"
          :lazy="lazy"
          :data="treeSearchResult"
          @handle-node="handleTreeNode"
          @handle-tools="handleTreeTools"
        />
        <polling-mask
          v-if="false"
          polling-status="free"
          @polling-handle="handleTreeTools"
        />
      </template>
      <template slot="leftBottom">
        <!-- TODO -->
        <advanced-search
          :search-form="advancedSearchForm"
          @search="doSearch"
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
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { AdvancedSearch as AdvancedSearchType } from '@/type/advancedSearch'
import AdvancedSearch from './components/AdvancedSearch.vue'
import PreviewTree from './components/Tree/PreviewTree.vue'
import PollingMask from './components/PollingMask.vue'

@Component({
  name: 'Device',
  components: {
    PreviewTree,
    PollingMask,
    AdvancedSearch
  }
})
export default class extends Vue {
  private advancedSearchForm: AdvancedSearchType = {
    deviceStatusKeys: [],
    streamStatusKeys: [],
    deviceAddresses: {
      code: '',
      level: ''
    },
    matchKeys: [],
    inputKey: '',
    searchKey: '',
    revertSearchFlag: false
  }

  private lazy: boolean = true

  private treeSearchResult: any = []

  private mounted() {
  }

  /**
   * 左侧头部工具栏功能触发回调
   * @param type 功能类型
   */
  private handleLeftHeaderTools(type: any) {
    console.log(type)
  }

  /**
   * 树节点点击事件
   * @param data node信息
   */
  private handleTreeNode(data: any) {
    console.log(data)
  }

  /**
   * 树工具栏功能触发回调
   * @param type 功能类型
   * @param data 触发事件的节点信息
   */
  private handleTreeTools(type: any, data: any) {
    console.log(type, data)
  }

  public doSearch(payload: any) {
    // this.advancedSearchForm.deviceStatusKeys = payload.deviceStatusKeys
    // this.advancedSearchForm.streamStatusKeys = payload.streamStatusKeys
    // this.advancedSearchForm.matchKeys = payload.matchKeys
    // this.advancedSearchForm.deviceAddresses = payload.deviceAddresses
    // this.advancedSearchForm.inputKey = payload.inputKey
    // this.advancedSearchForm.searchKey = payload.searchKey
    // this.advancedSearchForm.revertSearchFlag = payload.revertSearchFlag
    // this.initDirs()
    console.log(payload)
    if (payload.revertSearchFlag) {
      this.treeSearchResult = [{
        id: 1,
        label: '一级 1',
        children: [{
          id: 4,
          label: '二级 1-1',
          children: [{
            id: 9,
            label: '三级 1-1-1'
          }, {
            id: 10,
            label: '三级 1-1-2'
          }]
        }]
      }, {
        id: 2,
        label: '一级 2',
        children: [{
          id: 5,
          label: '二级 2-1'
        }, {
          id: 6,
          label: '二级 2-2'
        }]
      }, {
        id: 3,
        label: '一级 3',
        children: [{
          id: 7,
          label: '二级 3-1'
        }, {
          id: 8,
          label: '二级 3-2',
          children: [{
            id: 9,
            label: '二级 3-1'
          }, {
            id: 10,
            label: '二级 3-2',
            children: [{
              id: 11,
              label: '二级 3-1'
            }, {
              id: 12,
              label: '二级 3-2'
            }]
          }]
        }]
      }]
      this.lazy = false
    } else {
      this.treeSearchResult = []
      this.lazy = true
    }
    let deviceTree: any = this.$refs.deviceTree
    deviceTree.initCommonTree()
  }
}
</script>

<style lang="scss" scoped>

</style>
