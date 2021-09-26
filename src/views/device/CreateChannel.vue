<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-table
      :data="channelData"
      @selection-change="selectChannel"
      @select="selectHandle"
    >
      <el-table-column type="selection" width="55" prop="selection" />
      <el-table-column prop="channel" label="通道号" />
      <el-table-column prop="name" label="通道名称" />
      <el-table-column prop="status" label="接入状态">
        <template slot-scope="scope">
          {{ scope.row.status }}-
        </template>
      </el-table-column>
      <el-table-column prop="localStatus" label="设备本地状态">
        <template slot-scope="scope">
          {{ scope.row.name }}路
        </template>
      </el-table-column>
      <el-table-column prop="company" label="厂家" />
      <el-table-column prop="createTime" label="创建时间" />
    </el-table>
  </div>
</template>

<script lang='ts'>
import { Component, Mixins } from 'vue-property-decorator'
import createMixin from './mixin/createMixin'

@Component({
  name: 'CreateEhomeDevice',
  components: {
    // ResourceTabs
  }
})
export default class extends Mixins(createMixin) {
  private channelData = [
    {
      'channel': '01',
      'name': '通道名称1',
      'status': '接入',
      'localStatus': '在线',
      'company': '海康',
      'createTime': '2021-09-03 21:22:23'
    }, {
      'channel': '02',
      'name': '通道名称2',
      'status': '接入',
      'locaoStatus': '在线',
      'company': '海康',
      'createTime': '2021-09-03 21:22:23'
    }, {
      'channel': '03',
      'name': '通道名称4',
      'status': '接入',
      'locaoStatus': '在线',
      'company': '海康',
      'createTime': '2021-09-03 21:22:23'
    }
  ]

  private selectChannel() {

  }

  private selectHandle() {

  }
}
</script>

<style>

</style>
