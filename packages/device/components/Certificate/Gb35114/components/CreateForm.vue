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
      <div v-if="ifNeedFile" class="upload-box">
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
        <div v-if="form.errorTip" class="form-tip error-tip">{{ form.errorTip }}</div>
      </div>
      <el-button v-else type="primary" @click="reUploadFile">重新上传</el-button>
    </el-form-item>
    <el-form-item label="解析数据：" prop="outId">
      <div class="form-box">
        <div class="form-box-item">
          <span class="form-box-item__title">设备名称：</span>
          <span class="form-box-item__content">{{ loading.upload ? '解析中...' : (form.deviceName || '待解析') }}</span>
        </div>
        <div class="form-box-item">
          <span class="form-box-item__title">国标ID：</span>
          <span class="form-box-item__content">{{ loading.upload ? '解析中...' : (form.outId || '待解析') }}</span>
        </div>
        <div class="form-box-item">
          <span class="form-box-item__title">	密码模块ID：</span>
          <span class="form-box-item__content">{{ loading.upload ? '解析中...' : (form.cryptoModuleId || '待解析') }}</span>
        </div>
        <div class="form-box-item">
          <span class="form-box-item__title">	生产日期：</span>
          <span class="form-box-item__content">{{ loading.upload ? '解析中...' : (form.productionDate || '待解析') }}</span>
        </div>
        <div class="form-box-item">
          <span class="form-box-item__title">模块类型：</span>
          <span class="form-box-item__content">{{ loading.upload ? '解析中...' : (form.moduleType || '待解析') }}</span>
        </div>
      </div>
    </el-form-item>
    <!-- <el-form-item label="相关证书文件：" prop="certificate">
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
    </el-form-item> -->
    <el-form-item label="证书截止有效时间：" prop="expireTime">
      <el-date-picker
        v-model="form.expireTime"
        type="datetime"
        placeholder="选择日期时间"
        :clearable="false"
        :picker-options="pickerOptions"
      />
    </el-form-item>
    <el-form-item label="描述：" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="3"
        :maxlength="255"
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
import { getDateByTime } from '@vss/base/utils/date'
import {
  uploadGb35114Csr,
  generateGb35114Certificate,
  describeGb35114Certificate,
  updateGb35114Certificate
} from '@vss/device/api/certificate'

@Component({
  name: 'CreateGb35114CertificateForm'
})
export default class extends Vue {
  private rules = {
    fileName: [{ required: true, message: '请选择本地设备证书请求文件', trigger: 'blur' }],
    outId: [{ required: true, message: '请选择正确的设备证书请求文件获取解析数据', trigger: 'blur' }],
    expireTime: [{ required: true, message: '请选择截止有效日期', trigger: 'blur' }]
  }

  private selectedFile: any = null
  private ifNeedFile = true
  // 解析进程对象
  public reader: any = new FileReader()
  private form = {
    fileName: '',
    deviceName: '',
    outId: '',
    cryptoModuleId: '',
    productionDate: '',
    moduleType: '',
    expireTime: new Date(getDateByTime(Date.now()) + 24 * 60 * 60 * 1000),
    // certificate: '',
    description: '',
    errorTip: ''
  }

  private fileString = ''
  private expireTimeCache: number

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
      return time.getTime() < (getDateByTime(Date.now()) + 24 * 60 * 60 * 1000) || time.getTime() > (getDateByTime(Date.now()) + 365 * 10 * 24 * 60 * 60 * 1000)
    }
  }

  private get currentOutId() {
    const params: any = this.$route.params
    return params && params.outId
  }

  private get currentCertId() {
    const params: any = this.$route.params
    return params && params.certId
  }

  private async mounted() {
    if (this.currentOutId) {
      this.ifNeedFile = false
      try {
        this.loading.form = true
        const res = await describeGb35114Certificate({ outId: this.currentOutId })
        this.form.deviceName = res.deviceName
        this.form.outId = res.outId
        this.form.cryptoModuleId = res.cryptoModuleId
        this.form.productionDate = res.productionDate
        this.form.moduleType = res.moduleType
        this.form.description = res.description
        this.form.expireTime = new Date(res.expireTime * 1000)
        this.expireTimeCache = +res.expireTime
      } catch (e) {
        this.$message.error(e && e.message)
      } finally {
        this.loading.form = false
      }
    }
  }

  /**
   * 重新上传文件
   */
  private reUploadFile() {
    this.ifNeedFile = true
    this.form.outId = ''
    this.form.deviceName = ''
    this.form.cryptoModuleId = ''
    this.form.productionDate = ''
    this.form.moduleType = ''
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
      this.form.outId = ''
      this.form.deviceName = ''
      this.form.cryptoModuleId = ''
      this.form.productionDate = ''
      this.form.moduleType = ''
      return (this.form.errorTip = '请求文件文件格式错误')
    } else {
      this.form.errorTip = ''
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
          this.fileString = fileString
          try {
            const res = await uploadGb35114Csr({ deviceCsr: fileString })
            this.form.deviceName = res.deviceName
            this.form.outId = res.outId
            this.form.cryptoModuleId = res.cryptoModuleId
            this.form.productionDate = res.productionDate
            this.form.moduleType = res.moduleType
          } catch (e) {
            this.form.outId = ''
            this.form.deviceName = ''
            this.form.cryptoModuleId = ''
            this.form.productionDate = ''
            this.form.moduleType = ''
            this.form.errorTip = e && e.message
          } finally {
            this.loading.upload = false
          }
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
  private submit(onSuccess: Function) {
    const dataForm: any = this.$refs.dataForm
    dataForm.validateField('outId', async(err) => {
      if (!err) {
        try {
          this.loading.generate = true
          const params: any = {
            expireTime: +(this.form.expireTime.getTime() + '').slice(0, -3),
            description: this.form.description
          }
          // 判断是否为更新证书
          if (this.currentOutId) {
            // 判断是否更改过请求文件
            this.fileString && (params.deviceCsr = this.fileString)
            // 判断是否更改过时间
            if (params.expireTime === this.expireTimeCache) {
              delete params.expireTime
            }
            // 判断是否重新生成证书
            if (params.expireTime || params.deviceCsr) {
              this.$confirm('修改证书过期时间或设备证书请求文件, 重新生成证书，将会导致设备下线！').then(async() => {
                await updateGb35114Certificate({
                  ...params,
                  certId: this.currentCertId
                })
                onSuccess()
              }).catch(() => { console.log() })
            } else {
              await updateGb35114Certificate({
                ...params,
                certId: this.currentCertId
              })
              onSuccess()
            }
          } else {
            await generateGb35114Certificate({
              ...params,
              deviceCsr: this.fileString,
              deviceName: this.form.deviceName,
              outId: this.form.outId,
              cryptoModuleId: this.form.cryptoModuleId,
              productionDate: this.form.productionDate,
              moduleType: this.form.moduleType
            })
            onSuccess()
          }
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.loading.form = false
        }
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
.el-date-editor,
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
