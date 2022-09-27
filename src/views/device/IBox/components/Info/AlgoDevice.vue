<template>
  <div class="app-container">
    <span class="title">选择设备:</span>
    <el-radio-group v-model="isDevice">
      <el-radio :label="true">完成后立即启用分析</el-radio>
      <el-radio :label="false">暂不选择分析设备</el-radio>
    </el-radio-group>
    <el-tree
      v-if="isDevice"
      ref="deviceTree"
      node-key="deviceId"
      show-checkbox
      :data="iboxDevice"
      :props="treeProp"
      @check-change="checkCallback"
      @node-click="handleNodeClick"
    >
      <span
        slot-scope="{node, data}"
        class="custom-tree-node"
        :class="{online: data.deviceStatus === 'on'}"
      >
        <span class="node-name">
          <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
          <svg-icon :name="data.deviceType || 'ipc'" width="15" height="15" />
          {{ node.data.deviceName }}
        </span>
        <span v-if="!!data.meta && node.checked" style="margin-left: 12px;">
          <el-button type="text" size="mini" @click="() => editMeta(data)">
            <svg-icon name="clipboard" width="15" height="15" />
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

// @ts-ignore
@Component({
  name: 'AlgoDevice',
  components: {
    AlgoConfig
  }
})
export default class extends Mixins(AppMixin) {
  @Inject('appInfo')
  public appInfo!: any
  @Prop() private step!: number
  @Prop() private prod!: any
  private iboxDevice = []
  private isDevice: boolean = true
  private canvasDialog: boolean = false
  private treeProp = {
    label: 'deviceName',
    children: 'deviceChannels',
    isLeaf: 'isLeaf' // 需要手动设置数据源的isLeaf属性，懒加载就不展示 可展开箭头
  }

  private nodeChecked: boolean = false

  private initialCheckedNodes = []

  private configAlgoInfo = {
    name: 'test',
    effectiveTime: [{ start_time: '0:0', end_time: '0:0' }],
    algorithm: { code: '10031' },
    id: '1'
  }
  private dangerZone = null
  private frameImage = require('./AlgoConfig/plate4.jpg')

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

  public async loadIboxDevice() {
    const param = {
      ParentDeviceId: this.$route.query.deviceId,
      pageNum: 1,
      pageSize: 9999
    }

    try {
      const data: any = await getDeviceList(param)
      this.iboxDevice = data.devices.map((device) => {
        if (device.device.deviceType === 'nvr') {
          return {
            ...device.device,
            disabled: true,
            meta: null,
            deviceStatus:
              device.videos[0].gb28181Device?.deviceStatus?.isOnline || 'off'
          }
        }
        return {
          ...device.device,
          meta: null,
          deviceStatus:
            device.videos[0].gb28181Device?.deviceStatus?.isOnline || 'off'
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

  private checkCallback(data, isChecked) {
    if (isChecked && !data.meta) {
      this.deviceId = data.deviceId
      this.meta = null
      this.canvasDialog = true
      this.nodeChecked = !isChecked
    }
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

  private handleNodeClick(data, node) {
    console.log('data:', data)
    console.log('node:', node)
  }

  private editMeta(data) {
    this.meta = data.meta
    this.canvasDialog = true
    this.nodeChecked = true
  }

  public closeCanvasDialog() {
    this.canvasDialog = false
    this.meta = null
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

.btns {
  margin-top: 40px;
}
</style>
