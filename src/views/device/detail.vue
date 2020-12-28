<template>
  <div class="app-container">
    <div v-loading="loading.info" class="detail-wrap">
      <div v-if="info">
        <el-button v-if="info.deviceType === 'ipc'" class="btn-detail" @click="goToPreview"><svg-icon name="live" /> 实时预览</el-button>
        <el-button v-if="info.deviceType === 'nvr'" class="btn-detail" @click="goToChannels"><svg-icon name="list" /> 查看通道</el-button>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="info">
          <div>
            <el-button v-if="!isAutoCreated" type="text" class="info-edit" @click="edit">编辑</el-button>
            <info-list v-if="info && !isNVRChannel" label-width="110">
              <info-list-item label="设备类型:">{{ deviceType[info.deviceType] }}</info-list-item>
              <info-list-item label="设备名称:">{{ info.deviceName }}</info-list-item>
              <info-list-item label="设备ID:">{{ info.deviceId }}</info-list-item>
              <info-list-item label="厂商:">{{ info.deviceVendor || '-' }}</info-list-item>
              <template v-if="info.deviceType === 'ipc' || info.deviceType === 'platform'">
                <info-list-item label="设备国标ID:">{{ info.gbId }}</info-list-item>
                <info-list-item label="设备IP:">{{ info.deviceIp || '-' }}</info-list-item>
                <info-list-item label="端口:">{{ info.devicePort || '-' }}</info-list-item>
              </template>
              <template v-if="info.deviceType === 'nvr'">
                <info-list-item label="自动创建子设备:">{{ createSubDevice[info.createSubDevice] }}</info-list-item>
                <info-list-item label="通道数量:">{{ info.deviceStats && info.deviceStats.channelSize }}</info-list-item>
                <info-list-item label="在线流数量:">{{ info.deviceStats && info.deviceStats.onlineSize }}</info-list-item>
              </template>
              <template v-if="info.deviceType === 'platform'">
                <info-list-item label="通道数量:">{{ info.deviceStats && info.deviceStats.channelSize }}</info-list-item>
                <info-list-item label="在线流数量:">{{ info.deviceStats && info.deviceStats.onlineSize }}</info-list-item>
              </template>
              <info-list-item label="GB28181账号:">{{ info.userName }}</info-list-item>
            </info-list>
            <info-list v-if="info && isNVRChannel" label-width="110">
              <info-list-item label="设备ID:">{{ info.deviceId }}</info-list-item>
              <info-list-item v-if="info.deviceChannels.length" label="通道号:">{{ info.deviceChannels[0].channelNum }}</info-list-item>
              <info-list-item v-if="info.deviceChannels.length" label="通道名称:">{{ info.deviceChannels[0].channelName }}</info-list-item>
              <info-list-item label="厂商:">{{ info.deviceVendor || '-' }}</info-list-item>
              <info-list-item label="设备国标ID:">{{ info.gbId }}</info-list-item>
            </info-list>
            <info-list v-if="info" label-width="110">
              <info-list-item label="自动拉流:">{{ pullType[info.pullType] }}</info-list-item>
              <info-list-item label="设备状态:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    <status-badge :status="info.deviceStatus" />
                    {{ deviceStatus[info.deviceStatus] || '-' }}
                  </div>
                </div>
              </info-list-item>
              <info-list-item label="流状态:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    <status-badge :status="info.streamStatus" />
                    {{ deviceStatus[info.streamStatus] }}
                  </div>
                </div>
              </info-list-item>
              <info-list-item label="信令传输模式:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    {{ transPriority[info.sipTransType] || '-' }}
                  </div>
                </div>
              </info-list-item>
              <info-list-item label="流传输模式:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    {{ transPriority[info.streamTransType] || '-' }}
                  </div>
                </div>
              </info-list-item>
              <info-list-item v-if="info.deviceType === 'nvr' || info.deviceType === 'ipc'" label="优先TCP传输:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    {{ transPriority[info.transPriority] || '-' }}
                  </div>
                </div>
              </info-list-item>
            </info-list>
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="!isGb" label="推流配置" name="push">
          <info-list label-width="115" title="鉴权配置" class="auth-config">
            <el-button v-if="pushConfig.auth" type="text" class="auth-config__edit" @click="openDialog('setAuthConfig')">编辑鉴权KEY</el-button>
            <info-list-item label="推流鉴权:">
              <el-switch v-model="pushConfig.auth" />
              {{ authStatus[pushConfig.auth] }}
            </info-list-item>
            <info-list-item label="主KEY:">{{ pushConfig.key }}</info-list-item>
            <info-list-item label="备KEY:">{{ pushConfig.key2 }}</info-list-item>
          </info-list>
          <info-list label-width="115" title="推流地址生成器">
            <info-list-item label="过期时间:">
              <el-date-picker
                v-model="pushExpired"
                type="datetime"
                placeholder="选择过期时间"
              />
              <el-button type="primary" class="ml10">生成推流地址</el-button>
            </info-list-item>
            <div class="address-maker">
              <info-list label-width="115">
                <info-list-item label="推流地址:">
                  rtmp://102715.push.domain.com:3738/vss/237233774?signature=045bfe2107b98f356e459c8b2bd54be4&expired=5EEC5741
                  <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
                    <el-button type="text"><i class="el-icon-copy-document" /></el-button>
                  </el-tooltip>
                </info-list-item>
              </info-list>
            </div>
          </info-list>
        </el-tab-pane>
        <el-tab-pane v-if="!isGb" label="播流配置" name="play">
          <info-list label-width="115" title="鉴权配置" class="auth-config">
            <el-button v-if="playConfig.auth" type="text" class="auth-config__edit" @click="openDialog('setAuthConfig')">编辑鉴权KEY</el-button>
            <info-list-item label="推流鉴权:">
              <el-switch v-model="playConfig.auth" />
              {{ authStatus[playConfig.auth] }}
            </info-list-item>
            <transition name="fade">
              <div v-if="playConfig.auth">
                <info-list-item label="主KEY:">{{ playConfig.key }}</info-list-item>
                <info-list-item label="备KEY:">{{ playConfig.key2 }}</info-list-item>
              </div>
            </transition>
          </info-list>
          <info-list label-width="115" title="推流地址生成器">
            <info-list-item label="过期时间:">
              <el-date-picker
                v-model="pushExpired"
                type="datetime"
                placeholder="选择过期时间"
              />
              <el-button type="primary" class="ml10">生成推流地址</el-button>
            </info-list-item>
            <div class="address-maker">
              <info-list label-width="100">
                <info-list-item label="RTMP:">
                  rtmp://102715.push.domain.com:3738/vss/237233774?signature=045bfe2107b98f356e459c8b2bd54be4&expired=5EEC5741
                  <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
                    <el-button type="text"><i class="el-icon-copy-document" /></el-button>
                  </el-tooltip>
                </info-list-item>
                <info-list-item label="FLV:">
                  https://102715.push.domain.com:3738/vss/237233774.flv?signature=045bfe2107b98f356e459c8b2bd54be4&expired=5EEC5741
                  <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
                    <el-button type="text"><i class="el-icon-copy-document" /></el-button>
                  </el-tooltip>
                </info-list-item>
                <info-list-item label="HLS:">
                  https://102715.push.domain.com:3738/vss/237233774.m3u8?signature=045bfe2107b98f356e459c8b2bd54be4&expired=5EEC5741
                  <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
                    <el-button type="text"><i class="el-icon-copy-document" /></el-button>
                  </el-tooltip>
                </info-list-item>
              </info-list>
            </div>
          </info-list>
          <info-list label-width="115" title="防盗链配置">
            <anti-theft-chain type="Referer" :config="playConfig.anti.referer" />
            <anti-theft-chain type="IP" :config="playConfig.anti.ip" />
            <anti-theft-chain type="UA" :config="playConfig.anti.ua" />
          </info-list>
        </el-tab-pane>
        <el-tab-pane label="模板配置" name="template">
          <template-bind v-if="activeName==='template'" :device-id="deviceId" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <SetAuthConfig v-if="dialog.setAuthConfig" @on-close="closeDialog('setAuthConfig')" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { Device } from '@/type/device'
