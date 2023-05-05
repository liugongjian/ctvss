<template>
  <el-form
    ref="videoForm"
    :rules="rules"
    :model="videoForm"
    label-position="right"
    label-width="165px"
  >
    <div class="two-column-wrap">
      <el-form-item v-if="checkVisible(deviceEnum.InVideoProtocol)" class="full-row" label="接入协议:" :prop="deviceEnum.InVideoProtocol">
        <el-radio
          v-for="(value, key) in inVideoProtocolByDeviceType[deviceForm.deviceType]"
          :key="key"
          v-model="videoForm.inVideoProtocol"
          :label="key"
          :disabled="checkInVideoProtocolDisabled(key)"
          @change="inVideoProtocolChange"
        >
          {{ value }}
        </el-radio>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.VideoVendor)" label="厂商:" :prop="deviceEnum.VideoVendor">
        <el-select
          v-model="videoForm.videoVendor"
          @change="videoVendorChange"
        >
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
          v-model.number="videoForm.deviceChannelSize"
          :min="minChannelSize"
          type="number"
        />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.EnabledGB35114)" prop="enabledGB35114">
        <template slot="label">
          GB35114协议:
          <el-popover
            placement="top-start"
            title="GB35114协议"
            width="400"
            trigger="hover"
            :open-delay="300"
            content="启用了GB35114协议，就无需添加GB28181凭证。"
          >
            <svg-icon
              slot="reference"
              class="form-question"
              name="help"
            />
          </el-popover>
        </template>
        <el-switch
          v-model="videoForm.enabledGB35114"
          :active-value="true"
          :inactive-value="false"
        />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.InUserName)" label="GB28181账号:" :prop="deviceEnum.InUserName">
        <certificate-select v-model="videoForm.inUserName" :type="inVideoProtocolEnum.Gb28181" />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.InType)" label="视频流接入方式:" :prop="deviceEnum.InType">
        <!-- <el-radio
        v-for="(value, key) in inType"
        :key="key"
        v-model="videoForm.inType"
        :label="key"
      >
        {{ value }}
      </el-radio> -->
        <!-- Temp Commit -->
        <el-radio v-model="videoForm.inType" label="push" :disabled="videoForm.inVideoProtocol === 'rtsp'">推流</el-radio>
        <el-radio v-model="videoForm.inType" label="pull" :disabled="videoForm.inVideoProtocol === 'rtmp'">拉流</el-radio>
      </el-form-item>
      <template v-if="videoForm[deviceEnum.VideoVendor] === '其他' || checkVisible(deviceEnum.OnlyPullUrl)">
        <el-form-item v-if="checkVisible(deviceEnum.PullUrl)" label="拉流地址:" :prop="deviceEnum.PullUrl">
          <el-input v-model="videoForm.pullUrl" />
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item v-if="checkVisible(deviceEnum.UserName)" label="用户名:" :prop="deviceEnum.UserName">
          <el-input v-model="videoForm.userName" autocomplete="off" />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.Password)" label="密码:" :prop="deviceEnum.Password" class="is-required">
          <el-input v-model="videoForm.password" type="password" autocomplete="off" :placeholder="passwordPlaceholder" />
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
      <el-form-item v-if="checkVisible(deviceEnum.DeviceStreamSize) && videoForm[deviceEnum.VideoVendor] !== '其他'" label="主子码流数量:" :prop="deviceEnum.DeviceStreamSize">
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
          :disabled="checkDeviceStreamDisabled(key)"
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
        v-if="checkVisible(deviceEnum.DeviceStreamPullIndex) && videoForm[deviceEnum.VideoVendor] !== '其他'"
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
          :active-value="'1'"
          :inactive-value="'2'"
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
        <div v-if="!isEdit" class="form-tip">
          用户可自行录入规范国标ID，未录入该项，平台会自动生成规范国标ID。
        </div>
      </el-form-item>
      <!-- <el-form-item v-if="checkVisible(deviceEnum.Resource)" class="full-row" label="配置资源包:" :prop="deviceEnum.Resource">
        <resource ref="resourceForm" v-model="videoForm.resource" :device-id="deviceId" @loaded="$emit('loaded')" />
      </el-form-item> -->
      <el-form-item v-if="checkVisible(deviceEnum.Resource)" class="full-row" label="服务配置:" :prop="deviceEnum.Resource">
        <service-config
          ref="serviceConfig"
          v-model="videoForm.resource"
          :config-mode="isEdit ? configModeEnum.Edit : configModeEnum.Create"
          :tabs="[resourceTypeEnum.Video, resourceTypeEnum.AI]"
          :device-id="deviceForm.deviceId"
          :device-type="deviceForm.deviceType"
          :channel-size="videoForm.deviceChannelSize"
          :device-stream-size="videoForm.deviceStreamSize"
        />
      </el-form-item>
    <!-- <div v-adaptive-hiding="adaptiveHideTag" class="show-more" :class="{ 'show-more--expanded': showMore }">
      <el-form-item>
        <el-button class="show-more--btn" type="text" @click="showMore = !showMore">更多<i class="el-icon-arrow-down" /></el-button>
      </el-form-item>
      <div class="show-more--form" :class="{ adaptiveHideTag }">
        <el-form-item v-if="checkVisible(deviceEnum.Tags)" label="视频标签:" :prop="deviceEnum.Tags">
          <tags v-model="videoForm.tags" class="tags" />
        </el-form-item>
      </div>
    </div> -->
    </div>
  </el-form>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { DeviceEnum, InTypeEnum, InVideoProtocolEnum, DeviceTypeEnum, InNetworkTypeEnum } from '@vss/device/enums/index'
