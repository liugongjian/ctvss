<template>
  <div class="ibox-list">
    <div class="ibox-list-table">
      <div class="ibox-list__btn-box">
        <el-button type="primary" @click="addIBox">添加设备</el-button>
      </div>

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
          prop="deviceType"
          label="类型"
        >
          <!-- <template slot-scope="scope">
            {{ statusMap[scope.row.deviceStatus] }}
          </template> -->
        </el-table-column>
        <el-table-column
          prop="inVideoProtocol"
          label="接入协议"
          width="100"
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
        <!-- <el-table-column
          prop="deviceStatus"
          label="录制状态"
          width="120"
        >
          <template slot-scope="{row}">
            {{ row.streams.length ? statusMap[row.streams[0].recordStatus] : '-' }}
          </template>
        </el-table-column> -->
        <!-- <el-table-column
          width="120"
          prop="ip"
          label="当前码率"
        >
          <template slot-scope="{row}">
            {{ row.streams.length ? `${(row.streams[0].bitrate/1024).toFixed(2)}Mbps` : '-' }}
          </template>
        </el-table-column> -->
        <!-- <el-table-column
          prop="errorMsg"
          label="异常提示"
        >
          <template slot-scope="scope">
            {{ scope.row.errorMsg }}
          </template>
        </el-table-column> -->
        <!-- <el-table-column
          prop="deviceVendor"
          label="厂商"
        />
        <el-table-column
          width="180"
          prop="outId"
          label="国标ID"
        />
        <el-table-column
          width="120"
          prop="sipTransType"
          label="信息传输模式"
        />
        <el-table-column
          prop="streamTransProtocol"
          label="流传输模式"
          width="120"
        />
        <el-table-column
          prop="streamTransProtocol"
          label="优先TCP传输"
          width="120"
        /> -->
        <el-table-column
          prop="deviceChannelSize"
          label="通道数"
        >
          <template slot-scope="{row}">
            {{ row.deviceType === 'nvr' ? row.deviceChannelSize : '-' }}
          </template>
        </el-table-column>
        <!-- <el-table-column
          prop="deviceIp"
          width="140"
          label="设备IP"
        />
        <el-table-column
          prop="devicePort"
          label="设备端口"
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
        <el-table-column
          label="操作"
        >
          <template slot-scope="{row}">
            <div v-if="row.deviceType !== 'nvr'" class="ibox-list-table--btn" @click.stop.prevent="toDetail(row,'preview')">
              实时预览
            </div>
            <el-dropdown @command="handleMore">
              <el-button type="text">更多<i class="el-icon-arrow-down" /></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if=" row.streams.length && row.streams[0].streamStatus === 'on'" :command="{type: 'stop', device: row}">停用流</el-dropdown-item>
                <el-dropdown-item v-else :command="{type: 'start', device: row}">启用流</el-dropdown-item>
                <el-dropdown-item :command="{type: 'delete', device: row}">删除</el-dropdown-item>
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
import { Component, Watch, Inject, Mixins } from 'vue-property-decorator'
import ListMixins from '../../mixin/listMixin'
import { dateFormat } from '@/utils/date'

@Component({
  name: 'DeviceList',
  components: {
  }
})

export default class IBoxList extends Mixins(ListMixins) {
  @Inject('handleNodeClick')
  public handleNodeClick!: Function

  // public tableData = []
  public dateFormat = dateFormat

  public statusMap = {
    on: '在线',
    off: '离线',
    new: '未注册'
  }

  public async mounted() {
    await this.getIboxDeviceList()
  }

  @Watch('$route.query')
  public onRouterChange() {
    this.getIboxDeviceList()
  }

  // public cb() {
  //   this.addIBox()
  //   this.getDeviceList()
  //   const path = this.$route.path
  //   this.$router.push(path)
  // }

  public toDetail(row: any, to: any) {
    const query: any = {
      deviceId: row.deviceId,
      type: this.$route.query.type
    }

    let router: any = {}

    if (row.deviceType === 'nvr') {
      router = {
        deviceId: row.deviceId,
        type: 'nvrlist',
        tab: to === 'preview' ? 'preview' : '',
        query
      }
      // this.$router.push(router)
      this.handleNodeClick(router)
    } else {
      router = {
        deviceId: row.deviceId,
        name: 'IBoxDeviceInfo',
        tab: to === 'preview' ? 'preview' : '',
        type: 'device',
        query
      }
      // this.$router.push(router)
      this.handleNodeClick(router)
    }
  }
}
</script>
<style lang="scss" scoped>
  .ibox-list {
    height: 100%;

    .ibox-list-table {
      overflow: auto;
      height: calc(100% - 40px);

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
