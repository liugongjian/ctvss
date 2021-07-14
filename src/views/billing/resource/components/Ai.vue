<template>
  <div>
    <el-table v-loading="loading" class="resource-table" :data="dataList" @row-click="rowClick($event, 'ai')">
      <el-table-column prop="id" label="编号" />
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
      <el-table-column prop="aiType" label="分析类型">
        <template slot-scope="{row}">
          {{ resourceAiType[row.aiType] }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="开通时间" min-width="140" />
      <el-table-column prop="expireTime" label="到期时间" min-width="140" />
      <el-table-column label="计费类型">
        <template slot-scope="{row}">
          {{ row.isTrialOrder === '1' ? '试用' : '商用' }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ResourceMixin from '../mixins/resource'
import { ResourceAiType } from '@/dics'
import templateBind from '@/views/components/templateBind.vue'

@Component({
  components: { templateBind },
  name: 'ResourceAI'
})
export default class extends Mixins(ResourceMixin) {
  public type = 'VSS_AI'
  public resourceAiType = ResourceAiType
}
</script>
<style lang="scss" scoped>
.resource-table {
  ::v-deep .el-table__row {
    cursor: pointer;
  }
}
</style>
