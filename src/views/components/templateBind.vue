<template>
  <div>
    <el-card>
      <el-button v-permission="['*']" type="text" class="template-edit" @click="setRecordTemplate">编辑</el-button>
      <info-list title="录制模板">
        <el-table v-loading="loading.record" :data="template.recordTemplate" empty-text="该设备或组没有绑定录制模板" fit>
          <el-table-column prop="templateName" label="模板名称" />
          <el-table-column prop="recordType" label="是否启用自动录制">
            <template slot-scope="{row}">
              {{ row.recordType === 1 ? '是':'否' }}
            </template>
          </el-table-column>
          <el-table-column prop="storeType" label="录制格式">
            <template slot-scope="{row}">
              {{ row.flvParam.enable ? 'flv': '' }}
              {{ row.hlsParam.enable ? 'hls': '' }}
              {{ row.mpParam.enable ? 'mp4': '' }}
            </template>
          </el-table-column>
        </el-table>
      </info-list>
    </el-card>
    <el-card style="margin-top:20px;">
      <el-button v-permission="['*']" type="text" class="template-edit" @click="setCallbackTemplate">编辑</el-button>
      <info-list title="回调模板">
        <el-table v-loading="loading.callback" :data="template.callbackTemplate" fit empty-text="该设备或组没有绑定回调模板">
          <el-table-column prop="templateName" label="模板名称" />
          <el-table-column prop="recordNotifyUrl" label="回调URL" />
          <el-table-column prop="callbackKey" label="回调Key" />
        </el-table>
      </info-list>
    </el-card>
    <el-card style="margin-top: 20px;">
      <el-button v-permission="['*']" type="text" class="template-edit" @click="setAITemplate">编辑</el-button>
      <info-list title="AI模板">
        <el-table v-loading="loading.ai" :data="template.aiTemplate" empty-text="该设备或组没有绑定AI模板" fit>
          <el-table-column prop="templateName" label="模板名称" />
          <el-table-column prop="description" label="模板概要" />
          <el-table-column prop="enableType" label="启动方式">
            <template slot-scope="{row}">
              {{ row.enableType === 1 ? '自动开启' : '手动开启' }}
            </template>
          </el-table-column>
        </el-table>
      </info-list>
    </el-card>
    <el-card style="margin-top: 20px;">
      <el-button v-permission="['*']" type="text" class="template-edit" @click="setAlertTemplate">编辑</el-button>
      <info-list title="告警模板">
        <el-table v-loading="loading.alert" :data="template.alertTemplate" empty-text="该设备或组没有绑定告警模板" fit>
          <el-table-column prop="templateName" label="模板名称" />
          <el-table-column prop="description" label="模板概要" />
          <el-table-column prop="enableType" label="启动方式">
            <template slot-scope="{row}">
              {{ row.enableType === 1 ? '自动开启' : '手动开启' }}
            </template>
          </el-table-column>
        </el-table>
      </info-list>
    </el-card>
    <SetRecordTemplate
      v-if="setRecordTemplateDialog"
      :group-id="groupId"
      :device-id="deviceId"
      :in-protocol="inProtocol"
      :template-id="recordTemplateId"
      @on-close="closeSetRecordTemplateDialog"
    />
    <SetCallBackTemplate
      v-if="setCallbackTemplateDialog"
      :in-protocol="inProtocol"
      :device-id="deviceId"
      :group-id="groupId"
      :template-id="callbackTemplateId"
      @on-close="closeCallbackTemplateDialog"
    />
    <SetAITemplate
      v-if="setAITemplateDialog"
      :in-protocol="inProtocol"
      :group-id="groupId"
      :device-id="deviceId"
      :template-id="aiTemplateId"
      @on-close="closeSetAITemplateDialog"
    />
    <SetAlertTemplate
      v-if="setAlertTemplateDialog"
      :in-protocol="inProtocol"
      :group-id="groupId"
      :device-id="deviceId"
      :template-id="alertTemplateId"
      @on-close="closeSetAlertTemplateDialog"
    />
  </div>
