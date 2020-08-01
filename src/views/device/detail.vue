<template>
  <div class="app-container">
    <div class="detail-wrap">
      <div v-if="info">
        <el-button v-if="info.deviceType === 'ipc'" class="btn-detail" @click="goToPreview"><i class="el-icon-video-camera" /> 监控预览</el-button>
        <el-button v-if="info.deviceType === 'nvr'" class="btn-detail" @click="goToChannels"><i class="el-icon-files" /> 查看通道</el-button>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="info">
          <div :loading="loading.info">
            <el-button type="text" class="info-edit" @click="edit">编辑</el-button>
            <info-list v-if="info" label-width="80">
              <info-list-item label="设备类型:">{{ deviceType[info.deviceType] }}</info-list-item>
              <info-list-item label="设备名称:">{{ info.deviceName }}</info-list-item>
              <info-list-item label="设备ID:">{{ info.deviceId }}</info-list-item>
              <info-list-item label="厂商:">{{ info.deviceVendor }}</info-list-item>
              <template v-if="info.deviceType === 'ipc'">
                <info-list-item label="设备国标ID:">{{ info.gbId }}</info-list-item>
                <info-list-item label="设备IP:">{{ info.deviceIp }}</info-list-item>
                <info-list-item label="端口:">{{ info.devicePort ? info.devicePort : '-' }}</info-list-item>
              </template>
              <template v-if="info.deviceType === 'nvr'">
                <info-list-item label="通道数量:">{{ info.deviceStats.channelSize }}</info-list-item>
                <info-list-item label="在线流数量:">{{ info.deviceStats.onlineSize }}</info-list-item>
              </template>
              <info-list-item label="GB28181账号:">{{ info.userName }}</info-list-item>
              <info-list-item label="状态:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    <status-badge :status="info.deviceStatus" />
                    {{ deviceStatus[info.deviceStatus] }}
                  </div>
                  <div v-if="info.deviceStatus === 'off'" class="info-list__edit--action">
                    <el-button type="text">停用</el-button>
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
        <el-tab-pane v-if="false" label="模板配置" name="template">
          <info-list label-width="100" title="模版配置">
            <info-list-item label="录制模板:">
              <div class="info-list__edit">
                <div class="info-list__edit--value">{{ template.recordTemplate?template.recordTemplate:'未配置' }}</div>
                <div class="info-list__edit--action">
                  <el-button type="text" @click="openDialog('setRecordTemplate')">设置</el-button>
                  <el-button v-if="template.recordTemplate" type="text">解绑</el-button>
                </div>
              </div>
            </info-list-item>
            <info-list-item label="截图模板:">
              <div class="info-list__edit">
                <div class="info-list__edit--value">{{ template.snapshotTemplate?template.snapshotTemplate:'未配置' }}</div>
                <div class="info-list__edit--action">
                  <el-button type="text" @click="openDialog('setSnapshotTemplate')">设置</el-button>
                  <el-button v-if="template.snapshotTemplate" type="text">解绑</el-button>
                </div>
              </div>
            </info-list-item>
          </info-list>
        </el-tab-pane>
      </el-tabs>
    </div>

    <SetRecordTemplate v-if="dialog.setRecordTemplate" @on-close="closeDialog('setRecordTemplate')" />
    <SetSnapshotTemplate v-if="dialog.setSnapshotTemplate" @on-close="closeDialog('setSnapshotTemplate')" />
    <SetAuthConfig v-if="dialog.setAuthConfig" @on-close="closeDialog('setAuthConfig')" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { Device } from '@/type/device'
import { DeviceStatus, DeviceType, AuthStatus } from '@/dics'
import { getDevice } from '@/api/device'
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
  private template = {
    snapshotTemplate: '123'
  }
  private dialog = {
    setRecordTemplate: false,
    setSnapshotTemplate: false,
    setAuthConfig: false
  }
  private loading = {
    info: false
  }

  private get isGb() {
    return this.$route.query.inProtocol === 'gb28181'
  }

  private get id() {
    return this.$route.query.id
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
        deviceId: this.id
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.loading.info = false
    }
  }

  /**
   * 监控预览
   */
  private goToPreview() {
    this.deviceRouter({
      id: this.id,
      type: 'ipc'
    })
  }

  /**
   * 查看通道
   */
  private goToChannels() {
    this.deviceRouter({
      id: this.id,
      type: 'nvr'
    })
  }

  /**
   * TAB切换
   */
  private handleClick(tab: any, event: any) {
    this.activeName = tab.name
  }

  /**
   * 编辑
   */
  private edit() {
    this.$router.push({
      name: 'device-update',
      params: {
        deviceId: this.id.toString()
      }
    })
  }

  private openDialog(type: string) {
    // @ts-ignore
    this.dialog[type] = true
  }

  private closeDialog(type: string) {
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
</style>