import { ResourceTypeEnum, ConfigModeEnum } from '@vss/device/enums/billing'
import { InVideoProtocolModelMapping, InVideoProtocolByDeviceType, DeviceVendor, InType, DeviceStreamSize, DeviceStreamPullIndex, VersionByInVideoProtocol } from '@vss/device/dicts'
import { Device, DeviceBasic, VideoDevice, DeviceBasicForm, VideoDeviceForm } from '@vss/device/type/Device'
import { DeviceTips } from '@vss/device/dicts/tips'
import { validGbId } from '@vss/device/api/device'
import { checkVideoVisible } from '@vss/device/utils/param'
import CertificateSelect from '@vss/device/components/CertificateSelect.vue'
import Tags from '@vss/device/components/Tags.vue'
import Resource from '@vss/device/components/Resource/index.vue'
import ServiceConfig from '@vss/device/components/ServiceConfig/index.vue'

@Component({
  name: 'VideoCreateForm',
  components: {
    CertificateSelect,
    Tags,
    Resource,
    ServiceConfig
  }
})
export default class extends Vue {
  @Prop() private device: Device
  @Prop({ default: {} }) private deviceForm: DeviceBasicForm
  @Prop({ default: false }) private isIbox: boolean
  @Prop({ default: false }) private isEdit: boolean
  public videoForm: VideoDeviceForm = {}
  private deviceEnum = DeviceEnum
  private deviceTypeEnum = DeviceTypeEnum
  private inVideoProtocolEnum = InVideoProtocolEnum
  private inNetworkTypeEnum = InNetworkTypeEnum
  private resourceTypeEnum = ResourceTypeEnum
  private configModeEnum = ConfigModeEnum
  private tips = DeviceTips
  private deviceVendor = DeviceVendor
  private inVideoProtocolByDeviceType = InVideoProtocolByDeviceType
  private inType = InType
  private deviceStreamSize = DeviceStreamSize
  private deviceStreamPullIndex = DeviceStreamPullIndex
  private versionByInVideoProtocol = VersionByInVideoProtocol
  private showMore = false
  private adaptiveHideTag = 'adaptiveHideTag'
  private minChannelSize = 1
  private passwordPlaceholder = ''
  private rules = {
    [DeviceEnum.InVideoProtocol]: [
      { required: true, message: '请选择接入协议', trigger: 'change' }
    ],
    [DeviceEnum.VideoVendor]: [
      { required: true, message: '请选择厂商', trigger: 'change' }
    ],
    [DeviceEnum.DeviceChannelSize]: [
      { required: true, message: '请填写子设备数量', trigger: 'blur' },
      { validator: this.validateDeviceChannelSize, trigger: 'blur' }
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
    [DeviceEnum.Resource]: [
      { validator: this.validateResource, trigger: 'change' }
    ],
    [DeviceEnum.OutId]: [
      { validator: this.validateGbId, trigger: 'blur' }
    ]
  }

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return (this.device && this.device.device) || {} as DeviceBasic
  }

  // 设备ID
  private get deviceId() {
    return this.basicInfo && this.basicInfo.deviceId
  }

