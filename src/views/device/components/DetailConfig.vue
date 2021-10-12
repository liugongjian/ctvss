<template>
  <div>
    <!--资源包-->
    <div class="detail__section">
      <div class="detail__title">
        资源包
        <el-link @click="setRecordTemplate">配置</el-link>
      </div>
      <el-card>
        <template slot="header">
          视频包
          <el-link @click="setRecordTemplate">配置视频包</el-link>
        </template>
        <el-descriptions :column="2">
          <el-descriptions-item label="码率">
            1Mbps
          </el-descriptions-item>
          <el-descriptions-item label="存储周期">
            180天
          </el-descriptions-item>
          <el-descriptions-item label="到期时间">
            2022-03-02 12:23:30
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
      <el-card>
        <template slot="header">
          AI包
          <el-link @click="setRecordTemplate">配置AI包</el-link>
        </template>
        <el-descriptions :column="2">
          <el-descriptions-item label="分析类型">
            高算力型
          </el-descriptions-item>
          <el-descriptions-item label="到期时间">
            2022-03-02 12:23:30
          </el-descriptions-item>
          <el-descriptions-item content-class-name="detail__table-row" label="AI应用">
            <el-table :data="algoListData" empty-text="暂无AI应用，请在AI应用管理中创建">
              <el-table-column label="应用名称" min-width="100" prop="name" />
              <el-table-column label="算法类型" min-width="100">
                <template slot-scope="scope">{{ scope.row.algorithm.name }}</template>
              </el-table-column>
              <el-table-column prop="appEnabled" label="状态">
                <template slot-scope="scope">
                  <status-badge :status="parseInt(scope.row.appEnabled) ? 'on' : 'off'" />
                  <span>
                    {{ parseInt(scope.row.appEnabled) ? '启用' : '停用' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="200">
                <el-button type="text" @click="openCanvasDialog">算法配置</el-button>
                <el-button type="text">解除绑定</el-button>
                <el-button type="text">启用</el-button>
              </el-table-column>
            </el-table>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
    <!--录制模版信息-->
    <div v-loading="loading.recordTemplate" class="detail__section">
      <div class="detail__title">
        录制模版信息
        <el-link @click="setRecordTemplate">配置</el-link>
      </div>
      <el-descriptions v-if="template.recordTemplate" :column="2">
        <el-descriptions-item label="模版名称">
          {{ template.recordTemplate.templateName }}
        </el-descriptions-item>
        <el-descriptions-item label="是否启用自动录制">
          {{ template.recordTemplate.recordType === 1 ? '是':'否' }}
        </el-descriptions-item>
        <el-descriptions-item label="录制格式">
          {{ template.recordTemplate.flvParam.enable ? 'flv': '' }}
          {{ template.recordTemplate.hlsParam.enable ? 'hls': '' }}
          {{ template.recordTemplate.mpParam.enable ? 'mp4': '' }}
        </el-descriptions-item>
      </el-descriptions>
      <div v-else-if="!loading.recordTemplate" class="detail__empty-card">
        暂未绑定录制模版
      </div>
    </div>
    <!--回调模版信息-->
    <div v-loading="loading.callbackTemplate" class="detail__section">
      <div class="detail__title">
        回调模版信息
        <el-link @click="setCallbackTemplate">配置</el-link>
      </div>
      <el-descriptions v-if="template.callbackTemplate" :column="2">
        <el-descriptions-item label="模版名称">
          {{ template.callbackTemplate.templateName }}
        </el-descriptions-item>
        <el-descriptions-item label="回调URL">
          {{ template.recordTemplate.recordNotifyUrl }}
        </el-descriptions-item>
        <el-descriptions-item label="回调Key">
          {{ template.recordTemplate.callbackKey }}
        </el-descriptions-item>
      </el-descriptions>
      <div v-else-if="!loading.callbackTemplate" class="detail__empty-card">
        暂未绑定回调模版
      </div>
    </div>

    <!-- canvas画线 -->
    <algo-config v-if="canvasDialog" :device-id="deviceId" :in-protocol="inProtocol" :canvas-if="canvasDialog" />

    <SetRecordTemplate
      v-if="setRecordTemplateDialog"
      :group-id="groupId"
      :device-id="deviceId"
      :in-protocol="inProtocol"
      :template-id="recordTemplateId"
      @on-close="closeSetRecordTemplateDialog"
    />
    <SetCallBackTemplate
      v-if="setCallbackTemplateDialog"
      :in-protocol="inProtocol"
      :device-id="deviceId"
      :group-id="groupId"
      :template-id="callbackTemplateId"
      @on-close="closeCallbackTemplateDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ResourceAiType } from '@/dics'
import { GroupModule } from '@/store/modules/group'
import { getDeviceRecordTemplate, getDeviceCallbackTemplate } from '@/api/device'
import { getAppList } from '@/api/ai-app'
import SetRecordTemplate from '@/views/components/dialogs/SetRecordTemplate.vue'
import SetCallBackTemplate from '@/views/components/dialogs/SetCallBackTemplate.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import AlgoConfig from './AlgoConfig/index.vue'

@Component({
  name: 'DeviceConfig',
  components: {
    SetRecordTemplate,
    SetCallBackTemplate,
    AlgoConfig,
    StatusBadge
  }
})
export default class extends Vue {
  @Prop() private deviceId?: String
  @Prop() private inProtocol?: String

  private resourceAiType = ResourceAiType

  private loading = {
    recordTemplate: false,
    callbackTemplate: false,
    aiTemplate: false
  }

  private template: any = {
    recordTemplate: null,
    callbackTemplate: null,
    aiTemplate: null
  }

  private setRecordTemplateDialog = false
  private setCallbackTemplateDialog = false
  private recordTemplateId = ''
  private callbackTemplateId = ''

  private aiList = [
    {
      appName: '人员布控',
      aiType: 'AI-100'
    }
  ]

  private algoListData:any = [{
    appName: '人员布控',
    aiType: 'AI-100'
  }]

  private canvasDialog = false;

  private openCanvasDialog() {
    this.canvasDialog = true
  }
  private closeCanvasDialog() {
    this.canvasDialog = false
  }

  public get groupId() {
    return GroupModule.group?.groupId
  }

  private async mounted() {
    this.getCallbackTemplate()
    this.getRecordTemplate()
    this.getAlgoList()
  }

  /**
   * 获取录制模版
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
   * 获取回调模版
   */
  private async getCallbackTemplate() {
    try {
      this.loading.callbackTemplate = true
      this.template.callbackTemplate = null
      const res = await getDeviceCallbackTemplate({ deviceId: this.deviceId, inProtocol: this.inProtocol })
      this.template.callbackTemplate = res
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.callbackTemplate = false
    }
  }

  /**
   * 设置录制模版
   */
  private setRecordTemplate() {
    this.setRecordTemplateDialog = true
    this.recordTemplateId = this.template.recordTemplate.templateId
  }

  /**
   * 设置回调模版
   */
  private setCallbackTemplate() {
    this.setCallbackTemplateDialog = true
    this.callbackTemplateId = this.template.callbackTemplate.templateId
  }

  /**
   * 关闭设置录制模版
   */
  private closeSetRecordTemplateDialog() {
    this.setRecordTemplateDialog = false
    this.getRecordTemplate()
  }

  /**
   * 关闭设置回调模版
   */
  private closeCallbackTemplateDialog() {
    this.setCallbackTemplateDialog = false
    this.getCallbackTemplate()
  }

  // 获取算法能力
  private async getAlgoList() {
    try {
      this.loading.recordTemplate = true
      const algoListResult = await getAppList({ deviceId: this.deviceId })
      this.algoListData = algoListResult.aiApps
      console.log('algoListResult.aiApps--->', algoListResult.aiApps)
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.recordTemplate = false
    }
  }
}
</script>
<style lang="scss" scoped>
  .detail-wrap .detail__section {
    ::v-deep .el-descriptions-item__label {
      min-width: 100px;
    }
    ::v-deep .el-table {
      border: 1px solid $borderGrey;
    }
    ::v-deep .detail__table-row {
      padding-right: 15px;
      flex: 1;
    }
  }
</style>
