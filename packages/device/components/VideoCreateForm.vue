<template>
  <div>
    <el-form
      ref="videoForm"
      :rules="rules"
      :model="videoForm"
      label-position="right"
      label-width="135px"
    >
      <el-form-item label="接入协议:" prop="inVideoProtocol">
        <el-radio v-for="(value, key) in videoInProtocolType" :key="key" v-model="videoForm.inVideoProtocol" :label="key">{{ value }}</el-radio>
      </el-form-item>
      <el-form-item v-if="checkVisible('inVersion')" label="版本:" prop="inVersion">
        <el-radio-group v-model="videoForm.inVersion">
          <el-radio-button
            v-for="(value, key) in ehomeVersion"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="checkVisible('deviceChannelSize')" label="子设备数量:" prop="deviceChannelSize">
        <el-input-number
          v-model="videoForm.deviceChannelSize"
          :min="minChannelSize"
          type="number"
        />
      </el-form-item>
      <el-form-item v-if="checkVisible('inUserName')" label="GB28181账号:" prop="inUserName">
        <el-select v-model="videoForm.inUserName" :loading="loading.account">
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
      <el-form-item v-if="checkVisible('deviceStreamSize')" label="主子码流数量:" prop="deviceStreamSize">
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
        <el-radio
          v-for="(value, key) in multiStreamSize"
          :key="key"
          v-model="videoForm.deviceStreamSize"
          :label="+key"
          :disabled="deviceForm.deviceType === 'nvr' && +key === 3 "
          @change="onMultiStreamSizeChange"
        >
          {{ value }}
        </el-radio>
      </el-form-item>
      <el-form-item v-if="checkVisible('deviceStreamAutoPull')" prop="deviceStreamAutoPull">
        <template slot="label">
          自动拉流:
          <el-popover
            placement="top-start"
            title="自动拉流"
            width="400"
            trigger="hover"
            :open-delay="300"
            :content="tips.deviceStreamAutoPull"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
        <el-switch
          v-model="videoForm.deviceStreamAutoPull"
          :active-value="1"
          :inactive-value="2"
        />
      </el-form-item>
      <el-form-item
        v-if="videoForm.deviceStreamAutoPull === 1 && checkVisible('deviceStreamPullIndex')"
        label="自动拉取码流:"
        prop="deviceStreamPullIndex"
      >
        <el-radio
          v-for="(value, key) in autoStreamNum"
          :key="key"
          v-model="videoForm.deviceStreamPullIndex"
          :label="+key"
          :disabled="+key > videoForm.deviceStreamSize"
        >
          {{ value }}
        </el-radio>
      </el-form-item>
      <el-form-item v-if="checkVisible('streamTransProtocol')" prop="streamTransProtocol">
        <template slot="label">
          优先TCP传输:
          <el-popover
            placement="top-start"
            title="优先TCP传输"
            width="400"
            trigger="hover"
            :open-delay="300"
            :content="tips.streamTransProtocol"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
        <el-switch
          v-model="videoForm.streamTransProtocol"
          active-value="tcp"
          inactive-value="udp"
        />
      </el-form-item>
      <el-form-item v-if="checkVisible('resources')" label="配置资源包:" prop="resources">
        <resource-tabs
          v-model="videoForm.resources"
          :is-private-in-network="deviceForm.inNetworkType === 'private'"
          :form-info="videoForm"
          :vss-ai-apps="videoForm.vssAIApps"
          @on-change="onResourceChange"
          @changevssaiapps="changeVSSAIApps"
        />
      </el-form-item>
      <div class="show-more" :class="{'show-more--expanded': showMore}">
        <el-form-item>
          <el-button class="show-more--btn" type="text" @click="showMore = !showMore">更多<i class="el-icon-arrow-down" /></el-button>
        </el-form-item>
        <div class="show-more--form">
          <el-form-item v-if="checkVisible('deviceIp')" label="设备IP:" prop="deviceIp">
            <el-input v-model="videoForm.deviceIp" />
          </el-form-item>
          <el-form-item v-if="checkVisible('devicePort')" label="设备端口:" prop="devicePort">
            <el-input v-model="videoForm.devicePort" />
          </el-form-item>
          <el-form-item v-if="checkVisible('outId')" label="自定义国标ID:" prop="outId">
            <el-input v-model="videoForm.outId" />
            <div class="form-tip">
              用户可自行录入规范国标ID，未录入该项，平台会自动生成规范国标ID。
            </div>
          </el-form-item>
          <el-form-item v-if="checkVisible('devicePoleId')" label="杆号:" prop="devicePoleId">
            <el-input v-model="videoForm.devicePoleId " />
          </el-form-item>
          <el-form-item v-if="checkVisible('deviceMac')" label="设备MAC地址:" prop="deviceMac">
            <el-input v-model="videoForm.deviceMac" />
          </el-form-item>
          <el-form-item v-if="checkVisible('deviceSerialNumber')" label="设备SN码:" prop="deviceSerialNumber">
            <el-input v-model="videoForm.deviceSerialNumber" />
          </el-form-item>
          <el-form-item v-if="checkVisible('deviceModel')" label="设备型号:" prop="deviceModel">
            <el-input v-model="videoForm.deviceModel" />
          </el-form-item>
        </div>
      </div>
    </el-form>
    <create-gb28181-certificate
      v-if="dialog.createGb28181Certificate"
      @on-close="closeDialog('createGb28181Certificate', ...arguments)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { VideoInProtocolType, EhomeVersion, MultiStreamSize, AutoStreamNum } from '../dicts/index'
