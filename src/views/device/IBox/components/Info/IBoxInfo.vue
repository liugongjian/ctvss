<template>
  <div class="ibox-bar">
    <div class="ibox-info">
      <el-card v-loading="loading" class="base-info">
        <div class="title">
          <span>设备信息</span>
        </div>
        <div class="info">
          <el-descriptions label-class-name="des-label" content-class-name="des-content" :column="2">
            <el-descriptions-item label="设备状态"><span class="register-status" :style="statusStyle">{{ registerStatus }}</span></el-descriptions-item>
            <el-descriptions-item label="设备名称">
              <span v-if="!isEditDeviceName">{{ deviceName }}<i class="el-icon-edit-outline" style="color: #f59a23;font-size: 15px;" @click="showChangeName" /></span>
              <span v-if="isEditDeviceName" class="name-edit">
                <el-input ref="deviceName" v-model="editDeviceName" :maxlength="16" autofocus />
                <i class="el-icon-success" style="margin-left: 5px;color: #fa8334;font-size: 18px;" @click="changeName" />
                <i class="el-icon-error" style="margin-left: 5px;color: #c8c8c8;font-size: 18px;" @click="cancelChange" />
              </span>
              <div v-if="checkedFalse" class="check-tip">修改不能为空</div>
            </el-descriptions-item>
            <el-descriptions-item label="设备ID">{{ basic.deviceId }}</el-descriptions-item>
            <el-descriptions-item label="IP地址">{{ basic.ip }}</el-descriptions-item>
            <el-descriptions-item label="序列号">{{ basic.sn }}</el-descriptions-item>
            <el-descriptions-item label="描述">
              <span v-if="!isEditDes">{{ description }}<i class="el-icon-edit-outline" style="color: #f59a23;font-size: 15px;" @click="showChangeDes" /></span>
              <span v-if="isEditDes" class="name-edit">
                <el-input ref="des" v-model="editDes" :maxlength="64" autofocus />
                <i class="el-icon-success" style="margin-left: 5px;color: #fa8334;font-size: 18px;" @click="changeDes" />
                <i class="el-icon-error" style="margin-left: 5px;color: #c8c8c8;font-size: 18px;" @click="cancelEdit" />
              </span>
              <div v-if="checkedFalse" class="check-tip">修改不能为空</div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="title">
          <span>硬件信息</span>
        </div>
        <div class="info-chart">
          <BarChart class="bar-chart" :bar-chart-id="0" :chart-data="hardware.ram" :type="'ram'" :bar-color="customColor_usage" />
          <BarChart class="bar-chart" :bar-chart-id="1" :chart-data="hardware.storage" :type="'storage'" :bar-color="customColor_usage" />
          <BarChart class="bar-chart" :bar-chart-id="2" :chart-data="hardware.cpu" :type="'cpu'" :bar-color="customColor_usageRate" />
          <BarChart class="bar-chart" :bar-chart-id="3" :chart-data="hardware.gpu" :type="'gpu'" :bar-color="customColor_usageRate" />
        </div>
        <div class="title">
          <span>应用信息</span>
        </div>
        <div class="info-chart">
          <!-- 设备、算法、分析路数 -->
          <BarChart :bar-chart-id="4" :chart-data="app.stream" :type="'stream'" :bar-color="customColor_app" />
          <BarChart :bar-chart-id="5" :chart-data="app.aiAlgo" :type="'aiAlgo'" :bar-color="customColor_app" />
          <BarChart :bar-chart-id="6" :chart-data="app.aiApp" :type="'aiApp'" :bar-color="customColor_app" />
        </div>
        <div class="title">
          <span>SIP服务信息</span>
        </div>
        <div class="info">
          <el-descriptions :column="2">
            <el-descriptions-item label="SIP服务器ID">{{ sip.sipId }}</el-descriptions-item>
            <el-descriptions-item label="SIP服务器域">{{ sip.sipRegion }}</el-descriptions-item>
            <el-descriptions-item label="SIP服务器地址">{{ sip.sipIp }}</el-descriptions-item>
            <el-descriptions-item label="SIP服务器TCP端口">{{ sip.sipTcpPort }}</el-descriptions-item>
            <el-descriptions-item label="SIP服务器UDP端口">{{ sip.sipUdpPort }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import BarChart from './components/BarChart.vue'
import { getIBoxDetail, updateIBox } from '@/api/ibox'

@Component({
  name: 'IBoxInfo',
  components: {
    BarChart
  }
})
export default class extends Vue {
  private basic = {
    deviceStatus: '',
    deviceName: '',
    deviceId: '',
    ip: '',
    sn: '',
    description: ''
  }

  private sip = {
    sipId: '',
    sipRegion: '',
    sipIp: '',
    sipTcpPort: '',
    sipUdpPort: ''
  }

  private app = {
    stream: {
      total: 0,
      usage: 0
    },
    aiAlgo: {
      total: 0,
      usage: 0
    },
    aiApp: {
      total: 0,
      usage: 0
    },
    aiAlarm: {
      total: 0,
      usage: 0
    }
  }

  private isOnline: string
  // private isRegistered: boolean
  private chartData: any
  private hardware = {
    ram: {
      total: 0,
      usage: 0,
      unit: '',
      usageRate: 0
    },
    storage: {
      total: 0,
      usage: 0,
      unit: '',
      usageRate: 0
    },
    cpu: {
      total: 0,
      usage: 0,
      unit: '',
      usageRate: 0
    },
    gpu: {
      total: 0,
      usage: 0,
      unit: '',
      usageRate: 0
    }
  }

  private statusStyle: any = null
  private registerStatus: string = ''

  private loading = false

  private isEditDeviceName = false
  private isEditDes = false
  private editDeviceName: string = ''
  private deviceName: string = ''
  private description: string = ''
  private checkedFalse = false
  private checkedFalseDes = false
  private editDes: string = ''

  private get deviceId() {
    return this.$route.query && this.$route.query.deviceId
  }

  private customColor_usage = {
    mainColor: '#9FCD54',
    subColor: '#8BB2F9'
  }

  private customColor_usageRate = {
    mainColor: '#F8D34C',
    subColor: '#FDF1C6'
  }

  private customColor_app = {
    mainColor: '#F19E4B',
    subColor: '#F7CC8B'
  }

  private async mounted() {
    try {
      this.loading = true
      this.checkedFalse = false
      this.checkedFalseDes = false
      const params = {
        DeviceId: this.$route.query.deviceId
      }
      const res = await getIBoxDetail(params)
      // res = this.jsonKeysCaseTrans(res.Data)
      this.renderInfo(res)
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.loading = false
    }
  }

  private renderInfo(res: any) {
    this.transStatus(res.basic.deviceStatus)
    this.dataInfo(res)
  }

  private dataInfo(res: any) {
    this.deviceName = res.basic.deviceName
    this.description = res.basic.description
    this.basic = res.basic
    this.sip = res.sip
    this.hardware = res.hardware
    this.app = res.app
  }

  private transStatus(status: string) {
    // this.statusJoining = false
    switch (status) {
      case 'on':
        this.registerStatus = '在线'
        this.statusStyle = {
          '--isOnline': '#52C41A'
        }
        // this.statusJoining = true
        break
      case 'off':
        this.registerStatus = '离线'
        this.statusStyle = {
          '--isOnline': '#999999'
        }
        break
      case 'new':
        this.registerStatus = '未接入'
        this.statusStyle = {
          '--isOnline': '#999999'
        }
        break
      default :
        this.registerStatus = '状态错误'
        this.statusStyle = {
          '--isOnline': 'red'
        }
        break
    }
  }

  private showChangeName() {
    this.editDeviceName = this.deviceName
    this.isEditDeviceName = !this.isEditDeviceName
  }

  private showChangeDes() {
    this.isEditDes = !this.isEditDes
  }

  private async changeName() {
    try {
      if (!this.editDeviceName) {
        this.checkedFalse = true
        return
      } else {
        this.loading = true
        this.checkedFalse = false
        const params = {
          deviceId: this.deviceId,
          deviceName: this.editDeviceName
        }
        await updateIBox(params)
        const res = await getIBoxDetail({ deviceId: this.deviceId })
        this.renderInfo(res)
      }
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.isEditDeviceName = false
      this.checkedFalse = false
      this.loading = false
    }
  }

  private async changeDes() {
    try {
      if (!this.editDes) {
        this.checkedFalseDes = true
        return
      } else {
        this.loading = true
        this.checkedFalseDes = false
        const params = {
          deviceId: this.deviceId,
          description: this.editDes
        }
        await updateIBox(params)
        const res = await getIBoxDetail({ deviceId: this.deviceId })
        this.renderInfo(res)
      }
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.isEditDes = false
      this.checkedFalseDes = false
      this.loading = false
    }
  }

  private cancelChange() {
    this.editDeviceName = this.deviceName
    const refs: any = this.$refs.deviceName
    refs.blur()
    this.isEditDeviceName = false
  }

  private cancelEdit() {
    this.editDes = this.description
    const refs: any = this.$refs.des
    refs.blur()
    this.isEditDes = false
  }

  // 用于变量大小写转换
  private jsonKeysCaseTrans(json: any, type?: number) {
    if (typeof json === 'object') {
      const tmpJson = JSON.parse(JSON.stringify(json))
      caseTrans(tmpJson)
      return tmpJson
    } else {
      return json
    }
    function caseTrans(json: any) {
      if (typeof json === 'object') {
        if (Array.isArray(json)) {
          json.forEach((item: any) => {
            caseTrans(item)
          })
        } else {
          for (const key in json) {
            const item = json[key]
            if (typeof item === 'object') {
              caseTrans(item)
            }
            delete (json[key])
            switch (type) {
              case 1:
                // 首字母大写
                json[key.substring(0, 1).toUpperCase() + key.substring(1)] = item
                break
              case 2:
                // 全小写
                json[key.toLowerCase()] = item
                break
              default:
                // 默认首字母小写
                json[key.substring(0, 1).toLowerCase() + key.substring(1)] = item
                break
            }
          }
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-input {
  display: table-row;
}

::v-deep .el-card__body {
  padding-left: 36px !important;
}

::v-deep .el-input--medium .el-input__inner {
  height: 20px;
  line-height: 32px;
}

.info-chart {
  overflow-x: auto;
}

.info-chart::-webkit-scrollbar {
  /* 滚动条整体样式 */
  width: 50px;  /* 高宽分别对应横竖滚动条的尺寸 */
  height: 5px;
}

.ibox-bar {
  overflow-y: auto;
}

.ibox-bar::-webkit-scrollbar {
  /* 滚动条整体样式 */
  width: 5px;  /* 高宽分别对应横竖滚动条的尺寸 */
  height: 10px;
}

.ibox-bar::-webkit-scrollbar-thumb,
.info-chart::-webkit-scrollbar-thumb {
  /* 滚动条里面小方块 */
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 20%);
  background: #ddd;
}

.ibox-bar::-webkit-scrollbar-track,
.info-chart::-webkit-scrollbar-thumb {
  /* 滚动条里面轨道 */
  // box-shadow: inset 0 0 5px rgba(0, 0, 0, 20%);
  border-radius: 20px;
  background: transparent;
}
</style>
<style lang="scss">
.ibox-bar {
  height: 95%;
  // height: 700px;
}

// .base-info,
.hard-info,
.app-info {
  margin-bottom: 10px;
  width: 100%;
}

.info {
  margin-left: 20px;
  margin-bottom: 20px;
}

.title {
  border-left: 4px solid #fa8334;
  padding-left: 12px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 20px;
}

.register-status:before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: var(--isOnline);
  margin-right: 8px;
  margin-left: 10px;
}

.info-chart {
  display: grid;
  min-width: 0;
  height: 500px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  row-gap: 20px;
}

.check-tip {
  color: red;
  margin-left: 60px;
}

.bar-chart {
  min-width: 455px;
  overflow: hidden;
}

.des-label {
  white-space: nowrap;
}

.des-content {
  word-break: break-all;
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
