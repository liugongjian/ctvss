<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="currentGroupId"
        class="filter-group"
        placeholder="请选择业务组"
      >
        <el-option
          v-for="item in groupList"
          :key="item.id"
          :label="item.groupName"
          :value="item.id"
        />
      </el-select>
    </div>
    <el-card class="device-list-wrap">
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
              <el-tooltip class="item" effect="dark" content="目录设置" placement="top">
                <el-button type="text"><i class="el-icon-setting" /></el-button>
              </el-tooltip>
            </div>
            <div class="dir-list__tree">
              <el-tree
                :data="dirList"
                node-key="id"
                highlight-current
                @node-click="onDirItemClick"
              >
                <span slot-scope="{node, data}" class="custom-tree-node">
                  <svg-icon :name="data.type" color="#6e7c89" />
                  <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                  {{ node.label }}
                </span>
              </el-tree>
            </div>
          </div>
        </div>
        <div class="device-list__right">
          <div class="breadcrumb">
            <span class="breadcrumb__item">全部设备</span>
            <span class="breadcrumb__item">区域一</span>
            <span class="breadcrumb__item">一号楼</span>
          </div>
          <router-view />
        </div>
      </div>
    </el-card>
    <transition name="fade">
      <tunnel-info v-if="currentTunnelInfo" @close="closeTunnelInfo" />
    </transition>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Device } from '@/type/device'
import { Group } from '@/type/group'
import { DeviceStatus, DeviceType } from '@/dics'
import TunnelInfo from './components/TunnelInfo.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  components: {
    TunnelInfo,
    StatusBadge
  }
})
export default class extends Vue {
  private deviceStatus = DeviceStatus
  private deviceType = DeviceType
  private isExpanded = true
  private loading = false
  private currentGroupId: number | null = null
  private currentGroup: Group | null = null
  private keyword = ''
  private currentTunnelInfo: number | null = null
  private pager = {
    pageIndex: 1,
    pageSize: 10,
    total: 20
  }
  private dirDrag = {
    isDragging: false,
    start: 0,
    offset: 0,
    orginWidth: 200,
    width: 200
  }

  private groupList = [
    {
      id: 1,
      groupName: 'IPC测试组',
      inProtocol: 'ipc'
    }, {
      id: 2,
      groupName: 'RTMP测试组',
      inProtocol: 'rtmp'
    }, {
      id: 3,
      groupName: '广州电信园区',
      inProtocol: 'ipc'
    }
  ]

  private deviceList: Array<Device> = []

  private dirList = [{
    label: '区域一',
    dirId: 1,
    type: 'dir',
    children: [{
      label: '一号楼',
      dirId: 4,
      type: 'dir',
      children: [{
        label: 'NVR设备',
        deviceId: 3,
        type: 'nvr',
        children: [{
          label: '工厂园区37号楼一层A区通道No.311',
          deviceId: 4,
          type: 'ipc',
          streamStatus: 'on'
        }, {
          label: '通道2',
          deviceId: 5,
          type: 'ipc',
          streamStatus: 'off'
        }, {
          label: '通道3',
          deviceId: 6,
          type: 'ipc',
          streamStatus: 'off'
        }, {
          label: '通道4',
          deviceId: 7,
          type: 'ipc',
          streamStatus: 'on'
        }]
      }, {
        label: '设备三',
        deviceId: 4,
        type: 'ipc',
        streamStatus: 'on'
      }, {
        label: '设备四',
        deviceId: 5,
        type: 'ipc',
        streamStatus: 'off'
      }]
    }, {
      label: '二号楼',
      dirId: 3,
      type: 'dir',
      children: [{
        label: '设备一',
        deviceId: 4,
        type: 'ipc',
        streamStatus: 'on'
      }, {
        label: '设备二',
        deviceId: 4,
        type: 'ipc',
        streamStatus: 'on'
      }, {
        label: '设备三',
        deviceId: 4,
        type: 'ipc',
        streamStatus: 'on'
      }, {
        label: '设备四',
        deviceId: 4,
        type: 'ipc',
        streamStatus: 'on'
      }]
    }]
  },
  {
    label: '未分类设备',
    deviceId: 5,
    type: 'ipc',
    streamStatus: 'on'
  }]

