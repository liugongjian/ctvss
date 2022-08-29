<template>
  <div>
    <el-form
      ref="videoForm"
      :rules="rules"
      :model="videoForm"
      label-position="right"
      label-width="135px"
    >
      <el-form-item label="接入协议:" :prop="deviceEnum.InVideoProtocol">
        <el-radio
          v-for="(value, key) in inVideoProtocol[deviceForm.deviceType]"
          :key="key"
          v-model="videoForm.inVideoProtocol"
          :label="key"
          @change="inVideoProtocolChange"
        >
          {{ value }}
        </el-radio>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.VideoVendor)" label="厂商:" :prop="deviceEnum.VideoVendor">
        <el-select v-model="videoForm.videoVendor">
          <el-option
            v-for="(value, key) in deviceVendor[videoForm.inVideoProtocol]"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.InVersion)" label="版本:" :prop="deviceEnum.InVersion">
        <el-radio-group v-model="videoForm.inVersion">
          <el-radio-button
            v-for="(value, key) in versionByInVideoProtocol[videoForm.inVideoProtocol]"
            :key="key"
            :label="value"
            :value="key"
          />
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.DeviceChannelSize)" label="子设备数量:" :prop="deviceEnum.DeviceChannelSize">
        <el-input-number
          v-model="videoForm.deviceChannelSize"
          :min="minChannelSize"
          type="number"
        />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.InUserName)" label="GB28181账号:" :prop="deviceEnum.InUserName">
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
      <el-form-item v-if="checkVisible(deviceEnum.InType)" label="视频流接入方式:" :prop="deviceEnum.InType">
        <el-radio
          v-for="(value, key) in inType"
          :key="key"
          v-model="videoForm.inType"
          :label="key"
        >
          {{ value }}
        </el-radio>
      </el-form-item>
      <template v-if="videoForm.videoVendor === '其他' || checkVisible(deviceEnum.OnlyPullUrl)">
        <el-form-item v-if="checkVisible(deviceEnum.PullUrl)" label="拉流地址:" :prop="deviceEnum.PullUrl">
          <el-input v-model="videoForm.pullUrl" />
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item v-if="checkVisible(deviceEnum.UserName)" label="用户名:" :prop="deviceEnum.UserName">
          <el-input v-model="videoForm.userName" />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.Password)" label="密码:" :prop="deviceEnum.Password">
          <el-input v-model="videoForm.password" type="password" />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.EnableDomain)" label="是否启用域名:" :prop="deviceEnum.EnableDomain">
          <el-switch
            v-model="videoForm.enableDomain"
            :active-value="1"
            :inactive-value="2"
          />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.DeviceDomain)" label="设备域名:" :prop="deviceEnum.DeviceDomain">
          <el-input v-model="videoForm.deviceDomain" />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.DeviceIp)" label="设备IP:" :prop="deviceEnum.DeviceIp">
          <el-input v-model="videoForm.deviceIp" />
        </el-form-item>
        <el-form-item v-if="checkVisible(deviceEnum.DevicePort)" label="设备端口:" :prop="deviceEnum.DevicePort">
          <el-input v-model.number="videoForm.devicePort" />
        </el-form-item>
      </template>
      <el-form-item v-if="checkVisible(deviceEnum.DeviceStreamSize)" label="主子码流数量:" :prop="deviceEnum.DeviceStreamSize">
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
          v-for="(value, key) in deviceStreamSize"
          :key="key"
          v-model="videoForm.deviceStreamSize"
          :label="+key"
          :disabled="deviceForm.deviceType === 'nvr' && +key === 3 "
          @change="onDeviceStreamSizeChange"
        >
          {{ value }}
        </el-radio>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.DeviceStreamAutoPull)" :prop="deviceEnum.DeviceStreamAutoPull">
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
        v-if="checkVisible(deviceEnum.DeviceStreamPullIndex)"
        label="自动拉取码流:"
        :prop="deviceEnum.DeviceStreamPullIndex"
      >
        <el-radio
          v-for="(value, key) in deviceStreamPullIndex"
          :key="key"
          v-model="videoForm.deviceStreamPullIndex"
          :label="+key"
          :disabled="+key > videoForm.deviceStreamSize"
        >
          {{ value }}
        </el-radio>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.PushType)" :prop="deviceEnum.PushType">
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
          v-model="videoForm.pushType"
          :active-value="1"
          :inactive-value="2"
        />
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.StreamTransProtocol)" :prop="deviceEnum.StreamTransProtocol">
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
      <el-form-item v-if="checkVisible(deviceEnum.OutId)" label="自定义国标ID:" :prop="deviceEnum.OutId">
        <el-input v-model="videoForm.outId" />
        <div class="form-tip">
          用户可自行录入规范国标ID，未录入该项，平台会自动生成规范国标ID。
        </div>
      </el-form-item>
      <el-form-item v-if="checkVisible(deviceEnum.Resources)" label="配置资源包:" :prop="deviceEnum.Resources">
        <resource-tabs
          v-model="videoForm.resources"
          :is-private-in-network="deviceForm.inNetworkType === 'private'"
          :form-info="videoForm"
          :vss-ai-apps="videoForm.vssAIApps"
          @on-change="onResourceChange"
          @changevssaiapps="changeVSSAIApps"
        />
      </el-form-item>
      <div v-show="showMoreVisable" class="show-more" :class="{'show-more--expanded': showMore}">
        <el-form-item>
          <el-button class="show-more--btn" type="text" @click="showMore = !showMore">更多<i class="el-icon-arrow-down" /></el-button>
        </el-form-item>
        <div ref="showMoreForm" class="show-more--form">
          <el-form-item v-if="checkVisible(deviceEnum.Tags)" label="视频标签:" :prop="deviceEnum.Tags">
            <tags v-model="videoForm.tags" class="tags" />
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
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import VideoFormMixin from '../../mixin/videoFormMixin'
import { DeviceEnum, DeviceTypeEnum, InTypeEnum, InVideoProtocolEnum } from '../../enums/index'
import { InVideoProtocolByDeviceType, VersionByInVideoProtocol, DeviceVendor, InType, DeviceStreamSize, DeviceStreamPullIndex } from '../../dicts/index'
import { DeviceTips } from '../../dicts/tips'
import { getList as getGbList } from '@/api/certificate/gb28181'
import { validGbId } from '../../api/device'
import { checkVideoVisible } from '../../utils/param'
import CreateGb28181Certificate from '@/views/certificate/gb28181/components/CreateDialog.vue'
import ResourceTabs from '../ResourceTabs.vue'
import Tags from '../Tags.vue'

