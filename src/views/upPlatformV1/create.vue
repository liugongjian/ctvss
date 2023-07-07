<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <el-form
        ref="dataForm"
        v-loading="loading"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="240px"
      >
        <el-form-item label="平台名称:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="SIP服务国标编码:" prop="sipId">
          <el-input v-model="form.sipId" placeholder="请输入20位SIP服务国标编码" @change="onSipIdChange" />
        </el-form-item>
        <el-form-item label="SIP服务国标域:" prop="sipDomain">
          <el-input v-model="form.sipDomain" placeholder="SIP服务国标域默认截取SIP服务国标编码的前10位" />
        </el-form-item>
        <el-form-item label="SIP服务IP:" prop="sipIp">
          <el-input v-model="form.sipIp" />
        </el-form-item>
        <el-form-item label="SIP服务端口:" prop="sipPort">
          <el-input v-model.number="form.sipPort" />
        </el-form-item>
        <el-form-item label="设备国标编号:" prop="gbId">
          <el-input v-model="form.gbId" />
        </el-form-item>
        <el-form-item prop="cascadeRegion" class="form-with-tip">
          <template slot="label">
            级联区域:
            <el-popover
              placement="top-start"
              title="级联区域"
              width="400"
              trigger="hover"
              :open-delay="300"
              content="级联区域，表示向上级平台级联的本级区域。"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-cascader
            v-model="form.cascadeRegion"
            placeholder="请选择"
            :options="regionList"
          />
        </el-form-item>
        <el-form-item v-if="isUpdate" label="级联映射:" prop="enabledNat">
          <template slot="label">
            级联映射:
            <el-popover
              placement="top-start"
              title="级联映射"
              width="400"
              trigger="hover"
              :open-delay="300"
              content="上级平台存在防火墙等情况时，需要开启该选项，并填写内部IP、端口。"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-switch v-model="form.enabledNat" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item v-if="form.enabledNat === 1" label="本地IP:" prop="natIp">
          <el-input v-model="form.natIp" />
        </el-form-item>
        <el-form-item v-if="form.enabledNat === 1" label="本地端口:" prop="natPort">
          <el-input v-model="form.natPort" />
        </el-form-item>
        <el-form-item label="网络类型:" prop="cascadeNetWork">
          <el-radio-group v-model="form.cascadeNetWork">
            <el-radio label="public">互联网</el-radio>
            <el-radio label="private">专线网络</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="开启鉴权:" prop="isAuth">
          <el-switch v-model="form.isAuth" />
        </el-form-item>
        <el-form-item v-if="form.isAuth" label="SIP认证用户名:" prop="sipUser">
          <el-input v-model="form.sipUser" placeholder="默认使用设备国标编号" />
        </el-form-item>
        <el-form-item v-if="form.isAuth" label="SIP认证密码:" prop="sipPassword">
          <el-input v-model="form.sipPassword" />
        </el-form-item>
        <el-form-item label="级联方式:" prop="cascadeType">
          <el-radio-group v-model.number="form.cascadeType">
            <el-radio :label="2">虚拟业务组</el-radio>
            <el-radio :label="1">行政区划</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="industryCode" label="所属行业">
          <el-select v-model="form.industryCode" placeholder="请选择所属行业">
            <el-option v-for="(item, index) in industryList" :key="index" :label="item.name" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="gbRegion" class="form-with-tip">
          <template slot="label">
            上级级联区域:
          </template>
          <AddressCascader
            :code="form.gbRegion"
            :level="form.gbRegionLevel"
            :disabled="false"
            @change="onDeviceAddressChange"
          />
        </el-form-item>
        <el-form-item label="注册周期（秒）:" prop="registerInterval">
          <template slot="label">
            注册周期:
            <el-popover
              placement="top-start"
              title="注册周期"
              width="400"
              trigger="hover"
              :open-delay="300"
              content="注册周期不小于300秒"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-input v-model.number="form.registerInterval" />
        </el-form-item>
        <el-form-item label="心跳周期（秒）:" prop="heartbeatInterval">
          <template slot="label">
            心跳周期:
            <el-popover
              placement="top-start"
              title="心跳周期"
              width="400"
              trigger="hover"
              :open-delay="300"
              content="心跳周期不小于60秒"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-input v-model.number="form.heartbeatInterval" />
        </el-form-item>
        <el-form-item label="信令传输:" prop="transType">
          <el-radio-group v-model="form.transType">
            <el-radio label="UDP">UDP</el-radio>
            <el-radio label="TCP">TCP</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="字符集:" prop="characterType">
          <el-radio-group v-model="form.characterType">
            <el-radio label="UTF-8">UTF-8</el-radio>
            <el-radio label="GB2312">GB2312</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限集合:" prop="permissionSet">
          <el-checkbox-group v-model="form.permissionSet">
            <el-checkbox label="PTZ">云台</el-checkbox>
            <el-checkbox label="RTCP">流保活</el-checkbox>
            <el-checkbox label="DOWDLOAD">录像下载</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="是否使用通道的实际名称">
          <template slot="label">
            是否使用通道的实际名称:
            <el-popover
              placement="top-start"
              title="是否使用通道的实际名称"
              width="400"
              trigger="hover"
              :open-delay="300"
              content="开启该功能，NVR通道向上级联使用通道的实际名称"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-switch v-model="form.enableLocalChannelName" :active-value="1" :inactive-value="0" />
          <div v-if="form.enableLocalChannelName" class="cname-tip">该功能仅限GB28181协议、EHOME协议，按钮开启时，其他协议无法获取到设备侧的实际名称</div>
        </el-form-item>
        <el-form-item label="描述:" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入设备描述，如设备用途" />
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" :loading="submitting" @click="submit">确定</el-button>
          <el-button @click="back">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { DeviceAddress } from '@/type/Device'
