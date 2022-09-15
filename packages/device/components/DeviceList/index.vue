<template>
  <div class="device-container">
    <div class="list-wrap">
      <div v-if="checkToolsVisible(toolsEnum.ShowDeviceInfo)" class="list-wrap__header">
        <info-list label-width="80">
          <info-list-item label="设备名称:">{{ basicInfo.deviceName }}</info-list-item>
          <info-list-item label="国标ID:">{{ basicInfo.gbId }}</info-list-item>
          <info-list-item label="设备状态:">
            <status-badge :status="basicInfo.deviceStatus" />
            {{ videoStatus[basicInfo.deviceStatus] }}
          </info-list-item>
          <info-list-item label="创建时间:">{{ basicInfo.createdTime }}</info-list-item>
          <info-list-item v-if="basicInfo.createSubDevice === 2" label="可支持通道数量:">{{ basicInfo.deviceStats }}</info-list-item>
          <info-list-item v-else label="通道数量:">{{ basicInfo.deviceStats }}</info-list-item>
          <info-list-item label="在线流数量:">{{ basicInfo.deviceStats }}</info-list-item>
        </info-list>
      </div>
      <div class="list-wrap__tools">
        <div class="list-wrap__tools__left">
          <el-button v-if="checkToolsVisible(toolsEnum.AddDevice, [policyEnum.AdminDevice])" key="create-button" type="primary" @click="handleListTools(toolsEnum.AddDevice)">添加</el-button>
          <el-button v-if="checkToolsVisible(toolsEnum.ViewDevice)" :key="toolsEnum.ViewDevice" @click="handleListTools(toolsEnum.ViewDevice)">查看详情</el-button>
          <el-button v-if="checkToolsVisible(toolsEnum.EditDevice, [policyEnum.AdminDevice])" :key="toolsEnum.EditDevice" @click="handleListTools(toolsEnum.EditDevice)">编辑</el-button>
          <el-button v-if="checkToolsVisible(toolsEnum.SyncDevice)" :key="toolsEnum.SyncDevice" :loading="loading.syncDevice" @click="handleListTools(toolsEnum.SyncDevice)">同步</el-button>
          <el-dropdown v-if="checkToolsVisible(toolsEnum.Export)" placement="bottom" @command="handleListTools($event)">
            <el-button :loading="loading.export">导出<i class="el-icon-arrow-down el-icon--right" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="toolsEnum.ExportAll" :disabled="!deviceList.length">导出所有分页</el-dropdown-item>
              <el-dropdown-item :command="toolsEnum.ExportCurrentPage" :disabled="!deviceList.length">导出当前页</el-dropdown-item>
              <el-dropdown-item :command="toolsEnum.ExportSelect" :disabled="!selectedDeviceList.length">导出选定项</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-upload
            v-if="checkToolsVisible(toolsEnum.Import)"
            ref="excelUpload"
            action="#"
            :show-file-list="false"
            :http-request="handleListTools.bind(null, toolsEnum.Import)"
            class="import-button"
          >
            <el-button>导入</el-button>
          </el-upload>
          <el-button v-if="checkToolsVisible(toolsEnum.ExportTemplate)" @click="handleListTools($event)">下载模板</el-button>
          <el-dropdown v-if="checkToolsVisible(toolsEnum.OperateDevices)" key="dropdown" placement="bottom" @command="handleListTools($event, selectedDeviceList)">
            <el-button :disabled="!selectedDeviceList.length">批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="toolsEnum.MoveDevice">移动至</el-dropdown-item>
              <el-dropdown-item :command="toolsEnum.StartDevice">启用流</el-dropdown-item>
              <el-dropdown-item :command="toolsEnum.StopDevice">停用流</el-dropdown-item>
              <el-dropdown-item :command="toolsEnum.DeleteDevice">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="list-wrap__tools__right">
          <el-button
            v-if="checkToolsVisible(toolsEnum.SyncDeviceStatus)"
            class="el-button-rect filter-container__sync-button"
            :disabled="loading.syncDeviceStatus"
            :class="{'loading': loading.syncDeviceStatus}"
            @click="handleListTools(toolsEnum.syncDeviceStatus)"
          >
            <svg-icon name="refresh" /> 同步设备状态
          </el-button>
        </div>
      </div>
      <div v-if="filterButtons.length" class="filter-buttons list-wrap__filter">
        <div v-for="{key, value} in filterButtons" :key="key" class="filter-button" @click="clearFilter(key)">
          <label>{{ deviceFiltersLabel[key] }}</label>
          <span v-if="key === deviceEnum.DeviceType">{{ deviceType[value] }}</span>
          <span v-if="key === deviceEnum.VideoStatus">{{ videoStatus[value] }}</span>
          <span v-if="key === deviceEnum.StreamStatus">{{ streamStatus[value] }}</span>
          <span v-if="key === deviceEnum.RecordStatus">{{ recordStatus[value] }}</span>
          <span v-if="key === deviceEnum.ViidStatus">{{ viidStatus[value] }}</span>
          <svg-icon class="filter-button__close" name="close" width="10" height="10" />
        </div>
      </div>
      <div class="list-wrap__body">
        <div ref="tableContainer" class="list-wrap__body__table">
          <el-table
            ref="deviceTable"
            v-loading="loading.table"
            :height="tableMaxHeight"
            :data="deviceList"
            fit
            @row-click="rowClick"
            @selection-change="handleSelectionChange"
            @filter-change="filterChange"
          >
            <el-table-column type="selection" prop="selection" class-name="col-selection" width="55" />
            <el-table-column label="设备ID/名称" min-width="200">
              <template slot-scope="{row}">
                <div class="device-name">
                  <div class="device-id">{{ row[deviceEnum.DeviceId] }}</div>
                  <div>{{ row[deviceEnum.DeviceName] }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column v-if="checkColumnsVisible(deviceEnum.DeviceChannelNum)" label="通道号" min-width="100">
              <template slot-scope="{row}">
                {{ 'D' + row[deviceEnum.DeviceChannelNum] }}
              </template>
            </el-table-column>
            <el-table-column v-if="checkColumnsVisible(deviceEnum.DeviceInType)" label="接入类型" min-width="110">
              <template slot-scope="{row}">
                {{ row[deviceEnum.DeviceInType] && row[deviceEnum.DeviceInType].join('、') }}
              </template>
            </el-table-column>
            <el-table-column v-if="checkColumnsVisible(deviceEnum.InProtocol)" label="接入协议" min-width="110">
              <template slot-scope="{row}">
                <div v-for="(item, key) in row[deviceEnum.InProtocol]" :key="key">
                  {{ item }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              v-if="checkColumnsVisible(deviceEnum.DeviceType)"
              :key="deviceEnum.DeviceType"
              :column-key="deviceEnum.DeviceType"
              :prop="deviceEnum.DeviceType"
              label="设备类型"
              min-width="110"
              :filters="filtersArray[deviceEnum.DeviceType]"
              :filter-multiple="false"
            >
              <template slot="header">
                <span class="filtersArrayDeviceStatus&quot;filter&quot;">设备类型</span>
                <svg-icon class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{row}">
                {{ deviceType[row[deviceEnum.DeviceType]] }}
              </template>
            </el-table-column>
            <el-table-column
              v-if="checkColumnsVisible(deviceEnum.VideoStatus)"
              :key="deviceEnum.VideoStatus"
              :column-key="deviceEnum.VideoStatus"
              :min-width="110"
              :filters="filtersArray[deviceEnum.VideoStatus]"
              :filter-multiple="false"
            >
              <template slot="header">
                <span class="filter">视频接入</span>
                <svg-icon class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{row}">
                <status-badge :status="row[deviceEnum.VideoStatus]" />
                {{ videoStatus[row[deviceEnum.VideoStatus]] || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              v-if="checkColumnsVisible(deviceEnum.StreamStatus)"
              :key="deviceEnum.StreamStatus"
              :column-key="deviceEnum.StreamStatus"
              :prop="deviceEnum.StreamStatus"
              min-width="110"
              :filters="filtersArray[deviceEnum.StreamStatus]"
              :filter-multiple="false"
            >
              <template slot="header">
                <span class="filter">视频流</span>
                <svg-icon class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{row}">
                <status-badge :status="row[deviceEnum.StreamStatus]" />
                {{ streamStatus[row[deviceEnum.StreamStatus]] || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              v-if="checkColumnsVisible(deviceEnum.RecordStatus)"
              :key="deviceEnum.RecordStatus"
              :column-key="deviceEnum.RecordStatus"
              :prop="deviceEnum.RecordStatus"
              min-width="110"
              :filters="filtersArray[deviceEnum.RecordStatus]"
              :filter-multiple="false"
            >
              <template slot="header">
                <span class="filter">视频录制</span>
                <svg-icon class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{row}">
                <span><status-badge :status="row[deviceEnum.RecordStatus]" />{{ recordStatus[row[deviceEnum.RecordStatus]] || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="checkColumnsVisible(deviceEnum.ViidStatus)"
              :key="deviceEnum.ViidStatus"
              :column-key="deviceEnum.ViidStatus"
              :prop="deviceEnum.ViidStatus"
              min-width="110"
              :filters="filtersArray[deviceEnum.ViidStatus]"
              :filter-multiple="false"
            >
              <template slot="header">
                <span class="filter">视图接入</span>
                <svg-icon class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{row}">
                <span><status-badge :status="row[deviceEnum.ViidStatus]" />{{ viidStatus[row[deviceEnum.ViidStatus]] || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="checkColumnsVisible(deviceEnum.DeviceChannelSize)" :key="deviceEnum.DeviceChannelSize" :prop="deviceEnum.DeviceChannelSize" label="通道数">
              <template slot-scope="{row}">
                {{ row[deviceEnum.DeviceChannelSize] || '-' }}
              </template>
            </el-table-column>
            <el-table-column v-if="checkColumnsVisible(deviceEnum.DeviceVendor)" :key="deviceEnum.DeviceVendor" :prop="deviceEnum.DeviceVendor" label="厂商">
              <template slot-scope="{row}">
                {{ row[deviceEnum.DeviceVendor] || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" prop="action" class-name="col-action" width="280" fixed="right">
              <template slot-scope="{row}">
                <el-button type="text" :disabled="!checkToolsVisible(toolsEnum.PreviewVideo, policyEnum.ScreenPreview, row)" @click="handleListTools(toolsEnum.PreviewVideo, row)">实时预览</el-button>
                <el-button type="text" :disabled="!checkToolsVisible(toolsEnum.ReplayVideo, policyEnum.ReplayRecord, row)" @click="handleListTools(toolsEnum.ReplayVideo, row)">录像回放</el-button>
                <el-button type="text" :disabled="!checkToolsVisible(toolsEnum.PreviewViid, null, row)" @click="handleListTools(toolsEnum.PreviewViid, row)">视图查看</el-button>
                <!-- <el-button type="text" disabled @click="goToPreview('snapshot', scope.row)">查看截图</el-button> -->
                <!-- <el-popover
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
                </el-popover> -->
                <el-dropdown @command="handleListTools($event, row)">
                  <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.ViewChannels, null, row)" :command="toolsEnum.ViewChannels">查看通道</el-dropdown-item>
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.ViewDevice, null, row)" :command="toolsEnum.ViewDevice">详情</el-dropdown-item>
                    <div v-if="checkToolsVisible(toolsEnum.StartDevice, policyEnum.AdminDevice, row)">
                      <el-dropdown-item v-if="row[deviceEnum.StreamStatus] === statusEnum.On" :command="toolsEnum.StopDevice">停用流</el-dropdown-item>
                      <el-dropdown-item v-else :command="toolsEnum.StartDevice">启用流</el-dropdown-item>
                    </div>
                    <div v-if="checkToolsVisible(toolsEnum.StartRecord, policyEnum.AdminDevice, row)">
                      <el-dropdown-item v-if="row[deviceEnum.RecordStatus] === statusEnum.On" :command="toolsEnum.StopRecord">停止录像</el-dropdown-item>
                      <el-dropdown-item v-else :command="toolsEnum.StartRecord">开始录像</el-dropdown-item>
                    </div>
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.PreviewEvents, null, row)" :command="toolsEnum.PreviewEvents">设备事件</el-dropdown-item>
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.UpdateResource, policyEnum.AdminDevice, row)" :command="toolsEnum.UpdateResource">配置资源包</el-dropdown-item>
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.MoveDevice, policyEnum.AdminDevice, row)" :command="toolsEnum.MoveDevice">移动至</el-dropdown-item>
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.EditDevice, policyEnum.AdminDevice, row)" :command="toolsEnum.EditDevice">编辑</el-dropdown-item>
                    <!--自动创建的子通道不允许删除-->
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.DeleteDevice, policyEnum.AdminDevice, row)" :command="toolsEnum.DeleteDevice">删除</el-dropdown-item>
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
    <move-dir v-if="dialog[toolsEnum.MoveDevice]" :in-protocol="inProtocol" :device="currentDevice" :devices="selectedDeviceList" :is-batch="isBatchMoveDir" @on-close="closeDialog(toolsEnum.MoveDevice, $event)" />
    <upload-excel v-if="dialog[toolsEnum.Import]" :file="selectedFile" :data="fileData" @on-close="closeDialog(toolsEnum.Import, $event)" />
    <resource v-if="dialog[toolsEnum.UpdateResource]" :device="currentDevice" @on-close="closeDialog(toolsEnum.UpdateResource, $event)" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch, Inject } from 'vue-property-decorator'
import { Device, DeviceBasic } from '../../type/Device'
import { DeviceEnum, DirectoryTypeEnum, ToolsEnum, StatusEnum } from '../../enums/index'
import { PolicyEnum } from '@vss/base/enums/iam'
import { DeviceType, DeviceFiltersLabel, VideoStatus, StreamStatus, RecordStatus, ViidStatus } from '../../dicts/index'
import { checkPermission } from '@vss/base/utils/permission'
import { checkDeviceListVisible, checkDeviceColumnsVisible } from '../../utils/param'
import { describeDevices } from '../../api/device'
import deviceMixin from '../../mixin/deviceMixin'
import DeviceManager from '../../services/Device/DeviceManager'
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
export default class extends Mixins(deviceMixin) {
  @Inject('handleTools')
  private handleTools!: Function
  private checkPermission = checkPermission
  private deviceEnum = DeviceEnum
  private toolsEnum = ToolsEnum
  private statusEnum = StatusEnum
  private policyEnum = PolicyEnum
  private deviceFiltersLabel = DeviceFiltersLabel
  private deviceType = DeviceType
  private videoStatus = VideoStatus
  private streamStatus = StreamStatus
  private recordStatus = RecordStatus
  private viidStatus = ViidStatus

  private deviceList: Array<Device> = []
  private selectedDeviceList: Array<Device> = []
  private tableMaxHeight: any = null
  private observer: any = null
  private pollingTimes: number = 1
  private filterForm: any = {
    [DeviceEnum.DeviceType]: undefined,
    [DeviceEnum.VideoStatus]: undefined,
    [DeviceEnum.StreamStatus]: undefined,
    [DeviceEnum.RecordStatus]: undefined,
    [DeviceEnum.ViidStatus]: undefined
  }

  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 5
  }

  private loading = {
    export: false,
    table: false,
    syncDevice: false,
    syncDeviceStatus: false
  }

  private dialog = {
    [ToolsEnum.MoveDevice]: false,
    [ToolsEnum.Import]: false,
    [ToolsEnum.UpdateResource]: false
  }

  private isBatchMoveDir = false
  private currentDevice = null
  private selectedFile = null
  private fileData = null

  // 筛选类型
  private filtersArray = {
    [DeviceEnum.DeviceType]: this.dictToFilterArray(DeviceType),
    [DeviceEnum.VideoStatus]: this.dictToFilterArray(VideoStatus),
    [DeviceEnum.StreamStatus]: this.dictToFilterArray(StreamStatus),
    [DeviceEnum.RecordStatus]: this.dictToFilterArray(RecordStatus),
    [DeviceEnum.ViidStatus]: this.dictToFilterArray(ViidStatus)
  }

  // 功能回调字典
  private handleListToolsMap = {
    [ToolsEnum.AddDevice]: () => DeviceManager.addDevice(this, this.currentDirId),
    [ToolsEnum.ViewDevice]: (row) => DeviceManager.viewDevice(this, row ? row[DeviceEnum.DeviceId] : this.currentDirId),
    [ToolsEnum.EditDevice]: (row) => DeviceManager.editDevice(this, row ? row[DeviceEnum.DeviceId] : this.currentDirId),
    [ToolsEnum.DeleteDevice]: (row) => DeviceManager.deleteDevice(this, row),
    [ToolsEnum.SyncDevice]: () => DeviceManager.syncDevice(this, this.currentDirId),
    [ToolsEnum.SyncDeviceStatus]: () => DeviceManager.syncDeviceStatus(this, this.currentDirId, this.currentDirType),
    [ToolsEnum.RefreshDeviceList]: (flag?) => DeviceManager.refreshDeviceList(this, flag),
    [ToolsEnum.ViewChannels]: (row) => DeviceManager.viewChannels(this, row),
    [ToolsEnum.ExportAll]: () => DeviceManager.exportDeviceExcel(this, ToolsEnum.ExportAll),
    [ToolsEnum.ExportCurrentPage]: () => DeviceManager.exportDeviceExcel(this, ToolsEnum.ExportCurrentPage),
    [ToolsEnum.ExportSelected]: () => DeviceManager.exportDeviceExcel(this, ToolsEnum.ExportSelected),
    [ToolsEnum.Import]: (data) => DeviceManager.uploadExcel(this, data),
    [ToolsEnum.ExportTemplate]: () => DeviceManager.exportTemplate(this),
    [ToolsEnum.MoveDevice]: (row) => DeviceManager.openListDialog(this, ToolsEnum.MoveDevice, row),
    [ToolsEnum.StartDevice]: (row) => DeviceManager.startOrStopDevice(this, ToolsEnum.StartDevice, row),
    [ToolsEnum.StopDevice]: (row) => DeviceManager.startOrStopDevice(this, ToolsEnum.StopDevice, row),
    [ToolsEnum.StartRecord]: (row) => DeviceManager.startOrStopRecord(this, ToolsEnum.StartRecord, row),
    [ToolsEnum.StopRecord]: (row) => DeviceManager.startOrStopRecord(this, ToolsEnum.StopRecord, row),
    [ToolsEnum.UpdateResource]: (row) => DeviceManager.openListDialog(this, ToolsEnum.UpdateResource, row),
    [ToolsEnum.CloseDialog]: (type, isfresh) => DeviceManager.closeListDialog(this, type, isfresh),
    [ToolsEnum.PreviewEvents]: () => DeviceManager.previewEvents(this, this.currentDirId),
    [ToolsEnum.PreviewVideo]: () => DeviceManager.previewVideo(this, this.currentDirId),
    [ToolsEnum.ReplayVideo]: () => DeviceManager.replayVideo(this, this.currentDirId),
    [ToolsEnum.PreviewViid]: () => DeviceManager.previewViid(this, this.currentDirId)
  }

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device.device || {}
  }

  private get filterButtons() {
    const buttons = []
    for (let key in this.filterForm) {
      const value = this.filterForm[key]
      value && (buttons.push({ key, value }))
    }
    return buttons
  }

  private get tableContainer() {
    return this.$refs.tableContainer as any
  }

  private get deviceTable() {
    return this.$refs.deviceTable as any
  }

  private get currentDirId() {
    return this.$route.query.dirId as string
  }

  private get currentDirType() {
    return this.$route.query.type as DirectoryTypeEnum || DirectoryTypeEnum.Dir
  }

  @Watch('$route.query.deviceListRefreshFlag', { deep: true, immediate: true })
  private async statusChange(val) {
    if (val === 'true') {
      this.initList()
      this.handleListTools(ToolsEnum.RefreshDeviceList, 'false')
    }
  }

  @Watch('filterForm', { deep: true })
  private onFilterChange() {
    this.initTable()
  }

  private mounted() {
    this.handleTools(ToolsEnum.RefreshDeviceList)
    this.initTableSize()
  }

  private beforeDestroy() {
    this.tableContainer && this.observer.unobserve(this.tableContainer)
  }

  /**
   * 设备列表初始化
   */
  private async initList() {
    this.initTable()
    if ([DirectoryTypeEnum.Nvr, DirectoryTypeEnum.Platform].includes(this.currentDirType)) {
      await this.getDevice(this.currentId)
      console.log('deviceInfo', this.device)
    }
  }

  /**
   * 设备table初始化
   */
  private async initTable() {
    this.loading.table = true
    let params = {
      DirId: this.currentDirId,
      Type: this.currentDirType,
      PageSize: this.pager.pageSize,
      PageNum: this.pager.pageNum,
      filterForm: this.filterForm
    }
    let res: any = await describeDevices(params)
    console.log('getList', params)
    this.deviceList = res.devices
    this.loading.table = false
  }

  /**
   * table样式初始化
   */
  private initTableSize() {
    this.calTableMaxHeight()
    this.observer = new ResizeObserver(() => {
      this.calTableMaxHeight()
    })
    this.tableContainer && this.observer.observe(this.tableContainer)
  }

  /**
   * 计算表格高度
   */
  private calTableMaxHeight() {
    this.tableMaxHeight = this.tableContainer && this.tableContainer.offsetHeight
  }

  /**
   * list功能调用触发回调
   * @param type 功能字段名
   * @param data 回调参数
   */
  private handleListTools(type: string, ...payload: any) {
    console.log(type, ...payload)
    this.handleListToolsMap[type](...payload)
  }

  /**
   * 判断是否显示tools
   * @param prop 字段名
   * @param permissions 策略名
   * @param row 具体信息
   */
  private checkToolsVisible(prop, permissions?, row?: DeviceBasic) {
    !row && (row = { deviceType: this.currentDirType })
    return checkDeviceListVisible(row.deviceType, prop) && checkPermission(permissions)
  }

  /**
   * 判断是否显示coloumns
   * @param prop 字段名
   * @param type 目录类型
   */
  private checkColumnsVisible(prop, type = this.currentDirType) {
    return checkDeviceColumnsVisible(type, prop)
  }

  /**
   * 列表行点击触发回调
   * @param row 行信息
   * @param column column名
   */
  private rowClick(row: Device, column: any) {
    if (column.property !== 'action' && column.property !== 'selection') {
      this.$router.push({ name: 'DeviceInfo', query: { deviceId: '29941916753760267' } })
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
      this.filterForm[key] = filters[key][0]
    }
  }

  /**
   * 清空指定筛选条件
   */
  private clearFilter(key: string) {
    this.filterForm[key] && this.deviceTable && this.deviceTable.clearFilter(key)
    this.filterForm[key] = undefined
  }

  /**
   * 将筛选字典转为筛选数组
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

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.initTable()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.initTable()
  }
}
</script>
