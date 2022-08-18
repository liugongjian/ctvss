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
            <el-form-item label="设备名称:" prop="deviceName" class="form-with-tip">
              <el-input v-model="deviceForm.deviceName" />
              <div class="form-tip">
                2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。
              </div>
            </el-form-item>
            <el-form-item label="设备分类:" prop="deviceType">
              <el-select
                v-model="deviceForm.deviceType"
                placeholder="请选择"
              >
                <el-option
                  v-for="(value, key) in deviceType"
                  :key="key"
                  :label="value"
                  :value="key"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="接入类型:" prop="deviceInType">
              <el-radio v-for="(value, key) in deviceInType" :key="key" v-model="deviceForm.deviceInType" :label="key">{{ value }}</el-radio>
            </el-form-item>
            <el-form-item prop="inNetworkType">
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
                <el-radio label="public">互联网</el-radio>
                <el-radio label="private">专线网络</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item prop="outNetworkType">
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
                <el-radio label="public">互联网</el-radio>
                <el-radio label="private">专线网络</el-radio>
              </el-radio-group>
            </el-form-item>
            <div v-if="deviceForm.deviceInType !== 'viid'">
              <div class="form-title">视频接入信息</div>
              <video-create-form ref="videoForm" :device-form="deviceForm" />
            </div>
            <div v-if="deviceForm.deviceInType !== 'video'">
              <div class="form-title">视图接入信息</div>
              <viid-create-form ref="viidForm" />
            </div>
          </div>
          <div v-show="activeStep === 1">
            <el-form-item label="经纬度:" prop="longlat">
              <el-input v-model="deviceForm.deviceLongitude" class="longlat-input" /> :
              <el-input v-model="deviceForm.deviceLatitude" class="longlat-input" />
            </el-form-item>
            <el-form-item label="厂商:" prop="deviceVendor">
              <el-select v-model="deviceForm.deviceVendor">
                <el-option
                  v-for="item in deviceVendor"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-loading="loading.region" prop="region" class="form-with-tip">
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
            <el-form-item label="设备地址:" prop="inOrgRegion">
              <address-cascader
                :code="deviceForm.inOrgRegion"
                :level="deviceForm.inOrgRegionLevel"
                @change="onDeviceAddressChange"
              />
            </el-form-item>
            <el-form-item label="所属行业:" prop="industryCode">
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
            <el-form-item label="网络标识:" prop="networkCode">
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
            <el-form-item label="设备描述:" prop="description">
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
import { Component, Vue } from 'vue-property-decorator'
import { DeviceType, DeviceInType, DeviceVendor, IndustryMap, NetworkMap } from '../../dicts/index'
import { DeviceAddress } from '../../type/Device'
import { getRegions } from '../../api/region'
import AddressCascader from '../AddressCascader.vue'
import VideoCreateForm from '../VideoCreateForm.vue'
import ViidCreateForm from '../ViidCreateForm.vue'
import { DeviceTips } from '../../dicts/tips'
import { createDevice, updateDevice, getDevice, validGbId, createViewLib, getViewLibInfo, updateViewLib } from '../../api/device'

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
  private deviceType = DeviceType
  private deviceInType = DeviceInType
  private deviceVendor = DeviceVendor
  private industryMap = IndustryMap
  private networkMap = NetworkMap
  private breadCrumbContent = '添加设备'
  private activeStep: number = 0
  private deviceForm = {
    // step0
    deviceName: '',
    deviceType: 'ipc',
    deviceInType: 'videoAndViid',
    inNetworkType: 'public',
    outNetworkType: 'public',
    // step1
    longlat: 'required',
    deviceLongitude: '0.000000',
    deviceLatitude: '0.000000',
    deviceVendor: '',
    region: '',
    inOrgRegion: '',
    inOrgRegionLevel: null,
    industryCode: '',
    networkCode: '7',
    description: ''
  }
  private videoForm: {}
  private viidForm: {}
  private rules = {
    // ipc
    deviceName: [
      { required: true, message: '请输入设备名称', trigger: 'blur' },
      { validator: this.validateDeviceName, trigger: 'blur' }
    ],
    deviceType: [
      { required: true, message: '请选择设备类型', trigger: 'change' }
    ],
    longlat: [
      { required: true, message: '请选择经纬度', trigger: 'blur' },
      { validator: this.validateLonglat, trigger: 'blur' }
    ],
    deviceVendor: [
      { required: true, message: '请选择厂商', trigger: 'change' }
    ],
    region: [
      { required: true, message: '请选择区域', trigger: 'change' }
    ],
    inOrgRegion: [
      { required: true, message: '请选择设备地址', trigger: 'change' }
    ],
    industryCode: [
      { required: true, message: '请选择所属行业', trigger: 'blur' }
    ],
    networkCode: [
      { required: true, message: '请选择网络标识', trigger: 'blur' }
    ],

    // channel
    channelName: [
      { required: true, message: '请输入通道名称', trigger: 'blur' },
      { validator: this.validateDeviceName, trigger: 'blur' }
    ],
    channelSize: [
      { required: true, message: '请填写子设备数量', trigger: 'blur' }
    ],
    channelNum: [
      { required: true, message: '请填写通道号', trigger: 'change' },
      { validator: this.validateChannelNum, trigger: 'change' }
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

  private mounted() {
    this.getRegionList()
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
      let validArr = ['deviceName', 'deviceType']
      deviceForm.validateField(validArr, (err) => {
        if (err !== '') {
          validFlag = false
        }
      })
      // 校验videoForm
      const videoForm: any = this.$refs.videoForm
      if (videoForm) {
        validFlag = videoForm.validateVideoForm() && validFlag
        this.videoForm = videoForm.videoForm
      }
      // 校验viidForm
      const viidForm: any = this.$refs.viidForm
      if (viidForm) {
        validFlag = viidForm.validateViidForm() && validFlag
        this.viidForm = viidForm.viidForm
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
      'deviceVendor',
      'region',
      'inOrgRegion',
      'industryCode',
      'networkCode'
    ]
    form.validateField(validArr, (err) => {
      if (err !== '') {
        validFlag = false
      }
    })
    // 判断校验结果
    if (validFlag) {
      console.log({
        ...this.deviceForm,
        videoForm: this.videoForm,
        viidForm: this.viidForm
      })
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
