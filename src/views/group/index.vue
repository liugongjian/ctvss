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
        <el-button type="primary" @click="handleCreate">创建业务组</el-button>
        <div class="filter-container__right">
          <el-input v-model="groupName" class="filter-container__search-group" placeholder="请输入业务组名称" @keyup.enter.native="handleFilter">
            <el-button slot="append" class="el-button-rect" icon="el-icon-search" @click="handleFilter" />
          </el-input>
          <el-button class="el-button-rect" icon="el-icon-refresh" @click="refresh" />
        </div>
      </div>
      <el-table v-loading="loading" :data="dataList" fit>
        <el-table-column prop="groupId" label="业务组ID/名称" min-width="200">
          <template slot-scope="{row}">
            <router-link to="/group/config">{{ row.groupId }}</router-link>
            <div>{{ row.groupName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="空间状态">
          <template slot-scope="{row}">
            <status-badge :status="row.groupStatus" />
            {{ groupStatus[row.groupStatus] }}
          </template>
        </el-table-column>
        <el-table-column label="接入类型" min-width="80">
          <template slot-scope="{row}">
            {{ inProtocolType[row.inProtocol] }}
          </template>
        </el-table-column>
        <el-table-column prop="region" label="服务区域" />
        <el-table-column prop="deviceSize" label="设备数量">
          <template slot-scope="scope">{{ scope.row.groupStats && scope.row.groupStats.deviceSize }}</template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" min-width="160" />
        <el-table-column prop="action" label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="goToConfig(scope.row)">业务组配置</el-button>
            <el-button type="text">设备管理</el-button>
            <el-button v-if="scope.row.groupStatus==='on'" type="text" @click="stopGroup(scope.row)">停用</el-button>
            <el-button v-if="scope.row.groupStatus==='off'" type="text" @click="startGroup(scope.row)">启用</el-button>
            <el-button :disabled="scope.row.groupStatus==='on'" type="text" @click="deleteGroup(scope.row)">删除</el-button>
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
      keyWord: this.groupName,
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize
    }
    const res = await getGroups(params)
    if (res.code) {
      this.$message.error(res.message)
    } else {
      this.dataList = res.groups
      this.pager.total = res.totalNum
      this.pager.pageNum = res.pageNum
      this.pager.pageSize = res.pageSize
    }
    this.loading = false
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
    await this.getList()
  }

  private async stopGroup(row: Group) {
    await stopGroup({ groupId: row.groupId })
  }

  private async startGroup(row: Group) {
    await startGroup({ groupId: row.groupId })
  }

  private async deleteGroup(row: Group) {
    this.$alertDelete({
      type: '业务组',
      msg: `是否确认删除业务组"${row.groupName}"`,
      method: deleteGroup,
      payload: { groupId: row.groupId }
    })
  }

  private goToConfig(row: Group) {
    this.$router.push({
      path: '/group/config',
      query: {
        groupId: row.groupId!.toString()
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.filter-container__search-group {
  margin-right: 10px;
}
</style>
