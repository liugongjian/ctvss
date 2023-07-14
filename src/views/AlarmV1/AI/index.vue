<template>
  <div v-loading="loading.group" class="app-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="AI告警列表" name="list" />
        <el-tab-pane label="AI告警统计" name="stats" />
      </el-tabs>
      <common-layout v-if="activeTab === 'list'" ref="deviceWrap">
        <template slot="leftHeader">
          <el-tooltip effect="dark" content="刷新目录" placement="top" :open-delay="300">
            <el-button type="text" @click="handleTools(toolsEnum.RefreshDirectory)">
              <svg-icon name="refresh" />
            </el-button>
          </el-tooltip>
        </template>
        <template slot="leftBody">
          <AIAlarmTreeV1
            ref="deviceTree"
            @handle-node="handleTreeNode"
          />
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
import AIAlarmTreeV1 from '@vss/device/components/Tree/AIAlarmTreeV1.vue'
import Statics from './Statics.vue'

@Component({
  name: 'Alarm',
  components: {
    AIAlarmTreeV1,
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

  public breadcrumbItems = []


  public async mounted() {
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

      this.deviceTree.setCurrentKey(id)
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

}
</script>
<style scoped>
  .warning-info {
    text-align: center;
    line-height: 10vh;
    height: 10vh;
  }
  .common-layout__right__body{
    overflow: auto;
  }
</style>
