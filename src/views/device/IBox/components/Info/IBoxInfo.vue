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
          <el-descriptions-item label="设备ID">{{ deviceInfo.deviceID }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ deviceInfo.ip }}</el-descriptions-item>
          <el-descriptions-item label="序列号">{{ deviceInfo.seriesNum }}</el-descriptions-item>
          <el-descriptions-item label="描述">
            <span v-if="!isEditDes">{{ descriptions }}<i class="el-icon-edit-outline" style="color: #f59a23;font-size: 15px;" @click="showChangeDes" /></span>
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
        <BarChart class="bar-chart" :barChartId="0" :chartData="hardwareInfo.ram" :type="'ram'" :barColor="customColor_usage" />
        <BarChart class="bar-chart" :barChartId="1" :chartData="hardwareInfo.storage" :type="'storage'" :barColor="customColor_usage" />
        <BarChart class="bar-chart" :barChartId="2" :chartData="hardwareInfo.cpu" :type="'cpu'" :barColor="customColor_usageRate" />
        <BarChart class="bar-chart" :barChartId="3" :chartData="hardwareInfo.gpu" :type="'gpu'" :barColor="customColor_usageRate" />
      </div>
      <div class="title">
        <span>应用信息</span>
      </div>
      <div class="info-chart">
        <!-- 设备、算法、分析路数 -->
        <BarChart :barChartId="4" :chartData="appInfo.device" :type="'device'" :barColor="customColor_app" /> 
        <BarChart :barChartId="5" :chartData="appInfo.calculate" :type="'calculate'" :barColor="customColor_app" />
        <BarChart :barChartId="6" :chartData="appInfo.analysis" :type="'analysis'" :barColor="customColor_app" />
      </div>
    <div class="title">
        <span>SIP服务信息</span>
      </div>
      <div class="info">
        <el-descriptions :column=2>
          <el-descriptions-item label="SIP服务器ID">{{ sipInfo.sipIp }}</el-descriptions-item>
          <el-descriptions-item label="SIP服务器域">{{ sipInfo.sipUrl }}</el-descriptions-item>
          <el-descriptions-item label="SIP服务器地址">{{ sipInfo.sipAddress }}</el-descriptions-item>
          <el-descriptions-item label="SIP服务器TCP端口">{{ sipInfo.sipTcp }}</el-descriptions-item>
          <el-descriptions-item label="SIP服务器UDP端口">{{ sipInfo.sipUdp }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import BarChart from './components/BarChart.vue'

@Component({
  name: 'IBoxInfo',
  components: {
    BarChart
  }
})
export default class extends Vue {
  private deviceInfo = {
    deviceStatus: 'on',
    deviceName: '天翼云边缘盒子',
    deviceID: '8992ASDAAAAAA',
    ip: '192.9.2.3',
    seriesNum: 'XXXXXXXXXXX',
    descriptions: 'XXXXXXXXXXX',
  }
  private sipInfo = {
    sipIp: '31011500012008469596',
    sipUrl: '3101150001',
    sipAddress: '113.250.16.3',
    sipTcp: '15060',
    sipUdp: '15060',
  }
  private appInfo = {
    "device": {
      "total": 16,
      "usage": 2,
    },
    "calculate": {
      "total": 8,
      "usage": 0,
    },
    "analysis": {
      "total": 3,
      "usage": 1,
    },
    "alarm": {
      "total": 8000,
      "usage": 4000,
    }
  }

  private isOnline: string
  // private isRegistered: boolean
  private chartData: any
  private hardwareInfo: any
  private statusStyle: any = null
  private registerStatus: string = ''

  private loading = false

  private isEditDeviceName = false
  private isEditDes = false
  private editDeviceName: string = ''
  private deviceName: string = ''
  private descriptions: string = ''
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

  // private get dashboardInfo() {
  //   return UserModule && UserModule.userInfo
  // }
  
  private created() {
    // const res = this.dashboardInfo
    console.log('获取概览页面数据')
    // this.transStatus(res.data.basic.deviceStatus)
    // mock
    const res = {
      "deviceInfo": {
        "deviceStatus": 'on',
        "deviceName": '天翼云边缘盒子',
        "deviceID": '8992ASDAAAAAA',
        "ip": '192.9.2.3',
        "seriesNum": 'XXXXXXXXXXX',
        "descriptions": 'XXXXXXXXXXX',
      },
      "sipInfo": {
        "sipIp": '31011500012008469596',
        "sipUrl": '3101150001',
        "sipAddress": '113.250.16.3',
        "sipTcp": '15060',
        "sipUdp": '15060',
      },
      "hardware": {
        "ram": {
          "total": 8000,
          "usage": 4000,
          "unit": "M",
        },
        "storage":{
          "total": 8000,
          "usage": 4000,
          "unit": "M",
        },
        "cpu":{
          "usageRate": 0.25,
        },
        "gpu": {
            "usageRate": 0.35,
        }
      },
      "app": {
        "device": {
          "total": 16,
          "usage": 2,
        },
        "calculate": {
          "total": 8,
          "usage": 0,
        },
        "analysis": {
          "total": 3,
          "usage": 1,
        },
        "alarm": {
          "total": 8000,
          "usage": 4000,
        }
      },
      "version": {
        "model": "iBox-02",
        "sn": "123456",
        "version": "V1.0.0"
      },
      "register": {
        "deviceStatus": "on",
        "platformType": "public",
        "url": "http://vcn.ctyun.cn",
        "account": "vss-demo@xx.cn"
      }
    }
    this.transStatus(res.deviceInfo.deviceStatus)
    this.deviceName = res.deviceInfo.deviceName
    this.descriptions = res.deviceInfo.descriptions
    this.deviceInfo = res.deviceInfo
    this.sipInfo = res.sipInfo
    this.hardwareInfo = res.hardware
    this.appInfo = res.app
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
    this.editDes = this.descriptions
    const refs: any = this.$refs['des']
    refs.blur()
    this.isEditDes = false
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
