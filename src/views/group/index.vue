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
        <!-- 为避免拥有AdminGroup权限的子账号创建的业务组自己无法查看，此处改为具有 * 权限才能创建业务组 -->
        <el-button v-if="checkPermission(['*'])" type="primary" @click="handleCreate">新建业务组</el-button>
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
        <el-table-column label="业务组状态">
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
        <el-table-column prop="regionName" label="接入区域" min-width="120">
          <template slot-scope="scope">
            {{ scope.row.inProtocol === 'vgroup' ? '-' : scope.row.regionName }}
          </template>
        </el-table-column>
        <el-table-column prop="deviceSize" label="通道总数" min-width="90">
          <template slot-scope="scope">{{ scope.row.groupStats && scope.row.groupStats.deviceSize }}</template>
        </el-table-column>
        <el-table-column prop="ipcSize" label="IPC设备数" min-width="90">
          <template slot-scope="scope">{{ scope.row.groupStats && scope.row.groupStats.ipcSize }}</template>
        </el-table-column>
        <el-table-column prop="nvrSize" label="NVR设备数" min-width="95">
          <template slot-scope="scope">
            <div v-for="state in renderNvrSize(scope.row.groupStats)" :key="state.label">
              {{ state.label }}: {{ state.value }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="platformSize" label="平台设备数" min-width="95">
          <template slot-scope="scope">
            <div v-for="state in renderPlatformSize(scope.row.groupStats)" :key="state.label">
              {{ state.label }}: {{ state.value }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" min-width="170" />
        <el-table-column prop="action" class-name="col-action" label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button v-if="checkPermission(['ivs:GetGroup'], scope.row)" type="text" @click.stop="goToConfig(scope.row)">业务组配置</el-button>
            <el-button v-if="checkPermission(['ivs:GetGroup'], scope.row)" type="text" @click.stop="goToDevices(scope.row)">设备管理</el-button>
            <el-dropdown v-if="checkPermission(['ivs:UpdateGroup', 'ivs:DeleteGroup'], scope.row)" @command="handleMore">
              <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="scope.row.inProtocol !== 'vgroup' && checkPermission(['ivs:UpdateGroup'], scope.row) && scope.row.groupStatus === 'on'" :command="{type: 'stop', group: scope.row}">停用</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.inProtocol !== 'vgroup' && checkPermission(['ivs:UpdateGroup'], scope.row) && scope.row.groupStatus === 'off'" :command="{type: 'start', group: scope.row}">启用</el-dropdown-item>
                <el-dropdown-item v-if="checkPermission(['ivs:UpdateGroup'], scope.row)" :command="{type: 'update', group: scope.row}">编辑</el-dropdown-item>
                <el-tooltip v-if="scope.row.inProtocol !== 'vgroup' && checkPermission(['ivs:DeleteGroup'], scope.row)" content="请先停用业务组后进行删除操作" :disabled="scope.row.groupStatus === 'off'">
                  <span><el-dropdown-item :disabled="scope.row.groupStatus === 'on'" :command="{type: 'delete', group: scope.row}">删除</el-dropdown-item></span>
                </el-tooltip>
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
import { Component, Vue, Watch } from 'vue-property-decorator'
import { GroupModule } from '@/store/modules/group'
import { UserModule } from '@/store/modules/user'
import { Group } from '@/type/Group'
import { GroupStatus, InProtocolType } from '@/dics'
import { dateFormatInTable } from '@/utils/date'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { getGroups, startGroup, stopGroup, deleteGroup } from '@/api/group'
import { checkPermission } from '@/utils/permission'
import { previewAuthActions } from '@/api/accessManage'

@Component({
  name: 'GroupList',
  components: { StatusBadge }
})
export default class extends Vue {
  private checkPermission = checkPermission
  private loading = false
  private groupStatus = GroupStatus
  private inProtocolType = {
    ...InProtocolType,
    'vgroup': 'VGROUP'
  }
  private groupName = ''
  private dataList: Array<Group> = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 20
  }
  private dateFormatInTable = dateFormatInTable

  @Watch('dataList.length')
  private onDataListChange(data: any) {
    data === 0 && this.pager.pageNum > 1 && this.handleCurrentChange(this.pager.pageNum - 1)
  }

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
      if (UserModule.iamUserId) {
        const permissionRes = await previewAuthActions({
          targetResources: res.groups.map(group => ({
            groupId: group.groupId
          }))
        })
        this.dataList = res.groups.map((group: any, index: number) => ({
          ...group,
          ...permissionRes.result[index].iamUser.actions
        }))
      } else {
        this.dataList = res.groups
      }

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
    (column.property !== 'action') && this.goToConfig(group)
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

  /**
   * 渲染NVR数量
   */
  private renderNvrSize(groupStats: any) {
    if (groupStats && groupStats.nvrSize) {
      const size = groupStats.nvrSize.split(':')
      if (size.length) {
        return [
          {
            label: 'NVR',
            value: size[0]
          },
          {
            label: '通道',
            value: size[1]
          }
        ]
      }
    }
  }

  /**
   * 渲染NVR数量
   */
  private renderPlatformSize(groupStats: any) {
    if (groupStats && groupStats.platformSize) {
      try {
        const size = groupStats.platformSize.split(':').filter(item => item !== '')
        switch (size.length) {
          case 2:
            return [
              {
                label: '平台',
                value: size[0]
              },
              {
                label: '通道',
                value: size[1]
              }
            ]
          case 3:
            return [
              {
                label: '平台',
                value: size[0]
              },
              {
                label: '通道',
                value: size[1]
              }, {
                label: '平台nvr数',
                value: size[2]
              }
            ]
          default:
            return []
        }
      } catch (e) {
        console.log(e)
      }
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
