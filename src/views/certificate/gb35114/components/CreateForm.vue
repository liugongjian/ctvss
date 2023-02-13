<template>
  <el-form
    ref="dataForm"
    v-loading="loading.form"
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
    <el-form-item label="解析数据：" prop="outId">
      <div class="form-box">
        <div class="form-box-item">
          <span class="form-box-item__title">设备名称：</span>
          <span class="form-box-item__content">{{ loading.upload ? '解析中...' : (form.deviceName || '-') }}</span>
        </div>
        <div class="form-box-item">
          <span class="form-box-item__title">国标ID：</span>
          <span class="form-box-item__content">{{ loading.upload ? '解析中...' : (form.outId || '-') }}</span>
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
              v-model="form.expireTime"
              type="datetime"
              placeholder="选择日期时间"
              :clearable="false"
              :picker-options="pickerOptions"
            />
          </span>
        </div>
        <div class="form-box-item">
          <el-button v-if="form.certificate" size="small" type="primary" :loading="loading.generate" @click="1">重新生成证书</el-button>
          <el-button v-else size="small" type="primary" :loading="loading.generate" @click="generateCertificate">生成证书</el-button>
        </div>
        <div v-if="form.certificate" class="form-box-item">
          <span class="form-box-item__content">{{ form.certificate }}</span>
        </div>
        <div v-if="form.certificate" class="form-box-item">
          <el-button size="small" type="primary" :loading="loading.download" @click="1">一键下载</el-button>
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
  uploadCsr,
  generateCertificate,
  describeCertificate,
  downloadCertificate
} from '@/api/certificate/gb35114'
import { error } from 'console'

@Component({
  name: 'CreateGb28181CertificateForm'
})
export default class extends Vue {
  private rules = {
    fileName: [{ required: true, message: '请选择本地设备证书请求文件', trigger: 'blur' }],
    outId: [{ required: true, message: '请选择正确的设备证书请求文件获取解析数据', trigger: 'blur' }],
    certificate: [{ required: true, message: '请生成证书', trigger: 'change' }]
  }

  private selectedFile: any = null
  // 解析进程对象
  public reader: any = new FileReader()
  private form = {
    fileName: '',
    deviceName: '',
    outId: '',
    expireTime: new Date(),
    certificate: '',
    description: '',
    errorTip: ''
  }

  private loading = {
    upload: false,
    generate: false,
    form: false,
    download: false
  }

  private pickerOptions = {
    /**
     * 限制可选日期
     */
    disabledDate: (time) => {
      return time.getTime() < getDateByTime(Date.now())
    }
  }

  private async mounted() {
    const params: any = this.$route.params
    if (params.outId) {
      try {
        this.loading.form = true
        const res = await describeCertificate({ outId: params.outId })
        this.form.deviceName = res.deviceName
        this.form.outId = res.outId
        this.form.certificate = '相关证书文件压缩包'
      } catch (e) {
        this.$message.error(e && e.message)
      } finally {
        this.loading.form = false
      }
    }
  }

  /**
   * 浏览请求文件
   */
  private previewFile(data) {
    this.selectedFile = data.file
    this.form.fileName = this.selectedFile.name
    // 检验大小
    console.log(this.selectedFile.size)
    if (this.selectedFile.size > 8192) {
      return (this.form.errorTip = '请求文件文件格式错误')
    }
  }

  /**
   * 解析请求文件
   */
  private uploadFile() {
    if (this.form.errorTip) return
    const dataForm: any = this.$refs.dataForm
    dataForm.validateField('fileName', (err) => {
      if (!err) {
        this.loading.upload = true
        this.fileToText(this.selectedFile, this.reader).then(async(fileString: any) => {
          console.log(fileString)
          try {
            const res = await uploadCsr({ deviceCsr: fileString })
            this.form.deviceName = res.deviceName
            this.form.outId = res.outId
          } catch (e) {
            console.log(e)
          } finally {
            this.loading.upload = false
          }
          // setTimeout(() => {
          //   this.loading.upload = false
          //   this.form.deviceName = '测试设备'
          //   this.form.outId = '12345678901234567890'
          // }, 1000)
        }).catch(e => {
          console.log(e)
          this.loading.upload = false
        })
      }
    })
  }

  // 读取文件内容
  private fileToText(file: any, reader: any) {
    return new Promise((resolve, reject) => {
      let fileResult: any = ''
      reader.readAsText(this.selectedFile)
      reader.onload = function() {
        fileResult = reader.result
      }
      reader.onerror = function(error: any) {
        reject(error)
      }
      reader.onloadend = () => {
        if (fileResult.trim().startsWith('-----BEGIN CERTIFICATE REQUEST-----') && fileResult.trim().endsWith('-----END CERTIFICATE REQUEST-----')) {
          this.form.errorTip = ''
          resolve(fileResult)
        } else {
          this.form.errorTip = '请求文件文件格式错误'
          reject(new Error('请求文件文件格式错误'))
        }
      }
    })
  }

  /**
   * 生成证书
   */
  private generateCertificate() {
    const dataForm: any = this.$refs.dataForm
    dataForm.validateField('outId', async(err) => {
      if (!err) {
        this.loading.generate = true
        setTimeout(() => {
          const params = {
            deviceName: this.form.deviceName,
            outId: this.form.outId,
            expireTime: this.form.expireTime
          }
          console.log(params)
          this.loading.generate = false
          this.form.certificate = '相关证书文件压缩包'
        }, 1000)
        // try {
        //   this.loading.generate = true
        //   await generateCertificate({
        //     deviceName: this.form.deviceName,
        //     outId: this.form.outId,
        //     expireTime: this.form.expireTime,
        //     description: this.form.description
        //   })
        //   this.form.certificate = '相关证书文件压缩包'
        // } catch (e) {
        //   this.$message.error(e && e.message)
        // } finally {
        //   this.loading.form = false
        // }
      }
    })
  }

  /**
   * 下载证书
   */
  private async downloadCertificate() {
    // try {
    //   this.loading.download = true
    //   const res = await downloadCertificate({ outId: this.form.outId })
    //   const file = res.certsZip
    //   const blob = this.base64ToBlob(`data:application/zip;base64,${file}`)
    //   const link = document.createElement('a')
    //   link.href = window.URL.createObjectURL(blob)
    //   link.download = '相关证书文件压缩包'
    //   link.click()
    // } catch (e) {
    //   this.$message.error(e && e.message)
    // } finally {
    //   this.loading.download = false
    // }
  }

  private submit(onSuccess: Function) {
    const form: any = this.$refs.dataForm
    let data: any = {}
    form.validate(async(valid: any) => {
      if (valid) {
        this.loading.form = true
        try {
          data = this.form
          // await createCertificate(data)
          console.log(data)
          // onSuccess()
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.loading.form = false
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
