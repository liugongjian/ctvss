<!--查询录像有问题的日期-->
<template>
  <div class="record" style="padding: 15px;">
    起始日期:
    <el-date-picker
      v-model="startDate"
      value-format="timestamp"
      type="datetime"
      style="width: 210px;"
      default-time="00:00:00"
    />
    结束日期: <el-date-picker
      v-model="endDate"
      value-format="timestamp"
      type="datetime"
      style="width: 210px;"
      default-time="23:59:59"
    />
    设备ID <el-tooltip content="支持输入NVR或通道的DeviceId"><svg-icon name="help" /></el-tooltip>: <el-input v-model="deviceId" style="width: 180px;" />
    忽略时长 <el-tooltip content="忽略指定秒内的缺失录像"><svg-icon name="help" /></el-tooltip>:
    <el-input v-model.number="ignoreTime" style="width: 80px;margin-right: 10px;" />
    <el-button type="primary" :loading="loading" @click="query">查询</el-button>

    <div class="logs">
      <h2>查询进度</h2>
      <p v-if="log.currentNum"><el-progress :text-inside="true" :stroke-width="24" :percentage="Math.floor(log.taskIndex / log.taskSize * 100)" status="success" /></p>
      <p>通道：{{ log.currentNum }} / {{ log.size }}</p>
      <p>当前查询日期：{{ dateFormat(currentDate, 'yyyy-MM-dd') }}</p>
      <p>任务进度：{{ log.taskIndex }} / {{ log.taskSize }}</p>
    </div>

    <div class="status">
      <h2>概览</h2>
      <h3>发现缺失片段总数: {{ totalMissing }}</h3>
      <h3 v-if="(log.taskIndex === log.taskSize) && log.taskSize > 0">缺失率: {{ calTotalPercent(totalSec) }}</h3>
      <h3>缺失日期:</h3>
      <ul>
        <li v-for="val in nvrStat" :key="val">{{ dateFormat(val, 'yyyy-MM-dd') }}</li>
      </ul>
    </div>

    <el-card>
      <div v-for="(channel, index) in list" :key="index" class="device">
        <h3 style="margin-top: 20px;">{{ channel.channelName }}  <span style="font-size: 14px; color: #999;">(channelNum: {{ channel.channelNum }} / deviceId: {{ channel.deviceId }})</span></h3>
        <h4>发现通道下缺失片段总数: {{ channel.totalMissing }}</h4>
        <h4 v-if="channel.finish">通道录像丢失率: {{ calChannelPercent(channel.totalSec) }}</h4>
        <div v-for="(list, key) in channel.missList" :key="key" class="missing-date">
          <template v-if="list.length">
            <svg-icon name="dot" />
            <span>日期: {{ dateFormat(parseInt(key), 'yyyy-MM-dd') }}</span>
            <span style="margin: 0 15px;">缺失数量: {{ list.length }}</span>
            <el-button type="text" @click="open(channel, key)">{{ openDetail[channel.deviceId + key] ? '隐藏详情' : '查看详情' }}</el-button>
            <table v-if="openDetail[channel.deviceId + key]" style="width: 100%;" border="1" cellspacing="0" cellpadding="0">
              <tr>
                <th>缺失时长(秒)</th>
                <th>缺失时长</th>
                <th>开始时间</th>
                <th>结束时间</th>
              </tr>
              <tr v-for="(item, index) in list" :key="index">
                <td>{{ item.time }} s</td>
                <td>{{ durationFormat(item.time) }}</td>
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
import { getTimestamp, dateFormat, getDateByTime, durationFormat } from '@/utils/date'

@Component({
  name: 'PlayerDebug'
})
export default class extends Vue {
  private dateFormat = dateFormat
  private durationFormat = durationFormat
  private startDate = null
  private endDate = null
  private currentDate = null
  private deviceId = ''
  private ignoreTime = 0
  private list = []
  private loading = false
  private log = {
    currentNum: 0,
    size: 0,
    taskSize: 0,
    taskIndex: 0
  }
  private openDetail = {}
  private nvrStat = new Set()
  private totalMissing = 0
  private totalSec = 0

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
    const spanDay = Math.floor((this.endDate - this.startDate) / (24 * 60 * 60 * 1000))
    this.list = []
    this.nvrStat.clear()
    this.totalMissing = 0
    this.totalSec = 0
    this.log = {
      currentNum: 0,
      size: 0,
      taskSize: 0,
      taskIndex: 0
    }
    const nvr = await getDevice({
      inProtocol: 'gb28181',
      deviceId: this.deviceId
    })
    let channels
    // 兼容IPC
    if (nvr.parentDeviceId === '-1' && nvr.deviceType === 'ipc') {
      channels = [{
        deviceId: nvr.deviceId,
        channelName: nvr.deviceName,
        channelNum: ''
      }]
    } else {
      channels = nvr.deviceChannels
    }
    this.log.size = channels.length
    this.log.taskSize = this.log.size * (spanDay + 1)
    for (let i = 0; i < channels.length; i++) {
      this.currentDate = getDateByTime(this.startDate)
      this.log.currentNum = i + 1
      const device = channels[i]
      const channel = {
        deviceId: device.deviceId,
        channelName: device.channelName,
        channelNum: device.channelNum,
        missList: {},
        totalMissing: 0,
        totalSec: 0,
        finish: false
      }
      this.list.push(channel)
      for (let j = 0; j <= spanDay; j++) {
        let list = []
        if (channel.missList[this.currentDate]) {
          list = channel.missList[this.currentDate]
        } else {
          channel.missList[this.currentDate] = list
        }
        let startTime = Math.floor(this.currentDate)
        let endTime = startTime + 24 * 60 * 60 * 1000
        if (this.startDate > startTime) {
          startTime = this.startDate
        }
        if (this.endDate < endTime) {
          endTime = this.endDate
        }
        const res = await getDeviceRecords({
          deviceId: device.deviceId,
          inProtocol: 'gb28181',
          recordType: 0,
          startTime: Math.floor(startTime / 1000),
          endTime: Math.floor(endTime / 1000),
          pageSize: 999999
        })
        res.records.map((record: any, index: number) => {
          const currentEnd = getTimestamp(record.endTime)
          if (index + 1 < res.records.length) {
            const nextStart = getTimestamp(res.records[index + 1]['startTime'])
            if (((nextStart - currentEnd) / 1000) > this.ignoreTime) {
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
          channel.totalMissing += list.length
          this.totalMissing += list.length
          const totalSec = list.reduce((total, item) => {
            return total + item.time
          }, 0)
          channel.totalSec += totalSec
          this.totalSec += totalSec
        }
        this.currentDate = this.currentDate + 24 * 60 * 60 * 1000
        this.log.taskIndex++
        if (j === spanDay) {
          channel.finish = true
        }
      }
    }
  }

  private calChannelPercent(totalSec) {
    return (totalSec / ((this.endDate - this.startDate) / 1000) * 100).toFixed(2) + '%'
  }

  private calTotalPercent(totalSec) {
    return (totalSec / ((this.endDate - this.startDate) / 1000 * this.log.size) * 100).toFixed(2) + '%'
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
