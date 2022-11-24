<template>
  <div class="ibox-list">
    <div v-if="nvrDetail && nvrDetail.device" class="ibox-list-info">
      <el-row type="flex" class="row-bg" justify="space-around">
        <el-col :span="6">
          <div class="grid-content bg-purple">
            设备名称：{{ nvrDetail.device.deviceName || '-' }}
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple-light">
            国标ID：{{ nvrDetail.outId || '-' }}
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">
            视频接入：{{ nvrDetail.streams[0] ? statusMap[nvrDetail.streams[0].streamStatus]: '-' }}
          </div>
        </el-col>
      </el-row>
      <el-row type="flex" class="row-bg" justify="space-around">
        <el-col :span="6">
          <div class="grid-content bg-purple">
            创建时间:{{ dateFormat(Number(nvrDetail.createdTime)) }}
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple-light">
            通道数量：{{ nvrDetail.device.deviceStats.channelSize }}
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">
            在线通道数量：{{ nvrDetail.device.deviceStats.onlineChannels }}
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="ibox-list-table">
      <!-- <div class="ibox-list__btn-box">
        <el-button type="primary" @click="addIBox">添加子设备</el-button>
      </div> -->
      <el-table :data="tableData" fit>
        <el-table-column
          fixed
          prop="deviceId"
          label="设备ID/名称"
          width="180"
        >
          <template slot-scope="{row}">
            <div class="ibox-list-table--text" @click="toDetail(row,'')">
              <div class="ibox-list-table--id">{{ row.deviceId }}</div>
              <div>{{ row.deviceName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="deviceChannelNum"
          label="通道号"
          width="120"
        />
        <el-table-column
          prop="inVideoProtocol"
          label="接入协议"
        >
          <template slot-scope="{row}">
            {{ row.inVideoProtocol || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="deviceStatus"
          label="设备状态"
          width="120"
        >
          <template slot-scope="scope">
            {{ statusMap[scope.row.deviceStatus.isOnline] || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="deviceStatus"
          label="流状态"
          width="120"
        >
          <template slot-scope="{row}">
            {{ row.streams.length ? statusMap[row.streams[0].streamStatus] : '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="deviceVendor"
          label="厂商"
        />
        <!-- <el-table-column
          prop="deviceIp"
          label="IP地址"
        />
        <el-table-column
          prop="zip"
          label="序列号"
        /> -->
        <el-table-column
          prop="registerTime"
          label="创建时间"
          width="180"
        >
          <template slot-scope="{row}">
            {{ dateFormat(Number(row.deviceStatus.registerTime)) }}
          </template>
        </el-table-column>
        <!-- <el-table-column
          prop="channelSize"
          label="通道总数"
        /> -->
        <el-table-column
          label="操作"
        >
          <template slot-scope="{row}">
            <div class="ibox-list-table--btn" @click.stop.prevent="toDetail(row,'preview')">
              实时预览
            </div>
            <el-dropdown @command="handleMore">
              <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if=" row.streams.length && row.streams[0].streamStatus === 'on'" :command="{type: 'stop', device: row}">停用流</el-dropdown-item>
                <el-dropdown-item v-else :command="{type: 'start', device: row}">启用流</el-dropdown-item>
                <!-- <el-dropdown-item :command="{type: 'delete', device: row}">删除</el-dropdown-item> -->
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="tableData.length"
        :current-page="pager.pageNum"
        :page-size="pager.pageSize"
        :total="pager.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Inject, Mixins } from 'vue-property-decorator'
import { InVideoProtocolModelMapping } from '@vss/device/dicts'
import ListMixins from '../../mixin/listMixin'
import { getDeviceDetail } from '@/api/ibox'
import { dateFormat } from '@/utils/date'

@Component({
  name: 'NvrList',
  components: {
  }
})

export default class IBoxList extends Mixins(ListMixins) {
  @Inject('handleNodeClick')
  public handleNodeClick!: Function

  public InVideoProtocolModelMapping = InVideoProtocolModelMapping
  public tableData = []
  public dateFormat = dateFormat
  public nvrDetail: any = {}

  public statusMap = {
    on: '在线',
    off: '离线',
    new: '未注册'
  }

  public async mounted() {
    await this.getIboxDeviceList()
    await this.getDetail()
  }

  public toDetail(row: any, to: any) {
    const info = {
      deviceId: row.deviceId,
      type: this.$route.query.type,
      tab: to === 'preview' ? 'preview' : ''
    }

    this.handleNodeClick(info)
  }

  private async getDetail() {
    const { query } = (this.$route) as any
    const { deviceId = '', type = '' } = query
    if (type === 'nvrlist') {
      const param = {
        deviceId,
        includeDeviceStats: 1
      }
      try {
        const nvrDetail: any = await getDeviceDetail(param)
        let videosInfo = nvrDetail?.videos[0]
        videosInfo = videosInfo[InVideoProtocolModelMapping[videosInfo.inVideoProtocol]]
        this.nvrDetail = {
          ...nvrDetail,
          ...videosInfo
        }
        console.log('nvrDetail--==--->', this.nvrDetail, videosInfo)
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.ibox-list {
  width: 100%;

  .ibox-list-info {
    height: 70px;
    padding-top: 15px;
    margin-bottom: 10px;
    background: #f4f4f4;

    ::v-deep.el-row {
      margin-bottom: 10px;
    }
  }

  .ibox-list-table {
    overflow: auto;
    height: calc(100% - 140px);

    &--text {
      cursor: pointer;
    }

    &--id {
      color: #fa8334;
    }

    &--btn {
      cursor: pointer;
      color: #fa8334;
    }
  }
}
</style>
