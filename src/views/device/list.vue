<template>
  <div class="device-list__container">
    <div v-if="isNVR" class="device-info" :loading="loading.info">
      <info-list v-if="deviceInfo" label-width="80">
        <info-list-item label="设备名称:">{{ deviceInfo.deviceName }}</info-list-item>
        <info-list-item label="国标ID:">{{ deviceInfo.gbId }}</info-list-item>
        <info-list-item label="设备状态:">
          <status-badge :status="deviceInfo.deviceStatus" />
          {{ deviceStatus[deviceInfo.deviceStatus] }}
        </info-list-item>
        <info-list-item label="创建时间:">{{ deviceInfo.createdTime }}</info-list-item>
        <info-list-item label="通道数量:">{{ deviceInfo.deviceStats.channelSize }}</info-list-item>
        <info-list-item label="在线流数量:">{{ deviceInfo.deviceStats.onlineSize }}</info-list-item>
      </info-list>
    </div>
    <div class="filter-container clearfix">
      <div class="filter-container__left">
        <el-button v-if="!isNVR || deviceInfo && deviceInfo.createSubDevice === 2" type="primary" @click="handleCreate">{{ isNVR ? '添加子设备' : '添加设备' }}</el-button>
        <el-button disabled>导出</el-button>
        <el-dropdown>
          <el-button disabled>批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="!isNVR">移动至</el-dropdown-item>
            <el-dropdown-item>启用流</el-dropdown-item>
            <el-dropdown-item>停用流</el-dropdown-item>
            <el-dropdown-item>删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="filter-container__right">
        <el-input v-model="keyword" class="filter-container__search-group" placeholder="请输入关键词" disabled>
          <el-button slot="append" class="el-button-rect" icon="el-icon-search" />
        </el-input>
        <el-button class="el-button-rect" icon="el-icon-refresh" @click="init" />
      </div>
    </div>
    <el-table v-loading="loading.list" :data="deviceList" fit>
      <el-table-column type="selection" width="55" />
      <el-table-column
        :label="isNVR ? '通道号/通道名称' : '设备ID/名称'"
        min-width="200"
      >
        <template slot-scope="{row}">
          <div class="device-list__device-name" @click="goInto(row)">
            <div class="device-list__device-id">{{ row.deviceId }}</div>
            <div>
              {{ row.deviceName }} <i class="el-icon-video-camera" />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="isGb && !isNVR" key="deviceType" label="类型">
        <template slot-scope="{row}">
          {{ deviceType[row.deviceType] }}
        </template>
      </el-table-column>
      <el-table-column v-if="isGb" key="deviceStatus" label="设备状态">
        <template slot-scope="{row}">
          <status-badge :status="row.deviceStatus" />
          {{ deviceStatus[row.deviceStatus] }}
        </template>
      </el-table-column>
      <el-table-column key="streamStatus" prop="streamStatus" label="流状态">
        <template slot-scope="{row}">
          <status-badge :status="row.streamStatus" />
          {{ deviceStatus[row.streamStatus] }}
        </template>
      </el-table-column>
      <el-table-column key="deviceVendor" prop="deviceVendor" label="厂商" />
      <el-table-column v-if="isGb && !isNVR" key="deviceIp" label="设备IP" min-width="130">
        <template slot-scope="{row}">
          {{ row.deviceIp || '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="isGb && !isNVR" key="devicePort" label="设备端口">
        <template slot-scope="{row}">
          {{ row.devicePort || '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="isGb || isNVR" key="gbId" prop="gbId" label="国标ID" min-width="190">
        <template slot-scope="{row}">
          {{ row.gbId || '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="isGb && !isNVR" key="tunnelNum" label="通道数">
        <template slot-scope="{row}">
          <el-button v-if="row.deviceStats && row.deviceStats.channelSize" type="text" @click="goInto(row)">{{ row.deviceStats.channelSize }}</el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column key="createdTime" label="创建时间" min-width="180">
        <template slot-scope="{row}">
          {{ row.createdTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="270" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" :disabled="scope.row.deviceType === 'nvr'" @click="goToPreview('preview', scope.row)">监控预览</el-button>
          <el-button type="text" disabled @click="goToPreview('replay', scope.row)">录制回放</el-button>
          <el-button type="text" disabled @click="goToPreview('snapshot', scope.row)">查看截图</el-button>
          <el-dropdown @command="handleMore">
            <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="isGb && scope.row.deviceType === 'nvr'" :command="{type: 'nvr', device: scope.row}">查看通道</el-dropdown-item>
              <el-dropdown-item :command="{type: 'detail', device: scope.row}">设备详情</el-dropdown-item>
              <el-dropdown-item disabled>停用流</el-dropdown-item>
              <el-dropdown-item v-if="!isNVR" disabled>移动至</el-dropdown-item>
              <el-dropdown-item disabled :command="{type: 'edit', device: scope.row}">编辑</el-dropdown-item>
              <el-dropdown-item disabled :command="{type: 'delete', device: scope.row}">删除</el-dropdown-item>
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
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Inject } from 'vue-property-decorator'
import { Device } from '@/type/device'
import { DeviceStatus, DeviceType } from '@/dics'
import TunnelInfo from './components/TunnelInfo.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { getDevice, getDevices, getChannels, deleteDevice } from '@/api/device'

@Component({
  name: 'DeviceList',
  components: {
    TunnelInfo,
    StatusBadge
  }
})
export default class extends Vue {
  @Inject('deviceRouter') private deviceRouter!: Function
  private deviceStatus = DeviceStatus
  private deviceType = DeviceType
  private loading = {
    info: false,
    list: false
  }
  private keyword = ''
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  private deviceInfo = null

  private deviceList: Array<Device> = []

  private get isGb() {
    return this.$route.query.inProtocol === 'gb28181'
  }

  private get isNVR() {
    return this.$route.query.type === 'nvr'
  }

  private get groupId() {
    return this.$route.query.groupId
  }

  private get id() {
    return this.$route.query.id
  }

  @Watch('$route.query')
  private onRouterChange() {
    this.init()
  }

  private mounted() {
    this.init()
  }

  private init() {
    this.getNVRDeviceInfo()
    this.getDeviceList()
  }

  private async getNVRDeviceInfo() {
    this.deviceInfo = null
    if (this.isNVR && this.id) {
      this.deviceInfo = await getDevice({
        deviceId: this.id
      })
    }
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getDeviceList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getDeviceList()
  }

  /**
   * 加载设备列表
   */
  private async getDeviceList() {
    if (!this.groupId) return
    try {
      let params: any = {
        groupId: this.groupId,
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize
      }
      let res: any
      this.loading.list = true
      if (this.isNVR) {
        params.deviceId = this.id
        res = await getChannels(params)
        this.deviceList = res.channels
      } else {
        params.dirId = this.id ? this.id : -1
        res = await getDevices(params)
        this.deviceList = res.devices
      }
      this.pager = {
        pageNum: res.pageNum,
        pageSize: res.pageSize,
        total: res.totalNum
      }
    } catch (e) {
      this.deviceList = []
    } finally {
      this.loading.list = false
    }
  }

  /**
   * 创建设备
   */
  private handleCreate() {
    this.$router.push({
      name: 'device-create',
      query: this.$route.query
    })
  }

  /**
   * 根据类型进入下一级页面
   */
  private goInto(device: Device) {
    this.deviceRouter({
      id: device.deviceId,
      type: device.deviceType
    })
  }

  /**
   * 预览
   */
  private goToPreview(previewTab: string, device: Device) {
    this.deviceRouter({
      id: device.deviceId,
      type: device.deviceType,
      previewTab
    })
  }

  /**
   * 删除设备
   */
  private deleteDevice(device: Device) {
    this.$alertDelete({
      type: '设备',
      msg: `是否确认删除设备"${device.deviceName}"`,
      method: deleteDevice,
      payload: { deviceId: device.deviceId },
      onSuccess: this.getDeviceList
    })
  }

  /**
   * 更多菜单
   */
  private handleMore(command: any) {
    console.log(command.device)
    switch (command.type) {
      case 'detail':
        this.deviceRouter({
          id: command.device.deviceId,
          type: 'detail'
        })
        break
      case 'edit':
        this.$router.push({
          name: 'device-update',
          query: {
            deviceId: command.device.deviceId,
            ...this.$route.query
          }
        })
        break
      case 'delete':
        this.deleteDevice(command.device)
        break
      case 'nvr':
        this.goInto(command.device)
        break
    }
  }
}
</script>
<style lang="scss" scoped>
  .filter-container__search-group {
    margin-right: 10px;
  }

  .device-list {
    &__device-name {
      cursor: pointer;
    }
    &__device-id {
      color: $primary;
    }
  }
  .device-info {
    background: #f6f6f6;
    border-radius: 4px;
    margin-bottom: 15px;
    padding: 5px 15px;
    ::v-deep .info-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      .info-item {
        width: 33%;
        padding: 10px 0;
      }
    }
  }
</style>
