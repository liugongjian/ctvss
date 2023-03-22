<template>
  <div>
    <!--资源包-->
    <div v-if="!disableResourceTab" class="detail__section">
      <div class="detail__title">
        资源包
        <el-link v-if="!isVGroup && checkPermission(['ivs:UpdateDevice'], actions)" @click="changeResourceDialog">配置</el-link>
      </div>
      <el-card v-if="resources.VSS_VIDEO">
        <template slot="header">
          视频包
          <el-link v-if="!isVGroup && checkPermission(['ivs:UpdateDevice'], actions)" @click="changeResourceDialog">配置视频包</el-link>
        </template>
        <el-descriptions :column="2">
          <el-descriptions-item label="码率">
            {{ resources.VSS_VIDEO.codeRate ? `${resources.VSS_VIDEO.codeRate}Mbps` : '' }}
          </el-descriptions-item>
          <el-descriptions-item label="存储周期">
            {{ resources.VSS_VIDEO.storageTime ? `${resources.VSS_VIDEO.storageTime}天` : '' }}
          </el-descriptions-item>
          <el-descriptions-item label="到期时间">
            {{ resources.VSS_VIDEO.expTime }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
      <el-card v-if="resources.VSS_AI" v-loading="loading.AITable">
        <template slot="header">
          AI包
          <el-link v-if="!isVGroup && checkPermission(['ivs:UpdateDevice'], actions)" @click="changeResourceDialog('AI')">配置AI包</el-link>
        </template>
        <el-descriptions :column="2">
          <el-descriptions-item label="分析类型">
            {{ resourceAiType[resources.VSS_AI.aiType] }}
          </el-descriptions-item>
          <el-descriptions-item label="到期时间">
            {{ resources.VSS_AI.expTime }}
          </el-descriptions-item>
          <el-descriptions-item content-class-name="detail__table-row" label="AI应用">
            <el-table :data="algoListData" empty-text="当前设备暂未绑定AI应用">
              <el-table-column label="应用名称" min-width="100" prop="name" />
              <el-table-column label="算法类型" min-width="100">
                <template slot-scope="scope">{{ scope.row.algorithm.name }}</template>
              </el-table-column>
              <el-table-column v-if="!isNvr" prop="appEnabled" label="状态">
                <template slot-scope="scope">
                  <status-badge :status="parseInt(scope.row.status) ? 'on' : 'off'" />
                  <span>
                    {{ parseInt(scope.row.status) ? '启用' : '停用' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column v-if=" !isNvr && !isVGroup && checkPermission(['ivs:UpdateDevice'], actions)" label="操作" min-width="200">
                <template slot-scope="scope">
                  <el-tooltip v-if="ifShowAlgoBtn(scope.row.algorithm.code)" class="item" effect="dark" content="设备离线时不可配置算法" placement="top-start" :disabled="deviceInfo.deviceStatus === 'on'">
                    <div class="disable-btn-box">
                      <el-button type="text" :disabled="deviceInfo.deviceStatus !== 'on'" @click="openCanvasDialog(scope.row)">算法配置</el-button>
                    </div>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="应用启用时不可解绑" placement="top-start" :disabled="scope.row.status === '0'">
                    <div class="disable-btn-box">
                      <el-button type="text" :disabled="scope.row.status === '1'" @click="changeBindStatus(scope.row)">解除绑定</el-button>
                    </div>
                  </el-tooltip>
                  <el-button type="text" @click="changeRunningStatus(scope.row)">{{ parseInt(scope.row.status) ? '停用' : '启用' }}</el-button>
                </template>
              </el-table-column>
              <el-table-column v-if=" isNvr && !isVGroup && checkPermission(['ivs:UpdateDevice'], actions)" label="操作" min-width="200">
                <template slot-scope="scope">
                  <el-tooltip class="item" effect="dark" content="应用启用时不可解绑" placement="top-start" :disabled="scope.row.status === '0'">
                    <div class="disable-btn-box">
                      <el-button type="text" :disabled="scope.row.status === '1'" @click="changeBindStatus(scope.row)">解除绑定</el-button>
                    </div>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
      <el-card v-if="resources.VSS_UPLOAD_BW">
        <template slot="header">
          带宽包
          <el-link v-if="!isVGroup && checkPermission(['ivs:UpdateDevice'], actions)" @click="changeResourceDialog">配置带宽包</el-link>
        </template>
        <el-descriptions :column="2">
          <el-descriptions-item label="码率">
            {{ resources.VSS_UPLOAD_BW.codeRate ? `${resources.VSS_UPLOAD_BW.codeRate}Mbps` : '' }}
          </el-descriptions-item>
          <el-descriptions-item label="上行带宽总量">
            {{ resources.VSS_UPLOAD_BW.bwDeviceCountRate }}
          </el-descriptions-item>
          <el-descriptions-item label="到期时间">
            {{ resources.VSS_UPLOAD_BW.expTime }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
    <!--录制模板信息-->
    <div v-if="!disableRecordTemplate" v-loading="loading.recordTemplate" class="detail__section">
      <div class="detail__title">
        录制模板信息
        <el-link v-if="!isVGroup && checkPermission(['ivs:UpdateDevice'], actions)" @click="setRecordTemplate">配置</el-link>
      </div>
      <el-descriptions v-if="template.recordTemplate" :column="2">
        <el-descriptions-item label="模板名称">
          {{ template.recordTemplate.templateName }}
        </el-descriptions-item>
        <el-descriptions-item label="是否启用全天录制">
          {{ template.recordTemplate.recordType === 1 ? '是':'否' }}
        </el-descriptions-item>
        <!-- <el-descriptions-item label="录制格式">
          {{ template.recordTemplate.flvParam && template.recordTemplate.flvParam.enable ? 'flv': '' }}
          {{ template.recordTemplate.hlsParam && template.recordTemplate.hlsParam.enable ? 'hls': '' }}
          {{ template.recordTemplate.hlsParam && template.recordTemplate.hlsParam.enable ? 'mp4': '' }}
        </el-descriptions-item> -->
      </el-descriptions>
      <div v-else-if="!loading.recordTemplate" class="detail__empty-card">
        暂未绑定录制模板
      </div>
    </div>
    <!--回调模板信息-->
    <div v-loading="loading.callbackTemplate" class="detail__section">
      <div class="detail__title">
        回调模板信息
        <el-link v-if="!isVGroup && checkPermission(['ivs:UpdateDevice'], actions)" @click="setCallbackTemplate">配置</el-link>
      </div>
      <el-descriptions v-if="template.callbackTemplate" :column="2">
        <el-descriptions-item label="模板名称">
          {{ template.callbackTemplate.templateName }}
        </el-descriptions-item>
        <el-descriptions-item v-if="template.callbackTemplate.recordNotifyUrl" label="录制回调URL">
          {{ template.callbackTemplate.recordNotifyUrl }}
        </el-descriptions-item>
        <el-descriptions-item v-if="template.callbackTemplate.deviceStatusUrl" label="设备状态回调URL">
          {{ template.callbackTemplate.deviceStatusUrl }}
        </el-descriptions-item>
        <el-descriptions-item v-if="template.callbackTemplate.streamStatusUrl" label="流状态回调URL">
          {{ template.callbackTemplate.streamStatusUrl }}
        </el-descriptions-item>
        <el-descriptions-item v-if="template.callbackTemplate.aiEventNotifyUrl" label="AI事件通知回调URL">
          {{ template.callbackTemplate.aiEventNotifyUrl }}
        </el-descriptions-item>
        <el-descriptions-item label="回调Key">
          {{ template.callbackTemplate.callbackKey }}
        </el-descriptions-item>
      </el-descriptions>
      <div v-else-if="!loading.recordTemplate" class="detail__empty-card">
        暂未绑定回调模板
      </div>
    </div>
    <!-- 告警模板信息 -->
    <div v-if="inProtocol === 'gb28181'" class="detail__section">
      <div class="detail__title">
        告警模板信息
        <el-link v-if="!isVGroup && checkPermission(['ivs:UpdateDevice'], actions)" @click="setAlertTemplate">配置</el-link>
      </div>
      <el-descriptions v-if="template.alertTemplate" :column="2">
        <el-descriptions-item label="模板名称">
          {{ template.alertTemplate.templateName }}
        </el-descriptions-item>
        <el-descriptions-item label="模板概要">
          {{ template.alertTemplate.recordNotifyUrl }}
        </el-descriptions-item>
        <el-descriptions-item label="启动方式">
          {{ template.alertTemplate.enableType === 1 ? '自动开启' : '手动开启' }}
        </el-descriptions-item>
      </el-descriptions>
      <div v-else-if="!loading.alertTemplate" class="detail__empty-card">
        暂未绑定告警模板
      </div>
    </div>

    <!-- canvas画线 -->
    <algo-config
      v-if="canvasDialog" :device-id="deviceId"
      :in-protocol="inProtocol" :canvas-if="canvasDialog"
      :config-algo-info="configAlgoInfo"
      :device-info="deviceInfo"
      :frame-image="frameImage"
    />

    <SetRecordTemplate
      v-if="setRecordTemplateDialog"
      :device-id="deviceId"
      :in-protocol="inProtocol"
      :template-id="recordTemplateId"
      @on-close="closeSetRecordTemplateDialog"
    />
    <SetCallBackTemplate
      v-if="setCallbackTemplateDialog"
      :in-protocol="inProtocol"
      :device-id="deviceId"
      :template-id="callbackTemplateId"
      @on-close="closeCallbackTemplateDialog"
    />

    <SetAlertTemplate
      v-if="setAlertTemplateDialog"
      :in-protocol="inProtocol"
      :device-id="deviceId"
      :template-id="alertTemplateId"
      @on-close="closeAlertTemplateDialog"
    />

    <resource v-if="showResourceDialog" :device="deviceInfo" :algo-tab-type-default="algoTabTypeDefault" @on-close="closeResourceDialog" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ResourceAiType } from '@/dics'
import { GroupModule } from '@/store/modules/group'
import { getDeviceRecordTemplate, getDeviceCallbackTemplate, getDevice,
  unBindAppResource, startAppResource, stopAppResource } from '@/api/device'
import { getAlertBind } from '@/api/template'
import { getAppList, getAlgoStreamFrameShot } from '@/api/ai-app'
import { getDeviceResources } from '@/api/billing'
import SetRecordTemplate from '@/views/components/dialogs/SetRecordTemplate.vue'
import SetCallBackTemplate from '@/views/components/dialogs/SetCallBackTemplate.vue'
import SetAlertTemplate from '@/views/components/dialogs/SetAlertTemplate.vue'
import Resource from '@/views/device/components/dialogs/Resource.vue'
import { checkPermission } from '@/utils/permission'
import { UserModule } from '@/store/modules/user'
import StatusBadge from '@/components/StatusBadge/index.vue'
import AlgoConfig from './AlgoConfig/index.vue'

@Component({
  name: 'DeviceConfig',
  components: {
    SetRecordTemplate,
    SetCallBackTemplate,
    SetAlertTemplate,
    AlgoConfig,
    StatusBadge,
    Resource
  }
})
export default class extends Vue {
  @Prop() private deviceId?: String
  @Prop() private inProtocol?: String
  @Prop() private deviceType?: string
  @Prop()
  private actions: object
  private checkPermission = checkPermission

  private resourceAiType = ResourceAiType

  private loading = {
    recordTemplate: false,
    callbackTemplate: false,
    aiTemplate: false,
    AITable: false,
    alertTemplate: false
  }

  private template: any = {
    recordTemplate: {},
    callbackTemplate: {},
    aiTemplate: {}
  }

  private setRecordTemplateDialog = false
  private setCallbackTemplateDialog = false
  private setAlertTemplateDialog = false
  private recordTemplateId = ''
  private callbackTemplateId = ''
  private alertTemplateId = ''

  private aiList = [
    {
      appName: '人员布控',
      aiType: 'AI-100'
    }
  ]

  private algoListData: any = []

  private canvasDialog = false

  private showResourceDialog = false

  private algoTabTypeDefault = ''

  private resources: any = {}

  private configAlgoInfo: any = {}

  private async mounted() {
    // 需要设备信息，传给resource组件 弹窗使用
    if (this.deviceType === 'ipc') {
      this.getRecordTemplate()
    }
    this.getCallbackTemplate()
    this.getAlertTemplate()
    this.getAlgoList()
    await this.getDeviceInfo()
    await this.getDeviceResource()
  }

  private openCanvasDialog(rowInfo: any) {
    const param = {
      frames: [{
        stream: this.deviceId,
        inProtocol: this.inProtocol
      }]
    }
    getAlgoStreamFrameShot(param).then(res => {
      if (res) {
        const { frames = [] } = res
        const { frame = '' } = frames[0] || []
        if (!frame) {
          this.$message.warning('暂时获取不到截图，请稍后再试')
        } else {
          this.canvasDialog = true
          this.configAlgoInfo = rowInfo
          this.frameImage = frame
        }
      }
    }).catch(e => {
      this.$message.error(e && e.message)
    })
  }
  private closeCanvasDialog() {
    this.canvasDialog = false
    // this.getAlgoList()
    this.getDeviceInfo()
    this.getDeviceResource()
  }

  public get groupId() {
    return GroupModule.group?.groupId
  }

  public get isVGroup() {
    return this.$route.query.inProtocol === 'vgroup'
  }

  public get ifNvrChannel() {
    return this.deviceInfo.parentDeviceId !== '-1'
  }

  public get isNvr() {
    return this.deviceInfo && this.deviceInfo.deviceType === 'nvr'
  }

  /**
   * 是否禁用资源包配置
   */
  public get disableResourceTab() {
    return UserModule.tags && UserModule.tags.privateUser && UserModule.tags.privateUser === 'liuzhou'
  }

  /**
   * 是否禁用录制模板绑定
   */
  private get disableRecordTemplate() {
    return UserModule.tags && UserModule.tags.privateUser && UserModule.tags.privateUser === 'liuzhou'
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
   * 获取回调模板
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

  private async getAlertTemplate() {
    try {
      this.loading.alertTemplate = true
      this.template.alertTemplate = null
      // if (this.groupId) {
      //   const res = await getAlertBind({ groupId: this.groupId })
      //   this.template.alertTemplate.push(res)
      // } else {
      //   const res = await getAlertBind({ deviceId: this.deviceId, inProtocol: this.inProtocol })
      //   this.template.alertTemplate.push(res)
      // }
      const res = await getAlertBind({ deviceId: this.deviceId, inProtocol: this.inProtocol })
      this.template.alertTemplate = res
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.alertTemplate = false
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
   * 设置回调模板
   */
  private setCallbackTemplate() {
    this.setCallbackTemplateDialog = true
    this.callbackTemplateId = this.template.callbackTemplate ? this.template.callbackTemplate.templateId : null
  }

  // 设置告警模板
  private setAlertTemplate() {
    this.setAlertTemplateDialog = true
    this.alertTemplateId = this.template.alertTemplate ? this.template.alertTemplate.templateId : null
  }

  /**
   * 关闭设置录制模板
   */
  private closeSetRecordTemplateDialog() {
    this.setRecordTemplateDialog = false
    this.getRecordTemplate()
  }

  /**
   * 关闭设置回调模板
   */
  private closeCallbackTemplateDialog() {
    this.setCallbackTemplateDialog = false
    this.getCallbackTemplate()
  }

  // 关闭告警模板
  private closeAlertTemplateDialog() {
    this.setAlertTemplateDialog = false
    this.getAlertTemplate()
  }

  // 获取算法能力
  private async getAlgoList() {
    try {
      this.loading.AITable = true
      const param = {
        deviceId: this.deviceId,
        pageSize: 999
      }
      const algoListResult = await getAppList(param)
      this.algoListData = algoListResult.aiApps
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
      this.algoListData = []
    } finally {
      this.loading.AITable = false
    }
  }

  // 获取设备信息
  private async getDeviceInfo() {
    this.deviceInfo = await getDevice({
      deviceId: this.deviceId,
      inProtocol: this.inProtocol
    })
  }

  // 打开算法配置弹窗
  private changeResourceDialog(kind: String) {
    this.showResourceDialog = true
    if (kind && kind === 'AI') {
      this.algoTabTypeDefault = 'AI'
    }
  }

  // 关闭算法配置弹窗
  private closeResourceDialog() {
    this.showResourceDialog = false
    this.algoTabTypeDefault = ''
    this.getDeviceResource()
    this.getAlgoList()
  }

  // 获取资源包
  private async getDeviceResource() {
    this.loading.AITable = true
    try {
      const resourcesRes = await getDeviceResources({
        deviceId: this.deviceId,
        deviceType: this.deviceInfo.deviceType,
        inProtocol: this.inProtocol
      })
      const result = {}
      // 以resourceType 为key 重组数据，渲染使用
      resourcesRes.resources.forEach((ele: any) => {
        result[ele.resourceType] = ele
      })
      if (result['VSS_UPLOAD_BW']) {
        const obj = result['VSS_UPLOAD_BW']
        const codeRate = parseInt(obj.codeRate, 10)
        const bwDeviceCount = parseInt(obj.bwDeviceCount, 10)
        obj.bwDeviceCountRate = codeRate && bwDeviceCount ? `${codeRate * bwDeviceCount}Mbps` : ''
      }
      this.resources = result
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.AITable = false
    }
  }

  // 启用停用
  private async changeRunningStatus(rowInfo: any) {
    this.loading.AITable = true
    const status = parseInt(rowInfo.status)
    const param = {
      inProtocol: this.inProtocol,
      deviceId: this.deviceId,
      appIds: [rowInfo.id]
    }
    // startAppResource
    if (status) {
      stopAppResource(param).then(() => {
        this.loading.AITable = false
        this.$message.success(`停用 ${rowInfo.name} 成功！`)
        this.getAlgoList()
      }).catch(e => {
        this.loading.AITable = false
        this.$message.error(`停用 ${rowInfo.name} 失败，原因：${e && e.message}`)
      })
    } else {
      startAppResource(param).then(() => {
        this.loading.AITable = false
        this.$message.success(`启用 ${rowInfo.name} 成功！`)
        this.getAlgoList()
      }).catch(e => {
        this.loading.AITable = false
        this.$message.error(`启用 ${rowInfo.name} 失败，原因：${e && e.message}`)
      })
    }
  }

  // 解绑
  private changeBindStatus(rowInfo: any) {
    this.loading.AITable = true
    const param = {
      deviceId: this.deviceId,
      appId: [rowInfo.id],
      deviceType: this.deviceInfo.deviceType,
      inProtocol: this.inProtocol
    }

    unBindAppResource(param).then(() => {
      this.loading.AITable = false
      this.$message.success(`解除 ${rowInfo.name} 绑定成功！`)
      this.getAlgoList()
    }).catch(e => {
      this.loading.AITable = false
      this.$message.error(`解除 ${rowInfo.name} 绑定失败，原因：${e && e.message}`)
    })
  }

  private ifShowAlgoBtn(rowCode: any) {
    /** algorithm.code
     * 危险区域: code 10006
     * 人脸搜索: code 10001
     * 车牌检测: code 10014
     * 棉花检测: code 10015
     * 电瓶车进电梯 code 10020
     * 人车流量统计 code 10032 需要单独增加crossline 画线
     * 垃圾站  code  10026
     * 人员跌倒  code 10028
     *  动物检测 code 10033
     */
    switch (rowCode) {
      case '10006':
      case '10001':
      case '10004':
      case '10014':
      case '10015':
      case '10020':
      case '10024':
      case '10023':
      case '10022':
      case '10021':
      case '10019':
      case '10032':
      case '10026':
      case '10028':
      case '10033':
      case '10035':
      case '10036':
      case '10037':
        return true
      default:
        return false
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

  .disable-btn-box {
    display: inline-block;
    padding: 0 10px;
  }
</style>