import { createPlatform, updatePlatform, getPlatform } from '@/api/upPlatform'
import { getRegions } from '@/api/region'
import { industryMap } from '@/assets/region/industry'
import AddressCascader from '@/views/components/AddressCascader.vue'

@Component({
  name: 'CreateUpPlatform',
  components: { AddressCascader }
})
export default class extends Vue {
  private breadCrumbContent = ''
  private form: any = {
    name: '',
    sipId: '',
    sipDomain: '',
    sipIp: '',
    sipPort: '',
    gbId: '',
    isCascadeMapping: false,
    cascadeRegion: null,
    isAuth: false,
    enabledNat: 0, // 未启用 0, 启用 1
    natIp: undefined,
    natPort: undefined,
    sipUser: '',
    sipPassword: '',
    registerInterval: 300,
    heartbeatInterval: 60,
    transType: 'UDP',
    characterType: 'UTF-8',
    permissionSet: [],
    description: '',
    enableLocalChannelName: 0, // 不使用 0， 使用 1
    cascadeNetWork: 'public',
    gbRegion: '',
    gbRegionLevel: '',
    industryCode: '',
    cascadeType: 2
  }
  private submitting = false
  private loading = false
  private regionList = []

  private rules = {
    name: [
      { required: true, message: '请输入级联平台名称', trigger: 'blur' }
    ],
    sipId: [
      { required: true, message: '请输入SIP服务国标编码', trigger: 'blur' },
      { validator: this.validateSipId, trigger: 'blur' }
    ],
    sipIp: [
      { required: true, message: '请输入SIP服务IP', trigger: 'blur' },
      { validator: this.validateSipIp, trigger: 'blur' }
    ],
    sipPort: [
      { required: true, message: '请输入SIP服务端口', trigger: 'blur' },
      { validator: this.validateSipPort, trigger: 'blur' }
    ],
    cascadeRegion: [
      { required: true, message: '请选择级联区域', trigger: 'blur' }
    ],
    gbRegion: [
      { required: true, message: '请选择级联区域', trigger: 'blur' }
    ],
    gbId: [
      { validator: this.validateGbId, trigger: 'blur' }
    ],
    natIp: [
      { validator: this.validateNetIp, trigger: 'blur' }
    ],
    registerInterval: [
      { required: true, message: '请输入注册周期（秒）', trigger: 'blur' },
      { validator: this.validateRegisterInterval, trigger: 'blur' }
    ],
    heartbeatInterval: [
      { required: true, message: '请输入心跳周期（秒）', trigger: 'blur' },
      { validator: this.validateHeartbeatInterval, trigger: 'blur' }
    ],
    transType: [
      { required: true, message: '请选择信令传输方式', trigger: 'change' }
    ],
    characterType: [
      { required: true, message: '请选择字符集', trigger: 'change' }
    ],
    cascadeNetWork: [
      { required: true, message: '请选择网络类型', trigger: 'change' }
    ],
    cascadeType: [
      { required: true, message: '请选择级联类型', trigger: 'change' }
    ],
    industryCode: [
      { required: true, message: '请选择所属行业', trigger: 'change' }
    ]
  }

  private get industryList() {
    return Object.keys(industryMap).map((key: any) => {
      return {
        name: industryMap[key],
        value: key
      }
    })
  }
  private get isUpdate() {
    return this.$route.name === 'up-platform-gb28121-update'
  }

