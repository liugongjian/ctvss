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
        <info-list-item v-if="deviceInfo.createSubDevice === 2" label="可支持通道数量:">{{ deviceInfo.deviceStats.maxChannelSize }}</info-list-item>
        <info-list-item v-else label="通道数量:">{{ deviceInfo.deviceStats.maxChannelSize }}</info-list-item>
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
        <el-button v-if="(isDir || deviceInfo && deviceInfo.createSubDevice === 2) && checkPermission(['*'])" key="dir-button" type="primary" @click="goToCreate">{{ isNVR ? '添加子设备' : '添加设备' }}</el-button>
        <el-button v-if="isNVR" key="check-nvr-detail" @click="goToDetail(deviceInfo)">查看NVR设备详情</el-button>
        <el-button v-if="isNVR && checkPermission(['*'])" key="edit-nvr" @click="goToUpdate(deviceInfo)">编辑NVR设备</el-button>
        <el-button v-if="isPlatform" key="check-platform" @click="goToDetail(deviceInfo)">查看Platform详情</el-button>
        <el-button v-if="isPlatform && checkPermission(['*'])" key="edit-platform" @click="goToUpdate(deviceInfo)">编辑Platform</el-button>
        <el-button v-if="isPlatform" key="sync" :loading="loading.syncDevice" @click="syncDevice">同步</el-button>
        <el-dropdown trigger="click" placement="bottom-start" style="margin: 10px" @command="exportExcel">
          <el-button :loading="exportLoading">导出</el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="exportAll" :disabled="!deviceList.length">导出全部</el-dropdown-item>
            <el-dropdown-item command="exportCurrentPage" :disabled="!deviceList.length">导出当前页</el-dropdown-item>
            <el-dropdown-item command="exportSelect" :disabled="!selectedDeviceList.length">导出选定项</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-upload
          v-if="!isNVR && checkPermission(['*'])"
          ref="excelUpload"
          action="#"
          :show-file-list="false"
          :http-request="uploadExcel"
          class="filter-container__import-button"
        >
          <el-button>导入</el-button>
        </el-upload>
        <el-button v-permission="['*']" @click="exportTemplate">下载模板</el-button>
        <el-dropdown key="dropdown" v-permission="['*']" placement="bottom" @command="handleBatch">
          <el-button :disabled="!selectedDeviceList.length">批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="!isNVR && !isPlatform" command="move">移动至</el-dropdown-item>
            <el-dropdown-item command="startDevice">启用流</el-dropdown-item>
            <el-dropdown-item command="stopDevice">停用流</el-dropdown-item>
            <el-dropdown-item v-if="!isNVR || (deviceInfo && deviceInfo.createSubDevice === 2)" command="delete">删除</el-dropdown-item>
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
        <span v-if="key === 'recordStatus'">{{ recordStatus[value] }}</span>
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
          label="录制状态"
          min-width="110"
          :filters="filtersArray.recordStatus"
          :filter-multiple="false"
        >
          <template slot="header">
            <span class="filter">录制状态</span>
            <svg-icon class="filter" name="filter" width="15" height="15" />
          </template>
          <template slot-scope="{row}">
            <span v-if="row.deviceType === 'nvr'">-</span>
            <span v-else><status-badge :status="row.recordStatus === 1 ? 'red' : ''" />{{ recordStatus[row.recordStatus] || '-' }}</span>
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
            <el-button type="text" :disabled="scope.row.deviceType === 'nvr' || scope.row.deviceType === 'platform'" @click="goToPreview('preview', scope.row)">实时预览</el-button>
            <el-button type="text" :disabled="scope.row.deviceType === 'nvr' || scope.row.deviceType === 'platform'" @click="goToPreview('replay', scope.row)">录像回放</el-button>
            <el-button type="text" disabled @click="goToPreview('snapshot', scope.row)">查看截图</el-button>
            <el-dropdown @command="handleMore">
              <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="scope.row.deviceType === 'nvr'" :command="{type: 'nvr', device: scope.row}">查看通道</el-dropdown-item>
                <el-dropdown-item v-if="isNVR" :command="{type: 'detail', device: scope.row}">通道详情</el-dropdown-item>
                <el-dropdown-item v-else :command="{type: 'detail', device: scope.row}">设备详情</el-dropdown-item>
                <template v-if="scope.row.deviceType === 'ipc'">
                  <el-dropdown-item v-if="scope.row.streamStatus === 'on' && checkPermission(['*'])" :command="{type: 'stopDevice', device: scope.row}">停用流</el-dropdown-item>
                  <el-dropdown-item v-else-if="checkPermission(['*'])" :command="{type: 'startDevice', device: scope.row}">启用流</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.recordStatus === 1 && checkPermission(['*'])" :command="{type: 'stopRecord', device: scope.row}">停止录像</el-dropdown-item>
                  <el-dropdown-item v-else-if="checkPermission(['*'])" :command="{type: 'startRecord', device: scope.row}">开始录像</el-dropdown-item>
                </template>
                <el-dropdown-item v-if="(!isNVR && scope.row.parentDeviceId === '-1') && checkPermission(['*'])" :command="{type: 'move', device: scope.row}">移动至</el-dropdown-item>
                <el-dropdown-item v-if="checkPermission(['*'])" :command="{type: 'update', device: scope.row}">编辑</el-dropdown-item>
                <!--自动创建的子通道不允许删除-->
                <el-dropdown-item v-if="!(scope.row.createSubDevice === 1 && scope.row.channelNum) && checkPermission(['*'])" :command="{type: 'delete', device: scope.row}">删除</el-dropdown-item>
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
      <div v-if="isNVR" class="el-pagination">
        <div class="el-pagination__total">共{{ deviceList.length }}条</div>
      </div>
      <div v-if="!deviceList.length && !loading.list" class="device-list__empty-text">
        当前{{ isNVR ? 'NVR' : '目录' }}暂无设备
      </div>
    </div>
    <move-dir v-if="dialog.moveDir" :in-protocol="inProtocol" :device="currentDevice" :devices="selectedDeviceList" :is-batch="isBatchMoveDir" @on-close="closeDialog('moveDir', ...arguments)" />
    <upload-excel v-if="dialog.uploadExcel" :file="selectedFile" :data="fileData" @on-close="closeDialog('uploadExcel', ...arguments)" />
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import listMixin from '../mixin/listMixin'
import excelMixin from '../mixin/excelMixin'

