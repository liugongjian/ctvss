<template>
  <div class="detail-wrap__edit">
    <el-form
      ref="deviceForm"
      :rules="rules"
      :model="deviceForm"
      label-position="right"
      label-width="165px"
    >
      <el-form-item label="设备名称:" :prop="deviceEnum.DeviceName">
        <el-input v-model="deviceForm.deviceName" />
      </el-form-item>
      <el-form-item label="设备分类:">
        {{ dicts.DeviceType[basicInfo.deviceType] }}
      </el-form-item>
      <el-form-item label="接入方式:">
        <span v-if="hasVideo" class="device-in-type">{{ dicts.DeviceInType[deviceInTypeEnum.Video] }}</span>
        <span v-if="hasViid" class="device-in-type">{{ dicts.DeviceInType[deviceInTypeEnum.Viid] }}</span>
      </el-form-item>
      <el-form-item label="经纬度:" :prop="deviceEnum.Longlat">
        <el-input v-model="deviceForm.deviceLongitude" class="longlat-input" /> :
        <el-input v-model="deviceForm.deviceLatitude" class="longlat-input" />
      </el-form-item>
      <el-form-item label="厂商:" :prop="deviceEnum.DeviceVendor">
        <el-select v-model="deviceForm.deviceVendor">
          <el-option
            v-for="(value, key) in deviceVendor[inVideoProtocol]"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-loading="loading.region" label="接入区域:" :prop="deviceEnum.Region" class="form-with-tip">
        <region-cascader v-model="deviceForm.region" />
      </el-form-item>
      <el-form-item label="设备地址:" :prop="deviceEnum.InOrgRegion">
        <address-cascader
          :code="deviceForm.inOrgRegion"
          :level="deviceForm.inOrgRegionLevel"
          :disabled="hasOutId"
          @change="onDeviceAddressChange"
        />
      </el-form-item>
      <el-form-item label="所属行业:" :prop="deviceEnum.IndustryCode">
        <el-select
          v-model="deviceForm.industryCode"
          :disabled="hasOutId"
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
          :disabled="hasOutId"
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
      <el-form-item label="接入网络:" :prop="deviceEnum.InNetworkType">
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
      <el-form-item label="播放网络:" :prop="deviceEnum.OutNetworkType">
        <el-radio-group v-model="deviceForm.outNetworkType">
          <el-radio
            v-for="(value, key) in dicts.OutNetworkType"
            :key="key"
            :label="key"
          >
            {{ value }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
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
import { DeviceEnum, DeviceInTypeEnum, InNetworkTypeEnum, OutNetworkTypeEnum } from '@vss/device/enums'
import { Device, DeviceBasic, Industry, VideoDevice, DeviceBasicForm, DeviceForm } from '@vss/device/type/Device'
import { getIndustryList, getNetworkList } from '@vss/device/api/dict'
import { DeviceModule } from '@vss/device/store/modules/device'
import deviceFormMixin from '@vss/device/mixin/deviceFormMixin'

@Component({
  name: 'BasicInfoEdit'
})
export default class extends Mixins(deviceFormMixin) {
  @Prop() private device: Device

  private dicts = dicts
  private deviceEnum = DeviceEnum
  private deviceInTypeEnum = DeviceInTypeEnum
  private inNetworkTypeEnum = InNetworkTypeEnum
  private outNetworkTypeEnum = OutNetworkTypeEnum
  private deviceVendor = dicts.DeviceVendor
  private industryList = []
  private networkList = []
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
      devicePort: basicInfo.devicePort,
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

  // 是否含视频
  private get hasVideo() {
    return this.device.videos && this.device.videos.length
  }

  // 是否含视图库
  private get hasViid() {
    return this.device.viids && this.device.viids.length
  }

  // 是否含国标ID
  private get hasOutId() {
    return this.videoInfo && !!this.videoInfo.outId
  }

  private async mounted() {
    this.industryList = await DeviceModule.getIndutryList(getIndustryList)
    this.networkList = await DeviceModule.getNetworkList(getNetworkList)
  }

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
              DeviceEnum.DevicePort,
              DeviceEnum.DeviceMac,
              DeviceEnum.DevicePoleId,
              DeviceEnum.DeviceSerialNumber,
              DeviceEnum.DeviceModel,
              DeviceEnum.Description
            ]),
            ...pick(this.videoForm, [
              DeviceEnum.DeviceChannelSize
            ]),
            // 父级设备ID
            parentDeviceId: this.parentDeviceId
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
          await updateDevice(params)
          this.$alertSuccess('更新成功!')
          this.$emit('cancel')
          this.$emit('updateDevice')
        } catch (e) {
          this.$alertError(e.message)
        }
      }
    })
  }

  private cancel() {
    this.$emit('cancel')
  }
}
</script>
