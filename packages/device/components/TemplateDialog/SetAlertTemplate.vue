<template>
  <el-dialog
    title="设置告警模板"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="list"
      fit
      highlight-current-row
      max-height="500"
    >
      <el-table-column prop="templateName" label="模板名称" />
      <el-table-column prop="alarmPriority" label="报警级别">
        <template slot-scope="{ row }">
          {{ getLabel('alarmPriority', row.alarmPriority) }}
        </template>
      </el-table-column>
      <el-table-column prop="alarmMethod" label="报警方式">
        <template slot-scope="{ row }">
          {{ getLabel('alarmMethod', row.alarmMethod) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <el-button v-if="row.templateId !== bindTemplateId" type="text" :disabled="!!bindTemplateId" @click="bind(row)">绑定</el-button>
          <el-button v-else type="text" @click="unbind(row)">解绑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">关闭</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getAlertTemplates, bindAlertTemplates, unbindAlertTemplates } from '@vss/device/api/template'

@Component({
  name: 'SetAlertTemplate',
  filters: {
    lengthFormat: (value: string) => {
      if (value.length > 15) {
        return value.slice(0, 15) + '...'
      } else {
        return value
      }
    }
  }
})
export default class extends Vue {
  @Prop() private deviceId?: String
  @Prop() private templateId?: string
  private dialogVisible = true
  private loading = false
  private list = []
  private bindTemplateId = ''
  private alarmPriorityOptions: any = [
    { label: '一级警情', value: '1' },
    { label: '二级警情', value: '2' },
    { label: '三级警情', value: '3' },
    { label: '四级警情', value: '4' }
  ]
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

  private getLabel(type: string, value: any) {
    try {
      let arr: any = []
      switch (type) {
        case 'alarmPriority':
          arr.push(value)
          break
        case 'alarmMethod':
          arr = Object.keys(JSON.parse(value))
          break
      }
      let res: any = arr.map((str: any) => {
        const obj = this[`${type}Options`].find((item: any) => item.value === str)
        if (obj) {
          return obj.label
        } else {
          return 'undefined'
        }
      })
      res = [...new Set(res)].join('，')
      return res
    } catch (err) {
      // console.log(err)
    }
  }

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }

  private async bind(row: any) {
    const params = {
      deviceId: this.deviceId,
      templateId: row.templateId
    }
    try {
      this.loading = true
      await bindAlertTemplates(params)
      this.bindTemplateId = row.templateId
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async unbind(row: any) {
    const params = {
      deviceId: this.deviceId,
      templateId: row.templateId
    }
    try {
      this.loading = true
      await unbindAlertTemplates(params)
      this.bindTemplateId = ''
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async mounted() {
    this.bindTemplateId = this.templateId
    try {
      this.loading = true
      const res = await getAlertTemplates({
        pageNum: 1,
        pageSize: 999
      })
      this.list = res.alarmTemplates
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }
}
</script>
