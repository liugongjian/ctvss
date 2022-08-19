<template>
  <div>
    <div v-if="filter" class="filter-container filter-buttons">
      <div class="filter-button" @click="clearFilter()">
        <label>带宽包类型</label>
        <span>{{ resourceType[filter] }}</span>
        <svg-icon class="filter-button__close" name="close" width="10" height="10" />
      </div>
    </div>
    <el-table ref="table" v-loading="loading" class="resource-table" :data="dataList">
      <el-table-column prop="id" label="编号" />
      <el-table-column
        key="type"
        prop="type"
        column-key="type"
        label="带宽包类型"
        :filters="filtersArray"
        :filter-multiple="false"
        :filter-method="filterHandler"
      >
        <template slot="header">
          <span class="filter">带宽包类型</span>
          <svg-icon class="filter" name="filter" width="15" height="15" />
        </template>
        <template slot-scope="{row}">
          {{ resourceType[row.type] }}
        </template>
      </el-table-column>
      <el-table-column prop="totalDeviceCount" label="可接入设备总数">
        <template slot-scope="{row}">
          {{ row.totalDeviceCount }}路
        </template>
      </el-table-column>
      <el-table-column prop="remainDeviceCount" label="接入设备余量">
        <template slot-scope="{row}">
          {{ row.remainDeviceCount }}路
        </template>
      </el-table-column>
      <el-table-column prop="rate" label="码率">
        <template slot-scope="{row}">
          {{ row.bitRate }}Mbps
        </template>
      </el-table-column>
      <el-table-column prop="bandwidth" label="带宽">
        <template slot-scope="{row}">
          {{ row.bandWidth }}Mbps
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="开通时间" min-width="140" />
      <el-table-column prop="expireTime" label="到期时间" min-width="140" />
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ResourceMixin from '../mixins/resource'
import { ResourceType, ResourceAiType } from '@/dics'

@Component({
  name: 'ResourceBandwidth'
})
export default class extends Mixins(ResourceMixin) {
  public type = 'VSS_UPLOAD_BW'
  public resourceType = ResourceType
  public resourceAiType = ResourceAiType
  private filtersArray = [
    {
      text: '上行带宽包',
      value: 'VSS_UPLOAD_BW'
    },
    {
      text: '下行带宽包',
      value: 'VSS_DOWNLOAD_BW'
    }
  ]
  private filter = null

  private filterHandler(value: any, row: any) {
    this.filter = value
    return row.type === value
  }

  /**
   * 清空指定筛选条件
   */
  public clearFilter() {
    this.filter = null
    const table: any = this.$refs.table
    table.clearFilter('type')
  }
}
</script>
<style lang="scss" scoped>
  .resource-table {
    .filter {
      cursor: pointer;
    }
    ::v-deep .el-table__column-filter-trigger {
      visibility: hidden;
    }
  }

  @include filter-buttons;
</style>
