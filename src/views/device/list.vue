<template>
  <div class="device-list__container">
    <div v-if="isNVR" class="device-info" :loading="loading.info">
      <info-list v-if="deviceInfo" label-width="80">
        <info-list-item label="设备名称:">{{ deviceInfo.deviceName }}</info-list-item>
        <info-list-item label="国标ID:">{{ deviceInfo.gbId }}</info-list-item>
        <info-list-item label="设备状态:">
          <status-badge :status="deviceInfo.deviceStatus" />
          {{ deviceStatus[deviceInfo.deviceStatus] }}
        </info-list-item>
        <info-list-item label="创建时间:">{{ deviceInfo.createdTime }}</info-list-item>
        <info-list-item label="通道数量:">{{ deviceInfo.deviceStats.channelSize }}</info-list-item>
        <info-list-item label="在线流数量:">{{ deviceInfo.deviceStats.onlineSize }}</info-list-item>
      </info-list>
    </div>
    <div class="filter-container clearfix">
      <div class="filter-container__left">
        <el-button v-if="isDir || deviceInfo && deviceInfo.createSubDevice === 2" type="primary" @click="goToCreate">{{ isNVR ? '添加子设备' : '添加设备' }}</el-button>
        <el-button v-if="isNVR" @click="goToDetail(deviceInfo)">查看NVR设备详情</el-button>
        <el-button v-if="isNVR" @click="goToUpdate(deviceInfo)">编辑NVR设备</el-button>
        <el-button disabled>导出</el-button>
        <el-dropdown>
          <el-button disabled>批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="!isNVR">移动至</el-dropdown-item>
            <el-dropdown-item>启用流</el-dropdown-item>
            <el-dropdown-item>停用流</el-dropdown-item>
            <el-dropdown-item>删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="filter-container__right">
        <el-input v-show="false" v-model="keyword" class="filter-container__search-group" placeholder="请输入关键词">
          <el-button slot="append" class="el-button-rect" icon="el-icon-search" />
        </el-input>
        <el-button class="el-button-rect" @click="init"><svg-icon name="refresh" /></el-button>
      </div>
    </div>
    <el-table v-loading="loading.list || loading.info" :data="deviceList" empty-text="暂无设备" fit class="device-list__table" @row-click="rowClick">
      <el-table-column type="selection" width="55" />
      <el-table-column v-if="isGb && isNVR" label="通道号/通道名称" min-width="200">
        <template slot-scope="{row}">
          <div class="device-list__device-name">
            <div class="device-list__device-id">{{ row.channelNum }}</div>
            <div>
              {{ row.channelName }} <i class="el-icon-video-camera" />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="isGb && !isNVR" label="设备ID/名称" min-width="200">
        <template slot-scope="{row}">
          <div class="device-list__device-name">
            <div class="device-list__device-id">{{ row.deviceId }}</div>
            <div>
              {{ row.deviceName }} <i class="el-icon-video-camera" />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="isGb && !isNVR" key="deviceType" label="类型">
        <template slot-scope="{row}">
          {{ deviceType[row.deviceType] }}
        </template>
      </el-table-column>
      <el-table-column v-if="isGb" key="deviceStatus" label="设备状态">
        <template slot-scope="{row}">
          <status-badge :status="row.deviceStatus" />
          {{ deviceStatus[row.deviceStatus] || '-' }}
        </template>
      </el-table-column>
      <el-table-column key="streamStatus" prop="streamStatus" label="流状态">
        <template slot-scope="{row}">
          <status-badge :status="row.streamStatus" />
          {{ deviceStatus[row.streamStatus] || '-' }}
        </template>
      </el-table-column>
      <el-table-column key="deviceVendor" prop="deviceVendor" label="厂商">
        <template slot-scope="{row}">
          {{ row.deviceVendor || '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="isGb && !isNVR" key="deviceIp" label="设备IP" min-width="130">
        <template slot-scope="{row}">
          {{ row.deviceIp || '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="isGb && !isNVR" key="devicePort" label="设备端口">
        <template slot-scope="{row}">
          {{ row.devicePort || '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="isGb || isNVR" key="gbId" prop="gbId" label="国标ID" min-width="190">
        <template slot-scope="{row}">
          {{ row.gbId || '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="isGb || !isNVR" key="sipTransType" prop="sipTransType" label="信令传输模式" min-width="110">
        <template slot-scope="{row}">
          {{ sipTransType[row.sipTransType] || '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="isGb || !isNVR" key="streamTransType" prop="streamTransType" label="流传输模式" min-width="110">
        <template slot-scope="{row}">
          {{ streamTransType[row.streamTransType] || '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="isGb || !isNVR" key="transPriority" prop="transPriority" label="优先TCP传输" min-width="110">
        <template slot-scope="{row}">
          {{ transPriority[row.transPriority] || '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="isGb && !isNVR" key="tunnelNum" prop="tunnelNum" label="通道数">
        <template slot-scope="{row}">
          {{ row.deviceStats.channelSize || '-' }}
        </template>
      </el-table-column>
      <el-table-column key="createdTime" label="创建时间" min-width="180">
        <template slot-scope="{row}">
          {{ row.createdTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="action" width="270" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" :disabled="scope.row.deviceType === 'nvr'" @click="goToPreview('preview', scope.row)">实时预览</el-button>
          <el-button type="text" :disabled="scope.row.deviceType === 'nvr'" @click="goToPreview('replay', scope.row)">录像回放</el-button>
          <el-button type="text" disabled @click="goToPreview('snapshot', scope.row)">查看截图</el-button>
          <el-dropdown @command="handleMore">
            <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="isGb && scope.row.deviceType === 'nvr'" :command="{type: 'nvr', device: scope.row}">查看通道</el-dropdown-item>
              <el-dropdown-item v-if="isGb && isNVR" :command="{type: 'detail', device: scope.row}">通道详情</el-dropdown-item>
              <el-dropdown-item v-else :command="{type: 'detail', device: scope.row}">设备详情</el-dropdown-item>
              <el-dropdown-item v-if="scope.row.streamStatus === 'on'" :command="{type: 'stopDevice', device: scope.row}">停用流</el-dropdown-item>
              <el-dropdown-item v-else :command="{type: 'startDevice', device: scope.row}">启用流</el-dropdown-item>
              <el-dropdown-item v-if="!isNVR && scope.row.parentDeviceId === '-1'" :command="{type: 'move', device: scope.row}">移动至</el-dropdown-item>
              <el-dropdown-item v-if="(isNVR && !isCreateSubDevice) || (!isNVR && scope.row.createSubDevice !== 1)" :command="{type: 'update', device: scope.row}">编辑</el-dropdown-item>
              <el-dropdown-item :command="{type: 'delete', device: scope.row}">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="isDir"
      :current-page="pager.pageNum"
      :page-size="pager.pageSize"
      :total="pager.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <move-dir v-if="dialog.moveDir" :device="currentDevice" @on-close="closeDialog('moveDir', ...arguments)" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Inject } from 'vue-property-decorator'
import { Device } from '@/type/device'
import { DeviceStatus, DeviceType, SipTransType, StreamTransType, TransPriority } from '@/dics'
import StatusBadge from '@/components/StatusBadge/index.vue'
import MoveDir from './components/dialogs/MoveDir.vue'
import { getDevice, getDevices, getChannels, deleteDevice, startDevice, stopDevice } from '@/api/device'

@Component({
  name: 'DeviceList',
  components: {
    StatusBadge,
    MoveDir
  }
})
export default class extends Vue {
  @Inject('deviceRouter')
  private deviceRouter!: Function

  private deviceStatus = DeviceStatus
  private deviceType = DeviceType
  private sipTransType = SipTransType
  private streamTransType = StreamTransType
  private transPriority = TransPriority
  private loading = {
    info: false,
    list: false
  }
  private dialog = {
    moveDir: false
  }
  private keyword = ''
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private deviceInfo: any = null
  private deviceList: Array<Device> = []
  private currentDevice?: Device | null = null

  private get isGb() {
    return this.$route.query.inProtocol === 'gb28181'
  }

  private get type() {
    return this.$route.query.type
  }

  private get isNVR() {
    return this.$route.query.type === 'nvr'
  }

  private get isIPC() {
    return this.$route.query.type === 'ipc'
  }

  private get isDir() {
    return this.$route.query.type === 'dir'
  }

  private get groupId() {
    return this.$route.query.groupId
  }

  private get isCreateSubDevice() {
    return this.deviceInfo && this.deviceInfo.createSubDevice === 1
  }

  private get dirId() {
    return this.$route.query.dirId ? this.$route.query.dirId : 0
  }

  private get deviceId() {
    return this.$route.query.deviceId
  }

  @Watch('$route.query')
  private onRouterChange() {
    this.deviceInfo = null
    this.deviceList = []
    this.init()
  }

  private mounted() {
    this.init()
  }

  private init() {
    if (!this.groupId) return
    switch (this.type) {
      case 'ipc':
      case 'nvr':
        if (!this.deviceId) return
        this.getDeviceInfo(this.type)
        break
      case 'dir':
      default:
        this.getDeviceList()
        break
    }
  }

  /**
   * 获取设备信息
   */
  private async getDeviceInfo(type: string) {
    try {
      this.loading.info = true
      const res = await getDevice({
        deviceId: this.deviceId
      })
      if (type === 'nvr') {
        this.deviceInfo = res
        this.deviceList = this.deviceInfo.deviceChannels.map((channel: any) => {
          channel.deviceType = 'ipc'
          channel.transPriority = this.deviceInfo.transPriority
          channel.sipTransType = this.deviceInfo.sipTransType
          channel.streamTransType = this.deviceInfo.streamTransType
          return channel
        })
      } else if (type === 'ipc') {
        this.deviceInfo = null
        if (res.parentDeviceId !== '-1' && res.deviceChannels.length) {
          res.deviceName = res.deviceChannels[0].channelName
        }
        this.deviceList = [ res ]
      }
    } catch (e) {
      this.deviceInfo = null
      this.deviceList = []
    } finally {
      this.loading.info = false
    }
  }

  /**
   * 加载设备列表
   */
  private async getDeviceList() {
    try {
      let params: any = {
        groupId: this.groupId,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      let res: any
      this.loading.list = true
      params.dirId = this.dirId ? this.dirId : 0
      res = await getDevices(params)
      this.deviceList = res.devices
      this.pager = {
        pageNum: res.pageNum,
        pageSize: res.pageSize,
        total: res.totalNum
      }
    } catch (e) {
      this.deviceList = []
    } finally {
      this.loading.list = false
    }
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getDeviceList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getDeviceList()
  }

  /**
   * 创建设备
   */
  private goToCreate() {
    this.deviceRouter({
      id: this.dirId,
      deviceId: this.deviceId,
      type: 'create',
      isChannel: this.isNVR
    })
  }

  /**
   * 根据类型进入下一级页面
   */
  private rowClick(device: Device, column: any, event: any) {
    if (column.property !== 'action') {
      const type = device.deviceType === 'ipc' ? 'detail' : device.deviceType
      this.deviceRouter({
        id: device.deviceId,
        type
      })
    }
  }

  /**
   * 预览
   */
  private goToPreview(previewTab: string, device: Device) {
    this.deviceRouter({
      id: device.deviceId,
      type: 'preview',
      previewTab
    })
  }

  /**
   * 查看设备详情
   */
  private goToDetail(device: Device) {
    this.deviceRouter({
      id: device.deviceId,
      type: 'detail'
    })
  }

  /**
   * 编辑设备
   */
  private goToUpdate(device: Device) {
    this.deviceRouter({
      id: device.deviceId,
      type: 'update'
    })
  }

  /**
   * 删除设备
   */
  private deleteDevice(device: Device) {
    this.$alertDelete({
      type: '设备',
      msg: `是否确认删除设备"${device.deviceName}"`,
      method: deleteDevice,
      payload: { deviceId: device.deviceId },
      onSuccess: this.getDeviceList
    })
  }

  /**
   * 启动设备
   */
  private async startDevice(device: Device) {
    try {
      const params: any = {
        deviceId: device.deviceId
      }
      await startDevice(params)
      this.$message.success('已通知启用设备')
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 停用设备
   */
  private async stopDevice(device: Device) {
    try {
      const params: any = {
        deviceId: device.deviceId
      }
      await stopDevice(params)
      this.$message.success('已通知停用设备')
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 打开对话框
   */
  private openDialog(type: string, payload: any) {
    switch (type) {
      case 'moveDir':
        this.currentDevice = payload
        this.dialog.moveDir = true
        break
    }
  }

  /**
   * 关闭对话框
   */
  private closeDialog(type: string, payload: any) {
    // @ts-ignore
    this.dialog[type] = false
    switch (type) {
      case 'moveDir':
        this.currentDevice = null
    }
    if (payload) {
      this.getDeviceList()
    }
  }

  /**
   * 更多菜单
   */
  private handleMore(command: any) {
    console.log(command.device)
    switch (command.type) {
      case 'detail':
        this.deviceRouter({
          id: command.device.deviceId,
          type: 'detail'
        })
        break
      case 'update':
        this.deviceRouter({
          id: command.device.deviceId,
          type: 'update'
        })
        break
      case 'delete':
        this.deleteDevice(command.device)
        break
      case 'nvr':
        this.deviceRouter({
          id: command.device.deviceId,
          type: 'nvr'
        })
        break
      case 'move':
        this.openDialog('moveDir', command.device)
        break
      case 'startDevice':
        this.startDevice(command.device)
        break
      case 'stopDevice':
        this.stopDevice(command.device)
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
    &__device-id {
      color: $primary;
    }
  }
  .device-list__table {
    ::v-deep .el-table__body td {
      cursor: pointer;
    }
  }
  .device-info {
    background: #f6f6f6;
    border-radius: 4px;
    margin-bottom: 15px;
    padding: 5px 15px;
    ::v-deep .info-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      .info-item {
        width: 33%;
        padding: 10px 0;
      }
    }
  }
</style>
