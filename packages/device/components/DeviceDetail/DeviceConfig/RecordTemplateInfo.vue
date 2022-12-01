<template>
  <div v-loading="loading" class="detail__section">
    <div class="detail__title">
      录制模板信息
      <div class="detail__buttons">
        <el-button v-if="checkPermission(['AdminDevice'])" v-permission="['*']" type="text" @click="setRecordTemplate">配置</el-button>
      </div>
    </div>
    <el-descriptions v-if="template" :column="2">
      <el-descriptions-item label="模板名称">
        {{ template.templateName }}
      </el-descriptions-item>
      <el-descriptions-item label="是否启用自动录制">
        {{ template.recordType === 1 ? '是':'否' }}
      </el-descriptions-item>
      <el-descriptions-item label="录制格式">
        {{ template.flvParam && template.flvParam.enable ? 'flv': '' }}
        {{ template.hlsParam && template.hlsParam.enable ? 'hls': '' }}
        {{ template.hlsParam && template.hlsParam.enable ? 'mp4': '' }}
      </el-descriptions-item>
    </el-descriptions>
    <div v-else-if="!loading" class="detail__empty-card">
      暂未绑定录制模板
    </div>
    <set-record-template
      v-if="setRecordTemplateDialog"
      :device-id="deviceId"
      :template-id="recordTemplateId"
      @on-close="closeSetRecordTemplateDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getDeviceRecordTemplate } from '@vss/device/api/template'
import SetRecordTemplate from '@vss/device/components/TemplateDialog/SetRecordTemplate.vue'
import { checkPermission } from '@vss/base/utils/permission'

@Component({
  name: 'RecordTemplateInfo',
  components: {
    SetRecordTemplate
  }
})
export default class extends Vue {
  @Prop() private deviceId: string
  private checkPermission = checkPermission
  private loading = false
  private template: any = null
  private setRecordTemplateDialog = false
  private recordTemplateId = ''

  /**
   * 初始化
   */
  private async mounted() {
    this.getRecordTemplate()
  }

  /**
   * 获取录制模板
   */
  private async getRecordTemplate() {
    try {
      this.loading = true
      this.template = null
      const res = await getDeviceRecordTemplate({ deviceId: this.deviceId })
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
   * 设置录制模板
   */
  private setRecordTemplate() {
    this.setRecordTemplateDialog = true
    this.recordTemplateId = this.template ? this.template.templateId : null
  }

  /**
   * 关闭设置录制模板
   */
  private closeSetRecordTemplateDialog() {
    this.setRecordTemplateDialog = false
    this.getRecordTemplate()
  }
}
</script>
