<template>
  <div v-loading="loading.group" class="app-container">
    <div class="filter-container">
      <el-select
        v-model="groupId"
        class="filter-group"
        placeholder="请选择业务组"
        @change="getStreamList"
      >
        <el-option
          v-for="item in groupList"
          :key="item.groupId"
          :label="item.groupName"
          :value="item.groupId"
        />
      </el-select>
    </div>
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">新建流</el-button>
      </div>
      <el-table v-loading="loading.table" class="stream-list__table" :data="streamList" fit>
        <el-table-column prop="deviceId" label="流ID/名称">
          <template slot-scope="{row}">
            <div class="stream-name">
              <div class="stream-name__id">{{ row.deviceId }}</div>
              <div>
                {{ row.streamName }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="流状态" width="250">
          <template slot-scope="{row}">
            <status-badge :status="row.status" />
            {{ row.status === 'off' ? '下线':'在线' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="开始推流时间" />
        <el-table-column prop="action" class-name="col-action" label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="goToInfo(scope.row)">流详情</el-button>
            <el-button type="text" @click="goToPreview(scope.row)">实时预览</el-button>
            <el-button type="text">录像回放</el-button>
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
import { Component, Vue } from 'vue-property-decorator'
import { getGroups } from '@/api/group'
import { getStreamList } from '@/api/stream'
import { Group } from '@/type/group'
import { Stream } from '@/type/stream'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'Stream',
  components: { StatusBadge }
})
export default class extends Vue {
  private groupId = ''
  private groupList: Array<Group> = []
  private streamList: Array<Stream> = []
  private loading = {
    group: false,
    table: false
  }
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 20
  }
  private mounted() {
    this.getGroupList()
  }
  private handleCreate() {
    this.$router.push({
      path: '/stream/create',
      query: {
        groupId: this.groupId
      }
    })
  }
  private async getGroupList() {
    this.loading.group = true
    let params = {
      pageSize: 1000
    }
    try {
      const res = await getGroups(params)
      this.groupList = res.groups
      if (this.groupList.length) {
        this.groupId = this.groupList[0].groupId!
        this.getStreamList()
      }
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.group = false
    }
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
        deviceId: row.deviceId
      }
    })
  }

  private goToPreview(row: any) {
    this.$router.push({
      path: '/stream/preview',
      query: {
        deviceId: row.deviceId
      }
    })
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
