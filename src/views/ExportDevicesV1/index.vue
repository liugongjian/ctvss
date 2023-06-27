<!--
 * @Author: liugj liugj@chinatelecom.cn
 * @Date: 2023-05-25 15:49:12
 * @LastEditors: liugj liugj@chinatelecom.cn
 * @LastEditTime: 2023-06-05 15:09:59
 * @FilePath: \vss-user-web\src\views\ExportDevices\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <div class="filter-container__right">
          <el-button :loading="loading.export" type="primary" @click="exportInfo">导出设备信息</el-button>
        </div>
      </div>
      <el-table ref="deviceTable" v-loading="loading.list" :data="deviceList" fit>
        <template
          v-for="(item, index) in columnList"
        >
          <el-table-column
            v-if="Object.keys(deviceParamsMap).includes(item.prop)"
            :key="index" :prop="item.prop"
            :label="item.label"
            min-width="170"
          >
            <template slot-scope="{ row }">
              {{ deviceParamsMap[item.prop][row[item.prop]] || row[item.prop] }}
            </template>
          </el-table-column>
          <el-table-column
            v-else
            :key="index" :prop="item.prop"
            :label="item.label"
            min-width="170"
          >
            <template slot-scope="{ row }">
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
import { Component, Vue, Mixins, Watch } from 'vue-property-decorator'
import { columnList } from './assets/column-list/qingyuan'
import { deviceParamsMap } from './assets/dicts/qingyuan'
import { getDetailList, getDetailExport } from '@/api/exportDevices'
import excelMixin from './mixin/excelMixin'
@Component({
  name: 'ExportDevices'
})

export default class extends Mixins(Vue, excelMixin) {
  private loading = {
    list: false,
    export: false
  }
  private deviceList: any = []
  private columnList: any = columnList
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private deviceParamsMap: any = deviceParamsMap

  @Watch('deviceList.length')
  public onDeviceListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

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
    this.loading.list = true
    const params = {
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    const res = await getDetailList(params)
    this.deviceList = res.devices
    this.pager.total = res.totalNum
    this.loading.list = false
  }

  private async getExportDevices() {
    const params = {
      pageNum: -1
    }
    const res = await getDetailExport(params)
    res.exportFile && this.downloadFileUrl('设备信息表格', res.exportFile)
  }

  private async exportInfo() {
    this.loading.export = true
    this.columns = this.columnList
    this.exportData = await this.getExportDevices()
    this.exelName = '设备信息表'
    // this.exportExel()
    this.loading.export = false
  }
}
</script>