@Component({
  name: 'DeviceGb28181List'
})
export default class extends Mixins(listMixin, excelMixin) {
  private exportLoading = false
  /**
   * 导入设备表
   */
  private uploadExcel(data: any) {
    if (data.file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || data.file.type === 'application/vnd.ms-excel') {
      this.dialog.uploadExcel = true
      this.selectedFile = data.file
      this.fileData = {
        groupId: this.groupId,
        inProtocol: this.inProtocol,
        dirId: this.dirId,
        fileName: data.file.name
      }
      this.isNVR && (this.fileData.parentDeviceId = this.deviceInfo.parentDeviceId)
    } else {
      this.$message.error('导入文件必须为表格')
    }
  }

  /**
   * 导出设备表
   */
  private async exportExcel(command: any) {
    this.exportLoading = true
    try {
      let params: any = {
        groupId: this.groupId,
        inProtocol: this.inProtocol,
        dirId: this.dirId,
        parentDeviceId: this.deviceId
      }
      // this.isNVR && (params.parentDeviceId = this.deviceInfo.parentDeviceId)
      if (command === 'exportAll') {
        params.command = 'all'
      } else {
        params.command = 'selected'
        let deviceArr: any = []
        if (command === 'exportCurrentPage') {
          deviceArr = this.deviceList
        } else if (command === 'exportSelect') {
          deviceArr = this.selectedDeviceList
        }
        params.deviceIds = deviceArr.map((device: any) => {
          return { deviceId: device.deviceId }
        })
      }
      await this.exportDevicesExcel(params)
    } catch (e) {
      this.$message.error('导出失败')
      console.log(e)
    }
    this.exportLoading = false
  }

  /**
   * 导出模板
   */
  private exportTemplate() {
    this.exelType = 'template'
    this.exelDeviceType = 'gb28181'
    this.exelName = 'GB28181导入模板'
    this.exportExel()
  }
}
</script>
