<template>
  <div>
    <el-alert
      title="业务组是一个监控业务类型的集合，集中对业务进行设置与管理。"
      type="info"
      show-icon
      :closable="false"
      style="background-color: #dff7ff; color: gray; margin-bottom: 10px;"
    />
    <div class="filter-container">
      <el-button type="primary" icon="el-icon-edit" @click="handleCreate">创建业务组</el-button>
      <div class="search-container">
        <el-input
          v-model="groupName"
          placeholder="请输入业务组名称"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />
        <el-button icon="el-icon-search" />
        <el-button icon="el-icon-refresh" @click="refresh" />
      </div>
    </div>
    <el-table :data="dataList" border fit highlight-current-row style="width: 100%;">
      <el-table-column prop="groupId" label="业务组ID/名称">
        <template slot-scope="scope">
          <el-col>
            <el-row>{{ scope.row.groupId }}</el-row>
            <el-row>{{ scope.row.groupName }}</el-row>
          </el-col>
        </template>
      </el-table-column>
      <el-table-column prop="groupStatus" label="空间状态">
        <template slot-scope="scope">
          <div v-if="scope.row.groupStatus==='on'" class="circle--on" />
          <div v-else-if="scope.row.groupStatus==='off'" class="circle--off" />
          <div v-else class="circle--warning" />
          {{ scope.row.groupStatus === 'on' ? '已启用' : (scope.row.groupStatus === 'off' ? '已停用' : '初始化失败') }}
        </template>
      </el-table-column>
      <el-table-column prop="inProtocol" label="接入类型" />
      <el-table-column prop="region" label="服务区域" />
      <el-table-column prop="deviceSize" label="设备数量">
        <template slot-scope="scope">{{ scope.row.groupStats.deviceSize }}</template>
      </el-table-column>
      <el-table-column prop="createdTime" label="创建时间" />
      <el-table-column prop="action" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="goToConfig">业务组配置</el-button>
          <span class="table-action--span">|</span>
          <el-button size="mini" type="text">设备管理</el-button>
          <span class="table-action--span">|</span>
          <el-button v-if="scope.row.groupStatus==='on'" size="mini" type="text" @click="stop(scope.row)">停用</el-button>
          <el-button v-if="scope.row.groupStatus==='off'" size="mini" type="text" @click="start(scope.row)">启用</el-button>
          <span class="table-action--span">|</span>
          <el-button :disabled="scope.row.groupStatus==='on'" size="mini" type="text">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="pager.currentIndex"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="pager.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pager.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'BusinessGroupList'
})
export default class extends Vue {
  private groupName = ''
  private dataList = [{
    groupId: 1,
    groupName: 2,
    groupStats: {},
    groupStatus: 'on'
  }]
  private pager = {
    total: 0,
    currentIndex: 1,
    size: 10
  }
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
    console.log('create')
    this.$emit('create-business-group')
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
    this.$emit('go-to-config')
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 10px;
}

.search-container {
  float: right;
}

.table-action--span {
  color: $textGrey;
  text-align: center;
  display: inline-block;
  width: 16px;
}

.circle{
  &--on {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color:green;
  }
  &--off {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color:red;
  }
  &--warning {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: orange;
  }
}
</style>
