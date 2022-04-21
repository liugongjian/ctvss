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
          <el-select
            v-model="form.deviceType"
            placeholder="请选择"
            :disabled="isUpdate"
            @change="clearValidate"
          >
            <el-option
              v-for="item in deviceTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item v-if="form.deviceType === 'nvr'" label="自动创建子设备:" prop="createSubDevice" class="form-with-tip">
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
        </el-form-item> -->
        <el-form-item
          v-if="form.deviceType === 'nvr'"
          label="子设备数量:"
          prop="channelSize"
        >
          <el-input-number
            v-model="form.channelSize"
            :min="minChannelSize"
            type="number"
          />
        </el-form-item>
        <el-form-item
          v-if="form.deviceType === 'nvr' || form.deviceType === 'ipc'"
          label="国标版本:"
          prop="gbVersion"
        >
          <el-radio-group v-model="form.gbVersion">
            <el-radio-button
              v-for="item in gbVersionList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="厂商:" prop="deviceVendor">
          <el-select v-model="form.deviceVendor">
            <el-option
              v-for="item in deviceVendorList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称:" prop="deviceName" class="form-with-tip">
          <el-input v-model="form.deviceName" />
          <div class="form-tip">
            2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。
          </div>
        </el-form-item>
        <el-form-item label="设备IP:" prop="deviceIp">
          <el-input v-model="form.deviceIp" />
        </el-form-item>
        <el-form-item label="设备端口:" prop="devicePort">
          <el-input v-model.number="form.devicePort" />
        </el-form-item>
        <el-form-item v-if="form.deviceType !== 'platform' && isShowGbIdEditor" label="国标ID:" prop="gbId">
          <el-input v-model="form.gbId" />
          <div class="form-tip">
            用户可自行录入规范国标ID，未录入该项，平台会自动生成规范国标ID。
          </div>
        </el-form-item>
        <el-form-item label="GB28181凭证:" prop="userName">
          <el-select v-model="form.userName" :loading="loading.account">
            <el-option
              v-for="item in gbAccountList"
              :key="item.userName"
              :label="item.userName"
              :value="item.userName"
            />
          </el-select>
          <el-button
            type="text"
            class="ml10"
            @click="openDialog('createGb28181Certificate')"
          >
            新建GB28181凭证
          </el-button>
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
          <el-switch
            v-model="form.pullType"
            :active-value="1"
            :inactive-value="2"
          />
        </el-form-item>
        <el-form-item
          v-if="form.deviceType === 'nvr' || form.deviceType === 'ipc'"
          prop="transPriority"
        >
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
          <el-switch
            v-model="form.transPriority"
            active-value="tcp"
            inactive-value="udp"
          />
        </el-form-item>
        <el-form-item v-if="(!isUpdate || form.gbRegion || !deviceGbId)" label="设备地址:" prop="gbRegion">
          <AddressCascader
            :code="form.gbRegion"
            :level="form.gbRegionLevel"
            :disabled="deviceGbId !== ''"
            @change="onDeviceAddressChange"
          />
        </el-form-item>
        <el-form-item v-show="form.deviceType !== 'platform'" label="经纬度:" prop="longlat">
          <el-input v-model="form.deviceLongitude" class="longlat-input" /> :
          <el-input v-model="form.deviceLatitude" class="longlat-input" />
        </el-form-item>
        <el-form-item
          v-if="!isUpdate || form.industryCode || !deviceGbId"
          label="所属行业:"
          prop="industryCode"
        >
          <el-select
            v-model="form.industryCode"
            :disabled="deviceGbId !== ''"
            placeholder="请选择所属行业"
          >
            <el-option
              v-for="(item, index) in industryList"
              :key="index"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="(!isUpdate || form.networkCode || !deviceGbId) && networkFlag"
          label="网络标识:"
          prop="networkCode"
        >
          <el-select
            v-model="form.networkCode"
            :disabled="deviceGbId !== ''"
            placeholder="请选择网络标识"
          >
            <el-option
              v-for="(item, index) in networkList"
              :key="index"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="配置资源包:" prop="resources">
          <ResourceTabs
            v-model="form.resources"
            :is-update="isUpdate"
            :in-protocol="form.inProtocol"
            :is-private-in-network="isPrivateInNetwork"
            :device-id="form.deviceId"
            :form-info="form"
            :vss-ai-apps="form.vssAIApps"
            @on-change="onResourceChange"
            @changevssaiapps="changeVSSAIApps"
          />
        </el-form-item>
        <el-form-item label="设备描述:" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入设备描述，如设备用途"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="text" @click="formExpand = !formExpand">
            更多设置
            <i class="el-icon--right" :class="{'el-icon-arrow-down': formExpand, 'el-icon-arrow-right': !formExpand}" />
          </el-button>
        </el-form-item>
        <div class="form-collapse" :class="{'form-expand': formExpand}">
          <el-form-item label="设备MAC地址:" prop="macAddr">
            <el-input v-model="form.macAddr" />
          </el-form-item>
          <el-form-item
            v-if="form.deviceType !== 'nvr'"
            label="杆号:"
            prop="poleId"
          >
            <el-input v-model="form.poleId " />
          </el-form-item>
        </div>
      </template>
      <template v-else>
        <el-form-item label="厂商:" prop="deviceVendor">
          <el-select v-model="form.deviceVendor">
            <el-option
              v-for="item in deviceVendorList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="通道号:" prop="channelNum">
          <el-select v-model="form.channelNum" :disabled="isUpdate">
            <el-option
              v-for="item in availableChannels"
              :key="item"
              :label="`D${item}`"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-show="form.deviceType !== 'platform'" label="经纬度:" prop="longlat">
          <el-input v-model="form.deviceLongitude" class="longlat-input" /> :
          <el-input v-model="form.deviceLatitude" class="longlat-input" />
        </el-form-item>
        <el-form-item label="通道名称:" prop="channelName" class="form-with-tip">
          <el-input v-model="form.channelName" />
          <div class="form-tip">
            2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。
          </div>
        </el-form-item>
        <el-form-item
          label="杆号:"
          prop="poleId"
        >
          <el-input v-model="form.poleId " />
        </el-form-item>
        <el-form-item v-if="isUpdate" label="配置资源包:" prop="resources">
          <ResourceTabs
            v-model="form.resources"
            :is-update="isUpdate"
            :in-protocol="form.inProtocol"
            :is-private-in-network="isPrivateInNetwork"
            :device-id="deviceId"
            :form-info="form"
            :vss-ai-apps="form.vssAIApps"
            @on-change="onResourceChange"
            @changevssaiapps="changeVSSAIApps"
          />
        </el-form-item>
      </template>
      <el-form-item label="">
        <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
        <el-button @click="back">取 消</el-button>
      </el-form-item>
    </el-form>
    <create-gb28181-certificate
      v-if="dialog.createGb28181Certificate"
      @on-close="closeDialog('createGb28181Certificate', ...arguments)"
    />
  </div>
