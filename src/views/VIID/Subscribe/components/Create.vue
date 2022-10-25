<template>
  <div class="app-container">
    <el-page-header content="添加订阅" @back="back" />
    <el-card>
      <el-form
        ref="dataForm"
        v-loading="loading"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="240px"
      >
        <el-form-item label="订阅标题:" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="订阅类别:" prop="subscribeDetail">
          <el-select v-model="form.subscribeDetail" multiple clearable @change="detailSelectChange">
            <el-checkbox
              v-model="detailCheckOption.checkAll"
              style="padding-left: 20px;"
              :indeterminate="detailCheckOption.isIndeterminate"
              @change="handleDetailCheckAllChange"
            >
              全选
            </el-checkbox>
            <el-option
              v-for="item in subscribeDetailList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标服务器:" prop="subscribeViidServerId">
          <el-select v-model="form.subscribeViidServerId" @change="getDeviceList">
            <el-option
              v-for="item in platformList"
              :key="item.viidServerId"
              :label="item.name"
              :value="item.viidServerId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="采集设备标识:" prop="subscribeDetail">
          <el-input v-if="form.subscribeDetail.includes('3') || form.subscribeDetail.includes('5')" value="全部" disabled />
          <el-select
            v-else
            v-model="form.subscribeDeviceId"
            multiple
            clearable
            @change="deviceSelectChange"
          >
            <el-checkbox
              v-model="deviceCheckOption.checkAll"
              style="padding-left: 20px;"
              :indeterminate="deviceCheckOption.isIndeterminate"
              @change="handleDeviceCheckAllChange"
            >
              全选
            </el-checkbox>
            <el-option
              v-for="item in deviceList"
              :key="item.apeId"
              :label="item.name"
              :value="item.apeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="订阅资源路径:" prop="resourceURI">
          {{ lowerPlatform.apeId || '-' }}
        </el-form-item>
        <el-form-item label="申请人:" prop="applicantName">
          <el-input v-model="form.applicantName" />
        </el-form-item>
        <el-form-item label="申请单位:" prop="applicantOrg">
          <el-input v-model="form.applicantOrg" />
        </el-form-item>
        <el-form-item label="开始时间:" prop="beginTime">
          <el-date-picker
            v-model="form.beginTime"
            value-format="timestamp"
            type="datetime"
            style="width: 400px;"
          />
        </el-form-item>
        <el-form-item label="结束时间:" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            value-format="timestamp"
            type="datetime"
            style="width: 400px;"
          />
        </el-form-item>
        <el-form-item label="订阅理由:" prop="reason">
          <el-input v-model="form.reason" type="textarea" :rows="3" />
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
import { subscribeDetailList } from '@/dics/viid'
import { getLowerPlatformList, getLowerViidDevicesList, createSubscribes } from '@/api/viid'

@Component({
  name: 'CreateSubscribes'
})
export default class extends Vue {
  private platformList = []
  private deviceList = []
  private form: any = {
    title: '',
    subscribeDetail: [],
    subscribeViidServerId: '',
    subscribeDeviceId: [],
    applicantName: '',
    applicantOrg: '',
    beginTime: '',
    endTime: '',
    reason: ''
  }

  private get lowerPlatform() {
    return this.platformList.find(item => item.viidServerId === this.form.subscribeViidServerId) || {}
  }

  private subscribeDetailList = subscribeDetailList

  private detailCheckOption = {
    isIndeterminate: false,
    checkAll: false
  }
  private deviceCheckOption = {
    isIndeterminate: false,
    checkAll: false
  }
  private submitting = false
  private loading = false

  private rules = {
    title: [
      { required: true, message: '请输入订阅标题', trigger: 'blur' }
    ]
  }

  private async getPlatformList() {
    let params = {
      pageNum: 0,
      pageSize: 2000
    }
    try {
      const res: any = await getLowerPlatformList(params)
      this.platformList = res.data
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  private async getDeviceList() {
    try {
      // const res: any = await getLowerViidDevicesList({ viidId: this.form.subscribeViidServerId })
      const res: any = await getLowerViidDevicesList({ viidId: this.lowerPlatform.apeId })
      this.deviceList = res.data
      // 重置设备标识选项和全选状态
      this.form.subscribeDeviceId = []
      this.detailSelectChange()
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  private handleDetailCheckAllChange(val) {
    const subscribeDetails = this.subscribeDetailList.map(item => item.value)
    this.form.subscribeDetail = val ? subscribeDetails : []
    this.detailCheckOption.isIndeterminate = false
  }

  private detailSelectChange() {
    const checkLength = this.form.subscribeDetail.length
    this.detailCheckOption.isIndeterminate = checkLength > 0 && checkLength < this.subscribeDetailList.length
    this.detailCheckOption.checkAll = checkLength === this.subscribeDetailList.length
    if (this.form.subscribeDetail.includes('3') || this.form.subscribeDetail.includes('5')) {
      this.deviceCheckOption.checkAll = true
    } else {
      this.deviceCheckOption.checkAll = false
    }
  }

  private handleDeviceCheckAllChange(val) {
    const subscribeDeviceIds = this.deviceList.map(item => item.apeId)
    this.form.subscribeDeviceId = val ? subscribeDeviceIds : []
    this.deviceCheckOption.isIndeterminate = false
  }

  private deviceSelectChange() {
    const checkLength = this.form.subscribeDeviceId.length
    this.deviceCheckOption.isIndeterminate = checkLength > 0 && checkLength < this.deviceList.length
    this.deviceCheckOption.checkAll = checkLength === this.deviceList.length
  }

  private back() {
    this.$router.go(-1)
  }

  private submit() {
    const form: any = this.$refs.dataForm
    console.log(this.form)
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.submitting = true
          const subscribeDeviceId = this.deviceCheckOption.checkAll ? this.lowerPlatform.apeId : this.form.subscribeDeviceId.join(',')
          const params = {
            ...this.form,
            subscribeDetail: this.form.subscribeDetail.join(','),
            resourceURI: this.lowerPlatform.apeId,
            subscribeDeviceId
          }
          await createSubscribes(params)
          this.$message.success('添加订阅成功！')
          this.back()
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.submitting = false
        }
      }
    })
  }

  private async mounted() {
    await this.getPlatformList()
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .el-textarea, .el-input, .el-select {
    width: 400px;
  }
}
</style>
