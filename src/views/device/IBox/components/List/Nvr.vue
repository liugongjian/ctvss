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
          prop="deviceStatus"
          label="状态"
          width="120"
        >
          <template slot-scope="scope">
            {{ statusMap[scope.row.deviceStatus.isOnline] || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="deviceIp"
          label="IP地址"
        />
        <el-table-column
          prop="zip"
          label="序列号"
        />
        <el-table-column
          prop="registerTime"
          label="接入时间"
        >
          <template slot-scope="{row}">
            {{ dateFormat(Number(row.deviceStatus.registerTime)) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="channelSize"
          label="通道总数"
        />
        <el-table-column
          label="操作"
        />
      </el-table>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getDeviceList } from '@/api/ibox'
// import { IBoxModule } from '@/store/modules/ibox'
import { InVideoProtocolModelMapping } from '@vss/device/dicts'
import { dateFormat } from '@/utils/date'

@Component({
  name: 'NvrList',
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

  public async getDeviceList() {
    const { query } = (this.$route) as any
    const { deviceId = '' } = query
    const param = {
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize,
      ParentDeviceId: deviceId
    }
    try {
      await getDeviceList(param).then((res: any) => {
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
      })
    } catch (error) {
      console.log(error)
    }
    // this.tableData = IBoxModule.iboxList.data
    console.log('tableData--->', this.tableData)
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
  width: 100%;

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
