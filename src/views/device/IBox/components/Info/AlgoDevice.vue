<template>
  <div class="app-container">
    <el-alert
      v-if="isDevice"
      title="勾选设备后会弹出分析配置窗口，您可以绘制指定的分析区域"
      type="warning"
      show-icon
    />
    <span class="title">选择设备:</span>
    <el-radio-group v-model="isDevice">
      <el-radio :label="true">完成后立即启用分析</el-radio>
      <el-radio :label="false">暂不选择分析设备</el-radio>
    </el-radio-group>
    <el-tree
      v-if="isDevice"
      ref="deviceTree"
      v-loading="treeLoading"
      :load="loadDirs"
      node-key="deviceId"
      show-checkbox
      :data="iboxDevice"
      :props="treeProp"
      lazy
      @check-change="checkCallback"
    >
      <span
        slot-scope="{node, data}"
        class="custom-tree-node"
        :class="{online: data.deviceStatus === 'on'}"
      >
        <span class="node-name">
          <status-badge v-if="data.deviceType==='ipc'" :status="data.streamStatus" />
          <svg-icon
            :name="data.deviceType || 'ipc'"
            width="15"
            height="15"
            :class="data.deviceStatus + 'line'"
          />
          {{ node.data.deviceName }}
        </span>
        <span v-if="!!data.meta && node.checked" style="margin-left: 12px;">
          <el-button type="text" size="mini" @click="() => editMeta(data)">
            <!-- <svg-icon name="clipboard" width="15" height="15" /> -->
            <i class="el-icon-edit-outline" />
          </el-button>
        </span>
      </span>
    </el-tree>
    <div class="btns">
      <el-button @click="changeStepPrev">上一步</el-button>
      <el-button type="primary" @click="onSubmit">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </div>
    <algo-config
      v-if="canvasDialog"
      :device-id="deviceId"
      :canvas-if="canvasDialog"
      :config-algo-info="configAlgoInfo"
      :frame-image="frameImage"
      :frame-loading="frameLoading"
      :meta="meta"
      @add-meta="addMeta"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Inject } from 'vue-property-decorator'
import AppMixin from '@/views/AI/mixin/app-mixin' // 考虑优化的mixin
import AlgoConfig from './AlgoConfig/index.vue'
import { getDeviceList } from '@/api/ibox'
import AlgoMixin from '@/views/device/IBox/mixin/algoMixin'
import StatusBadge from '@/components/StatusBadge/index.vue'

// @ts-ignore
@Component({
  name: 'AlgoDevice',
  components: {
    AlgoConfig,
    StatusBadge
  }
})
export default class extends Mixins(AppMixin, AlgoMixin) {
  @Inject('appInfo')
  public appInfo!: any

  @Prop() private step!: number
  @Prop() private prod!: any
  private iboxDevice = []
  private isDevice: boolean = true
  private canvasDialog: boolean = false
  private treeProp = {
    label: 'deviceName',
    // children: 'deviceChannels',
    isLeaf: 'isLeaf' // 需要手动设置数据源的isLeaf属性，懒加载就不展示 可展开箭头
  }

  private frameLoading = ''

  private treeLoading = false

  private nodeChecked: boolean = false

  private initialCheckedNodes = []

  private configAlgoInfo = { }
  private dangerZone = null

  private async mounted() {
    await this.loadIboxDevice()
    if (this.appInfo) {
      this.getinitialCheckedNodes()
    }
    this.initialCheckedNodes.forEach((node) => {
      const deviceTree: any = this.$refs.deviceTree
      this.addMeta(node)
      deviceTree.setChecked(node.deviceId, true)
    })
    this.configAlgoInfo = this.prod
  }

  private getinitialCheckedNodes() {
    const app = this.appInfo()
    const deviceIds = JSON.parse(app.deviceIds)
    const detectZones = JSON.parse(app.detectZones)
    const nodes = []
    for (let i = 0; i < deviceIds.length; i++) {
      const detectZone = JSON.parse(detectZones[i])
      nodes.push({
        deviceId: deviceIds[i] + '',
        algorithmMetadata: JSON.stringify({
          DangerZone: detectZone.map((zone) => zone + '')
        })
      })
    }
    this.initialCheckedNodes = nodes
  }

  // 获取NVR下设备目录——只有nvr设备有子节点
  public async loadDirs(node: any, resolve: any) {
    const { data } = node
    if (data.deviceType === 'nvr') {
      const iboxNvr = data.deviceChannels.map((item: any) => ({
        ...item,
        deviceType: 'ipc',
        label: item.deviceName,
        id: item.deviceId,
        meta: null,
        isLeaf: true,
        deviceStatus:
            node.data?.deviceStatus || 'off',
        streamStatus:
            item.streams[0]?.streamStatus || 'off'
      }))
      return resolve(iboxNvr)
    }
    return resolve([])
  }

