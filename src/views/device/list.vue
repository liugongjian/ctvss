<template>
  <div class="device-list__container">
    <div v-if="isNVR" v-loading="loading.info" class="device-info">
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
    <div v-if="isPlatform" v-loading="loading.info" class="device-info">
      <info-list v-if="deviceInfo" label-width="80">
        <info-list-item label="平台名称:">{{ deviceInfo.deviceName }}</info-list-item>
        <info-list-item label="国标ID:">{{ deviceInfo.gbId }}</info-list-item>
        <info-list-item label="设备状态:">
          <status-badge :status="deviceInfo.deviceStatus" />
          {{ deviceStatus[deviceInfo.deviceStatus] }}
        </info-list-item>
        <info-list-item label="创建时间:">{{ deviceInfo.createdTime }}</info-list-item>
      </info-list>
    </div>
    <div v-if="false" v-loading="loading.list" class="device-info">
      <info-list v-if="dirStats" label-width="80">
        <info-list-item label="设备总数:">{{ dirStats.deviceSize }}</info-list-item>
        <info-list-item label="IPC数量:">{{ dirStats.ipcSize }}</info-list-item>
        <info-list-item label="NVR数量:">
          <span v-for="state in renderNvrSize(dirStats)" :key="state.label">
            {{ state.label }}({{ state.value }})
          </span>
        </info-list-item>
        <info-list-item label="平台数量:">
          <span v-for="state in renderPlatformSize(dirStats)" :key="state.label">
            {{ state.label }}({{ state.value }})
          </span>
        </info-list-item>
      </info-list>
    </div>
    <div class="filter-container clearfix">
      <div class="filter-container__left">
        <el-button v-if="isDir || deviceInfo && deviceInfo.createSubDevice === 2" type="primary" @click="goToCreate">{{ isNVR ? '添加子设备' : '添加设备' }}</el-button>
        <el-button v-if="isNVR" @click="goToDetail(deviceInfo)">查看NVR设备详情</el-button>
        <el-button v-if="isNVR" @click="goToUpdate(deviceInfo)">编辑NVR设备</el-button>
        <el-button v-if="isPlatform" @click="goToDetail(deviceInfo)">查看Platform详情</el-button>
        <el-button v-if="isPlatform" @click="goToUpdate(deviceInfo)">编辑Platform</el-button>
        <el-button v-if="isPlatform" :loading="loading.syncDevice" @click="syncDevice">同步</el-button>
        <el-button :disabled="!selectedDeviceList.length" @click="exportCsv">导出</el-button>
        <el-dropdown placement="bottom" @command="handleBatch">
          <el-button :disabled="!selectedDeviceList.length">批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="!isNVR" command="move">移动至</el-dropdown-item>
            <el-dropdown-item command="startDevice">启用流</el-dropdown-item>
            <el-dropdown-item command="stopDevice">停用流</el-dropdown-item>
            <el-dropdown-item command="delete">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="filter-container__right">
        <el-input v-show="false" v-model="keyword" class="filter-container__search-group" placeholder="请输入关键词">
          <el-button slot="append" class="el-button-rect"><svg-icon name="search" /></el-button>
        </el-input>
        <el-button class="el-button-rect" @click="init"><svg-icon name="refresh" /></el-button>
      </div>
    </div>
    <div v-if="hasFiltered" class="filter-container filter-buttons">
      <div v-for="{key, value} in filterButtons" :key="key" class="filter-button" @click="clearFilter(key)">
        <label>{{ deviceParams[key] }}</label>
        <span v-if="key === 'deviceType'">{{ deviceType[value] }}</span>
        <span v-if="key === 'deviceStatus'">{{ deviceStatus[value] }}</span>
        <span v-if="key === 'streamStatus'">{{ streamStatus[value] }}</span>
        <svg-icon class="filter-button__close" name="close" width="10" height="10" />
      </div>
    </div>
    <div v-loading="loading.list || loading.info" class="device-list__wrap">
      <el-table v-show="deviceList.length" ref="deviceTable" :data="deviceList" empty-text="暂无设备" fit class="device-list__table" @row-click="rowClick" @selection-change="handleSelectionChange" @filter-change="filterChange">
        <el-table-column type="selection" prop="selection" class-name="col-selection" width="55" />
        <el-table-column label="设备ID/名称" min-width="200">
          <template slot-scope="{row}">
            <div class="device-list__device-name">
              <div class="device-list__device-id">{{ row.deviceId }}</div>
              <div>{{ row.deviceName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="isNVR" label="通道号" min-width="100">
          <template slot-scope="{row}">
            {{ 'D' + row.channelNum }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isNVR"
          key="deviceType"
          column-key="deviceType"
          prop="deviceType"
          label="类型"
          :filters="filtersArray.deviceType"
          :filter-multiple="false"
        >
          <template slot="header">
            <span class="filter">类型</span>
            <svg-icon class="filter" name="filter" width="15" height="15" />
          </template>
          <template slot-scope="{row}">
            {{ deviceType[row.deviceType] }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="isGb"
          key="deviceStatus"
          column-key="deviceStatus"
          label="设备状态"
          min-width="110"
          :filters="filtersArray.deviceStatus"
          :filter-multiple="false"
        >
          <template slot="header">
            <span class="filter">设备状态</span>
            <svg-icon class="filter" name="filter" width="15" height="15" />
          </template>
          <template slot-scope="{row}">
            <status-badge :status="row.deviceStatus" />
            {{ deviceStatus[row.deviceStatus] || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          key="streamStatus"
          column-key="streamStatus"
          prop="streamStatus"
          label="流状态"
          min-width="110"
          :filters="filtersArray.streamStatus"
          :filter-multiple="false"
        >
          <template slot="header">
            <span class="filter">流状态</span>
            <svg-icon class="filter" name="filter" width="15" height="15" />
          </template>
          <template slot-scope="{row}">
            <status-badge :status="row.streamStatus" />
            {{ streamStatus[row.streamStatus] || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          key="recordStatus"
          column-key="recordStatus"
          prop="recordStatus"
          label="流状态"
          min-width="110"
          :filters="filtersArray.recordStatus"
          :filter-multiple="false"
        >
          <template slot="header">
            <span class="filter">录制状态</span>
            <svg-icon class="filter" name="filter" width="15" height="15" />
          </template>
          <template slot-scope="{row}">
            <status-badge :status="row.recordStatus === 0 ? 'red' : ''" />
            {{ recordStatus[row.recordStatus] || '-' }}
          </template>
        </el-table-column>
        <el-table-column key="deviceVendor" prop="deviceVendor" label="厂商">
          <template slot-scope="{row}">
            {{ row.deviceVendor || '-' }}
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
            {{ row.deviceStats && row.deviceStats.channelSize || '-' }}
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
        <el-table-column key="createdTime" label="创建时间" min-width="180">
          <template slot-scope="{row}">
            {{ row.createdTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="action" class-name="col-action" width="270" fixed="right">
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
                <el-dropdown-item v-if="scope.row.recordStatus === 0" :command="{type: 'stopRecord', device: scope.row}">停止录像</el-dropdown-item>
                <el-dropdown-item v-else :command="{type: 'startRecord', device: scope.row}">开始录像</el-dropdown-item>
                <el-dropdown-item v-if="!isNVR && scope.row.parentDeviceId === '-1'" :command="{type: 'move', device: scope.row}">移动至</el-dropdown-item>
                <el-dropdown-item v-if="(isNVR && !isCreateSubDevice) || (!isNVR && scope.row.createSubDevice !== 1)" :command="{type: 'update', device: scope.row}">编辑</el-dropdown-item>
                <el-dropdown-item :command="{type: 'delete', device: scope.row}">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="deviceList.length && (isDir || isPlatformDir)"
        :current-page="pager.pageNum"
        :page-size="pager.pageSize"
        :total="pager.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <div v-if="!deviceList.length && !loading.list" class="device-list__empty-text">
        当前{{ isNVR ? 'NVR' : '目录' }}暂无设备
      </div>
    </div>
    <move-dir v-if="dialog.moveDir" :device="currentDevice" :devices="selectedDeviceList" :is-batch="isBatchMoveDir" @on-close="closeDialog('moveDir', ...arguments)" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Inject } from 'vue-property-decorator'
import { ExportToCsv } from 'export-to-csv'
import { GroupModule } from '@/store/modules/group'
import { Device } from '@/type/device'
import { DeviceParams, DeviceStatus, StreamStatus, RecordStatus, DeviceType, SipTransType, StreamTransType, TransPriority } from '@/dics'
import StatusBadge from '@/components/StatusBadge/index.vue'
import MoveDir from './components/dialogs/MoveDir.vue'
import { getDevice, getDevices, deleteDevice, startDevice, stopDevice, startRecord, stopRecord, syncDevice } from '@/api/device'

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
  @Inject('initDirs')
  private initDirs!: Function

  private deviceParams = DeviceParams
  private deviceStatus = DeviceStatus
  private streamStatus = StreamStatus
  private recordStatus = RecordStatus
  private deviceType = DeviceType
  private sipTransType = SipTransType
  private streamTransType = StreamTransType
  private transPriority = TransPriority
  private loading = {
    info: false,
    list: false,
    syncDevice: false
  }
  private dialog = {
    moveDir: false
  }
  private keyword = ''
  private filter: any = {
    deviceType: '',
    deviceStatus: '',
    streamStatus: ''
  }
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private deviceInfo: any = null
  private deviceList: Array<Device> = []
  private dirStats: any = null
  private selectedDeviceList: Array<Device> = []
  private currentDevice?: Device | null = null
  // 是否批量移动
  private isBatchMoveDir = false
  // 筛选类型
  private filtersArray = {
    deviceType: this.dictToFilterArray(DeviceType),
    deviceStatus: this.dictToFilterArray(DeviceStatus),
    streamStatus: this.dictToFilterArray(StreamStatus),
    recordStatus: this.dictToFilterArray(RecordStatus)
  }

  private get inProtocol() {
    return this.$route.query.inProtocol
  }

  private get isGb() {
    return this.$route.query.inProtocol === 'gb28181'
  }

  private get type() {
    return this.$route.query.type
  }

  private get isNVR() {
    return this.$route.query.type === 'nvr'
  }

  private get isPlatform() {
    return this.$route.query.type === 'platform'
  }

  private get isIPC() {
    return this.$route.query.type === 'ipc'
  }

  private get isDir() {
    return this.$route.query.type === 'dir'
  }

  private get isPlatformDir() {
    return this.$route.query.type === 'platformDir'
  }

  private get groupId() {
    return GroupModule.group?.groupId
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

  private get hasFiltered() {
    return !!(this.filter.deviceType || this.filter.deviceStatus || this.filter.streamStatus)
  }

  private get filterButtons() {
    const buttons = []
    for (let key in this.filter) {
      const value = this.filter[key]
      if (value) {
        buttons.push({
          key,
          value
        })
      }
    }
    return buttons
  }

  @Watch('$route.query')
  private onRouterChange() {
    this.deviceInfo = null
    this.deviceList = []
    this.init()
  }

  @Watch('groupId')
  private onGroupIdChange() {
    this.deviceInfo = null
    this.deviceList = []
    this.init()
  }

  @Watch('filter', { immediate: true, deep: true })
  private onFilterChange() {
    (this.type === 'dir' || this.type === 'platformDir') && this.getDeviceList()
  }

  private mounted() {
    this.init()
  }

  private init() {
    if (!this.groupId || !this.inProtocol) return
    switch (this.type) {
      case 'platform':
        this.getDeviceInfo(this.type)
        this.getDeviceList()
        break
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
      if (type === 'nvr' || type === 'platform') {
        this.deviceInfo = res
        const deviceList = this.deviceInfo.deviceChannels.map((channel: any) => {
          channel.deviceType = 'ipc'
          channel.transPriority = this.deviceInfo.transPriority
          channel.sipTransType = this.deviceInfo.sipTransType
          channel.streamTransType = this.deviceInfo.streamTransType
          channel.deviceName = channel.channelName
          return channel
        })
        if (type === 'nvr') {
          this.deviceList = deviceList.sort((left: any, right: any) => left.channelNum - right.channelNum)
        } else {
          this.deviceList = deviceList
        }
      } else if (type === 'ipc') {
        this.deviceInfo = null
        if (res.parentDeviceId !== '-1' && res.deviceChannels.length) {
          res.deviceId = res.deviceChannels[0].deviceId
          res.deviceName = res.deviceChannels[0].channelName
          console.log(res)
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
        pageSize: this.pager.pageSize,
        deviceType: this.filter.deviceType,
        deviceStatus: this.filter.deviceStatus,
        streamStatus: this.filter.streamStatus
      }
      let res: any
      this.loading.list = true
      params.dirId = this.dirId ? this.dirId : 0
      res = await getDevices(params)
      this.deviceList = res.devices
      this.dirStats = res.dirStats
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
  private rowClick(device: Device, column: any) {
    if (column.property !== 'action' && column.property !== 'selection') {
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
      onSuccess: () => {
        this.getDeviceList()
        this.initDirs()
      }
    })
  }

  /**
   * 批量删除设备
   */
  private batchDeleteDevice() {
    const h: Function = this.$createElement
    this.$alertDelete({
      type: '设备',
      msg: h('div', undefined, [
        h(
          'span',
          undefined,
          '删除操作不能恢复，确定要删除选中的设备吗？'
        ),
        h(
          'div',
          { class: 'batch-device-list' },
          this.selectedDeviceList.map((device: Device) => {
            return h('p', undefined, [
              h('span', { class: 'device-name' }, device.deviceName)
            ])
          })
        )
      ]),
      method: () => {
        return Promise.all(
          this.selectedDeviceList.map((device: Device) => {
            return deleteDevice({
              deviceId: device.deviceId
            })
          })
        )
      },
      payload: null,
      onSuccess: () => {
        this.getDeviceList()
        this.initDirs()
      }
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
      this.$message.success('已通知停用录制')
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 开始录像
   */
  private async startRecord(device: Device) {
    try {
      const params: any = {
        deviceId: device.deviceId
      }
      await startRecord(params)
      this.$message.success('已通知开始录制')
      this.init()
    } catch (e) {
      this.$message.error(e.message)
      console.error(e)
    }
  }

  /**
   * 停止录像
   */
  private async stopRecord(device: Device) {
    try {
      const params: any = {
        deviceId: device.deviceId,
        recordTaskId: device.recordTaskId
      }
      await stopRecord(params)
      this.$message.success('已通知停止录像')
      this.init()
    } catch (e) {
      this.$message.error(e.message)
      console.error(e)
    }
  }

  /**
   * 批量启用/停用设备
   */
  private batchStartOrStopDevice(type: string) {
    const method = type === 'start' ? startDevice : stopDevice
    const methodStr = type === 'start' ? '启用' : '停用'
    const h: Function = this.$createElement
    this.$msgbox({
      title: `确认${methodStr}选中的设备吗？`,
      message: h('div', undefined, [
        h(
          'div',
          { class: 'batch-device-list' },
          this.selectedDeviceList.map((device: Device) => {
            return h('p', undefined, [
              h('span', { class: 'device-name' }, device.deviceName)
            ])
          })
        )
      ]),
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      beforeClose: async(action: any, instance: any, done: Function) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          instance.confirmButtonText = '...'
          try {
            await Promise.all(this.selectedDeviceList.map((device: Device) => {
              return method({
                deviceId: device.deviceId
              })
            }))
            done()
          } catch (e) {
            this.$message.error(e.message)
          } finally {
            instance.confirmButtonLoading = false
            instance.confirmButtonText = '确定'
          }
        } else {
          done()
        }
      }
    }).then(() => {
      this.$message.success(`已通知${methodStr}设备`)
    }).catch((e: any) => {
      if (e === 'cancel' || e === 'close') return
      this.$message.error(e)
    })
  }

  /**
   * 批量移动
   */
  private batchMoveDir() {
    this.isBatchMoveDir = true
    this.openDialog('moveDir', null)
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
        this.isBatchMoveDir = false
    }
    if (payload === true) {
      this.getDeviceList()
    }
  }

  /**
   * 更多菜单
   */
  private handleMore(command: any) {
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
      case 'startRecord':
        this.startRecord(command.device)
        break
      case 'stopRecord':
        this.stopRecord(command.device)
        break
    }
  }

  /**
   * 批量操作菜单
   */
  private handleBatch(command: string) {
    if (!this.selectedDeviceList.length) {
      this.$alertError('请先选择设备')
      return
    }
    switch (command) {
      case 'move':
        this.batchMoveDir()
        break
      case 'delete':
        this.batchDeleteDevice()
        break
      case 'startDevice':
        this.batchStartOrStopDevice('start')
        break
      case 'stopDevice':
        this.batchStartOrStopDevice('stop')
        break
    }
  }

  /**
   * 导出CSV
   */
  private exportCsv() {
    const options = {
      filename: '设备列表',
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true
    }
    const csvExporter = new ExportToCsv(options)
    const data = this.selectedDeviceList.map((device: Device) => {
      return {
        '设备ID': `${device.deviceId}\t`,
        '设备名称': device.deviceName,
        '类型': device.deviceType,
        '厂商': device.deviceVendor,
        '设备IP': device.deviceIp,
        '设备端口': device.devicePort,
        '国标ID': `${device.gbId}\t`,
        '信令传输模式': device.sipTransType,
        '流传输模式': device.streamTransType,
        '优先TCP传输': device.transPriority,
        '创建时间': device.createdTime
      }
    })
    csvExporter.generateCsv(data)
  }

  /**
   * 设备同步
   */
  private async syncDevice() {
    try {
      this.loading.syncDevice = true
      await syncDevice({
        deviceId: this.deviceInfo.deviceId
      })
      this.init()
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.syncDevice = false
    }
  }

  /**
   * 表格多选框变化
   */
  private handleSelectionChange(devices: Array<Device>) {
    this.selectedDeviceList = devices
  }

  /**
   * 当表格的筛选条件发生变化
   */
  private filterChange(filters: any) {
    for (let key in filters) {
      const values = filters[key]
      if (values.length) {
        this.filter[key] = values[0]
      } else {
        this.filter[key] = ''
      }
    }
  }

  /**
   * 清空指定筛选条件
   */
  private clearFilter(key: string) {
    this.filter[key] = ''
    const deviceTable: any = this.$refs.deviceTable
    deviceTable.clearFilter(key)
  }

  /**
   * 将字典转为筛选数组
   */
  private dictToFilterArray(dict: any) {
    const filterArray = []
    for (let key in dict) {
      filterArray.push({
        text: dict[key],
        value: key
      })
    }
    return filterArray
  }

  /**
   * 渲染NVR数量
   */
  private renderNvrSize(dirStats: any) {
    if (dirStats && dirStats.nvrSize) {
      const size = dirStats.nvrSize.split(':')
      if (size.length) {
        return [
          {
            label: 'NVR',
            value: size[0]
          },
          {
            label: '通道',
            value: size[1]
          }
        ]
      }
    }
  }

  /**
   * 渲染NVR数量
   */
  private renderPlatformSize(dirStats: any) {
    if (dirStats && dirStats.platformSize) {
      const size = dirStats.platformSize.split(':')
      if (size.length) {
        return [
          {
            label: '平台',
            value: size[0]
          },
          {
            label: '通道',
            value: size[1]
          }
        ]
      }
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
    ::v-deep .el-table__body {
      td {
        cursor: pointer;
      }
      .col-action, .col-selection {
        cursor: default;
      }
    }
    ::v-deep .el-table__column-filter-trigger {
      visibility: hidden;
    }
    .filter {
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
  .filter-buttons {
    display: flex;
    .filter-button {
      position: relative;
      border: 1px solid #ddd;
      border-radius: 4px;
      line-height: 26px;
      padding-right: 24px;
      margin-right: 10px;
      overflow: hidden;
      transition: border 100ms;
      cursor: pointer;
      label {
        display: inline-block;
        background: #f1f1f1;
        padding: 0 10px;
        margin-right: 8px;
        cursor: pointer;
      }
      &__close {
        position: absolute;
        right: 6px;
        top: 8px;
        color: #bbb;
        transition: border 100ms;
      }
      &:hover {
        border-color: $primary;
        .filter-button__close {
          color: $primary;
        }
      }
    }
  }
</style>
