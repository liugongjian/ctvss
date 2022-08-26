<template>
  <div class="device-container">
    <div class="create-wrap">
      <div class="create-wrap__header">
        <el-page-header :content="breadCrumbContent" @back="back" />
        <div v-if="!isChannel" class="process">
          <el-steps :active="activeStep" finish-status="success" simple>
            <el-step title="接入配置"><span slot="icon">1</span></el-step>
            <el-step title="设备配置"><span slot="icon">2</span></el-step>
          </el-steps>
        </div>
      </div>
      <div class="create-wrap__body">
        <el-form
          ref="deviceForm"
          class="create-wrap__body__form"
          :rules="rules"
          :model="deviceForm"
          label-position="right"
          label-width="135px"
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
            <el-form-item label="接入类型:" :prop="deviceEnum.DeviceInType">
              <el-radio
                v-for="(value, key) in deviceInType[deviceForm.deviceType]"
                :key="key"
                v-model="deviceForm.deviceInType"
                :label="key"
              >
                {{ value }}
              </el-radio>
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
                <el-radio :label="inNetworkTypeEnum.Public">互联网</el-radio>
                <el-radio :label="inNetworkTypeEnum.Private">专线网络</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :prop="deviceEnum.OutNetworkType">
              <template slot="label">
                播放网络:
                <el-popover
                  placement="top-start"
                  width="300"
                  trigger="hover"
                  :open-delay="300"
                  content="视频调阅的网络类型"
                >
                  <svg-icon slot="reference" class="form-question" name="help" />
                </el-popover>
              </template>
              <el-radio-group v-model="deviceForm.outNetworkType">
                <el-radio :label="outNetworkTypeEnum.Public">互联网</el-radio>
                <el-radio :label="outNetworkTypeEnum.Private">专线网络</el-radio>
              </el-radio-group>
            </el-form-item>
            <div v-show="deviceForm.deviceInType !== deviceInTypeEnum.Viid">
              <div class="form-title">视频接入信息</div>
              <video-create-form
                ref="videoForm"
                :device-form="deviceForm"
                @inVideoProtocolChange="inVideoProtocolChange"
              />
            </div>
            <div v-show="deviceForm.deviceInType !== deviceInTypeEnum.Video">
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
                  v-for="(value, key) in deviceVendor[videoForm.inVideoProtocol]"
                  :key="key"
                  :label="value"
                  :value="key"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-loading="loading.region" :prop="deviceEnum.Region" class="form-with-tip">
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
              <el-cascader
                v-model="deviceForm.region"
                placeholder="请选择"
                :options="regionList"
              />
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
                  v-for="(value, key) in industryMap"
                  :key="key"
                  :label="value"
                  :value="key"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="网络标识:" :prop="deviceEnum.NetworkCode">
              <el-select
                v-model="deviceForm.networkCode"
                placeholder="请选择网络标识"
              >
                <el-option
                  v-for="(value, key) in networkMap"
                  :key="key"
                  :label="value"
                  :value="key"
                />
              </el-select>
            </el-form-item>
            <div v-show="showMoreVisable" class="show-more" :class="{'show-more--expanded': showMore}">
              <el-form-item>
                <el-button class="show-more--btn" type="text" @click="showMore = !showMore">更多<i class="el-icon-arrow-down" /></el-button>
              </el-form-item>
              <div ref="showMoreForm" class="show-more--form">
                <el-form-item v-if="checkVisible(deviceEnum.DeviceIp)" label="设备IP:" :prop="deviceEnum.DeviceIp">
                  <el-input v-model="deviceForm.deviceIp" />
                </el-form-item>
                <el-form-item v-if="checkVisible(deviceEnum.DevicePort)" label="设备端口:" :prop="deviceEnum.DevicePort">
                  <el-input v-model="deviceForm.devicePort" />
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
          <el-button v-if="activeStep === 1" size="medium" type="primary" @click="stepChange(0)">上一步</el-button>
          <el-button v-if="activeStep === 0" size="medium" type="primary" @click="stepChange(1)">下一步</el-button>
          <el-button v-if="activeStep === 1" size="medium" type="primary" :loading="loading.submit" @click="submit">确 定</el-button>
          <el-button size="medium" @click="back">取 消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { pick } from 'lodash'
import { DeviceType, DeviceInTypeByDeviceType, DeviceVendor, IndustryMap, NetworkMap, InVideoProtocolModelMapping, InViidProtocolModelMapping } from '../../dicts/index'
import { DeviceAddress } from '../../type/Device'
import { getRegions } from '../../api/region'
import { checkVideoVisible } from '../../utils/param'
import { DeviceTips } from '../../dicts/tips'
import { DeviceEnum, InVideoProtocolEnum, DeviceTypeEnum, DeviceInTypeEnum, InViidProtocolEnum, InNetworkTypeEnum, OutNetworkTypeEnum } from '../../enums/index'
import { InVideoProtocolAllowParams, InViidProtocolCreateParams } from '../../settings'
import { createDevice } from '../../api/device'
import AddressCascader from '../AddressCascader.vue'
import VideoCreateForm from '../Form/VideoCreateForm.vue'
import ViidCreateForm from '../Form/ViidCreateForm.vue'

