<template>
  <el-form
    ref="videoForm"
    :rules="rules"
    :model="videoForm"
    label-position="right"
    label-width="135px"
  >
    <el-form-item class="full-row" label="接入协议:" :prop="deviceEnum.InVideoProtocol">
      <el-radio
        v-for="(value, key) in inVideoProtocolByDeviceType[deviceForm.deviceType]"
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
      <el-form-item v-if="checkVisible(deviceEnum.Ip)" label="接入IP:" :prop="deviceEnum.DeviceIp">
        <el-input v-model="videoForm.deviceIp" />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.Port)" label="端口:" :prop="deviceEnum.DevicePort">
        <el-input v-model.number="videoForm.devicePort" />
      </el-form-item>
    </template>
    <el-form-item v-if="checkVisible(deviceEnum.DeviceStreamSize)" label="主子码流数量:" :prop="deviceEnum.DeviceStreamSize">
      <template slot="label">
        主子码流数量:
        <el-popover
          placement="top-start"
          title="主子码流数量"
          width="400"
          trigger="hover"
          :open-delay="300"
        >
          <div>
            单码流: 仅有一种码流<br>双码流: 主、子码流<br>三码流:
            主、子、第三码流
          </div>
          <svg-icon slot="reference" class="form-question" name="help" />
        </el-popover>
      </template>
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
    <el-form-item v-if="checkVisible(deviceEnum.DeviceStreamAutoPull)" :prop="deviceEnum.DeviceStreamAutoPull">
      <template slot="label">
        自动拉流:
        <el-popover
          placement="top-start"
          title="自动拉流"
          width="400"
          trigger="hover"
          :open-delay="300"
          :content="tips.deviceStreamAutoPull"
        >
          <svg-icon slot="reference" class="form-question" name="help" />
        </el-popover>
      </template>
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
    <el-form-item v-if="checkVisible(deviceEnum.PushType)" :prop="deviceEnum.PushType">
      <template slot="label">
        自动激活推流地址:
        <el-popover
          placement="top-start"
          title="自动激活推流地址"
          width="400"
          trigger="hover"
          :open-delay="300"
          :content="tips.pushType"
        >
          <svg-icon slot="reference" class="form-question" name="help" />
        </el-popover>
      </template>
      <el-switch
        v-model="videoForm.pushType"
        :active-value="1"
        :inactive-value="2"
      />
    </el-form-item>
    <el-form-item v-if="checkVisible(deviceEnum.StreamTransProtocol)" :prop="deviceEnum.StreamTransProtocol">
      <template slot="label">
        优先TCP传输:
        <el-popover
          placement="top-start"
          title="优先TCP传输"
          width="400"
          trigger="hover"
          :open-delay="300"
          :content="tips.streamTransProtocol"
        >
          <svg-icon slot="reference" class="form-question" name="help" />
        </el-popover>
      </template>
      <el-switch
        v-model="videoForm.streamTransProtocol"
        active-value="tcp"
        inactive-value="udp"
      />
    </el-form-item>
    <el-form-item v-if="checkVisible(deviceEnum.OutId)" label="自定义国标ID:" :prop="deviceEnum.OutId">
      <el-input v-model="videoForm.outId" />
      <div class="form-tip">
        用户可自行录入规范国标ID，未录入该项，平台会自动生成规范国标ID。
      </div>
    </el-form-item>
    <el-form-item v-if="checkVisible(deviceEnum.Resources)" class="full-row" label="配置资源包:" :prop="deviceEnum.Resources">
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
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { DeviceEnum, InTypeEnum, InVideoProtocolEnum, DeviceTypeEnum } from '../../enums/index'
import { InVideoProtocolModelMapping, InVideoProtocolByDeviceType, DeviceVendor, InType, DeviceStreamSize, DeviceStreamPullIndex, VersionByInVideoProtocol } from '@vss/device/dicts'
import { Device, DeviceBasic, VideoDevice } from '@vss/device/type/Device'
import { DeviceTips } from '../../dicts/tips'
import { validGbId } from '../../api/device'
import { checkVideoVisible } from '../../utils/param'
import CertificateSelect from '../CertificateSelect.vue'
import Tags from '../Tags.vue'
import ResourceTabs from '../ResourceTabs.vue'

