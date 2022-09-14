<template>
  <div class="ibox-list">
    <ibox-create v-if="showAdd" :cb="refreshList" />

    <div v-else>
      <div class="ibox-list__btn-box">
        <el-button type="primary" @click="addIBox">添加设备</el-button>
        <el-button>导出</el-button>
        <el-button>导入</el-button>
        <el-button>下载模板</el-button>
        <el-button>批量操作</el-button>
      </div>

      <el-table :data="tableData" fit>
        <el-table-column
          fixed
          prop="deviceId"
          label="设备ID/名称"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.deviceId }}/</div>
            <div>{{ scope.row.deviceName }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="zip"
          label="类型"
        />
        <el-table-column
          prop="deviceStatus"
          label="设备状态"
          width="120"
        >
          <template slot-scope="scope">
            {{ statusMap[scope.row.deviceStatus] }}
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
          prop="ip"
          label="异常提示"
        />
        <el-table-column
          prop="ip"
          label="厂商"
        />
        <el-table-column
          prop="zip"
          label="国标ID"
        />
        <el-table-column
          prop="zip"
          label="信息传输模式"
        />
        <el-table-column
          prop="zip"
          label="流传输模式"
        />
        <el-table-column
          prop="zip"
          label="优先TCP传输"
        />
        <el-table-column
          prop="channelSize"
          label="通道数"
        />
        <el-table-column
          prop="deviceIP"
          label="设备IP"
        />
        <el-table-column
          prop="channelSize"
          label="设备端口"
        />
        <el-table-column
          prop="registerTime"
          label="创建时间"
        >
          <template slot-scope="{row}">
            {{ dateFormat(row.registerTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
        />
      </el-table>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getIBoxList } from '@/api/ibox'
import { IBoxModule } from '@/store/modules/ibox'
import { dateFormat } from '@/utils/date'
import iboxCreate from './IBoxCreate.vue'

@Component({
  name: 'DeviceList',
  components: {
    iboxCreate
  }
})

export default class IBoxList extends Vue {
  public tableData = []
  public dateFormat = dateFormat

  public showAdd = false

  public statusMap = {
    on: '在线',
    off: '离线',
    new: '未注册'
  }

  public async mounted() {
    await this.getIBoxList()
  }

  public async getIBoxList() {
    const { query } = (this.$route) as any
    const { deviceId = '' } = query
    const param = {
      pageNum: 1,
      pageSize: 10,
      ParentDeviceId: deviceId
    }
    try {
      this.tableData = await getIBoxList(param).data
    } catch (error) {
      console.log(error)
    }
    // this.tableData = IBoxModule.iboxList.data
  }

  public addIBox() {
    this.showAdd = !this.show
  }

  public refreshList() {
    this.showAdd = false
    this.getIBoxList()
  }
}
</script>
<style lang="scss" scoped>
  .ibox-list {
    overflow: auto;
  }

  </style>
