<template>
<div class="ibox-bar">
  <div class="ibox-info">
    <el-card v-loading="loading" class="base-info">
      <div class="title">
        <span>设备信息</span>
      </div>
      <div class="info">
        <el-descriptions :column=2>
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
        <BarChart class="bar-chart" :barChartId="0" :chartData="hardware.ram" :type="'ram'" :barColor="customColor_usage" />
        <BarChart class="bar-chart" :barChartId="1" :chartData="hardware.storage" :type="'storage'" :barColor="customColor_usage" />
        <BarChart class="bar-chart" :barChartId="2" :chartData="hardware.cpu" :type="'cpu'" :barColor="customColor_usageRate" />
        <BarChart class="bar-chart" :barChartId="3" :chartData="hardware.gpu" :type="'gpu'" :barColor="customColor_usageRate" />
      </div>
      <div class="title">
        <span>应用信息</span>
      </div>
      <div class="info-chart">
        <!-- 设备、算法、分析路数 -->
        <BarChart :barChartId="4" :chartData="app.stream" :type="'stream'" :barColor="customColor_app" /> 
        <BarChart :barChartId="5" :chartData="app.aiAlgo" :type="'aiAlgo'" :barColor="customColor_app" />
        <BarChart :barChartId="6" :chartData="app.aiApp" :type="'aiApp'" :barColor="customColor_app" />
      </div>
    <div class="title">
        <span>SIP服务信息</span>
      </div>
      <div class="info">
        <el-descriptions :column=2>
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
    deviceStatus: 'on',
    deviceName: '天翼云边缘盒子',
    deviceId: '8992ASDAAAAAA',
    ip: '192.9.2.3',
    sn: 'XXXXXXXXXXX',
    description: 'XXXXXXXXXXX',
  }
  private sip = {
    sipId: '31011500012008469596',
    sipRegion: '3101150001',
    sipIp: '113.250.16.3',
    sipTcpPort: '15060',
    sipUdpPort: '15060',
  }
  private app = {
    "stream": {
      "total": 16,
      "usage": 2,
    },
    "aiAlgo": {
      "total": 8,
      "usage": 0,
    },
    "aiApp": {
      "total": 3,
      "usage": 1,
    },
    "aiAlarm": {
      "total": 8000,
      "usage": 4000,
    }
  }

  private isOnline: string
  // private isRegistered: boolean
  private chartData: any
    private hardware = {
    "ram": {
                "total": 6.4,
                "usage": 0.7784326,
                "unit": "G",
                "usageRate": 0
            },
            "storage": {
                "total": 70.227966,
                "usage": 40.027058,
                "unit": "G",
                "usageRate": 0
            },
            "cpu": {
                "total": 10,
                "usage": 5,
                "unit": "",
                "usageRate": 0.176471
            },
            "gpu": {
                "total": 0,
                "usage": 0,
                "unit": "",
                "usageRate": 0
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
    subColor: '#8BB2F9',
  }

  private customColor_usageRate = {
    mainColor: '#F8D34C',
    subColor: '#FDF1C6',
  }

  private customColor_app = {
    mainColor: '#F19E4B',
    subColor: '#F7CC8B',
  }
  
  private async mounted() {
    try {
      this.loading = true
      this.checkedFalse = false
      this.checkedFalseDes = false
      let params = {
        DeviceId: '29941991915651403' || this.$route.query.deviceId
      }
      let res = await getIBoxDetail(params)
      // res = this.jsonKeysCaseTrans(res.Data)
      this.renderInfo(res)
    } catch (e) {

    } finally {
      this.loading = false
    }
  }

  private renderInfo(res: any) {
    this.transStatus(res.basic.deviceStatus)
    this.dataInfo(res)
  }

  private dataInfo(res: any){
    this.deviceName = res.basic.deviceName
    this.description = res.basic.description
    this.basic = res.basic
    this.sip = res.sip
    this.hardware = res.hardware
    this.app = res.app
  }

  private transStatus(status: string) {
    // this.statusJoining = false
    switch(status) {
      case 'on':
        this.registerStatus = '在线'
        this.statusStyle = {
          '--isOnline':'#52C41A'
        }
        // this.statusJoining = true
        break
      case 'off':
        this.registerStatus = '离线'
        this.statusStyle = {
          '--isOnline':'#999999'
        }
        break
      case 'new':
        this.registerStatus = '未接入'
        this.statusStyle = {
          '--isOnline':'#999999'
        }
        break
      default :
        this.registerStatus = '状态错误'
        this.statusStyle = {
          '--isOnline':'red'
        }
        break
    }
  }

  private showChangeName() {
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
    const refs: any = this.$refs['deviceName']
    refs.blur()
    this.isEditDeviceName = false
  }

  private cancelEdit() {
    this.editDes = this.description
    const refs: any = this.$refs['des']
    refs.blur()
    this.isEditDes = false
  }

  // 临时用于变量大小写转换
  private jsonKeysCaseTrans(json: any, type?: number) {
    if (typeof json === 'object') {
      let tmpJson = JSON.parse(JSON.stringify(json))
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
          for (let key in json) {
            let item = json[key]
            if (typeof item === 'object') {
              caseTrans(item)
            }
            delete(json[key])
            switch (type) {
              case 1:
                // 首字母大写
                json[key.substring(0,1).toUpperCase() + key.substring(1)] = item
                break
              case 2:
                // 全小写
                json[key.toLowerCase()] = item
                break
              default:
                // 默认首字母小写
                json[key.substring(0,1).toLowerCase() + key.substring(1)] = item
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

.ibox-bar {
  overflow-y: auto;
}

.ibox-bar::-webkit-scrollbar {
  /* 滚动条整体样式 */
  width: 5px;  /* 高宽分别对应横竖滚动条的尺寸 */
  height: 10px;
}

.ibox-bar::-webkit-scrollbar-thumb {
  /* 滚动条里面小方块 */
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 20%);
  background: #ddd;
}

.ibox-bar::-webkit-scrollbar-track {
  /* 滚动条里面轨道 */
  // box-shadow: inset 0 0 5px rgba(0, 0, 0, 20%);
  border-radius: 20px;
  background: transparent;
}
</style>
<style lang="scss">
.ibox-bar {
  height: 700px;
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
}

</style>
