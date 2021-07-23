<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="160px"
      >
        <el-form-item v-if="form.templateId" label="告警模板Id:" prop="templateId">
          <el-input v-model="form.templateId" class="fixed-width" disabled />
        </el-form-item>
        <el-form-item label="告警模板名称:" prop="templateName" class="form-with-tip">
          <el-input v-model="form.templateName" class="fixed-width" :disabled="!createOrUpdateFlag" />
          <div class="form-tip">4-16位，可包含大小写字母、数字、中文、中划线。模板名称不能重复。</div>
        </el-form-item>
        <el-form-item label="报警级别" prop="alertLevel">
          <el-select v-model="form.alertLevel" class="select-item">
            <el-option v-for="item in alertLevelOptions" :key="item.value" :label="item.text" :value="item.value" />
          </el-select>
          <div class="form-tip">该报警级别为告警筛选的最低级别</div>
        </el-form-item>
        <el-form-item label="报警方式" prop="alertType">
          <el-cascader
            v-model="form.alertType"
            :options="alertTypeOptions"
            :props="props"
            clearable
          />
          <el-popover
            placement="top-start"
            width="400"
            trigger="hover"
            :open-delay="300"
            content="设备发送报警方式为“设备报警”通知后,平台需进行“报警复位”控制操作,设备才能发送新 的“设备报警”通知"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </el-form-item>
        <el-form-item label="模板概要" prop="description">
          <el-input v-model="form.description" class="fixed-width" type="textarea" />
        </el-form-item>
        <el-form-item label="">
          <el-button :loading="loading" type="primary" @click="submit">{{ createOrUpdateFlag ? '新建' : '确定' }}</el-button>
          <el-button @click="back">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
// import { queryAlertTemplate, createCallbackTemplate, updateCallbackTemplate } from '@/api/template'

@Component({
  name: 'create-or-update-callback-template'
})
export default class extends Vue {
  private breadCrumbContent = ''
  private createOrUpdateFlag = false
  private loading = false
  private rules = {
    templateName: [
      { required: true, message: '请输入回调模板名称', trigger: 'blur' },
      { validator: this.validateTemplateName, trigger: 'blur' }
    ],
    alertLevel: [
      { required: true, message: '请选择报警级别', trigger: 'blur' }
    ],
    alertType: [
      { required: true, message: '请选择报警方式', trigger: 'blur' }
    ]
  }
  private selectedRows: any[] = []
  private form: any = {
    templateName: '',
    alertLevel: 1,
    alertType: [],
    description: ''
  }
  private alertLevelOptions: any = [
    { text: '一级警情', value: 1 },
    { text: '二级警情', value: 2 },
    { text: '三级警情', value: 3 },
    { text: '四级警情', value: 4 }
  ]
  private props: any = { multiple: true }
  private alertTypeOptions: any = [
    {
      value: 1,
      label: '电话报警'
    },
    {
      value: 2,
      label: '设备报警',
      children: [
        { value: 1, label: '视频丢失报警' },
        { value: 2, label: '设备防拆报警' },
        { value: 3, label: '存储设备磁盘满报警' },
        { value: 4, label: '设备高温报警' },
        { value: 5, label: '设备低温报警' }
      ]
    },
    {
      value: 3,
      label: '短信报警'
    },
    {
      value: 4,
      label: 'GPS报警'
    },
    {
      value: 5,
      label: '视频报警',
      children: [
        { value: 1, label: '人工视频报警' },
        { value: 2, label: '运动目标检测报警' },
        { value: 3, label: '遗留物检测报警' },
        { value: 4, label: '物体移除检测报警' },
        { value: 5, label: '绊线检测报警' },
        { value: 6, label: '入侵检测报警' },
        { value: 7, label: '逆行检测报警' },
        { value: 8, label: '徘徊检测报警' },
        { value: 9, label: '流量统计报警' },
        { value: 10, label: '密度检测报警' },
        { value: 11, label: '视频异常检测报警' },
        { value: 12, label: '快速移动报警' }
      ]
    },
    {
      value: 6,
      label: '设备故障报警',
      children: [
        { value: 1, label: '存储设备磁盘故障报警' },
        { value: 2, label: '存储设备风扇故障报警' }
      ]
    },
    {
      value: 7,
      label: '其他报警'
    }
  ]

  private async mounted() {
    this.breadCrumbContent = this.$route.meta.title
    this.createOrUpdateFlag = this.$route.path !== '/template/alert/update'
    let query: any = this.$route.query
    if (query.templateId) {
      this.$set(this.form, 'templateId', query.templateId)
      this.loading = true
      // const res = await queryAlertTemplate({ templateId: query.templateId })
      // this.form = res
      this.loading = false
    } else {
      // do nothing
    }
  }

  private validateTemplateName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-]{4,16}$/u.test(value)) {
      callback(new Error('回调模板名称格式错误'))
    } else {
      callback()
    }
  }

  private back() {
    this.$router.push('/template/alert')
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        this.loading = true
        const param: any = {
          templateId: this.form.templateId || undefined,
          templateName: this.form.templateName,
          alertLevel: this.form.alertLevel,
          alertType: this.form.alertType,
          description: this.form.description
        }
        console.log(this.form);
        
        try {
          if (this.form.templateId) {
            // await updateCallbackTemplate(param)
          } else {
            // await createCallbackTemplate(param)
          }
          this.loading = false
          this.$message.success(this.form.templateId ? '告警模板编辑成功' : '告警模板创建成功')
          this.back()
        } catch (e) {
          this.loading = false
          this.$message.error(e && e.message)
        }
      } else {
        console.log('校验不通过')
      }
    })
  }
}
</script>

<style lang="scss" scoped>
  .fixed-width.el-input, .fixed-width.el-select, .fixed-width.el-textarea {
    width: 600px;
  }
  .select-item {
    width: 200px;
  }
</style>
