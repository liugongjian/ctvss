<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="140px"
      >
        <el-form-item v-if="form.groupId" label="业务组Id:" prop="groupId">
          <el-input v-model="form.groupId" disabled />
        </el-form-item>
        <el-form-item label="业务组名称:" prop="groupName" class="form-with-tip">
          <el-input v-model="form.groupName" />
          <div class="form-tip">4-16位，可包含大小写字母、数字、中划线。空间名称不能重复。</div>
        </el-form-item>
        <el-form-item label="业务组描述:" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入业务组描述，如业务介绍或用途" />
        </el-form-item>
        <el-form-item label="服务区域:" prop="region" class="form-with-tip">
          <el-select v-model="form.region" placeholder="请选择">
            <el-option v-for="item in regionList" :key="item" :label="item" :value="item" />
          </el-select>
          <div class="form-tip">服务区域负责对流媒体进行实时处理，包括鉴权、拉流、转码、录制、截图等，请根据处理和存储需求选择</div>
        </el-form-item>
        <el-form-item label="接入类型:" prop="inProtocol">
          <el-radio-group v-model="form.inProtocol">
            <el-radio v-for="protocol in inProtocolList" :key="protocol" :label="protocol.toLocaleLowerCase()">{{ protocol }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="推流域名:" prop="pushDomainName" class="form-with-tip">
          <el-input v-model="form.pushDomainName" />
          <div class="form-tip">视频监控的推流域名，需要进行过备案。如不填写，系统将默认分配ip地址</div>
        </el-form-item>
        <el-form-item v-if="form.inProtocol!=='gb28181'" label="播流域名:" prop="pullDomainName">
          <el-input v-model="form.pullDomainName" />
          <div class="form-tip">视频监控的播流域名，需要进行过备案。如不填写，系统将默认分配ip地址</div>
        </el-form-item>
        <el-form-item label="播放类型:" prop="outProtocol">
          <el-checkbox-group v-model="form.outProtocol">
            <el-checkbox
              v-for="protocol in outProtocolList"
              :key="protocol"
              :label="protocol.toLocaleLowerCase()"
            >
              {{ protocol }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="submit">确定</el-button>
          <el-button @click="back">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { InProtocolType, OutProtocolType } from '@/dics'

@Component({
  name: 'CreateGroup'
})
export default class extends Vue {
  private breadCrumbContent = ''
  private rules = {
    groupName: [
      { required: true, message: '请输入业务组名称', trigger: 'blur' },
      { validator: this.validateGroupName, trigger: 'blur' }
    ],
    region: [
      { required: true, message: '请选择区域', trigger: 'change' }
    ],
    inProtocol: [
      { required: true, message: '请选择接入类型', trigger: 'change' }
    ],
    outProtocol: [
      { required: true, message: '请选择播放类型', trigger: 'change' },
      { validator: this.validateOutProtocol, trigger: 'change' }
    ]
  }
  private regionList = ['华东', '华南', '华北']
  private outProtocolList = Object.values(OutProtocolType)
  private inProtocolList = Object.values(InProtocolType)
  private form: any = {
    groupName: '',
    description: '',
    region: '华东',
    inProtocol: 'gb28181',
    outProtocol: [],
    pushDomainName: '',
    pullDomainName: ''
  }

  private mounted() {
    this.breadCrumbContent = this.$route.meta.title
    let query: any = this.$route.query
    if (query.groupId) {
      this.$set(this.form, 'groupId', query.groupId)
      this.form = {
        groupId: '327439123674913',
        groupName: '上海电信园区监控',
        description: '用于办公楼道内安全监控',
        inProtocol: 'rtmp',
        outProtocol: ['flv', 'hls'],
        region: '华东',
        sipId: '310132328883832',
        sipIp: '192.34.83.132',
        sipTcpPort: 5060,
        sipUdpPort: 80
      }
    }
  }

  private validateGroupName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-]{4,16}$/u.test(value)) {
      callback(new Error('业务组名称格式错误'))
    } else {
      callback()
    }
  }

  private validateOutProtocol(rule: any, value: string, callback: Function) {
    if (value.length === 0) {
      callback(new Error('请选择'))
    } else {
      callback()
    }
  }

  private back() {
    if (this.$route.name === 'group-update') {
      this.$router.push('/group/config')
    } else {
      this.$router.push('/group')
    }
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate((valid: any) => {
      if (valid) {
        console.log('submit')
      } else {
        console.log('error submit!!')
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
