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
      <div class="device-list" :class="{'device-list--collapsed': !isExpanded, 'device-list--dragging': folderDrag.isDragging}">
        <el-button class="device-list__expand" @click="toggleFolderList">
          <i class="el-icon-s-fold" />
        </el-button>
        <div
          class="device-list__handle"
          :style="`left: ${folderDrag.width}px`"
          @mousedown="changeWidthStart($event)"
        />
        <div ref="folderList" class="device-list__left" :style="`width: ${folderDrag.width}px`">
          <div class="folder-list" :style="`width: ${folderDrag.width}px`">
            <div class="folder-list__tools">
              <el-tooltip class="item" effect="dark" content="目录设置" placement="top">
                <el-button type="text"><i class="el-icon-setting" /></el-button>
              </el-tooltip>
            </div>
            <div class="folder-list__tree">
              <el-tree
                :data="folderList"
                node-key="id"
                highlight-current
              >
                <span slot-scope="{node, data}" class="custom-tree-node">
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
  private currentGroup: any | null = null
  private keyword = ''
  private currentTunnelInfo: number | null = null
  private pager = {
    pageIndex: 1,
    pageSize: 10,
    total: 20
  }
  private folderDrag = {
    isDragging: false,
    start: 0,
    offset: 0,
    orginWidth: 200,
    width: 200
  }

  private groupList = [
    {
      id: 1,
      groupName: 'RTMP测试组',
      inProtocol: 'rtmp'
    }, {
      id: 2,
      groupName: 'IPC测试组',
      inProtocol: 'ipc'
    }, {
      id: 3,
      groupName: '广州电信园区',
      inProtocol: 'ipc'
    }
  ]

  private deviceList: Array<Device> = []

  private folderList = [{
    label: '区域一',
    children: [{
      id: 0,
      label: '一号楼',
      children: [{
        id: 1,
        label: '设备一',
        streamStatus: 'on'
      }, {
        label: 'NVR设备',
        children: [{
          label: '工厂园区37号楼一层A区通道No.311',
          streamStatus: 'on'
        }, {
          label: '通道2',
          streamStatus: 'off'
        }, {
          label: '通道3',
          streamStatus: 'off'
        }, {
          label: '通道4',
          streamStatus: 'on'
        }]
      }, {
        label: '设备三',
        streamStatus: 'on'
      }, {
        label: '设备四',
        streamStatus: 'off'
      }]
    }, {
      label: '二号楼',
      children: [{
        label: '设备一',
        streamStatus: 'on'
      }, {
        label: '设备二',
        streamStatus: 'on'
      }, {
        label: '设备三',
        streamStatus: 'on'
      }, {
        label: '设备四',
        streamStatus: 'on'
      }]
    }]
  },
  {
    label: '区域二',
    children: [{
      id: 1,
      label: '一号楼',
      children: [{
        label: '设备一',
        streamStatus: 'on'
      }, {
        label: 'NVR设备',
        children: [{
          label: '通道1',
          streamStatus: 'on'
        }, {
          label: '通道2',
          streamStatus: 'on'
        }, {
          label: '通道3',
          streamStatus: 'on'
        }, {
          label: '通道4',
          streamStatus: 'on'
        }]
      }, {
        label: '设备三',
        streamStatus: 'on'
      }, {
        label: '设备四',
        streamStatus: 'on'
      }]
    }, {
      label: '二号楼',
      children: [{
        label: '设备一',
        streamStatus: 'on'
      }, {
        label: '设备二',
        streamStatus: 'on'
      }, {
        label: '设备三',
        streamStatus: 'on'
      }, {
        label: '设备四',
        streamStatus: 'on'
      }]
    }]
  }]

  private get isIPC() {
    return this.currentGroup ? this.currentGroup.inProtocol === 'ipc' : false
  }

  @Watch('currentGroupId')
  private onGroupChange(val: any) {
    this.currentGroup = this.groupList.find(group => group.id === val)
    if (this.currentGroup.inProtocol === 'ipc') {
      this.deviceList = [
        {
          deviceId: 374623843,
          deviceName: '一楼楼道监控',
          deviceStatus: 'on',
          streamStatus: 'on',
          deviceType: 'ipc',
          deviceVendor: '海康',
          deviceIp: '119.13.44.23',
          devicePort: 3783,
          gbId: '235433524',
          tunnelNum: null
        },
        {
          deviceId: 374623843,
          deviceName: '一楼楼道监控',
          deviceStatus: 'on',
          streamStatus: 'on',
          deviceType: 'nvr',
          deviceVendor: '海康',
          deviceIp: '119.13.44.23',
          devicePort: 3783,
          gbId: '235433524',
          tunnelNum: 120
        },
        {
          deviceId: 374623843,
          deviceName: '一楼楼道监控',
          deviceStatus: 'off',
          streamStatus: 'off',
          deviceType: 'ipc',
          deviceVendor: '海康',
          deviceIp: '119.13.44.23',
          devicePort: 3783,
          gbId: '235433524',
          tunnelNum: 120
        }
      ]
    } else {
      this.deviceList = [
        {
          deviceId: 374623843,
          deviceName: '一楼楼道监控',
          streamStatus: 'on',
          deviceVendor: '海康'
        },
        {
          deviceId: 374623843,
          deviceName: '一楼楼道监控',
          streamStatus: 'on',
          deviceVendor: '海康'
        }
      ]
    }
  }

  private mounted() {
    this.currentGroupId = 1
    this.currentGroup = this.groupList[0]
  }

  /**
   * 打开通道列表
   */
  private openTunnelInfo(device: any) {
    this.currentTunnelInfo = device.deviceId
  }

  /**
   * 关闭通道列表
   */
  private closeTunnelInfo() {
    this.currentTunnelInfo = null
  }

  /**
   * 收起/展开目录列表
   */
  private toggleFolderList() {
    this.isExpanded = !this.isExpanded
  }

  /**
   * 创建设备
   */
  private handleCreate() {
    this.$router.push('/device/create')
  }

  /**
   * 查看详情
   */
  private goToDetail(device: any) {
    this.$router.push({
      name: 'device-detail',
      params: {
        type: this.currentGroup.inProtocol
      }
    })
  }

  /**
   * 更多菜单
   */
  private handleMore(command: any) {
    switch (command.type) {
      case 'preview':
      case 'replay':
      case 'screenshot':
        this.$router.push({
          name: 'device-preview',
          params: {
            tab: command.type
          }
        })
        break
    }
  }

  private changeWidthStart(e: MouseEvent) {
    const $folderList: any = this.$refs.folderList
    this.folderDrag.isDragging = true
    this.folderDrag.start = e.x
    this.folderDrag.orginWidth = $folderList.clientWidth

    window.addEventListener('mousemove', (e) => {
      if (!this.folderDrag.isDragging) return
      this.folderDrag.offset = this.folderDrag.start - e.x
      const width = this.folderDrag.orginWidth - this.folderDrag.offset
      if (width < 50) return
      this.folderDrag.width = width
    })
    window.addEventListener('mouseup', (e) => {
      this.folderDrag.isDragging = false
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
      margin-left: -16px;
      z-index: 100;
      height: 100%;
      width: 16px;
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

      .folder-list {
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
