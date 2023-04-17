<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card v-loading="loading">
      <info-list label-width="110">
        <info-list-item label="告警模板名称:">{{ details.templateName }}</info-list-item>
        <info-list-item label="报警级别:">{{ details.alarmPriority && getLabel('alarmPriority', details.alarmPriority)[0] }}</info-list-item>
        <info-list-item label="报警方式:">
          <div v-for="(item, index) in getLabel('alarmMethod', details.alarmMethod)" :key="index">{{ item }}</div>
        </info-list-item>
        <info-list-item label="模板概要:">{{ details.description || '-' }}</info-list-item>
      </info-list>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getAlertTemplateDetails } from '@/api/template'

@Component({
  name: 'alert-details'
})
export default class extends Vue {
  private breadCrumbContent = ''
  private loading = false
  private templateId = ''
  private details: any = {
    templateName: '',
    alarmPriority: '',
    alarmMethod: '',
    description: ''
  }
  private alarmPriorityOptions: any = [
    { label: '一级警情', value: '1' },
    { label: '二级警情', value: '2' },
    { label: '三级警情', value: '3' },
    { label: '四级警情', value: '4' }
  ]
  private props: any = { multiple: true }
  private alarmMethodOptions: any = [
    {
      value: '1',
      label: '电话报警'
    },
    {
      value: '2',
      label: '设备报警',
      children: [
        { value: '1', label: '视频丢失报警' },
        { value: '2', label: '设备防拆报警' },
        { value: '3', label: '存储设备磁盘满报警' },
        { value: '4', label: '设备高温报警' },
        { value: '5', label: '设备低温报警' }
      ]
    },
    {
      value: '3',
      label: '短信报警'
    },
    {
      value: '4',
      label: 'GPS报警'
    },
    {
      value: '5',
      label: '视频报警',
      children: [
        { value: '1', label: '人工视频报警' },
        { value: '2', label: '运动目标检测报警' },
        { value: '3', label: '遗留物检测报警' },
        { value: '4', label: '物体移除检测报警' },
        { value: '5', label: '绊线检测报警' },
        { value: '6', label: '入侵检测报警' },
        { value: '7', label: '逆行检测报警' },
        { value: '8', label: '徘徊检测报警' },
        { value: '9', label: '流量统计报警' },
        { value: '10', label: '密度检测报警' },
        { value: '11', label: '视频异常检测报警' },
        { value: '12', label: '快速移动报警' }
      ]
    },
    {
      value: '6',
      label: '设备故障报警',
      children: [
        { value: '1', label: '存储设备磁盘故障报警' },
        { value: '2', label: '存储设备风扇故障报警' }
      ]
    },
    {
      value: '7',
      label: '其他报警'
    }
  ]

  private mounted() {
    this.breadCrumbContent = this.$route.meta.title
    this.getTemplateDetails()
  }

  private async getTemplateDetails() {
    try {
      this.loading = true
      const query: any = this.$route.query
      this.templateId = query.templateId
      this.details = await getAlertTemplateDetails({ templateId: this.templateId })
    } catch (e) {
      this.$message.error(`获取模板详情失败，原因：${e && e.message}`)
    } finally {
      this.loading = false
    }
  }
  private back() {
    this.$router.push('/template/alert')
  }
  private getLabel(type: string, value: any) {
    if (!value) return
    let arr: any = []
    switch (type) {
      case 'alarmPriority':
        arr.push(value)
        break
      case 'alarmMethod':
        value && (value = JSON.parse(value))
        arr = Object.keys(value)
        break
    }
    const res: any = []
    arr.forEach((str: any) => {
      const obj = this[`${type}Options`].find((item: any) => item.value === str)
      if (obj) {
        const resStr = obj.label
        if (value[str] && Object.keys(value[str]).length) {
          Object.keys(value[str]).forEach((str1: any) => {
            const resStr1 = resStr + '/' + obj.children.find((item: any) => item.value === str1)?.label
            res.push(resStr1)
          })
        } else {
          res.push(resStr)
        }
      }
    })
    return res
  }
}
</script>

<style>

</style>