  // 设备通道数量初始值
  private get orginalChannelSize() {
    return this.basicInfo && this.basicInfo.deviceChannelSize
  }

  // 视频接入协议
  private get inVideoProtocol() {
    return this.device && this.device.videos && this.device.videos.length && this.device.videos[0].inVideoProtocol
  }

  // 视频接入信息
  private get videoInfo(): VideoDevice {
    return (this.inVideoProtocol && this.device.videos[0][InVideoProtocolModelMapping[this.inVideoProtocol]]) || {} as VideoDevice
  }

  @Watch('device', {
    immediate: true
  })
  private onDeviceChange() {
    this.videoForm = {
      [DeviceEnum.InVideoProtocol]: this.inVideoProtocol || InVideoProtocolEnum.Gb28181,
      [DeviceEnum.VideoVendor]: this.basicInfo.deviceVendor,
      [DeviceEnum.InVersion]: this.videoInfo.inVersion || '2016',
      [DeviceEnum.DeviceChannelSize]: this.basicInfo.deviceChannelSize || 1,
      [DeviceEnum.InUserName]: this.videoInfo.inUserName,
      [DeviceEnum.InType]: this.videoInfo.inType || InTypeEnum.Pull,
      [DeviceEnum.PullUrl]: this.videoInfo.pullUrl,
      [DeviceEnum.UserName]: this.videoInfo.userName,
      [DeviceEnum.Password]: this.videoInfo.password,
      [DeviceEnum.EnabledGB35114]: this.videoInfo.enabledGB35114,
      [DeviceEnum.EnableDomain]: this.videoInfo.enableDomain || 2,
      [DeviceEnum.DeviceDomain]: this.videoInfo.deviceDomain,
      [DeviceEnum.DeviceIp]: this.videoInfo.deviceIp,
      [DeviceEnum.DevicePort]: +this.videoInfo.devicePort === 0 ? null : this.videoInfo.devicePort,
      [DeviceEnum.DeviceStreamSize]: this.videoInfo.deviceStreamSize || 1,
      [DeviceEnum.DeviceStreamAutoPull]: this.videoInfo.deviceStreamAutoPull || 1,
      [DeviceEnum.DeviceStreamPullIndex]: this.videoInfo.deviceStreamPullIndex || 1,
      [DeviceEnum.PushType]: this.videoInfo.pushType || '1',
      [DeviceEnum.StreamTransProtocol]: this.videoInfo.streamTransProtocol || 'tcp',
      [DeviceEnum.OutId]: this.videoInfo.outId,
      [DeviceEnum.Tags]: this.videoInfo.tags,
      [DeviceEnum.Resource]: { video: [], aI: [] }
    }
    
    if (this.isEdit) {
      // 编辑模式下RTSP密码不必填
      this.rules.password = []
      this.passwordPlaceholder = '••••••'
      // 编辑模式下，最小子通道为编辑前通道数
      this.minChannelSize = this.basicInfo.deviceChannelSize
    }
  }

  /**
   * 设备类型变化
   */
  @Watch('deviceForm.deviceType')
  private deviceTypeChange() {
    this.videoForm.inVideoProtocol = InVideoProtocolEnum.Gb28181
  }

  /**
   * 校验video表单
   */
  public validateVideoForm() {
    const videoForm: any = this.$refs.videoForm
    return new Promise((resolve) => {
      videoForm.validate((valid) => {
        resolve(valid)
      })
    })
  }

  /**
   * 多码流特殊处理
   */
  private checkDeviceStreamDisabled(key) {
    let checkFlag = false
    // 在选择视频接入协议为“ehome”的时候，不使用三码流
    if (this.videoForm.inVideoProtocol === InVideoProtocolEnum.Ehome) {
      if (this.deviceForm.deviceType === DeviceTypeEnum.Nvr && +key === 3) {
        checkFlag = true
      }
    }

    // 在选择厂商类型为“其他”的时候，仅能使用单码流
    if (this.videoForm.inVideoProtocol === InVideoProtocolEnum.Rtsp) {
      if (this.videoForm[DeviceEnum.VideoVendor] === '其他' && +key > 1) {
        checkFlag = true
      }
    }

    return checkFlag
  }

