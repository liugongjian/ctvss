<template>
  <div class="app-container">
    <el-card>
      <div v-permission="['*']" class="filter-container">
        <el-button type="primary" @click="handleCreate">新建流</el-button>
      </div>
      <el-table v-loading="loading.table" class="stream-list__table" :data="streamList" fit @row-click="rowClick">
        <el-table-column prop="deviceId" label="设备号/流名称" min-width="150">
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
            {{ streamStatus[row.status] }}
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" min-width="170" />
        <el-table-column key="startTime" label="开始推流时间" min-width="170">
          <template slot-scope="{row}">
            {{ row.startTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="expires" label="过期时间" min-width="170" />
        <el-table-column prop="action" class-name="col-action" label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="goToPreview(scope.row)">实时预览</el-button>
            <el-button type="text" @click="goToInfo(scope.row)">流详情</el-button>
            <el-button type="text" @click="deleteStream(scope.row)">删除</el-button>
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
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { GroupModule } from '@/store/modules/group'
import { getStreamList, deleteStream } from '@/api/stream'
import { Stream } from '@/type/stream'
import { StreamStatus } from '@/dics'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'StreamList',
  components: {
    StatusBadge
  }
})

export default class extends Vue {
  private streamStatus = StreamStatus
  private streamList: Array<Stream> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 20
  }
  private loading = {
    table: false
  }

  private get currentGroupId() {
    return GroupModule.group?.groupId
  }

  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: String) {
    if (!groupId) return
    this.$nextTick(() => {
      this.getStreamList()
    })
  }

  @Watch('streamList.length')
  private onStreamListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private handleCreate() {
    this.$router.push({
      path: '/stream/create'
    })
  }

  private async getStreamList() {
    this.loading.table = true
    let params = {
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize,
      groupId: this.currentGroupId
    }
    try {
      const res = await getStreamList(params)
      this.streamList = res.streams
      this.pager.total = res.totalNum
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

  /**
   * 查看详情
   */
  private goToInfo(row: any) {
    this.$router.push({
      path: '/stream/info',
      query: {
        deviceId: row.deviceId
      }
    })
  }

  /**
   * 前往预览页面
   */
  private goToPreview(row: any) {
    this.$router.push({
      path: '/stream/preview',
      query: {
        deviceId: row.deviceId
      }
    })
  }

  /**
   * 删除流
   */
  private async deleteStream(row: Stream) {
    this.$alertDelete({
      type: '流',
      msg: `是否确认删除流"${row.deviceId}"`,
      method: deleteStream,
      payload: { deviceId: row.deviceId },
      onSuccess: this.getStreamList
    })
  }

  private rowClick(stream: Stream, column: any) {
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