@Component({
  name: 'DeviceCreate',
  components: {
    AddressCascader,
    VideoCreateForm,
    ViidCreateForm
  }
})
export default class extends Vue {
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
  private deviceVendor = DeviceVendor
  private industryMap = IndustryMap
  private networkMap = NetworkMap
  private breadCrumbContent = '添加设备'
  private inVideoProtocol = InVideoProtocolEnum.Gb28181
  private activeStep: number = 0
  private showMore: boolean = false
  private showMoreVisable: boolean = false
  private deviceForm = {
    // step0
    [DeviceEnum.DeviceName]: '',
    [DeviceEnum.DeviceType]: DeviceTypeEnum.Ipc,
    [DeviceEnum.DeviceInType]: DeviceInTypeEnum.VideoAndViid,
    [DeviceEnum.InNetworkType]: InNetworkTypeEnum.Public,
    [DeviceEnum.OutNetworkType]: OutNetworkTypeEnum.Public,
    // step1
    longlat: 'required',
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
    [DeviceEnum.DevicePort]: '',
    [DeviceEnum.DevicePoleId]: '',
    [DeviceEnum.DeviceMac]: '',
    [DeviceEnum.DeviceSerialNumber]: '',
    [DeviceEnum.DeviceModel]: ''
  }
  private videoForm: any = {}
  private viidForm: any = {}
  private rules = {
    [DeviceEnum.DeviceName]: [
      { required: true, message: '请输入设备名称', trigger: 'blur' },
      { validator: this.validateDeviceName, trigger: 'blur' }
    ],
    [DeviceEnum.DeviceType]: [
      { required: true, message: '请选择设备类型', trigger: 'change' }
    ],
    longlat: [
      { required: true, message: '请选择经纬度', trigger: 'blur' },
      { validator: this.validateLonglat, trigger: 'blur' }
    ],
    [DeviceEnum.DeviceVendor]: [
      { required: true, message: '请选择厂商', trigger: 'change' }
    ],
    [DeviceEnum.Region]: [
      { required: true, message: '请选择区域', trigger: 'change' }
    ],
    [DeviceEnum.InOrgRegion]: [
      { required: true, message: '请选择设备地址', trigger: 'change' }
    ],
    [DeviceEnum.IndustryCode]: [
      { required: true, message: '请选择所属行业', trigger: 'blur' }
    ],
    [DeviceEnum.NetworkCode]: [
      { required: true, message: '请选择网络标识', trigger: 'blur' }
    ],
    [DeviceEnum.DeviceIp]: [
      { validator: this.validateDeviceIp, trigger: 'blur' }
    ],
    [DeviceEnum.DevicePort]: [
      { validator: this.validateDevicePort, trigger: 'change' }
    ],
    [DeviceEnum.DevicePoleId]: [
      { validator: this.validatePoleId, trigger: 'blur' }
    ],
    [DeviceEnum.DeviceMac]: [
      { validator: this.validateMacAddr, trigger: 'blur' }
    ]
  }
  private regionList = []
  private loading = {
    submit: false,
    region: false
  }
  private get isChannel() {
    return false
  }

  @Watch('videoForm.videoVendor')
  private vendorChange(val) {
    this.deviceForm.deviceVendor = val
  }

  private mounted() {
    this.getRegionList()
  }

  private updated() {
    this.checkIsShwoMore()
  }

  /**
   * 判断是否显示form-item
   */
  private checkVisible(prop) {
    return checkVideoVisible.call(this.videoForm, this.deviceForm.deviceType, this.inVideoProtocol, prop)
  }

  /**
   * 判断是否显示更多下拉框
   */
  private checkIsShwoMore() {
    const showMoreForm = this.$refs.showMoreForm as HTMLDivElement
    this.showMoreVisable = showMoreForm.children.length !== 0
  }

  /**
   * 设备类型变化
   */
  private deviceTypeChange() {
    this.deviceForm.deviceInType = DeviceInTypeEnum.Video
  }

  /**
   * 视频接入协议变化
   */
  private inVideoProtocolChange(val) {
    this.inVideoProtocol = val
  }

  /**
   * 选择设备地址
   */
  public onDeviceAddressChange(region: DeviceAddress) {
    this.deviceForm.inOrgRegion = region.code
    this.deviceForm.inOrgRegionLevel = region.level
  }

