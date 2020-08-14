<template>
  <div class="app-container">
    <div class="detail-wrap">
      <div v-if="info">
        <el-button v-if="info.deviceType === 'ipc'" class="btn-detail" @click="goToPreview"><i class="el-icon-video-camera" /> 实时预览</el-button>
        <el-button v-if="info.deviceType === 'nvr'" class="btn-detail" @click="goToChannels"><i class="el-icon-files" /> 查看通道</el-button>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="info">
          <div :loading="loading.info">
            <el-button v-if="!isAutoCreated" type="text" class="info-edit" @click="edit">编辑</el-button>
            <info-list v-if="info && !isNVRChannel" label-width="110">
              <info-list-item label="设备类型:">{{ deviceType[info.deviceType] }}</info-list-item>
              <info-list-item label="设备名称:">{{ info.deviceName }}</info-list-item>
              <info-list-item label="设备ID:">{{ info.deviceId }}</info-list-item>
              <info-list-item label="厂商:">{{ info.deviceVendor || '-' }}</info-list-item>
              <template v-if="info.deviceType === 'ipc'">
                <info-list-item label="设备国标ID:">{{ info.gbId }}</info-list-item>
                <info-list-item label="设备IP:">{{ info.deviceIp || '-' }}</info-list-item>
                <info-list-item label="端口:">{{ info.devicePort || '-' }}</info-list-item>
              </template>
              <template v-if="info.deviceType === 'nvr'">
                <info-list-item label="自动创建子设备:">{{ createSubDevice[info.createSubDevice] }}</info-list-item>
                <info-list-item label="通道数量:">{{ info.deviceStats.channelSize }}</info-list-item>
                <info-list-item label="在线流数量:">{{ info.deviceStats.onlineSize }}</info-list-item>
              </template>
              <info-list-item label="自动拉流:">{{ pullType[info.pullType] }}</info-list-item>
              <info-list-item label="GB28181账号:">{{ info.userName }}</info-list-item>
              <info-list-item label="设备状态:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    <status-badge :status="info.deviceStatus" />
                    {{ deviceStatus[info.deviceStatus] }}
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
            </info-list>
            <info-list v-if="info && isNVRChannel" label-width="110">
              <info-list-item label="通道号:">{{ info.deviceChannels[0].channelNum }}</info-list-item>
              <info-list-item label="通道名称:">{{ info.deviceChannels[0].channelName }}</info-list-item>
              <info-list-item label="厂商:">{{ info.deviceVendor || '-' }}</info-list-item>
              <info-list-item label="设备国标ID:">{{ info.gbId }}</info-list-item>
              <info-list-item label="设备状态:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    <status-badge :status="info.deviceStatus" />
                    {{ deviceStatus[info.deviceStatus] }}
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
          <div>
            <el-button type="text" class="template-edit" @click="openDialog('setRecordTemplate')">编辑</el-button>
            <info-list title="录制模板">
              <el-table v-loading="loading.template" :data="template.recordTemplate" fit>
                <el-table-column prop="templateName" label="模板名称" />
                <el-table-column prop="recordType" label="是否启用自动录制">
                  <template slot-scope="{row}">
                    {{ row.recordType === 1 ? '是':'否' }}
                  </template>
                </el-table-column>
                <el-table-column prop="storeType" label="录制格式">
                  <template slot-scope="{row}">
                    {{ row.flvParam ? 'flv': '' }}
                    {{ row.hlsParam ? 'hls': '' }}
                    {{ row.mpParam ? 'mp4': '' }}
                  </template>
                </el-table-column>
              </el-table>
            </info-list>
          </div>
          <div v-if="false">
            <el-button type="text" class="template-edit" @click="setSnapshotTemplate">编辑</el-button>
            <info-list title="截图模板">
              <el-table :data="template.snapshotTemplate" fit>
                <el-table-column prop="templateName" label="模板名称" />
                <el-table-column prop="interval" label="周期时长" :formatter="formatSeconds" />
                <el-table-column prop="storeType" label="录制格式">
                  <template slot-scope="{row}">
                    {{ row.storeType.join(',') }}
                  </template>
                </el-table-column>
              </el-table>
            </info-list>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <SetRecordTemplate
      v-if="dialog.setRecordTemplate"
      :device-id="deviceId"
      :template-id="recordTemplateId"
      @on-close="closeDialog('setRecordTemplate')"
    />
    <SetSnapshotTemplate v-if="dialog.setSnapshotTemplate" @on-close="closeDialog('setSnapshotTemplate')" />
    <SetAuthConfig v-if="dialog.setAuthConfig" @on-close="closeDialog('setAuthConfig')" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { Device } from '@/type/device'
import { RecordTemplate } from '@/type/template'
import { DeviceStatus, DeviceType, AuthStatus, PullType, CreateSubDevice } from '@/dics'
import { getDevice, getRecordTemplate } from '@/api/device'
import SetRecordTemplate from '../components/dialogs/SetRecordTemplate.vue'
import SetSnapshotTemplate from '../components/dialogs/SetSnapshotTemplate.vue'
import SetAuthConfig from './components/dialogs/SetAuthConfig.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import AntiTheftChain from './components/AntiTheftChain.vue'

@Component({
  name: 'DeviceDetail',
  components: {
    SetRecordTemplate,
    SetSnapshotTemplate,
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
    setRecordTemplate: false,
    setSnapshotTemplate: false,
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
      type: 'ipc'
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
  private async handleClick(tab: any, event: any) {
    this.activeName = tab.name
    if (this.activeName === 'template') {
      try {
        this.loading.template = true
        this.template.recordTemplate = []
        const res = await getRecordTemplate({ deviceId: this.deviceId })
        this.template.recordTemplate.push(res)
      } catch (e) {
        this.$message.error(e)
      } finally {
        this.loading.template = false
      }
    }
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
    if (type === 'setRecordTemplate') {
      if (!this.template.recordTemplate.length) {
        this.recordTemplateId = ''
      } else {
        this.recordTemplateId = this.template.recordTemplate[0].templateId!
      }
    }
  }

  private async closeDialog(type: string) {
    // @ts-ignore
    this.dialog[type] = false
    if (type === 'setRecordTemplate') {
      try {
        this.loading.template = true
        this.template.recordTemplate = []
        const res = await getRecordTemplate({ deviceId: this.deviceId })
        this.template.recordTemplate.push(res)
      } catch (e) {
        this.$message.error(e)
      } finally {
        this.loading.template = false
      }
    }
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
