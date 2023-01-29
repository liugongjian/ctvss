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
            @change=";(form.multiStreamSize = 1) && (form.autoStreamNum = 1)"
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
        <el-form-item label="厂商:" prop="deviceVendor">
          <el-select v-model="form.deviceVendor">
            <el-option key="海康" label="海康" value="海康" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本:" prop="ehomeVersion">
          <el-radio-group v-model="form.ehomeVersion">
            <el-radio-button
              v-for="item in ehomeVersionList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设备名称:" prop="deviceName" class="form-with-tip">
          <el-input v-model="form.deviceName" />
          <div class="form-tip">
            2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。
          </div>
        </el-form-item>
        <el-form-item v-if="form.ehomeVersion === '5.0'" label="EHOME凭证:" prop="userName">
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
            @click="openDialog('createEhomeCertificate')"
          >
            新建EHOME凭证
          </el-button>
        </el-form-item>
        <el-form-item label="设备IP:" prop="deviceIp">
          <el-input v-model="form.deviceIp" />
        </el-form-item>
        <el-form-item label="设备端口:" prop="devicePort">
          <el-input v-model.number="form.devicePort" />
        </el-form-item>
        <el-form-item label="设备MAC地址:" prop="macAddr">
          <el-input v-model="form.macAddr" />
        </el-form-item>
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
              :disabled="
                form.deviceType === 'nvr' && multiStreamSize.value === 3
              "
              @change="onMultiStreamSizeChange"
            >
              {{ multiStreamSize.label }}
            </el-radio>
          </el-radio-group>
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
            @change="onPullTypeChange"
          />
        </el-form-item>
        <el-form-item
          v-if="form.pullType === 1"
          label="自动拉取码流:"
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
          v-if="!isUpdate || form.industryCode || !form.gbId"
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
          v-if="(!isUpdate || form.networkCode || !form.gbId) && networkFlag"
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
        <!-- <el-form-item prop="transPriority">
          <template slot="label">
            TCP传输:
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
          <el-switch v-model="form.transPriority" active-value="tcp" inactive-value="udp" disabled />
        </el-form-item> -->
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
            <el-option key="海康" label="海康" value="海康" />
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
        <el-form-item :label="isUpdate && ifUseDeviceName ? '通道实际名称:' :'通道名称:' " prop="channelName" class="form-with-tip">
          <el-input v-model="form.channelName" :disabled="ifUseDeviceName" />
          <div class="form-tip">
            2-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。
          </div>
        </el-form-item>
        <el-form-item label="经纬度:" prop="longlat">
          <el-input v-model="form.deviceLongitude" class="longlat-input" /> :
          <el-input v-model="form.deviceLatitude" class="longlat-input" />
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
            @changeAiDisabledStatus="changeAiDisabledStatus"
          />
        </el-form-item>
      </template>
      <el-form-item label="">
        <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
        <el-button @click="back">取 消</el-button>
      </el-form-item>
    </el-form>
    <create-ehome-certificate
      v-if="dialog.createEhomeCertificate"
      @on-close="closeDialog('createEhomeCertificate', ...arguments)"
    />
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import createMixin from '../mixin/createMixin'
import { InType, DeviceRtspType } from '@/dics'
import { pick } from 'lodash'
import { createDevice, updateDevice, getDevice } from '@/api/device'
import { updateDeviceResources } from '@/api/billing'
import { getList as getEhomeList } from '@/api/certificate/ehome'
import CreateEhomeCertificate from '@/views/certificate/ehome/components/CreateDialog.vue'

