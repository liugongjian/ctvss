<template>
  <div v-loading="loading.device" class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-form
      ref="dataForm"
      :rules="rules"
      :model="form"
      label-position="right"
      label-width="150px"
    >
      <template v-if="!isChannel">
        <el-form-item v-if="currentGroup" label="业务组:">
          {{ currentGroup.groupName }}
          <span class="in-protocol">({{ inProtocolUpper }})</span>
        </el-form-item>
        <el-form-item v-if="breadcrumb && !isUpdate" label="当前目录:">
          <div class="breadcrumb">
            <span
              v-for="item in breadcrumb"
              :key="item.id"
              class="breadcrumb__item"
            >
              {{ item.label }}
            </span>
          </div>
        </el-form-item>
        <el-form-item label="设备类型:" prop="deviceType">
          <el-select v-model="form.deviceType" placeholder="请选择" :disabled="isUpdate" @change="clearValidate">
            <el-option v-for="item in deviceTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称:" prop="deviceName" class="form-with-tip">
          <el-input v-model="form.deviceName" />
          <div class="form-tip">2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。</div>
        </el-form-item>
        <el-form-item label="GA1400账号:" prop="userName">
          <el-select v-model="form.userName" :loading="loading.account">
            <el-option
              v-for="item in ga1400AccountList"
              :key="item.userName"
              :label="item.userName"
              :value="item.userName"
            />
          </el-select>
          <el-button type="text" class="ml10" @click="openDialog('createGa1400Certificate')">新建账号</el-button>
        </el-form-item>
        <el-form-item label="IP地址:" prop="deviceIp">
          <el-input v-model="form.deviceIp" />
        </el-form-item>
        <el-form-item label="端口:" prop="devicePort">
          <el-input v-model.number="form.devicePort" />
        </el-form-item>
        <el-form-item v-if="form.deviceType === 'ape'" label="设备地址:" prop="address">
          <el-cascader
            ref="addressCascader"
            v-model="form.address"
            expand-trigger="click"
            :options="regionList"
            :props="addressProps"
            @change="addressChange"
          />
        </el-form-item>
        <el-form-item v-if="form.deviceType === 'ape'" label="经纬度:" prop="longlat">
          <el-input v-model="form.deviceLongitude" class="longlat-input" /> :
          <el-input v-model="form.deviceLatitude" class="longlat-input" />
        </el-form-item>
        <el-form-item label="设备描述:" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入设备描述，如设备用途" />
        </el-form-item>
      </template>
      <el-form-item label="">
        <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
        <el-button @click="back">取 消</el-button>
      </el-form-item>
    </el-form>
    <create-ga1400-certificate v-if="dialog.createGa1400Certificate" @on-close="closeDialog('createGa1400Certificate', ...arguments)" />
  </div>
</template>
<script lang='ts'>
import { Component, Mixins } from 'vue-property-decorator'
import createMixin from '../mixin/createMixin'
import { pick } from 'lodash'
import { DeviceGa1400Type } from '@/dics'
import { createGa1400Device, updateGa1400Device, getGa1400Device } from '@/api/device'
import { getList as getGa1400List } from '@/api/certificate/ga1400'
import CreateGa1400Certificate from '@/views/certificate/ga1400/components/CreateDialog.vue'