</template>
<script lang='ts'>
import { Component, Mixins, Watch } from 'vue-property-decorator'
import createMixin from '../mixin/createMixin'
import { pick } from 'lodash'
import { DeviceGb28181Type } from '@/dics'
import { createDevice, updateDevice, getDevice, validGbId } from '@/api/device'
import { updateDeviceResources } from '@/api/billing'
import { getList as getGbList } from '@/api/certificate/gb28181'
import CreateGb28181Certificate from '@/views/certificate/gb28181/components/CreateDialog.vue'

@Component({
  name: 'CreateGb28181Device',
  components: {
    CreateGb28181Certificate
  }
})
export default class extends Mixins(createMixin) {
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
      { required: true, message: '请填写通道号', trigger: 'change' },
      { validator: this.validateChannelNum, trigger: 'change' }
    ],
    gbId: [
      { validator: this.validateGbId, trigger: 'blur' }
    ],
    industryCode: [
      { required: true, message: '请选择所属行业', trigger: 'blur' }
    ],
    networkCode: [
      { required: true, message: '请选择网络标识', trigger: 'blur' }
    ],
    userName: [
      { required: true, message: '请选择账号', trigger: 'change' }
    ],
    deviceIp: [
      { validator: this.validateDeviceIp, trigger: 'blur' }
    ],
    devicePort: [
      { validator: this.validateDevicePort, trigger: 'change' }
    ],
    gbRegion: [
      { required: true, message: '请选择设备地址', trigger: 'change' }
    ],
    longlat: [
      { required: true, message: '请选择经纬度', trigger: 'blur' },
      { validator: this.validateLonglat, trigger: 'blur' }
    ],
    macAddr: [
      { validator: this.validateMacAddr, trigger: 'blur' }
    ],
    poleId: [
      { validator: this.validatePoleId, trigger: 'blur' }
    ],
    resources: [
      { required: true, validator: this.validateResources, trigger: 'blur' }
    ]
  }
  private gbVersionList = ['2011', '2016']
  private deviceTypeList = Object.values(DeviceGb28181Type).map((type) => {
    return {
      label: type,
      value: type.toLowerCase()
    }
  })
  private gbAccountList = []
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
    macAddr: '',
    // channelSize: '',
    // channelNum: '',
    channelName: '',
    description: '',
    createSubDevice: 1,
    pullType: 1,
    transPriority: 'tcp',
    parentDeviceId: '',
    gbId: '',
    poleId: '',
    userName: '',
    longlat: 'required',
    deviceLongitude: '0.000000',
    deviceLatitude: '0.000000',
    gbRegion: '',
    gbRegionLevel: null,
    resources: [],
    vssAIApps: [],
    aIApps: [],
    industryCode: '',
    networkCode: ''
  }

  @Watch('form.channelSize')
  onchannelNum() {
    console.log('channelSize!!!')
  }

  private minChannelSize = 1
  private availableChannels: Array<number> = []
  private dialog = {
    createGb28181Certificate: false
  }

  public async mounted() {
    if (this.isUpdate || this.isChannel) {
      await this.getDeviceInfo()
    } else {
      this.form.dirId = this.dirId
    }
    this.form.inProtocol = this.inProtocol
    this.getGbAccounts()
    this.onGroupChange()
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
          'gbVersion', 'deviceIp', 'devicePort', 'channelNum', 'channelName', 'description', 'createSubDevice', 'pullType', 'transPriority',
          'parentDeviceId', 'gbId', 'userName', 'deviceLongitude', 'deviceLatitude', 'gbRegion', 'gbRegionLevel', 'industryCode', 'networkCode', 'poleId', 'macAddr']))
        if (this.form.macAddr || this.form.poleId) {
          this.formExpand = true
        }
        this.cascaderInit()
        // 获取绑定资源包列表
        this.getDeviceResources(
          info.deviceId,
          info.deviceType!,
          info.inProtocol!
        )
        if (info.deviceStats) {
          // 编辑的时候，设置数量不得小于已创建的子通道中最大通道号或1
          this.minChannelSize = Math.max(...usedChannelNum, 1)
          this.form.channelSize = info.deviceStats.maxChannelSize
          this.orginalChannelSize = this.form.channelSize
        }
        if (this.isChannel) {
          if (info.deviceChannels.length) {
            const channel = info.deviceChannels[0]
            this.form.channelNum = channel.channelNum
            this.form.channelName = channel.channelName
          }
        }
      } else {
        this.form.deviceLatitude = info.deviceLatitude
        this.form.deviceLongitude = info.deviceLongitude
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
      this.$message.error(e && e.message)
    } finally {
      this.loading.device = false
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
    if (type === 'createGb28181Certificate' && payload === true) {
      this.getGbAccounts()
    }
  }

  /**
   * 获取国标账号
   */
  private async getGbAccounts() {
    try {
      this.loading.account = true
      const res = await getGbList({
        pageSize: 1000
      })
      this.gbAccountList = res.gbCerts
    } catch (e) {
      console.error(e)
    } finally {
      this.loading.account = false
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
      let params: any = pick(this.form, [
        'groupId',
        'deviceName',
        'inProtocol',
        'deviceVendor',
        'poleId',
        'description'
      ])
      if (this.isUpdate) {
        params = Object.assign(params, pick(this.form, ['deviceId']))
      } else {
        params = Object.assign(
          params,
          pick(this.form, ['resources', 'vssAIApps'])
        )
      }
      if (!this.isChannel) {
        // 通用参数
        params = Object.assign(
          params,
          pick(this.form, [
            'dirId',
            'deviceType',
            'inProtocol',
            'deviceIp',
            'devicePort',
            'macAddr',
            'pullType',
            'userName',
            'deviceLongitude',
            'deviceLatitude',
            'gbId',
            'gbRegion',
            'gbRegionLevel',
            'industryCode',
            'networkCode'
          ])
        )
        // 强制转换设备端口字段类型
        params.devicePort = parseInt(params.devicePort)
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
        }, pick(this.form, ['userName', 'deviceLongitude', 'deviceLatitude']))
      }
      if (this.isUpdate) {
        delete params.deviceType
        // 获取设备资源包
        await updateDeviceResources({
          deviceId: this.deviceId,
          deviceType: this.form.deviceType,
          inProtocol: this.inProtocol,
          resources: this.form.resources,
          aIApps: this.form.aIApps
        })
        // 更新设备详情
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
  }

  /**
   * 校验MAC地址
   */
  private async validateMacAddr(rule: any, value: string, callback: Function) {
    let reg1 = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/
    let reg2 = /^([0-9A-Fa-f]{2}[-]){5}([0-9A-Fa-f]{2})$/
    if (value && !reg1.test(value) && !reg2.test(value)) {
      callback(new Error('请输入规范MAC地址'))
    } else {
      callback()
    }
  }

  /**
   * 校验杆号
   */
  private async validatePoleId(rule: any, value: string, callback: Function) {
    if (value && !/^[\w]{1,21}$/.test(value)) {
      callback(new Error('请输入规范杆号'))
    } else {
      callback()
    }
  }

  /**
   * 校验设备国标ID
   */
  private async validateGbId(rule: any, value: string, callback: Function) {
    let validInfo: any
    try {
      validInfo = await validGbId({
        deviceId: this.deviceId,
        inProtocol: this.form.inProtocol,
        gbId: this.form.gbId
      })
    } catch (e) {
      console.log(e)
    }
    if (value && !/^[0-9]{20}$/.test(value)) {
      callback(new Error('请输入规范国标ID'))
    } else if (value && validInfo && !validInfo.isValidGbId) {
      callback(new Error('存在重复国标ID'))
    } else {
      callback()
    }
  }
}
</script>

<style lang="scss" scoped>
.el-input,
.el-select,
.el-textarea,
.el-cascader {
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
