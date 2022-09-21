<template>
  <div class="ibox-list">
    <div class="ibox-list-table">
      <el-table :data="tableData" fit>
        <el-table-column
          fixed
          prop="deviceId"
          label="设备ID/名称"
          width="180"
        >
          <template slot-scope="{row}">
            <div class="ibox-list-table--text" @click="toDetail(row)">
              <div class="ibox-list-table--id">{{ row.deviceId }}</div>
              <div>{{ row.deviceName }}</div>
            </div>
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
          width="120"
        />
        <el-table-column
          prop="sn"
          label="序列号"
          width="160"
        />
        <el-table-column
          prop="registerTime"
          label="接入时间"
          width="190"
        >
          <template slot-scope="{row}">
            <!-- {{ row.registerTime }} -->
            {{ dateFormat(Number(row.registerTime)) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="channelSize"
          label="通道总数"
        />
        <el-table-column
          label="操作"
        >
          <template slot-scope="{row}">
            <div class="ibox-list-table--detail" @click="toDetail(row)">
              查看详情
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="tableData.length"
        :current-page="pager.pageNum"
        :page-size="pager.pageSize"
        :total="pager.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { getIBoxList } from '@/api/ibox'
import { IBoxModule } from '@/store/modules/ibox'
import { dateFormat } from '@/utils/date'

@Component({
  name: 'RootList',
  components: {
  }
})

export default class IBoxList extends Vue {
  @Inject('handleNodeClick')
  public handleNodeClick!: Function

  public tableData = []
  public dateFormat = dateFormat

  public statusMap = {
    on: '在线',
    off: '离线',
    new: '未注册'
  }

  public pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  async mounted() {
    await this.getIBoxList()
  }

  async getIBoxList() {
    const param = {
      pageNum: this.pageNum,
      pageSize: this.pageSize
    }
    try {
      const res = await getIBoxList(param)
      this.tableData = res.iboxes

      this.pager = {
        total: Number(res.totalNum),
        pageNum: Number(res.pageNum),
        pageSize: Number(res.pageSize)
      }
    } catch (error) {
      console.log(error)
    }
  }

  public async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getIBoxList()
  }

  public async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getIBoxList()
  }

  public toDetail(row: any) {
    const listInfo = {
      type: 'device',
      data: row
    }

    IBoxModule.SetList(listInfo)
    let query: any = {
      deviceId: row.deviceId,
      type: 'device'
    }
    const router: any = {
      deviceId: row.deviceId,
      name: 'IBoxDeviceList',
      query
    }

    this.handleNodeClick(router)

    this.$router.push(router)
  }
}
</script>
<style lang="scss" scoped>
.ibox-list {
  width: 100%;

  .ibox-list-table {
    overflow: auto;
    height: calc(100% - 40px);

    &--text {
      cursor: pointer;
    }

    &--id {
      color: #fa8334;
    }

    &--detail {
      color: #fa8334;
      cursor: pointer;
    }
  }
}
</style>
