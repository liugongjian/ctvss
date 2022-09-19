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
            <div class="ibox-list-table--text" @click="toDetail(row)">
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
          <template slot-scope="scope">
            {{ statusMap[scope.row.deviceStatus] }}
          </template>
        </el-table-column>
        <el-table-column
          prop="deviceStatus"
          label="录制状态"
          width="120"
        >
          <template slot-scope="scope">
            {{ statusMap[scope.row.deviceStatus] }}
          </template>
        </el-table-column>
        <el-table-column
          prop="ip"
          label="当前码率"
        />
        <el-table-column
          prop="errorMsg"
          label="异常提示"
        />
        <el-table-column
          prop="deviceVendor"
          label="厂商"
        />
        <el-table-column
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
        />
        <el-table-column
          prop="deviceChannelSize"
          label="通道数"
        />
        <el-table-column
          prop="deviceIp"
          label="设备IP"
        />
        <el-table-column
          prop="devicePort"
          label="设备端口"
        />
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
        />
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
import { Component, Vue, Watch } from 'vue-property-decorator'
import { getDeviceList } from '@/api/ibox'
// import { IBoxModule } from '@/store/modules/ibox'
import { InVideoProtocolModelMapping } from '@vss/device/dicts'
import { dateFormat } from '@/utils/date'

@Component({
  name: 'DeviceList',
  components: {
  }
})

export default class IBoxList extends Vue {
  public tableData = []
  public dateFormat = dateFormat

  public statusMap = {
    on: '在线',
    off: '离线',
    new: '未注册'
  }

  public pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  public async mounted() {
    await this.getDeviceList()
  }

  @Watch('$route.query')
  public onRouterChange() {
    this.getDeviceList()
  }

  public async getDeviceList() {
    const { query } = (this.$route) as any
    const { deviceId = '' } = query
    const param = {
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize,
      ParentDeviceId: deviceId
    }
    try {
      await getDeviceList(param).then(res => {
        this.tableData = res.devices.map((item: any) => {
          let videosInfo = item.videos[0]
          console.log('videosInfo.InVideoProtocol--->', InVideoProtocolModelMapping[videosInfo.inVideoProtocol])
          videosInfo = videosInfo[InVideoProtocolModelMapping[videosInfo.inVideoProtocol]]

          return {
            ...item.device,
            ...item.industry,
            ...videosInfo,
            ...item
          }
        })
        console.log('this.tableData--->', this.tableData)
        this.pager = {
          total: Number(res.totalNum),
          pageNum: Number(res.pageNum),
          pageSize: Number(res.pageSize)
        }
      })
    } catch (error) {
      console.log(error)
    }
    // this.tableData = IBoxModule.iboxList.data
  }

  public async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getDeviceList()
  }

  public async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getDeviceList()
  }

  public addIBox() {
    let query: any = {
      deviceId: this.$route.query.deviceId,
      parentDeviceId: this.$route.query.deviceId,
      type: this.$route.query.type
    }
    // IBoxDeviceCreate
    const router: any = {
      name: 'IBoxDeviceCreate',
      query
    }
    this.$router.push(router)
  }

  // public cb() {
  //   this.addIBox()
  //   this.getDeviceList()
  //   const path = this.$route.path
  //   this.$router.push(path)
  // }

  public toDetail(row: any) {
    let query: any = {
      deviceId: row.deviceId,
      type: this.$route.query.type
    }
    const router: any = {
      name: 'IBoxDeviceInfo',
      query
    }

    // if (JSON.stringify(this.$route.query) === JSON.stringify(router.query)) return
    this.$router.push(router)
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
    }
  }

  </style>