@Component({
  name: 'VideoCreateForm',
  components: {
    CertificateSelect,
    Tags,
    ResourceTabs
  }
})
export default class extends Vue {
  @Prop() private device: Device
  @Prop({ default: () => {} }) private deviceForm
  public videoForm: any = {}
  private orginalResourceIdList: Array<string> = []
  private isPrivateInNetwork = false
  private deviceEnum = DeviceEnum
  private inVideoProtocolEnum = InVideoProtocolEnum
  private tips = DeviceTips
  private deviceVendor = DeviceVendor
  private inVideoProtocolByDeviceType = InVideoProtocolByDeviceType
  private inType = InType
  private deviceStreamSize = DeviceStreamSize
  private deviceStreamPullIndex = DeviceStreamPullIndex
  private versionByInVideoProtocol = VersionByInVideoProtocol
  private showMore = false
  private showMoreVisable = false
  private minChannelSize = 1
  private rules = {
    [DeviceEnum.InVideoProtocol]: [
      { required: true, message: '请选择接入协议', trigger: 'change' }
    ],
    [DeviceEnum.VideoVendor]: [
      { required: true, message: '请选择厂商', trigger: 'change' }
    ],
    [DeviceEnum.DeviceChannelSize]: [
      { required: true, message: '请填写子设备数量', trigger: 'blur' }
    ],
    [DeviceEnum.InUserName]: [
      { required: true, message: '请选择账号', trigger: 'change' }
    ],
    [DeviceEnum.PullUrl]: [
      { required: true, message: '请输入自定义设备拉流地址', trigger: 'blur' }
    ],
    [DeviceEnum.UserName]: [
      { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    [DeviceEnum.Password]: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ],
    [DeviceEnum.DeviceDomain]: [
      { required: true, message: '请输入设备域名', trigger: 'blur' },
      { validator: this.validateDeviceDomain, trigger: 'blur' }
    ],
    [DeviceEnum.DeviceIp]: [
      { required: true, message: '请输入设备IP', trigger: 'blur' },
      { validator: this.validateDeviceIp, trigger: 'blur' }
    ],
    [DeviceEnum.DevicePort]: [
      { required: true, message: '请输入设备端口', trigger: 'blur' },
      { validator: this.validateDevicePort, trigger: 'change' }
    ],
    [DeviceEnum.Resources]: [
      { required: true, validator: this.validateResources, trigger: 'blur' }
    ],
    [DeviceEnum.OutId]: [
      { validator: this.validateGbId, trigger: 'blur' }
    ]
  }

  @Watch('device', {
    immediate: true
  })
  private onDeviceChange() {
    this.videoForm = {
      [DeviceEnum.InVideoProtocol]: this.inVideoProtocol || InVideoProtocolEnum.Gb28181,
      [DeviceEnum.VideoVendor]: this.basicInfo[DeviceEnum.VideoVendor],
      [DeviceEnum.InVersion]: this.videoInfo[DeviceEnum.InVersion] || '2016',
      [DeviceEnum.DeviceChannelSize]: this.basicInfo[DeviceEnum.DeviceChannelSize] || 1,
      [DeviceEnum.InUserName]: this.videoInfo[DeviceEnum.InUserName],
      [DeviceEnum.InType]: this.videoInfo[DeviceEnum.InType] || InTypeEnum.Pull,
      [DeviceEnum.PullUrl]: this.videoInfo[DeviceEnum.PullUrl],
      [DeviceEnum.UserName]: this.videoInfo[DeviceEnum.UserName],
      [DeviceEnum.Password]: this.videoInfo[DeviceEnum.Password],
      [DeviceEnum.EnableDomain]: this.videoInfo[DeviceEnum.EnableDomain] || 2,
      [DeviceEnum.DeviceDomain]: this.videoInfo[DeviceEnum.DeviceDomain],
      [DeviceEnum.DeviceIp]: this.videoInfo[DeviceEnum.DeviceIp],
      [DeviceEnum.DevicePort]: this.videoInfo[DeviceEnum.DevicePort],
      [DeviceEnum.DeviceStreamSize]: this.videoInfo[DeviceEnum.DeviceStreamSize] || 1,
      [DeviceEnum.DeviceStreamAutoPull]: this.videoInfo[DeviceEnum.DeviceStreamAutoPull] || 1,
      [DeviceEnum.DeviceStreamPullIndex]: this.videoInfo[DeviceEnum.DeviceStreamPullIndex] || 1,
      [DeviceEnum.PushType]: this.videoInfo[DeviceEnum.PushType] || 1,
      [DeviceEnum.StreamTransProtocol]: this.videoInfo[DeviceEnum.StreamTransProtocol] || 'tcp',
      [DeviceEnum.OutId]: this.videoInfo[DeviceEnum.OutId],
      [DeviceEnum.Tags]: this.videoInfo[DeviceEnum.Tags],
      [DeviceEnum.Resources]: [],
      vssAIApps: [],
      aIApps: []
    }
  }

  /**
   * 设备类型变化
   */
  @Watch('deviceForm.deviceType')
  private deviceTypeChange() {
    this.videoForm.inVideoProtocol = InVideoProtocolEnum.Gb28181
  }

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return (this.device && this.device[DeviceEnum.Device]) || {} as DeviceBasic
  }

