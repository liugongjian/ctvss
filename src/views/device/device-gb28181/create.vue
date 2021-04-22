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
          <el-select v-model="form.deviceType" placeholder="请选择" :disabled="isUpdate">
            <el-option v-for="item in deviceTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.deviceType === 'nvr'" label="自动创建子设备:" prop="createSubDevice" class="form-with-tip">
          <template slot="label">
            自动创建子设备:
            <el-popover
              placement="top-start"
              title="自动创建子设备"
              width="400"
              trigger="hover"
              :open-delay="300"
              :content="tips.createSubDevice"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-switch v-model="form.createSubDevice" :active-value="1" :inactive-value="2" :disabled="isUpdate" />
        </el-form-item>
        <el-form-item v-if="form.deviceType === 'nvr'" label="子设备数量:" prop="channelSize">
          <el-input-number v-model="form.channelSize" :min="minChannelSize" type="number" :disabled="isUpdate && form.createSubDevice === 1" />
        </el-form-item>
        <el-form-item v-if="form.deviceType === 'nvr' || form.deviceType === 'ipc'" label="国标版本:" prop="gbVersion">
          <el-radio-group v-model="form.gbVersion">
            <el-radio-button v-for="item in gbVersionList" :key="item" :label="item" :value="item" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="厂商:" prop="deviceVendor">
          <el-select v-model="form.deviceVendor">
            <el-option v-for="item in deviceVendorList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称:" prop="deviceName" class="form-with-tip">
          <el-input v-model="form.deviceName" />
          <div class="form-tip">2-16位，可包含大小写字母、数字、中文、中划线。</div>
        </el-form-item>
        <el-form-item label="设备IP:" prop="deviceIp">
          <el-input v-model="form.deviceIp" />
        </el-form-item>
        <el-form-item label="设备端口:" prop="devicePort">
          <el-input v-model.number="form.devicePort" />
        </el-form-item>
        <el-form-item v-if="form.deviceType === 'platform'" label="国标ID:" prop="gbId">
          <el-input v-model="form.gbId" />
        </el-form-item>
        <el-form-item label="GB28181账号:" prop="userName">
          <el-select v-model="form.userName" :loading="loading.account">
            <el-option-group label="匿名">
              <el-option
                v-for="item in gbAccountList.anonymous"
                :key="item.userName"
                :label="item.userName"
                :value="item.userName"
              />
            </el-option-group>
            <el-option-group label="非匿名">
              <el-option
                v-for="item in gbAccountList.normal"
                :key="item.userName"
                :label="item.userName"
                :value="item.userName"
              />
            </el-option-group>
          </el-select>
          <el-button type="text" class="ml10" @click="openDialog('createGb28181Certificate')">新建账号</el-button>
        </el-form-item>
        <el-form-item prop="pullType">
          <template slot="label">
            自动拉流:
            <el-popover
              placement="top-start"
              title="自动拉流"
              width="400"
              trigger="hover"
              :open-delay="300"
              :content="tips.pullType"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-switch v-model="form.pullType" :active-value="1" :inactive-value="2" />
        </el-form-item>
        <el-form-item v-if="form.deviceType === 'nvr' || form.deviceType === 'ipc'" prop="transPriority">
          <template slot="label">
            优先TCP传输:
            <el-popover
              placement="top-start"
              title="优先TCP传输"
              width="400"
              trigger="hover"
              :open-delay="300"
              :content="tips.transPriority"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-switch v-model="form.transPriority" active-value="tcp" inactive-value="udp" />
        </el-form-item>
        <el-form-item label="设备地址:" prop="address">
          <el-cascader
            ref="addressCascader"
            v-model="form.address"
            expand-trigger="hover"
            :disabled="isUpdate"
            :options="cities"
            :props="citiesProps"
            @change="addressChange"
          />
        </el-form-item>
        <el-form-item label="设备描述:" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入设备描述，如设备用途" />
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item label="厂商:" prop="deviceVendor">
          <el-select v-model="form.deviceVendor">
            <el-option v-for="item in deviceVendorList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="通道号:" prop="channelNum">
          <el-select v-model="form.channelNum" :disabled="isUpdate">
            <el-option v-for="item in availableChannels" :key="item" :label="`D${item}`" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="通道名称:" prop="channelName" class="form-with-tip">
          <el-input v-model="form.channelName" />
          <div class="form-tip">2-16位，可包含大小写字母、数字、中文、中划线。</div>
        </el-form-item>
      </template>
      <el-form-item label="">
        <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
        <el-button @click="back">取 消</el-button>
      </el-form-item>
    </el-form>
    <create-gb28181-certificate v-if="dialog.createGb28181Certificate" @on-close="closeDialog('createGb28181Certificate', ...arguments)" />
  </div>
