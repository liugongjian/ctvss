<template>
  <div>
    <el-page-header content="创建业务组" @back="back" />
    <div class="app-container">
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="info">
          <el-button type="text" style="float:right;" @click="editForm">编辑</el-button>
          <el-form
            ref="dataForm"
            :model="form"
            label-position="left"
            label-width="200px"
            style="margin:0 100px 0 0;"
          >
            <el-form-item label="业务组ID:" prop="groupId">
              <span>{{ form.groupId }}</span>
            </el-form-item>
            <el-form-item label="业务组名称:" prop="groupName">
              <span v-if="edit">
                <el-input v-model="form.groupName" type="textarea" />
              </span>
              <span v-else>{{ form.groupName }}</span>
            </el-form-item>
            <el-form-item label="服务区域:" prop="region">
              <span v-if="edit">
                <el-select v-model="form.region" placeholder="请选择">
                  <el-option v-for="item in regionList" :key="item" :label="item" :value="item" />
                </el-select>
                <div style="color:gray;">服务区域负责对流媒体进行实时处理，包括鉴权、拉流、转码、录制、截图等，请根据处理和存储需求选择</div>
              </span>
              <span v-else>{{ form.region }}</span>
            </el-form-item>
            <el-form-item label="接入类型:" prop="inProtocol">
              <span v-if="edit">
                <el-radio-group v-model="form.inProtocol">
                  <el-radio label="gb28181">GB28181</el-radio>
                  <el-radio label="rtmp">RTMP</el-radio>
                  <el-radio label="onvif">ONVIF</el-radio>
                  <el-radio label="rtsp">RTSP</el-radio>
                </el-radio-group>
              </span>
              <span v-else>{{ form.inProtocol }}</span>
            </el-form-item>
            <el-form-item label="播放类型:" prop="outProtocol">
              <span v-if="edit">
                <el-checkbox-group v-model="form.outProtocol">
                  <el-checkbox
                    v-for="protocol in outProtocolList"
                    :key="protocol"
                    :label="protocol"
                  >
                    {{ protocol }}
                  </el-checkbox>
                </el-checkbox-group>
              </span>
              <span v-else>{{ form.outProtocol.join(',') }}</span>
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
          </el-form>
          <div v-if="edit" style="text-align: center;">
            <el-button type="primary">确定</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="模板配置" name="template">
          <div class="info-list">
            <div class="info-list--key">录制模板:</div>
            <div class="info-list--value">{{ template.recordTemplate?template.recordTemplate:'未配置' }}</div>
            <div class="info-list--action">
              <el-button type="text" @click="setRecordTemplate">设置</el-button>
              <span v-if="template.recordTemplate" class="info-list--seperator">|</span>
              <el-button v-if="template.recordTemplate" type="text">解绑</el-button>
            </div>
          </div>
          <div class="info-list">
            <div class="info-list--key">截图模板:</div>
            <div class="info-list--value">{{ template.screencutTemplate?template.screencutTemplate:'未配置' }}</div>
            <div class="info-list--action">
              <el-button type="text" @click="setScrrenCutTemplate">设置</el-button>
              <span v-if="template.screencutTemplate" class="info-list--seperator">|</span>
              <el-button v-if="template.screencutTemplate" type="text">解绑</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <SetRecordTemplate v-if="setRecordTemplateDialog" @on-close="closeSetRecordTemplateDialog" />
    <SetScreenCutTemplate
      v-if="setScreenCutTemplateDialog"
      @on-close="closeSetScrrenCutTemplateDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SetRecordTemplate from '../dialogs/setRecordTemplate.vue'
import SetScreenCutTemplate from '../dialogs/setScreenCutTemplate.vue'

@Component({
  name: 'BusinessGroupConfig',
  components: {
    SetRecordTemplate,
    SetScreenCutTemplate
  }
})
export default class extends Vue {
  private activeName = 'info'
  private edit = false
  private regionList = ['全局', '华东', '华南', '华北']
  private outProtocolList = ['rtmp', 'hls', 'flv', 'webrtc']
  private form = {
    groupId: '123',
    outProtocol: ['flv', 'hls']
  }
  private formBackUp = {
    groupId: '123',
    outProtocol: ['flv', 'hls']
  }
  private template = {
    screencutTemplate: '123'
  }
  private setRecordTemplateDialog = false
  private setScreenCutTemplateDialog = false
  private back() {
    this.$emit('back-to-list')
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
.info-list {
  &--value {
    min-width: 100px;
  }
  &--seperator {
    display: inline-block;
    width: 20px;
    text-align: center;
    color: $textGrey;
  }
}
</style>