  private async mounted() {
    this.breadCrumbContent = this.$route.meta.title
    await this.getRegionList()
    if (this.isUpdate) {
      this.getPlatformInfo()
    }
  }

  private async getPlatformInfo() {
    const platformId = this.$route.query.platformId
    const res = await getPlatform({
      platformId
    })
    const platform = res.platform
    if (platform.permissionSet) {
      platform.permissionSet = platform.permissionSet.split(',')
    } else {
      platform.permissionSet = []
    }
    if (platform.sipUser) {
      platform.isAuth = true
    }
    platform.cascadeRegion = this.getRegionPath(this.regionList, platform.cascadeRegion)
    this.form = Object.assign(this.form, platform)
  }

  /**
   * 获取区域列表
   */
  private async getRegionList() {
    this.loading = true
    try {
      this.regionList = await getRegions()
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 选择设备地址
   */
  public onDeviceAddressChange(region: DeviceAddress) {
    this.form.gbRegion = region.code
    this.form.gbRegionLevel = region.level
  }

  /**
   * “SIP服务国标域”默认截取“SIP服务国标编码”的前十位
   */
  private onSipIdChange(sipId: string) {
    const form: any = this.$refs.dataForm
    form.validateField('sipId', (e: string) => {
      if (!e) this.form.sipDomain = sipId.substring(0, 10)
    })
  }

  private back() {
    this.$router.push('/up-platform/gb28121')
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.submitting = true
          const params = Object.assign({}, this.form)
          params.cascadeRegion = this.form.cascadeRegion && this.form.cascadeRegion[1]
          params.permissionSet = this.form.permissionSet && this.form.permissionSet.join(',')
          if (!params.isAuth) {
            params.sipUser = ''
            params.sipPassword = ''
          }
          if (params.natPort === '') {
            params.natPort = 0
          }
          if (this.isUpdate) {
            await updatePlatform(params)
            this.$message.success('修改向上级联平台成功！')
          } else {
            await createPlatform(params)
            this.$message.success('创建向上级联平台成功！')
          }
          this.back()
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.submitting = false
        }
      }
    })
  }

  /**
   * 递归查找目标区域的所在路径
   */
  private getRegionPath(regions: any, target: string) {
    const path: Array<any> = []
    try {
      const _find: any = function(path: Array<string>, children: any, parentValue: any) {
        for (let i = 0; i < children.length; i++) {
          const item = children[i]
          item.children && _find(path, item.children, item.value)
          if (item.value === target) {
            path.push(parentValue)
            path.push(item.value)
            throw new Error('found')
          }
        }
      }
      _find(path, regions, null)
    // eslint-disable-next-line no-empty
    } catch (e) {}
    return path
  }

  /**
   * 校验SIP服务国标编码
   */
  private validateSipId(rule: any, value: string, callback: Function) {
    if (!/^[0-9]{20}$/.test(value)) {
      callback(new Error('SIP服务国标编码为20位数字'))
    } else {
      callback()
    }
  }

  /**
   * 校验设备国标编号
   */
  private validateGbId(rule: any, value: string, callback: Function) {
    if (value && !/^[0-9]{20}$/.test(value)) {
      callback(new Error('设备国标编号为20位数字'))
    } else {
      callback()
    }
  }

  /**
   * 校验SIP服务IP格式
   */
  private validateSipIp(rule: any, value: string, callback: Function) {
    if (value && !/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(value)) {
      callback(new Error('SIP服务IP格式不正确'))
    } else {
      callback()
    }
  }

  /**
   * 校验SIP服务端口格式
   */
  private validateSipPort(rule: any, value: string, callback: Function) {
    if (!/^[0-9]+$/.test(value)) {
      callback(new Error('SIP服务端口格式不正确'))
    } else {
      callback()
    }
  }

  /**
   * 校验本地IP格式
   */
  private validateNetIp(rule: any, value: string, callback: Function) {
    if (value && !/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(value)) {
      callback(new Error('本地IP格式不正确'))
    } else {
      callback()
    }
  }

  /**
   * 校验注册周期（秒）格式
   */
  private validateRegisterInterval(rule: any, value: number, callback: Function) {
    if (value < 300) {
      callback(new Error('注册周期不小于300秒'))
    } else {
      callback()
    }
  }

  /**
   * 校验心跳周期（秒）格式
   */
  private validateHeartbeatInterval(rule: any, value: number, callback: Function) {
    if (value < 60) {
      callback(new Error('心跳周期不小于60秒'))
    } else {
      callback()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  ::v-deep .el-input,
  ::v-deep .el-textarea {
    width: 400px;
  }
  .cname-tip{
      font-size: 14px;
      color: #888888;
  }
}
</style>
