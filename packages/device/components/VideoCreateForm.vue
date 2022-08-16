<template>
  <div>
    <el-form
      ref="videoForm"
      :rules="rules"
      :model="videoForm"
      label-position="right"
      label-width="135px"
    >
      <el-form-item label="接入协议:" prop="inProtocol">
        <el-radio v-for="(value, key) in videoInProtocolType" :key="key" v-model="videoForm.inProtocol" :label="key">{{ value }}</el-radio>
      </el-form-item>
      <el-form-item label="国标版本:" prop="version">
        {{ videoForm.version }}
      </el-form-item>
      <el-form-item label="GB28181账号:" prop="userName">
        <el-select v-model="videoForm.userName" :loading="loading.account">
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
          v-model="videoForm.pullType"
          :active-value="1"
          :inactive-value="2"
        />
      </el-form-item>
      <el-form-item label="配置资源包:" prop="resources">
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
          <el-form-item label="设备IP:" prop="deviceIp">
            <el-input v-model="videoForm.deviceIp" />
          </el-form-item>
          <el-form-item label="设备端口:" prop="devicePort">
            <el-input v-model="videoForm.devicePort" />
          </el-form-item>
          <el-form-item label="自定义国标ID:" prop="gbId">
            <el-input v-model="videoForm.gbId" />
            <div class="form-tip">
              用户可自行录入规范国标ID，未录入该项，平台会自动生成规范国标ID。
            </div>
          </el-form-item>
          <el-form-item
            v-if="deviceForm.deviceType !== 'nvr'"
            label="杆号:"
            prop="poleId"
          >
            <el-input v-model="videoForm.poleId " />
          </el-form-item>
          <el-form-item label="设备MAC地址:" prop="macAddr">
            <el-input v-model="videoForm.macAddr" />
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
import { VideoInProtocolType } from '../dicts/index'
import { DeviceTips } from '../dicts/tips'
import CreateGb28181Certificate from '@/views/certificate/gb28181/components/CreateDialog.vue'
import ResourceTabs from './ResourceTabs.vue'
import { getList as getGbList } from '@/api/certificate/gb28181'

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
  private videoInProtocolType = VideoInProtocolType
  private showMore: boolean = false
  private videoForm = {
    inProtocol: 'gb28181',
    version: '2016/2018',
    userName: '',
    pullType: 1,
    resources: '',
    deviceIp: '',
    devicePort: '',
    gbId: '',
    vssAIApps: [],
    aIApps: []
  }
  rules = {}
  private gbAccountList = []
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
   * 当资源包改变时获取资源包详情（包含接入剩余设备数）
   */
  public onResourceChange(payload: any) {
    this.resourcesMapping = payload.mapping
    const form: any = this.$refs.videoForm
    !payload.isInit && form.validateField('resources')
  }

  // 接受子组件传来的VSSAIApps
  private changeVSSAIApps(res: any) {
    if (this.isUpdate) {
      this.videoForm.aIApps = res
    }
    this.videoForm.vssAIApps = res
  }
}
</script>
