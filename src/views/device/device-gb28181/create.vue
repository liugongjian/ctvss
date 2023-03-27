<template>
  <div v-loading="loading.device" class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <div v-if="!isChannel" class="process">
      <el-steps :active="activeStep" finish-status="success" simple>
        <el-step title="设备配置"><span slot="icon">1</span></el-step>
        <el-step title="接入配置"><span slot="icon">2</span></el-step>
      </el-steps>
    </div>
    <el-form
      ref="dataForm"
      :rules="rules"
      :model="form"
      label-position="right"
      label-width="150px"
    >
      <template v-if="!isChannel">
        <div v-show="activeStep === 0">
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
          <!-- <el-form-item
            v-if="form.deviceType === 'nvr' || isIPC"
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
          </el-form-item> -->
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
          <el-form-item
            label="设备名称:"
            prop="deviceName"
            class="form-with-tip"
          >
            <el-input v-model="form.deviceName" />
            <div class="form-tip">
              2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。
            </div>
          </el-form-item>
          <el-form-item
            v-if="
              !(
                form.platFormMsg === 'Y' &&
                (form.deviceClass === 'ipc' ||
                  form.deviceClass === 'channel' ||
                  form.deviceClass === 'nvr')
              ) &&
                (!isUpdate || form.gbRegion || !deviceGbId)
            "
            label="设备地址:"
            prop="gbRegion"
          >
            <AddressCascader
              :code="form.gbRegion"
              :level="form.gbRegionLevel"
              :disabled="deviceGbId !== ''"
              @change="onDeviceAddressChange"
            />
          </el-form-item>
          <el-form-item label="经纬度:" prop="longlat">
            <el-input v-model="form.deviceLongitude" class="longlat-input" /> :
            <el-input v-model="form.deviceLatitude" class="longlat-input" />
          </el-form-item>
          <el-form-item v-if="isIPC" label="设备SN码:" prop="serialNumber">
            <el-input v-model="form.serialNumber" />
          </el-form-item>
          <el-form-item v-if="isIPC" label="设备型号:" prop="deviceModel">
            <el-input v-model="form.deviceModel" />
          </el-form-item>
          <el-form-item
            v-if="
              !(
                form.platFormMsg === 'Y' &&
                (form.deviceClass === 'ipc' ||
                  form.deviceClass === 'channel' ||
                  form.deviceClass === 'nvr')
              ) &&
                (!isUpdate || form.industryCode || !deviceGbId)
            "
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
            v-if="
              form.deviceType === 'platform' ||
                ((!isUpdate || form.networkCode || !deviceGbId) && networkFlag)
            "
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
          <el-form-item label="设备描述:" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入设备描述，如设备用途"
            />
          </el-form-item>
        </div>
        <div v-if="activeStep === 1" class="step-container">
          <el-tabs
            v-model="activeTabPane"
            type="card"
            class="title-tabs"
            @tab-click="1"
          >
            <el-tab-pane
              v-for="item in tabPaneList"
              :key="item.name"
              :label="item.label"
              :name="item.name"
            >
              <br>
            </el-tab-pane>
          </el-tabs>
          <el-tooltip
            v-if="tabPaneList.length === 1 && isIPC && isUpdate && ga1400Flag"
            content="接入视图库设备"
            placement="top"
          >
            <el-button class="add-btn" type="text" @click="addTabPane">
              <svg-icon name="plus" />
            </el-button>
          </el-tooltip>
          <div v-show="activeTabPane === 'video'">
            <el-form-item label="接入协议:" prop="inProtocol">
              <el-radio-group v-model="form.inProtocol">
                <el-radio
                  label="gb28181"
                >
                  {{ form.inProtocol && form.inProtocol.toUpperCase() }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="设备类型:" prop="deviceType">
              <el-select
                v-model="form.deviceType"
                placeholder="请选择"
                disabled
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
            <el-form-item label="设备IP:" prop="deviceIp">
              <el-input v-model="form.deviceIp" />
            </el-form-item>
            <el-form-item label="设备端口:" prop="devicePort">
              <el-input v-model="form.devicePort" />
            </el-form-item>
            <!-- v-if="isShowGbIdEditor"  -->
            <el-form-item label="国标ID:" prop="gbId">
              <el-input v-model="form.gbId" />
              <div class="form-tip">
                用户可自行录入规范国标ID，未录入该项，平台会自动生成规范国标ID。
              </div>
            </el-form-item>
            <el-form-item v-if="form.parentDeviceId === '-1'" prop="enabledGB35114">
              <template slot="label">
                GB35114协议:
                <el-popover
                  placement="top-start"
                  title="GB35114协议"
                  width="400"
                  trigger="hover"
                  :open-delay="300"
                  :content="tips.enabledGB35114"
                >
                  <svg-icon
                    slot="reference"
                    class="form-question"
                    name="help"
                  />
                </el-popover>
              </template>
              <el-switch
                v-model="form.enabledGB35114"
                :active-value="true"
                :inactive-value="false"
              />
            </el-form-item>
            <el-form-item v-if="!form.enabledGB35114" v-show="form.parentDeviceId === '-1'" label="GB28181凭证:" prop="userName">
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
                  <svg-icon
                    slot="reference"
                    class="form-question"
                    name="help"
                  />
                </el-popover>
              </template>
              <el-switch
                v-model="form.pullType"
                :active-value="1"
                :inactive-value="2"
              />
            </el-form-item>
            <el-form-item
              v-if="
                form.deviceType === 'nvr' ||
                  form.deviceType === 'platform' ||
                  isIPC
              "
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
                  <svg-icon
                    slot="reference"
                    class="form-question"
                    name="help"
                  />
                </el-popover>
              </template>
              <el-switch
                v-model="form.transPriority"
                active-value="tcp"
                inactive-value="udp"
              />
            </el-form-item>
            <el-form-item label="设备MAC地址:" prop="macAddr">
              <el-input v-model="form.macAddr" />
            </el-form-item>
            <el-form-item
              v-if="form.deviceType !== 'nvr'"
              label="杆号:"
              prop="poleId"
            >
              <el-input v-model="form.poleId" />
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
          </div>
          <div v-show="activeTabPane === 'view' && isIPC">
            <el-form
              ref="ga1400Form"
              :rules="ga1400Rules"
              :model="ga1400Form"
              label-position="right"
              label-width="150px"
            >
              <el-form-item label="接入协议:" prop="inProtocol">
                <el-radio-group v-model="ga1400Form.inProtocol">
                  <el-radio
                    label="GA1400"
                  >
                    {{ ga1400Form.inProtocol && ga1400Form.inProtocol.toUpperCase() }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="接入类型:" prop="apeType">
                <el-select
                  v-model="ga1400Form.apeType"
                  placeholder="请选择"
                  @change="clearValidate"
                >
                  <el-option
                    v-for="item in apeTypeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="GA1400凭证:" prop="certId">
                <el-select
                  v-model="ga1400Form.certId"
                  :loading="loading.account"
                >
                  <el-option
                    v-for="item in ga1400AccountList"
                    :key="item.id"
                    :label="item.userName"
                    :value="item.id"
                  />
                </el-select>
                <el-button
                  type="text"
                  class="ml10"
                  @click="openDialog('createGa1400Certificate')"
                >
                  新建GA1400凭证
                </el-button>
              </el-form-item>
              <el-form-item label="IP:" prop="ipAddr">
                <el-input v-model="ga1400Form.ipAddr" />
              </el-form-item>
              <el-form-item label="端口:" prop="port">
                <el-input v-model="ga1400Form.port" />
              </el-form-item>
            </el-form>
          </div>
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
        <el-form-item
          v-show="form.deviceType !== 'platform'"
          label="经纬度:"
          prop="longlat"
        >
          <el-input v-model="form.deviceLongitude" class="longlat-input" /> :
          <el-input v-model="form.deviceLatitude" class="longlat-input" />
        </el-form-item>
        <el-form-item
          :label="isUpdate && ifUseDeviceName ? '通道实际名称:' : '通道名称:'"
          prop="channelName"
          class="form-with-tip"
        >
          <el-input
            v-model="form.channelName"
            :disabled="isUpdate && ifUseDeviceName"
          />
          <div class="form-tip">
            2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。
          </div>
        </el-form-item>
        <el-form-item label="设备SN码:" prop="serialNumber">
          <el-input v-model="form.serialNumber" />
        </el-form-item>
        <el-form-item label="设备型号:" prop="deviceModel">
          <el-input v-model="form.deviceModel" />
        </el-form-item>
        <el-form-item label="杆号:" prop="poleId">
          <el-input v-model="form.poleId" />
        </el-form-item>
        <el-form-item v-if="isUpdate && !disableResourceTab" label="配置资源包:" prop="resources">
          <ResourceTabs
            v-model="form.resources"
            :is-update="isUpdate"
            :actions="actions"
            :in-protocol="form.inProtocol"
            :is-private-in-network="isPrivateInNetwork"
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
        <el-button
          v-if="!isChannel && activeStep === 1"
          type="primary"
          @click="stepChange(0)"
        >
          上一步
        </el-button>
        <el-button
          v-if="!isChannel && activeStep === 0"
          type="primary"
          @click="stepChange(1)"
        >
          下一步
        </el-button>
        <el-button
          v-if="isChannel || activeStep === 1"
          type="primary"
          :loading="submitting"
          :disabled="ifDisbled"
          @click="submit"
        >
          确 定
        </el-button>
        <el-button @click="back">取 消</el-button>
      </el-form-item>
    </el-form>
    <create-gb28181-certificate
      v-if="dialog.createGb28181Certificate"
      @on-close="closeDialog('createGb28181Certificate', ...arguments)"
    />
    <create-ga1400-certificate
      v-if="dialog.createGa1400Certificate"
      @on-close="closeDialog('createGa1400Certificate', ...arguments)"
    />
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import createMixin from '../mixin/createMixin'
import { pick } from 'lodash'
import { DeviceGb28181Type } from '@/dics'
import {
  createDevice,
  updateDevice,
  getDevice,
  validGbId,
  createViewLib,
  getViewLibInfo,
  updateViewLib
} from '@/api/device'
import { updateDeviceResources } from '@/api/billing'
import { getList as getGa1400List } from '@/api/certificate/ga1400'
import { getList as getGbList } from '@/api/certificate/gb28181'
import CreateGb28181Certificate from '@/views/certificate/gb28181/components/CreateDialog.vue'
import CreateGa1400Certificate from '@/views/certificate/ga1400/components/CreateDialog.vue'
import { ViewLib2Device } from '../viewLibParamsTransform'
import { UserModule } from '@/store/modules/user'
import { previewAuthActions } from '@/api/accessManage'

@Component({
  name: 'CreateGb28181Device',
  components: {
    CreateGb28181Certificate,
    CreateGa1400Certificate
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
    gbId: [{ validator: this.validateGbId, trigger: 'blur' }],
    industryCode: [
      { required: true, message: '请选择所属行业', trigger: 'blur' }
    ],
    networkCode: [
      { required: true, message: '请选择网络标识', trigger: 'blur' }
    ],
    userName: [{ required: true, message: '请选择账号', trigger: 'change' }],
    deviceIp: [{ validator: this.validateDeviceIp, trigger: 'blur' }],
    devicePort: [{ validator: this.validateDevicePort, trigger: 'change' }],
    gbRegion: [
      { required: true, message: '请选择设备地址', trigger: 'change' }
    ],
    longlat: [
      { required: true, message: '请选择经纬度', trigger: 'blur' },
      { validator: this.validateLonglat, trigger: 'blur' }
    ],
    macAddr: [{ validator: this.validateMacAddr, trigger: 'blur' }],
    poleId: [{ validator: this.validatePoleId, trigger: 'blur' }],
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

  private apeTypeList = [
    // { label: '视频卡口', value: 'Tollgate' },
    { label: '视图采集设备', value: 'APE' }
  ]

  private gbAccountList = []
  private ga1400AccountList = []
  public form: any = {
    dirId: '',
    groupId: '',
    inProtocol: this.inProtocol,
    deviceId: '',
    deviceName: '',
    deviceType: '',
    deviceVendor: '',
    gbVersion: '2016',
    deviceIp: '',
    devicePort: null,
    macAddr: '',
    channelSize: null,
    // channelNum: '',
    channelName: '',
    description: '',
    createSubDevice: 1,
    pullType: 1,
    transPriority: 'tcp',
    parentDeviceId: '-1',
    gbId: '',
    poleId: '',
    enabledGB35114: false,
    userName: '',
    longlat: 'required',
    deviceLongitude: '0.000000',
    deviceLatitude: '0.000000',
    serialNumber: '',
    deviceModel: '',
    gbRegion: '',
    gbRegionLevel: null,
    resources: [],
    vssAIApps: [],
    aIApps: [],
    industryCode: '',
    networkCode: ''
  }

  private minChannelSize = 1
  private availableChannels: Array<number> = []
  private dialog = {
    createGb28181Certificate: false,
    createGa1400Certificate: false
  }

  private hasViewLib = false

  private created() {
    this.getIfUseDeviceName()
  }

  public actions = {}

  public async mounted() {
    if (this.isUpdate || this.isChannel) {
      await this.getDeviceInfo()
      this.isChannel && !this.isUpdate && (this.form.deviceVendor = this.deviceVendorList[0])
    } else {
      this.form.dirId = this.dirId
      this.form.deviceVendor = this.deviceVendorList[0]
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
    this.getGbAccounts()
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
      const info = await getDevice({
        deviceId: this.form.deviceId,
        inProtocol: this.inProtocol
      })
      if (info.apeId) {
        this.hasViewLib = true
        await this.getViewLibInfo()
      }
      const usedChannelNum = info.deviceChannels.map((channel: any) => {
        return channel.channelNum
      })
      if (this.isUpdate) {
        this.form = Object.assign(
          this.form,
          pick(info, [
            'groupId',
            'dirId',
            'deviceId',
            'deviceName',
            'inProtocol',
            'deviceType',
            'deviceVendor',
            'gbVersion',
            'deviceIp',
            'devicePort',
            'channelNum',
            'channelName',
            'description',
            'createSubDevice',
            'pullType',
            'transPriority',
            'parentDeviceId',
            'gbId',
            'userName',
            'enabledGB35114',
            'deviceLongitude',
            'deviceLatitude',
            'serialNumber',
            'deviceModel',
            'gbRegion',
            'gbRegionLevel',
            'industryCode',
            'networkCode',
            'poleId',
            'macAddr',
            'deviceClass',
            'platFormMsg'
          ])
        )
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
    } else if (type === 'createGa1400Certificate' && payload === true) {
      this.getGa1400Accounts()
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
   * 获取ga1400账号
   */
  private async getGa1400Accounts() {
    try {
      this.loading.account = true
      const res = await getGa1400List({
        pageSize: 1000
      })
      this.ga1400AccountList = res.data
    } catch (e) {
      console.error(e)
    } finally {
      this.loading.account = false
    }
  }

  /**
   * 获取是否使用设备名称
   */
  private getIfUseDeviceName() {
    this.setIfUseDeviceName()
    // 新增逻辑，使用设备名称时，屏蔽效验正则
    if (this.ifUseDeviceName) {
      this.rules = {
        ...this.rules,
        ...{
          channelName: [
            { required: true, message: '请输入设备名称', trigger: 'blur' }
          ]
        }
      }
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
            'enabledGB35114',
            'deviceLongitude',
            'deviceLatitude',
            'gbId',
            'gbRegion',
            'gbRegionLevel',
            'industryCode',
            'networkCode'
          ])
        )
        // 强制转换gbRegionLevel字段类型
        params.gbRegionLevel = parseInt(params.gbRegionLevel)
        // 强制转换设备端口字段类型
        params.devicePort = parseInt(params.devicePort)
        // IPC类型添加额外参数
        if (this.isIPC) {
          params = Object.assign(params, {
            gbVersion: this.form.gbVersion,
            transPriority: this.form.transPriority,
            serialNumber: this.form.serialNumber,
            deviceModel: this.form.deviceModel
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
            gbId: this.form.gbId,
            transPriority: this.form.transPriority
          })
        }
        // 使用35114不需要国标凭证
        if (this.form.enabledGB35114) {
          delete params.userName
          delete params.password
        }
      } else {
        // NVR通道
        params = Object.assign(
          params,
          {
            deviceType: 'ipc',
            createSubDevice: this.isUpdate ? null : '2',
            parentDeviceId: this.isUpdate
              ? this.form.parentDeviceId
              : this.deviceId,
            channelName: this.form.channelName,
            channelNum: this.form.channelNum,
            serialNumber: this.form.serialNumber,
            deviceModel: this.form.deviceModel
          },
          pick(this.form, ['userName', 'deviceLongitude', 'deviceLatitude'])
        )
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
        // 更新设备信息
        await updateDevice(params)
        // 更新视图库
        if (this.tabPaneList.length !== 1) {
          if (this.hasViewLib) {
            await updateViewLib([
              this.deviceId,
              {
                certId: this.ga1400Form.certId,
                ipAddr: this.ga1400Form.ipAddr,
                port: String(this.ga1400Form.port)
              }
            ])
          } else {
            await this.createOrUpdateViewLib()
          }
        }
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
   * 创建或修改视图库
   */
  private async createOrUpdateViewLib() {
    if (this.tabPaneList.length !== 1) {
      const params = {
        inProtocol: this.ga1400Form.inProtocol,
        apeType: this.ga1400Form.apeType,
        certId: this.ga1400Form.certId,
        ipAddr: this.ga1400Form.ipAddr,
        port: this.ga1400Form.port
      }
      // 载入公共参数
      const commonParams = [
        'latitude',
        'longitude',
        'name',
        'deviceType',
        'dirId',
        'placeCode',
        'groupId',
        'orgCode',
        'gbDeviceId',
        'model'
      ]
      commonParams.forEach((param) => {
        params[param] = this.form[ViewLib2Device[param]]
      })
      await createViewLib(params)
    }
  }

  /**
   * 获取视图库信息
   */
  private async getViewLibInfo() {
    // console.log(this.hasViewLib)
    const { data } = await getViewLibInfo({ deviceId: this.deviceId })
    this.tabPaneList.push({ label: '视图接入', name: 'view' })
    this.ga1400Form.apeType = data.apeType
    this.ga1400Form.certId = data.certId
    this.ga1400Form.ipAddr = data.ipAddr
    this.ga1400Form.port = data.port
  }

  /**
   * 校验MAC地址
   */
  private async validateMacAddr(rule: any, value: string, callback: Function) {
    const reg1 = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/
    const reg2 = /^([0-9A-Fa-f]{2}[-]){5}([0-9A-Fa-f]{2})$/
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
    if (value && !/^[0-9]{20}$/.test(value)) {
      callback(new Error('请输入规范国标ID'))
    } else if (value) {
      try {
        validInfo = await validGbId({
          deviceId: this.deviceId,
          inProtocol: this.form.inProtocol,
          gbId: this.form.gbId
        })
        if (validInfo && !validInfo.isValidGbId) {
          callback(new Error('存在重复国标ID'))
        } else {
          callback()
        }
      } catch (e) {
        console.log(e)
      }
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

.process {
  padding: 20px 30px;
  border-bottom: 1px solid $borderGrey;

  .el-steps--simple {
    width: 400px;
    background: none;
    padding: 0;

    ::v-deep {
      .el-step.is-simple .el-step__head {
        padding-right: 15px;
      }

      .el-step.is-simple .el-step__arrow {
        margin-right: 15px;
        align-self: center;
        height: 0;
        border-bottom: 2px solid $primary;

        &:before,
        &:after {
          content: none;
        }
      }

      .el-step__title {
        flex: 0 0 80px;
        color: #000;
      }

      .el-step__icon {
        width: 30px;
        height: 30px;
        font-size: 16px;
        font-weight: bold;
      }

      .is-success {
        .el-step__icon {
          color: $primary;
          border-color: $primary;
        }
      }

      .is-process {
        .el-step__icon {
          background: $primary;
          color: #fff;
          border-color: $primary;
        }
      }

      .is-wait,
      .is-finish {
        color: $textGrey;

        .el-step__icon {
          border-color: $textGrey;
        }
      }

      .is-finish {
        .el-step__icon {
          background: #bbb;
          color: #fff;
          border-color: #bbb;
        }
      }
    }
  }
}

.step-container {
  position: relative;

  .add-btn {
    position: absolute;
    width: 2em;
    top: 5px;
    left: 100px;
    z-index: 1000;
  }
}
</style>
