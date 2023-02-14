<template>
  <div ref="listWrap" class="device-list__container">
    <div v-if="isPlatform" v-loading="loading.info" class="device-info">
      <info-list v-if="deviceInfo" label-width="80">
        <info-list-item label="平台名称:">{{ deviceInfo.deviceName }}</info-list-item>
        <info-list-item label="国标ID:">{{ deviceInfo.gbId }}</info-list-item>
        <info-list-item label="创建时间:">{{ deviceInfo.createdTime }}</info-list-item>
      </info-list>
    </div>
    <div ref="filterWrap" class="filter-container clearfix">
      <div v-if="!isVGroup" class="filter-container__left">
        <el-button v-if="isMainUser && !isVGroup" @click="describePermission">查看权限</el-button>
        <el-button :disabled="!selectedDeviceList.length" @click="exportCsv">导出</el-button>
        <el-dropdown v-permission="['*']" placement="bottom" @command="handleBatch">
          <el-button :disabled="!selectedDeviceList.length">批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="move">移动至</el-dropdown-item>
            <el-dropdown-item command="startDevice">启用流</el-dropdown-item>
            <el-dropdown-item command="stopDevice">停用流</el-dropdown-item>
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
    <div v-if="hasFiltered" ref="filterBtnWrap" class="filter-container filter-buttons">
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
            <span v-else><status-badge :status="row.recordStatus === 1 ? 'on' : ''" />{{ recordStatus[row.recordStatus] || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column key="devicePosition" prop="devicePosition" label="地点">
          <template slot-scope="{row}">
            {{ row.devicePosition || '-' }}
          </template>
        </el-table-column>
        <el-table-column key="deviceModel" prop="deviceModel" label="设备型号" min-width="200">
          <template slot-scope="{row}">
            {{ row.deviceModel || '-' }}
          </template>
        </el-table-column>
        <el-table-column key="deviceHardware" prop="deviceHardware" label="硬件" min-width="120">
          <template slot-scope="{row}">
            {{ row.deviceHardware || '-' }}
          </template>
        </el-table-column>
        <el-table-column key="deviceFirmware" prop="deviceFirmware" label="固件">
          <template slot-scope="{row}">
            {{ row.deviceFirmware || '-' }}
          </template>
        </el-table-column>
        <el-table-column key="deviceVendor" prop="deviceVendor" label="厂商">
          <template slot-scope="{row}">
            {{ row.deviceVendor || '-' }}
          </template>
        </el-table-column>
        <el-table-column key="devicePubIp" prop="devicePubIp" label="公网IP地址" min-width="120">
          <template slot-scope="{row}">
            {{ row.devicePubIp || '-' }}
          </template>
        </el-table-column>
        <el-table-column key="deviceIp" prop="deviceIp" label="局域网IP地址" min-width="120">
          <template slot-scope="{row}">
            {{ row.deviceIp || '-' }}
          </template>
        </el-table-column>
        <el-table-column key="createdTime" label="创建时间" min-width="180">
          <template slot-scope="{row}">
            {{ row.createdTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="action" class-name="col-action" width="270" fixed="right">
          <template slot-scope="scope">
            <el-button v-if="checkPermission(['ScreenPreview'])" type="text" :disabled="scope.row.deviceType === 'nvr'" @click="goToPreview('preview', scope.row)">实时预览</el-button>
            <el-button v-if="checkPermission(['ReplayRecord'])" type="text" :disabled="scope.row.deviceType === 'nvr'" @click="goToPreview('replay', scope.row)">录像回放</el-button>
            <!-- <el-button type="text" disabled @click="goToPreview('snapshot', scope.row)">查看截图</el-button> -->
            <el-dropdown @command="handleMore">
              <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{type: 'detail', device: scope.row}">设备详情</el-dropdown-item>
                <el-dropdown-item v-if="!isVGroup && scope.row.streamStatus === 'on' && checkPermission(['AdminDevice'])" :command="{type: 'stopDevice', device: scope.row}">停用流</el-dropdown-item>
                <el-dropdown-item v-else-if="!isVGroup && checkPermission(['AdminDevice'])" :command="{type: 'startDevice', device: scope.row}">启用流</el-dropdown-item>
                <el-dropdown-item v-if="!isVGroup && scope.row.recordStatus === 1 && checkPermission(['AdminDevice'])" :command="{type: 'stopRecord', device: scope.row}">停止录像</el-dropdown-item>
                <el-dropdown-item v-else-if="!isVGroup && checkPermission(['AdminDevice'])" :command="{type: 'startRecord', device: scope.row}">开始录像</el-dropdown-item>
                <el-dropdown-item v-if="!isVGroup && !isNVR && checkPermission(['AdminDevice'])" :command="{type: 'move', device: scope.row}">移动至</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="deviceList.length && (isRealGroup || isDir || isPlatform)"
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
    <move-dir v-if="dialog.moveDir" :in-protocol="inProtocol" :device="currentDevice" :devices="selectedDeviceList" :is-batch="isBatchMoveDir" @on-close="closeDialog('moveDir', ...arguments)" />
    <describe-permission v-if="dialog.describePermission" :dialog-data="describePermissonDialogData" @on-close="closeDialog('describePermission', ...arguments)" />
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import listMixin from '../mixin/listMixin'
import { ExportToCsv } from 'export-to-csv'
import { Device } from '@/type/Device'

@Component({
  name: 'DeviceRtmpList'
})
export default class extends Mixins(listMixin) {
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
}
</script>
