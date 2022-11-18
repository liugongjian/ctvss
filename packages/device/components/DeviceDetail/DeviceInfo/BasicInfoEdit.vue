<template>
  <div class="detail-wrap__edit">
    <el-form
      ref="deviceForm"
      :rules="rules"
      :model="deviceForm"
      label-position="right"
      label-width="165px"
    >
      <div class="two-column-wrap">
        <el-form-item v-if="checkVisible(deviceEnum.DeviceName)" label="设备名称:" :prop="isEnableCloudChannelName && isPlatformDevice ? null : deviceEnum.DeviceName">
          <span v-if="isEnableCloudChannelName && isPlatformDevice">{{ deviceForm.deviceName }}</span>
          <el-input v-else v-model="deviceForm.deviceName" />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.ChannelName)" label="通道名称:" :prop="isEnableCloudChannelName ? null : deviceEnum.DeviceName">
          <span v-if="isEnableCloudChannelName">{{ deviceForm.deviceName }}</span>
          <el-input v-else v-model="deviceForm.deviceName" />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.DeviceType)" label="设备分类:">
          {{ dicts.DeviceType[basicInfo.deviceType] }}
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.DeviceInType)" label="接入方式:">
          <span v-if="hasVideo" class="device-in-type">{{ dicts.DeviceInType[deviceInTypeEnum.Video] }}</span>
          <span v-if="hasViid" class="device-in-type">{{ dicts.DeviceInType[deviceInTypeEnum.Viid] }}</span>
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.DeviceLongitude)" label="经纬度:" :prop="deviceEnum.Longlat" class="form-longitude">
          <el-input v-model="deviceForm.deviceLongitude" class="longlat-input" />
          <span class="form-longitude__colon">:</span>
          <el-input v-model="deviceForm.deviceLatitude" class="longlat-input" />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.DeviceVendor)" label="厂商:" :prop="deviceEnum.DeviceVendor">
          <el-select
            v-model="deviceForm.deviceVendor"
            :disabled="inVideoProtocol === inVideoProtocolEnum.Rtsp"
          >
            <el-option
              v-for="(value, key) in deviceVendor[inVideoProtocol]"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.Region)" v-loading="loading.region" label="接入区域:" :prop="deviceEnum.Region" class="form-with-tip">
          <region-cascader v-model="deviceForm.region" disabled />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.InOrgRegion)" label="设备地址:" :prop="deviceEnum.InOrgRegion">
          <address-cascader
            :code="deviceForm.inOrgRegion"
            :level="deviceForm.inOrgRegionLevel"
            :disabled="!isPlatformDevice"
          />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.IndustryCode)" label="所属行业:" :prop="deviceEnum.IndustryCode">
          <el-select
            v-model="deviceForm.industryCode"
            placeholder="请选择所属行业"
            :disabled="!isPlatformDevice"
          >
            <el-option
              v-for="(value, key) in industryList"
              :key="key"
              :label="value.name"
              :value="value.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.InNetworkType)" label="接入网络:" :prop="deviceEnum.InNetworkType">
          <el-radio-group v-model="deviceForm.inNetworkType">
            <el-radio
              v-for="(value, key) in dicts.InNetworkType"
              :key="key"
              :label="key"
            >
              {{ value }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="播放网络:" :prop="deviceEnum.OutNetworkType">
          <el-radio-group v-model="deviceForm.outNetworkType">
            <el-radio
              v-for="(value, key) in dicts.OutNetworkType"
              :key="key"
              :label="key"
            >
              {{ value }}
            </el-radio>
          </el-radio-group>
        </el-form-item> -->
      </div>
      <div v-show="showMoreVisable" class="show-more" :class="{ 'show-more--expanded': showMore }">
        <el-form-item>
          <el-button class="show-more--btn" type="text" @click="showMore = !showMore">更多<i class="el-icon-arrow-down" /></el-button>
        </el-form-item>
        <div ref="showMoreForm" class="two-column-wrap show-more--form">
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
      <div class="two-column-wrap">
        <el-form-item v-if="checkVisible(deviceEnum.Description)" label="设备描述:" :prop="deviceEnum.Description">
          <el-input
            v-model="deviceForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入设备描述，如设备用途"
          />
        </el-form-item>
      </div>
    </el-form>

    <div class="detail-wrap__edit__footer">
      <el-button size="medium" type="primary" :loading="loading.submit" @click="submit">确 定</el-button>
      <el-button size="medium" @click="cancel">取 消</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { updateDevice } from '@vss/device/api/device'
import { pick } from 'lodash'
import * as dicts from '@vss/device/dicts'
import { DeviceEnum, DeviceTypeEnum, DeviceInTypeEnum, InNetworkTypeEnum, OutNetworkTypeEnum, InVideoProtocolEnum } from '@vss/device/enums'
import { Device, DeviceBasic, Industry, VideoDevice, ViidDevice, DeviceBasicForm, DeviceForm } from '@vss/device/type/Device'
import { getIndustryList, getNetworkList } from '@vss/device/api/dict'
import { DeviceModule } from '@vss/device/store/modules/device'
import { checkVideoVisible, checkViidVisible } from '@vss/device/utils/param'
import deviceFormMixin from '@vss/device/mixin/deviceFormMixin'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'BasicInfoEdit'
})
export default class extends Mixins(deviceFormMixin) {
  @Prop() private device: Device
  @Prop({ default: () => updateDevice }) private updateDeviceApi: (params: any) => Promise<any>

