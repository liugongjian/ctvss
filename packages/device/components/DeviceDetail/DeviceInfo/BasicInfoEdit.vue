<template>
  <div class="detail-wrap__edit">
    <el-form
      ref="deviceForm"
      :rules="rules"
      :model="deviceForm"
      label-position="right"
      label-width="135px"
    >
      <el-form-item label="设备名称:" :prop="deviceEnum.DeviceName">
        <el-input v-model="deviceForm.DeviceName" />
      </el-form-item>
      <el-form-item label="设备分类:">
        {{ dicts.DeviceType[basicInfo.DeviceType] }}
      </el-form-item>
      <el-form-item label="接入方式:">
        <span v-if="hasVideo" class="device-in-type">{{ dicts.DeviceInType[deviceInTypeEnum.Video] }}</span>
        <span v-if="hasViid" class="device-in-type">{{ dicts.DeviceInType[deviceInTypeEnum.Viid] }}</span>
      </el-form-item>
      <el-form-item label="经纬度:" :prop="DeviceEnum.Longlat">
        <el-input v-model="deviceForm.DeviceLongitude" class="longlat-input" /> :
        <el-input v-model="deviceForm.DeviceLatitude" class="longlat-input" />
      </el-form-item>
      <el-form-item label="厂商:" :prop="deviceEnum.DeviceVendor">
        <el-select v-model="deviceForm.DeviceVendor">
          <el-option
            v-for="(value, key) in deviceVendor[inVideoProtocol]"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-loading="loading.region" label="接入区域:" :prop="deviceEnum.Region" class="form-with-tip">
        <region-cascader v-model="deviceForm.Region" />
      </el-form-item>
      <el-form-item label="设备地址:" :prop="deviceEnum.InOrgRegion">
        <address-cascader
          :code="deviceForm.InOrgRegion"
          :level="deviceForm.InOrgRegionLevel"
          :disabled="hasOutId"
          @change="onDeviceAddressChange"
        />
      </el-form-item>
      <el-form-item label="所属行业:" :prop="deviceEnum.IndustryCode">
        <el-select
          v-model="deviceForm.IndustryCode"
          :disabled="hasOutId"
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
          v-model="deviceForm.NetworkCode"
          :disabled="hasOutId"
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
      <el-form-item label="接入网络:" :prop="deviceEnum.InNetworkType">
        <el-radio-group v-model="deviceForm.InNetworkType">
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
        <el-radio-group v-model="deviceForm.OutNetworkType">
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
import * as dicts from '@vss/device/dicts'
import { DeviceEnum, DeviceInTypeEnum, InNetworkTypeEnum, OutNetworkTypeEnum } from '@vss/device/enums'
import { Device, DeviceBasic, Industry, VideoDevice, DeviceBasicForm } from '@vss/device/type/Device'
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
  private industryMap = dicts.IndustryMap
  private networkMap = dicts.NetworkMap
  public deviceForm: DeviceBasicForm = {}

  @Watch('device', {
    immediate: true
  })
  private onDeviceChange() {
    const basicInfo: DeviceBasic = this.device.Device
    const industry: Industry = this.device.Industry
    this.deviceForm = {
      [DeviceEnum.DeviceName]: basicInfo.DeviceName,
      [DeviceEnum.DeviceType]: basicInfo.DeviceType,
      [DeviceEnum.InNetworkType]: this.device.InNetworkType,
      [DeviceEnum.OutNetworkType]: this.device.OutNetworkType,
      [DeviceEnum.Longlat]: 'required',
      [DeviceEnum.DeviceLongitude]: basicInfo.DeviceLongitude,
      [DeviceEnum.DeviceLatitude]: basicInfo.DeviceLatitude,
      [DeviceEnum.DeviceVendor]: basicInfo.DeviceVendor,
      [DeviceEnum.Description]: basicInfo.Description,
      [DeviceEnum.DeviceIp]: basicInfo.DeviceIp,
      [DeviceEnum.DevicePort]: basicInfo.DevicePort,
      [DeviceEnum.DevicePoleId]: basicInfo.DevicePoleId,
      [DeviceEnum.DeviceMac]: basicInfo.DeviceMac,
      [DeviceEnum.DeviceSerialNumber]: basicInfo.DeviceSerialNumber,
      [DeviceEnum.DeviceModel]: basicInfo.DeviceModel,
      [DeviceEnum.InOrgRegion]: industry.InOrgRegion,
      [DeviceEnum.InOrgRegionLevel]: industry.InOrgRegionLevel,
      [DeviceEnum.IndustryCode]: industry.IndustryCode,
      [DeviceEnum.NetworkCode]: industry.NetworkCode,
      [DeviceEnum.Region]: this.device.Region
    }
  }

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device.Device
  }

  // 设备行业信息
  private get industry(): Industry {
    return this.device.Industry
  }

  // 视频接入协议
  private get inVideoProtocol() {
    return this.device.Videos && this.device.Videos[0]!.InVideoProtocol
  }

  // 视频接入信息
  private get videoInfo(): VideoDevice {
    return this.inVideoProtocol && this.device.Videos[0]![dicts.InVideoProtocolModelMapping[this.inVideoProtocol]]
  }

  // 是否含视频
  private get hasVideo() {
    return this.device.Videos && this.device.Videos.length
  }

  // 是否含视图库
  private get hasViid() {
    return this.device.Viids && this.device.Viids.length
  }

  // 是否含国标ID
  private get hasOutId() {
    return this.videoInfo && !!this.videoInfo.OutId
  }

  private submit() {
    this.$emit('cancel')
  }

  private cancel() {
    this.$emit('cancel')
  }
}
</script>
