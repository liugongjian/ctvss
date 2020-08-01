<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-form
      ref="dataForm"
      :rules="rules"
      :model="form"
      label-position="right"
      label-width="140px"
    >
      <template v-if="!isNVR">
        <el-form-item label="设备类型:" prop="deviceType">
          <el-select v-model="form.deviceType" placeholder="请选择">
            <el-option v-for="item in deviceTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.deviceType === 'nvr'" label="自动创建子设备:" prop="createSubDevice" class="form-with-tip">
          <el-switch v-model="form.createSubDevice" active-value="1" inactive-value="2" />
          <div class="form-tip">当开启自动创建NVR子设备时，系统将自动为子设备分配通道号和通道名称。</div>
        </el-form-item>
        <el-form-item v-if="form.deviceType === 'nvr' && form.createSubDevice === '1'" label="子设备数量:" prop="channelSize">
          <el-input-number v-model="form.channelSize" type="number" />
        </el-form-item>
        <el-form-item label="国标版本:" prop="gbVersion">
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
          <div class="form-tip">4-16位，可包含大小写字母、数字、中划线。</div>
        </el-form-item>
        <el-form-item label="设备IP:" prop="deviceIp">
          <el-input v-model="form.deviceIp" />
        </el-form-item>
        <el-form-item label="设备端口:" prop="devicePort">
          <el-input v-model.number="form.devicePort" />
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
        <el-form-item label="自动拉流:" prop="pullType" class="form-with-tip">
          <el-switch v-model="form.pullType" active-value="1" inactive-value="2" />
          <div class="form-tip">开启自动拉流时，国标设备注册成功后自动启动拉流；否则，需要通过触发的方式启动拉流。</div>
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
          <el-input v-model="form.channelNum" />
        </el-form-item>
        <el-form-item label="通道名称:" prop="channelName" class="form-with-tip">
          <el-input v-model="form.channelName" />
          <div class="form-tip">4-16位，可包含大小写字母、数字、中划线。</div>
        </el-form-item>
        <el-form-item label="设备描述:" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入设备描述，如设备用途" />
        </el-form-item>
      </template>
      <el-form-item label="">
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="back">取 消</el-button>
      </el-form-item>
    </el-form>
    <create-gb28181-certificate v-if="dialog.createGb28181Certificate" @on-close="closeDialog('createGb28181Certificate', ...arguments)" />
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Inject } from 'vue-property-decorator'
import { pick } from 'lodash'
import { DeviceModule } from '@/store/modules/device'
import { DeviceType } from '@/dics'
import { createDevice } from '@/api/device'
import { getList as getGbList } from '@/api/certificate/gb28181'
import CreateGb28181Certificate from '@/views/certificate/gb28181/components/CreateDialog.vue'

@Component({
  name: 'CreateDevice',
  components: {
    CreateGb28181Certificate
  }
})
export default class extends Vue {
  @Inject('initDirs') private initDirs!: Function
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
    channelSize: [
      { required: true, message: '请填写子设备数量', trigger: 'blur' }
    ],
    channelNum: [
      { required: true, message: '请填写通道号', trigger: 'blur' },
      { validator: this.validateChannelNum, trigger: 'blur' }
    ],
    userName: [
      { required: true, message: '请选择账号', trigger: 'change' }
    ]
  }
  private deviceVendorList = ['海康', '大宇', '其他']
  private gbVersionList = ['2011', '2016']
  private deviceTypeList = Object.values(DeviceType).map(type => {
    return {
      label: type,
      value: type.toLowerCase()
    }
  })
  private gbAccountList = {
    normal: [],
    anonymous: []
  }
  private form = {
    groupId: '',
    dirId: '',
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
    createSubDevice: '1',
    pullType: '1'
  }
  private dialog = {
    createGb28181Certificate: false
  }
  private loading = {
    account: false
  }

  private get isNVR() {
    return this.$route.query.type === 'nvr'
  }

  private get breadCrumbContent() {
    let title = this.$route.meta.title
    if (this.isNVR) {
      title = title.replace('设备', '子设备')
    }
    return title
  }

  private get breadcrumb() {
    return DeviceModule.breadcrumb
  }

  private mounted() {
    this.form.groupId = this.$route.query.groupId.toString()
    this.form.dirId = this.$route.query.id ? this.$route.query.id.toString() : '0'
    this.getGbAccounts()
  }

  /**
   * 校验设备/通道名称
   */
  private validateDeviceName(rule: any, value: string, callback: Function) {
    if (!/[0-9a-zA-Z-]{4,16}/.test(value)) {
      callback(new Error('设备名称格式错误'))
    } else {
      callback()
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

  private back() {
    this.$router.push({
      name: 'device-list',
      query: this.$route.query
    })
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
          let params = pick(this.form, ['groupId', 'dirId', 'deviceName', 'deviceVendor', 'description'])
          if (!this.isNVR) {
            // 非NVR子设备
            params = Object.assign(params, pick(this.form, ['deviceType', 'gbVersion', 'deviceIp', 'devicePort', 'pullType', 'userName']))
            if (this.form.deviceType === 'nvr') {
              // NVR子设备添加额外参数
              params = Object.assign(params, {
                channelSize: this.form.channelSize,
                createSubDevice: this.form.createSubDevice
              })
            }
          } else {
            // NVR子设备
            params = Object.assign(params, {
              deviceName: this.form.channelName,
              channelNum: this.form.channelNum
            })
          }
          await createDevice(params)
          this.back()
          this.initDirs()
        } catch (e) {
          console.log(e)
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
</style>
