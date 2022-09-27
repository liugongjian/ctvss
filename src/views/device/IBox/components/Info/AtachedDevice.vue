<template>
  <div class="device-wrapper">
    <div class="alarm-container">
      <div class="alarm-container__time">
        告警时间：
        <el-radio-group
          v-model="period.periodType"
          size="medium"
          @change="handleChange"
        >
          <!-- <el-radio-group> -->
          <el-radio-button label="今天" />
          <el-radio-button label="近3天" />
          <el-radio-button label="自定义时间" />
        </el-radio-group>
        <el-date-picker
          v-if="period.periodType === '自定义时间'"
          v-model="period.period"
          type="daterange"
          value-format="timestamp"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleChange"
        />
      </div>
      <div class="alarm-container__alarm">
        <div>总告警次数：</div>
        <div>{{ totalAlarm }}次</div>
      </div>
    </div>
    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="devices"
      tooltip-effect="dark"
      cell-class-name="tableCell"
      @row-click="rowClick"
    >
      <el-table-column label="名称">
        <template slot-scope="scope">
          <div class="device-list__device-type">
            <status-badge
              v-if="scope.row.deviceType === 'ipc'"
              :status="scope.row.deviceStatus"
            />
            <svg-icon
              :name="scope.row.deviceType"
              width="20"
              height="20"
              :class="scope.row.deviceStatus + 'line'"
            />
          </div>
          <div class="device-list__device-name">
            <div class="device-list__device-id">{{ scope.row.deviceName }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="设备ID">
        <template slot-scope="scope">{{ scope.row.deviceId }}</template>
      </el-table-column>
      <el-table-column label="AI启用状态">
        <template slot-scope="scope">
          <status-badge
            :status="scope.row.deviceStatus === 'on' ? 'on' : 'failed'"
          />
          <span>{{ parseInt(scope.row.status) ? '启用' : '停用' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="count" label="告警次数" />
    </el-table>
    <!-- <el-pagination
      :current-page="pager.pageNum"
      :page-size="pager.pageSize"
      :total="pager.totalNum"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    /> -->
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch, Prop, Inject } from 'vue-property-decorator'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { getAiAlarm } from '@/api/ai-app'
import { getDeviceList } from '@/api/ibox'
import AppMixin from '@/views/AI/mixin/app-mixin'

@Component({
  name: 'AtachedDevice',
  components: { StatusBadge }
})
export default class extends Mixins(AppMixin) {
  @Prop({}) public appInfo!: any
  @Inject('handleNodeClick') public handleNodeClick!: any
  private pager = {
    pageNum: 1,
    pageSize: 10,
    totalNum: 0
  }
  private loading = false
  private devices: any = []
  private totalAlarm = 0
  private groups = []

  @Watch('period.periodType')
  private periodTypeUpdated(newVal) {
    switch (newVal) {
      case '今天':
        this.period.period = [
          new Date().setHours(0, 0, 0, 0),
          new Date().setHours(23, 59, 59, 999)
        ]
        break
      case '近3天':
        this.period.period = [
          this.getDateBefore(2),
          new Date().setHours(23, 59, 59, 999)
        ]
        break
      case '自定义时间':
        this.period.period = [
          this.getDateBefore(6),
          new Date().setHours(0, 0, 0, 0)
        ]
        break
    }
  }

  private async mounted() {
    // this.loading = true
    await this.getAttachedDevice()
    // this.getAlarms()
    // this.loading = false
  }

  private async getAttachedDevice() {
    const deviceIds = JSON.parse(this.appInfo.deviceIds)
    const param = {
      ParentDeviceId: this.$route.query.deviceId,
      pageNum: 1,
      pageSize: 9999
    }

    try {
      let channels = []
      const iboxId = this.$route.query.deviceId
      const { devices }: any = await getDeviceList(param)
      debugger
      const _devices = devices.map((device) => {
        if (device.device.deviceType === 'nvr') {
          const deviceChannels = device.device.deviceChannels.map(
            (channel) => ({
              ...channel,
              deviceDir:
                iboxId + ',' + device.device.deviceId + ',' + channel.deviceId
            })
          )
          channels.push(...deviceChannels)

          return {
            ...device.device,
            deviceStatus:
              device.videos[0].gb28181Device?.deviceStatus?.isOnline || 'off',
            deviceDir: iboxId + ',' + device.device.deviceId
          }
        }
        return {
          ...device.device,
          deviceStatus:
            device.videos[0].gb28181Device?.deviceStatus?.isOnline || 'off',
          deviceDir: iboxId + ',' + device.device.deviceId
        }
      })
      _devices.push(...channels)
      this.devices = _devices.filter((device) =>
        deviceIds.find((id) => id === device.deviceId)
      )
    } catch (e) {
      console.log(e)
    }
    // this.devices = deviceList
    // this.pager.pageNum = pageNum
    // this.pager.pageSize = pageSize
    // this.pager.totalNum = totalNum
  }

  private rowClick(row: any) {
    console.log()
    this.$router.replace({
      name: 'IBoxDeviceDetail',
      query: {
        path: row.deviceDir,
        deviceId: row.deviceId,
        type: 'ipc'
      }
    })
    // this.handleNodeClick({ device: row.deviceId })
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getAttachedDevice()
    this.getAlarms()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getAttachedDevice()
    this.getAlarms()
  }

  public async getAlarms() {
    this.loading = true
    this.alarms = []
    this.getAlarm(this.$route.query.appid, null, this.period.period)
    const promiseArray = this.devices.map((item) =>
      this.getAlarm(this.$route.query.appid, item.deviceId, this.period.period)
    )
    await Promise.all(promiseArray)
    this.devices = this.devices.map((device) => {
      const result = this.alarms.filter(
        (alarm) => alarm.deviceId === device.deviceId
      )
      return { ...device, count: result[0].count }
    })
    this.loading = false
  }

  public async getAlarm(appId, deviceId, period) {
    if (deviceId) {
      const res = await getAiAlarm({
        appId,
        deviceId,
        startTime: period[0],
        endTime:
          this.period.periodType === '自定义时间'
            ? period[1] + this.msOfADay
            : period[1]
      })
      this.alarms.push(res)
    } else {
      const { count } = await getAiAlarm({
        appId,
        startTime: period[0],
        endTime:
          this.period.periodType === '自定义时间'
            ? period[1] + this.msOfADay
            : period[1]
      })
      this.totalAlarm = count
    }
  }
}
</script>
<style lang="scss" scoped>
.device-wrapper {
  .device-list__device-type {
    display: inline-block;
    position: relative;
    margin: 2px 8px;

    .status-badge {
      position: absolute;
      top: -2px;
      left: -6px;
    }
  }

  .device-list__device-name {
    display: inline-block;
  }

  flex: 1 1 auto;

  .svg-icon {
    // margin: 0 8px;
  }

  .alarm-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;

    &__alarm {
      & > div {
        display: inline-block;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
      }

      & > div:nth-of-type(2) {
        background: $primary;
        margin-left: 5px;
      }
    }
  }
}

.online {
  color: #65c465;
}

.offline {
  color: #6e7c89;
}

/* stylelint-disable-next-line selector-class-pattern */
::v-deep .tableCell {
  cursor: pointer;
}
</style>
