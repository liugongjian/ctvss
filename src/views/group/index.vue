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
            <el-button slot="append" class="el-button-rect" icon="el-icon-search" />
          </el-input>
          <el-button class="el-button-rect" icon="el-icon-refresh" @click="refresh" />
        </div>
      </div>
      <el-table :data="dataList" fit>
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
        <el-table-column label="接入类型">
          <template slot-scope="{row}">
            {{ inProtocolType[row.inProtocol] }}
          </template>
        </el-table-column>
        <el-table-column prop="region" label="服务区域" />
        <el-table-column prop="deviceSize" label="设备数量">
          <template slot-scope="scope">{{ scope.row.groupStats.deviceSize }}</template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" :formatter="dateFormatInTable" min-width="160" />
        <el-table-column prop="action" label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="goToConfig">业务组配置</el-button>
            <el-button type="text">设备管理</el-button>
            <el-button v-if="scope.row.groupStatus==='on'" type="text" @click="stop(scope.row)">停用</el-button>
            <el-button v-if="scope.row.groupStatus==='off'" type="text" @click="start(scope.row)">启用</el-button>
            <el-button :disabled="scope.row.groupStatus==='on'" type="text">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="pager.currentIndex"
        :page-size="pager.size"
        :total="pager.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { GroupStatus, InProtocolType } from '@/dics'
import { dateFormatInTable } from '@/utils/date'
import StatusBadge from '@/components/StatusBadge/index.vue'

@Component({
  name: 'GroupList',
  components: { StatusBadge }
})
export default class extends Vue {
  private groupStatus = GroupStatus
  private inProtocolType = InProtocolType
  private groupName = ''
  private dataList = [{
    groupId: 327439123674913,
    groupName: '上海电信园区监控',
    groupStatus: 'on',
    groupStats: {
      deviceSize: 12
    },
    inProtocol: 'gb28181',
    region: '华东',
    createdTime: 1594260926566
  },
  {
    groupId: 327439123674913,
    groupName: '上海电信园区监控',
    groupStatus: 'off',
    groupStats: {
      deviceSize: 2
    },
    inProtocol: 'rtmp',
    region: '华东',
    createdTime: 1594260926566
  }]
  private pager = {
    total: 0,
    currentIndex: 1,
    size: 10
  }

  private dateFormatInTable = dateFormatInTable

  private refresh() {
    console.log('resfresh')
  }

  private getList() {
    console.log('getList')
  }

  private handleSizeChange(val: number) {
    console.log('sizeChange')
  }

  private handleCurrentChange(val: number) {
    console.log('currentChange')
  }

  private handleCreate() {
    this.$router.push('/group/create')
  }

  private handleFilter() {
    console.log('filter')
  }

  private stop(row: any) {
    console.log(row)
  }

  private start(row: any) {
    console.log(row)
  }

  private goToConfig() {
    this.$router.push('/group/config')
  }
}
</script>

<style lang="scss" scoped>
.filter-container__search-group {
  margin-right: 10px;
}
</style>