import { RecordTemplate } from '@/type/template'
import { DeviceStatus, DeviceType, AuthStatus, PullType, CreateSubDevice, TransPriority, SipTransType, StreamTransType } from '@/dics'
import { getDevice } from '@/api/device'
import TemplateBind from '../components/templateBind.vue'
import SetAuthConfig from './components/dialogs/SetAuthConfig.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import AntiTheftChain from './components/AntiTheftChain.vue'

@Component({
  name: 'DeviceDetail',
  components: {
    TemplateBind,
    SetAuthConfig,
    StatusBadge,
    AntiTheftChain
  }
})
export default class extends Vue {
  @Inject('deviceRouter') private deviceRouter!: Function
  private activeName = 'info'
  private deviceStatus = DeviceStatus
  private deviceType = DeviceType
  private authStatus = AuthStatus
  private pullType = PullType
  private transPriority = TransPriority
  private sipTransType = SipTransType
  private streamTransType = StreamTransType
  private createSubDevice = CreateSubDevice
  private info: Device | null = null
  private pushConfig = {
    auth: true,
    key: '1a66a5c2317368a282ceb2b326767651',
    key2: '2a66a5c2317368a582ceb2b326767653'
  }
  private playConfig = {
    auth: true,
    key: '1a66a5c2317368a282ceb2b326767651',
    key2: '2a66a5c2317368a582ceb2b326767653',
    anti: {
      referer: {
        enable: true
      },
      ip: {
        enable: true
      },
      ua: {
        enable: true
      }
    }
  }
  private pushExpired?: number | null = null
  private template: Record<any, Array<RecordTemplate>> = {
    snapshotTemplate: [],
    recordTemplate: []
  }
  private dialog = {
    setAuthConfig: false
  }
  private loading = {
    info: false,
    template: false
  }
  private recordTemplateId = ''

