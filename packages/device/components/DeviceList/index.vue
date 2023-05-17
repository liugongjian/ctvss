<template>
  <div class="device-container">
    <div class="list-wrap">
      <div v-if="checkToolsVisible(toolsEnum.ShowDeviceInfo)" class="list-wrap__header">
        <info-list v-loading="loading.info" label-width="80">
          <info-list-item v-if="checkInfoVisible(deviceEnum.DeviceName)" label="设备名称:">{{ basicInfo.deviceName }}</info-list-item>
          <info-list-item v-if="checkInfoVisible(deviceEnum.PlatformName)" label="平台名称:">{{ basicInfo.deviceName }}</info-list-item>
          <info-list-item v-if="checkInfoVisible(deviceEnum.OutId)" label="国标ID:">{{ videoInfo.outId }}</info-list-item>
          <info-list-item v-if="checkInfoVisible(deviceEnum.ViidId)" label="视图ID:">{{ viidInfo.outId }}</info-list-item>
          <info-list-item v-if="checkInfoVisible(deviceEnum.VideoStatus)" label="视频接入:">
            <status-badge :status="videoInfo.deviceStatus.isOnline" />
            {{ dicts.DeviceStatus[videoInfo.deviceStatus.isOnline] || '-' }}
          </info-list-item>
          <info-list-item v-if="checkInfoVisible(deviceEnum.ViidStatus)" label="视图接入:">
            <status-badge :status="viidInfo.deviceStatus.isOnline" />
            {{ dicts.DeviceStatus[viidInfo.deviceStatus.isOnline] || '-' }}
          </info-list-item>
          <info-list-item v-if="checkInfoVisible(deviceEnum.CreatedTime)" label="创建时间:">{{ dateFormat(device.createdTime) }}</info-list-item>
          <info-list-item v-if="checkInfoVisible(deviceEnum.DeviceChannelSize)" label="通道数量:">{{ basicInfo.deviceChannelSize }}</info-list-item>
          <info-list-item v-if="checkInfoVisible(deviceEnum.OnlineChannels)" label="在线通道数量:">{{ basicInfo.deviceStats ? basicInfo.deviceStats.onlineChannels : '-' }}</info-list-item>
          <info-list-item v-if="checkInfoVisible(deviceEnum.DeviceTotalSize)" label="设备总数:">{{ basicInfo.deviceStats }}</info-list-item>
        </info-list>
      </div>
      <div v-loading="loading.table" class="list-wrap__tools">
        <div class="list-wrap__tools__left">
          <el-button
            v-if="checkToolsVisible(toolsEnum.AddDevice, [policyEnum.CreateDevice], null, deviceActions)"
            key="create-button"
            type="primary"
            @click="handleListTools(toolsEnum.AddDevice)"
          >
            添加
          </el-button>
          <el-button
            v-if="checkToolsVisible(toolsEnum.ConfigureChannels, [policyEnum.UpdateDevice], null, deviceActions)"
            key="configure-channels"
            type="primary"
            @click="handleListTools(toolsEnum.ConfigureChannels, deviceList)"
          >
            配置子通道
          </el-button>
          <el-button 
            v-if="checkToolsVisible(toolsEnum.ViewDevice)" :key="toolsEnum.ViewDevice"
            @click="handleListTools(toolsEnum.ViewDevice, { [deviceEnum.DeviceId]: currentDirId, [deviceEnum.DeviceType]: currentDirType })"
          >
            查看详情
          </el-button>
          <el-button
            v-if="checkToolsVisible(toolsEnum.EditDevice, [policyEnum.UpdateDevice], null, deviceActions)"
            :key="toolsEnum.EditDevice"
            @click="handleListTools(toolsEnum.EditDevice, basicInfo)"
          >
            编辑
          </el-button>
          <el-button v-if="checkToolsVisible(toolsEnum.SyncDevice)" :key="toolsEnum.SyncDevice" :loading="loading.syncDevice" @click="handleListTools(toolsEnum.SyncDevice)">同步</el-button>
          <el-dropdown v-if="checkToolsVisible(toolsEnum.Export)" placement="bottom" @command="handleListTools($event,{ deviceList,selectedDeviceList,currentDirId })">
            <el-button :loading="loading.export">导出<i class="el-icon-arrow-down el-icon--right" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="toolsEnum.ExportAll" :disabled="!deviceList.length">导出所有分页</el-dropdown-item>
              <el-dropdown-item :command="toolsEnum.ExportCurrentPage" :disabled="!deviceList.length">导出当前页</el-dropdown-item>
              <el-dropdown-item :command="toolsEnum.ExportSelected" :disabled="!selectedDeviceList.length">导出选定项</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-upload
            v-if="checkToolsVisible(toolsEnum.Import, [policyEnum.CreateDevice], null, deviceActions)"
            ref="excelUpload"
            action="#"
            :show-file-list="false"
            :http-request="handleListTools.bind(null, toolsEnum.Import)"
            class="import-button"
          >
            <el-button>导入</el-button>
          </el-upload>
          <el-button v-if="checkToolsVisible(toolsEnum.ExportTemplate, [policyEnum.CreateDevice], null, deviceActions)" @click="handleListTools(toolsEnum.ExportTemplate)">下载模板</el-button>
          <el-dropdown v-if="checkToolsVisible(toolsEnum.OperateDevices, [policyEnum.UpdateDevice])" key="dropdown" placement="bottom" @command="handleListTools($event, selectedDeviceList)">
            <el-button :disabled="!selectedDeviceList.length">批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="checkToolsVisible(toolsEnum.MoveDevices, [policyEnum.UpdateDevice], null, selectedDeviceList)" :command="toolsEnum.MoveDevice">移动至</el-dropdown-item>
              <el-dropdown-item v-if="checkToolsVisible(toolsEnum.StartDevices, [policyEnum.UpdateDevice], null, selectedDeviceList)" :command="toolsEnum.StartDevice">启用流</el-dropdown-item>
              <el-dropdown-item v-if="checkToolsVisible(toolsEnum.StopDevices, [policyEnum.UpdateDevice], null, selectedDeviceList)" :command="toolsEnum.StopDevice">停用流</el-dropdown-item>
              <el-dropdown-item v-if="checkToolsVisible(toolsEnum.DeleteDevices, [policyEnum.DeleteDevice], null, selectedDeviceList)" :command="toolsEnum.DeleteDevice">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="list-wrap__tools__right">
          <el-button
            v-if="checkToolsVisible(toolsEnum.SyncDeviceStatus)"
            class="el-button-rect filter-container__sync-button"
            :disabled="loading.syncDeviceStatus"
            :class="{ 'loading': loading.syncDeviceStatus }"
            @click="handleListTools(toolsEnum.SyncDeviceStatus)"
          >
            <svg-icon name="refresh" /> 同步设备状态
          </el-button>
        </div>
      </div>
      <div v-if="filterButtons.length" class="filter-buttons list-wrap__filter">
        <div v-for="{ key, value } in filterButtons" :key="key" class="filter-button" @click="clearFilter(key)">
          <label>{{ deviceFiltersLabel[key] }}</label>
          <span v-if="key === deviceEnum.DeviceType">{{ deviceTypeDic[value] }}</span>
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
            :key="tableKey"
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
              <template slot-scope="{ row }">
                <div class="device-name">
                  <div class="device-id">{{ row[deviceEnum.DeviceId] }}</div>
                  <div>{{ row[deviceEnum.DeviceName] }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column v-if="checkColumnsVisible(deviceEnum.DeviceChannelNum)" label="通道号" min-width="100">
              <template slot-scope="{ row }">
                {{ 'D' + row[deviceEnum.DeviceChannelNum] }}
              </template>
            </el-table-column>
            <el-table-column v-if="checkColumnsVisible(deviceEnum.DeviceInType)" label="接入类型" min-width="110">
              <template slot-scope="{ row }">
                {{ row[deviceEnum.DeviceInType] && row[deviceEnum.DeviceInType].join('、') }}
              </template>
            </el-table-column>
            <el-table-column v-if="checkColumnsVisible(deviceEnum.InProtocol)" label="接入协议" min-width="110">
              <template slot-scope="{ row }">
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
              :filtered-value="[filterForm[deviceEnum.DeviceType]]"
            >
              <template slot="header">
                <span class="filtersArrayDeviceStatus&quot;filter&quot;">设备类型</span>
                <svg-icon class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{ row }">
                {{ deviceTypeDic[row[deviceEnum.DeviceType]] }}
              </template>
            </el-table-column>
            <el-table-column
              v-if="checkColumnsVisible(deviceEnum.VideoStatus)"
              :key="deviceEnum.VideoStatus"
              :column-key="deviceEnum.VideoStatus"
              :min-width="110"
              :filters="filtersArray[deviceEnum.VideoStatus]"
              :filter-multiple="false"
              :filtered-value="[filterForm[deviceEnum.VideoStatus]]"
            >
              <template slot="header">
                <span class="filter">视频接入</span>
                <svg-icon class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{ row }">
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
              :filtered-value="[filterForm[deviceEnum.StreamStatus]]"
            >
              <template slot="header">
                <span class="filter">视频流</span>
                <svg-icon class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{ row }">
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
              :filtered-value="[filterForm[deviceEnum.RecordStatus]]"
            >
              <template slot="header">
                <span class="filter">视频录制</span>
                <svg-icon class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{ row }">
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
              :filtered-value="[filterForm[deviceEnum.ViidStatus]]"
            >
              <template slot="header">
                <span class="filter">视图接入</span>
                <svg-icon class="filter" name="filter" width="15" height="15" />
              </template>
              <template slot-scope="{ row }">
                <span><status-badge :status="row[deviceEnum.ViidStatus]" />{{ viidStatus[row[deviceEnum.ViidStatus]] || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="checkColumnsVisible(deviceEnum.DeviceChannelSize)" :key="deviceEnum.DeviceChannelSize" :prop="deviceEnum.DeviceChannelSize" label="通道数">
              <template slot-scope="{ row }">
                {{ row[deviceEnum.DeviceChannelSize] || '-' }}
              </template>
            </el-table-column>
            <el-table-column v-if="checkColumnsVisible(deviceEnum.DeviceVendor)" :key="deviceEnum.DeviceVendor" :prop="deviceEnum.DeviceVendor" label="厂商">
              <template slot-scope="{ row }">
                {{ row[deviceEnum.DeviceVendor] || '-' }}
              </template>
            </el-table-column>
            <el-table-column v-if="checkColumnsVisible(deviceEnum.OutId)" :key="deviceEnum.OutId" :prop="deviceEnum.OutId" label="国标ID" min-width="200">
              <template slot-scope="{ row }">
                {{ row[deviceEnum.OutId] || '-' }}
              </template>
            </el-table-column>
            <el-table-column v-if="checkColumnsVisible(deviceEnum.CreatedTime)" :key="deviceEnum.DeviCreatedTimeceVendor" :prop="deviceEnum.CreatedTime" label="创建时间" min-width="200">
              <template slot-scope="{ row }">
                {{ dateFormat(row[deviceEnum.CreatedTime]) || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" prop="action" class-name="col-action" width="280" fixed="right">
              <template slot-scope="{ row }">
                <el-button
                  v-if="checkPermission([policyEnum.GetLiveStream], row)"
                  :disabled="!checkToolsVisible(toolsEnum.PreviewVideo, null, row, row)"
                  type="text"
                  @click="handleListTools(toolsEnum.PreviewVideo, row)"
                >
                  实时预览
                </el-button>
                <el-button
                  v-if="checkPermission([policyEnum.GetCloudRecord], row)"
                  :disabled="!checkToolsVisible(toolsEnum.ReplayVideo, null, row, row)"
                  type="text"
                  @click="handleListTools(toolsEnum.ReplayVideo, row)"
                >
                  录像回放
                </el-button>
                <el-button
                  :disabled="!checkToolsVisible(toolsEnum.PreviewViid, null, row, row)"
                  type="text"
                  @click="handleListTools(toolsEnum.PreviewViid, row)"
                >
                  视图查看
                </el-button>
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
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.ViewChannels, null, row, row)" :command="toolsEnum.ViewChannels">查看通道</el-dropdown-item>
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.ViewDevice, null, row, row)" :command="toolsEnum.ViewDevice">详情</el-dropdown-item>
                    <div v-if="checkToolsVisible(toolsEnum.StartDevice, [policyEnum.UpdateDevice], row, row)">
                      <el-dropdown-item v-if="row[deviceEnum.StreamStatus] === statusEnum.On" :command="toolsEnum.StopDevice">停用流</el-dropdown-item>
                      <el-dropdown-item v-else :command="toolsEnum.StartDevice">启用流</el-dropdown-item>
                    </div>
                    <div v-if="checkToolsVisible(toolsEnum.StartRecord, [policyEnum.UpdateDevice], row, row)">
                      <el-dropdown-item v-if="row[deviceEnum.RecordStatus] === statusEnum.On" :command="toolsEnum.StopRecord">停止录像</el-dropdown-item>
                      <el-dropdown-item v-else :command="toolsEnum.StartRecord">开始录像</el-dropdown-item>
                    </div>
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.PreviewEvents, null, row, row)" :command="toolsEnum.PreviewEvents">设备事件</el-dropdown-item>
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.UpdateResource, [policyEnum.UpdateDevice], row, row)" :command="toolsEnum.UpdateResource">配置资源包</el-dropdown-item>
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.MoveDevice, [policyEnum.UpdateDevice], row, row)" :command="toolsEnum.MoveDevice">移动至</el-dropdown-item>
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.EditDevice, [policyEnum.UpdateDevice], row, row)" :command="toolsEnum.EditDevice">编辑</el-dropdown-item>
                    <!--自动创建的子通道不允许删除-->
                    <el-dropdown-item v-if="checkToolsVisible(toolsEnum.DeleteDevice, [policyEnum.DeleteDevice], row, row)" :command="toolsEnum.DeleteDevice">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-pagination
          :current-page="pager.pageNum"
          :page-size="pager.pageSize"
          :total="pager.totalNum"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <move-dir
      v-if="dialog[toolsEnum.MoveDevice]"
      :device="currentDevice"
      :devices="selectedDeviceList"
      :is-batch="isBatchMoveDir"
      @on-close="handleListTools(toolsEnum.CloseDialog, toolsEnum.MoveDevice, $event)"
    />
    <upload-excel v-if="dialog[toolsEnum.Import]" :file="selectedFile" :data="fileData" @on-close="handleListTools(toolsEnum.CloseDialog, toolsEnum.Import, $event)" />
    <resource-edit v-if="dialog[toolsEnum.UpdateResource]" :device="{ device: currentDevice }" @on-close="handleListTools(toolsEnum.CloseDialog, toolsEnum.UpdateResource, $event)" />
    <ExportTemplateAddressVue v-if="dialog[toolsEnum.ExportTemplate]" @on-close="handleListTools(toolsEnum.CloseDialog, toolsEnum.ExportTemplate, $event)" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch, Inject, Prop } from 'vue-property-decorator'
