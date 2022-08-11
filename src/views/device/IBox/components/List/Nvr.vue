<template>
  <div class="ibox-list">
    <el-table :data="tableData" fit>
      <el-table-column
        fixed
        prop="deviceId"
        label="设备ID/名称"
      >
        <template slot-scope="scope">
          <div>{{ scope.row.deviceId }}/</div>
          <div>{{ scope.row.deviceName }}</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="deviceStatus"
        label="状态"
        width="120"
      >
        <template slot-scope="scope">
          {{ statusMap[scope.row.deviceStatus] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="ip"
        label="IP地址"
      />
      <el-table-column
        prop="zip"
        label="序列号"
      />
      <el-table-column
        prop="registerTime"
        label="接入时间"
      >
        <template slot-scope="{row}">
          {{ dateFormat(row.registerTime) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="channelSize"
        label="通道总数"
      />
      <el-table-column
        label="操作"
      />
    </el-table>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getIBoxList } from '@/api/ibox'
import { IBoxModule } from '@/store/modules/ibox'
import { dateFormat } from '@/utils/date'

@Component({
  name: 'NvrList',
  components: {
  }
})

export default class IBoxList extends Vue {
  public tableData = []
  public dateFormat = dateFormat

  public statusMap = {
    on: '在线',
    off: '离线',
    new: '未注册'
  }

  async mounted() {
    await this.getIBoxList()
  }

  async getIBoxList() {
    const param = {
      pageNum: 1,
      pageSize: 10
    }
    try {
      await getIBoxList(param)
    } catch (error) {
      console.log(error)
    }
    this.tableData = IBoxModule.iboxList.data
    console.log('IBoxModule--->', IBoxModule.iboxList)
  }
}
</script>
<style lang="scss" scoped>
.ibox-list {
  width: 100%;
}
</style>
