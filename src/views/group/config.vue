<template>
  <div class="app-container">
    <el-page-header content="业务组配置" @back="back" />
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane label="基本信息" name="info">
        <el-button type="text" class="info-edit" @click="editForm">编辑</el-button>
        <info-list label-width="150">
          <info-list-item label="业务组ID:">{{ form.groupId }}</info-list-item>
          <info-list-item label="业务组名称:">{{ form.groupName }}</info-list-item>
          <info-list-item label="业务组描述:">{{ form.description }}</info-list-item>
          <info-list-item label="服务区域:">{{ form.region }}</info-list-item>
          <info-list-item label="接入类型:">{{ InProtocolType[form.inProtocol] }}</info-list-item>
          <info-list-item label="播放类型:">{{ form.outProtocol.map(item => OutProtocolType[item]).join(',') }}</info-list-item>
          <info-list-item label="SIP服务器ID:">{{ form.sipId }}</info-list-item>
          <info-list-item label="SIP服务器地址:">{{ form.sipIp }}</info-list-item>
          <info-list-item label="SIP服务器TCP端口:">{{ form.sipTcpPort }}</info-list-item>
          <info-list-item label="SIP服务器UDP端口:">{{ form.sipUdpPort }}</info-list-item>
        </info-list>
      </el-tab-pane>
      <el-tab-pane label="模板配置" name="template">
        <el-form
          label-position="right"
          label-width="100px"
        >
          <el-form-item label="录制模板:">
            <div class="template-edit">
              <div class="template-edit--value">{{ template.recordTemplate?template.recordTemplate:'未配置' }}</div>
              <div class="template-edit--action">
                <el-button type="text" @click="setRecordTemplate">设置</el-button>
                <span v-if="template.recordTemplate" class="template-edit--seperator">|</span>
                <el-button v-if="template.recordTemplate" type="text">解绑</el-button>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="截图模板:">
            <div class="template-edit">
              <div class="template-edit--value">{{ template.screencutTemplate?template.screencutTemplate:'未配置' }}</div>
              <div class="template-edit--action">
                <el-button type="text" @click="setScrrenCutTemplate">设置</el-button>
                <span v-if="template.screencutTemplate" class="template-edit--seperator">|</span>
                <el-button v-if="template.screencutTemplate" type="text">解绑</el-button>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <SetRecordTemplate v-if="setRecordTemplateDialog" @on-close="closeSetRecordTemplateDialog" />
    <SetScreenCutTemplate
      v-if="setScreenCutTemplateDialog"
      @on-close="closeSetScrrenCutTemplateDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { OutProtocolType, InProtocolType } from '@/dics'
import SetRecordTemplate from './dialogs/setRecordTemplate.vue'
import SetScreenCutTemplate from './dialogs/setScreenCutTemplate.vue'

@Component({
  name: 'GroupConfig',
  components: {
    SetRecordTemplate,
    SetScreenCutTemplate
  }
})
export default class extends Vue {
  private activeName = 'info'
  private InProtocolType = InProtocolType
  private OutProtocolType = OutProtocolType
  private form = {
    groupId: '327439123674913',
    groupName: '上海电信园区监控',
    description: '用于办公楼道内安全监控',
    inProtocol: 'rtmp',
    outProtocol: ['flv', 'hls'],
    region: '华东',
    sipId: '310132328883832',
    sipIp: '192.34.83.132',
    sipTcpPort: 5060,
    sipUdpPort: 80
  }
  private template = {
    screencutTemplate: '123'
  }
  private setRecordTemplateDialog = false
  private setScreenCutTemplateDialog = false

  private back() {
    this.$router.push('/group')
  }

  private handleClick(tab: any, event: any) {
    this.activeName = tab.name
  }

  private editForm() {
    this.$router.push({
      path: '/group/update',
      query: {
        groupId: this.form.groupId
      }
    })
  }

  private setRecordTemplate() {
    this.setRecordTemplateDialog = true
  }

  private setScrrenCutTemplate() {
    this.setScreenCutTemplateDialog = true
  }

  private closeSetRecordTemplateDialog() {
    this.setRecordTemplateDialog = false
  }

  private closeSetScrrenCutTemplateDialog() {
    this.setScreenCutTemplateDialog = false
  }
}
</script>
<style lang="scss" scoped>
  .template-edit {
    display: flex;
    &--value {
      min-width: 100px;
    }
    &--seperator {
      display: inline-block;
      width: 20px;
      text-align: center;
      color: $borderGrey;
    }
  }

  .info-edit {
    position: absolute;
    right: 40px;
    z-index: 10;
  }

  .el-input, .el-select, .el-textarea {
    width: 400px;
  }
</style>
