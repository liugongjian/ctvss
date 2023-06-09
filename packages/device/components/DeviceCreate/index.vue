<template>
  <div class="device-container">
    <div class="create-wrap">
      <div class="create-wrap__header">
        <el-page-header :content="breadCrumbContent" @back="back" />
        <div class="process">
          <el-steps :active="activeStep" finish-status="success" simple>
            <el-step title="接入配置"><span slot="icon">1</span></el-step>
            <el-step title="设备配置"><span slot="icon">2</span></el-step>
          </el-steps>
        </div>
      </div>
      <div ref="formContainer" class="create-wrap__body">
        <el-form
          ref="deviceForm"
          class="create-wrap__body__form"
          :rules="rules"
          :model="deviceForm"
          label-position="right"
          label-width="165px"
        >
          <div v-show="activeStep === 0">
            <el-form-item label="设备名称:" :prop="deviceEnum.DeviceName" class="form-with-tip">
              <el-input v-model="deviceForm.deviceName" />
              <div class="form-tip">
                2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。
              </div>
            </el-form-item>
            <el-form-item label="设备分类:" :prop="deviceEnum.DeviceType">
              <el-select
                v-model="deviceForm.deviceType"
                placeholder="请选择"
                @change="deviceTypeChange"
              >
                <el-option
                  v-for="(value, key) in deviceType"
                  :key="key"
                  :label="value"
                  :value="key"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="checkVisible(deviceEnum.DeviceInType) || checkVisible(deviceEnum.DeviceInTypeRadio)" label="接入方式:" :prop="deviceEnum.DeviceInType">
              <el-radio-group v-if="checkVisible(deviceEnum.DeviceInTypeRadio)" v-model="deviceForm.deviceInType[0]">
                <el-radio
                  v-for="(value, key) in deviceInType[deviceForm.deviceType]"
                  :key="key"
                  :label="key"
                >
                  {{ value }}
                </el-radio>
              </el-radio-group>
              <el-checkbox-group v-if="checkVisible(deviceEnum.DeviceInType)" v-model="deviceForm.deviceInType" :min="1">
                <el-checkbox
                  v-for="(value, key) in deviceInType[deviceForm.deviceType]"
                  :key="key"
                  :label="key"
                >
                  {{ value }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item :prop="deviceEnum.InNetworkType">
              <template slot="label">
                接入网络:
                <el-popover
                  placement="top-start"
                  width="300"
                  trigger="hover"
                  :open-delay="300"
                  content="设备接入的网络类型"
                >
                  <svg-icon slot="reference" class="form-question" name="help" />
                </el-popover>
              </template>
              <el-radio-group v-model="deviceForm.inNetworkType">
                <el-radio
                  v-for="(value, key) in inNetworkType"
                  :key="key"
                  :label="key"
                >
                  {{ value }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <div v-show="deviceForm.deviceInType.includes(deviceInTypeEnum.Video)">
              <div class="form-title">视频接入信息</div>
              <video-create-form
                ref="videoForm"
                :device-form="deviceForm"
                :is-ibox="isIbox"
                @inVideoProtocolChange="inVideoProtocolChange"
              />
            </div>
            <div v-if="checkVisible(deviceEnum.Viids)" v-show="deviceForm.deviceInType.includes(deviceInTypeEnum.Viid)">
              <div class="form-title">视图接入信息</div>
              <viid-create-form
                ref="viidForm"
                :device-form="deviceForm"
              />
            </div>
          </div>
          <div v-show="activeStep === 1">
            <el-form-item label="经纬度:" :prop="deviceEnum.Longlat">
              <el-input v-model="deviceForm.deviceLongitude" class="longlat-input" /> :
              <el-input v-model="deviceForm.deviceLatitude" class="longlat-input" />
            </el-form-item>
            <el-form-item label="厂商:" :prop="deviceEnum.DeviceVendor">
              <el-select v-model="deviceForm.deviceVendor" :disabled="videoForm.inVideoProtocol === inVideoProtocolEnum.Rtsp">
                <el-option
                  v-for="(value, key) in deviceVendorList"
                  :key="key"
                  :label="value"
                  :value="key"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="checkVisible(deviceEnum.Region)" :prop="deviceEnum.Region" class="form-with-tip">
              <template slot="label">
                接入区域:
                <el-popover
                  placement="top-start"
                  title="接入区域"
                  width="400"
                  trigger="hover"
                  :open-delay="300"
                  :content="tips.region"
                >
                  <svg-icon slot="reference" class="form-question" name="help" />
                </el-popover>
              </template>
              <region-cascader v-model="deviceForm.region" />
            </el-form-item>
            <el-form-item label="设备地址:" :prop="deviceEnum.InOrgRegion">
              <address-cascader
                :code="deviceForm.inOrgRegion"
                :level="deviceForm.inOrgRegionLevel"
                @change="onDeviceAddressChange"
              />
            </el-form-item>
            <el-form-item label="所属行业:" :prop="deviceEnum.IndustryCode">
              <el-select
                v-model="deviceForm.industryCode"
                placeholder="请选择所属行业"
              >
                <el-option
                  v-for="(value, key) in industryList"
                  :key="key"
                  :label="value.name"
                  :value="value.code"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="网络标识:" :prop="deviceEnum.NetworkCode">
              <el-select
                v-model="deviceForm.networkCode"
                placeholder="请选择网络标识"
              >
                <el-option
                  v-for="(value, key) in networkList"
                  :key="key"
                  :label="value.name"
                  :value="value.code"
                />
              </el-select>
            </el-form-item>
            <div v-adaptive-hiding="adaptiveHideTag" class="show-more" :class="{ 'show-more--expanded': showMore }">
              <el-form-item>
                <el-button class="show-more--btn" type="text" @click="showMore = !showMore">更多<i class="el-icon-arrow-down" /></el-button>
              </el-form-item>
              <div :class="{ adaptiveHideTag }" class="show-more--form">
                <el-form-item v-if="checkVisible(deviceEnum.DeviceIp)" label="设备IP:" :prop="deviceEnum.DeviceIp">
                  <el-input v-model="deviceForm.deviceIp" />
                </el-form-item>
                <el-form-item v-if="checkVisible(deviceEnum.DevicePort)" label="设备端口:" :prop="deviceEnum.DevicePort">
                  <el-input v-model.number="deviceForm.devicePort" />
                </el-form-item>
                <el-form-item v-if="checkVisible(deviceEnum.DevicePoleId)" label="杆号:" :prop="deviceEnum.DevicePoleId">
                  <el-input v-model="deviceForm.devicePoleId " />
                </el-form-item>
                <el-form-item v-if="checkVisible(deviceEnum.DeviceMac)" label="设备MAC地址:" :prop="deviceEnum.DeviceMac">
                  <el-input v-model="deviceForm.deviceMac" />
                </el-form-item>
                <el-form-item v-if="checkVisible(deviceEnum.DeviceSerialNumber)" label="设备SN码:" :prop="deviceEnum.DeviceSerialNumber">
                  <el-input v-model="deviceForm.deviceSerialNumber" />
                </el-form-item>
                <el-form-item v-if="checkVisible(deviceEnum.DeviceModel)" label="设备型号:" :prop="deviceEnum.DeviceModel">
                  <el-input v-model="deviceForm.deviceModel" />
                </el-form-item>
              </div>
            </div>
            <el-form-item label="设备描述:" :prop="deviceEnum.Description">
              <el-input
                v-model="deviceForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入设备描述，如设备用途"
              />
            </el-form-item>
          </div>
        </el-form>
      </div>
      <div class="create-wrap__footer">
        <div class="create-wrap__footer__tools">
          <el-button v-if="activeStep === 1 && !loading.submit" size="medium" type="primary" @click="stepChange(0)">上一步</el-button>
          <el-button v-if="activeStep === 0 && !loading.submit" size="medium" type="primary" @click="stepChange(1)">下一步</el-button>
          <el-button v-if="activeStep === 1" size="medium" type="primary" :loading="loading.submit" @click="submit">确 定</el-button>
          <el-button v-if="!loading.submit" size="medium" @click="back">取 消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch, Prop, Inject, Provide } from 'vue-property-decorator'
import { pick } from 'lodash'
import { DeviceType, DeviceInTypeByDeviceType, DeviceVendor, DefaultVendor, InVideoProtocolModelMapping, InViidProtocolModelMapping, InNetworkType, OutNetworkType } from '@vss/device/dicts/index'
import { DeviceModule } from '@vss/device/store/modules/device'
import { getIndustryList, getNetworkList } from '@vss/device/api/dict'
import { checkVideoVisible, checkViidVisible } from '@vss/device/utils/param'
import { DeviceTips } from '@vss/device/dicts/tips'
import { DeviceEnum, ToolsEnum, InVideoProtocolEnum, InViidProtocolEnum, DeviceTypeEnum, DeviceInTypeEnum, InNetworkTypeEnum, OutNetworkTypeEnum } from '@vss/device/enums/index'
import { InVideoProtocolAllowParams, InViidProtocolCreateParams } from '@vss/device/settings'
import { DeviceForm, DeviceBasicForm, VideoDeviceForm, ViidDeviceForm } from '@vss/device/type/Device'
import { createDevice, getDeviceRecentlyUsed } from '@vss/device/api/device'
import { previewAuthActions } from '@vss/device/api/dir'
import { UserModule } from '@/store/modules/user'
import VideoCreateForm from '@vss/device/components/Form/VideoCreateForm.vue'
import ViidCreateForm from '@vss/device/components/Form/ViidCreateForm.vue'
import deviceFormMixin from '@vss/device/mixin/deviceFormMixin'

@Component({
  name: 'DeviceCreate',
  components: {
    VideoCreateForm,
    ViidCreateForm
  }
})
export default class extends Mixins(deviceFormMixin) {
  @Inject('handleTools')
  private handleTools!: Function

  @Provide('getActions')
  public getActions() {
    console.log('provide', this.deviceActions)
    return this.deviceActions
  }
  
  @Prop({ default: () => createDevice }) private createDeviceApi: Function
  @Prop({ default: false }) private isIbox: boolean
  public deviceActions = null
  private tips = DeviceTips
  private deviceEnum = DeviceEnum
  private deviceTypeEnum = DeviceTypeEnum
  private deviceInTypeEnum = DeviceInTypeEnum
  private inVideoProtocolEnum = InVideoProtocolEnum
  private inViidProtocolEnum = InViidProtocolEnum
  private inNetworkTypeEnum = InNetworkTypeEnum
  private outNetworkTypeEnum = OutNetworkTypeEnum
  private deviceType = DeviceType
  private deviceInType = DeviceInTypeByDeviceType
  private industryList = null
  private networkList = null
  private inNetworkType = InNetworkType
  private outNetworkType = OutNetworkType
  private breadCrumbContent = '添加设备'
  private inVideoProtocol = InVideoProtocolEnum.Gb28181
  private inViidProtocol = InViidProtocolEnum.Ga1400
  private activeStep = 0
  private showMore = false
  private adaptiveHideTag = 'adaptiveHideTag'
  private deviceLoading = false
  public deviceForm: DeviceBasicForm = {
    // step0
    [DeviceEnum.DeviceName]: '',
    [DeviceEnum.DeviceType]: DeviceTypeEnum.Ipc,
    [DeviceEnum.DeviceInType]: [DeviceInTypeEnum.Video],
    [DeviceEnum.InNetworkType]: InNetworkTypeEnum.Public,
    [DeviceEnum.OutNetworkType]: OutNetworkTypeEnum.Public,
    // step1
    [DeviceEnum.Longlat]: 'required',
    [DeviceEnum.DeviceLongitude]: '0.000000',
    [DeviceEnum.DeviceLatitude]: '0.000000',
    [DeviceEnum.DeviceVendor]: '',
    [DeviceEnum.Region]: '',
    [DeviceEnum.InOrgRegion]: '',
    [DeviceEnum.InOrgRegionLevel]: null,
    [DeviceEnum.IndustryCode]: '',
    [DeviceEnum.NetworkCode]: '7',
    [DeviceEnum.Description]: '',
    [DeviceEnum.DeviceIp]: '',
    [DeviceEnum.DevicePort]: null,
    [DeviceEnum.DevicePoleId]: '',
    [DeviceEnum.DeviceMac]: '',
    [DeviceEnum.DeviceSerialNumber]: '',
    [DeviceEnum.DeviceModel]: ''
  }

  private videoForm: VideoDeviceForm = {}
  private viidForm: ViidDeviceForm = {}

  /**
   * 父级设备ID
   */
  private get parentDeviceId() {
    return this.$route.query.parentDeviceId && this.$route.query.parentDeviceId.toString()
  }

  /**
   * 根据接入方式和接入协议返回厂商列表
   */
  private get deviceVendorList() {
    return this.deviceForm.deviceInType.includes(this.deviceInTypeEnum.Video) ? DeviceVendor[this.videoForm.inVideoProtocol] : DeviceVendor[this.viidForm.inViidProtocol]
  }

  private get currentDirId() {
    return this.$route.query.dirId as string
  }

  private get formContainer() {
    return this.$refs.formContainer as any
  }

  @Watch('videoForm.videoVendor')
  private vendorChange(val) {
    this.deviceForm.deviceVendor = val
  }

  private async mounted() {
    if (this.isIbox) {
      this.deviceForm.deviceInType = [DeviceInTypeEnum.Video]
    }
    this.industryList = await DeviceModule.getIndutryList(getIndustryList)
    this.networkList = await DeviceModule.getNetworkList(getNetworkList)
    this.getLastDeviceBasicInfo()
    this.initIam()
  }

  private async initIam() {
    // 当前父级-IAM权限查询
    try {
      this.deviceLoading = true
      if (UserModule.iamUserId) {
        // 查询全路径
        const path: any = this.$route.query.path
        const pathArr = path ? path.split(',') : []
        const permissionRes = await previewAuthActions({
          targetResources: [{
            dirPath: pathArr.join('/'),
          }]
        })
        this.deviceActions = permissionRes.result[0].iamUser.actions
      }
    } finally {
      this.deviceLoading = false
    }
  }

  /**
   * 获取最后一次新建的设备基本信息
   */
  private async getLastDeviceBasicInfo() {
    const { device, region, industry } = await getDeviceRecentlyUsed()
    this.deviceForm = {
      ...this.deviceForm,
      [DeviceEnum.DeviceVendor]: DefaultVendor[device.deviceVendor] ? device.deviceVendor : '',
      [DeviceEnum.Region]: region,
      [DeviceEnum.IndustryCode]: industry.industryCode,
      [DeviceEnum.NetworkCode]: industry.networkCode,
      [DeviceEnum.InOrgRegion]: industry.inOrgRegion,
      [DeviceEnum.InOrgRegionLevel]: industry.inOrgRegionLevel,
    }
  }

  /**
   * 判断是否显示form-item
   */
  private checkVisible(prop) {
    if (this.deviceForm.deviceInType.includes(this.deviceInTypeEnum.Video)) {
      return checkVideoVisible.call({ ...this.videoForm, isIbox: this.isIbox }, this.deviceForm.deviceType, this.inVideoProtocol, prop)
    } else {
      return checkViidVisible.call(this.viidForm, this.deviceForm.deviceType, this.inViidProtocol, prop)
    }
  }

  /**
   * 设备类型变化
   * 设备分类为NVR，接入方式仅能选视频（默认选中视频）
   * 设备分类为Platform，接入方式默认取数组第一个元素
   */
  private deviceTypeChange() {
    if (this.deviceForm.deviceType === DeviceTypeEnum.Nvr) {
      this.deviceForm.deviceInType = [DeviceInTypeEnum.Video]
    } else if (this.deviceForm.deviceType === DeviceTypeEnum.Platform) {
      this.deviceForm.deviceInType = this.deviceForm.deviceInType.slice(0, 1)
    }
  }

  /**
   * 视频接入协议变化
   */
  private inVideoProtocolChange(val) {
    this.inVideoProtocol = val
  }

  /**
   * 切换创建步骤
   */
  private async stepChange(val: number) {
    this.formContainer.scrollTop = 0
    if (val === 0) {
      this.activeStep = val
    } else {
      let validFlag = true
      // 校验step1中deviceForm
      const deviceForm: any = this.$refs.deviceForm
      const validArr = [
        DeviceEnum.DeviceName,
        DeviceEnum.DeviceType
      ]
      deviceForm.validateField(validArr, (err) => {
        if (err !== '') {
          validFlag = false
        }
      })
      // 校验videoForm
      const videoFormObj: any = this.$refs.videoForm
      if (this.deviceForm.deviceInType.includes(this.deviceInTypeEnum.Video)) {
        validFlag = await videoFormObj.validateVideoForm() && validFlag
        this.videoForm = videoFormObj.videoForm
      }
      // 校验viidForm
      const viidFormObj: any = this.$refs.viidForm
      if (this.deviceForm.deviceInType.includes(this.deviceInTypeEnum.Viid)) {
        validFlag = await viidFormObj.validateViidForm() && validFlag
        this.viidForm = viidFormObj.viidForm
      }
      // 判断校验结果
      if (validFlag) this.activeStep = val
    }
  }

  /**
   * 提交
   */
  private async submit() {
    let validFlag = true
    // 校验step1中deviceForm
    const form: any = this.$refs.deviceForm
    const validArr = [
      DeviceEnum.Longlat,
      DeviceEnum.DeviceVendor,
      DeviceEnum.Region,
      DeviceEnum.InOrgRegion,
      DeviceEnum.IndustryCode,
      DeviceEnum.NetworkCode,
      DeviceEnum.DeviceIp,
      DeviceEnum.DevicePort,
      DeviceEnum.DevicePoleId,
      DeviceEnum.DeviceMac
    ]
    form.validateField(validArr, (err) => {
      if (err !== '') {
        validFlag = false
      }
    })
    // 判断校验结果
    if (validFlag) {
      const params: DeviceForm = {
        ...pick(this.deviceForm, [
          DeviceEnum.Region,
          DeviceEnum.InNetworkType,
          DeviceEnum.OutNetworkType
        ]),
        [DeviceEnum.Device]: {
          ...pick(this.deviceForm, [
            DeviceEnum.DeviceType,
            DeviceEnum.DeviceVendor,
            DeviceEnum.DeviceName,
            DeviceEnum.DeviceLongitude,
            DeviceEnum.DeviceLatitude,
            DeviceEnum.DeviceIp,
            DeviceEnum.DeviceMac,
            DeviceEnum.DevicePoleId,
            DeviceEnum.DeviceSerialNumber,
            DeviceEnum.DeviceModel,
            DeviceEnum.Description
          ]),
          ...pick(this.videoForm, [
            DeviceEnum.DeviceChannelSize
          ]),
          [DeviceEnum.DevicePort]: Number(this.deviceForm.devicePort),
          // 父级dirId
          [DeviceEnum.DirId]: this.currentDirId,
          // 父级设备ID
          [DeviceEnum.ParentDeviceId]: this.parentDeviceId
        },
        [DeviceEnum.Industry]: {
          ...pick(this.deviceForm, [
            DeviceEnum.InOrgRegion,
            DeviceEnum.InOrgRegionLevel,
            DeviceEnum.IndustryCode,
            DeviceEnum.NetworkCode
          ])
        },
        [DeviceEnum.Resource]: {
          ...this.videoForm.resource,
          ...this.viidForm.resource
        }
      }
      console.log(this.viidForm)
      // 补充视频接入信息
      if (this.deviceForm.deviceInType.includes(this.deviceInTypeEnum.Video)) {
        const videoDevice: VideoDeviceForm = {
          ...pick(this.videoForm, [
            DeviceEnum.InVideoProtocol
          ])
        }
        // 补充协议信息
        videoDevice[InVideoProtocolModelMapping[this.videoForm.inVideoProtocol]] = {
          ...pick(this.videoForm, [...InVideoProtocolAllowParams[this.videoForm.inVideoProtocol]])
        }
        // 删除视频中的Resource
        delete videoDevice[InVideoProtocolModelMapping[this.videoForm.inVideoProtocol]].resource
        params.videos = [videoDevice]
      }
      // 补充视图接入信息
      if (this.deviceForm.deviceInType.includes(this.deviceInTypeEnum.Viid)) {
        const viidDevice: ViidDeviceForm = {
          ...pick(this.viidForm, [
            DeviceEnum.InViidProtocol
          ])
        }
        // 补充协议信息
        viidDevice[InViidProtocolModelMapping[this.viidForm.inViidProtocol]] = {
          ...pick(this.viidForm, [...InViidProtocolCreateParams[this.viidForm.inViidProtocol]])
        }
        // 删除视图中的Resource
        delete viidDevice[InViidProtocolModelMapping[this.viidForm.inViidProtocol]].resource
        params.viids = [viidDevice]
      }
      this.loading.submit = true
      try {
        // 提交创建表单
        await this.createDeviceApi(params)
        this.$message.success('添加设备成功')
        this.handleTools(ToolsEnum.RefreshDirectory)
        this.handleTools(ToolsEnum.GoBack, 0)
      } catch (e) {
        this.$alertError(e.message)
      }
      this.loading.submit = false
    }
  }

  private back() {
    this.handleTools(ToolsEnum.GoBack, 0)
  }
}
</script>
