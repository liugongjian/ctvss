<template>
  <div class="app-container">
    <el-page-header content="业务组配置" @back="back" />
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane label="基本信息" name="info">
        <el-button v-if="!edit" type="text" class="info-edit" @click="editForm">编辑</el-button>
        <el-form
          ref="dataForm"
          :model="form"
          label-position="right"
          label-width="180px"
        >
          <el-form-item label="业务组ID:" prop="groupId">
            <span>{{ form.groupId }}</span>
          </el-form-item>
          <el-form-item label="业务组名称:" prop="groupName">
            <span v-if="edit">
              <el-input v-model="form.groupName" />
            </span>
            <span v-else>{{ form.groupName }}</span>
          </el-form-item>
          <el-form-item label="业务组名称:" prop="description">
            <span v-if="edit">
              <el-input v-model="form.description" type="textarea" />
            </span>
            <span v-else>{{ form.description }}</span>
          </el-form-item>
          <el-form-item label="服务区域:" prop="region" class="form-with-tip">
            <span v-if="edit">
              <el-select v-model="form.region" placeholder="请选择">
                <el-option v-for="item in regionList" :key="item" :label="item" :value="item" />
              </el-select>
              <div class="form-tip">服务区域负责对流媒体进行实时处理，包括鉴权、拉流、转码、录制、截图等，请根据处理和存储需求选择</div>
            </span>
            <span v-else>{{ form.region }}</span>
          </el-form-item>
          <el-form-item label="接入类型:" prop="inProtocol">
            <span v-if="edit">
              <el-radio-group v-model="form.inProtocol">
                <el-radio v-for="protocol in inProtocolList" :key="protocol" :label="protocol.toLocaleLowerCase()">{{ protocol }}</el-radio>
              </el-radio-group>
            </span>
            <span v-else>{{ InProtocolType[form.inProtocol] }}</span>
          </el-form-item>
          <el-form-item label="播放类型:" prop="outProtocol">
            <span v-if="edit">
              <el-checkbox-group v-model="form.outProtocol">
                <el-checkbox
                  v-for="protocol in outProtocolList"
                  :key="protocol"
                  :label="protocol.toLocaleLowerCase()"
                >
                  {{ protocol }}
                </el-checkbox>
              </el-checkbox-group>
            </span>
            <span v-else>{{ form.outProtocol.map(item => OutProtocolType[item]).join(',') }}</span>
          </el-form-item>
          <el-form-item label="SIP服务器ID:" prop="sipId">
            <span>{{ form.sipId }}</span>
          </el-form-item>
          <el-form-item label="SIP服务器地址:" prop="sipIp">
            <span>{{ form.sipIp }}</span>
          </el-form-item>
          <el-form-item label="SIP服务器TCP端口:" prop="sipTcpPort">
            <span>{{ form.sipTcpPort }}</span>
          </el-form-item>
          <el-form-item label="SIP服务器UDP端口:" prop="sipUdpPort">
            <span>{{ form.sipUdpPort }}</span>
          </el-form-item>
          <el-form-item v-if="edit">
            <el-button type="primary">确定</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </el-form-item>
        </el-form>
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
  private edit = false
  private regionList = ['华东', '华南', '华北']
  private outProtocolList = Object.values(OutProtocolType)
  private inProtocolList = Object.values(InProtocolType)
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
  private formBackUp = {
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
    this.edit = true
  }

  private cancelEdit() {
    this.edit = false
    this.form = Object.assign({}, this.formBackUp)
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