  /**
   * 获取接入区域列表
   */
  private async getRegionList() {
    this.loading.region = true
    try {
      this.regionList = await getRegions()
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.region = false
    }
  }

  /**
   * 切换创建步骤
   */
  private stepChange(val: number) {
    if (val === 0) {
      this.activeStep = val
    } else {
      let validFlag: boolean = true
      // 校验step1中deviceForm
      const deviceForm: any = this.$refs.deviceForm
      let validArr = [
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
      if (this.deviceForm.deviceInType !== this.deviceInTypeEnum.Viid) {
        validFlag = videoFormObj.validateVideoForm() && validFlag
        this.videoForm = videoFormObj.videoForm
      }
      // 校验viidForm
      const viidFormObj: any = this.$refs.viidForm
      if (this.deviceForm.deviceInType !== this.deviceInTypeEnum.Video) {
        validFlag = viidFormObj.validateViidForm() && validFlag
        this.viidForm = viidFormObj.viidForm
      }
      // 判断校验结果
      if (validFlag) this.activeStep = val
    }
  }

  /**
   * 提交
   */
  private submit() {
    let validFlag: boolean = true
    // 校验step1中deviceForm
    const form: any = this.$refs.deviceForm
    let validArr = [
      'longlat',
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
      const params: any = {
        ...pick(this.deviceForm, [
          DeviceEnum.Region,
          DeviceEnum.InNetworkType,
          DeviceEnum.OutNetworkType
        ]),
        device: {
          ...pick(this.deviceForm, [
            DeviceEnum.DeviceType,
            DeviceEnum.DeviceVendor,
            DeviceEnum.DeviceName,
            DeviceEnum.DeviceLongitude,
            DeviceEnum.DeviceLatitude,
            DeviceEnum.DeviceIp,
            DeviceEnum.DevicePort,
            DeviceEnum.DeviceMac,
            DeviceEnum.DevicePoleId,
            DeviceEnum.DeviceSerialNumber,
            DeviceEnum.DeviceModel,
            DeviceEnum.Description
          ]),
          ...pick(this.videoForm, [
            DeviceEnum.DeviceChannelSize
          ])
        },
        industry: {
          ...pick(this.deviceForm, [
            DeviceEnum.IndustryCode,
            DeviceEnum.NetworkCode
          ])
        },
        resource: this.videoForm.resources
      }
      // 补充视频接入信息
      if (this.deviceForm.deviceInType !== this.deviceInTypeEnum.Viid) {
        params.videos = {
          ...pick(this.videoForm, [
            DeviceEnum.InVideoProtocol
          ])
        }
        // 补充协议信息
        params.videos[InVideoProtocolModelMapping[this.videoForm.inVideoProtocol]] = {
          ...pick(this.videoForm, [...InVideoProtocolAllowParams[this.videoForm.inVideoProtocol]])
        }
      }
      // 补充视图接入信息
      if (this.deviceForm.deviceInType !== this.deviceInTypeEnum.Viid) {
        params.viids = {
          ...pick(this.viidForm, [
            DeviceEnum.InViidProtocol
          ])
        }
        // 补充协议信息
        params.viids[InViidProtocolModelMapping[this.viidForm.inViidProtocol]] = {
          ...pick(this.viidForm, [...InViidProtocolCreateParams[this.viidForm.inViidProtocol]])
        }
      }
      console.log(params)
    }
  }

  private back() {
    this.$router.push({ name: 'DeviceList' })
  }

  /**
   * 校验设备/通道名称
   */
  public validateDeviceName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-()（）_\s]{2,64}$/.test(value)) {
      callback(new Error('设备或通道名称格式错误。2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。'))
    } else if (/^[\s]|[\s]$/.test(value)) {
      callback(new Error('不能以空格作为名称的首尾。'))
    } else {
      callback()
    }
  }

  /**
   * 校验经纬度
   */
  public validateLonglat(rule: any, value: string, callback: Function) {
    if (!this.deviceForm.deviceLongitude || !this.deviceForm.deviceLatitude) {
      callback(new Error('请填写经度及纬度坐标'))
    } else if (!/^[-+]?(0(\.\d{1,14})?|([1-9](\d)?)(\.\d{1,14})?|1[0-7]\d{1}(\.\d{1,14})?|180\.0{1,14})$/.test(this.deviceForm.deviceLongitude)) {
      callback(new Error('经度坐标格式错误'))
    } else if (!/^[-+]?((0|([1-9]\d?))(\.\d{1,14})?|90(\.0{1,14})?)$/.test(this.deviceForm.deviceLatitude)) {
      callback(new Error('纬度坐标格式错误'))
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
   * 校验通道号
   */
  public validateChannelNum(rule: any, value: string, callback: Function) {
    if (!/^[0-9]+$/.test(value)) {
      callback(new Error('设备号仅支持数字'))
    } else {
      callback()
    }
  }
}
</script>