  public async loadIboxDevice() {
    const param = {
      ParentDeviceId: this.$route.query.deviceId,
      pageNum: 1,
      pageSize: 9999
    }

    try {
      const data: any = await getDeviceList(param)
      this.iboxDevice = data.devices.map((device) => {
        const inProtocal = device.videos[0]?.inVideoProtocol
        if (device.device.deviceType === 'nvr') {
          return {
            ...device.device,
            isLeaf: false,
            disabled: true,
            meta: null,
            deviceStatus:
              device.videos[0][inProtocal + 'Device']?.deviceStatus?.isOnline || 'off'
          }
        }
        return {
          ...device.device,
          meta: null,
          isLeaf: true,
          deviceStatus:
            device.videos[0][inProtocal + 'Device']?.deviceStatus?.isOnline || 'off',
          streamStatus:
            device.videos[0][inProtocal + 'Device']?.streams[0]?.streamStatus || 'off'
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  private checkTreeNodes() {}

  private changeStepPrev() {
    this.$emit('update:step', this.step - 1)
  }

  private async checkCallback(data, isChecked) {
    if (isChecked) { // 未勾选时，勾选操作
      const { streamStatus, deviceStatus } = data
      if (streamStatus === 'off' || deviceStatus === 'off') {
        this.$message.warning('当前设备流不在线，无法进行算法配置，您可在流上线后再进行配置')
        this.setNodeOppositeChecked(data.deviceId)
        return
      }
    }
    if (isChecked && !data.meta) {
      try {
        this.deviceId = data.deviceId
        this.meta = null
        this.nodeChecked = !isChecked
        await this.initFrameAndDialog(data.deviceId)
        this.frameLoading = 'correct'
      } catch (e) {
        this.frameImage = null
        this.setNodeOppositeChecked(data.deviceId)
        this.$message.warning('设备或流不在线')
        this.frameLoading = 'error'
      } finally {
        this.$forceUpdate()
      }
    }
    if (!isChecked) {
      this.closeCanvasDialog() // 取消勾选，复位参数
    }
  }

  private async initFrameAndDialog(deviceId) {
    this.canvasDialog = true
    await this.initFrame(false, deviceId)
  }

  private onSubmit() {
    let param: any = {
      deviceIds: [],
      detectZones: []
    }
    if (this.isDevice) {
      const deviceTree: any = this.$refs.deviceTree
      const nodes = deviceTree.getCheckedNodes(true, false)

      nodes.forEach((node) => {
        const algorithmMetadata = JSON.parse(node.meta.algorithmMetadata)
        const dangerZone = algorithmMetadata.DangerZone.map((zone) => +zone)
        param.deviceIds.push(node.meta.deviceId)
        param.detectZones.push(dangerZone)
      })
    }
    param = {
      deviceIds: JSON.stringify(param.deviceIds),
      detectZones: JSON.stringify(param.detectZones)
    }
    this.$emit('submit', param)
  }

  private addMeta(meta) {
    const deviceTree: any = this.$refs.deviceTree
    const algoMeta = JSON.parse(meta.algorithmMetadata)
    const node = deviceTree.getNode(meta.deviceId)

    if (algoMeta.DangerZone.length > 0) {
      this.$set(node.data, 'meta', meta)
    } else {
      this.$set(node.data, 'meta', null)
      deviceTree.setChecked(node.data, false)
    }
  }

  private async editMeta(data) {
    this.meta = data.meta
    this.nodeChecked = true
    try {
      await this.initFrameAndDialog(data.deviceId)
      this.frameLoading = 'correct'
    } catch (e) {
      this.frameImage = null
      this.setNodeOppositeChecked(data.deviceId)
      this.$message.warning('设备或流不在线')
      this.frameLoading = 'error'
    } finally {
      this.$forceUpdate()
    }
  }

  public closeCanvasDialog() {
    this.canvasDialog = false
    this.frameLoading = ''
    this.frameImage = null
    this.meta = null
    this.deviceId = null
  }

  private setNodeOppositeChecked(deviceId) {
    const deviceTree: any = this.$refs.deviceTree
    const node = deviceTree.getNode(deviceId)
    deviceTree.setChecked(node.data, this.nodeChecked)
  }

  private back() {
    this.backToAppList()
  }
}
</script>
<style lang="scss" scoped>
.el-alert {
  margin-bottom: 20px;
}

.title {
  margin-right: 25px;
}

.el-tree {
  border: 1px solid #bbb;
  border-radius: 5px;
  margin-top: 40px;
  margin-left: 85px;
  padding: 10px 0;
  width: 40%;
  min-height: 550px;

  .online .node-name {
    .svg-icon {
      color: #65c465;
    }
  }

  ::v-deep .is-disabled {
    visibility: hidden;
  }
}

.offline {
  color: #6e7c89;
}

.btns {
  margin-top: 40px;
}

.node-name {
  position: relative;

  .status-badge {
    position: absolute;
    top: -1px;
    left: -3px;
    width: 6px;
    height: 6px;
    opacity: 0.7;
  }

  .el-icon-edit-outline {
    width: 15px;
    height: 15px;
  }
}
</style>