  // 视频接入协议
  private get inVideoProtocol() {
    return this.device && this.device[DeviceEnum.Videos] && this.device[DeviceEnum.Videos][0]![DeviceEnum.InVideoProtocol]
  }

  // 视频接入信息
  private get videoInfo(): VideoDevice {
    return (this.inVideoProtocol && this.device[DeviceEnum.Videos][0]![InVideoProtocolModelMapping[this.inVideoProtocol]]) || {} as VideoDevice
  }

  private updated() {
    this.checkIsShwoMore()
  }

  /**
   * 校验video表单
   */
  public validateVideoForm() {
    const videoForm: any = this.$refs.videoForm
    let validFlag = true
    videoForm.validate((valid) => {
      validFlag = valid
    })
    return validFlag
  }

  /**
   * 判断是否显示更多下拉框
   */
  private checkIsShwoMore() {
    const showMoreForm = this.$refs.showMoreForm as HTMLDivElement
    this.showMoreVisable = showMoreForm.children.length !== 0
  }

  /**
   * 视频接入协议变化
   */
  private inVideoProtocolChange(val) {
    this.$emit('inVideoProtocolChange', val)
    // 重置vendor
    this.videoForm[DeviceEnum.VideoVendor] = ''
    // 重置version
    const versionMap = VersionByInVideoProtocol[this.videoForm[DeviceEnum.InVideoProtocol]]
    versionMap && (this.videoForm[DeviceEnum.InVersion] = Object.values(versionMap)[0] as string)
  }

  /**
   * 码流数变化回调
   */
  private onDeviceStreamSizeChange() {
    if (this.videoForm[DeviceEnum.DeviceStreamSize] < this.videoForm[DeviceEnum.DeviceStreamPullIndex]) {
      this.videoForm[DeviceEnum.DeviceStreamPullIndex] = this.videoForm[DeviceEnum.DeviceStreamSize]
    }
  }

  /**
   * 当资源包改变时获取资源包详情（包含接入剩余设备数）
   */
  private onResourceChange(payload: any) {
    this.resourcesMapping = payload.mapping
    const videoForm: any = this.$refs.videoForm
    !payload.isInit && videoForm.validateField(DeviceEnum.Resources)
  }

  /**
   * 接受子组件传来的VSSAIApps
   */
  private changeVSSAIApps(res: any) {
    if (this.isUpdate) {
      this.videoForm[DeviceEnum.AIApps] = res
    }
    this.videoForm[DeviceEnum.VssAIApps] = res
  }