</template>
<script lang='ts'>
import { Component, Mixins } from 'vue-property-decorator'
import createMixin from '../mixin/createMixin'
import { pick } from 'lodash'
import { DeviceGb28181Type } from '@/dics'
import { createDevice, updateDevice, getDevice } from '@/api/device'
import { getList as getGbList } from '@/api/certificate/gb28181'
import CreateGb28181Certificate from '@/views/certificate/gb28181/components/CreateDialog.vue'
import { cities } from '@/assets/region/cities'

@Component({
  name: 'CreateGb28181Device',
  components: {
    CreateGb28181Certificate
  }
})
export default class extends Mixins(createMixin) {
  private cities = cities

  private citiesProps: any = {
    value: 'code',
    label: 'name',
    children: 'cities'
  }

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
    gbVersion: [
      { required: true, message: '请选择国标版本', trigger: 'change' }
    ],
    deviceVendor: [
      { required: true, message: '请选择厂商', trigger: 'change' }
    ],
    channelSize: [
      { required: true, message: '请填写子设备数量', trigger: 'blur' }
    ],
    channelNum: [
      { required: true, message: '请填写通道号', trigger: 'blur' },
      { validator: this.validateChannelNum, trigger: 'blur' }
    ],
    gbId: [
      { required: true, message: '请填写国标ID', trigger: 'blur' }
    ],
    userName: [
      { required: true, message: '请选择账号', trigger: 'change' }
    ],
    deviceIp: [
      { validator: this.validateDeviceIp, trigger: 'blur' }
    ]
  }
  private gbVersionList = ['2011', '2016']
  private deviceTypeList = Object.values(DeviceGb28181Type).map(type => {
    return {
      label: type,
      value: type.toLowerCase()
    }
  })
  private gbAccountList = {
    normal: [],
    anonymous: []
  }
  public form: any = {
    dirId: '',
    groupId: '',
    inProtocol: '',
    deviceId: '',
    deviceName: '',
    deviceType: '',
    deviceVendor: '',
    gbVersion: '2016',
    deviceIp: '',
    devicePort: null,
    channelSize: '',
    channelNum: '',
    channelName: '',
    description: '',
    createSubDevice: 1,
    pullType: 1,
    transPriority: 'tcp',
    parentDeviceId: '',
    gbId: '',
    userName: '',
    address: ['1100', '1100'],
    gbRegion: '110000000',
    gbRegionLevel: '1'
  }
  private minChannelSize = 1
  private availableChannels: Array<number> = []
  private dialog = {
    createGb28181Certificate: false
  }

  private async mounted() {
    if (this.isUpdate || this.isChannel) {
      await this.getDeviceInfo()
    } else {
      this.form.dirId = this.dirId
      this.form.inProtocol = this.inProtocol
    }
    this.getGbAccounts()
    this.onGroupChange()
    this.addressCascaderInit()
  }

  private addressCascaderInit() {
    const mainUserAddress: any = this.$store.state.user.mainUserAddress
    if (mainUserAddress) {
      this.form.address = mainUserAddress.split(',')
      console.log(this.form.address);
      
      const addressCascader: any = this.$refs['addressCascader']
      const currentAddress = addressCascader.getCheckedNodes()[0].data
      this.form.gbRegion = currentAddress.code + '0000'
      this.form.gbRegionLevel = currentAddress.level
    } else {
      this.form.address = ['1100', '1100']
    }
  }

  private addressChange() {
    const addressCascader: any = this.$refs['addressCascader']
    const currentAddress = addressCascader.getCheckedNodes()[0].data
    this.form.gbRegion = currentAddress.code + '0000'
    this.form.gbRegionLevel = currentAddress.level
    console.log(this.form.gbRegion, this.form.gbRegionLevel)
  }

  /**
   * 加载设备信息
   */
  private async getDeviceInfo() {
    try {
      this.loading.device = true
      this.form.deviceId = this.deviceId
      const info = await getDevice({
        deviceId: this.form.deviceId
      })
      const usedChannelNum = info.deviceChannels.map((channel: any) => {
        return channel.channelNum
      })
      if (this.isUpdate) {
        this.form = Object.assign(this.form, pick(info, ['groupId', 'dirId', 'deviceId', 'deviceName', 'inProtocol', 'deviceType', 'deviceVendor',
          'gbVersion', 'deviceIp', 'devicePort', 'channelNum', 'channelName', 'description', 'createSubDevice', 'pullType', 'transPriority', 'parentDeviceId', 'gbId', 'userName', 'gbRegion', 'gbRegionLevel']))
        // 设备地址参数转换
        let gbCode = this.form.gbRegion.substring(0, 4)
        this.form.address = [gbCode.substring(0, 2) + '00', gbCode]
        if (info.deviceStats) {
          // 编辑的时候，设置数量不得小于已创建的子通道中最大通道号或1
          this.minChannelSize = Math.max(...usedChannelNum, 1)
          this.form.channelSize = info.deviceStats.maxChannelSize
        }
        if (this.isChannel) {
          if (info.deviceChannels.length) {
            const channel = info.deviceChannels[0]
            this.form.channelNum = channel.channelNum
            this.form.channelName = channel.channelName
          }
        }
      } else {
        this.form = Object.assign(this.form, pick(info, ['userName']))
      }
      // 构建可选择的通道，排除已选择通道
      if (this.isChannel && info.deviceStats) {
        const channelSize = info.deviceStats.maxChannelSize
        const availableChannels = []
        for (let i = 1; i <= channelSize; i++) {
          if (!~usedChannelNum.indexOf(i)) {
            availableChannels.push(i)
          }
        }
        this.availableChannels = availableChannels
      } else if (this.isUpdate && info.deviceChannels.length) {
        this.availableChannels = usedChannelNum
      }
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.loading.device = false
    }
  }

  /**
   * 校验通道号
   */
  private validateChannelNum(rule: any, value: string, callback: Function) {
    if (!/^[0-9]+$/.test(value)) {
      callback(new Error('设备号仅支持数字'))
    } else {
      callback()
    }
  }

  private openDialog(type: string) {
    // @ts-ignore
    this.dialog[type] = true
  }

  private closeDialog(type: string, payload: any) {
    // @ts-ignore
    this.dialog[type] = false
    if (type === 'createGb28181Certificate' && payload === true) {
      this.getGbAccounts()
    }
  }

  private async getGbAccounts() {
    try {
      this.loading.account = true
      const res = await getGbList({
        pageSize: 1000
      })
      this.gbAccountList = {
        normal: [],
        anonymous: []
      }
      res.gbCerts.forEach((account: any) => {
        // @ts-ignore
        this.gbAccountList[account.userType].push(account)
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.loading.account = false
    }
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.submitting = true
          let params: any = pick(this.form, ['groupId', 'deviceName', 'inProtocol', 'deviceVendor', 'description'])
          if (this.isUpdate) {
            params = Object.assign(params, pick(this.form, ['deviceId']))
          } else {
            params = Object.assign(params, pick(this.form, ['gbRegion', 'gbRegionLevel']))
          }
          if (!this.isChannel) {
            // 通用参数
            params = Object.assign(params, pick(this.form, ['dirId', 'deviceType', 'inProtocol', 'deviceIp', 'devicePort', 'pullType', 'userName']))
            // IPC类型添加额外参数
            if (this.form.deviceType === 'ipc') {
              params = Object.assign(params, {
                gbVersion: this.form.gbVersion,
                transPriority: this.form.transPriority
              })
            }
            // NVR类型添加额外参数
            if (this.form.deviceType === 'nvr') {
              params = Object.assign(params, {
                gbVersion: this.form.gbVersion,
                transPriority: this.form.transPriority,
                channelSize: this.form.channelSize,
                createSubDevice: this.form.createSubDevice
              })
            }
            // Platform类型添加额外参数
            if (this.form.deviceType === 'platform') {
              params = Object.assign(params, {
                gbId: this.form.gbId
              })
            }
          } else {
            // NVR通道
            params = Object.assign(params, {
              deviceType: 'ipc',
              createSubDevice: this.isUpdate ? null : '2',
              parentDeviceId: this.isUpdate ? this.form.parentDeviceId : this.deviceId,
              channelName: this.form.channelName,
              channelNum: this.form.channelNum
            }, pick(this.form, ['userName']))
          }
          if (this.isUpdate) {
            delete params.deviceType
            await updateDevice(params)
            this.$message.success('修改设备成功！')
          } else {
            await createDevice(params)
            this.$message.success('添加设备成功！')
          }
          this.back()
          this.initDirs()
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.submitting = false
        }
      } else {
        return false
      }
    })
  }
}
</script>

<style lang="scss" scoped>
  .el-input, .el-select, .el-textarea {
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
</style>
