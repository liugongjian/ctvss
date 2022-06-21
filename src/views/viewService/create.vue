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
        <el-form-item label="视频编码:" prop="sipId">
          <el-input v-model="form.sipId" placeholder="请输入20位SIP服务国标编码" @change="onSipIdChange" />
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
        <el-form-item label="网络类型:" prop="cascadeNetWork">
          <el-radio-group v-model="form.cascadeNetWork">
            <el-radio label="public">公网</el-radio>
            <el-radio label="private">专线</el-radio>
            <el-radio label="internal">内网</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用户名:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="密码:" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="服务器IP地址:" prop="sipIp">
          <el-input v-model="form.sipIp" class="short-width" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="服务器端口:" prop="sipPort">
          <el-input v-model.number="form.sipPort" class="short-width" placeholder="请输入端口号" />
        </el-form-item>
        <el-form-item label="心跳周期:" prop="heartbeatInterval">
          <el-input v-model.number="form.heartbeatInterval" class="short-width" /> 秒
        </el-form-item>
        <el-form-item label="最大心跳次数:" prop="heartbeatInterval">
          <el-input v-model.number="form.heartbeatInterval" class="short-width" /> 次
        </el-form-item>
        <el-form-item label="描述:" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
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
import { createPlatform, updatePlatform, getPlatform } from '@/api/upPlatform'
import { createViewLibUpPlatform, updateViewLibUpPlatform } from '@/api/viewLib'
import { getRegions } from '@/api/region'

@Component({
  name: 'CreateUpPlatform'
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
    cascadeNetWork: 'public'
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
    gbId: [
      { validator: this.validateGbId, trigger: 'blur' }
    ],
    natIp: [
      { validator: this.validateNetIp, trigger: 'blur' }
    ]
  }

  private get isUpdate() {
    return this.$route.name === 'view-up-platform-update'
  }

  private async mounted() {
    this.breadCrumbContent = this.$route.meta.title
    await this.getRegionList()
    if (this.isUpdate) {
      this.getPlatformInfo()
    }
  }

  private async getPlatformInfo() {
    this.loading = true
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
    this.loading = false
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
   * “SIP服务国标域”默认截取“SIP服务国标编码”的前十位
   */
  private onSipIdChange(sipId: string) {
    const form: any = this.$refs.dataForm
    form.validateField('sipId', (e: string) => {
      if (!e) this.form.sipDomain = sipId.substring(0, 10)
    })
  }

  private back() {
    this.$router.push('/view-service/up-platform')
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
    let path: Array<any> = []
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
  .el-textarea, .el-input {
    width: 400px;
  }
  .short-width {
    width: 200px;
  }
}

</style>
