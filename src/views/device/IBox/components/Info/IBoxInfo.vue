<template>
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
              <el-input ref="des" v-model="editDes" :maxlength="16" autofocus />
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
        <BarChart :barChartId="7" :chartData="app.aiAlarm" :type="'aiAlarm'" :barColor="customColor_app" />
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
  private hardware: any
  private statusStyle: any = null
  private registerStatus: string = ''

  private loading = false

  private isEditDeviceName = false
  private isEditDes = false
  private editDeviceName: string = ''
  private deviceName: string = ''
  private description: string = ''
  private checkedFalse = false


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
      console.log('。。  query  。。    ', this.$route.query)
      let deviceId = this.$route.query.deviceId || '29941916753723399'
      // let res = await getIBoxDetail(deviceId)
      let res = {
    "Code": 0,
    "Message": "",
    "RequestId": "32b60f92bcc84a6fb9fe146f57d6a7b3",
    "Data": {
        "Basic": {
            "DeviceId": "29941916753723399",
            "DeviceName": "盒子",
            "DeviceStatus": "on",
            "Ip": "192.168.233.133",
            "Sn": "1424321006681",
            "Description": "盒子描述"
        },
        "Hardware": {
            "Ram": {
                "Total": 3.798664,
                "Usage": 0.45184326,
                "Unit": "G",
                "UsageRate": 0
            },
            "Storage": {
                "Total": 37.227966,
                "Usage": 17.027058,
                "Unit": "G",
                "UsageRate": 0
            },
            "Cpu": {
                "Total": 0,
                "Usage": 0,
                "Unit": "",
                "UsageRate": 0.176471
            },
            "Gpu": {
                "Total": 0,
                "Usage": 0,
                "Unit": "",
                "UsageRate": 0
            }
        },
        "App": {
            "Stream": {
                "Total": 1,
                "Usage": 0,
                "Unit": "",
                "UsageRate": 0
            },
            "AiAlgo": {
                "Total": 1,
                "Usage": 0,
                "Unit": "",
                "UsageRate": 0
            },
            "AiApp": {
                "Total": 1,
                "Usage": 0,
                "Unit": "",
                "UsageRate": 0
            }
        },
        "Sip": {
            "SipId": "31011500012008469596",
            "SipIp": "192.168.233.134",
            "SipTcpPort": 15060,
            "SipUdpPort": 15060,
            "SipRegion": "3101150001"
        },
        "RequestId": "075a99f936894228bcf7320ab4a06f26"
    }
}
      res = this.jsonKeysCaseTrans(res.Data)
      this.transStatus(res.basic.deviceStatus)
      this.dataInfo(res)
    } catch (e) {

    } finally {
      this.loading = false
    }
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
    console.log('status  :', status)
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
    console.log('编辑姓名')
    this.isEditDeviceName = !this.isEditDeviceName
  }

  private showChangeDes() {
    console.log('编辑描述内容')
    this.isEditDes = !this.isEditDes
  }

   private async changeName() {
    try {
      console.log('修改名字噢')
      // if (!this.editBoxName) {
      //   this.checkedFalse = true
      //   return
      // } else {
      //   this.loadEdit = true
      //   this.checkedFalse = false
      //   const params = {
      //     deviceName: this.editBoxName
      //   }
      //   await changeDeviceName(params)
      //   await UserModule.getUserInfo()
      //   this.renderInfo(this.dashboardInfo)
      //   // this.iBoxName = this.editBoxName
      //   this.isEdit = !this.isEdit
      //   this.loadEdit = false
      // }
      // // console.log('新名称：   ', this.editBoxName)
    } catch (e) {
      this.$message.error(e)
    }
  }

  private async changeDes() {
    try {
      console.log('修改名字噢')
      // if (!this.editBoxName) {
      //   this.checkedFalse = true
      //   return
      // } else {
      //   this.loadEdit = true
      //   this.checkedFalse = false
      //   const params = {
      //     deviceName: this.editBoxName
      //   }
      //   await changeDeviceName(params)
      //   await UserModule.getUserInfo()
      //   this.renderInfo(this.dashboardInfo)
      //   // this.iBoxName = this.editBoxName
      //   this.isEdit = !this.isEdit
      //   this.loadEdit = false
      // }
      // // console.log('新名称：   ', this.editBoxName)
    } catch (e) {
      this.$message.error(e)
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
</style>
<style lang="scss">
.base-info,
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
