<template>
  <div class="app-container">
    <el-page-header content="取消订阅" @back="back" />
    <el-card>
      <el-form
        ref="dataForm"
        v-loading="loading"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="240px"
      >
        <el-form-item label="订阅标题:" required>
          {{ form.title }}
        </el-form-item>
        <el-form-item label="订阅类别:" required>
          {{ handleSubscribeDetail(form.subscribeDetail) || '-' }}
        </el-form-item>
        <el-form-item label="目标服务器:" required>
          {{ form.subscribeViidServerId }}
        </el-form-item>
        <el-form-item label="订阅资源路径:" required>
          {{ form.resourceURI }}
        </el-form-item>
        <el-form-item label="信息接受地址:" required>
          {{ form.receiveAddr }}
        </el-form-item>
        <el-form-item label="申请人:" required>
          {{ form.applicantName }}
        </el-form-item>
        <el-form-item label="申请单位:" required>
          {{ form.applicantOrg }}
        </el-form-item>
        <el-form-item label="开始时间:" required>
          {{ formatTime(form.beginTime) }}
        </el-form-item>
        <el-form-item label="结束时间:" required>
          {{ formatTime(form.endTime) }}
        </el-form-item>
        <el-form-item label="订阅理由:" required>
          {{ form.reason }}
        </el-form-item>
        <el-form-item label="取消人:" prop="subscribeCancelPerson">
          <el-input v-model="form.subscribeCancelPerson" />
        </el-form-item>
        <el-form-item label="取消单位:" prop="subscribeCancelOrg">
          <el-input v-model="form.subscribeCancelOrg" />
        </el-form-item>
        <el-form-item label="取消时间:" prop="cancelTime">
          <el-date-picker
            v-model="form.cancelTime"
            value-format="timestamp"
            type="datetime"
            style="width: 400px;"
          />
        </el-form-item>
        <el-form-item label="取消理由:" prop="cancelReason">
          <el-input v-model="form.cancelReason" type="textarea" :rows="3" />
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
import { cancelSubscribes, getSubscribesDetail } from '@/api/viid'
import { subscribeDetailList } from '@/dics/viid'
import { dateFormat } from '@/utils/date'

@Component({
  name: 'CreateSubscribes'
})
export default class extends Vue {
  private form: any = {
    subscribeID: '',
    title: '',
    subscribeDetail: '',
    subscribeViidServerId: '',
    subscribeDeviceId: '',
    resourceURI: '',
    applicantName: '',
    applicantOrg: '',
    beginTime: '',
    endTime: '',
    reason: '',
    subscribeCancelPerson: '',
    subscribeCancelOrg: '',
    cancelTime: '',
    cancelReason: '',
    viidServerId: ''
  }
  private submitting = false
  private loading = false

  private handleSubscribeDetail(detail) {
    let res = []
    const details = detail.split(',')
    details.forEach(item => {
      res.push(subscribeDetailList.find(d => d.value === item).label)
    })
    return res.join('，')
  }

  private rules = {
    subscribeCancelPerson: [
      { required: true, message: '请输入取消人', trigger: 'blur' }
    ],
    subscribeCancelOrg: [
      { required: true, message: '请输入取消单位', trigger: 'blur' }
    ],
    cancelTime: [
      { required: true, message: '请输入取消时间', trigger: 'blur' }
    ]
  }

  private back() {
    this.$router.go(-1)
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.submitting = true
          const params = {
            subscribeViidServerId: this.form.viidServerId,
            subscribeID: this.form.subscribeID,
            subscribeCancelPerson: this.form.subscribeCancelOrg,
            subscribeCancelOrg: this.form.subscribeCancelOrg,
            cancelTime: this.form.cancelTime,
            cancelReason: this.form.cancelReason
          }
          await cancelSubscribes(params)
          this.$message.success('取消订阅成功！')
          this.back()
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.submitting = false
        }
      }
    })
  }

  private formatTime(val) {
    if (val === 0) return '-'
    return dateFormat(new Date(val))
  }

  private async getDetail(id) {
    try {
      const res = await getSubscribesDetail({ subscribeID: id })
      this.form = res.data
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  private async mounted() {
    const detail: any = this.$route.params.detail
    await this.getDetail(detail.subscribeID)
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .el-textarea,
  .el-input {
    width: 400px;
  }
}
</style>
