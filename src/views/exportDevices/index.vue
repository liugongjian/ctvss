<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <div class="filter-container__right">
          <el-button type="primary" @click="exportInfo">导出设备信息</el-button>
        </div>
      </div>
      <el-table ref="deviceTable" v-loading="loading" :data="deviceList" fit>
        <el-table-column
          v-for="(item, index) in columnList"
          :key="index" :prop="item.prop"
          :label="item.label"
          min-width="170"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator'
import { columnList } from '@/assets/column-list/qingyuan'
import excelMixin from './mixin/excelMixin'
@Component({
  name: 'ExportDevices'
})

export default class extends Mixins(Vue, excelMixin) {
  private loading = false
  private deviceList: any = []
  private columnList: any = columnList

  private mounted() {
    this.getDeviceList()
  }

  private async getDeviceList() {
    this.deviceList = [
      { xxx: 'example1' },
      { xxx: 'example2' },
      { xxx: 'example3' }
    ]
  }

  private exportInfo() {
    this.columns = this.columnList
    this.exportData = this.deviceList
    this.exelName = '设备信息表'
    this.exportExel()
  }
}
</script>