import { Device, DeviceBasic, VideoDevice, ViidDevice } from '@vss/device/type/Device'
import { DeviceEnum, DirectoryTypeEnum, ToolsEnum, StatusEnum } from '@vss/device/enums/index'
import { PolicyEnum } from '@vss/base/enums/iam'
import { DeviceType as DeviceTypeDic, DeviceFiltersLabel, VideoStatus, StreamStatus, RecordStatus, ViidStatus } from '@vss/device/dicts/index'
import { checkPermission } from '@vss/base/utils/permission'
import { checkDeviceToolsVisible, checkDeviceColumnsVisible, checkVideoVisible, checkViidVisible } from '@vss/device/utils/param'
import { getDevices } from '@vss/device/api/device'
import { previewAuthActions } from '@vss/device/api/dir'
import { dateFormat } from '@vss/base/utils/date'
import * as dicts from '@vss/device/dicts'
import deviceMixin from '@vss/device/mixin/deviceMixin'
import DeviceManager from '@vss/device/services/Device/DeviceManager'
import ResizeObserver from 'resize-observer-polyfill'
import MoveDir from '@vss/device/components/MoveDir.vue'
import UploadExcel from '@vss/device/components/UploadExcel.vue'
import ResourceEdit from '@vss/device/components/Resource/Edit.vue'
import ExportTemplateAddressVue from '@vss/device/components//ExportTemplateAddress.vue'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'DeviceList',
  components: {
    MoveDir,
    UploadExcel,
    ResourceEdit,
    ExportTemplateAddressVue
  }
})
export default class extends Mixins(deviceMixin) {
  @Inject('handleTools')
  private handleTools!: Function
  @Inject('handleTreeNode')
  private handleTreeNode!: Function
  @Prop({
    default: () => getDevices
  })
  private getDevicesApi: Function
  private checkPermission = checkPermission
  private deviceEnum = DeviceEnum
  private toolsEnum = ToolsEnum
  private statusEnum = StatusEnum
  private policyEnum = PolicyEnum
  private deviceFiltersLabel = DeviceFiltersLabel
  private deviceTypeDic = DeviceTypeDic
  private videoStatus = VideoStatus
  private streamStatus = StreamStatus
  private recordStatus = RecordStatus
  private viidStatus = ViidStatus
  private dicts = dicts
  private dateFormat = dateFormat

