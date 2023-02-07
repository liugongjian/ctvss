<template>
  <el-form
    ref="dataForm"
    v-loading="loading.submit"
    class="gb35114-form"
    :rules="rules"
    :model="form"
    label-position="right"
    label-width="170px"
  >
    <el-form-item label="设备证书请求文件：" prop="fileName" class="form-with-tip">
      <div class="upload-box">
        <el-input v-model="form.fileName" placeholder="请选择本地设备证书请求文件" disabled />
        <el-upload
          ref="upload"
          action="#"
          :show-file-list="false"
          :http-request="previewFile"
        >
          <el-button slot="trigger" size="small" type="primary" :disabled="loading.upload">浏览</el-button>
          <el-button size="small" type="primary" :loading="loading.upload" @click="uploadFile">上传</el-button>
        </el-upload>
      </div>
      <div v-if="form.errorTip" class="form-tip error-tip">{{ form.errorTip }}</div>
    </el-form-item>
    <el-form-item label="解析数据：" prop="gbId">
      <div class="form-box">
        <div class="form-box-item">
          <span class="form-box-item__title">设备名称：</span>
          <span class="form-box-item__content">{{ loading.upload ? '解析中...' : (form.deviceName || '-') }}</span>
        </div>
        <div class="form-box-item">
          <span class="form-box-item__title">国标ID：</span>
          <span class="form-box-item__content">{{ loading.upload ? '解析中...' : (form.gbId || '-') }}</span>
        </div>
      </div>
    </el-form-item>
    <el-form-item label="相关证书文件：" prop="certificate">
      <div class="form-box">
        <div class="form-box-item">
          <div class="form-box--tip">
            备注：请点击“生成证书”按钮生成相关证书
          </div>
          <span class="form-box-item__title">证书截止有效时间：</span>
          <span class="form-box-item__content">
            <el-date-picker
              v-model="form.validTime"
              type="datetime"
              placeholder="选择日期时间"
              :clearable="false"
              :picker-options="pickerOptions"
            />
          </span>
        </div>
        <div class="form-box-item">
          <el-button v-if="form.certificate" size="small" type="primary" @click="1">重新生成证书</el-button>
          <el-button v-else size="small" type="primary" @click="generateCertificate">生成证书</el-button>
        </div>
        <div v-if="form.certificate" class="form-box-item">
          <span class="form-box-item__content">{{ form.certificate }}</span>
        </div>
        <div v-if="form.certificate" class="form-box-item">
          <el-button size="small" type="primary" @click="1">一键下载</el-button>
        </div>
      </div>
    </el-form-item>
    <el-form-item label="描述：" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="3"
        placeholder="请输入凭证描述，如凭证介绍或用途"
      />
    </el-form-item>
    <el-form-item label="">
      <slot />
    </el-form-item>
  </el-form>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { getDateByTime } from '@/utils/date'
import {
  createCertificate,
  queryCertificate,
  updateCertificate
} from '@/api/certificate/gb28181'

@Component({
  name: 'CreateGb28181CertificateForm'
})
export default class extends Vue {
  private rules = {
    fileName: [{ required: true, message: '请选择本地设备证书请求文件', trigger: 'blur' }],
    gbId: [{ required: true, message: '请选择正确的设备证书请求文件获取解析数据', trigger: 'blur' }],
    certificate: [{ required: true, message: '请生成证书', trigger: 'change' }]
  }

  private selectedFile: any = null
  private form = {
    fileName: '',
    deviceName: '',
    gbId: '',
    validTime: new Date(),
    certificate: '',
    errorTip: ''
  }

  private loading = {
    upload: false,
    generate: false,
    submit: false
  }

  private pickerOptions = {
    /**
     * 限制可选日期
     */
    disabledDate: (time) => {
      return time.getTime() < getDateByTime(Date.now())
    }
  }

  /**
   * 浏览请求文件
   */
  private previewFile(data) {
    this.selectedFile = data.file
    this.form.fileName = this.selectedFile.name
  }

  /**
   * 解析请求文件
   */
  private uploadFile() {
    const dataForm: any = this.$refs.dataForm
    dataForm.validateField('fileName', (err) => {
      if (!err) {
        this.loading.upload = true
        setTimeout(() => {
          console.log(this.selectedFile)
          this.loading.upload = false
          this.form.deviceName = '测试设备'
          this.form.gbId = '12345678901234567890'
        }, 1000)
      }
    })
  }

  /**
   * 生成证书
   */
  private generateCertificate() {
    const dataForm: any = this.$refs.dataForm
    dataForm.validateField('gbId', (err) => {
      if (!err) {
        this.loading.generate = true
        setTimeout(() => {
          const params = {
            deviceName: this.form.deviceName,
            gbId: this.form.gbId,
            validTime: this.form.validTime
          }
          console.log(params)
          this.loading.generate = false
          this.form.certificate = '相关证书文件压缩包'
        }, 1000)
      }
    })
  }

  private submit(onSuccess: Function) {
    const form: any = this.$refs.dataForm
    let data: any = {}
    form.validate(async(valid: any) => {
      if (valid) {
        this.loading.submit = true
        try {
          data = this.form
          // await createCertificate(data)
          console.log(data)
          // onSuccess()
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.loading.submit = false
        }
      } else {
        console.log('error submit!!')
        return false
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.upload-box {
  display: flex;

  .el-input {
    flex: 1;
    margin-right: 10px;
  }

  .el-upload + .el-button {
    margin-left: 10px;
  }
}

.form-box {
  border: 1px solid $borderGrey3;
  border-radius: 5px;
  padding: 5px 15px;

  &-item {
    line-height: 36px;
  }

  &-item + &-item {
    margin-top: 10px;
  }

  &--tip {
    font-size: 12px;
    color: $textGrey;
    line-height: 24px;
  }
}

.upload-box,
.form-box,
.el-textarea {
  width: 400px;
}

.el-date-editor {
  width: 200px;
}

.error-tip {
  color: $danger;
}
</style>
