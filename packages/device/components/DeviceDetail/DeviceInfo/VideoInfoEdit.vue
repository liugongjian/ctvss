<template>
  <div class="detail-wrap__edit-wrap">
    <el-form
      ref="videoForm"
      class="detail-wrap__edit"
      :rules="rules"
      :model="videoForm"
      label-position="right"
      label-width="135px"
    >
      <el-form-item label="接入协议:" class="full-row" :prop="deviceEnum.InVideoProtocol">
        <el-radio
          v-for="(value, key) in inVideoProtocolByDeviceType[basicInfo.deviceType]"
          :key="key"
          v-model="videoForm.inVideoProtocol"
          :label="key"
          @change="inVideoProtocolChange"
        >
          {{ value }}
        </el-radio>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.VideoVendor)" label="厂商:" :prop="deviceEnum.VideoVendor">
        <el-select v-model="videoForm.videoVendor">
          <el-option
            v-for="(value, key) in deviceVendor[videoForm.inVideoProtocol]"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.InVersion)" label="版本:" :prop="deviceEnum.InVersion">
        <el-radio-group v-model="videoForm.inVersion">
          <el-radio-button
            v-for="(value, key) in versionByInVideoProtocol[videoForm.inVideoProtocol]"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.DeviceChannelSize)" label="子设备数量:" :prop="deviceEnum.DeviceChannelSize">
        <el-input-number
          v-model="videoForm.deviceChannelSize"
          :min="minChannelSize"
          type="number"
        />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.InUserName)" label="GB28181账号:" :prop="deviceEnum.InUserName">
        <certificate-select v-model="videoForm.inUserName" :type="inVideoProtocolEnum.Gb28181" />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.InType)" label="视频流接入方式:" :prop="deviceEnum.InType">
        <el-radio
          v-for="(value, key) in inType"
          :key="key"
          v-model="videoForm.inType"
          :label="key"
        >
          {{ value }}
        </el-radio>
      </el-form-item>
      <template v-if="videoForm.videoVendor === '其他' || checkVisible(deviceEnum.OnlyPullUrl)">
        <el-form-item v-if="checkVisible(deviceEnum.PullUrl)" label="拉流地址:" :prop="deviceEnum.PullUrl">
          <el-input v-model="videoForm.pullUrl" />
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item v-if="checkVisible(deviceEnum.UserName)" label="用户名:" :prop="deviceEnum.UserName">
          <el-input v-model="videoForm.userName" />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.Password)" label="密码:" :prop="deviceEnum.Password">
          <el-input v-model="videoForm.password" type="password" />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.EnableDomain)" label="是否启用域名:" :prop="deviceEnum.EnableDomain">
          <el-switch
            v-model="videoForm.enableDomain"
            :active-value="1"
            :inactive-value="2"
          />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.DeviceDomain)" label="设备域名:" :prop="deviceEnum.DeviceDomain">
          <el-input v-model="videoForm.deviceDomain" />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.DeviceIp)" label="设备IP:" :prop="deviceEnum.DeviceIp">
          <el-input v-model="videoForm.deviceIp" />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.DevicePort)" label="设备端口:" :prop="deviceEnum.DevicePort">
          <el-input v-model.number="videoForm.devicePort" />
        </el-form-item>
      </template>
      <el-form-item v-if="checkVisible(deviceEnum.DeviceStreamSize)" label="主子码流数量:" :prop="deviceEnum.DeviceStreamSize">
        <el-radio
          v-for="(value, key) in deviceStreamSize"
          :key="key"
          v-model="videoForm.deviceStreamSize"
          :label="+key"
          :disabled="deviceForm.deviceType === 'nvr' && +key === 3 "
          @change="onDeviceStreamSizeChange"
        >
          {{ value }}
        </el-radio>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.DeviceStreamAutoPull)" label="自动拉流" :prop="deviceEnum.DeviceStreamAutoPull">
        <el-switch
          v-model="videoForm.deviceStreamAutoPull"
          :active-value="1"
          :inactive-value="2"
        />
      </el-form-item>
      <el-form-item
        v-if="checkVisible(deviceEnum.DeviceStreamPullIndex)"
        label="自动拉取码流:"
        :prop="deviceEnum.DeviceStreamPullIndex"
      >
        <el-radio
          v-for="(value, key) in deviceStreamPullIndex"
          :key="key"
          v-model="videoForm.deviceStreamPullIndex"
          :label="+key"
          :disabled="+key > videoForm.deviceStreamSize"
        >
          {{ value }}
        </el-radio>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.PushType)" label="自动激活推流地址" :prop="deviceEnum.PushType">
        <el-switch
          v-model="videoForm.pushType"
          :active-value="1"
          :inactive-value="2"
        />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.StreamTransProtocol)" label="优先TCP传输" :prop="deviceEnum.StreamTransProtocol">
        <el-switch
          v-model="videoForm.streamTransProtocol"
          active-value="tcp"
          inactive-value="udp"
        />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.OutId)" label="自定义国标ID:" :prop="deviceEnum.OutId">
        <el-input v-model="videoForm.outId" />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.Resources)" label="配置资源包:" class="full-row" :prop="deviceEnum.Resources">
        <resource-tabs
          v-model="videoForm.resources"
          :is-private-in-network="deviceForm.inNetworkType === 'private'"
          :form-info="videoForm"
          :vss-ai-apps="videoForm.vssAIApps"
          @on-change="onResourceChange"
          @changevssaiapps="changeVSSAIApps"
        />
      </el-form-item>
      <div v-show="showMoreVisable" class="show-more" :class="{'show-more--expanded': showMore}">
        <el-form-item>
          <el-button class="show-more--btn" type="text" @click="showMore = !showMore">更多<i class="el-icon-arrow-down" /></el-button>
        </el-form-item>
        <div ref="showMoreForm" class="show-more--form">
          <el-form-item v-if="checkVisible(deviceEnum.Tags)" label="视频标签:" :prop="deviceEnum.Tags">
            <tags v-model="videoForm.tags" class="tags" />
          </el-form-item>
        </div>
      </div>
    </el-form>

    <div class="detail-wrap__edit__footer">
      <el-button size="medium" type="primary" @click="submit">确 定</el-button>
      <el-button size="medium" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import VideoFormMixin from '@vss/device/mixin/videoFormMixin'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { InVideoProtocolModelMapping } from '@vss/device/dicts'
