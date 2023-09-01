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
        <el-form-item label="上级视图编码:" prop="apsId">
          <el-input v-model="form.apsId" />
        </el-form-item>
        <el-form-item label="用户名:" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码:" prop="password">
          <el-input v-model="form.password" />
        </el-form-item>
        <el-form-item label="上级服务器IP:" prop="ipAddr">
          <el-input v-model="form.ipAddr" class="short-width" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="上级服务器端口:" prop="port">
          <el-input v-model.number="form.port" class="short-width" placeholder="请输入端口号" />
        </el-form-item>
        <el-form-item prop="regionCode" class="form-with-tip">
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
            v-model="form.regionCode"
            placeholder="请选择"
            :options="regionList"
          />
        </el-form-item>
        <el-form-item label="网络类型:" prop="network">
          <el-radio-group v-model="form.network">
            <el-radio label="internal">互联网</el-radio>
            <el-radio label="private">专线网络</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="心跳周期:" prop="keepaliveInterval">
          <el-input v-model.number="form.keepaliveInterval" class="short-width" /> 秒
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
import { createViewLibUpPlatform, updateViewLibUpPlatform } from '@/api/viid'
import { getRegions } from '@/api/region'
import { pick } from 'lodash'

@Component({
  name: 'CreateUpPlatform'
})
export default class extends Vue {
  private breadCrumbContent = ''
  private form: any = {
    name: '',
    apsId: '',
    regionCode: '',
    network: 'internal',
    username: '',
    password: '',
    ipAddr: '',
    port: '',
    keepaliveInterval: 60,
    description: null
  }
  private cascadeViidId = ''
  private submitting = false
  private loading = false
  private regionList = []

  private rules = {
    name: [
      { required: true, message: '请输入级联平台名称', trigger: 'blur' }
    ],
    apsId: [
      { required: true, message: '请输入视图编码', trigger: 'blur' },
      { validator: this.validateApsId, trigger: 'blur' }
    ],
    regionCode: [
      { required: true, message: '请选择级联区域', trigger: 'blur' }
    ],
    network: [
      { required: true, message: '请选择网络类型', trigger: 'blur' }
    ],
    username: [
      { required: true, message: '请填写用户名', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请填写密码', trigger: 'blur' }
    ],
    ipAddr: [
      { required: true, message: '请输入服务器IP地址', trigger: 'blur' },
      { validator: this.validateSipIp, trigger: 'blur' }
    ],
    port: [
      { required: true, message: '请输入服务器端口', trigger: 'blur' },
      { validator: this.validateSipPort, trigger: 'blur' }
    ]
  }

  private get isUpdate() {
    return this.$route.name === 'ViidUpPlatformUpdate'
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
    const platformDetails: any = this.$route.params.platformDetails
    Object.assign(this.form, pick(platformDetails, ['name', 'apsId', 'network', 'username', 'password', 'ipAddr', 'port', 'keepaliveInterval', 'description']))
    this.cascadeViidId = platformDetails.cascadeViidId
    this.form.regionCode = this.getRegionPath(this.regionList, platformDetails.regionCode)
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

  private back() {
    this.$router.push('/viid/up-platform')
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.submitting = true
          const params = Object.assign({}, this.form)
          params.regionCode = this.form.regionCode && this.form.regionCode[1]
          if (this.isUpdate) {
            await updateViewLibUpPlatform([this.cascadeViidId, params])
            this.$message.success('修改向上级联平台成功！')
          } else {
            await createViewLibUpPlatform(params)
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
   * 校验视图编码
   */
  private validateApsId(rule: any, value: string, callback: Function) {
    if (!/^[0-9]{20}$/.test(value)) {
      callback(new Error('视图标编码为20位数字'))
    } else {
      callback()
    }
  }

  /**
   * 校验服务IP格式
   */
  private validateSipIp(rule: any, value: string, callback: Function) {
    if (value && !/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(value)) {
      callback(new Error('IP格式不正确'))
    } else {
      callback()
    }
  }

  /**
   * 校验服务端口格式
   */
  private validateSipPort(rule: any, value: string, callback: Function) {
    if (!/^[0-9]+$/.test(value)) {
      callback(new Error('端口格式不正确'))
    } else {
      callback()
    }
  }

  /**
   * 校验心跳间隔（秒）格式
   */
  // private validateRegisterInterval(rule: any, value: string, callback: Function) {
  //   if (value && !/^[0-9]*$/.test(value)) {
  //     callback(new Error('格式不正确'))
  //   } else {
  //     callback()
  //   }
  // }
}
</script>

<style lang="scss" scoped>
.app-container {
  .el-textarea,
  .el-input {
    width: 400px;
  }

  .short-width {
    width: 200px;
  }
}

</style>
