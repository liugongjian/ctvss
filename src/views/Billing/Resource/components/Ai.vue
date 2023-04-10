<template>
  <div>
    <el-table
      v-loading="loading"
      class="resource-table"
      :data="dataList"
      @row-click="rowClick($event, 'ai')"
    >
      <el-table-column show-overflow-tooltip prop="workOrderNo" label="订单号">
        <template slot-scope="scope">
          <span class="device-id">{{ scope.row.workOrderNo }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="totalDeviceCount" label="可接入设备总数">
        <template slot-scope="{ row }"> {{ row.totalDeviceCount }}路 </template>
      </el-table-column>
      <el-table-column prop="remainDeviceCount" label="接入设备余量">
        <template slot-scope="{ row }">
          {{ row.remainDeviceCount }}路
        </template>
      </el-table-column>
      <el-table-column prop="aIType" label="分析类型">
        <template slot-scope="{ row }">
          {{ resourceAiType[row.aIType] }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="开通时间" min-width="140" />
      <el-table-column prop="expireTime" label="到期时间" min-width="140" />
      <el-table-column label="订购类型">
        <template slot-scope="{ row }">
          {{ row.isTrialOrder === '1' ? '试用' : '商用' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template slot-scope="scope">
          <el-button type="text" @click="rowClick(scope.row, 'ai')">
            查看绑定关系
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ResourceMixin from '../mixins/resource'
import { ResourceAiType } from '@/dics'
import TemplateBind from '@/views/components/TemplateBind.vue'

@Component({
  components: { TemplateBind },
  name: 'ResourceAI'
})
export default class extends Mixins(ResourceMixin) {
  public type = 'VSS_AI'
  public resourceAiType = ResourceAiType
}
</script>
