<template>
  <div v-loading="loading.recordTemplate" class="detail__section">
    <div class="detail__title">
      录制模板信息
      <div class="detail__buttons">
        <el-button v-if="!isVGroup && checkPermission(['AdminDevice'])" v-permission="['*']" type="text" @click="setRecordTemplate">配置</el-button>
      </div>
    </div>
    <el-descriptions v-if="template.recordTemplate" :column="2">
      <el-descriptions-item label="模板名称">
        {{ template.recordTemplate.templateName }}
      </el-descriptions-item>
      <el-descriptions-item label="是否启用自动录制">
        {{ template.recordTemplate.recordType === 1 ? '是':'否' }}
      </el-descriptions-item>
      <el-descriptions-item label="录制格式">
        {{ template.recordTemplate.flvParam && template.recordTemplate.flvParam.enable ? 'flv': '' }}
        {{ template.recordTemplate.hlsParam && template.recordTemplate.hlsParam.enable ? 'hls': '' }}
        {{ template.recordTemplate.hlsParam && template.recordTemplate.hlsParam.enable ? 'mp4': '' }}
      </el-descriptions-item>
    </el-descriptions>
    <div v-else-if="!loading.recordTemplate" class="detail__empty-card">
      暂未绑定录制模板
    </div>
    <set-record-template
      v-if="setRecordTemplateDialog"
      :device-id="deviceId"
      :in-protocol="inProtocol"
      :template-id="recordTemplateId"
      @on-close="closeSetRecordTemplateDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getDeviceRecordTemplate } from '@vss/device/api/device'
import SetRecordTemplate from '@vss/device/components/TemplateDialog/SetRecordTemplate.vue'
import { checkPermission } from '@vss/base/utils/permission'

@Component({
  name: 'RecordTemplateInfo',
  components: {
    SetRecordTemplate
  }
})
export default class extends Vue {
  private inProtocol = 'gb28181'

  private checkPermission = checkPermission

  private loading = {
    recordTemplate: false
  }

  private template: any = {
    recordTemplate: {}
  }

  private setRecordTemplateDialog = false
  private recordTemplateId = ''

  private async mounted() {
    this.getRecordTemplate()
  }

  public get isVGroup() {
    return this.$route.query.inProtocol === 'vgroup'
  }

  /**
   * 获取录制模板
   */
  private async getRecordTemplate() {
    try {
      this.loading.recordTemplate = true
      this.template.recordTemplate = null
      const res = await getDeviceRecordTemplate({ deviceId: this.deviceId, inProtocol: this.inProtocol })
      this.template.recordTemplate = res
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.recordTemplate = false
    }
  }

  /**
   * 设置录制模板
   */
  private setRecordTemplate() {
    this.setRecordTemplateDialog = true
    this.recordTemplateId = this.template.recordTemplate ? this.template.recordTemplate.templateId : null
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