</template>
<script lang="ts">
import SetRecordTemplate from './dialogs/SetRecordTemplate.vue'
import SetCallBackTemplate from './dialogs/SetCallBackTemplate.vue'
import SetAITemplate from './dialogs/SetAITemplate.vue'
import SetAlertTemplate from './dialogs/SetAlertTemplate.vue'
import { RecordTemplate } from '@/type/template'
import { getGroupRecordTemplate, getGroupCallbackTemplate } from '@/api/group'
import { getDeviceRecordTemplate, getDeviceCallbackTemplate } from '@/api/device'
import { getAIBind, getAlertBind } from '@/api/template'
import { Component, Vue, Prop } from 'vue-property-decorator'
@Component({
  name: 'TemplateBind',
  components: {
    SetRecordTemplate,
    SetCallBackTemplate,
    SetAITemplate,
    SetAlertTemplate
  },
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
  @Prop() private groupId?: string
  @Prop() private deviceId?: String
  @Prop() private inProtocol?: String
  private loading = {
    record: false,
    callback: false,
    ai: false,
    alert: false
  }
  private template: Record<any, Array<RecordTemplate>> = {
    callbackTemplate: [],
    recordTemplate: [],
    aiTemplate: [],
    alertTemplate: []
  }
  private setRecordTemplateDialog = false
  private setCallbackTemplateDialog = false
  private setAITemplateDialog = false
  private setAlertTemplateDialog = false
  private recordTemplateId = ''
  private callbackTemplateId = ''
  private aiTemplateId = ''
  // private alarmPriorityOptions: any = [
  //   { label: '一级警情', value: '1' },
  //   { label: '二级警情', value: '2' },
  //   { label: '三级警情', value: '3' },
  //   { label: '四级警情', value: '4' }
  // ]
  // private alarmMethodOptions: any = [
  //   {
  //     value: '1',
  //     label: '电话报警'
  //   },
  //   {
  //     value: '2',
  //     label: '设备报警',
  //     children: [
  //       { value: '1', label: '视频丢失报警' },
  //       { value: '2', label: '设备防拆报警' },
  //       { value: '3', label: '存储设备磁盘满报警' },
  //       { value: '4', label: '设备高温报警' },
  //       { value: '5', label: '设备低温报警' }
  //     ]
  //   },
  //   {
  //     value: '3',
  //     label: '短信报警'
  //   },
  //   {
  //     value: '4',
  //     label: 'GPS报警'
  //   },
  //   {
  //     value: '5',
  //     label: '视频报警',
  //     children: [
  //       { value: '1', label: '人工视频报警' },
  //       { value: '2', label: '运动目标检测报警' },
  //       { value: '3', label: '遗留物检测报警' },
  //       { value: '4', label: '物体移除检测报警' },
  //       { value: '5', label: '绊线检测报警' },
  //       { value: '6', label: '入侵检测报警' },
  //       { value: '7', label: '逆行检测报警' },
  //       { value: '8', label: '徘徊检测报警' },
  //       { value: '9', label: '流量统计报警' },
  //       { value: '10', label: '密度检测报警' },
  //       { value: '11', label: '视频异常检测报警' },
  //       { value: '12', label: '快速移动报警' }
  //     ]
  //   },
  //   {
  //     value: '6',
  //     label: '设备故障报警',
  //     children: [
  //       { value: '1', label: '存储设备磁盘故障报警' },
  //       { value: '2', label: '存储设备风扇故障报警' }
  //     ]
  //   },
  //   {
  //     value: '7',
  //     label: '其他报警'
  //   }
  // ]

  private async mounted() {
    this.getStreamTemplate()
    this.getRecordTemplate()
    this.getAITemplate()
    this.getAlertTemplate()
  }

  private setRecordTemplate() {
    this.setRecordTemplateDialog = true
    if (!this.template.recordTemplate.length) {
      this.recordTemplateId = ''
    } else {
      this.recordTemplateId = this.template.recordTemplate[0].templateId!
    }
  }

  private setAITemplate() {
    this.setAITemplateDialog = true
    if (!this.template.aiTemplate.length) {
      this.aiTemplateId = ''
    } else {
      this.aiTemplateId = this.template.aiTemplate[0].templateId!
    }
  }

  private async getRecordTemplate() {
    try {
      this.loading.record = true
      this.template.recordTemplate = []
      if (this.groupId) {
        const res = await getGroupRecordTemplate({ groupId: this.groupId })
        this.template.recordTemplate.push(res)
      } else {
        const res = await getDeviceRecordTemplate({ deviceId: this.deviceId, inProtocol: this.inProtocol })
        this.template.recordTemplate.push(res)
      }
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.record = false
    }
  }

  private async getAITemplate() {
    try {
      this.loading.alert = true
      this.template.alertTemplate = []
      if (this.groupId) {
        const res = await getAIBind({ groupId: this.groupId })
        this.template.alertTemplate.push(res)
      } else {
        const res = await getAIBind({ deviceId: this.deviceId, inProtocol: this.inProtocol })
        this.template.alertTemplate.push(res)
      }
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.alert = false
    }
  }

  private async closeSetRecordTemplateDialog() {
    this.setRecordTemplateDialog = false
    this.getRecordTemplate()
  }

  private async closeSetAITemplateDialog() {
    this.setAITemplateDialog = false
    this.getAITemplate()
  }

  private setCallbackTemplate() {
    this.setCallbackTemplateDialog = true
    if (!this.template.callbackTemplate.length) {
      this.callbackTemplateId = ''
    } else {
      this.callbackTemplateId = this.template.callbackTemplate[0].templateId!
    }
  }

  private async getStreamTemplate() {
    try {
      this.loading.callback = true
      this.template.callbackTemplate = []
      if (this.groupId) {
        const res = await getGroupCallbackTemplate({ groupId: this.groupId })
        this.template.callbackTemplate.push(res)
      } else {
        const res = await getDeviceCallbackTemplate({ deviceId: this.deviceId, inProtocol: this.inProtocol })
        this.template.callbackTemplate.push(res)
      }
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.callback = false
    }
  }

  private async closeCallbackTemplateDialog() {
    this.setCallbackTemplateDialog = false
    this.getStreamTemplate()
  }

  /**
   * 告警模板
   */
  // private getLabel(type: string, value: any) {
  //   let arr: any = value.split(',')
  //   let res: any = arr.map((str: any) => {
  //     let obj = this[`${type}Options`].find((item: any) => item.value === str.slice(0, 1))
  //     let resStr = obj.label
  //     if (obj) {
  //       return resStr
  //     } else {
  //       return 'undefined'
  //     }
  //   })
  //   res = [...new Set(res)].join('，')
  //   return res
  // }

  private async getAlertTemplate() {
    try {
      this.loading.alert = true
      this.template.alertTemplate = []
      if (this.groupId) {
        const res = await getAlertBind({ groupId: this.groupId })
        this.template.alertTemplate.push(res)
      } else {
        const res = await getAlertBind({ deviceId: this.deviceId, inProtocol: this.inProtocol })
        this.template.alertTemplate.push(res)
      }
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.alert = false
    }
  }

  private setAlertTemplate() {
    this.setAlertTemplateDialog = true
    if (!this.template.alertTemplate.length) {
      this.alertTemplateId = ''
    } else {
      this.alertTemplateId = this.template.alertTemplate[0].templateId!
    }
  }

  private async closeSetAlertTemplateDialog() {
    this.setAlertTemplateDialog = false
    this.getAlertTemplate()
  }
}
</script>

<style lang="scss" scoped>
.template-edit {
  float: right;
  padding: 0;
  margin-right: 5px;
}
</style>
