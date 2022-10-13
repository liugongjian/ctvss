<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-tabs v-model="tabNum" type="border-card" @tab-click="handleTabClick">
      <el-tab-pane label="基本信息" :name="'0'">
        <BasicAppInfo
          v-if="appInfo.name"
          :app-info="appInfo"
          :face-lib="faceLib"
        />
      </el-tab-pane>
      <el-tab-pane label="关联设备" :name="'1'">
        <AtachedDevice
          v-if="tabNum === '1'"
          :app-info="appInfo"
          :devices="deviceList"
        />
      </el-tab-pane>
      <el-tab-pane label="分析结果" :name="'2'">
        <div class="app-container__result">
          <div class="app-container__result__device">
            <span>设备:</span>
            <el-select
              v-model="device"
              placeholder="请选择"
              value-key="deviceId"
            >
              <el-option
                v-for="value in deviceList"
                :key="value.deviceId"
                :label="
                  value.deviceType === 'nvr'
                    ? `NVR / ${value.deviceName}`
                    : value.deviceName
                "
                :value="value"
              />
            </el-select>
          </div>
          <div class="right">
            <AppSubDetail
              v-if="tabNum === '2'"
              :device="device"
              :app-info="appInfo"
              :face-lib="faceLib"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BasicAppInfo from '@/views/AI/AppList/component/BasicAppInfo.vue'
import AppSubDetail from '@/views/AI/AppList/component/AppSubDetail.vue'
import AtachedDevice from './AtachedDevice.vue'

import { describeIboxApp, getDeviceList } from '@/api/ibox'
// import { getDeviceTree } from '@/api/device'
// import { getGroups } from '@/api/group'
import AppMixin from '@/views/AI/mixin/app-mixin'
import IndexMixin from '@/views/device/mixin/indexMixin'
@Component({
  name: 'AppDetail',
  components: {
    BasicAppInfo,
    AppSubDetail,
    AtachedDevice
  }
})
export default class extends Mixins(AppMixin, IndexMixin) {
  @Prop({}) public appDetailId!: any
  private breadCrumbContent: String = '应用详情'
  private appInfo: any = {}
  private device: any = {
    deviceId: '',
    inProtocol: ''
  }
  private faceLib: any = {}
  private tabNum: string | string[] = '0'
  private deviceList: any = []

  private async mounted() {
    const appId = this.$route.query.appid || this.appDetailId
    const { iboxApp }: any = await describeIboxApp({
      appId,
      iboxId: this.$route.query.deviceId
    })
    this.appInfo = iboxApp
    await this.getAttachedDevice()
    this.deviceList.length > 0 && (this.device = this.deviceList[0])
  }

  public changeWidthStartAndResize(ev) {
    this.changeWidthStart(ev)
    // 改变宽度后触发一次resize事件，调整chart
    const e = document.createEvent('Event')
    e.initEvent('resize', true, true)
    window.dispatchEvent(e)
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
      const _devices = devices.map((device) => {
        if (device.device.deviceType === 'nvr') {
          const deviceChannels = device.device.deviceChannels.map(
            (channel) => ({
              ...channel,
              deviceDir:
                iboxId + ',' + device.device.deviceId + ',' + channel.deviceId,
              path: [device.device, channel]
            })
          )
          channels.push(...deviceChannels)

          return {
            ...device.device,
            deviceStatus:
              device.videos[0].gb28181Device?.deviceStatus?.isOnline || 'off',
            deviceDir: iboxId + ',' + device.device.deviceId,
            path: [device.device],
            streamStatus: device.videos[0].gb28181Device?.streams[0].streamStatus || 'off',
            inProtocol: device.videos[0].inVideoProtocol
          }
        }
        return {
          ...device.device,
          deviceStatus:
            device.videos[0].gb28181Device?.deviceStatus?.isOnline || 'off',
          deviceDir: iboxId + ',' + device.device.deviceId,
          path: [device.device],
          streamStatus: device.videos[0].gb28181Device?.streams[0].streamStatus || 'off',
          inProtocol: device.videos[0].inVideoProtocol
        }
      })
      _devices.push(...channels)
      this.deviceList = _devices.filter((device) =>
        deviceIds.find((id) => id === device.deviceId)
      )
    } catch (e) {
      console.log(e)
    }
  }

  private handleTabClick() {
    // resize 为了让图表触发刷新从而自适应尺寸
    const e = document.createEvent('Event')
    e.initEvent('resize', true, true)
    window.dispatchEvent(e)
  }

  private back() {
    this.$emit('back')
  }
}
</script>

<style lang="scss" scoped>
.el-tab-pane {
  display: flex;
}

.app-container__result {
  position: relative;
  width: 100%;

  &__device {
    float: left;
    padding: 0 20px;
    line-height: 50px;

    & > span {
      margin-right: 10px;
    }

    .el-select {
      max-width: 120px;
    }
  }

  .left {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    overflow: auto;

    .el-tree {
      min-width: 100%;
      display: inline-block !important;

      ::v-deep .el-tree-node > .el-tree-node__children {
        overflow: visible;
      }
    }

    .is-disabled + .custom-tree-node__ipc {
      cursor: not-allowed;
    }
  }

  .right {
    padding-left: 20px;
    // display: inline-block;
    // border-left: 1px solid $borderGrey;
  }
}

.online {
  .svg-icon {
    color: #65c465;
  }
}

.offline {
  .svg-icon {
    color: #6e7c89;
  }
}

.no-data {
  height: 200px;
  line-height: 200px;
  vertical-align: middle;
  text-align: center;
  color: rgba(186, 198, 198);
}
</style>
