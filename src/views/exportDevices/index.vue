<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <div class="filter-container__right">
          <el-button type="primary" @click="exportInfo">导出设备信息</el-button>
        </div>
      </div>
      <el-table ref="deviceTable" v-loading="loading" :data="deviceList" fit>
        <template
          v-for="(item, index) in columnList"
        >
          <el-table-column
            v-if="Object.keys(deviceParamsMap).includes(item.prop)"
            :key="index" :prop="item.prop"
            :label="item.label"
            min-width="170"
          >
            <template slot-scope="{row}">
              {{ deviceParamsMap[item.prop][row[item.prop]] || row[item.prop] }}
            </template>
          </el-table-column>
          <el-table-column
            v-else
            :key="index" :prop="item.prop"
            :label="item.label"
            min-width="170"
          >
            <template slot-scope="{row}">
              {{ row[item.prop] === -1 ? '-' : row[item.prop] }}
            </template>
          </el-table-column>
        </template>
      </el-table>
      <el-pagination
        :current-page="pager.pageNum"
        :page-size="pager.pageSize"
        :total="pager.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator'
import { columnList } from './assets/column-list/qingyuan'
import { deviceParamsMap } from './assets/dicts/qingyuan'
import { getDetailList, getDetailExport } from '@/api/exportDevices'
import excelMixin from './mixin/excelMixin'
@Component({
  name: 'ExportDevices'
})

export default class extends Mixins(Vue, excelMixin) {
  private loading = false
  private deviceList: any = []
  private columnList: any = columnList
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private deviceParamsMap: any = deviceParamsMap

  private mounted() {
    this.getDeviceList()
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getDeviceList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getDeviceList()
  }

  private async getDeviceList() {
    let params = {
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    let res = await getDetailList(params)
    this.deviceList = res.devices
    this.pager.total = res.totalNum
  }

  private async getExportDevices() {
    let params = {
      pageNum: -1
    }
    let res = await getDetailExport(params)
    res.exportFile && this.downloadFileUrl('设备信息表格', res.exportFile)
  }

  private async exportInfo() {
    this.columns = this.columnList
    this.exportData = await this.getExportDevices()
    this.exelName = '设备信息表'
    // this.exportExel()
  }
}
</script>
