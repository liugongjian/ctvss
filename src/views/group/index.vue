<template>
  <div class="app-container">
    <el-alert
      title="业务组是一个监控业务类型的集合，集中对业务进行设置与管理。"
      type="info"
      show-icon
      :closable="false"
      class="mb10"
    />
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">新建业务组</el-button>
        <div class="filter-container__right">
          <el-input v-model="groupName" class="filter-container__search-group" placeholder="请输入业务组名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter">
            <el-button slot="append" class="el-button-rect" @click="handleFilter"><svg-icon name="search" /></el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh"><svg-icon name="refresh" /></el-button>
        </div>
      </div>
      <el-table v-loading="loading" class="group-list__table" :data="dataList" fit @row-click="rowClick">
        <el-table-column prop="groupId" label="业务组ID/名称" min-width="200">
          <template slot-scope="{row}">
            <div class="group-name" @click="goToConfig(row)">
              <div class="group-name__id">{{ row.groupId }}</div>
              <div>
                {{ row.groupName }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="空间状态">
          <template slot-scope="{row}">
            <status-badge :status="row.groupStatus" />
            {{ groupStatus[row.groupStatus] }}
          </template>
        </el-table-column>
        <el-table-column label="接入类型" min-width="90">
          <template slot-scope="{row}">
            {{ inProtocolType[row.inProtocol] }}
          </template>
        </el-table-column>
        <el-table-column prop="regionName" label="服务区域" min-width="120" />
        <el-table-column prop="deviceSize" label="设备数量">
          <template slot-scope="scope">{{ scope.row.groupStats && scope.row.groupStats.deviceSize }}</template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" min-width="170" />
        <el-table-column prop="action" class-name="col-action" label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="goToConfig(scope.row)">业务组配置</el-button>
            <el-button v-if="scope.row.inProtocol === 'rtmp'" type="text" @click="goToStreams(scope.row)">流管理</el-button>
            <el-button v-else type="text" @click="goToDevices(scope.row)">设备管理</el-button>
            <el-dropdown @command="handleMore">
              <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="scope.row.groupStatus === 'on'" :command="{type: 'stop', group: scope.row}">停用</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.groupStatus === 'off'" :command="{type: 'start', group: scope.row}">启用</el-dropdown-item>
                <el-dropdown-item :command="{type: 'update', group: scope.row}">编辑</el-dropdown-item>
                <el-dropdown-item :disabled="scope.row.groupStatus === 'on'" :command="{type: 'delete', group: scope.row}">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { GroupModule } from '@/store/modules/group'
import { Group } from '@/type/group'
import { GroupStatus, InProtocolType } from '@/dics'
import { dateFormatInTable } from '@/utils/date'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { getGroups, startGroup, stopGroup, deleteGroup } from '@/api/group'

@Component({
  name: 'GroupList',
  components: { StatusBadge }
})
export default class extends Vue {
  private loading = false
  private groupStatus = GroupStatus
  private inProtocolType = InProtocolType
  private groupName = ''
  private dataList: Array<Group> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 20
  }

  private dateFormatInTable = dateFormatInTable

  private async mounted() {
    await this.getList()
  }

  private async refresh() {
    await this.getList()
  }

  private async getList() {
    this.loading = true
    let params = {
      groupName: this.groupName,
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    try {
      const res = await getGroups(params)
      this.dataList = res.groups
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getList()
  }

  private handleCreate() {
    this.$router.push('/group/create')
  }

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList()
  }

  /**
   * 停用业务组
   */
  private async stopGroup(row: Group) {
    try {
      await stopGroup({ groupId: row.groupId })
      await this.getList()
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  /**
   * 启动业务组
   */
  private async startGroup(row: Group) {
    try {
      await startGroup({ groupId: row.groupId })
      await this.getList()
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  /**
   * 删除业务组
   */
  private async deleteGroup(row: Group) {
    this.$alertDelete({
      type: '业务组',
      msg: `是否确认删除业务组"${row.groupName}"`,
      method: deleteGroup,
      payload: { groupId: row.groupId },
      onSuccess: () => {
        this.getList()
        GroupModule.GetGroupList()
      }
    })
  }

  /**
   * 编辑业务组
   */
  private goToUpdateGroup(row: Group) {
    this.$router.push({
      path: '/group/update',
      query: {
        groupId: row.groupId
      }
    })
  }

  /**
   * 跳转至详情配置页面
   */
  private goToConfig(row: Group) {
    this.$router.push({
      path: '/group/config',
      query: {
        groupId: row.groupId
      }
    })
  }

  /**
   * 跳转至设备管理页面
   */
  private goToDevices(row: Group) {
    GroupModule.SetGroup(row)
    this.$router.push({
      path: '/device'
    })
  }

  /**
   * 跳转至流管理页面
   */
  private goToStreams(row: Group) {
    GroupModule.SetGroup(row)
    this.$router.push({
      path: '/stream'
    })
  }

  /**
   * 整行可点
   */
  private rowClick(group: Group, column: any) {
    if (column.property !== 'action') {
      this.goToConfig(group)
    }
  }

  /**
   * 更多菜单
   */
  private handleMore(command: any) {
    switch (command.type) {
      case 'stop':
        this.stopGroup(command.group)
        break
      case 'start':
        this.startGroup(command.group)
        break
      case 'delete':
        this.deleteGroup(command.group)
        break
      case 'update':
        this.goToUpdateGroup(command.group)
        break
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container__search-group {
  margin-right: 10px;
}
.group-list__table {
  ::v-deep .el-table__body {
    td {
      cursor: pointer;
    }
    .col-action {
      cursor: default;
    }
  }
}
.group-name {
  cursor: pointer;
  &__id {
    color: $primary;
  }
}
</style>