  /**
   * 判断是否显示form-item
   */
  private checkVisible(prop) {
    return checkVideoVisible.call(this.videoForm, this.deviceForm[DeviceEnum.DeviceType], this.videoForm[DeviceEnum.InVideoProtocol], prop)
  }

  /*
   * 校验设备Domain格式
   */
  public validateDeviceDomain(rule: any, value: string, callback: Function) {
    if (value && !/^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?$/.test(value)) {
      callback(new Error('设备域名格式不正确。正确域名格式例如: www.domain.com'))
    } else {
      callback()
    }
  }

  /**
   * 校验资源包
   */
  public validateResources(rule: any, value: string, callback: Function) {
    let hasVideo = false
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const remainError: any = []
    this.videoForm.resources.forEach((resource: any) => {
      // 剩余可接入设备数
      const remainDeviceCount = parseInt(this.resourcesMapping[resource[DeviceEnum.ResourceId]] && this.resourcesMapping[resource[DeviceEnum.ResourceId]][DeviceEnum.RemainDeviceCount])
      const devicesCount = this.deviceForm[DeviceEnum.DeviceType] === DeviceTypeEnum.Ipc ? 1 : this.deviceForm[DeviceEnum.DeviceChannelSize]
      // 如果当前resourceId不在orginalResourceIdList，则表示该类型的资源包的值被更改。如果未更改则需要跳过数量判断。
      const isChanged = this.orginalResourceIdList.indexOf(resource[DeviceEnum.ResourceId]) === -1
      switch (resource[DeviceEnum.ResourceType]) {
        case 'VSS_VIDEO':
          hasVideo = true
          if (isChanged && devicesCount > remainDeviceCount) {
            remainError.push('视频包')
          }
          break
        case 'VSS_AI':
          if (isChanged && devicesCount > remainDeviceCount) {
            remainError.push('AI包')
          }
          break
        case 'VSS_UPLOAD_BW':
          break
      }
    })
    if (remainError.length) {
      callback(new Error(`${remainError.join(',')}接入设备余量不足，请增加包资源！`))
    // } else if (!this.isUpdate && !hasVideo && !hasUpload && !this.isPrivateInNetwork && !this.isFreeUser) {
    //   callback(new Error('资源包必须配置视频包与上行带宽包'))
    } else if (!this.isUpdate && !hasVideo && !this.isFreeUser) {
      callback(new Error('必须配置视频包'))
    // } else if (!this.isUpdate && !hasUpload && !this.isPrivateInNetwork && !this.isFreeUser) {
    //   callback(new Error('必须配置上行带宽包'))
    } else {
      callback()
    }
  }

  /**
   * 校验设备IP格式
   */
  public validateDeviceIp(rule: any, value: string, callback: Function) {
    if (value && !/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(value)) {
      callback(new Error('设备IP格式不正确'))
    } else {
      callback()
    }
  }

  /**
   * 校验端口号
   */
  public validateDevicePort(rule: any, value: string, callback: Function) {
    if (value && !/^[0-9]+$/.test(value)) {
      callback(new Error('设备端口仅支持数字'))
    } else {
      callback()
    }
  }

  /**
   * 校验设备国标ID
   */
  public async validateGbId(rule: any, value: string, callback: Function) {
    let validInfo: any
    if (value && !/^[0-9]{20}$/.test(value)) {
      callback(new Error('请输入规范国标ID'))
    } else if (value) {
      try {
        validInfo = await validGbId({
          [DeviceEnum.DeviceId]: this.deviceId,
          [DeviceEnum.InVideoProtocol]: this.videoForm[DeviceEnum.InVideoProtocol],
          [DeviceEnum.OutId]: this.videoForm[DeviceEnum.OutId]
        })
        if (validInfo && !validInfo.IsValidGbId) {
          callback(new Error('存在重复国标ID'))
        } else {
          callback()
        }
      } catch (e) {
        console.log(e)
      }
    } else {
      callback()
    }
  }
}
</script>
