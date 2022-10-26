<template>
  <div class="detail__section">
    <div class="detail__title">
      资源包
      <div class="detail__buttons">
        <el-button
          v-if="!isVGroup && checkPermission(['AdminDevice'])"
          type="text"
          @click="changeResourceDialog"
          >配置</el-button
        >
      </div>
    </div>
    <el-card v-if="resources.VSS_VIDEO">
      <template slot="header">
        视频包
        <el-button
          v-if="!isVGroup && checkPermission(['AdminDevice'])"
          type="text"
          @click="changeResourceDialog"
          >配置视频包</el-button
        >
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
          v-if="!isVGroup && checkPermission(['AdminDevice'])"
          type="text"
          @click="changeResourceDialog('AI')"
          >配置AI包</el-button
        >
      </template>
      <el-descriptions :column="2">
        <el-descriptions-item label="分析类型">
          {{ resourceAiType[resources.VSS_AI.aiType] }}
        </el-descriptions-item>
        <el-descriptions-item label="到期时间">
          {{ resources.VSS_AI.expTime }}
        </el-descriptions-item>
        <el-descriptions-item
          content-class-name="detail__table-row"
          label="AI应用"
        >
          <el-table :data="algoListData" empty-text="当前设备暂未绑定AI应用">
            <el-table-column label="应用名称" min-width="100" prop="name" />
            <el-table-column label="算法类型" min-width="100">
              <template slot-scope="scope">{{
                scope.row.algorithm.name
              }}</template>
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
              v-if="!isNvr && !isVGroup && checkPermission(['AdminDevice'])"
              label="操作"
              min-width="200"
            >
              <template slot-scope="scope">
                <el-tooltip
                  v-if="ifShowAlgoBtn(scope.row.algorithm.code)"
                  class="item"
                  effect="dark"
                  content="设备离线时不可配置算法"
                  placement="top-start"
                  :disabled="deviceInfo.deviceStatus === 'on'"
                >
                  <div class="disable-btn-box">
                    <el-button
                      type="text"
                      :disabled="deviceInfo.deviceStatus !== 'on'"
                      @click="openCanvasDialog(scope.row)"
                      >算法配置</el-button
                    >
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
                      >解除绑定</el-button
                    >
                  </div>
                </el-tooltip>
                <el-button
                  type="text"
                  @click="changeRunningStatus(scope.row)"
                  >{{ parseInt(scope.row.status) ? '停用' : '启用' }}</el-button
                >
              </template>
            </el-table-column>
            <el-table-column
              v-if="isNvr && !isVGroup && checkPermission(['AdminDevice'])"
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
                      >解除绑定</el-button
                    >
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
          v-if="!isVGroup && checkPermission(['AdminDevice'])"
          v-permission="['*']"
          type="text"
          @click="changeResourceDialog"
          >配置带宽包</el-button
        >
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
      :in-protocol="inProtocol"
      :canvas-if="canvasDialog"
      :config-algo-info="configAlgoInfo"
      :device-info="deviceInfo"
      :frame-image="frameImage"
    />

    <resource-edit
      v-if="showResourceDialog"
      :device="deviceInfo"
      :algo-tab-type-default="algoTabTypeDefault"
      @on-close="closeResourceDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { ResourceAiType } from '@vss/device/dicts/index'
import {
  getDevice,
  unBindAppResource,
  startAppResource,
  stopAppResource
} from '@vss/device/api/device'
import { getAppList, getAlgoStreamFrameShot } from '@vss/device/api/ai-app'
import { getDeviceResource } from '@vss/device/api/billing'
import ResourceEdit from '@vss/device/components/Resource/Edit.vue'
import { checkPermission } from '@vss/base/utils/permission'
import AlgoConfig from '@vss/device/components/DeviceDetail/DeviceConfig/AlgoConfig/index.vue'
import detailMixin from '@vss/device/mixin/deviceMixin'
import { ResourceTemplateInfoCodes } from '@vss/ai/dics'

@Component({
  name: 'ResourceTemplateInfo',
  components: {
    AlgoConfig,
    ResourceEdit
  }
})
export default class extends Mixins(detailMixin) {
  private inProtocol = 'gb28181'

  private checkPermission = checkPermission

  private resourceAiType = ResourceAiType

  private loading = {
    aiTemplate: false,
    AITable: false
  }

  private algoListData: any = []

  private canvasDialog = false

  private showResourceDialog = false

  private algoTabTypeDefault = ''

  private resources: any = {}

  private configAlgoInfo: any = {}

  private async mounted() {
    // 需要设备信息，传给resource组件 弹窗使用
    this.getAlgoList()
    await this.getDeviceInfo()
    await this.getDeviceResource()
  }

  private openCanvasDialog(rowInfo: any) {
    const param = {
      frames: [
        {
          stream: this.deviceId,
          inProtocol: this.inProtocol
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
        this.$message.error(e && e.message)
      })
  }
  private closeCanvasDialog() {
    this.canvasDialog = false
    // this.getAlgoList()
    this.getDeviceInfo()
    this.getDeviceResource()
  }

  public get isVGroup() {
    return this.$route.query.inProtocol === 'vgroup'
  }

  public get isNvr() {
    return this.deviceInfo && this.deviceInfo.deviceType === 'nvr'
  }

  // 获取算法能力
  private async getAlgoList() {
    try {
      this.loading.AITable = true
      const algoListResult = await getAppList({ deviceId: this.deviceId })
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
      const resourcesRes = await getDeviceResource({
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
        obj.bwDeviceCountRate =
          codeRate && bwDeviceCount ? `${codeRate * bwDeviceCount}Mbps` : ''
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
      stopAppResource(param)
        .then(() => {
          this.loading.AITable = false
          this.$message.success(`停用 ${rowInfo.name} 成功！`)
          this.getAlgoList()
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
          this.getAlgoList()
        })
        .catch((e) => {
          this.loading.AITable = false
          this.$message.error(
            `启用 ${rowInfo.name} 失败，原因：${e && e.message}`
          )
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

    unBindAppResource(param)
      .then(() => {
        this.loading.AITable = false
        this.$message.success(`解除 ${rowInfo.name} 绑定成功！`)
        this.getAlgoList()
      })
      .catch((e) => {
        this.loading.AITable = false
        this.$message.error(
          `解除 ${rowInfo.name} 绑定失败，原因：${e && e.message}`
        )
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
    ResourceTemplateInfoCodes.includes(rowCode)
  }
}
</script>