@Component({
  name: 'VideoCreateForm',
  components: {
    CreateGb28181Certificate,
    Tags,
    ResourceTabs
  }
})
export default class extends Mixins(VideoFormMixin) {
  @Prop({ default: () => {} })
  private deviceForm

  private deviceEnum = DeviceEnum
  private inVideoProtocolEnum = InVideoProtocolEnum
  private tips = DeviceTips
  private versionByInVideoProtocol = VersionByInVideoProtocol
  private deviceVendor = DeviceVendor
  private inVideoProtocol = InVideoProtocolByDeviceType
  private inType = InType
  private deviceStreamSize = DeviceStreamSize
  private deviceStreamPullIndex = DeviceStreamPullIndex
  private minChannelSize = 1
  private showMore: boolean = false
  private showMoreVisable: boolean = false
  public videoForm = {
    [DeviceEnum.InVideoProtocol]: InVideoProtocolEnum.Gb28181,
    [DeviceEnum.VideoVendor]: '',
    [DeviceEnum.InVersion]: '2016',
    [DeviceEnum.DeviceChannelSize]: 1,
    [DeviceEnum.InUserName]: '',
    [DeviceEnum.InType]: InTypeEnum.Pull,
    [DeviceEnum.PullUrl]: '',
    [DeviceEnum.UserName]: '',
    [DeviceEnum.Password]: '',
    [DeviceEnum.EnableDomain]: 2,
    [DeviceEnum.DeviceDomain]: '',
    [DeviceEnum.DeviceIp]: '',
    [DeviceEnum.DevicePort]: '',
    [DeviceEnum.DeviceStreamSize]: 1,
    [DeviceEnum.DeviceStreamAutoPull]: 1,
    [DeviceEnum.DeviceStreamPullIndex]: 1,
    [DeviceEnum.PushType]: 1,
    [DeviceEnum.StreamTransProtocol]: 'tcp',
    [DeviceEnum.OutId]: '',
    [DeviceEnum.Tags]: '',
    [DeviceEnum.Resources]: [],
    vssAIApps: [],
    aIApps: []
  }
  public orginalResourceIdList: Array<string> = []
  private isPrivateInNetwork = false

  /**
   * 设备类型变化
   */
  @Watch('deviceForm.deviceType')
  private deviceTypeChange() {
    this.videoForm.inVideoProtocol = this.inVideoProtocolEnum.Gb28181
  }

  private mounted() {
    this.getGbAccounts()
  }

  private updated() {
    this.checkIsShwoMore()
  }

  /**
   * 判断是否显示form-item
   */
  private checkVisible(prop) {
    return checkVideoVisible.call(this.videoForm, this.deviceForm.deviceType, this.videoForm.inVideoProtocol, prop)
  }

  /**
   * 判断是否显示更多下拉框
   */
  private checkIsShwoMore() {
    const showMoreForm = this.$refs.showMoreForm as HTMLDivElement
    this.showMoreVisable = showMoreForm.children.length !== 0
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
}
</script>
