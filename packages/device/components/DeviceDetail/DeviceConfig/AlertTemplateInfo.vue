<template>
  <div v-if="inProtocol === 'gb28181'" class="detail__section">
    <div class="detail__title">
      告警模板信息
      <div class="detail__buttons">
        <el-button v-if="!isVGroup && checkPermission(['AdminDevice'])" v-permission="['*']" type="text" @click="setAlertTemplate">配置</el-button>
      </div>
    </div>
    <el-descriptions v-if="template.alertTemplate" :column="2">
      <el-descriptions-item label="模板名称">
        {{ template.alertTemplate.templateName }}
      </el-descriptions-item>
      <el-descriptions-item label="模板概要">
        {{ template.alertTemplate.recordNotifyUrl }}
      </el-descriptions-item>
      <el-descriptions-item label="启动方式">
        {{ template.alertTemplate.enableType === 1 ? '自动开启' : '手动开启' }}
      </el-descriptions-item>
    </el-descriptions>
    <div v-else-if="!loading.alertTemplate" class="detail__empty-card">
      暂未绑定告警模板
    </div>
    <set-alert-template
      v-if="setAlertTemplateDialog"
      :in-protocol="inProtocol"
      :device-id="deviceId"
      :template-id="alertTemplateId"
      @on-close="closeAlertTemplateDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getAlertBind } from '@/api/template'
import SetAlertTemplate from '@vss/device/components/TemplateDialog/SetAlertTemplate.vue'
import { checkPermission } from '@/utils/permission'

@Component({
  name: 'AlertTemplateInfo',
  components: {
    SetAlertTemplate
  }
})
export default class extends Vue {
  private inProtocol = 'gb28181'

  private checkPermission = checkPermission

  private loading = {
    alertTemplate: false
  }

  private template: any = {
    alertTemplate: {}
  }

  private setAlertTemplateDialog = false
  private alertTemplateId = ''

  private async mounted() {
    this.getAlertTemplate()
  }

  public get isVGroup() {
    return this.$route.query.inProtocol === 'vgroup'
  }

  /**
   * 获取告警模板
   */
  private async getAlertTemplate() {
    try {
      this.loading.alertTemplate = true
      this.template.alertTemplate = null
      // if (this.groupId) {
      //   const res = await getAlertBind({ groupId: this.groupId })
      //   this.template.alertTemplate.push(res)
      // } else {
      //   const res = await getAlertBind({ deviceId: this.deviceId, inProtocol: this.inProtocol })
      //   this.template.alertTemplate.push(res)
      // }
      const res = await getAlertBind({ deviceId: this.deviceId, inProtocol: this.inProtocol })
      this.template.alertTemplate = res
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.alertTemplate = false
    }
  }

  /**
   * 设置回调模板
   */
  private setAlertTemplate() {
    this.setAlertTemplateDialog = true
    this.alertTemplateId = this.template.alertTemplate ? this.template.alertTemplate.templateId : null
  }

  /**
   * 关闭告警模板
   */
  private closeAlertTemplateDialog() {
    this.setAlertTemplateDialog = false
    this.getAlertTemplate()
  }
}
</script>
