<template>
  <div v-loading="loading.group" class="app-container">
    <common-layout ref="deviceWrap">
      <template slot="leftHeader">
        <el-tooltip effect="dark" content="刷新目录" placement="top" :open-delay="300">
          <el-button type="text" @click="handleTools(toolsEnum.RefreshDirectory)">
            <svg-icon name="refresh" />
          </el-button>
        </el-tooltip>
      </template>
      <template slot="leftBody">
        <alarm-tree
          ref="deviceTree"
          @handle-node="handleTreeNode"
        />
      </template>
      <template slot="rightHeader">
        <breadcrumb
          ref="breadcrumb"
          @node-change="handleTreeNode"
        />
      </template>
      <template slot="rightBody">
        <router-view :max-height="maxHeight" />
      </template>
    </common-layout>
  </div>
</template>
<script lang="ts">
import { Component, Mixins, Provide } from 'vue-property-decorator'
import IndexMixin from '@/views/device/mixin/indexMixin'
import layoutMxin from '@vss/device/mixin/layoutMixin'
import AlarmTree from '@vss/device/components/Tree/AlarmTree.vue'
import Breadcrumb from '@vss/device/components/Breadcrumb.vue'

@Component({
  name: 'Alarm',
  components: {
    AlarmTree,
    Breadcrumb
  }
})
export default class extends Mixins(IndexMixin) {
  public parentDir = null
  public currentDir = null
  public dialog: any = {
    createDir: false
  }

  public mounted() {
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
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
    const { id } = data || {}
    const router = {
      name: 'AlarmList',
      query: {
        dirId: data.id,
        deviceId: data.id,
        type: data.type,
        inProtocol: data.inVideoProtocol
      }
    }
    this.deviceTree.setCurrentKey(id)
    if (JSON.stringify(this.$route.query) === JSON.stringify(router.query)) return
    this.$router.push(router)

  }

  /**
   * 删除目录
   */
  // private deleteDir(dir: any) {
  //   this.$alertDelete({
  //     type: '目录',
  //     msg: `是否确认删除目录"${dir.label}"`,
  //     method: deleteDir,
  //     payload: { dirId: dir.id },
  //     onSuccess: () => {
  //       this.initDirs()
  //       if (dir.id === this.$route.query.dirId) {
  //         this.gotoRoot()
  //       }
  //     }
  //   })
  // }

  /**
   * 打开对话框
   */
  // private openDialog(type: string, payload: any) {
  //   switch (type) {
  //     case 'createDir':
  //       if (payload) {
  //         this.parentDir = payload
  //       }
  //       this.dialog.createDir = true
  //       break
  //     case 'updateDir':
  //       if (payload) {
  //         this.currentDir = payload
  //       }
  //       this.dialog.createDir = true
  //       break
  //   }
  // }

  /**
   * 关闭对话框
   */
  // private closeDialog(type: string, payload: any) {
  //   // @ts-ignore
  //   this.dialog[type] = false
  //   switch (type) {
  //     case 'createDir':
  //     case 'updateDir':
  //       this.currentDir = null
  //       this.parentDir = null
  //       if (payload) {
  //         this.initDirs()
  //       }
  //   }
  // }

}
</script>
<style scoped>
  .warning-info {
    text-align: center;
    line-height: 10vh;
    height: 10vh;
  }
</style>
