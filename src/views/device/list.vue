<template>
  <div class="device-list__container">
    <div class="filter-container clearfix">
      <div class="filter-container__left">
        <el-button type="primary" @click="handleCreate">{{ isNVR ? '添加子设备' : '添加设备' }}</el-button>
        <el-dropdown>
          <el-button>批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="!isNVR">移动至</el-dropdown-item>
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
          <div class="device-list__device-name">
            <div class="device-list__device-id">{{ row.deviceId }}</div>
            <div @click="goToPreview('preview', row)">
              {{ row.deviceName }} <i class="el-icon-video-camera" />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="isIPC" label="类型">
        <template slot-scope="{row}">
          {{ deviceType[row.deviceType] }}
        </template>
      </el-table-column>
      <el-table-column v-if="isIPC" label="设备状态">
        <template slot-scope="{row}">
          <status-badge :status="row.deviceStatus" />
          {{ deviceStatus[row.deviceStatus] }}
        </template>
      </el-table-column>
      <el-table-column prop="streamStatus" label="流状态">
        <template slot-scope="{row}">
          <status-badge :status="row.streamStatus" />
          {{ deviceStatus[row.streamStatus] }}
        </template>
      </el-table-column>
      <el-table-column label="厂商" prop="deviceVendor" />
      <el-table-column v-if="isIPC || isNVR" label="设备地址" min-width="150">
        <template slot-scope="{row}">
          {{ row.deviceIp }}:{{ row.devicePort }}
        </template>
      </el-table-column>
      <el-table-column v-if="isIPC || isNVR" label="国标ID" prop="gbId" min-width="150" />
      <el-table-column v-if="isIPC && !isNVR" label="通道数">
        <template slot-scope="{row}">
          <el-button v-if="row.tunnelNum" type="text" @click="goToNVR(row)">{{ row.tunnelNum || '-' }}</el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="270" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="goToPreview('preview', scope.row)">监控预览</el-button>
          <el-button type="text" @click="goToPreview('replay', scope.row)">录制回放</el-button>
          <el-button type="text" @click="goToPreview('snapshot', scope.row)">查看截图</el-button>
          <el-dropdown @command="handleMore">
            <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="isIPC && !isNVR" :command="{type: 'nvr', device: scope.row}">查看通道</el-dropdown-item>
              <el-dropdown-item :command="{type: 'detail'}">设备详情</el-dropdown-item>
              <el-dropdown-item>停用流</el-dropdown-item>
              <el-dropdown-item v-if="!isNVR">移动至</el-dropdown-item>
              <el-dropdown-item :command="{type: 'edit', device: scope.row}">编辑</el-dropdown-item>
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
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Device } from '@/type/device'
import { DeviceStatus, DeviceType } from '@/dics'
import TunnelInfo from './components/TunnelInfo.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { getDevices } from '@/api/device'

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

  private deviceList: Array<Device> = []

  private get isIPC() {
    return this.$route.query.inProtocol === 'ipc'
  }

  private get isNVR() {
    return this.$route.query.type === 'nvr'
  }

  @Watch('$route.query')
  private onRouterChange() {
    console.log('change')
    this.init()
  }

  private mounted() {
    this.init()
  }

  private init() {
    if (this.isNVR) {
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
    }
  }

  /**
   * 创建设备
   */
  private handleCreate() {
    this.$router.push({
      name: 'device-create',
      query: this.$route.query
    })
  }

  /**
   * 预览
   */
  private goToPreview(type: string, device: Device) {
    this.$router.push({
      name: 'device-preview',
      params: {
        tab: type
      },
      query: {
        id: device.deviceId.toString(),
        groupId: this.$route.query.groupId
      }
    })
  }

  /**
   * 打开通道列表
   */
  private goToNVR(device: Device) {
    this.$router.push({
      name: 'device-list',
      query: {
        id: device.deviceId.toString(),
        groupId: this.$route.query.groupId,
        inProtocol: this.$route.query.inProtocol,
        type: 'nvr'
      }
    })
  }

  /**
   * 更多菜单
   */
  private handleMore(command: any) {
    console.log(command.device)
    switch (command.type) {
      case 'detail':
        this.$router.push({
          name: 'device-detail',
          params: {
            type: this.currentGroup.inProtocol
          }
        })
        break
      case 'edit':
        this.$router.push({
          name: 'device-update',
          params: {
            deviceId: command.device.deviceId
          }
        })
        break
      case 'nvr':
        this.goToNVR(command.device)
        break
    }
  }
}
</script>
<style lang="scss" scoped>
  .filter-container__search-group {
    margin-right: 10px;
  }

  .device-list {
    &__device-name {
      cursor: pointer;
    }
    &__device-id {
      color: $primary;
    }
  }
</style>
