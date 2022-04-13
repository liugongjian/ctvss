<template>
  <div>
    起始时间: <el-input v-model="startTime" style="width: 200px" />
    设备ID: <el-input v-model="deviceId" style="width: 200px" />
    <el-button @click="query" type="primary">query</el-button>

    <div v-for="channel in list">
      <h2 style="margin-top: 20px;">{{ channel.channelName }}</h2>
      <h4 style="margin-top: 0;">(channelNum: {{ channel.channelNum }},  deviceId: {{ channel.deviceId }})</h4>
      <ul>
        <li v-for="miss in channel.missList">
          <span>缺失时长: {{ miss.time }}</span>
          <span style="color: #999; margin-left: 15px;">起始时间: {{ miss.start }}</span>
          <span style="color: #999; margin-left: 15px;">结束时间: {{ miss.end }}</span>
        </li>
      </ul>
      <div v-if="!channel.missList.length">无缺失</div>
      <hr />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getDeviceRecords, getDevice } from '@/api/device'
import { getTimestamp, dateFormat } from '@/utils/date'

@Component({
  name: 'PlayerDebug'
})
export default class extends Vue {
  private startTime = 1649347200
  private deviceId = null
  private list = []

  private async query() {
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
        startTime: this.startTime,
        endTime: Math.floor(new Date().getTime() / 1000),
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
