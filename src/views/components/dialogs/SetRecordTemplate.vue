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
      <el-table-column prop="recordType" label="是否启用全天录制">
        <template slot-scope="{row}">
          {{ row.recordType === 1 ? '是':'否' }}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="storeType" label="录制格式">
        <template slot-scope="{row}">
          {{ row.flvParam.enable ? 'flv': '' }}
          {{ row.hlsParam.enable ? 'hls': '' }}
          {{ row.mpParam.enable ? 'mp4': '' }}
        </template>
      </el-table-column> -->
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
import { getRecordTemplates, setGroupRecordTemplates, unbindGroupRecordTemplates } from '@/api/group'
import { setDeviceRecordTemplate, unbindDeviceRecordTemplate, startRecord } from '@/api/device'
import { formatSeconds } from '@/utils/interval'

@Component({
  name: 'SetRecordTemplate'
})
export default class extends Vue {
  @Prop() private groupId?: string
  @Prop() private deviceId?: String
  @Prop() private templateId?: string
  @Prop() private inProtocol?: string
  private dialogVisible = true
  private loading = false
  private list = [
    {
      templateId: '0001',
      templateName: '30分钟录制',
      flvParam: { enable: 0 },
      hlsParam: { enable: 0 },
      mpParam: { enable: 0 }
    }
  ]
  private formatSeconds = formatSeconds
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
        await setGroupRecordTemplates(params)
      } else if (this.deviceId) {
        await setDeviceRecordTemplate(params)
      }
      this.bindTemplateId = row.templateId
      if (row.recordType === 2) {
        this.startRecord()
      }
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
        await unbindGroupRecordTemplates(params)
      } else if (this.deviceId) {
        await unbindDeviceRecordTemplate(params)
      }
      this.bindTemplateId = ''
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  public startRecord() {
    this.$confirm('绑定后是否立即启动录制？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async() => {
      try {
        const params: any = {
          deviceId: this.deviceId,
          inProtocol: this.inProtocol
        }
        await startRecord(params)
        this.$message.success('已通知开始录制')
        this.init()
        return true
      } catch (e) {
        this.$message.error(e && e.message)
        console.error(e)
      }
    })
  }

  private async mounted() {
    this.bindTemplateId = this.templateId!
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
}
</script>
<style lang="scss" scoped>
</style>
