<template>
  <div class="detail__section">
    <div class="detail__title">
      告警模板信息
      <div class="detail__buttons">
        <el-button v-if="checkPermission(['AdminDevice'])" v-permission="['*']" type="text" @click="setAlertTemplate">配置</el-button>
      </div>
    </div>
    <el-descriptions v-if="template" :column="2">
      <el-descriptions-item label="模板名称">
        {{ template.templateName }}
      </el-descriptions-item>
      <el-descriptions-item label="模板概要">
        {{ template.recordNotifyUrl }}
      </el-descriptions-item>
      <el-descriptions-item label="启动方式">
        {{ template.enableType === 1 ? '自动开启' : '手动开启' }}
      </el-descriptions-item>
    </el-descriptions>
    <div v-else-if="!loading" class="detail__empty-card">
      暂未绑定告警模板
    </div>
    <set-alert-template
      v-if="setAlertTemplateDialog"
      :device-id="deviceId"
      :template-id="alertTemplateId"
      @on-close="closeAlertTemplateDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getAlertBind } from '@vss/device/api/template'
import SetAlertTemplate from '@vss/device/components/TemplateDialog/SetAlertTemplate.vue'
import { checkPermission } from '@/utils/permission'

@Component({
  name: 'AlertTemplateInfo',
  components: {
    SetAlertTemplate
  }
})
export default class extends Vue {
  @Prop() private deviceId: string
  private checkPermission = checkPermission
  private loading = false
  private template: any = null
  private setAlertTemplateDialog = false
  private alertTemplateId = ''

  /**
   * 初始化
   */
  private async mounted() {
    this.getAlertTemplate()
  }

  /**
   * 获取告警模板
   */
  private async getAlertTemplate() {
    try {
      this.loading = true
      this.template = null
      const res = await getAlertBind({ deviceId: this.deviceId })
      this.template = res
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading = false
    }
  }

  /**
   * 设置回调模板
   */
  private setAlertTemplate() {
    this.setAlertTemplateDialog = true
    this.alertTemplateId = this.template ? this.template.templateId : null
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