  /**
   * 厂商变化
   */
  private videoVendorChange() {
    // 重置主子码流数量
    this.videoForm.deviceStreamSize = 1
    // 重置自动拉取码流
    this.videoForm.deviceStreamPullIndex = 1
  }

  /**
   * 视频接入协议变化
   */
  private inVideoProtocolChange(val) {
    this.$emit('inVideoProtocolChange', val)
    // 重置vendor
    this.videoForm.videoVendor = ''
    // 重置主子码流数量
    this.videoForm.deviceStreamSize = 1
    // 重置自动拉取码流
    this.videoForm.deviceStreamPullIndex = 1
    // 重置version
    const versionMap = VersionByInVideoProtocol[this.videoForm.inVideoProtocol]
    versionMap && (this.videoForm.inVersion = Object.values(versionMap)[0] as string)
    // Temp Commit
    if (this.videoForm.inVideoProtocol === InVideoProtocolEnum.Rtmp) {
      this.videoForm.inType = 'push'
    }

    if (this.videoForm.inVideoProtocol === InVideoProtocolEnum.Rtsp) {
      this.videoForm.inType = 'pull'
    }

    // 重置验证
    const videoForm: any = this.$refs.videoForm
    videoForm.clearValidate()
  }

  /**
   * 码流数变化回调
   */
  private onDeviceStreamSizeChange() {
    if (this.videoForm.deviceStreamSize < this.videoForm.deviceStreamPullIndex) {
      this.videoForm.deviceStreamPullIndex = this.videoForm.deviceStreamSize
    }
  }å

  /**
   * 判断是否显示form-item
   */
  private checkVisible(prop) {
    return checkVideoVisible.call(
      {
        ...this.basicInfo,
        ...this.videoForm,
        isEdit: this.isEdit,
        isIbox: this.isIbox
      }, 
      this.deviceForm.deviceType,
      this.videoForm.inVideoProtocol,
      prop
    )
  }

  /**
   * 判断需要禁用的协议类型
   * EHOME暂不支持RTMP, EHOME协议
   */
  private checkInVideoProtocolDisabled(value) {
    if (this.isIbox) {
      return [InVideoProtocolEnum.Rtmp, InVideoProtocolEnum.Ehome].includes(value)
    }
    return false
  }

  /**
   * 编辑状态时生成提示信息
   */
  public beforeSubmit(submit: Function) {
    const resourceForm = this.$refs.resourceForm as Resource
    resourceForm.beforeSubmit(submit, this.basicInfo.deviceChannelSize, this.orginalChannelSize)
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

  // /**
  //  * 校验资源包
  //  */
  // public validateResource(rule: any, value: string, callback: Function) {
  //   const resourceForm = this.$refs.resourceForm as Resource
  //   const res = resourceForm.validate(this.videoForm.deviceChannelSize, this.orginalChannelSize)
  //   if (!res.result) {
  //     callback(new Error(res.message))
  //   } else {
  //     callback()
  //   }
  // }

  /**
   * 校验服务配置
   */
  public async validateResource(rule: any, value: string, callback: Function) {
    const serviceConfig = this.$refs.serviceConfig as any
    const valid = await serviceConfig.validateServiceConfig()
    if (valid) {
      callback(valid)
    } else {
      callback()
    }
  }

  /**
   * 校验设备IP格式
   */
  public validateDeviceIp(rule: any, value: string, callback: Function) {
    if (value && !/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(value)) {
      callback('')
    } else {
      callback()
    }
  }

  /**
   * 校验端口号
   */
  public validateDevicePort(rule: any, value: number, callback: Function) {
    if (value && !/^[0-9]+$/.test(value.toString())) {
      callback(new Error('设备端口仅支持数字'))
    } else if (value === 0) {
      callback(new Error('设备端口号不能为0'))
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
          [DeviceEnum.InVideoProtocol]: this.videoForm.inVideoProtocol,
          // [DeviceEnum.OutId]: this.videoForm.outId
          gbId: this.videoForm.outId
        })
        if (validInfo && !validInfo.isValidGbId) {
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

  /**
   * 校验子设备数量
   */
  public validateDeviceChannelSize(rule: any, value: number, callback: Function) {
    if (value && !/^[0-9]+$/.test(value.toString())) {
      callback(new Error('子设备数量仅支持整数'))
    } else if (this.isIbox && value > 16) {
      callback(new Error('子设备数量仅支持16路及以下'))
    } else {
      callback()
    }
  }
}
</script>
