<template>
  <div class="detail-wrap__edit-wrap">
    <el-form
      ref="deviceForm"
      class="detail-wrap__edit"
      :rules="rules"
      :model="deviceForm"
      label-position="right"
      label-width="135px"
    >
      <el-form-item label="设备名称:" :prop="deviceEnum.DeviceName" class="form-with-tip">
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
import * as dicts from '@vss/device/dicts'
import { DeviceEnum, DeviceInTypeEnum, InNetworkTypeEnum, OutNetworkTypeEnum } from '@vss/device/enums'
import { Device, DeviceBasic, Industry } from '@vss/device/type/Device'
import AddressCascader from '../../AddressCascader.vue'
import deviceFormMixin from '@vss/device/mixin/deviceFormMixin'

@Component({
  name: 'BasicInfoEdit',
  components: {
    AddressCascader
  }
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
  public deviceForm = {}

  @Watch('device', {
    immediate: true
  })
  private onDeviceChange() {
    const basicInfo = this.device.device
    this.deviceForm = {
      // step0
      [DeviceEnum.DeviceName]: basicInfo.deviceName,
      [DeviceEnum.DeviceType]: basicInfo.deviceType,
      [DeviceEnum.DeviceInType]: DeviceInTypeEnum.VideoAndViid,
      [DeviceEnum.InNetworkType]: this.device.inNetworkType,
      [DeviceEnum.OutNetworkType]: this.device.outNetworkType,
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

  // 是否含视频
  private get hasVideo() {
    return this.device.videos && this.device.videos.length
  }

  // 是否含视图库
  private get hasViid() {
    return this.device.viids && this.device.viids.length
  }

  private mounted() {
    this.getRegionList()
  }

  private submit() {
    this.$emit('cancel')
  }

  private cancel() {
    this.$emit('cancel')
  }
}
</script>
