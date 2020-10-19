<template>
  <el-dialog
    title="设置回调模板"
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
      <el-table-column prop="recordNotifyUrl" label="回调URL" />
      <el-table-column prop="callbackKey" label="回调Key" />
      <el-table-column label="操作">
        <template slot-scope="{row}">
          <el-button v-if="row.templateId !== bindTemplateId" type="text" :disabled="bindTemplateId.length !== 0" @click="bind(row)">绑定</el-button>
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
import { getRecordTemplates, setGroupCallBackTemplate, unbindGroupCallBackTemplate } from '@/api/group'
import { setStreamCallBackTemplate, unbindStreamCallBackTemplate, getCallBackTemplates } from '@/api/stream'
import { formatSeconds } from '@/utils/interval'
import { template } from 'lodash'

@Component({
  name: 'SetCallBackTemplate'
})
export default class extends Vue {
  @Prop() private groupId?: string
  @Prop() private streamId?: string
  @Prop() private templateId?: string
  private dialogVisible = true
  private loading = false
  private list = [
  ]
  private formatSeconds = formatSeconds
  private bindTemplateId = ''

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }

  private async bind(row: any) {
    try {
      this.loading = true
      if (this.streamId) {
        await setStreamCallBackTemplate({
          deviceId: this.streamId,
          templateId: row.templateId
        })
      } else {
        await setGroupCallBackTemplate({
          groupId: this.groupId,
          templateId: row.templateId
        })
      }
      this.bindTemplateId = row.templateId
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async unbind(row: any) {
    try {
      this.loading = true
      if (this.streamId) {
        await unbindStreamCallBackTemplate({
          deviceId: this.streamId,
          templateId: row.templateId
        })
      } else {
        await unbindGroupCallBackTemplate({
          groupId: this.groupId,
          templateId: row.templateId
        })
      }
      this.bindTemplateId = ''
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async mounted() {
    this.bindTemplateId = this.templateId!
    try {
      this.loading = true
      const res = await getCallBackTemplates({
        pageNum: 1,
        pageSize: 50
      })
      this.list = res.templates
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
