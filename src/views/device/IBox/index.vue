<template>
  <div class="ibox-container">
    <el-card calss="ibox-container__wrap">
      <div ref="deviceRef" :style="`height:${height}px`" class="ibox-container__tree-box">
        <div class="ibox-container__left" :style="`width: ${dirDrag.width}px`">
          <div>
            <el-button class="ibox-container__expand" @click="toggledirList">
              <svg-icon name="hamburger" />
            </el-button>
          </div>
          <div ref="dirList" class="ibox-container__tree-content" :style="`width: ${dirDrag.width}px`">
            <el-tree
              ref="dirTree"
              :data="dirList"
              :load="loadDirs"
              lazy
              empty-text="暂无目录或设备"
              node-key="id"
              :default-expanded-keys="defaultExpandedKeys"
              :current-node-key="defaultKey"
              :props="treeProp"
              highlight-current
              @node-click="handleNodeClick"
            >
              <span slot-scope="{node,data}">
                <span>{{ getSum(node,data) }}</span>
              </span>
            </el-tree>
          </div>
        </div>
        <div class="ibox-container__handle" :style="`left: ${dirDrag.width}px`" @mousedown="changeWidthStart($event)" />
        <div class="ibox-container__right">
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
          <div class="ibox-container__list" :style="{height: `${height - 40}px`}">
            <router-view />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { getIBoxList, getDeviceList } from '@/api/ibox'
import { IBoxModule } from '@/store/modules/ibox'

@Component({
  name: 'IBox',
  components: {
  }
})

export default class IBox extends Vue {
  // public loading = {
  //   'dirTree': false
  // }
  public isExpanded = true
  public height = 0
  public dirDrag = {
    isDragging: false,
    start: 0,
    offset: 0,
    orginWidth: 200,
    width: 250
  }

