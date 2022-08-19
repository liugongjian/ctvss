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
        <el-form-item v-if="form.templateId" label="截图模板Id:" prop="templateId">
          <el-input v-model="form.templateId" disabled />
        </el-form-item>
        <el-form-item label="截图模板名称:" prop="templateName" class="form-with-tip">
          <el-input v-model="form.templateName" />
          <div class="form-tip">4-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。模板名称不能重复。</div>
        </el-form-item>
        <el-form-item label="服务区域:" prop="region" class="form-with-tip">
          <el-select v-model="form.region" placeholder="请选择">
            <el-option v-for="item in regionList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="截图频率：" prop="rate" required class="form-with-tip">
          <el-input v-model="form.rate" placeholder="请输入截图频率" class="transcribe-cycle">
            <template slot="append">秒</template>
          </el-input>
          <div class="form-tip">截图频率支持5-3600秒</div>
        </el-form-item>
        <el-form-item label="存储格式:" prop="storeType">
          <el-checkbox-group v-model="form.storeType">
            <el-checkbox
              v-for="storageType in storageTypeList"
              :key="storageType.key"
              :label="storageType.key"
            >
              {{ storageType.value }}
            </el-checkbox>
          </el-checkbox-group>
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
import { SnapshotTemplate } from '@/type/Template'
import { SnapshotStorageType } from '@/dics'
import { querySnapshotTemplate, createSnapshotTemplate, updateSnapshotTemplate } from '@/api/template'

@Component({
  name: 'create-or-update-snapshot-template'
})
export default class extends Vue {
  private breadCrumbContent = ''
  private createOrUpdateFlag = false
  private loading = false
  private rules = {
    templateName: [
      { required: true, message: '请输入录制模板名称', trigger: 'blur' },
      { validator: this.validateTemplateName, trigger: 'blur' }
    ],
    region: [
      { required: true, message: '请选择区域', trigger: 'change' }
    ],
    rate: [
      { required: true, message: '请输入截图频率', trigger: 'blur' },
      { validator: this.validateRate, trigger: 'blur' }
    ],
    storeType: [
      { required: true, message: '请至少勾选一种存储格式', trigger: 'blur' }
    ]
  }
  private regionList = ['华东', '华南', '华北']
  private storageTypeList = Object.keys(SnapshotStorageType).map(key => ({
    'key': key,
    'value': SnapshotStorageType[key]
  }))
  private form: SnapshotTemplate = {
    templateName: '',
    region: '华东',
    rate: 15,
    storeType: []
  }

  private async mounted() {
    this.breadCrumbContent = this.$route.meta.title
    this.createOrUpdateFlag = this.$route.path !== '/template/snapshot/update'
    let query: any = this.$route.query
    if (query.templateId) {
      this.$set(this.form, 'templateId', query.templateId)
      this.loading = true
      const res = await querySnapshotTemplate({ templateId: query.templateId })
      // TODO
      // res返回类型判断成功后再扩展
      this.form = {
        ...this.form,
        ...res
      }
      this.loading = false
    }
  }

  private validateTemplateName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-()（）_\s]{4,64}$/u.test(value)) {
      callback(new Error('截图模板名称格式错误'))
    } else if (/^[\s]|[\s]$/.test(value)) {
      callback(new Error('不能以空格作为名称的首尾。'))
    } else {
      callback()
    }
  }

  private validateRate(rule: any, value: string, callback: Function) {
    const numReg = /^[1-9][0-9]*$/
    if (!numReg.test(value) || Number(value) < 5 || Number(value) > 3600) {
      callback(new Error('截图频率必须是5~3600之间的整数'))
    } else {
      callback()
    }
  }

  private back() {
    this.$router.push('/template/snapshot')
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let res: any
        this.loading = true
        try {
          if (this.form.templateId) {
            res = await updateSnapshotTemplate(this.form)
          } else {
            res = await createSnapshotTemplate(this.form)
          }
          this.loading = false
          this.$message.success(this.form.templateId ? '截图模板编辑成功' : '截图模板创建成功')
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
  .el-input,
  .el-select,
  .el-textarea {
    width: 400px;
  }
</style>
