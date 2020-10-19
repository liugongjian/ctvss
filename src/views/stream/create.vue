<template>
  <div class="app-container">
    <el-page-header content="流列表" @back="back" />
    <el-card>
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="160px"
      >
        <el-form-item label="设备号" prop="deviceId">
          <el-input v-model="form.deviceId" />
        </el-form-item>
        <el-form-item label="存储区域" prop="storageRegion">
          <el-select v-model="form.storageRegion" placeholder="请选择">
            <el-option v-for="item in regionList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="桶名称" prop="bucketName">
          <el-input v-model="form.bucketName" />
        </el-form-item>
        <el-form-item label="设备流的类型" prop="streamType">
          <el-radio v-model="form.streamType" :label="1">全量视频</el-radio>
          <el-radio v-model="form.streamType" :label="2">移动侦测</el-radio>
        </el-form-item>
        <el-form-item label="容器ID" prop="streamCode">
          <el-input v-model="form.streamCode" />
        </el-form-item>
        <el-form-item label="过期时间" prop="expires">
          <el-date-picker
            v-model="form.expires"
            type="datetime"
            value-format="timestamp"
            placeholder="选择过期时间"
            size="small"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item label="">
          <div class="mt10">
            <el-button :loading="loading" type="primary" @click="submit">确定</el-button>
            <el-button @click="back">取 消</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Stream } from '@/type/stream'
import { createStream } from '@/api/stream'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'StreamCreate'
})
export default class extends Vue {
  private loading = false
  private form: Stream = {
    groupId: '',
    deviceId: '',
    storageRegion: '华南',
    bucketName: '',
    streamType: 1,
    streamCode: '',
    expires: (new Date()).getTime()
  }
  private regionList = ['华东', '华南', '华北']
  private pickerOptions = {
    disabledDate(time: any) {
      return time.getTime() < Date.now()
    }
  }
  private rules = {
    deviceId: [
      { required: true, message: '请输入设备号', trigger: 'blur' }
    ],
    storageRegion: [
      { required: true, message: '请选择区域', trigger: 'change' }
    ],
    bucketName: [
      { required: true, message: '请输入桶名称', trigger: 'blur' }
    ],
    streamType: [
      { required: true, message: '请选择设备流的类型', trigger: 'change' }
    ],
    streamCode: [
      { required: true, message: '请输入容器ID', trigger: 'blur' }
    ],
    expires: [
      { required: true, message: '请选择过期时间', trigger: 'change' }
    ]
  }
  private mounted() {
    const query: any = this.$route.query
    if (query.groupId) {
      this.$set(this.form, 'groupId', query.groupId)
    }
  }
  private back() {
    this.$router.push('/stream')
  }
  private submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        this.loading = true
        var params = JSON.parse(JSON.stringify(this.form))
        // params['recordTemplateId'] = '746016249426739200'
        // params['callbackTemplateId'] = '31206914560475136'
        try {
          const res = await createStream(params)
          this.$message.success('新建流成功！')
          this.back()
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.loading = false
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