  public treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf' // 需要手动设置数据源的isLeaf属性，懒加载就不展示 可展开箭头
  }

  public dirList = []

  public breadcrumb = []

  public iboxDevice: any = {}

  public iboxList = []

  public defaultExpandedKeys = []

  public treeIboxId = ''

  async mounted() {
    this.calcHeight()
    window.addEventListener('resize', this.calcHeight)
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', this.calcHeight)
    })
    await this.getDirList()
  }

  public get defaultKey() {
    const id = this.$route.query.deviceId
    if (!id) {
      return null
    }
    return id
  }

  public calcHeight() {
    const deviceRef = this.$refs.deviceRef as HTMLElement
    const { top = 0 } = deviceRef.getBoundingClientRect()
    const documentHeight = document.body.clientHeight
    this.height = documentHeight - top - 22
  }

  toggledirList() {
    this.isExpanded = !this.isExpanded
  }

  public handleNodeClick(item: any, node: any) {
    // TODO 根据 dirList对应层级，判断右侧是list或者是detail

    node.expanded = true
    console.log('node', node, item)

    const { deviceId } = item
    this.treeIboxId = deviceId
    switch (node.level) {
      case 1:
        this.setListInfo('device', this.iboxDevice, deviceId)
        this.breadcrumb = []
        break
      case 2:
        if (item.deviceType === 'nvr') {
          const iboxNvr = this.getIboxNvr(node)
          this.setListInfo('nvrlist', iboxNvr, deviceId)
        } else if (item.deviceType === 'ipc') {
        // Todo 展示详情页
        } else {
        // todo 展示详情页
        }
        break
      case 3:
        // Todo 展示详情页
        break
      default:
        this.setListInfo('rootlist', this.iboxes, null)
    }
  }

  // 获取ibox目录
  public async getDirList() {
    const { query } = (this.$route) as any
    const { deviceId = '', type = 'rootlist' }: { deviceId: string, type: string } = query

    const param = {
      pageNum: 1,
      pageSize: 9999// 第一次请求，为了获取目录，传入9999
    }
    try {
      const data = await getIBoxList(param)

      const { dirs = [], iboxes } = data

      this.dirList = dirs.map((item: any) => {
        return {
          label: item.name,
          deviceId: item.id,
          ...item
        }
      })

      this.iboxes = iboxes

      this.setListInfo(type, iboxes, deviceId)
      this.$nextTick(() => {
        if (deviceId) {
          const dirTree: any = this.$refs.dirTree
          dirTree.setCurrentKey(this.defaultKey)
          this.defaultExpandedKeys = [this.defaultKey]
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  // 获取ibox下设备目录
  public async loadDirs(node: any, resolve: any) {
    const { query } = (this.$route) as any
    // const { deviceId } = query
    console.log('node--->', node)
    const { data } = node
    const deviceId = query.deviceId || data.deviceId

    await this.loadIboxDevice(deviceId)

    // 根据 deviceType确定是否是子节点
    const iboxList = this.iboxDevice ? this.iboxDevice.map((item: any) => {
      if (item.deviceType === 'nvr') {
        return {
          isLeaf: false,
          ...item
        }
      } else if (item.deviceType === 'ipc') {
        return {
          isLeaf: true,
          ...item
        }
      }
    }) : []
    if (node.level === 1) {
      return resolve(iboxList)
    } else if (node.level === 2) {
      const { data } = node
      if (data.deviceType === 'nvr') {
        const iboxNvr = this.getIboxNvr(node)
        this.setListInfo('nvrlist', iboxNvr, data.deviceId)
        return resolve(iboxNvr)
      }
      return resolve([])
    }
    return resolve([])
  }

  public getIboxNvr(node: any) {
    const { data } = node
    const iboxNvr = data.deviceChannels.map((item: any) => ({ isLeaf: true, ...item }))
    return iboxNvr
  }

  // 获取ibox下设备
  public async loadIboxDevice(id: string) {
    const param = {
      ParentDeviceId: id
    }

    try {
      const data: any = getDeviceList(param)
      this.iboxDevice = data.devices
    } catch (error) {
      console.log(error)
    }
  }

  public setListInfo(type: string = 'rootlist', data: any = [], deviceId: string) {
    const listInfo = {
      type,
      data
    }

    IBoxModule.SetList(listInfo)
    let query: any = {}
    if (deviceId) {
      query = {
        deviceId,
        type
      }
    } else {
      query = { type }
    }

    const router: any = {
      path: (this.$router as any).path,
      query
    }
    if (JSON.stringify(this.$route.query) === JSON.stringify(router.query)) return
    this.$router.push(router)
  }

  // 区分计算树的 在线展示
  public getSum(node: any, data: any) {
    if (node.label) {
      return `${node.label}(${data.onlineSize}/${data.deviceSize})`
    } else {
      return `${data.deviceName}`
    }
  }

  public treeHandle(node, data) {
    console.log(node, data)
  }

  public gotoRoot() {

  }

  /**
   * 设置左侧宽度
   */
  public changeWidthStart(e: MouseEvent) {
    const $dirList: any = this.$refs.dirList
    this.dirDrag.isDragging = true
    this.dirDrag.start = e.x
    this.dirDrag.orginWidth = $dirList.clientWidth

    window.addEventListener('mousemove', (e) => {
      if (!this.dirDrag.isDragging) return
      this.dirDrag.offset = this.dirDrag.start - e.x
      const width = this.dirDrag.orginWidth - this.dirDrag.offset
      if (width < 50) return
      this.dirDrag.width = width
    })
    window.addEventListener('mouseup', () => {
      this.dirDrag.isDragging = false
    })
  }
}
</script>
<style lang="scss" scoped>
.ibox-container {
  padding: 20px;

  ::v-deep {
    .el-card__body {
      padding: 0;
    }
  }

  &__wrap {
    position: relative;
  }

  &__left {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  &__handle {
    position: absolute;
    z-index: 100;
    height: calc(100% - 20px);
    width: 8px;
    margin-left: -8px;
    border-right: 1px solid #eee;
    transition: border 0.1s;
    cursor: ew-resize;
  }

  &__right {
    flex: 1;
    min-width: 0;

    .breadcrumb {
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      border-bottom: 1px solid #eee;
      background: #f8f8f8;
      white-space: nowrap;
      overflow: hidden;
      transition: padding-left 0.2s;

      &__item {
        cursor: pointer;
      }
    }
  }

  &__tree-box {
    display: flex;
    position: relative;
  }

  &__tree-content {
    flex: 1;
    padding: 10px;
    overflow: auto;
  }

  &__expand {
    border: none;
    border-radius: 0;
    left: 0;
    top: 0;
    z-index: 21;
    height: 39px;
    border-right: 1px solid #eee;
    font-size: 18px;
    padding: 10px 15px;
    background: #f8f8f8;
  }
}
</style>
