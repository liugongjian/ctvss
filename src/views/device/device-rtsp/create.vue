<template>
  <div v-loading="loading.device" class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-form
      ref="dataForm"
      :rules="rules"
      :model="form"
      label-position="right"
      label-width="170px"
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
        <!-- <el-form-item
          v-if="form.deviceType === 'nvr'"
          label="自动创建子设备:"
          prop="createSubDevice"
          class="form-with-tip"
        >
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
          <el-switch
            v-model="form.createSubDevice"
            :active-value="1"
            :inactive-value="2"
            :disabled="isUpdate"
          />
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
        <el-form-item label="视频流接入方式:" prop="inType">
          <el-radio-group v-model="form.inType" @change="clearValidate">
            <el-radio
              v-for="(inType, key) in inTypeList"
              :key="key"
              :label="key"
            >
              {{ inType }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="form.deviceVendor === '其他'">
          <el-form-item label="自定义拉流地址:" prop="pullUrl">
            <el-input v-model="form.pullUrl" />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item
            v-if="form.inType === 'pull'"
            label="用户名:"
            prop="userName"
          >
            <el-input v-model="form.userName" />
          </el-form-item>
          <el-form-item
            v-if="form.inType === 'pull'"
            label="密码:"
            prop="password"
          >
            <el-input v-model="form.password" type="password" />
          </el-form-item>
          <el-form-item label="是否启用域名:" prop="enableDomain">
            <el-switch
              v-model="form.enableDomain"
              :active-value="1"
              :inactive-value="2"
              @change="clearValidate"
            />
          </el-form-item>
          <el-form-item
            v-if="form.enableDomain === 1"
            label="设备域名:"
            prop="deviceDomain"
          >
            <el-input v-model="form.deviceDomain" />
          </el-form-item>
          <el-form-item v-else label="设备IP:" prop="deviceIp">
            <el-input v-model="form.deviceIp" />
          </el-form-item>
          <el-form-item label="设备端口:" prop="devicePort">
            <el-input v-model.number="form.devicePort" />
          </el-form-item>
        </template>
        <el-form-item label="主子码流数量:" prop="multiStreamSize">
          <template slot="label">
            主子码流数量:
            <el-popover
              placement="top-start"
              title="主子码流数量"
              width="400"
              trigger="hover"
              :open-delay="300"
            >
              <div>
                单码流: 仅有一种码流<br>双码流: 主、子码流<br>三码流:
                主、子、第三码流
              </div>
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-radio-group v-model="form.multiStreamSize">
            <el-radio
              v-for="multiStreamSize in multiStreamSizeList"
              :key="multiStreamSize.value"
              :label="multiStreamSize.value"
              @change="onMultiStreamSizeChange"
            >
              {{ multiStreamSize.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.inType === 'pull'" prop="pullType">
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
            @change="onPullTypeChange"
          />
        </el-form-item>
        <el-form-item
          v-if="form.inType === 'pull' && form.pullType === 1"
          label="自动拉取第几个码流:"
          prop="autoStreamNum"
        >
          <el-radio-group v-model="form.autoStreamNum">
            <el-radio
              v-for="autoStreamNum in autoStreamNumList"
              :key="autoStreamNum.value"
              :label="autoStreamNum.value"
              :disabled="autoStreamNum.value > form.multiStreamSize"
            >
              {{ autoStreamNum.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.inType === 'push'" prop="pushType">
          <template slot="label">
            自动激活推流地址:
            <el-popover
              placement="top-start"
              title="自动激活推流地址"
              width="400"
              trigger="hover"
              :open-delay="300"
              :content="tips.pushType"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-switch
            v-model="form.pushType"
            :active-value="1"
            :inactive-value="2"
          />
        </el-form-item>
        <el-form-item prop="transPriority">
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
        <el-form-item v-if="(!isUpdate || form.gbRegion || !form.gbId)" label="设备地址:" prop="gbRegion">
          <AddressCascader
            :code="form.gbRegion"
            :level="form.gbRegionLevel"
            :disabled="form.gbId !== ''"
            @change="onDeviceAddressChange"
          />
        </el-form-item>
        <el-form-item label="经纬度:" prop="longlat">
          <el-input v-model="form.deviceLongitude" class="longlat-input" /> :
          <el-input v-model="form.deviceLatitude" class="longlat-input" />
        </el-form-item>
        <el-form-item
          v-if="!isUpdate || !!form.industryCode || !form.gbId"
          label="所属行业:"
          prop="industryCode"
        >
          <el-select
            v-model="form.industryCode"
            :disabled="form.gbId !== ''"
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
          v-if="(!isUpdate || !!form.industryCode || !form.gbId) && networkFlag"
          label="网络标识:"
          prop="networkCode"
        >
          <el-select
            v-model="form.networkCode"
            :disabled="form.gbId !== ''"
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
        <el-form-item v-if="!disableResourceTab" label="配置资源包:" prop="resources">
          <ResourceTabs
            v-model="form.resources"
            :is-update="isUpdate"
            :in-protocol="form.inProtocol"
            :is-private-in-network="isPrivateInNetwork"
            :actions="actions"
            :device-id="form.deviceId"
            :form-info="form"
            :vss-ai-apps="form.vssAIApps"
            @on-change="onResourceChange"
            @changevssaiapps="changeVSSAIApps"
            @changeAiDisabledStatus="changeAiDisabledStatus"
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
        <el-form-item
          label="通道名称:"
          prop="channelName"
          class="form-with-tip"
        >
          <el-input v-model="form.channelName" />
          <div class="form-tip">
            2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。
          </div>
        </el-form-item>
        <el-form-item v-if="isUpdate && !disableResourceTab" label="配置资源包:" prop="resources">
          <ResourceTabs
            v-model="form.resources"
            :is-update="isUpdate"
            :in-protocol="form.inProtocol"
            :is-private-in-network="isPrivateInNetwork"
            :actions="actions"
            :device-id="deviceId"
            :form-info="form"
            :vss-ai-apps="form.vssAIApps"
            @on-change="onResourceChange"
            @changevssaiapps="changeVSSAIApps"
            @changeAiDisabledStatus="changeAiDisabledStatus"
          />
        </el-form-item>
      </template>
      <el-form-item label="">
        <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
        <el-button @click="back">取 消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import createMixin from '../mixin/createMixin'
import { InType, DeviceRtspType } from '@/dics'
import { pick } from 'lodash'
import { updateDeviceResources } from '@/api/billing'
import { createDevice, updateDevice, getDevice } from '@/api/device'
import { UserModule } from '@/store/modules/user'
import { previewAuthActions } from '@/api/accessManage'

@Component({
  name: 'CreateRtspDevice'
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
    deviceVendor: [
      { required: true, message: '请选择厂商', trigger: 'change' }
    ],
    channelNum: [
      { required: true, message: '请填写通道号', trigger: 'change' },
      { validator: this.validateChannelNum, trigger: 'change' }
    ],
    pullUrl: [{ required: true, message: '请输入自定义设备拉流地址', trigger: 'blur' }],
    userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    deviceDomain: [
      { required: true, message: '请输入设备域名', trigger: 'blur' },
      { validator: this.validateDeviceDomain, trigger: 'blur' }
    ],
    deviceIp: [
      { required: true, message: '请输入设备IP', trigger: 'blur' },
      { validator: this.validateDeviceIp, trigger: 'blur' }
    ],
    devicePort: [
      { required: true, message: '请输入设备端口', trigger: 'blur' },
      { validator: this.validateDevicePort, trigger: 'change' }
    ],
    gbRegion: [
      { required: true, message: '请选择设备地址', trigger: 'change' }
    ],
    address: [{ required: true, message: '请选择设备地址', trigger: 'blur' }],
    longlat: [
      { required: true, message: '请选择经纬度', trigger: 'blur' },
      { validator: this.validateLonglat, trigger: 'blur' }
    ],
    industryCode: [
      { required: true, message: '请选择所属行业', trigger: 'change' }
    ],
    networkCode: [
      { required: true, message: '请选择网络标识', trigger: 'change' }
    ],
    resources: [
      { required: true, validator: this.validateResources, trigger: 'blur' }
    ]
  }

  public form: any = {
    dirId: '',
    groupId: '',
    inProtocol: '',
    deviceId: '',
    deviceName: '',
    deviceType: 'ipc',
    createSubDevice: 1,
    channelSize: '',
    channelNum: '',
    channelName: '',
    enableDomain: 2,
    deviceDomain: '',
    deviceIp: '',
    devicePort: null,
    deviceVendor: '',
    description: '',
    inType: 'pull',
    multiStreamSize: 1,
    autoStreamNum: 1,
    userName: '',
    password: '',
    pullType: 1,
    pushType: 1,
    pullUrl: '',
    transPriority: 'udp',
    parentDeviceId: '',
    resources: [],
    vssAIApps: [],
    aIApps: [],
    longlat: 'required',
    deviceLongitude: '0.000000',
    deviceLatitude: '0.000000',
    gbRegion: '',
    gbRegionLevel: null,
    gbId: '',
    industryCode: '',
    networkCode: ''
  }

  protected minChannelSize = 1
  private availableChannels: Array<number> = []
  private inTypeList = InType
  private deviceTypeList = Object.values(DeviceRtspType).map(type => {
    return {
      label: type,
      value: type.toLowerCase()
    }
  })

  // 用于判断拉流信息是否变更
  private pullStreamInfo = {
    deviceIp: '',
    devicePort: null,
    pullUrl: '',
    streamStatus: ''
  }

  private multiStreamSizeList = [
    {
      label: '单码流',
      value: 1
    },
    {
      label: '双码流',
      value: 2
    },
    {
      label: '三码流',
      value: 3
    }
  ]

  private autoStreamNumList = [
    {
      label: '主码流',
      value: 1
    },
    {
      label: '子码流',
      value: 2
    },
    {
      label: '第三码流',
      value: 3
    }
  ]

  public actions = {}

  public async mounted() {
    if (this.isUpdate || this.isChannel) {
      await this.getDeviceInfo()
    } else {
      this.form.dirId = this.dirId
    }
    // 获取权限数据-用于配置资源包，是否显示AI包
    if (UserModule.iamUserId) {
      const path: any = this.$route.query.path
      const pathArr = path ? path.split(',') : []
      const permissionRes = await previewAuthActions({
        targetResources: [{
          groupId: this.currentGroupId,
          dirPath: (this.isUpdate ? pathArr.slice(0, -1).join('/') : pathArr.join('/')) || '0',
          deviceId: this.isUpdate ? this.deviceId : undefined
        }]
      })
      this.actions = permissionRes.result[0].iamUser.actions
    }
    this.form.inProtocol = this.inProtocol
    this.onGroupChange()
  }

  private onMultiStreamSizeChange() {
    if (this.form.multiStreamSize < this.form.autoStreamNum) {
      this.form.autoStreamNum = this.form.multiStreamSize
    }
  }

  /**
   * 加载设备信息
   */
  private async getDeviceInfo() {
    try {
      this.loading.device = true
      this.form.deviceId = this.deviceId
      const info = await getDevice({
        deviceId: this.form.deviceId,
        inProtocol: this.inProtocol
      })
      const usedChannelNum = info.deviceChannels.map((channel: any) => {
        return channel.channelNum
      })
      if (this.isUpdate) {
        // 保存拉流相关信息
        this.pullStreamInfo.deviceIp = info.deviceIp
        this.pullStreamInfo.devicePort = info.devicePort
        this.pullStreamInfo.pullUrl = info.pullUrl
        this.pullStreamInfo.streamStatus = info.streamStatus
        this.form = Object.assign(
          this.form,
          pick(info, [
            'groupId',
            'dirId',
            'deviceId',
            'deviceName',
            'deviceType',
            'createSubDevice',
            'deviceVendor',
            'enableDomain',
            'deviceDomain',
            'deviceIp',
            'devicePort',
            'description',
            'inType',
            'userName',
            'password',
            'multiStreamSize',
            'autoStreamNum',
            'pullType',
            'pushType',
            'pullUrl',
            'transPriority',
            'parentDeviceId',
            'deviceLongitude',
            'deviceLatitude',
            'gbId',
            'gbRegion',
            'gbRegionLevel',
            'industryCode',
            'networkCode'
          ])
        )
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
   * 提交
   */
  private submit() {
    // 当拉流信息未改变 或 设备为按需拉流且流不在线时
    if (!this.isUpdate || (this.form.deviceIp === this.pullStreamInfo.deviceIp && this.form.devicePort === this.pullStreamInfo.devicePort && this.form.pullUrl === this.pullStreamInfo.pullUrl) ||
      (this.form.pullType !== 1 && this.pullStreamInfo.streamStatus !== 'on')
    ) {
      this.beforeSubmit(this.doSubmit)
    } else {
      this.$confirm(`当前设备${this.form.pullType === 1 ? '处于自动拉流模式' : '流在线'}，您修改的设备信息会触发重新拉流，确定提交本次编辑吗？`)
        .then(async() => {
          this.beforeSubmit(this.doSubmit)
        }).catch(() => { console.log() })
    }
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
            'enableDomain',
            'deviceDomain',
            'pullUrl',
            'deviceIp',
            'devicePort',
            'inType',
            'transPriority',
            'deviceLongitude',
            'deviceLatitude',
            'gbRegion',
            'gbRegionLevel',
            'industryCode',
            'networkCode'
          ])
        )
        // 判断inType类型
        if (this.form.inType === 'push') {
          params = Object.assign(params, pick(this.form, ['pushType']))
        } else {
          params = Object.assign(
            params,
            pick(this.form, [
              'pullType',
              'userName',
              'password',
              'multiStreamSize'
            ])
          )
          if (this.form.pullType === 1) {
            params = Object.assign(params, pick(this.form, ['autoStreamNum']))
          }
        }
        // if (params.deviceVendor === '其他') {
        //   params.deviceDomain = this.form.deviceCustomUrl
        // }
        // NVR类型添加额外参数
        if (this.form.deviceType === 'nvr') {
          params = Object.assign(params, {
            channelSize: this.form.channelSize,
            createSubDevice: this.form.createSubDevice
          })
        }
      } else {
        // NVR通道
        params = Object.assign(params, {
          deviceType: 'ipc',
          createSubDevice: this.isUpdate ? null : '2',
          parentDeviceId: this.isUpdate
            ? this.form.parentDeviceId
            : this.deviceId,
          channelName: this.form.channelName,
          channelNum: this.form.channelNum
        })
      }
      if (this.isUpdate) {
        delete params.deviceType
        // 获取设备资源包
        if (!this.disableResourceTab) {
          await updateDeviceResources({
            deviceId: this.deviceId,
            deviceType: this.form.deviceType,
            inProtocol: this.inProtocol,
            resources: this.form.resources,
            aIApps: this.form.aIApps
          })
        }
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
}
</script>

<style lang="scss" scoped>
.el-input,
.el-select,
.el-textarea,
.el-cascader {
  width: 400px;
}

.longlat-input {
  width: 193px;
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