  private dicts = dicts
  private deviceEnum = DeviceEnum
  private deviceInTypeEnum = DeviceInTypeEnum
  private inNetworkTypeEnum = InNetworkTypeEnum
  private outNetworkTypeEnum = OutNetworkTypeEnum
  private inVideoProtocolEnum = InVideoProtocolEnum
  private deviceVendor = dicts.DeviceVendor
  private industryList = []
  private networkList = []
  private showMore = false
  private showMoreVisable = false
  public deviceForm: DeviceBasicForm = {}

  @Watch('device', {
    immediate: true
  })
  private onDeviceChange() {
    const basicInfo: DeviceBasic = this.device.device
    const industry: Industry = this.device.industry
    this.deviceForm = {
      deviceId: basicInfo.deviceId,
      deviceName: basicInfo.deviceName,
      deviceType: basicInfo.deviceType,
      inNetworkType: this.device.inNetworkType,
      outNetworkType: this.device.outNetworkType,
      longlat: 'required',
      deviceLongitude: basicInfo.deviceLongitude,
      deviceLatitude: basicInfo.deviceLatitude,
      deviceVendor: basicInfo.deviceVendor,
      description: basicInfo.description,
      deviceIp: basicInfo.deviceIp,
      devicePort: +basicInfo.devicePort === 0 ? null : basicInfo.devicePort,
      devicePoleId: basicInfo.devicePoleId,
      deviceMac: basicInfo.deviceMac,
      deviceSerialNumber: basicInfo.deviceSerialNumber,
      deviceModel: basicInfo.deviceModel,
      inOrgRegion: industry.inOrgRegion,
      inOrgRegionLevel: industry.inOrgRegionLevel,
      industryCode: industry.industryCode,
      networkCode: industry.networkCode,
      region: this.device.region
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
    return this.device.videos && this.device.videos[0]?.inVideoProtocol
  }

  // 视频接入信息
  private get videoInfo(): VideoDevice {
    return this.inVideoProtocol && this.device.videos[0][dicts.InVideoProtocolModelMapping[this.inVideoProtocol]]
  }

  // 视图库接入协议
  private get inViidProtocol() {
    return this.device.viids && this.device.viids[0]?.inViidProtocol
  }

  // 视图库接入信息
  private get viidInfo(): ViidDevice {
    return this.inViidProtocol && this.device.viids[0][dicts.InViidProtocolModelMapping[this.inViidProtocol]]
  }

  // 是否含视频
  private get hasVideo() {
    return this.device.videos && this.device.videos.length
  }

  // 是否含视图库
  private get hasViid() {
    return this.device.viids && this.device.viids.length
  }

  // 是否为平台下设备
  private get isPlatformDevice() {
    return this.basicInfo.deviceFrom === DeviceTypeEnum.Platform
  }

  // 获取是否使用设备名称
  private get isEnableCloudChannelName() {
    const enableCloudChannelName = UserModule.userConfigInfo.find((item: any) => item.key === 'enableCloudChannelName')
    return enableCloudChannelName.value === 'true'
  }

  private async mounted() {
    // 如果为平台下设备，“设备地址”和“所属行业”不限制必填
    if (this.isPlatformDevice) {
      this.rules.inOrgRegion = []
      this.rules.industryCode = []
    }

    this.industryList = await DeviceModule.getIndutryList(getIndustryList)
    this.networkList = await DeviceModule.getNetworkList(getNetworkList)
    this.checkIsShowMore()
  }

  private updated() {
    this.checkIsShowMore()
  }

  /**
   * 判断是否显示更多下拉框
   */
  private checkIsShowMore() {
    const showMoreForm = this.$refs.showMoreForm as HTMLDivElement
    this.showMoreVisable = showMoreForm.children.length !== 0
  }

  /**
   * 判断是否显示form-item
   */
  private checkVisible(prop) {
    if (this.hasVideo) {
      return checkVideoVisible.call({ ...this.videoInfo, ...this.basicInfo, isIbox: this.isIbox }, this.basicInfo.deviceType, this.inVideoProtocol, prop)
    } else {
      return checkViidVisible.call(this.viidInfo, this.basicInfo.deviceType, this.inViidProtocol, prop)
    }
  }

  /**
   * 保存表单
   */
  private submit() {
    const form: any = this.$refs.deviceForm
    form.validate( async(valid) => {
      if (valid) {
        const params: DeviceForm = {
          ...pick(this.deviceForm, [
            DeviceEnum.Region,
            DeviceEnum.InNetworkType,
            DeviceEnum.OutNetworkType
          ]),
          device: {
            ...pick(this.deviceForm, [
              DeviceEnum.DeviceId,
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
            // 父级设备ID
            [DeviceEnum.ParentDeviceId]: this.parentDeviceId
          },
          industry: {
            ...pick(this.deviceForm, [
              DeviceEnum.InOrgRegion,
              DeviceEnum.InOrgRegionLevel,
              DeviceEnum.IndustryCode,
              DeviceEnum.NetworkCode
            ])
          },
        }
        try {
          await this.updateDeviceApi(params)
          this.$alertSuccess('更新成功!')
          this.$emit('cancel')
          this.$emit('updateDevice')
        } catch (e) {
          this.$alertError(e.message)
        }
      }
    })
  }

  /**
   * 取消
   */
  private cancel() {
    this.$emit('cancel')
  }
}
</script>