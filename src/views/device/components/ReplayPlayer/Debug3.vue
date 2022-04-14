<!--查询录像有问题的日期-->
<template>
  <div class="record" style="padding: 15px;">
    起始日期: <el-date-picker
      v-model="startDate"
      value-format="timestamp"
      type="date"
    />
    结束日期: <el-date-picker
      v-model="endDate"
      value-format="timestamp"
      type="date"
    />
    设备ID: <el-input v-model="deviceId" style="width: 200px;margin-right: 10px;" />
    <el-button type="primary" :loading="loading" @click="query">查询</el-button>

    <div class="logs">
      <h2>查询进度</h2>
      <p>通道：{{ log.currentNum }} / {{ log.size }}</p>
      <p>当前查询日期：{{ dateFormat(currentDate, 'yyyy-MM-dd') }}</p>
    </div>

    <div class="status">
      <h2>缺失日期概览</h2>
      <ul>
        <li v-for="val in nvrStat" :key="val">{{ dateFormat(val, 'yyyy-MM-dd') }}</li>
      </ul>
    </div>

    <el-card>
      <div v-for="(channel, index) in list" :key="index" class="device">
        <h3 style="margin-top: 20px;">{{ channel.channelName }}  <span style="font-size: 14px; color: #999;">(channelNum: {{ channel.channelNum }} / deviceId: {{ channel.deviceId }})</span></h3>
        <div v-for="(list, key) in channel.missList" :key="key" class="missing-date">
          <template v-if="list.length">
            <svg-icon name="dot" />
            <span>日期：{{ dateFormat(parseInt(key), 'yyyy-MM-dd') }}</span>
            <span style="margin: 0 15px;">缺失数量：{{ list.length }}</span>
            <el-button type="text" @click="open(channel, key)">{{ openDetail[channel.deviceId + key] ? '隐藏详情' : '查看详情' }}</el-button>
            <table v-if="openDetail[channel.deviceId + key]" style="width: 100%;" border="1" cellspacing="0" cellpadding="0">
              <tr>
                <th>缺失时长</th>
                <th>开始时间</th>
                <th>结束时间</th>
              </tr>
              <tr v-for="(item, index) in list" :key="index">
                <td>{{ item.time }} s</td>
                <td>{{ item.start }}</td>
                <td>{{ item.end }}</td>
              </tr>
            </table>
          </template>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getDeviceRecords, getDevice } from '@/api/device'
import { getTimestamp, dateFormat, getDateByTime } from '@/utils/date'

@Component({
  name: 'PlayerDebug'
})
export default class extends Vue {
  private dateFormat = dateFormat
  private startDate = getDateByTime(new Date().getTime())
  private endDate = getDateByTime(new Date().getTime())
  private currentDate = null
  private deviceId = ''
  private list = []
  private loading = false
  private log = {
    currentNum: 0,
    size: 0
  }
  private openDetail = {}
  private nvrStat = new Set()

  private async query() {
    if (!this.startDate || !this.deviceId) {
      console.log('请填写参数')
      return
    }
    try {
      this.loading = true
      await this.queryByDevice()
    } finally {
      this.loading = false
    }
  }

  private async queryByDevice() {
    const spanDay = (this.endDate - this.startDate) / (24 * 60 * 60 * 1000)
    this.currentDate = this.startDate
    this.list = []
    const nvr = await getDevice({
      inProtocol: 'gb28181',
      deviceId: this.deviceId
    })
    this.log.size = nvr.deviceChannels.length
    for (let i = 0; i < nvr.deviceChannels.length; i++) {
      this.currentDate = this.startDate
      this.log.currentNum = i + 1
      const device = nvr.deviceChannels[i]
      const channel = {
        deviceId: device.deviceId,
        channelName: device.channelName,
        channelNum: device.channelNum,
        missList: {}
      }
      this.list.push(channel)
      for (let j = 0; j <= spanDay; j++) {
        let list = []
        if (channel.missList[this.currentDate]) {
          list = channel.missList[this.currentDate]
        } else {
          channel.missList[this.currentDate] = list
        }
        const startTime = Math.floor(this.currentDate / 1000)
        const endTime = startTime + 24 * 60 * 60
        const res = await getDeviceRecords({
          deviceId: device.deviceId,
          inProtocol: 'gb28181',
          recordType: 0,
          startTime,
          endTime,
          pageSize: 999999
        })
        res.records.map((record: any, index: number) => {
          const currentEnd = getTimestamp(record.endTime)
          if (index + 1 < res.records.length) {
            const nextStart = getTimestamp(res.records[index + 1]['startTime'])
            if ((nextStart - currentEnd) > 0) {
              list.push({
                time: (nextStart - currentEnd) / 1000,
                start: dateFormat(new Date(currentEnd)),
                end: dateFormat(new Date(nextStart))
              })
            }
          }
        })
        if (list.length) {
          this.nvrStat.add(this.currentDate)
        }
        this.currentDate = this.currentDate + 24 * 60 * 60 * 1000
      }
    }
  }

  private open(channel, key) {
    const val = this.openDetail[`${channel.deviceId}${key}`]
    this.$set(this.openDetail, `${channel.deviceId}${key}`, !val)
  }
}
</script>
<style lang="scss" scoped>
.status {
  margin: 20px 0;
  padding: 0 20px;
  border: 1px solid #c6872a;
  background: #fff7ec;
}

.logs {
  margin: 20px 0;
  padding: 0 20px;
  border: 1px solid #2a5ec6;
  background: #eef4ff;
}

.device {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #aaa;
}

.missing-date {
  margin: 10px 0;
}

table {
  margin-top: 10px;

  td,
  th {
    padding: 4px;
    text-align: center;
    font-size: 12px;
  }
}
</style>
