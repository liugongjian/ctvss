<template>
  <div class="detail__section">
    <div class="detail__title">
      资源包
      <div class="detail__buttons">
        <el-button
          v-if="checkPermission(['ivs:UpdateDevice'], deviceActions)"
          type="text"
          @click="openResourceDialog(ResourceTypeEnum.Video)"
        >
          配置
        </el-button>
      </div>
    </div>
    <el-card v-if="resources.VSS_VIDEO">
      <template slot="header">
        视频包
        <el-button
          v-if="checkPermission(['ivs:UpdateDevice'], deviceActions)"
          type="text"
          @click="openResourceDialog(ResourceTypeEnum.Video)"
        >
          配置视频包
        </el-button>
      </template>
      <el-descriptions :column="2">
        <el-descriptions-item label="码率">
          {{
            resources.VSS_VIDEO.codeRate
              ? `${resources.VSS_VIDEO.codeRate}Mbps`
              : ''
          }}
        </el-descriptions-item>
        <el-descriptions-item label="存储周期">
          {{
            resources.VSS_VIDEO.storageTime
              ? `${resources.VSS_VIDEO.storageTime}天`
              : ''
          }}
        </el-descriptions-item>
        <el-descriptions-item label="到期时间">
          {{ resources.VSS_VIDEO.expTime }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card v-if="resources.VSS_AI" v-loading="loading.AITable">
      <template slot="header">
        AI包
        <el-button
          v-if="checkPermission(['ivs:UpdateDevice'], deviceActions)"
          type="text"
          @click="openResourceDialog(ResourceTypeEnum.AI)"
        >
          配置AI包
        </el-button>
      </template>
      <el-descriptions :column="2">
        <el-descriptions-item label="分析类型">
          {{ ResourceAiType[resources.VSS_AI.aiType] }}
        </el-descriptions-item>
        <el-descriptions-item label="到期时间">
          {{ resources.VSS_AI.expTime }}
        </el-descriptions-item>
        <el-descriptions-item
          content-class-name="detail__table-row"
          label="AI应用"
        >
          <el-table :data="appList" empty-text="当前设备暂未绑定AI应用">
            <el-table-column label="应用名称" min-width="100" prop="name" />
            <el-table-column label="算法类型" min-width="100">
              <template slot-scope="scope">
                {{
                  scope.row.algorithm.name
                }}
              </template>
            </el-table-column>
            <el-table-column v-if="!isNvr" prop="appEnabled" label="状态">
              <template slot-scope="scope">
                <status-badge
                  :status="parseInt(scope.row.status) ? 'on' : 'off'"
                />
                <span>
                  {{ parseInt(scope.row.status) ? '启用' : '停用' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="!isNvr && checkPermission(['ivs:UpdateDevice'], deviceActions)"
              label="操作"
              min-width="200"
            >
              <template slot-scope="scope">
                <el-tooltip
                  v-if="checkAlgoConfigVisable(scope.row.algorithm.code)"
                  class="item"
                  effect="dark"
                  content="设备离线时不可配置算法"
                  placement="top-start"
                  :disabled="videoInfo.deviceStatus.isOnline === StatusEnum.On"
                >
                  <div class="disable-btn-box">
                    <el-button
                      type="text"
                      :disabled="videoInfo.deviceStatus.isOnline !== StatusEnum.On"
                      @click="openCanvasDialog(scope.row)"
                    >
                      算法配置
                    </el-button>
                  </div>
                </el-tooltip>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="应用启用时不可解绑"
                  placement="top-start"
                  :disabled="scope.row.status === '0'"
                >
                  <div class="disable-btn-box">
                    <el-button
                      type="text"
                      :disabled="scope.row.status === '1'"
                      @click="changeBindStatus(scope.row)"
                    >
                      解除绑定
                    </el-button>
                  </div>
                </el-tooltip>
                <el-button
                  type="text"
                  @click="changeRunningStatus(scope.row)"
                >
                  {{ parseInt(scope.row.status) ? '停用' : '启用' }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column
              v-if="isNvr && checkPermission(['ivs:UpdateDevice'], deviceActions)"
              label="操作"
              min-width="200"
            >
              <template slot-scope="scope">
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="应用启用时不可解绑"
                  placement="top-start"
                  :disabled="scope.row.status === '0'"
                >
                  <div class="disable-btn-box">
                    <el-button
                      type="text"
                      :disabled="scope.row.status === '1'"
                      @click="changeBindStatus(scope.row)"
                    >
                      解除绑定
                    </el-button>
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
        <el-button
          v-if="checkPermission(['ivs:UpdateDevice'], deviceActions)"
          v-permission="['*']"
          type="text"
          @click="openResourceDialog(ResourceTypeEnum.Upload)"
        >
          配置带宽包
        </el-button>
      </template>
      <el-descriptions :column="2">
        <el-descriptions-item label="码率">
          {{
            resources.VSS_UPLOAD_BW.codeRate
              ? `${resources.VSS_UPLOAD_BW.codeRate}Mbps`
              : ''
          }}
        </el-descriptions-item>
        <el-descriptions-item label="上行带宽总量">
          {{ resources.VSS_UPLOAD_BW.bwDeviceCountRate }}
        </el-descriptions-item>
        <el-descriptions-item label="到期时间">
          {{ resources.VSS_UPLOAD_BW.expTime }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- canvas画线 -->
    <algo-config
      v-if="canvasDialog"
      :device-id="deviceId"
      :canvas-if="canvasDialog"
      :config-algo-info="configAlgoInfo"
      :frame-image="frameImage"
    />

    <resource-edit
      v-if="showResourceDialog"
      :device="device"
      :default-resource-tab-type="defaultResourceTabType"
      @on-close="closeResourceDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator'
import { ResourceAiType } from '@vss/device/dicts/resource'
import { unBindAppResource, startAppResource, stopAppResource } from '@vss/device/api/device'
import { getAppList, getAlgoStreamFrameShot } from '@vss/device/api/ai-app'
import { getDeviceResource } from '@vss/device/api/billing'
import ResourceEdit from '@vss/device/components/Resource/Edit.vue'
import { checkPermission } from '@vss/base/utils/permission'
import AlgoConfig from '@vss/device/components/DeviceDetail/DeviceConfig/AlgoConfig/index.vue'
import { ResourceTemplateInfoCodes } from '@vss/ai/dics'
import { ResourceTypeEnum } from '@vss/device/enums/resource'
import { Device, DeviceBasic, VideoDevice } from '@vss/device/type/Device'
import { DeviceTypeEnum, StatusEnum } from '@vss/device/enums'
import { InVideoProtocolModelMapping } from '@vss/device/dicts'

@Component({
  name: 'ResourceTemplateInfo',
  components: {
    AlgoConfig,
    ResourceEdit
  }
})
export default class extends Vue {
  @Inject({ default: () => () => null })
  public getActions!: Function
  private get deviceActions() {
    return this.getActions && this.getActions()
  }
  @Prop() private deviceId: string
  @Prop() private device: Device
  
  private ResourceTypeEnum = ResourceTypeEnum
  private StatusEnum = StatusEnum
  private ResourceAiType = ResourceAiType
  private checkPermission = checkPermission
  // 资源包列表
  private resources: any = {}
  // AI应用列表
  private appList: any = []
  // 是否显示画框弹窗
  private canvasDialog = false
  // 是否显示资源包配置弹窗
  private showResourceDialog = false
  // 默认资源包TAB
  private defaultResourceTabType = ResourceTypeEnum.Video
  // 配置算法信息
  private configAlgoInfo: any = {}
  // 加载状态
  private loading = {
    AITable: false
  }
  // 封面
  private frameImage = null

  // 视频接入协议
  private get inVideoProtocol() {
    return this.device.videos && this.device.videos.length && this.device.videos[0]?.inVideoProtocol
  }

  // 设备基本信息
  private get basicInfo(): DeviceBasic {
    return this.device && this.device.device
  }

  // 视频接入信息
  private get videoInfo(): VideoDevice {
    return this.inVideoProtocol && this.device.videos[0][InVideoProtocolModelMapping[this.inVideoProtocol]]
  }

  // 是否为NVR
  public get isNvr() {
    return this.basicInfo && this.basicInfo.deviceType === DeviceTypeEnum.Nvr
  }

  private async mounted() {
    // 需要设备信息，传给resource组件 弹窗使用
    this.getAIAppList()
    await this.getDeviceResource()
  }

  /**
   * 获取资源包
   */
  private async getDeviceResource() {
    this.loading.AITable = true
    try {
      const resourcesRes = await getDeviceResource({
        deviceId: this.deviceId
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
        obj.bwDeviceCountRate =
          codeRate && bwDeviceCount ? `${codeRate * bwDeviceCount}Mbps` : ''
      }
      this.resources = result
    } catch (e) {
      this.$alertError(e.message)
    } finally {
      this.loading.AITable = false
    }
  }

  /**
   * 获取AI应用列表
   */
  private async getAIAppList() {
    try {
      this.loading.AITable = true
      const algoListResult = await getAppList({ deviceId: this.deviceId, pageSize: 9999 })
      this.appList = algoListResult.aiApps
    } catch (e) {
      this.$alertError(e.message)
      this.appList = []
    } finally {
      this.loading.AITable = false
    }
  }

  /**
   * 启用/停用AI应用
   */
  private async changeRunningStatus(rowInfo: any) {
    this.loading.AITable = true
    const status = parseInt(rowInfo.status)
    const param = {
      inProtocol: this.inVideoProtocol,
      deviceId: this.deviceId,
      appIds: [rowInfo.id]
    }
    // startAppResource
    if (status) {
      stopAppResource(param)
        .then(() => {
          this.loading.AITable = false
          this.$message.success(`停用 ${rowInfo.name} 成功！`)
          this.getAIAppList()
        })
        .catch((e) => {
          this.loading.AITable = false
          this.$message.error(
            `停用 ${rowInfo.name} 失败，原因：${e && e.message}`
          )
        })
    } else {
      startAppResource(param)
        .then(() => {
          this.loading.AITable = false
          this.$message.success(`启用 ${rowInfo.name} 成功！`)
          this.getAIAppList()
        })
        .catch((e) => {
          this.loading.AITable = false
          this.$message.error(
            `启用 ${rowInfo.name} 失败，原因：${e && e.message}`
          )
        })
    }
  }

  /**
   * 解绑AI应用
   */
  private changeBindStatus(rowInfo: any) {
    this.loading.AITable = true
    const param = {
      deviceId: this.deviceId,
      appId: [rowInfo.id]
    }

    unBindAppResource(param)
      .then(() => {
        this.loading.AITable = false
        this.$message.success(`解除 ${rowInfo.name} 绑定成功！`)
        this.getAIAppList()
      })
      .catch((e) => {
        this.loading.AITable = false
        this.$message.error(
          `解除 ${rowInfo.name} 绑定失败，原因：${e && e.message}`
        )
      })
  }

  /**
   * 打开资源包配置弹窗
   */
  private openResourceDialog(resourceType: ResourceTypeEnum) {
    this.defaultResourceTabType = resourceType
    this.showResourceDialog = true
  }

  /**
   * 关闭资源包配置弹窗
   */
  private closeResourceDialog(isRefresh: boolean) {
    this.showResourceDialog = false
    if (isRefresh) {
      this.getDeviceResource()
      this.getAIAppList()
    }
  }

  /**
   * 打开画框弹窗
   */
  private openCanvasDialog(rowInfo: any) {
    const param = {
      frames: [
        {
          stream: this.deviceId,
          inProtocol: this.inVideoProtocol
        }
      ]
    }
    getAlgoStreamFrameShot(param)
      .then((res) => {
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
      })
      .catch((e) => {
        this.$alertError(e.message)
      })
  }
  
  /**
   * 关闭画框弹窗
   */
  private closeCanvasDialog() {
    this.canvasDialog = false
    this.getDeviceResource()
  }

  /**
   * 判断是否显示算法配置按钮
   */
  private checkAlgoConfigVisable(rowCode: any) {
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
    return ResourceTemplateInfoCodes.includes(rowCode)
  }
}
</script>