import { DeviceTips } from '../dicts/tips'
import CreateGb28181Certificate from '@/views/certificate/gb28181/components/CreateDialog.vue'
import ResourceTabs from './ResourceTabs.vue'
import { getList as getGbList } from '@/api/certificate/gb28181'
import { validGbId } from '../api/device'
import { checkVisible } from '../utils/param'

@Component({
  name: 'VideoCreateForm',
  components: {
    CreateGb28181Certificate,
    ResourceTabs
  }
})
export default class extends Vue {
  @Prop({ default: () => {} })
  private deviceForm

  private tips = DeviceTips
  private ehomeVersion = EhomeVersion
  private videoInProtocolType = VideoInProtocolType
  private multiStreamSize = MultiStreamSize
  private autoStreamNum = AutoStreamNum
  private minChannelSize = 1
  private showMore: boolean = false
  private videoForm = {
    inVideoProtocol: 'gb28181',
    inVersion: '2.0',
    deviceChannelSize: 1,
    inUserName: '',
    deviceStreamSize: 1,
    deviceStreamAutoPull: 1,
    deviceStreamPullIndex: 1,
    streamTransProtocol: 'tcp',
    resources: [],
    vssAIApps: [],
    aIApps: [],
    deviceIp: '',
    devicePort: '',
    outId: '',
    devicePoleId: '',
    deviceMac: '',
    deviceSerialNumber: '',
    deviceModel: ''
  }
  rules = {
    inVideoProtocol: [
      { required: true, message: '请选择接入协议', trigger: 'change' }
    ],
    deviceChannelSize: [
      { required: true, message: '请填写子设备数量', trigger: 'blur' }
    ],
    inUserName: [
      { required: true, message: '请选择账号', trigger: 'change' }
    ],
    resources: [
      { required: true, validator: this.validateResources, trigger: 'blur' }
    ],
    deviceIp: [
      { validator: this.validateDeviceIp, trigger: 'blur' }
    ],
    devicePort: [
      { validator: this.validateDevicePort, trigger: 'change' }
    ],
    outId: [
      { validator: this.validateGbId, trigger: 'blur' }
    ],
    devicePoleId: [
      { validator: this.validatePoleId, trigger: 'blur' }
    ],
    deviceMac: [
      { validator: this.validateMacAddr, trigger: 'blur' }
    ]
  }
  private gbAccountList = []
  public orginalResourceIdList: Array<string> = []
  private isPrivateInNetwork = false
  private loading = {
    account: false
  }
  private dialog = {
    createGb28181Certificate: false
  }