  private tableKey: string = 'ct' + new Date().getTime()
  private deviceList: Array<Device> = []
  private selectedDeviceList: Array<Device> = []
  private tableMaxHeight: any = null
  private observer: any = null
  private pollingTimes = 1
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
    totalNum: 5
  }

  private loading = {
    info: false,
    export: false,
    table: false,
    syncDevice: false,
    syncDeviceStatus: false
  }

  private deviceActions = null

  // 定时刷新
  private refreshCount = {
    target: 0, // 目标总的刷新次数
    index: 0 // 当前刷新的次数
  }

  private refreshTimeout = null

  private dialog = {
    [ToolsEnum.MoveDevice]: false,
    [ToolsEnum.Import]: false,
    [ToolsEnum.UpdateResource]: false,
    [ToolsEnum.ExportTemplate]: false,
  }

  private isBatchMoveDir = false
  private currentDevice = null
  private selectedFile = null
  private fileData = null

  // 筛选类型
  private filtersArray = {
    [DeviceEnum.DeviceType]: this.dictToFilterArray(DeviceTypeDic),
    [DeviceEnum.VideoStatus]: this.dictToFilterArray(VideoStatus),
    [DeviceEnum.StreamStatus]: this.dictToFilterArray(StreamStatus),
    [DeviceEnum.RecordStatus]: this.dictToFilterArray(RecordStatus),
    [DeviceEnum.ViidStatus]: this.dictToFilterArray(ViidStatus)
  }

  // 功能回调字典
  private handleListToolsMap = {
    [ToolsEnum.AddDevice]: () => DeviceManager.addDevice(this, this.currentDirId),
    [ToolsEnum.ViewDevice]: (row) => DeviceManager.viewDevice(this, row ? row[DeviceEnum.DeviceId] : this.currentDirId, row ? row[DeviceEnum.DeviceType] : DirectoryTypeEnum.Dir),
    [ToolsEnum.EditDevice]: (row) => DeviceManager.editDevice(this, row ? row[DeviceEnum.DeviceId] : this.currentDirId, row ? row[DeviceEnum.DeviceType] : DirectoryTypeEnum.Dir),
    [ToolsEnum.DeleteDevice]: (row, inProtocol) => DeviceManager.deleteDevice(this, row, inProtocol),
    [ToolsEnum.SyncDevice]: () => DeviceManager.syncDevice(this, this.currentDirId),
    [ToolsEnum.SyncDeviceStatus]: () => DeviceManager.syncDeviceStatus(this.getVueComponent, this.currentDirId, this.currentDirType),
    [ToolsEnum.RefreshRouterView]: (flag?) => DeviceManager.refreshRouterView(this, flag),
    [ToolsEnum.ViewChannels]: (row) => DeviceManager.viewChannels(this, row),
    [ToolsEnum.ConfigureChannels]: (data) => DeviceManager.configureChannels(this, data),
    [ToolsEnum.ExportAll]: (data,) => DeviceManager.exportDeviceExcel(this, ToolsEnum.ExportAll, data),
    [ToolsEnum.ExportCurrentPage]: (data) => DeviceManager.exportDeviceExcel(this, ToolsEnum.ExportCurrentPage, data),
    [ToolsEnum.ExportSelected]: (data) => DeviceManager.exportDeviceExcel(this, ToolsEnum.ExportSelected, data),
    [ToolsEnum.Import]: (data) => DeviceManager.uploadExcel(this.getVueComponent, data, this.currentDirId),
    [ToolsEnum.ExportTemplate]: () => DeviceManager.exportTemplate(this),
    [ToolsEnum.MoveDevice]: (row) => DeviceManager.openListDialog(this.getVueComponent, ToolsEnum.MoveDevice, row),
    [ToolsEnum.StartDevice]: (row) => DeviceManager.startOrStopDevice(this, ToolsEnum.StartDevice, row),
    [ToolsEnum.StopDevice]: (row) => DeviceManager.startOrStopDevice(this, ToolsEnum.StopDevice, row),
    [ToolsEnum.StartRecord]: (row) => DeviceManager.startOrStopRecord(this, ToolsEnum.StartRecord, row),
    [ToolsEnum.StopRecord]: (row) => DeviceManager.startOrStopRecord(this, ToolsEnum.StopRecord, row),
    [ToolsEnum.UpdateResource]: (row) => DeviceManager.openListDialog(this.getVueComponent, ToolsEnum.UpdateResource, row),
    [ToolsEnum.CloseDialog]: (type, isfresh) => DeviceManager.closeListDialog(this, type, isfresh),
    [ToolsEnum.PreviewEvents]: (row) => DeviceManager.previewEvents(this, row),
    [ToolsEnum.PreviewVideo]: (row) => DeviceManager.previewVideo(this, row),
    [ToolsEnum.ReplayVideo]: (row) => DeviceManager.replayVideo(this, row),
    [ToolsEnum.PreviewViid]: (row) => DeviceManager.previewViid(this, row)
  }

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device.device || {}
  }

  // 视图库/视频接入协议
  public get inProtocol() {
    return (this.device.videos && this.device.videos.length && this.device.videos[0].inVideoProtocol) || (this.device.viids && this.device.viids.length && this.device.viids[0].inViidProtocol)
  }

  // 视频接入信息
  private get videoInfo(): VideoDevice {
    return (this.inProtocol && this.device.videos[0][dicts.InVideoProtocolModelMapping[this.inProtocol]]) || {}
  }

  // 视图库接入信息
  private get viidInfo(): ViidDevice {
    return (this.inProtocol && this.device.viids[0][dicts.InViidProtocolModelMapping[this.inProtocol]]) || {}
  }

  private get filterButtons() {
    const buttons = []
    for (const key in this.filterForm) {
      const value = this.filterForm[key]
      value && (buttons.push({ key, value }))
    }
    return buttons
  }

  private get tableContainer() {
    return this.$refs.tableContainer as any
  }

  private get deviceTable() {
    // table与tableKey实现数据响应关联
    return this.tableKey && this.$refs.deviceTable as any
  }

  private get currentDirId() {
    return this.$route.query.dirId as string
  }

  private get currentDirType() {
    return this.$route.query.type as DirectoryTypeEnum || DirectoryTypeEnum.Dir
  }

  @Watch('$route.query.refreshFlag', { deep: true, immediate: true })
  private async refreshFlagChange(val) {
    if (val > 0) {
      this.refreshCount.target = val
      this.refreshCount.index = 0
      this.initList(false)
      this.handleTools(ToolsEnum.RefreshRouterView, 0)
    }
  }

  @Watch('$route.query.dirId')
  private async dirIdChange() {
    // 重置列表筛选条件
    this.filterForm = {
      [DeviceEnum.DeviceType]: undefined,
      [DeviceEnum.VideoStatus]: undefined,
      [DeviceEnum.StreamStatus]: undefined,
      [DeviceEnum.RecordStatus]: undefined,
      [DeviceEnum.ViidStatus]: undefined
    }
  }

  @Watch('filterForm', { deep: true, immediate: true })
  private onFilterChange() {
    this.pager.pageNum = 1
    this.initList()
  }

  @Watch('fileData', { deep: true, immediate: true })
  onFileDataChange(){
    console.log('fileData------>', this.fileData)
  }
  
  private mounted() {
    this.initTableSize()
  }

  private beforeDestroy() {
    this.tableContainer && this.observer.unobserve(this.tableContainer)
    clearTimeout(this.refreshTimeout)
  }

  public getVueComponent() {
    return this
  }

  /**
   * 设备列表初始化
   */
  private async initList(isLoading = true) {
    this.loading.table = isLoading
    if ([DirectoryTypeEnum.Nvr, DirectoryTypeEnum.Platform, DirectoryTypeEnum.Role].includes(this.currentDirType)) {
      this.loading.info = isLoading
      try {
        await this.getDevice(this.currentDirId)
      } catch (e) {
        this.$message.error(e && e.message)
      }
      this.loading.info = false
    } else if ([DirectoryTypeEnum.Dir].includes(this.currentDirType) && this.currentDirId) {
      this.loading.info = isLoading
      try {
        await this.getDir(this.currentDirId)
      } catch (e) {
        this.$message.error(e && e.message)
      }
      this.loading.info = false
    }
    this.initTable(isLoading)
  }

  /**
   * 设备table初始化
   */
  private async initTable(isLoading = true) {
    this.loading.table = isLoading
    const params = {
      [DeviceEnum.DeviceType]: this.filterForm[DeviceEnum.DeviceType],
      [DeviceEnum.DeviceStatus]: this.filterForm[DeviceEnum.VideoStatus],
      [DeviceEnum.StreamStatus]: this.filterForm[DeviceEnum.StreamStatus],
      [DeviceEnum.RecordStatus]: this.filterForm[DeviceEnum.RecordStatus],
      [DeviceEnum.ViidStatus]: this.filterForm[DeviceEnum.ViidStatus],
      [DeviceEnum.PageNum]: this.pager.pageNum,
      [DeviceEnum.PageSize]: this.pager.pageSize
    }
    if ([DirectoryTypeEnum.Dir, DirectoryTypeEnum.Role].includes(this.currentDirType)) {
      params[DeviceEnum.DirId] = this.currentDirId
    } else {
      params[DeviceEnum.ParentDeviceId] = this.currentDirId
    }
    let res
    try {
      // 当前设备-IAM权限查询
      if (UserModule.iamUserId) {
        const type: any = this.currentDirType
        const path: any = this.$route.query.path
        const pathArr = path ? path.split(',') : []
        const permissionRes = await previewAuthActions({
          targetResources: [{
            dirPath: ((type === 'dir' || type === 'platformDir') ? pathArr.join('/') : pathArr.slice(0, -1).join('/')) || '0',
            deviceId: this.currentDirId || undefined
          }]
        })
        this.deviceActions = permissionRes.result[0].iamUser.actions
      }

      res = await this.getDevicesApi(params)
      // 列表-IAM权限查询
      if (UserModule.iamUserId && res.devices.length) {
        const path: any = this.$route.query.path
        const pathArr = path ? path.split(',') : []
        const permissionRes = await previewAuthActions({
          targetResources: res.devices.map((device: any) => ({
            dirPath: pathArr.join('/') || '0',
            deviceId: device.deviceId
          }))
        })
        res.devices = res.devices.map((device: any, index: number) => ({
          ...device,
          ...permissionRes.result[index].iamUser.actions
        }))
      }
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      // 进行多次刷新，保证设备相关状态的更新
      if (this.refreshCount.index < this.refreshCount.target) {
        this.refreshTimeout = setTimeout(() => this.initTable(isLoading), 5000)
        this.refreshCount.index++
      }
    }
    this.deviceList = res.devices
    this.pager.totalNum = +res.totalNum
    this.loading.table = false
    // 更新table组件key值以保证组件重新渲染
    this.tableKey = 'ct' + new Date().getTime()
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
   * 判断是否显示设备信息字段
   * @param prop 字段名
   * @param permissions 策略名
   * @param row 具体信息
   */
  private checkInfoVisible(prop) {
    return (this.hasVideo ? checkVideoVisible : checkViidVisible).call(this.basicInfo, this.basicInfo.deviceType, this.inProtocol, prop)
  }

  /**
   * 判断是否显示tools
   * @param prop 字段名
   * @param permissions 生效权限列表，满足其中之一即生效
   * @param row 具体信息
   * @param actions 权限判断对应actions，可传入action对象，或者action对象数组
   */
  private checkToolsVisible(prop, permissions?, row?, actions?) {
    !row && (row = {
      deviceType: this.currentDirType,
      inProtocol: this.inProtocol,
      deviceFrom: this.deviceFrom,
      isRoleShared: this.isRoleShared,
    })
    return checkDeviceToolsVisible(row.deviceType, prop, row) && checkPermission(permissions, actions)
  }

  /**
   * 判断是否显示coloumns
   * @param prop 字段名
   * @param type 目录类型
   */
  private checkColumnsVisible(prop, type = this.currentDirType) {
    return checkDeviceColumnsVisible(type, prop, this.inProtocol)
  }

  /**
   * 列表行点击触发回调
   * @param row 行信息
   * @param column column名
   */
  private rowClick(row: Device, column: any) {
    if (column.property !== 'action' && column.property !== 'selection') {
      this.handleTreeNode({ id: row[DeviceEnum.DeviceId], type: row[DeviceEnum.DeviceType] })
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
    for (const key in filters) {
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
    for (const key in dict) {
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
