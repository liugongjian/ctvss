<template>
  <div>
    <el-page-header content="创建业务组" @back="back" />
    <div class="app-container">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="left"
        label-width="140px"
        style="margin:0 50px;"
      >
        <el-form-item label="业务组名称" prop="groupName">
          <el-input v-model="form.groupName" />
          <div id="tip-name" class="tip-style">4-16位，可包含大小写字母、数字、中划线。空间名称不能重复</div>
        </el-form-item>
        <el-form-item label="业务组描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入业务组描述，如业务介绍或用途" />
        </el-form-item>
        <el-form-item label="服务区域" prop="region">
          <el-select v-model="form.region" placeholder="请选择">
            <el-option v-for="item in regionList" :key="item" :label="item" :value="item" />
          </el-select>
          <div class="tip-style">服务区域负责对流媒体进行实时处理，包括鉴权、拉流、转码、录制、截图等，请根据处理和存储需求选择</div>
        </el-form-item>
        <el-form-item label="接入类型" prop="inProtocol">
          <el-radio-group v-model="form.inProtocol">
            <el-radio label="gb28181">GB28181</el-radio>
            <el-radio label="rtmp">RTMP</el-radio>
            <el-radio label="onvif">ONVIF</el-radio>
            <el-radio label="rtsp">RTSP</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="推流域名" prop="pushDomainName">
          <el-input v-model="form.pushDomainName" />
          <div class="tip-style">视频监控的推流域名，需要进行过备案。如不填写，系统将默认分配ip地址</div>
        </el-form-item>
        <el-form-item v-if="form.inProtocol!=='gb28181'" label="播流域名" prop="pullDomainName">
          <el-input v-model="form.pullDomainName" />
          <div class="tip-style">视频监控的播流域名，需要进行过备案。如不填写，系统将默认分配ip地址</div>
        </el-form-item>
        <el-form-item label="播放类型" prop="outProtocol">
          <el-checkbox-group v-model="form.outProtocol">
            <el-checkbox
              v-for="protocol in outProtocolList"
              :key="protocol"
              :label="protocol"
            >
              {{ protocol }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div style="text-align: center;">
        <el-button @click="back">取 消</el-button>
        <el-button type="primary" @click="submit">创建</el-button>
      </div>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'CreateBusinessGroup'
})
export default class extends Vue {
  private dialogVisible = true
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
  private regionList = ['全局', '华东', '华南', '华北']
  private outProtocolList = ['rtmp', 'hls', 'flv', 'webrtc']
  private form = {
    groupName: '',
    description: '',
    region: '全局',
    inProtocol: 'gb28181',
    outProtocol: [],
    pushDomainName: '',
    pullDomainName: ''
  }

  private validateGroupName(rule: any, value: string, callback: Function) {
    if (!/[0-9a-zA-Z-]{4,16}/.test(value)) {
      document.getElementById('tip-name')!.style.display = 'none'
      callback(new Error('输入错误'))
    } else {
      document.getElementById('tip-name')!.style.display = 'inline'
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
    // const ref:any = this.$refs.dataForm
    // ref.resetFields()
    this.$emit('back-to-list')
  }

  private submit() {
    console.log('submit')
  }
}
</script>

<style lang="scss" scoped>
.tip-style {
  color: $textGrey;
}
</style>