@Component({
  name: 'CreateGa1400Device',
  components: {
    CreateGa1400Certificate
  }
})
export default class extends Mixins(createMixin) {
  private IPv4Reg = /^((25[0-5]|2[0-4]\d|[0-1]?\d{1,2})\.){3}(25[0-5]|2[0-4]\d|[0-1]?\d{1,2})$/
  private IPv6Reg = /^\s*((([0-9A-Fa-f]{1,4}:){7}(([0-9A-Fa-f]{1,4})|:))|(([0-9A-Fa-f]{1,4}:){6}(:|((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})|(:[0-9A-Fa-f]{1,4})))|(([0-9A-Fa-f]{1,4}:){5}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:){4}(:[0-9A-Fa-f]{1,4}){0,1}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:){3}(:[0-9A-Fa-f]{1,4}){0,2}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:){2}(:[0-9A-Fa-f]{1,4}){0,3}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:)(:[0-9A-Fa-f]{1,4}){0,4}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(:(:[0-9A-Fa-f]{1,4}){0,5}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})))(%.+)?\s*$/
  private rules = {
    deviceName: [
      { required: true, message: '请输入设备名称', trigger: 'blur' },
      { validator: this.validateDeviceName, trigger: 'blur' }
    ],
    channelName: [
      { required: true, message: '请输入通道名称', trigger: 'blur' },
      { validator: this.validateDeviceName, trigger: 'blur' }
    ],
    deviceType: [
      { required: true, message: '请选择设备类型', trigger: 'change' }
    ],
    userName: [
      { required: true, message: '请选择账号', trigger: 'change' }
    ],
    deviceIp: [
      { validator: this.validateGa1400DeviceIp, trigger: 'blur' }
    ],
    address: [
      { required: true, message: '请选择设备地址', trigger: 'blur' }
    ],
    longlat: [
      { required: true, message: '请选择经纬度', trigger: 'blur' },
      { validator: this.validateLonglat, trigger: 'blur' }
    ]
  }
  private deviceTypeList = Object.keys(DeviceGa1400Type).map(type => {
    return {
      label: DeviceGa1400Type[type],
      value: type
    }
  })
  private ga1400AccountList = []
  public form: any = {
    dirId: '',
    groupId: '',
    inProtocol: '',
    deviceId: '',
    deviceName: '',
    deviceType: '',
    deviceIp: '',
    devicePort: null,
    description: '',
    parentDeviceId: '',
    userName: '',
    address: [],
    longlat: 'required',
    deviceLongitude: '0.000000',
    deviceLatitude: '0.000000',
    gbRegion: '',
    gbRegionLevel: null
  }
  private dialog = {
    createGa1400Certificate: false
  }

  public async mounted() {
    if (this.isUpdate || this.isChannel) {
      await this.getDeviceInfo()
    } else {
      this.form.dirId = this.dirId
    }
    this.form.inProtocol = this.inProtocol
    this.getGa1400Accounts()
    this.onGroupChange()
  }

  /**
   * 加载设备信息
   */
  private async getDeviceInfo() {
    try {
      this.loading.device = true
      this.form.deviceId = this.deviceId
      const info = await getGa1400Device({
        deviceId: this.form.deviceId
      })
      if (this.isUpdate) {
        this.form = Object.assign(this.form, pick(info, ['groupId', 'dirId', 'deviceId', 'deviceName', 'inProtocol', 'deviceType', 'deviceVendor',
          'gbVersion', 'devicePort', 'channelNum', 'channelName', 'description', 'createSubDevice', 'pullType', 'transPriority', 'parentDeviceId', 'gbId', 'userName', 'deviceLongitude', 'deviceLatitude', 'gbRegion', 'gbRegionLevel', 'industryCode', 'networkCode']))
        // 对ga1400的deviceIp进行特殊处理
        this.$set(this.form, 'deviceIp', info.deviceIp || info.deviceIpv6)
        this.cascaderInit()
      } else {
        this.form = Object.assign(this.form, pick(info, ['userName']))
      }
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.device = false
    }
  }

  /**
   * 获取国标账号
   */
  private async getGa1400Accounts() {
    try {
      this.loading.account = true
      const res = await getGa1400List({
        pageSize: 1000
      })
      this.ga1400AccountList = res.ga1400Certs
    } catch (e) {
      console.error(e)
    } finally {
      this.loading.account = false
    }
  }

  /**
   * 打开弹出框
   */
  private openDialog(type: string) {
    // @ts-ignore
    this.dialog[type] = true
  }

  /**
   * 关闭弹出框
   */
  private closeDialog(type: string, payload: any) {
    // @ts-ignore
    this.dialog[type] = false
    if (type === 'createGa1400Certificate' && payload === true) {
      this.getGa1400Accounts()
    }
  }

  /**
   * 提交
   */
  private submit() {
    this.beforeSubmit(this.doSubmit)
  }

  /**
   * 执行提交
   */
  private async doSubmit() {
    try {
      this.submitting = true
      let params: any = pick(this.form, ['groupId', 'dirId', 'deviceType', 'deviceName', 'userName', 'devicePort', 'deviceLongitude', 'deviceLatitude', 'inProtocol', 'description'])
      // 对ga1400的deviceIp进行特殊处理
      if (this.IPv4Reg.test(this.form.deviceIp)) {
        this.$set(params, 'deviceIp', this.form.deviceIp)
        this.$set(params, 'deviceIpv6', '')
      } else if (this.IPv6Reg.test(this.form.deviceIp)) {
        this.$set(params, 'deviceIpv6', this.form.deviceIp)
        this.$set(params, 'deviceIp', '')
      }
      if (this.isUpdate) {
        delete params.deviceType
        // 更新设备详情
        Object.assign(params, pick(this.form, ['deviceId']))
        await updateGa1400Device(params)
        this.$message.success('修改设备成功！')
      } else {
        await createGa1400Device(params)
        this.$message.success('添加设备成功！')
      }
      this.back()
      this.initDirs()
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.submitting = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-input, .el-select, .el-textarea, .el-cascader {
    width: 400px;
  }

  .in-protocol {
    color: $textGrey;
  }

  .breadcrumb {
    &__item:after {
      content: '/';
      color: $textGrey;
    }
    &__item:last-child:after {
      content: '';
    }
  }
  .longlat-input {
    width: 193px;
  }
</style>