  private get isGb() {
    return this.$route.query.inProtocol === 'gb28181'
  }

  private get isNVRChannel() {
    return this.info && this.info.parentDeviceId !== '-1'
  }

  private get deviceId() {
    return this.$route.query.deviceId
  }

  private get isAutoCreated() {
    return this.info && this.info.parentDeviceId !== '-1' && this.info.createSubDevice === 1
  }

  private mounted() {
    this.getDevice()
  }

  /**
   * 获取设备信息
   */
  private async getDevice() {
    try {
      this.loading.info = true
      this.info = await getDevice({
        deviceId: this.deviceId
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.loading.info = false
    }
  }

  /**
   * 实时预览
   */
  private goToPreview() {
    this.deviceRouter({
      id: this.deviceId,
      type: 'preview'
    })
  }

  /**
   * 查看通道
   */
  private goToChannels() {
    this.deviceRouter({
      id: this.deviceId,
      type: 'nvr'
    })
  }

  /**
   * TAB切换
   */
  private async handleClick(tab: any) {
    this.activeName = tab.name
  }

  /**
   * 编辑
   */
  private edit() {
    this.deviceRouter({
      id: this.deviceId,
      type: 'update'
    })
  }

  private openDialog(type: string) {
    // @ts-ignore
    this.dialog[type] = true
  }

  private async closeDialog(type: string) {
    // @ts-ignore
    this.dialog[type] = false
  }
}
</script>
<style lang="scss" scoped>
  .app-container {
    ::v-deep {
      .info-list__title {
        margin: 10px 5px 0 5px;
      }
    }
  }

  .detail-wrap {
    position: relative;
    padding-top: 6px;
    .btn-detail {
      position: absolute;
      top: -12px;
      right: 0;
      z-index: 9;
    }
  }

  .info-edit {
    position: absolute;
    right: 40px;
    z-index: 10;
  }

  .address-maker {
    background: $borderGrey;
    border-radius: 5px;
    padding: 15px 0;
    margin-bottom: 20px;

    .el-button--text {
      padding: 0;
    }
  }

  .auth-config {
    position: relative;

    &__edit {
      position: absolute;
      top: 0;
      right: 10px;
      padding: 0;
    }
  }

  .template-edit {
    float: right;
    padding: 0;
    margin: 0;
  }

</style>