  private mounted() {
    this.currentGroupId = 1
    this.currentGroup = this.groupList[0]
    if (!this.$route.query.groupId) {
      this.$router.push({
        name: 'device-list',
        query: {
          groupId: this.currentGroupId!.toString(),
          inProtocol: this.currentGroup!.inProtocol
        }
      })
    }
  }

  /**
   * 收起/展开目录列表
   */
  private toggledirList() {
    this.isExpanded = !this.isExpanded
  }

  /**
   * 点击目录项
   */
  private onDirItemClick(item: any) {
    let router: any
    switch (item.type) {
      case 'dir':
        router = {
          name: 'device-list',
          query: {
            id: item.dirId.toString()
          }
        }
        break
      case 'nvr':
        router = {
          name: 'device-list',
          query: {
            id: item.deviceId.toString()
          }
        }
        break
      case 'ipc':
        router = {
          name: 'device-preview',
          query: {
            deviceId: item.deviceId.toString()
          }
        }
        break
    }
    router.query.groupId = this.currentGroupId!.toString()
    router.query.inProtocol = this.currentGroup!.inProtocol
    router.query.type = item.type
    if (JSON.stringify(this.$route.query) === JSON.stringify(router.query)) return
    this.$router.push(router)
  }

  /**
   * 创建设备
   */
  private handleCreate() {
    this.$router.push('/device/create')
  }

  /**
   * 设置左侧宽度
   */
  private changeWidthStart(e: MouseEvent) {
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
    window.addEventListener('mouseup', (e) => {
      this.dirDrag.isDragging = false
    })
  }
}
</script>
<style lang="scss" scoped>
  .filter-group {
    width: 300px;
    ::v-deep .el-input--medium .el-input__inner {
      height: 50px;
      line-height: 50px;
      font-size: 18px;
    }
  }
  .device-list-wrap {
    ::v-deep .el-card__body {
      padding: 0;
    }
  }
  .device-list {
    position: relative;
    display: flex;

    &__handle {
      position: absolute;
      left: 200px;
      top: 0;
      margin-left: -8px;
      z-index: 100;
      height: 100%;
      width: 8px;
      border-right: 1px solid $borderGrey;
      transition: border .1s;
      cursor: ew-resize;

      &:hover {
        border-right-color: #ccc;
      }
    }

    &__left {
      width: 200px;
      overflow: hidden;
      transition: width .2s;

      .dir-list {
        width: 200px;
        height: 100%;
        display: flex;
        flex-direction: column;
        &__tools {
          height: 40px;
          border-bottom: 1px solid $borderGrey;
          text-align: right;
          padding-right: 5px;
          .el-button--text {
            margin: 0;
            padding: 12px 5px;
            color: $text;
            font-size: 16px;
          }
        }
        &__tree {
          padding: 10px;

          .svg-icon {
            margin-right: 5px;
          }

          .custom-tree-node {
            position: relative;
            .status-badge {
              position: absolute;
              top: -1px;
              left: -3px;
              width: 6px;
              height: 6px;
              opacity: 0.7;
            }
          }
        }
      }
      .el-tree {
        flex: 1;
        background: none;
      }
    }
    &__right {
      flex: 1;
      overflow: hidden;
      .filter-container__search-group {
        margin-right: 10px;
      }
    }
    &__container {
      padding: 15px;
    }

    &__expand {
      position: absolute;
      border: none;
      border-radius: 0;
      left: 0;
      top: 0;
      z-index: 11;
      height: 39px;
      border-right: 1px solid $borderGrey;
      font-size: 18px;
      padding: 10px 15px;
    }

    .breadcrumb {
      height: 40px;
      line-height: 40px;
      padding-left: 15px;
      border-bottom: 1px solid $borderGrey;
      transition: padding-left .2s;
      &__item:after {
        content: '/';
        color: $textGrey;
        margin: 0 10px;
      }
      &__item:last-child:after {
        content: '';
      }
    }

    &--dragging {
      cursor: ew-resize;

      .device-list__left {
        transition: none;
      }
      * {
        user-select:none;
      }
    }

    &--collapsed {
      .device-list__handle {
        display: none;
      }
      .device-list__left {
        width: 0px!important;
      }
      .breadcrumb {
        padding-left: 70px;
      }
      .device-list__expand {
        left: 1px;
        i {
          transform: rotate(180deg);
        }
      }
    }
  }
</style>
