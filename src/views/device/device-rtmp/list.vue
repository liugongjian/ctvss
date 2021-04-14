<template>
  <div class="device-list__container">
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
    <div class="filter-container clearfix">
      <div class="filter-container__left">
        <el-button v-if="isDir || deviceInfo" type="primary" @click="goToCreate">{{ isNVR ? '添加子设备' : '添加设备' }}</el-button>
        <el-button v-if="isPlatform" @click="goToDetail(deviceInfo)">查看Platform详情</el-button>
        <el-button v-if="isPlatform" @click="goToUpdate(deviceInfo)">编辑Platform</el-button>
        <el-button v-if="isPlatform" :loading="loading.syncDevice" @click="syncDevice">同步</el-button>
        <el-dropdown trigger="click" placement="bottom-start" style="margin: 10px" @command="exportExcel">
          <el-button>导出</el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="exportAll" :disabled="!deviceList.length">导出全部</el-dropdown-item>
            <el-dropdown-item command="exportCurrentPage" :disabled="!deviceList.length">导出当前页</el-dropdown-item>
            <el-dropdown-item command="exportSelect" :disabled="!selectedDeviceList.length">导出选定项</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-upload
          ref="excelUpload"
          action="https://jsonplaceholder.typicode.com/posts/"
          :show-file-list="false"
          :on-change="uploadProgress"
          :on-progress="uploadProgress"
          :on-success="uploadProgress"
          :on-error="uploadProgress"
          :auto-upload="false"
        >
          <el-button>导入</el-button>
        </el-upload>
        <el-button @click="exportTemplate">下载模板</el-button>
        <el-dropdown placement="bottom" @command="handleBatch">
          <el-button :disabled="!selectedDeviceList.length">批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="move">移动至</el-dropdown-item>
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
        <el-table-column
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
                <el-dropdown-item :command="{type: 'detail', device: scope.row}">设备详情</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.streamStatus === 'on'" :command="{type: 'stopDevice', device: scope.row}">停用流</el-dropdown-item>
                <el-dropdown-item v-else :command="{type: 'startDevice', device: scope.row}">启用流</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.recordStatus === 1 && checkPermission(['*'])" :command="{type: 'stopRecord', device: scope.row}">停止录像</el-dropdown-item>
                <el-dropdown-item v-else-if="checkPermission(['*'])" :command="{type: 'startRecord', device: scope.row}">开始录像</el-dropdown-item>
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
        当前目录暂无设备
      </div>
    </div>
    <move-dir v-if="dialog.moveDir" :device="currentDevice" :devices="selectedDeviceList" :is-batch="isBatchMoveDir" @on-close="closeDialog('moveDir', ...arguments)" />
    <upload-excel v-if="dialog.uploadExcel" :event="uploadEvent" @on-close="closeDialog('uploadExcel', ...arguments)" />
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import listMixin from '../mixin/listMixin'
import excelMixin from '../mixin/excelMixin'

@Component({
  name: 'DeviceRtmpList'
})
export default class extends Mixins(listMixin, excelMixin) {
  private uploadEvent: any = null
  /**
   * 导入设备表
   */
  private importExcel() {

  }

  private uploadProgress(event: any, filList: any) {
    if (event.status === 'ready') {
      console.log('ready')
      console.log(filList[0].raw)
    }
    // this.uploadEvent = event
    // this.dialog.uploadExcel = true
  }

  private exportExcel(command: any) {
    // switch (command) {
    //   case 'exportSelect':
    //     this.exportData = this.selectedDeviceList
    //     return
    //   case 'exportCurrentPage':
    //     this.exportData = this.deviceList
    // }
    // this.exelType = 'export'
    // this.exelDeviceType = 'rtmp'
    // this.exelName = '设备表格（rtmp）'
    // this.exportExel()
    console.log(this.groupId, this.inProtocol, this.isNVR, this.dirId);
  }

  /**
   * 导出模板
   */
  private exportTemplate() {
    this.exelType = 'template'
    this.exelDeviceType = 'rtmp'
    this.exelName = '设备导入模板（rtmp）'
    this.exportExel()
  }
}
</script>
<style lang="scss" scoped>
  div:has(.el-upload) {
    display: inline-block;
  }
</style>