  private mounted() {
    this.getGbAccounts()
  }

  /**
   * form-item显示判断
   */
  private checkVisible(prop) {
    return checkVisible(this.deviceForm.deviceType, this.videoForm.inVideoProtocol, prop)
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
   * 校验video表单
   */
  private validateVideoForm() {
    const videoForm: any = this.$refs.videoForm
    let validFlag = true
    videoForm.validate((valid) => {
      validFlag = valid
    })
    return validFlag
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
   * 码流数变化回调
   */
  private onMultiStreamSizeChange() {
    if (this.videoForm.deviceStreamSize < this.videoForm.deviceStreamPullIndex) {
      this.videoForm.deviceStreamPullIndex = this.videoForm.deviceStreamSize
    }
  }

  /**
   * 当资源包改变时获取资源包详情（包含接入剩余设备数）
   */
  public onResourceChange(payload: any) {
    this.resourcesMapping = payload.mapping
    const videoForm: any = this.$refs.videoForm
    !payload.isInit && videoForm.validateField('resources')
  }

  // 接受子组件传来的VSSAIApps
  private changeVSSAIApps(res: any) {
    if (this.isUpdate) {
      this.videoForm.aIApps = res
    }
    this.videoForm.vssAIApps = res
  }

  /**
   * 校验资源包
   */
  public validateResources(rule: any, value: string, callback: Function) {
    let hasVideo = false
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const remainError: any = []
    this.videoForm.resources.forEach((resource: any) => {
      // 剩余可接入设备数
      const remainDeviceCount = parseInt(this.resourcesMapping[resource.resourceId] && this.resourcesMapping[resource.resourceId].remainDeviceCount)
      const devicesCount = this.deviceForm.deviceType === 'ipc' ? 1 : this.videoForm.deviceChannelSize
      // 如果当前resourceId不在orginalResourceIdList，则表示该类型的资源包的值被更改。如果未更改则需要跳过数量判断。
      const isChanged = this.orginalResourceIdList.indexOf(resource.resourceId) === -1
      switch (resource.resourceType) {
        case 'VSS_VIDEO':
          hasVideo = true
          if (isChanged && devicesCount > remainDeviceCount) {
            remainError.push('视频包')
          }
          break
        case 'VSS_AI':
          if (isChanged && devicesCount > remainDeviceCount) {
            remainError.push('AI包')
          }
          break
        case 'VSS_UPLOAD_BW':
          break
      }
    })
    if (remainError.length) {
      callback(new Error(`${remainError.join(',')}接入设备余量不足，请增加包资源！`))
    // } else if (!this.isUpdate && !hasVideo && !hasUpload && !this.isPrivateInNetwork && !this.isFreeUser) {
    //   callback(new Error('资源包必须配置视频包与上行带宽包'))
    } else if (!this.isUpdate && !hasVideo && !this.isFreeUser) {
      callback(new Error('必须配置视频包'))
    // } else if (!this.isUpdate && !hasUpload && !this.isPrivateInNetwork && !this.isFreeUser) {
    //   callback(new Error('必须配置上行带宽包'))
    } else {
      callback()
    }
  }

  /**
   * 校验设备IP格式
   */
  public validateDeviceIp(rule: any, value: string, callback: Function) {
    if (value && !/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(value)) {
      callback(new Error('设备IP格式不正确'))
    } else {
      callback()
    }
  }

  /**
   * 校验端口号
   */
  public validateDevicePort(rule: any, value: string, callback: Function) {
    if (value && !/^[0-9]+$/.test(value)) {
      callback(new Error('设备端口仅支持数字'))
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
          inProtocol: this.videoForm.inVideoProtocol,
          gbId: this.videoForm.outId
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
}
</script>
