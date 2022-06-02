<!--查询录像有问题的日期-->
<template>
  <div class="record">
    <div class="form">
      <div class="form-item">
        <label>起始日期:</label>
        <el-date-picker
          v-model="startDate"
          value-format="timestamp"
          type="datetime"
          style="width: 310px;"
          default-time="00:00:00"
        />
      </div>
      <div class="form-item">
        <label>结束日期:</label>
        <el-date-picker
          v-model="endDate"
          value-format="timestamp"
          type="datetime"
          style="width: 310px;"
          default-time="23:59:59"
        />
      </div>
      <div class="form-item">
        <label>忽略起始时段 <el-tooltip content="忽略起始时间到实际第一段录像的startTime"><svg-icon name="help" /></el-tooltip>:</label>
        <el-checkbox v-model="ignoreFirst" />
      </div>
      <div class="form-item">
        <label>忽略末尾时段 <el-tooltip content="如果结束日期超过最后一段录像时间，结束日期与最后一段录像的差值不会判断为丢失时间"><svg-icon name="help" /></el-tooltip>:</label>
        <el-checkbox v-model="ignoreLast" />
      </div>
      <div class="form-item">
        <label>忽略时长 <el-tooltip content="忽略指定秒内的缺失录像"><svg-icon name="help" /></el-tooltip>:</label>
        <el-input v-model.number="ignoreTime" style="width: 310px;" />
      </div>
      <div class="form-item">
        <label>设备IDs <el-tooltip content="支持输入NVR或通道的DeviceId，多个设备以回车分隔"><svg-icon name="help" /></el-tooltip>:</label>
        <el-input v-model="deviceId" type="textarea" style="width: 310px;" rows="5" placeholder="多个设备以回车分隔" />
      </div>
      <div class="form-item">
        <label />
        <el-button type="primary" :loading="loading" @click="query">查询</el-button>
      </div>
    </div>
    <el-button class="back-top" @click="backTop">回到顶部</el-button>
    <div class="logs">
      <h2>查询进度</h2>
      <p v-if="log.currentNum"><el-progress :text-inside="true" :stroke-width="24" :percentage="Math.floor(log.taskIndex / log.taskSize * 100)" status="success" /></p>
      <p>通道：{{ log.currentNum }} / {{ log.size }}</p>
      <p>当前查询日期：{{ dateFormat(currentDate, 'yyyy-MM-dd') }}</p>
      <p>任务进度：{{ log.taskIndex }} / {{ log.taskSize }}</p>
    </div>

    <div class="status">
      <h2>概览</h2>
      <h4>发现缺失片段总数: {{ totalMissing }}</h4>
      <h4 v-if="(log.taskIndex === log.taskSize) && log.taskSize > 0">录像完整率: {{ calTotalPercent(totalSec) }}</h4>
      <h4>总缺失时长: {{ totalSec }}s <span v-if="totalSec > 60" style="font-size: 14px; color: #999;">({{ durationFormat(totalSec) }})</span></h4>
      <table v-if="totalMissing > 0" style="width: 100%; margin-bottom: 15px;" border="1" cellspacing="0" cellpadding="0">
        <tr>
          <th>日期</th>
          <th>缺失时长(秒)</th>
          <th>缺失时长</th>
          <th>缺失数量</th>
        </tr>
        <tr v-for="({totalSec, totalMissing}, key) in nvrStat" :key="key">
          <td><strong>{{ dateFormat(parseInt(key), 'yyyy-MM-dd') }}</strong></td>
          <td>{{ totalSec }} s</td>
          <td>{{ durationFormat(totalSec) }}</td>
          <td>{{ totalMissing }}</td>
        </tr>
      </table>
    </div>

    <el-card>
      <div v-for="(channel, index) in list" :key="index" class="device">
        <h3 style="margin-top: 20px;"><span v-if="channel.nvrName">{{ channel.nvrName }}-</span>{{ channel.channelName }}  <span style="font-size: 14px; color: #999;">(channelNum: {{ channel.channelNum }} / deviceId: {{ channel.deviceId }})</span></h3>
        <h4>发现通道下缺失片段总数: {{ channel.totalMissing }}</h4>
        <h4 v-if="channel.finish">通道录像完整率: {{ calChannelPercent(channel.totalSec) }}</h4>
        <h4 v-if="channel.finish">通道总缺失时长: {{ channel.totalSec }}s <span v-if="channel.totalSec > 60" style="font-size: 14px; color: #999;">({{ durationFormat(channel.totalSec) }})</span></h4>
        <div v-for="({list, totalSec}, key) in channel.dateList" :key="key" class="missing-date">
          <template v-if="list.length">
            <svg-icon name="dot" />
            <strong>日期: {{ dateFormat(parseInt(key), 'yyyy-MM-dd') }}</strong>
            <span style="margin: 0 15px;">缺失数量: {{ list.length }}</span>
            <span style="margin: 0 15px 0 0;">缺失时长: {{ totalSec }}s <span v-if="totalSec > 60" style="font-size: 14px; color: #999;">({{ durationFormat(totalSec) }})</span></span>
            <el-button type="text" @click="open(channel, key)">{{ openDetail[channel.deviceId + key] ? '隐藏详情' : '查看详情' }}</el-button>
            <div v-if="channel.error">当前日期接口查询失败</div>
            <table v-if="openDetail[channel.deviceId + key]" style="width: 100%;" border="1" cellspacing="0" cellpadding="0">
              <tr>
                <th>缺失时长(秒)</th>
                <th>缺失时长</th>
                <th>开始时间</th>
                <th>结束时间</th>
              </tr>
              <tr v-for="(item, idx) in list" :key="idx">
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
import { trim } from 'lodash'

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
  private ignoreFirst = true
  private ignoreLast = true
  private list = []
  private loading = false
  private log = {
    currentNum: 0,
    size: 0,
    taskSize: 0,
    taskIndex: 0
  }
  private openDetail = {}
  private nvrStat = {}
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
    const spanDay = Math.floor((getDateByTime(this.endDate) - getDateByTime(this.startDate)) / (24 * 60 * 60 * 1000))
    this.list = []
    this.nvrStat = {}
    this.totalMissing = 0
    this.totalSec = 0
    this.log = {
      currentNum: 0,
      size: 0,
      taskSize: 0,
      taskIndex: 0
    }
    try {
      const deviceIdList = trim(this.deviceId).split('\n')
      let channels = []
      for (let i = 0; i < deviceIdList.length; i++) {
        const device = await getDevice({
          inProtocol: 'gb28181',
          deviceId: deviceIdList[i]
        })
        // 兼容IPC
        if (device.parentDeviceId === '-1' && device.deviceType === 'ipc') {
          channels.push({
            nvrName: '',
            deviceId: device.deviceId,
            channelName: device.deviceName,
            channelNum: ''
          })
        } else {
          device.deviceChannels.forEach(channel => {
            channel.nvrName = device.deviceName
          })
          channels = channels.concat(device.deviceChannels)
        }
      }
      this.log.size = channels.length
      this.log.taskSize = this.log.size * (spanDay + 1)
      for (let i = 0; i < channels.length; i++) {
        this.currentDate = getDateByTime(this.startDate)
        this.log.currentNum = i + 1
        const device = channels[i]
        const channel = {
          deviceId: device.deviceId,
          nvrName: device.nvrName,
          channelName: device.channelName,
          channelNum: device.channelNum,
          dateList: {},
          totalMissing: 0,
          totalSec: 0,
          finish: false,
          error: false
        }
        this.list.push(channel)
        for (let j = 0; j <= spanDay; j++) {
          let list = []
          let missDate = channel.dateList[this.currentDate]
          if (missDate) {
            list = missDate.list
          } else {
            channel.dateList[this.currentDate] = {
              list,
              totalSec: 0
            }
            missDate = channel.dateList[this.currentDate]
          }
          let startTime = Math.floor(this.currentDate)
          let endTime = startTime + 24 * 60 * 60 * 1000
          if (this.startDate > startTime) {
            startTime = this.startDate
          }
          if (this.endDate < endTime) {
            endTime = this.endDate
          }
          try {
            const res = await getDeviceRecords({
              deviceId: device.deviceId,
              inProtocol: 'gb28181',
              recordType: 0,
              startTime: Math.floor(startTime / 1000),
              endTime: Math.floor(endTime / 1000),
              pageSize: 999999
            })
            if (!res.records.length) {
              list.push({
                time: (endTime - startTime) / 1000,
                start: dateFormat(new Date(startTime)),
                end: dateFormat(new Date(endTime))
              })
            }
            res.records.map((record: any, index: number) => {
              const currentStart = getTimestamp(record.startTime)
              const currentEnd = getTimestamp(record.endTime)
              // 判断第一段视频是否从00:00开始
              if (index === 0 && !this.ignoreFirst) {
                if (((currentStart - startTime) / 1000) > this.ignoreTime) {
                  list.push({
                    time: (currentStart - startTime) / 1000,
                    start: dateFormat(new Date(startTime)),
                    end: dateFormat(new Date(currentStart))
                  })
                }
              }
              // 判断最后一段视频是否为24:00结束
              if ((index === res.records.length - 1 && res.records.length > 1) && !(this.ignoreLast && j === spanDay)) {
                if (((endTime - currentEnd) / 1000) > this.ignoreTime) {
                  list.push({
                    time: (endTime - currentEnd) / 1000,
                    start: dateFormat(new Date(currentEnd)),
                    end: dateFormat(new Date(endTime))
                  })
                }
              }
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
              let nvrStat = this.nvrStat[this.currentDate]
              if (!nvrStat) {
                this.nvrStat[this.currentDate] = {
                  totalSec: 0,
                  totalMissing: 0
                }
                nvrStat = this.nvrStat[this.currentDate]
              }
              channel.totalMissing += list.length
              nvrStat.totalMissing += list.length
              this.totalMissing += list.length
              const totalSec = list.reduce((total, item) => {
                return total + item.time
              }, 0)
              missDate.totalSec = totalSec
              channel.totalSec += totalSec
              nvrStat.totalSec += totalSec
              this.totalSec += totalSec
            }
          } catch (e) {
            console.log(e)
            channel.error = true
            this.$message.error(e.message)
          }
          this.currentDate = this.currentDate + 24 * 60 * 60 * 1000
          this.log.taskIndex++
          if (j === spanDay) {
            channel.finish = true
          }
        }
      }
    } catch (e) {
      console.log(e)
      this.$message.error(e.message)
    }
  }

  private calChannelPercent(totalSec) {
    return (100 - (totalSec / ((this.endDate - this.startDate) / 1000) * 100)).toFixed(2) + '%'
  }

  private calTotalPercent(totalSec) {
    return (100 - (totalSec / ((this.endDate - this.startDate) / 1000 * this.log.size) * 100)).toFixed(2) + '%'
  }

  private open(channel, key) {
    const val = this.openDetail[`${channel.deviceId}${key}`]
    this.$set(this.openDetail, `${channel.deviceId}${key}`, !val)
  }

  private backTop() {
    document.querySelector('#app').scrollTop = 0
  }
}
</script>
<style lang="scss" scoped>
.record {
  padding: 20px;
}

.form {
  margin: 0 0 20px;
  padding: 10px 20px;
  border: 1px solid #bbb;
  background: #fff;

  label {
    width: 120px;
    display: inline-block;
  }

  .form-item {
    margin: 10px 0;
  }
}

.status {
  margin: 20px 0;
  padding: 0 20px;
  border: 1px solid #c6872a;
  background: #fff7ec;

  li {
    margin: 5px 0;
  }
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

.back-top {
  position: fixed;
  right: 0;
  bottom: 20px;
  background: $primary;
  color: #fff;
  padding: 15px 20px;
  font-size: 14px;
  cursor: pointer;
}
</style>