import { DeviceEnum, InTypeEnum } from '@vss/device/enums'
import { Device, DeviceBasic, Industry, VideoDevice } from '@vss/device/type/Device'
import AddressCascader from '../../AddressCascader.vue'

@Component({
  name: 'VideoInfoEdit',
  components: {
    StatusBadge,
    AddressCascader
  }
})
export default class extends Mixins(VideoFormMixin) {
  @Prop() private device: Device

  public videoForm = {}

  @Watch('device', {
    immediate: true
  })
  private onDeviceChange() {
    this.videoForm = {
      [DeviceEnum.InVideoProtocol]: this.inVideoProtocol,
      [DeviceEnum.VideoVendor]: '',
      [DeviceEnum.InVersion]: this.videoInfo.inVersion,
      [DeviceEnum.DeviceChannelSize]: this.basicInfo.deviceChannelSize,
      [DeviceEnum.InUserName]: this.videoInfo.inUserName,
      [DeviceEnum.InType]: this.videoInfo.inType || InTypeEnum.Pull,
      [DeviceEnum.PullUrl]: this.videoInfo.pullUrl,
      [DeviceEnum.UserName]: this.videoInfo.userName,
      [DeviceEnum.Password]: this.videoInfo.password,
      [DeviceEnum.EnableDomain]: this.videoInfo.enableDomain || 2,
      [DeviceEnum.DeviceDomain]: this.videoInfo.deviceDomain,
      [DeviceEnum.DeviceIp]: this.videoInfo.deviceIp,
      [DeviceEnum.DevicePort]: this.videoInfo.devicePort,
      [DeviceEnum.DeviceStreamSize]: this.videoInfo.deviceStreamSize || 1,
      [DeviceEnum.DeviceStreamAutoPull]: this.videoInfo.deviceStreamAutoPull || 1,
      [DeviceEnum.DeviceStreamPullIndex]: this.videoInfo.deviceStreamPullIndex || 1,
      [DeviceEnum.PushType]: this.videoInfo.pushType || 1,
      [DeviceEnum.StreamTransProtocol]: this.videoInfo.streamTransProtocol || 'tcp',
      [DeviceEnum.OutId]: this.videoInfo.outId,
      [DeviceEnum.Tags]: this.videoInfo.tags,
      [DeviceEnum.Resources]: [],
      vssAIApps: [],
      aIApps: []
    }
  }

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device.device
  }

  // 设备行业信息
  private get industry(): Industry {
    return this.device.industry
  }

  // 视频接入协议
  private get inVideoProtocol() {
    return this.device.videos && this.device.videos[0]!.inVideoProtocol
  }

  // 视频接入信息
  private get videoInfo(): VideoDevice {
    return this.inVideoProtocol && this.device.videos[0]![InVideoProtocolModelMapping[this.inVideoProtocol]]
  }

  private mounted() {
  }

  private submit() {
    this.$emit('cancel')
  }

  private cancel() {
    this.$emit('cancel')
  }
}
</script>
