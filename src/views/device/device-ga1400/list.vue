<template>
  <div ref="listWrap" class="device-list__container">
    <div ref="filterWrap" class="filter-container clearfix">
      <div class="filter-container__left">
        <el-button v-if="!isVGroup && isDir && checkPermission(['AdminDevice'], {id: dirId !== '0' ? dirId : currentGroupId})" key="dir-button" type="primary" @click="goToCreate">{{ '添加设备' }}</el-button>
        <el-button v-if="!isVGroup && isPlatform" key="sync" :loading="loading.syncDevice" @click="syncDevice">同步</el-button>
        <!-- <el-dropdown v-if="!isVGroup && checkPermission(['AdminDevice'], {id: dirId !== '0' ? dirId : currentGroupId})" placement="bottom" @command="exportExcel">
          <el-button :loading="exportLoading">导出<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="exportAll" :disabled="!deviceList.length">导出全部</el-dropdown-item>
            <el-dropdown-item command="exportCurrentPage" :disabled="!deviceList.length">导出当前页</el-dropdown-item>
            <el-dropdown-item command="exportSelect" :disabled="!selectedDeviceList.length">导出选定项</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown> -->
        <!-- <el-upload
          v-if="!isVGroup && (isDir || isManulNVR) && checkPermission(['AdminDevice'], {id: dirId !== '0' ? dirId : currentGroupId})"
          ref="excelUpload"
          action="#"
          :show-file-list="false"
          :http-request="uploadExcel"
          class="filter-container__import-button"
        >
          <el-button>导入</el-button>
        </el-upload> -->
        <!-- <el-button v-if="!isVGroup && checkPermission(['AdminDevice'], {id: dirId !== '0' ? dirId : currentGroupId}) && (isDir || isManulNVR)" @click="exportTemplate">下载模板</el-button> -->
        <el-dropdown v-if="!isVGroup && checkPermission(['AdminDevice'], {id: dirId !== '0' ? dirId : currentGroupId})" key="dropdown" placement="bottom" @command="handleBatch">
          <el-button :disabled="!selectedDeviceList.length">批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="!isNVR && !isPlatform && !isChannel" command="move">移动至</el-dropdown-item>
            <el-dropdown-item v-if="isAllowedDelete" command="delete">删除</el-dropdown-item>
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
        <el-table-column
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
        <el-table-column v-if="isGb && !isNVR" key="deviceIp" label="IP" min-width="130">
          <template slot-scope="{row}">
            {{ row.deviceIp || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="isGb && !isNVR" key="devicePort" label="端口">
          <template slot-scope="{row}">
            {{ row.devicePort || '-' }}
          </template>
        </el-table-column>
        <el-table-column key="createdTime" label="创建时间" min-width="180">
          <template slot-scope="{row}">
            {{ row.createdTime }}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="deviceList.length && (isRealGroup || isDir || isPlatformDir)"
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
      if (this.isNVR) {
        this.fileData.parentDeviceId = this.deviceInfo.deviceId
        delete this.fileData.dirId
      }
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
    this.regionName = this.groupData?.regionName || ''
    this.excelGroupDate = this.groupData
    if (this.isNVR) {
      this.exelDeviceType = 'nvr'
      this.exelName = 'NVR添加子设备导入模板'
      this.excelInProtocol = this.deviceInfo.inProtocol
      this.parentDeviceId = this.deviceInfo.deviceId
    }
    this.exportExel()
  }
}
</script>
