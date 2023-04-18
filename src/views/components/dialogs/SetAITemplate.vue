<template>
  <el-dialog
    title="设置AI模板"
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
      <el-table-column prop="description" label="模板概要" />
      <el-table-column prop="enableType" label="启动方式">
        <template slot-scope="{row}">
          {{ row.enableType === 1 ? '自动开启' : '手动开启' }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{row}">
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
import { getAITemplates, bindAITemplates, unbindAITemplates } from '@/api/template'

@Component({
  name: 'SetAITemplate'
})
export default class extends Vue {
  @Prop() private groupId?: string
  @Prop() private deviceId?: String
  @Prop() private inProtocol?: String
  @Prop() private templateId?: string
  private dialogVisible = true
  private loading = false
  private list = []
  private bindTemplateId = ''

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }

  private async bind(row: any) {
    let params = {
      groupId: this.groupId,
      deviceId: this.deviceId,
      templateId: row.templateId,
      inProtocol: this.inProtocol
    }
    try {
      this.loading = true
      if (this.groupId) {
        await bindAITemplates(params)
      } else if (this.deviceId) {
        await bindAITemplates(params)
      }
      this.bindTemplateId = row.templateId
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async unbind(row: any) {
    let params = {
      groupId: this.groupId,
      deviceId: this.deviceId,
      templateId: row.templateId,
      inProtocol: this.inProtocol
    }
    try {
      this.loading = true
      if (this.groupId) {
        await unbindAITemplates(params)
      } else if (this.deviceId) {
        await unbindAITemplates(params)
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
      const res = await getAITemplates({
        pageNum: 1,
        pageSize: 999
      })
      this.list = res.aITemplates
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
