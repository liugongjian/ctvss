<template>
  <div class="app-container">
    <div v-loading="loading.info" class="detail-wrap">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="info">
          <div v-if="info">
            <div class="detail__buttons">
              <el-button @click="goSuperior"><svg-icon name="superior" /> 返回上级</el-button>
              <el-button v-if="(!isNVR && info.parentDeviceId === '-1') && checkPermission(['AdminDevice'])" @click="moveDir"><svg-icon name="move" /> 移动至</el-button>
              <el-button v-if="!isVGroup && checkPermission(['AdminDevice'])" @click="changeResourceDialog">配置资源包</el-button>
              <el-button v-if="checkPermission(['AdminDevice'])" @click="edit"><svg-icon name="edit" /> 编辑</el-button>
              <!--自动创建的子通道不允许删除-->
              <el-button v-if="!isAutoCreated && checkPermission(['AdminDevice'])" @click="deleteDevice(info)"><svg-icon name="trash" /> 删除</el-button>
            </div>
            <!--状态信息-->
            <div class="detail__section">
              <div class="detail__title">状态信息</div>
              <el-descriptions :column="2">
                <el-descriptions-item label="设备状态">
                  <status-badge :status="info.deviceStatus" />
                  {{ deviceStatus[info.deviceStatus] || '-' }}
                </el-descriptions-item>
                <template v-if="info && !isNVR">
                  <el-descriptions-item v-for="num in info.multiStreamSize" :key="num" :label="`${autoStreamNumObj[num]}状态`">
                    <status-badge :status="getStreamStatus(info.deviceStreams, num) || 'false'" />
                    {{ deviceStatus[getStreamStatus(info.deviceStreams, num)] || '-' }}
                    <el-link v-if="info.streamStatus === 'on' && checkPermission(['*'])" @click="stopDevice(info)">停用{{ autoStreamNumObj[num] }}</el-link>
                    <el-link v-else-if="checkPermission(['*'])" @click="startDevice(info)">启用{{ autoStreamNumObj[num] }}</el-link>
                  </el-descriptions-item>
                  <el-descriptions-item label="录制状态">
                    <status-badge :status="recordStatusType[info.recordStatus]" />
                    {{ recordStatus[info.recordStatus] || '-' }}
                    <el-link v-if="info.recordStatus === 1 && checkPermission(['*'])" @click="stopRecord(info)">停止录像</el-link>
                    <el-link v-else-if="checkPermission(['*'])" @click="startRecord(info)">开始录像</el-link>
                  </el-descriptions-item>
                </template>
              </el-descriptions>
            </div>
            <!--设备信息-->
            <div class="detail__section">
              <div class="detail__title">设备信息</div>
              <el-descriptions :column="2">
                <!--通用信息-->
                <el-descriptions-item label="设备ID">
                  {{ info.deviceId }}
                </el-descriptions-item>
                <template v-if="info && !isNVRChannel">
                  <el-descriptions-item label="设备名称">
                    {{ info.deviceName }}
                  </el-descriptions-item>
                  <el-descriptions-item label="设备类型">
                    {{ deviceType[info.deviceType] }}
                  </el-descriptions-item>
                  <el-descriptions-item label="设备厂商">
                    {{ info.deviceVendor || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="视频流接入方式">
                    {{ inType[info.inType] }}
                  </el-descriptions-item>
                  <template v-if="info.deviceVendor === '其他'">
                    <el-descriptions-item v-if="info.inType === 'pull'" label="自定义拉流地址:">{{ info.deviceDomain }}</el-descriptions-item>
                  </template>
                  <template v-else>
                    <el-descriptions-item v-if="info.inType === 'pull'" label="用户名">{{ info.userName }}</el-descriptions-item>
                    <el-descriptions-item v-if="info.inType === 'pull' && info.enableDomain === 1" label="设备域名">{{ info.deviceDomain }}</el-descriptions-item>
                    <el-descriptions-item v-if="info.inType === 'pull' && info.enableDomain === 2" label="设备IP">{{ info.deviceIp }}</el-descriptions-item>
                    <el-descriptions-item v-if="info.inType === 'pull'" label="设备端口">{{ info.devicePort }}</el-descriptions-item>
                  </template>
                </template>
                <!--子通道信息-->
                <template v-if="info && isNVRChannel">
                  <el-descriptions-item v-if="info.deviceChannels.length" label="通道号">
                    {{ 'D' + info.deviceChannels[0].channelNum }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="info.deviceChannels.length" label="通道名称">
                    {{ info.deviceChannels[0].channelName }}
                  </el-descriptions-item>
                  <el-descriptions-item label="设备厂商">
                    {{ info.deviceVendor || '-' }}
                  </el-descriptions-item>
                </template>
                <!--NVR信息-->
                <template v-if="info.deviceType === 'nvr'">
                  <el-descriptions-item label="自动创建子设备">
                    {{ createSubDevice[info.createSubDevice] }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="info.createSubDevice === 2 ? '实际通道数量' : '通道数量'">
                    {{ info.deviceStats && info.deviceStats.channelSize }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="info.createSubDevice === 2" label="可支持通道数量">
                    {{ info.deviceStats && info.deviceStats.maxChannelSize }}
                  </el-descriptions-item>
                  <el-descriptions-item label="在线流数量">
                    {{ info.deviceStats && info.deviceStats.onlineSize }}
                  </el-descriptions-item>
                </template>
                <!--通用信息-->
                <el-descriptions-item label="主子码流数量">
                  {{ info.multiStreamSize }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    自动拉流
                    <el-popover
                      placement="top-start"
                      title="自动拉流"
                      width="400"
                      trigger="hover"
                      :open-delay="300"
                      :content="tips.pullType"
                    >
                      <svg-icon slot="reference" class="form-question" name="help" />
                    </el-popover>
                  </template>
                  {{ pullType[info.pullType] }}
                </el-descriptions-item>
                <el-descriptions-item v-if="info.pullType === 1" label="自动拉取码流">
                  {{ autoStreamNumObj[info.autoStreamNum] }}
                </el-descriptions-item>
                <el-descriptions-item label="优先TCP传输">
                  {{ transPriority[info.transPriority] || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="设备描述">
                  {{ info.description || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="拉流地址">
                  {{ info.pullUrl || '-' }}
                  <el-tooltip v-if="info.pullUrl" class="item" effect="dark" content="复制链接" placement="top">
                    <el-button type="text" @click="copyUrl(info.pullUrl)"><svg-icon name="copy" /></el-button>
                  </el-tooltip>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>

          <div v-if="info">
            <info-list abel-width="100">
              <info-list-item label="设备类型:">{{ deviceType[info.deviceType] }}</info-list-item>
              <info-list-item label="设备名称:">{{ info.deviceName }}</info-list-item>
              <info-list-item label="设备ID:">{{ info.deviceId }}</info-list-item>
              <info-list-item label="厂商:">{{ info.deviceVendor || '-' }}</info-list-item>
              <info-list-item label="视频流接入方式:">{{ inType[info.inType] }}</info-list-item>
              <info-list-item v-if="info.inType === 'push'" label="自动激活推流地址:">{{ pushType[info.pushType] || '-' }}</info-list-item>
              <info-list-item v-else label="自动拉流:">{{ pullType[info.pullType] || '-' }}</info-list-item>
              <info-list-item label="流状态:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    <status-badge :status="info.streamStatus" />
                    {{ deviceStatus[info.streamStatus] || '-' }}
                  </div>
                </div>
              </info-list-item>
              <info-list-item label="录制状态:">
                <div class="info-list__edit">
                  <div class="info-list__edit--value">
                    <status-badge :status="recordStatusType[info.recordStatus]" />
                    {{ recordStatus[info.recordStatus] }}
                  </div>
                </div>
              </info-list-item>
              <info-list-item label="视频标签:">
                <el-tag v-for="tag in tags" :key="tag" type="info">{{ tag }}</el-tag>
                <span v-if="!tags">-</span>
              </info-list-item>
              <info-list-item v-for="resource in resources" :key="resource.label" :label="`${resourceType[resource.label]}:`">{{ (resource.value && '已绑定') || '未绑定' }}</info-list-item>
              <info-list-item label="设备描述:">{{ info.description || '-' }}</info-list-item>
              <info-list-item v-if="info.inType === 'push'" label="推流地址:">
                {{ info.pushUrl || '-' }}
                <el-tooltip v-if="info.pushUrl" class="item" effect="dark" content="复制链接" placement="top">
                  <el-button type="text" @click="copyUrl(info.pushUrl)"><svg-icon name="copy" /></el-button>
                </el-tooltip>
              </info-list-item>
              <info-list-item v-else label="拉流地址:">
                {{ info.pullUrl || '-' }}
                <el-tooltip v-if="info.pullUrl" class="item" effect="dark" content="复制链接" placement="top">
                  <el-button type="text" @click="copyUrl(info.pullUrl)"><svg-icon name="copy" /></el-button>
                </el-tooltip>
              </info-list-item>
            </info-list>
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="false" label="推流配置" name="push">
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
        <el-tab-pane v-if="false" label="播流配置" name="play">
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
        <el-tab-pane v-if="!isVGroup" label="配置信息" name="config">
          <detail-config v-if="activeName==='config'" :device-id="deviceId" :in-protocol="inProtocol" />
        </el-tab-pane>
        <el-tab-pane v-if="info && info.deviceType === 'ipc' && checkPermission(['ScreenPreview'])" label="实时预览" name="preview">
          <detail-preview v-if="activeName==='preview'" :device-id="deviceId" :in-protocol="inProtocol" />
        </el-tab-pane>
        <el-tab-pane v-if="info && info.deviceType === 'ipc' && checkPermission(['ReplayRecord'])" label="录像回放" name="replay">
          <detail-replay v-if="activeName==='replay'" :device-id="deviceId" :in-protocol="inProtocol" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <SetAuthConfig v-if="dialog.setAuthConfig" @on-close="closeDialog('setAuthConfig')" />
    <resource v-if="showResourceDialog" :device="info" :algo-tab-type-default="algoTabTypeDefault" @on-close="closeResourceDialog" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import detailMixin from '../mixin/detailMixin'

@Component({
  name: 'DeviceRtmpDetail'
})
export default class extends Mixins(detailMixin) {}
</script>
<style lang="scss" scoped>
  .app-container {
    ::v-deep {
      .info-list__title {
        margin: 10px 5px 0 5px;
      }
      .info-item .el-button {
        padding: 0;
      }
      .info-item  .el-tag--medium {
        height: 24px;
        line-height: 22px;
        margin-right: 5px;
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
