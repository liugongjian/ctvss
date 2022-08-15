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
            <video-create-form
              :device-form="deviceForm"
            />
          </div>
          <div v-if="deviceForm.deviceInType !== 'video'">
            <div class="form-title">视图接入信息</div>
            <viid-create-form />
          </div>
        </el-form>
      </div>
      <div class="create-wrap__footer">
        <div class="create-wrap__footer__tools">
          <el-button v-if="!isChannel && activeStep === 1" size="medium" type="primary" @click="stepChange(0)">上一步</el-button>
          <el-button v-if="!isChannel && activeStep === 0" size="medium" type="primary" @click="stepChange(1)">下一步</el-button>
          <el-button v-if="isChannel || activeStep === 1" size="medium" type="primary" :loading="submitting" @click="submit">确 定</el-button>
          <el-button size="medium" @click="back">取 消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { DeviceType, DeviceInType } from '../../dicts/index'
import VideoCreateForm from '../VideoCreateForm.vue'
import ViidCreateForm from '../ViidCreateForm.vue'

@Component({
  name: 'DeviceCreate',
  components: {
    VideoCreateForm,
    ViidCreateForm
  }
})
export default class extends Vue {
  private deviceType = DeviceType
  private deviceInType = DeviceInType
  private breadCrumbContent = '添加设备'
  private activeStep = 0
  private deviceForm = {
    deviceName: '',
    deviceType: 'ipc',
    deviceInType: 'videoAndViid',
    inNetworkType: 'public',
    outNetworkType: 'public'
  }
  rules = {}

  private get isChannel() {
    return false
  }

  private stepChange() {

  }

  private back() {
    this.$router.push({ name: 'DeviceList' })
  }
}
</script>
