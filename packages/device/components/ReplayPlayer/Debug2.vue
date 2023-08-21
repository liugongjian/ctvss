<template>
  <div>
    日期: <el-date-picker
      v-model="startTime"
      value-format="timestamp"
      type="date"
    />
    类型: <el-select v-model="type" placeholder="Select">
      <el-option label="nvr" value="nvr" />
      <el-option label="ipc" value="ipc" />
    </el-select>
    设备ID: <el-input v-model="deviceId" style="width: 200px;" />
    <el-button type="primary" @click="query">query</el-button>

    <div v-for="(channel, index) in list" :key="index">
      <h2 style="margin-top: 20px;">{{ channel.channelName }}</h2>
      <h4 style="margin-top: 0;">(channelNum: {{ channel.channelNum }},  deviceId: {{ channel.deviceId }})</h4>
      <ul>
        <li v-for="(miss, index2) in channel.missList" :key="index2">
          <span>缺失时长: {{ miss.time }}</span>
          <span style="color: #999; margin-left: 15px;">起始时间: {{ miss.start }}</span>
          <span style="color: #999; margin-left: 15px;">结束时间: {{ miss.end }}</span>
        </li>
      </ul>
      <div v-if="!channel.missList.length">无缺失</div>
      <hr>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getDeviceRecords, getDevice } from '@vss/device/api/device'
import { getTimestamp, dateFormat } from '@/utils/date'

@Component({
  name: 'PlayerDebug'
})
export default class extends Vue {
  private startTime = new Date().getTime()
  private deviceId = null
  private type = 'nvr'
  private list = []

  private async query() {
    if (!this.startTime || !this.deviceId) {
      console.log('请填写参数')
    }
    const startTime = Math.floor(this.startTime / 1000)
    const endTime = startTime + 24 * 60 * 60
    if (this.type === 'nvr') {
      this.list = []
      const nvr = await getDevice({
        inProtocol: 'gb28181',
        deviceId: this.deviceId
      })
      nvr.deviceChannels.forEach(async(device) => {
        const channel = {
          deviceId: device.deviceId,
          channelName: device.channelName,
          channelNum: device.channelNum,
          missList: []
        }
        const res = await getDeviceRecords({
          deviceId: device.deviceId,
          inProtocol: 'gb28181',
          recordType: 0,
          startTime,
          endTime,
          pageSize: 999999
        })
        res.records.map((record: any, index: number) => {
          const currentEnd2 = getTimestamp(record.endTime)
          if (index + 1 < res.records.length) {
            const nextStart2 = getTimestamp(res.records[index + 1]['startTime'])
            if ((nextStart2 - currentEnd2) > 0) {
              channel.missList.push({
                time: `${(nextStart2 - currentEnd2) / 1000}s`,
                start: dateFormat(new Date(currentEnd2)),
                end: dateFormat(new Date(nextStart2))
              })
            }
          }
        })
        this.list.push(channel)
      })
    } else {
      const channel = {
        deviceId: this.deviceId,
        channelName: '',
        channelNum: '',
        missList: []
      }
      const res = await getDeviceRecords({
        deviceId: this.deviceId,
        inProtocol: 'gb28181',
        recordType: 0,
        startTime,
        endTime,
        pageSize: 999999
      })
      res.records.map((record: any, index: number) => {
        const currentEnd2 = getTimestamp(record.endTime)
        if (index + 1 < res.records.length) {
          const nextStart2 = getTimestamp(res.records[index + 1]['startTime'])
          if ((nextStart2 - currentEnd2) > 0) {
            channel.missList.push({
              time: `${(nextStart2 - currentEnd2) / 1000}s`,
              start: dateFormat(new Date(currentEnd2)),
              end: dateFormat(new Date(nextStart2))
            })
          }
        }
      })
      this.list.push(channel)
    }
  }
}
</script>
<style lang="scss" scoped>
.player {
  display: flex;

  &__controls {
    width: 400px;
    padding: 20px;
  }

  &__body {
    flex: 1;

    // ::v-deep video {
    //   width: 100%;
    //   height: 100%;
    // }

    ::v-deep .vss-player__wrap {
      height: 500px;
      width: 100%;
    }
  }
}
</style>