@Component({
  name: 'CreateEhomeDevice',
  components: {
    CreateEhomeCertificate
  }
})
export default class extends Mixins(createMixin) {
  private rules = {
    deviceName: [
      { required: true, message: '请输入设备名称', trigger: 'blur' },
      { validator: this.validateDeviceName, trigger: 'blur' }
    ],
    userName: [
      { required: true, message: '请选择EHOME版本', trigger: 'change' }
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
    deviceIp: [
      { validator: this.validateDeviceIp, trigger: 'blur' }
    ],
    devicePort: [
      { validator: this.validateDevicePort, trigger: 'change' }
    ],
    gbRegion: [
      { required: true, message: '请选择设备地址', trigger: 'change' }
    ],
    industryCode: [
      { required: true, message: '请选择所属行业', trigger: 'blur' }
    ],
    networkCode: [
      { required: true, message: '请选择网络标识', trigger: 'blur' }
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
    userName: '',
    deviceType: 'ipc',
    ehomeVersion: '2.0',
    createSubDevice: 1,
    channelSize: '',
    channelNum: '',
    channelName: '',
    deviceIp: '',
    devicePort: null,
    macAddr: '',
    deviceVendor: '',
    description: '',
    multiStreamSize: 1,
    autoStreamNum: 1,
    pullType: 1,
    transPriority: 'tcp',
    parentDeviceId: '',
    gbId: '',
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

  private dialog = {
    createEhomeCertificate: false
  }

  private gbAccountList = []
  protected minChannelSize = 1
  private availableChannels: Array<number> = []
  private inTypeList = InType
  private deviceTypeList = Object.values(DeviceRtspType).map(type => {
    return {
      label: type,
      value: type.toLowerCase()
    }
  })

  private ehomeVersionList = ['2.0', '5.0']
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

  private created() {
    this.getIfUseDeviceName()
  }

  public async mounted() {
    if (this.isUpdate || this.isChannel) {
      await this.getDeviceInfo()
    } else {
      this.form.dirId = this.dirId
      this.form.deviceVendor = this.deviceVendorList[0]
    }
    this.form.inProtocol = this.inProtocol
    this.getEhomeAccounts()
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
      // const usedChannelNum = info.deviceChannels.map((channel: any) => {
      //   return channel.channelNum
      // })
      if (this.isUpdate) {
        this.form = Object.assign(
          this.form,
          pick(info, [
            'groupId',
            'dirId',
            'deviceId',
            'deviceName',
            'userName',
            'deviceType',
            'ehomeVersion',
            'createSubDevice',
            'deviceVendor',
            'deviceIp',
            'devicePort',
            'macAddr',
            'description',
            'multiStreamSize',
            'autoStreamNum',
            'pullType',
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
          this.form.channelSize = info.deviceStats.maxChannelSize
          // 编辑的时候，设置数量不得小于已创建的子通道channelSize或1
          this.minChannelSize = Math.max(info.deviceStats.channelSize, 1)
          // this.orginalChannelSize = this.form.channelSize
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
      }
      if (this.isChannel) {
        this.form.deviceName = info.deviceName
      }
      // 构建可选择的通道，排除已选择通道
      // if (this.isChannel && info.deviceStats) {
      //   const channelSize = info.deviceStats.maxChannelSize
      //   const availableChannels = []
      //   for (let i = 1; i <= channelSize; i++) {
      //     if (!~usedChannelNum.indexOf(i)) {
      //       availableChannels.push(i)
      //     }
      //   }
      //   this.availableChannels = availableChannels
      // } else if (this.isUpdate && info.deviceChannels.length) {
      //   this.availableChannels = usedChannelNum
      // }
    } catch (e) {
      this.$message.error(e.message)
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
    if (type === 'createEhomeCertificate' && payload === true) {
      this.getEhomeAccounts()
    }
  }

  /**
   * 获取ehome账号
   */
  private async getEhomeAccounts() {
    try {
      this.loading.account = true
      const res = await getEhomeList({
        inProtocol: 'ehome',
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
            { required: true, message: '请输入设备名称', trigger: 'blur' }]
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
        'description'
      ])
      if (this.isUpdate) {
        params = Object.assign(params, pick(this.form, ['deviceId', 'deviceLongitude', 'deviceLatitude']))
      } else {
        params = Object.assign(params, pick(this.form, ['resources', 'vssAIApps', 'deviceLongitude', 'deviceLatitude']))
      }
      // 针对ehome5.0添加凭证
      if (this.form.ehomeVersion === '5.0') {
        params.userName = this.form.userName
      }
      if (!this.isChannel) {
        // 通用参数
        params = Object.assign(params, pick(this.form, ['dirId', 'deviceType', 'deviceIp', 'devicePort', 'pullType', 'ehomeVersion', 'transPriority', 'multiStreamSize', 'gbRegion', 'gbRegionLevel', 'industryCode', 'networkCode']))
        if (this.form.pullType === 1) {
          params = Object.assign(params, pick(this.form, ['autoStreamNum']))
        }
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
          channelNum: this.form.channelNum,
          deviceName: this.form.deviceName
        })
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

.lainzhou-cascader {
  width: 400px;
}
</style>
