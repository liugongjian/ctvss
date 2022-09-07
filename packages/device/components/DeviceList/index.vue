<template>
  <div class="device-container">
    <div class="list-wrap">
      <div v-if="checkToolsVisible(toolsEnum.ShowDeviceInfo)" class="list-wrap__header">
        <info-list label-width="80">
          <info-list-item label="设备名称:">{{ deviceInfo.deviceName }}</info-list-item>
          <info-list-item label="国标ID:">{{ deviceInfo.gbId }}</info-list-item>
          <info-list-item label="设备状态:">
            <status-badge :status="deviceInfo.deviceStatus" />
            {{ deviceStatus[deviceInfo.deviceStatus] }}
          </info-list-item>
          <info-list-item label="创建时间:">{{ deviceInfo.createdTime }}</info-list-item>
          <info-list-item v-if="deviceInfo.createSubDevice === 2" label="可支持通道数量:">{{ deviceInfo.deviceStats }}</info-list-item>
          <info-list-item v-else label="通道数量:">{{ deviceInfo.deviceStats }}</info-list-item>
          <info-list-item label="在线流数量:">{{ deviceInfo.deviceStats }}</info-list-item>
        </info-list>
      </div>
      <div class="list-wrap__tools">
        <div class="list-wrap__tools__left">
          <el-button v-if="checkToolsVisible(toolsEnum.AddDevice, [policyEnum.AdminDevice])" key="create-button" type="primary" @click="handleTools(toolsEnum.AddDevice)">添加</el-button>
          <el-button v-if="checkToolsVisible(toolsEnum.ViewDevice)" :key="toolsEnum.ViewDevice" @click="handleTools(toolsEnum.ViewDevice)">查看详情</el-button>
          <el-button v-if="checkToolsVisible(toolsEnum.EditDevice, [policyEnum.AdminDevice])" :key="toolsEnum.EditDevice" @click="handleTools(toolsEnum.EditDevice)">编辑</el-button>
          <el-dropdown v-if="checkToolsVisible(toolsEnum.Export)" placement="bottom" @command="handleTools($event)">
            <el-button>导出<i class="el-icon-arrow-down el-icon--right" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="toolsEnum.ExportAll" :disabled="!deviceList.length">导出所有分页</el-dropdown-item>
              <el-dropdown-item :command="toolsEnum.ExportCurrentPage" :disabled="!deviceList.length">导出当前页</el-dropdown-item>
              <el-dropdown-item :command="toolsEnum.ExportSelect" :disabled="!selectedDeviceList.length">导出选定项</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-upload
            ref="excelUpload"
            action="#"
            :show-file-list="false"
            :http-request="handleTools"
            class="import-button"
          >
            <el-button>导入</el-button>
          </el-upload>
          <el-button @click="handleTools($event)">下载模板</el-button>
          <el-dropdown v-if="!isVGroup" key="dropdown" placement="bottom" @command="1">
            <el-button :disabled="!selectedDeviceList.length">批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="move">移动至</el-dropdown-item>
              <el-dropdown-item command="startDevice">启用流</el-dropdown-item>
              <el-dropdown-item command="stopDevice">停用流</el-dropdown-item>
              <el-dropdown-item command="delete">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="list-wrap__tools__right">
          <el-input v-show="false" v-model="keyword" class="search-group" placeholder="请输入关键词">
            <el-button slot="append" class="el-button-rect"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button v-if="checkToolsVisible(toolsEnum.SyncDevice)" :key="toolsEnum.SyncDevice" :loading="loading.syncDevice" @click="handleTools(toolsEnum.SyncDevice)">同步</el-button>
        </div>
      </div>
      <div v-if="filterButtons.length" class="filter-buttons list-wrap__filter">
        <div v-for="{key, value} in filterButtons" :key="key" class="filter-button" @click="1">
          <label>{{ deviceParams[key] }}</label>
          <span v-if="key === 'deviceType'">{{ deviceType[value] }}</span>
          <span v-if="key === 'deviceStatus'">{{ deviceStatus[value] }}</span>
          <span v-if="key === 'streamStatus'">{{ streamStatus[value] }}</span>
          <span v-if="key === 'recordStatus'">{{ recordStatusFilterType[value] }}</span>
          <svg-icon class="filter-button__close" name="close" width="10" height="10" />
        </div>
      </div>
      <div class="list-wrap__body">
        <div ref="deviceTable" class="list-wrap__body__table">
          <el-table v-loading="loading.table" :height="tableMaxHeight" :data="deviceList" fit @row-click="rowClick">
            <el-table-column type="selection" prop="selection" class-name="col-selection" width="55" />
            <el-table-column label="设备ID/名称" min-width="200">
              <template slot-scope="{row}">
                <div class="device-name">
                  <div class="device-id">{{ row[deviceEnum.DeviceId] }}</div>
                  <div>{{ row[deviceEnum.DeviceName] }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column v-if="isNVR" label="通道号" min-width="100">
              <template slot-scope="{row}">
                {{ 'D' + row.channelNum }}
              </template>
            </el-table-column>
            <el-table-column label="接入类型" min-width="110">
              <template slot-scope="{row}">
                {{ row[deviceEnum.DeviceInType] && row[deviceEnum.DeviceInType].join('、') }}
              </template>
            </el-table-column>
            <el-table-column label="接入协议" min-width="110">
              <template slot-scope="{row}">
                <div v-for="(item, key) in row[deviceEnum.InProtocol]" :key="key">
                  {{ item }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              key="deviceType"
              column-key="deviceType"
              prop="deviceType"
              label="设备类型"
              min-width="110"
              :filters="isIPC ? [] : filtersArray.deviceType"
              :filter-multiple="false"
            >
              <template slot="header">
                <span class="filtersArrayDeviceStatus&quot;filter&quot;">设备类型</span>
                <svg-icon v-if="!isIPC" class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{row}">
                {{ deviceType[row[deviceEnum.DeviceType]] }}
              </template>
            </el-table-column>
            <el-table-column
              v-if="isGb"
              key="deviceStatus"
              column-key="deviceStatus"
              min-width="110"
              :filters="isIPC ? [] : filtersArray.deviceStatus"
              :filter-multiple="false"
            >
              <template slot="header">
                <span class="filter">视频接入</span>
                <svg-icon v-if="!isIPC" class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{row}">
                <status-badge :status="row[deviceEnum.VideoStatus]" />
                {{ deviceStatus[row[deviceEnum.VideoStatus]] || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              key="streamStatus"
              column-key="streamStatus"
              prop="streamStatus"
              min-width="110"
              :filters="isIPC ? [] : filtersArray.streamStatus"
              :filter-multiple="false"
            >
              <template slot="header">
                <span class="filter">视频流</span>
                <svg-icon v-if="!isIPC" class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{row}">
                <status-badge :status="row[deviceEnum.StreamStatus]" />
                {{ streamStatus[row[deviceEnum.StreamStatus]] || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              key="recordStatus"
              column-key="recordStatus"
              prop="recordStatus"
              min-width="110"
              :filters="isIPC ? [] : filtersArray.recordStatus"
              :filter-multiple="false"
            >
              <template slot="header">
                <span class="filter">视频录制</span>
                <svg-icon v-if="!isIPC" class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{row}">
                <span v-if="row.deviceType === 'nvr'">-</span>
                <span v-else><status-badge :status="row[deviceEnum.RecordStatus]" />{{ recordStatus[row[deviceEnum.RecordStatus]] || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column
              key="viidStatus"
              column-key="viidStatus"
              prop="viidStatus"
              min-width="110"
              :filters="isIPC ? [] : filtersArray.viidStatus"
              :filter-multiple="false"
            >
              <template slot="header">
                <span class="filter">视图接入</span>
                <svg-icon v-if="!isIPC" class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{row}">
                <span v-if="row.deviceType === 'nvr'">-</span>
                <span v-else><status-badge :status="row[deviceEnum.ViidStatus]" />{{ viidStatus[row[deviceEnum.ViidStatus]] || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column key="tunnelNum" prop="tunnelNum" label="通道数">
              <template slot-scope="{row}">
                {{ row[deviceEnum.DeviceChannelSize] || '-' }}
              </template>
            </el-table-column>
            <el-table-column key="deviceVendor" prop="deviceVendor" label="厂商">
              <template slot-scope="{row}">
                {{ row[deviceEnum.DeviceVendor] || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" prop="action" class-name="col-action" width="280" fixed="right">
              <template slot-scope="scope">
                <el-button v-if="checkPermission(['ScreenPreview'])" type="text" :disabled="scope.row.deviceType === 'nvr' || scope.row.deviceType === 'platform'" @click="1">实时预览</el-button>
                <el-button v-if="checkPermission(['ReplayRecord'])" type="text" :disabled="scope.row.deviceType === 'nvr' || scope.row.deviceType === 'platform'" @click="1">录像回放</el-button>
                <!-- <el-button type="text" disabled @click="goToPreview('snapshot', scope.row)">查看截图</el-button> -->
                <el-popover
                  width="400"
                  :open-delay="800"
                  trigger="hover"
                  @show="1"
                >
                  <el-table
                    v-loading="loading.events"
                    :show-header="false"
                    :data="eventsList"
                    :height="170"
                    empty-text="暂无设备事件"
                  >
                    <el-table-column property="createdTime" />
                    <el-table-column property="errorMessage" />
                  </el-table>
                  <el-button slot="reference" type="text" @click="deviceRouter({id: scope.row.deviceId, type: 'detail', activeName: 'events'})">设备事件</el-button>
                </el-popover>
                <el-dropdown @command="1">
                  <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-if="scope.row.deviceType === 'nvr'" :command="{type: 'nvr', device: scope.row}">查看通道</el-dropdown-item>
                    <el-dropdown-item v-if="isNVR" :command="{type: 'detail', device: scope.row}">通道详情</el-dropdown-item>
                    <el-dropdown-item v-else :command="{type: 'detail', device: scope.row}">设备详情</el-dropdown-item>
                    <template v-if="scope.row.deviceType === 'ipc'">
                      <el-dropdown-item v-if="!isVGroup && scope.row.streamStatus === 'on' && checkPermission(['AdminDevice'])" :command="{type: 'stopDevice', device: scope.row}">停用流</el-dropdown-item>
                      <el-dropdown-item v-else-if="!isVGroup && checkPermission(['AdminDevice'])" :command="{type: 'startDevice', device: scope.row}">启用流</el-dropdown-item>
                      <el-dropdown-item v-if="!isVGroup && recordStatusType[scope.row.recordStatus] === 'on' && checkPermission(['AdminDevice'])" :command="{type: 'stopRecord', device: scope.row}">停止录像</el-dropdown-item>
                      <el-dropdown-item v-else-if="!isVGroup && checkPermission(['AdminDevice'])" :command="{type: 'startRecord', device: scope.row}">开始录像</el-dropdown-item>
                    </template>
                    <el-dropdown-item v-if="!isVGroup && checkPermission(['AdminDevice'])" :command="{type: 'updateResource', device: scope.row}">配置资源包</el-dropdown-item>
                    <el-dropdown-item v-if="!isVGroup && (!isNVR && scope.row.parentDeviceId === '-1') && checkPermission(['AdminDevice'])" :command="{type: 'move', device: scope.row}">移动至</el-dropdown-item>
                    <el-dropdown-item v-if="!isVGroup && checkPermission(['AdminDevice'])" :command="{type: 'update', device: scope.row}">编辑</el-dropdown-item>
                    <!--自动创建的子通道不允许删除-->
                    <el-dropdown-item v-if="!isVGroup && checkPermission(['AdminDevice'])" :command="{type: 'delete', device: scope.row}">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-pagination
          :current-page="pager.pageNum"
          :page-size="pager.pageSize"
          :total="pager.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <move-dir v-if="dialog.moveDir" :in-protocol="inProtocol" :device="currentDevice" :devices="selectedDeviceList" :is-batch="isBatchMoveDir" @on-close="closeDialog('moveDir', ...arguments)" />
    <upload-excel v-if="dialog.uploadExcel" :file="selectedFile" :data="fileData" @on-close="closeDialog('uploadExcel', ...arguments)" />
    <resource v-if="dialog.resource" :device="currentDevice" @on-close="closeDialog('resource', ...arguments)" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { Device } from '../../type/Device'
import { DeviceEnum, DirectoryTypeEnum, ToolsEnum } from '../../enums/index'
import { PolicyEnum } from '@vss/base/enums/iam'
import { DeviceParams, DeviceStatus, StreamStatus, RecordStatus, ViidStatus, RecordStatusType, RecordStatusFilterType, DeviceGb28181Type, SipTransType, StreamTransType, StreamTransProtocol } from '../../dicts/index'
import { checkPermission } from '@vss/base/utils/permission'
import { checkDeviceListVisible } from '../../utils/param'
import { describeDevices } from '../../api/device'
import ResizeObserver from 'resize-observer-polyfill'
import MoveDir from '../MoveDir.vue'
import UploadExcel from '../UploadExcel.vue'
import Resource from '../Resource.vue'

@Component({
  name: 'DeviceList',
  components: {
    MoveDir,
    UploadExcel,
    Resource
  }
})
export default class extends Vue {
  @Inject('handleTools')
  private handleTools!: Function
  private checkPermission = checkPermission
  private deviceEnum = DeviceEnum
  private toolsEnum = ToolsEnum
  private policyEnum = PolicyEnum
  private deviceParams = DeviceParams
  private deviceStatus = DeviceStatus
  private streamStatus = StreamStatus
  private recordStatus = RecordStatus
  private viidStatus = ViidStatus
  private recordStatusType = RecordStatusType
  private recordStatusFilterType = RecordStatusFilterType
  private deviceType = DeviceGb28181Type
  private sipTransType = SipTransType
  private streamTransType = StreamTransType
  private streamTransProtocol = StreamTransProtocol

  public tableMaxHeight: any = null
  public observer: any = null
  public filter: any = {
    deviceType: undefined,
    deviceStatus: undefined,
    streamStatus: undefined,
    recordStatus: undefined
  }

  public pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  public loading = {
    table: false,
    syncDevice: false
  }

  public dialog = {
    moveDir: false,
    uploadExcel: false,
    resource: false
  }

  private currentDir = {
    type: DirectoryTypeEnum.Dir,
    id: ''
  }

  // 筛选类型
  public filtersArray = {
    deviceType: this.dictToFilterArray(DeviceGb28181Type),
    deviceStatus: this.dictToFilterArray(DeviceStatus),
    streamStatus: this.dictToFilterArray(StreamStatus),
    recordStatus: this.dictToFilterArray(RecordStatusFilterType)
  }

  private get isNVR() {
    return true
  }

  private get isIPC() {
    return false
  }

  private get isPlatform() {
    return false
  }

  private get isVGroup() {
    return false
  }

  private get isGb() {
    return true
  }

  private get isDir() {
    return false
  }

  private get isChannel() {
    return false
  }

  private get ga1400Flag() {
    return false
  }

  public get filterButtons() {
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

  public get hasFiltered() {
    return !!(this.filter.deviceType || this.filter.deviceStatus || this.filter.streamStatus || this.filter.recordStatus)
  }

  private keyword = ''

  private deviceInfo: any = {}

  private deviceList: Array<Device> = []

  private selectedDeviceList: Array<Device> = []

  private eventsList = []

  private mounted() {
    this.initTable()
    this.initTableSize()
  }

  public beforeDestroy() {
    const deviceTable: any = this.$refs.deviceTable
    deviceTable && this.observer.unobserve(deviceTable)
  }

  private async initTable() {
    this.loading.table = true
    let res: any = await describeDevices({
      DirId: '',
      PageSize: 10,
      PageNum: 1
    })
    this.deviceList = res.devices
    this.loading.table = false
  }

  private initTableSize() {
    this.calTableMaxHeight()
    this.observer = new ResizeObserver(() => {
      this.calTableMaxHeight()
    })
    const deviceTable: any = this.$refs.deviceTable
    deviceTable && this.observer.observe(deviceTable)
  }

  /**
   * 判断是否显示tools
   * @param prop 字段名
   * @param permissions 策略名
   * @param row 具体信息
   */
  private checkToolsVisible(prop, permissions?, row?) {
    !row && (row = { type: this.currentDir.type })
    return checkDeviceListVisible(row.type, prop) && checkPermission(permissions)
  }

  // private checkColumnsVisible(prop, permission, type = ) {
  //   return checkDeviceListVisible(type, prop)
  // }

  private rowClick() {
    this.$router.push({ path: '/device-refactor/detail', query: { deviceId: '29941916753760267' } })
  }

  private calTableMaxHeight() {
    const deviceTable: any = this.$refs.deviceTable
    this.tableMaxHeight = deviceTable.offsetHeight
  }

  /**
   * 将字典转为筛选数组
   */
  public dictToFilterArray(dict: any) {
    const filterArray = []
    for (let key in dict) {
      filterArray.push({
        text: dict[key],
        value: key
      })
    }
    return filterArray
  }

  private getDevices() {}

  public async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getDevices()
  }

  public async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getDevices()
  }
}
</script>
