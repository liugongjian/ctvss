<template>
  <el-card>
    <div class="filter-container">
      <el-button type="primary" @click="handleCreate">新建流</el-button>
    </div>
    <el-table v-loading="loading.table" class="stream-list__table" :data="streamList" fit @row-click="rowClick">
      <el-table-column prop="deviceId" label="设备号/流名称">
        <template slot-scope="{row}">
          <div class="stream-name">
            <div class="stream-name__id">{{ row.deviceId }}</div>
            <div>
              {{ row.streamName }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="流状态">
        <template slot-scope="{row}">
          <status-badge :status="row.status" />
          {{ row.status === 'off' ? '下线':'在线' }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column key="startTime" label="开始推流时间">
        <template slot-scope="{row}">
          {{ row.startTime || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="expires" label="过期时间" />
      <el-table-column prop="action" class-name="col-action" label="操作" width="150" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="goToInfo(scope.row)">流详情</el-button>
          <!-- <el-button type="text" @click="goToPreview(scope.row)">实时预览</el-button> -->
        </template>
      </el-table-column>
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
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { getStreamList } from '@/api/stream'
import { Stream } from '@/type/stream'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'StreamList',
  components: {
    StatusBadge
  }
})

export default class extends Vue {
  private groupId = ''
  private streamList: Array<Stream> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 20
  }
  private loading = {
    table: false
  }

  private mounted() {
    const query: any = this.$route.query
    this.groupId = query.groupId
    this.getStreamList()
  }

  @Watch('$route.query')
  private onRouterChange() {
    const query: any = this.$route.query
    this.groupId = query.groupId
    this.getStreamList()
  }

  private handleCreate() {
    this.$router.push({
      path: '/stream/create',
      query: {
        groupId: this.groupId
      }
    })
  }

  private async getStreamList() {
    this.loading.table = true
    let params = {
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize,
      groupId: this.groupId
    }
    try {
      const res = await getStreamList(params)
      this.streamList = res.streams
      this.pager.pageNum = res.pageNum
      this.pager.total = res.totalNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.table = false
    }
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getStreamList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getStreamList()
  }

  private goToInfo(row: any) {
    this.$router.push({
      path: '/stream/info',
      query: {
        deviceId: row.deviceId,
        groupId: this.groupId
      }
    })
  }

  private goToPreview(row: any) {
    this.$router.push({
      path: '/stream/preview',
      query: {
        deviceId: row.deviceId,
        groupId: this.groupId
      }
    })
  }

  private rowClick(stream: Stream, column: any, event: any) {
    if (column.property !== 'action') {
      this.goToInfo(stream)
    }
  }
}
</script>
<style lang="scss" scoped>
.stream-list__table {
  ::v-deep .el-table__body {
    td {
      cursor: pointer;
    }
    .col-action {
      cursor: default;
    }
  }
}
.stream-name {
  cursor: pointer;
  &__id {
    color: $primary;
  }
}
</style>
