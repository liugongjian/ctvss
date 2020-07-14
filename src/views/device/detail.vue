<template>
  <div class="app-container">
    <el-page-header content="设备详情" @back="back" />
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane label="基本信息" name="info">
        <el-button type="text" class="info-edit" @click="editForm">编辑</el-button>
        <info-list label-width="150">
          <info-list-item label="业务组名称:">{{ info.groupName }}</info-list-item>
          <info-list-item label="设备类型:">{{ deviceType[info.deviceType] }}</info-list-item>
          <info-list-item label="设备名称:">{{ info.deviceName }}</info-list-item>
          <info-list-item label="设备ID:">{{ info.deviceId }}</info-list-item>
          <info-list-item label="厂商:">{{ info.deviceVendor }}</info-list-item>
          <template v-if="isIPC">
            <info-list-item label="设备国标ID:">{{ info.gbId }}</info-list-item>
            <info-list-item label="设备IP:">{{ info.deviceIp }}</info-list-item>
            <info-list-item label="端口:">{{ info.devicePort }}</info-list-item>
            <info-list-item label="GB28181账号:">{{ info.gbAccount }}</info-list-item>
          </template>
          <info-list-item label="状态:">
            <div class="info-list__edit">
              <div class="info-list__edit--value">
                <status-badge :status="info.deviceStatus" />
                {{ deviceStatus[info.deviceStatus] }}
              </div>
              <div class="info-list__edit--action">
                <el-button type="text">停用</el-button>
              </div>
            </div>
          </info-list-item>
        </info-list>
      </el-tab-pane>
      <el-tab-pane v-if="!isIPC" label="推流配置" name="push">
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
      <el-tab-pane v-if="!isIPC" label="播流配置" name="play">
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
              <div class="info-list__edit--value">{{ template.screencutTemplate?template.screencutTemplate:'未配置' }}</div>
              <div class="info-list__edit--action">
                <el-button type="text" @click="openDialog('setScreenCutTemplate')">设置</el-button>
                <el-button v-if="template.screencutTemplate" type="text">解绑</el-button>
              </div>
            </div>
          </info-list-item>
        </info-list>
      </el-tab-pane>
    </el-tabs>

    <SetRecordTemplate v-if="dialog.setRecordTemplate" @on-close="closeDialog('setRecordTemplate')" />
    <SetScreenCutTemplate v-if="dialog.setScreenCutTemplate" @on-close="closeDialog('setScreenCutTemplate')" />
    <SetAuthConfig v-if="dialog.setAuthConfig" @on-close="closeDialog('setAuthConfig')" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { DeviceStatus, DeviceType, AuthStatus } from '@/dics'
import SetRecordTemplate from '../components/dialogs/SetRecordTemplate.vue'
import SetScreenCutTemplate from '../components/dialogs/SetScreenCutTemplate.vue'
import SetAuthConfig from './components/dialogs/SetAuthConfig.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import AntiTheftChain from './components/AntiTheftChain.vue'

@Component({
  name: 'DeviceDetail',
  components: {
    SetRecordTemplate,
    SetScreenCutTemplate,
    SetAuthConfig,
    StatusBadge,
    AntiTheftChain
  }
})
export default class extends Vue {
  private activeName = 'info'
  private deviceStatus = DeviceStatus
  private deviceType = DeviceType
  private authStatus = AuthStatus
  private info = {
    deviceId: 374623843,
    groupName: '上海电信园区监控',
    deviceName: '一楼楼道监控',
    deviceStatus: 'on',
    deviceType: 'ipc',
    deviceVendor: '海康',
    deviceIp: '119.13.44.23',
    devicePort: '3783',
    gbId: '235433524',
    gbAccount: 'GB_user1'
  }
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
    screencutTemplate: '123'
  }
  private dialog = {
    setRecordTemplate: false,
    setScreenCutTemplate: false,
    setAuthConfig: false
  }

  private get isIPC() {
    let params = this.$route.params
    return params.type === 'ipc'
  }

  private back() {
    this.$router.push('/device')
  }

  private handleClick(tab: any, event: any) {
    this.activeName = tab.name
  }

  private editForm() {
    this.$router.push({
      name: 'device-update',
      params: {
        deviceId: this.info.deviceId.toString()
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
