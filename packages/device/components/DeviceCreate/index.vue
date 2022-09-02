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
              <el-input v-model="deviceForm[deviceEnum.DeviceName]" />
              <div class="form-tip">
                2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。
              </div>
            </el-form-item>
            <el-form-item label="设备分类:" :prop="deviceEnum.DeviceType">
              <el-select
                v-model="deviceForm[deviceEnum.DeviceType]"
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
            <el-form-item label="接入方式:" :prop="deviceEnum.DeviceInType">
              <el-radio
                v-for="(value, key) in deviceInType[deviceForm[deviceEnum.DeviceType]]"
                :key="key"
                v-model="deviceForm[deviceEnum.DeviceInType]"
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
              <el-radio-group v-model="deviceForm[deviceEnum.InNetworkType]">
                <el-radio
                  v-for="(value, key) in inNetworkType"
                  :key="key"
                  :label="key"
                >
                  {{ value }}
                </el-radio>
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
              <el-radio-group v-model="deviceForm[deviceEnum.OutNetworkType]">
                <el-radio
                  v-for="(value, key) in outNetworkType"
                  :key="key"
                  :label="key"
                >
                  {{ value }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <div v-show="deviceForm[deviceEnum.DeviceInType] !== deviceInTypeEnum.Viid">
              <div class="form-title">视频接入信息</div>
              <video-create-form
                ref="videoForm"
                :device-form="deviceForm"
                @inVideoProtocolChange="inVideoProtocolChange"
              />
            </div>
            <div v-show="deviceForm[deviceEnum.DeviceInType] !== deviceInTypeEnum.Video">
              <div class="form-title">视图接入信息</div>
              <viid-create-form
                ref="viidForm"
                :device-form="deviceForm"
              />
            </div>
          </div>
          <div v-show="activeStep === 1">
            <el-form-item label="经纬度:" :prop="deviceEnum.Longlat">
              <el-input v-model="deviceForm[deviceEnum.DeviceLongitude]" class="longlat-input" /> :
              <el-input v-model="deviceForm[deviceEnum.DeviceLatitude]" class="longlat-input" />
            </el-form-item>
            <el-form-item label="厂商:" :prop="deviceEnum.DeviceVendor">
              <el-select v-model="deviceForm[deviceEnum.DeviceVendor]" :disabled="videoForm[deviceEnum.InVideoProtocol] === inVideoProtocolEnum.Rtsp">
                <el-option
                  v-for="(value, key) in deviceVendor[videoForm[deviceEnum.InVideoProtocol]]"
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
              <region-cascader v-model="deviceForm[deviceEnum.Region]" />
            </el-form-item>
            <el-form-item label="设备地址:" :prop="deviceEnum.InOrgRegion">
              <address-cascader
                :code="deviceForm[deviceEnum.InOrgRegion]"
                :level="deviceForm[deviceEnum.InOrgRegionLevel]"
                @change="onDeviceAddressChange"
              />
            </el-form-item>
            <el-form-item label="所属行业:" :prop="deviceEnum.IndustryCode">
              <el-select
                v-model="deviceForm[deviceEnum.IndustryCode]"
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
                v-model="deviceForm[deviceEnum.NetworkCode]"
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
                  <el-input v-model="deviceForm[deviceEnum.DeviceIp]" />
                </el-form-item>
                <el-form-item v-if="checkVisible(deviceEnum.DevicePort)" label="设备端口:" :prop="deviceEnum.DevicePort">
                  <el-input v-model="deviceForm[deviceEnum.DevicePort]" />
                </el-form-item>
                <el-form-item v-if="checkVisible(deviceEnum.DevicePoleId)" label="杆号:" :prop="deviceEnum.DevicePoleId">
                  <el-input v-model="deviceForm[deviceEnum.DevicePoleId] " />
                </el-form-item>
                <el-form-item v-if="checkVisible(deviceEnum.DeviceMac)" label="设备MAC地址:" :prop="deviceEnum.DeviceMac">
                  <el-input v-model="deviceForm[deviceEnum.DeviceMac]" />
                </el-form-item>
                <el-form-item v-if="checkVisible(deviceEnum.DeviceSerialNumber)" label="设备SN码:" :prop="deviceEnum.DeviceSerialNumber">
                  <el-input v-model="deviceForm[deviceEnum.DeviceSerialNumber]" />
                </el-form-item>
                <el-form-item v-if="checkVisible(deviceEnum.DeviceModel)" label="设备型号:" :prop="deviceEnum.DeviceModel">
                  <el-input v-model="deviceForm[deviceEnum.DeviceModel]" />
                </el-form-item>
              </div>
            </div>
            <el-form-item label="设备描述:" :prop="deviceEnum.Description">
              <el-input
                v-model="deviceForm[deviceEnum.Description]"
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
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { pick } from 'lodash'
import { DeviceType, DeviceInTypeByDeviceType, DeviceVendor, IndustryMap, NetworkMap, InVideoProtocolModelMapping, InViidProtocolModelMapping, InNetworkType, OutNetworkType } from '../../dicts/index'
import { checkVideoVisible } from '../../utils/param'
import { DeviceTips } from '../../dicts/tips'
import { DeviceEnum, InVideoProtocolEnum, DeviceTypeEnum, DeviceInTypeEnum, InViidProtocolEnum, InNetworkTypeEnum, OutNetworkTypeEnum } from '../../enums/index'
import { InVideoProtocolAllowParams, InViidProtocolCreateParams } from '../../settings'
import { createDevice } from '../../api/device'
import VideoCreateForm from '../Form/VideoCreateForm.vue'
import ViidCreateForm from '../Form/ViidCreateForm.vue'
import deviceFormMixin from '../../mixin/deviceFormMixin'

@Component({
  name: 'DeviceCreate',
  components: {
    VideoCreateForm,
    ViidCreateForm
  }
})
export default class extends Mixins(deviceFormMixin) {
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
  private inNetworkType = InNetworkType
  private outNetworkType = OutNetworkType
  private breadCrumbContent = '添加设备'
  private inVideoProtocol = InVideoProtocolEnum.Gb28181
  private activeStep: number = 0
  private showMore: boolean = false
  private showMoreVisable: boolean = false
  public deviceForm = {
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

  @Watch(`videoForm[${DeviceEnum.VideoVendor}]`)
  private vendorChange(val) {
    this.deviceForm[DeviceEnum.DeviceVendor] = val
  }

  private updated() {
    this.checkIsShwoMore()
  }

  /**
   * 判断是否显示form-item
   */
  private checkVisible(prop) {
    return checkVideoVisible.call(this.videoForm, this.deviceForm[DeviceEnum.DeviceType], this.inVideoProtocol, prop)
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
    this.deviceForm[DeviceEnum.DeviceInType] = DeviceInTypeEnum.Video
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
      if (this.deviceForm[DeviceEnum.DeviceInType] !== this.deviceInTypeEnum.Viid) {
        validFlag = videoFormObj.validateVideoForm() && validFlag
        this.videoForm = videoFormObj.videoForm
      }
      // 校验viidForm
      const viidFormObj: any = this.$refs.viidForm
      if (this.deviceForm[DeviceEnum.DeviceInType] !== this.deviceInTypeEnum.Video) {
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
        resource: this.videoForm[DeviceEnum.Resources]
      }
      // 补充视频接入信息
      if (this.deviceForm[DeviceEnum.DeviceInType] !== this.deviceInTypeEnum.Viid) {
        params.videos = {
          ...pick(this.videoForm, [
            DeviceEnum.InVideoProtocol
          ])
        }
        // 补充协议信息
        params.videos[InVideoProtocolModelMapping[this.videoForm[DeviceEnum.InVideoProtocol]]] = {
          ...pick(this.videoForm, [...InVideoProtocolAllowParams[this.videoForm[DeviceEnum.InVideoProtocol]]])
        }
      }
      // 补充视图接入信息
      if (this.deviceForm[DeviceEnum.DeviceInType] !== this.deviceInTypeEnum.Viid) {
        params.viids = {
          ...pick(this.viidForm, [
            DeviceEnum.InViidProtocol
          ])
        }
        // 补充协议信息
        params.viids[InViidProtocolModelMapping[this.viidForm[DeviceEnum.InViidProtocol]]] = {
          ...pick(this.viidForm, [...InViidProtocolCreateParams[this.viidForm[DeviceEnum.InViidProtocol]]])
        }
      }
    }
  }

  private back() {
    this.$router.push({ name: 'DeviceList' })
  }
}
</script>
