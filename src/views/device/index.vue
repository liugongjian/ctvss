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
      <div class="device-list" :class="{'device-list--collapsed': !isExpanded}">
        <el-button class="device-list__expand" @click="toggleFolderList">
          <i class="el-icon-s-fold" />
        </el-button>
        <div class="device-list__left">
          <div class="folder-list">
            <div class="folder-list__tools">
              <!-- <el-button class="device-list__collapse" @click="toggleFolderList(false)">jjj</el-button> -->
            </div>
            <el-tree
              :data="folderList"
              node-key="id"
              accordion
              :default-expanded-keys="[0]"
            />
          </div>
        </div>
        <div class="device-list__right">
          <div class="breadcrumb">
            <span class="breadcrumb__item">全部设备</span>
            <span class="breadcrumb__item">区域一</span>
            <span class="breadcrumb__item">一号楼</span>
          </div>
          <div class="device-list__container">
            <div class="filter-container clearfix">
              <div class="filter-container__left">
                <el-button type="primary" @click="handleCreate">添加设备</el-button>
                <el-dropdown>
                  <el-button>批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item>移动至</el-dropdown-item>
                    <el-dropdown-item>启用设备</el-dropdown-item>
                    <el-dropdown-item>停用设备</el-dropdown-item>
                    <el-dropdown-item>启用流</el-dropdown-item>
                    <el-dropdown-item>停用流</el-dropdown-item>
                    <el-dropdown-item>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <div class="filter-container__right">
                <el-input v-model="keyword" class="filter-container__search-group" placeholder="请输入关键词">
                  <el-button slot="append" class="el-button-rect" icon="el-icon-search" />
                </el-input>
                <el-button class="el-button-rect" icon="el-icon-refresh" />
              </div>
            </div>
            <el-table v-loading="loading" :data="deviceList" fit>
              <el-table-column type="selection" width="55" />
              <el-table-column label="设备ID/名称" min-width="200">
                <template slot-scope="{row}">
                  <router-link to="/">{{ row.deviceId }}</router-link>
                  <div>
                    {{ row.deviceName }}
                    <el-tooltip v-if="row.deviceType !== 'nvr'" class="item" effect="dark" content="监控预览" placement="top">
                      <router-link to="/device/preview"><i class="el-icon-video-camera" /></router-link>
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>
              <el-table-column v-if="isIPC" label="设备状态">
                <template slot-scope="{row}">
                  <status-badge :status="row.deviceStatus" />
                  {{ deviceStatus[row.deviceStatus] }}
                </template>
              </el-table-column>
              <el-table-column label="流状态">
                <template slot-scope="{row}">
                  <status-badge :status="row.streamStatus" />
                  {{ deviceStatus[row.streamStatus] }}
                </template>
              </el-table-column>
              <el-table-column v-if="isIPC" label="类型">
                <template slot-scope="{row}">
                  {{ deviceType[row.deviceType] }}
                </template>
              </el-table-column>
              <el-table-column label="厂商" prop="deviceVendor" />
              <el-table-column v-if="isIPC" label="设备地址" min-width="150">
                <template slot-scope="{row}">
                  {{ row.deviceIp }}:{{ row.devicePort }}
                </template>
              </el-table-column>
              <el-table-column v-if="isIPC" label="国标ID" prop="gbId" min-width="150" />
              <el-table-column v-if="isIPC" label="通道数">
                <template slot-scope="{row}">
                  <el-button v-if="row.tunnelNum" type="text" @click="openTunnelInfo(row)">{{ row.tunnelNum || '-' }}</el-button>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="270" fixed="right">
                <template slot-scope="scope">
                  <el-button v-if="isIPC && scope.row.tunnelNum" type="text" @click="openTunnelInfo(scope.row)">查看通道</el-button>
                  <el-button type="text" @click="goToDetail(scope.row)">设备详情</el-button>
                  <el-button type="text">启用设备</el-button>
                  <el-dropdown @command="handleMore">
                    <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item :command="{type: 'preview', device: scope.row}">监控预览</el-dropdown-item>
                      <el-dropdown-item :command="{type: 'replay', device: scope.row}">录制回放</el-dropdown-item>
                      <el-dropdown-item :command="{type: 'screenshot', device: scope.row}">查看截图</el-dropdown-item>
                      <el-dropdown-item>停用流</el-dropdown-item>
                      <el-dropdown-item>移动至</el-dropdown-item>
                      <el-dropdown-item>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              :current-page="pager.pageIndex"
              :page-size="pager.pageSize"
              :total="pager.total"
            />
          </div>
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

  private deviceList: any = []

  private folderList = [{
    id: 0,
    label: '全部设备',
    children: [{
      label: '区域一',
      children: [{
        label: '一号楼'
      }, {
        label: '二号楼'
      }, {
        label: '三号楼'
      }, {
        label: '四号楼'
      }]
    }, {
      label: '区域二',
      children: [{
        label: '五号楼'
      }, {
        label: '六号楼'
      }, {
        label: '七号楼'
      }, {
        label: '八号楼'
      }]
    }, {
      label: '区域三'
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
          devicePort: '3783',
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
          devicePort: '3783',
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
          devicePort: '3783',
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
    &__left {
      width: 180px;
      overflow: hidden;
      border-right: 1px solid $borderGrey;
      transition: width .2s;

      .folder-list {
        width: 180px;
        &__tools {
          height: 40px;
          border-bottom: 1px solid $borderGrey;
        }
      }
      .el-tree {
        margin: 10px;
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

    &--collapsed {
      .device-list__left {
        width: 0px;
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
