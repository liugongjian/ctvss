<template>
  <el-dialog
    title="设置录制模板"
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
      <el-table-column prop="recordType" label="是否启用自动录制">
        <template slot-scope="{ row }">
          {{ row.recordType === 1 ? '是':'否' }}
        </template>
      </el-table-column>
      <el-table-column prop="storeType" label="录制格式">
        <template slot-scope="{ row }">
          {{ row.flvParam.enable ? 'flv': '' }}
          {{ row.hlsParam.enable ? 'hls': '' }}
          {{ row.mpParam.enable ? 'mp4': '' }}
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
import { getRecordTemplates, setDeviceRecordTemplate, unbindDeviceRecordTemplate } from '@vss/device/api/template'
import { formatSeconds } from '@vss/base/utils/interval'

@Component({
  name: 'SetRecordTemplate'
})
export default class extends Vue {
  @Prop() private deviceId?: String
  @Prop() private templateId?: string
  private dialogVisible = true
  private loading = false
  private list = []
  private formatSeconds = formatSeconds
  private bindTemplateId = ''

  /**
   * 初始化
   */
  private async mounted() {
    this.bindTemplateId = this.templateId
    this.getRecordTemplates()
  }

  /**
   * 获取录像模板列表
   */
  private async getRecordTemplates() {
    try {
      this.loading = true
      const res = await getRecordTemplates({
        pageNum: 1,
        pageSize: 999
      })
      this.list = res.templates
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 绑定录像模板
   */
  private async bind(row: any) {
    const params = {
      deviceId: this.deviceId,
      templateId: row.templateId
    }
    try {
      this.loading = true
      await setDeviceRecordTemplate(params)
      this.bindTemplateId = row.templateId
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 解绑录像模板
   */
  private async unbind(row: any) {
    const params = {
      deviceId: this.deviceId,
      templateId: row.templateId
    }
    try {
      this.loading = true
      await unbindDeviceRecordTemplate(params)
      this.bindTemplateId = ''
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 关闭窗口
   */
  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }
}
</script>
