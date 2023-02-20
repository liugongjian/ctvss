<template>
  <div ref="listWrap" class="device-list__container">
    <div v-if="isNVR" ref="infoWrap" v-loading="loading.info" class="device-info">
      <info-list v-if="deviceInfo" label-width="80">
        <info-list-item label="设备名称:">{{ deviceInfo.deviceName }}</info-list-item>
        <info-list-item label="国标ID:">{{ deviceInfo.gbId }}</info-list-item>
        <info-list-item label="设备状态:">
          <status-badge :status="deviceInfo.deviceStatus" />
          {{ deviceStatus[deviceInfo.deviceStatus] }}
        </info-list-item>
        <info-list-item label="创建时间:">{{ deviceInfo.createdTime }}</info-list-item>
        <info-list-item v-if="deviceInfo.createSubDevice === 2" label="可支持通道数量:">{{ deviceInfo.deviceStats.maxChannelSize }}</info-list-item>
        <info-list-item v-else label="通道数量:">{{ deviceInfo.deviceStats.maxChannelSize }}</info-list-item>
        <info-list-item label="在线流数量:">{{ deviceInfo.deviceStats.onlineStreams }}</info-list-item>
      </info-list>
    </div>
    <div v-if="isPlatform" ref="infoWrap" v-loading="loading.info" class="device-info">
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
    <div v-if="false" ref="infoWrap" v-loading="loading.list" class="device-info">
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
    <div ref="filterWrap" class="filter-container clearfix">
      <div class="filter-container__left">
        <el-button v-if="!isVGroup && isDir && checkPermission(['ivs:CreateDevice'], deviceActions)" key="dir-button" type="primary" @click="goToCreate">{{ '添加设备' }}</el-button>
        <el-button v-if="isMainUser && !isVGroup" @click="describePermission">查看权限</el-button>
        <el-button v-if="!isVGroup && isNVR && checkPermission(['ivs:UpdateDevice'], deviceActions)" key="dir-button" type="primary" @click="goToCreate">{{ '添加子设备' }}</el-button>
        <el-button v-if="isNVR" key="check-nvr-detail" @click="goToDetail(deviceInfo)">查看NVR设备详情</el-button>
        <el-button v-if="!isVGroup && isNVR && checkPermission(['ivs:UpdateDevice'], deviceActions)" key="edit-nvr" @click="goToUpdate(deviceInfo)">编辑NVR设备</el-button>
        <el-button v-if="isPlatform" key="check-platform" @click="goToDetail(deviceInfo)">查看Platform详情</el-button>
        <el-button v-if="!isVGroup && isPlatform && checkPermission(['ivs:UpdateDevice', deviceActions])" key="edit-platform" @click="goToUpdate(deviceInfo)">编辑Platform</el-button>
        <el-button v-if="!isVGroup && isPlatform" key="sync" :loading="loading.syncDevice" @click="syncDevice">同步</el-button>
        <el-dropdown v-if="!isVGroup && checkPermission(['ivs:UpdateDevice'], deviceActions)" placement="bottom" @command="exportExcel">
          <el-button :loading="exportLoading">导出<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="exportAll" :disabled="!deviceList.length">导出所有分页</el-dropdown-item>
            <el-dropdown-item command="exportCurrentPage" :disabled="!deviceList.length">导出当前页</el-dropdown-item>
            <el-dropdown-item command="exportSelect" :disabled="!selectedDeviceList.length">导出选定项</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-upload
          v-if="!isVGroup && (isDir || isManulNVR) && checkPermission(['ivs:UpdateDevice'], deviceActions)"
          ref="excelUpload"
          action="#"
          :show-file-list="false"
          :http-request="uploadExcel"
          class="filter-container__import-button"
        >
          <el-button>导入</el-button>
        </el-upload>
        <el-button v-if="!isVGroup && checkPermission(['ivs:UpdateDevice'], deviceActions) && (isDir || isManulNVR)" @click="exportTemplate">下载模板</el-button>
        <el-dropdown v-if="!isVGroup && checkPermission(['ivs:UpdateDevice', 'ivs:DeleteDevice'], deviceActions)" key="dropdown" placement="bottom" @command="handleBatch">
          <el-button :disabled="!selectedDeviceList.length">批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="!isNVR && !isPlatform && !isChannel && checkPermission(['ivs:UpdateDevice'], deviceActions)" command="move">移动至</el-dropdown-item>
            <el-dropdown-item v-if="checkPermission(['ivs:UpdateDevice'], deviceActions)" command="startDevice">启用流</el-dropdown-item>
            <el-dropdown-item v-if="checkPermission(['ivs:UpdateDevice'], deviceActions)" command="stopDevice">停用流</el-dropdown-item>
            <el-dropdown-item v-if="isAllowedDelete && checkPermission(['ivs:DeleteDevice'], deviceActions)" command="delete">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="filter-container__right">
        <el-input v-show="false" v-model="keyword" class="filter-container__search-group" placeholder="请输入关键词">
          <el-button slot="append" class="el-button-rect"><svg-icon name="search" /></el-button>
        </el-input>
        <el-button v-if="!isVGroup && !isChannel" class="el-button-rect filter-container__sync-button" :disabled="loading.syncDeviceStatus" :class="{'loading': loading.syncDeviceStatus}" @click="syncDeviceStatus"><svg-icon name="refresh" />同步设备状态</el-button>
      </div>
    </div>
    <div v-if="hasFiltered" ref="filterBtnWrap" class="filter-container filter-buttons">
      <div v-for="{key, value} in filterButtons" :key="key" class="filter-button" @click="clearFilter(key)">
        <label>{{ deviceParams[key] }}</label>
        <span v-if="key === 'deviceType'">{{ deviceType[value] }}</span>
        <span v-if="key === 'deviceStatus'">{{ deviceStatus[value] }}</span>
        <span v-if="key === 'streamStatus'">{{ streamStatus[value] }}</span>
        <span v-if="key === 'recordStatus'">{{ recordStatusFilterType[value] }}</span>
        <svg-icon class="filter-button__close" name="close" width="10" height="10" />
      </div>
    </div>
    <div v-loading="loading.list || loading.info" class="device-list__wrap">
      <el-table v-show="deviceList.length" ref="deviceTable" :height="tableMaxHeight" :data="deviceList" empty-text="暂无设备" fit class="device-list__table" @row-click="rowClick" @selection-change="handleSelectionChange" @filter-change="filterChange">
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
          :filters="isIPC ? [] : filtersArray.deviceType"
          :filter-multiple="false"
        >
          <template slot="header">
            <span class="filter">类型</span>
            <svg-icon v-if="!isIPC" class="filter" name="filter" width="15" height="15" />
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
          :filters="isIPC ? [] : filtersArray.deviceStatus"
          :filter-multiple="false"
        >
          <template slot="header">
            <span class="filter">设备状态</span>
            <svg-icon v-if="!isIPC" class="filter" name="filter" width="15" height="15" />
          </template>
          <template slot-scope="{row}">
            <status-badge :status="row.deviceStatus" />
            {{ deviceStatus[row.deviceStatus] || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="isGb && ga1400Flag" key="inProtocol" prop="inProtocol" label="接入协议" min-width="100">
          <template slot-scope="{row}">
            {{ 'GB28181' + (row.apeId && '、GA1400') }}
          </template>
        </el-table-column>
        <el-table-column
          key="streamStatus"
          column-key="streamStatus"
          prop="streamStatus"
          label="流状态"
          min-width="110"
          :filters="isIPC ? [] : filtersArray.streamStatus"
          :filter-multiple="false"
        >
          <template slot="header">
            <span class="filter">流状态</span>
            <svg-icon v-if="!isIPC" class="filter" name="filter" width="15" height="15" />
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
          label="录制状态"
          min-width="110"
          :filters="isIPC ? [] : filtersArray.recordStatus"
          :filter-multiple="false"
        >
          <template slot="header">
            <span class="filter">录制状态</span>
            <svg-icon v-if="!isIPC" class="filter" name="filter" width="15" height="15" />
          </template>
          <template slot-scope="{row}">
            <span v-if="row.deviceType === 'nvr'">-</span>
            <span v-else><status-badge :status="recordStatusType[row.recordStatus]" />{{ recordStatus[row.recordStatus] || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column key="bitrate" min-width="100" prop="bitrate" label="当前码率">
          <template slot-scope="{row}">
            {{ row.bitrate ? (row.bitrate / 1024).toFixed(2) + 'Mbps' : '-' }}
          </template>
        </el-table-column>
        <el-table-column key="errorMessage" prop="errorMessage" label="异常提示">
          <template slot-scope="{row}">
            {{ row.errorMessage || '-' }}
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
        <el-table-column v-if="ga1400Flag && (isGb || isNVR)" key="apeId" prop="apeId" label="视图编码" min-width="190">
          <template slot-scope="{row}">
            {{ row.apeId || '-' }}
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
            <el-button v-if="checkPermission(['ScreenPreview'])" type="text" :disabled="scope.row.deviceType === 'nvr' || scope.row.deviceType === 'platform'" @click="goToPreview('preview', scope.row)">实时预览</el-button>
            <el-button v-if="checkPermission(['ReplayRecord'])" type="text" :disabled="scope.row.deviceType === 'nvr' || scope.row.deviceType === 'platform'" @click="goToPreview('replay', scope.row)">录像回放</el-button>
            <!-- <el-button type="text" disabled @click="goToPreview('snapshot', scope.row)">查看截图</el-button> -->
            <el-popover
              width="400"
              :open-delay="800"
              trigger="hover"
              @show="getEventsList(scope.row)"
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
            <el-dropdown @command="handleMore">
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
                <el-dropdown-item v-if="!isVGroup && isAllowedDelete && checkPermission(['AdminDevice'])" :command="{type: 'delete', device: scope.row}">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="deviceList.length && (isRealGroup || isDir || isPlatform || isPlatformDir)"
        :current-page="pager.pageNum"
        :page-size="pager.pageSize"
        :total="pager.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <div v-if="isNVR" class="el-pagination">
        <div class="el-pagination__total">共{{ deviceList.length }}条</div>
      </div>
      <div v-if="!deviceList.length && !loading.list" class="device-list__empty-text">
        当前{{ isNVR ? 'NVR' : '目录' }}暂无设备
      </div>
    </div>
    <move-dir v-if="dialog.moveDir" :in-protocol="inProtocol" :device="currentDevice" :devices="selectedDeviceList" :is-batch="isBatchMoveDir" @on-close="closeDialog('moveDir', ...arguments)" />
    <upload-excel v-if="dialog.uploadExcel" :file="selectedFile" :data="fileData" @on-close="closeDialog('uploadExcel', ...arguments)" />
    <resource v-if="dialog.resource" :device="currentDevice" @on-close="closeDialog('resource', ...arguments)" />
    <describe-permission v-if="dialog.describePermission" :dialog-data="describePermissonDialogData" @on-close="closeDialog('describePermission', ...arguments)" />
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import listMixin from '../mixin/listMixin'

@Component({
  name: 'DeviceGb28181List'
})
export default class extends Mixins(listMixin) {
}
</script>
