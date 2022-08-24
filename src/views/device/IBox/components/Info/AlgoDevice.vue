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
    >
      <span slot-scope="{node, data}" class="custom-tree-node" :class="{'online': data.deviceStatus === 'on'}">
        <span class="node-name">
          <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
          <svg-icon :name="data.deviceType || 'ipc'" width="15" height="15" />
          {{ node.data.deviceName }}
        </span>
        <span v-if="!!data.meta" style="margin-left: 12px;">
          <el-button
            type="text"
            size="mini"
            @click="() => editMeta(data)">
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
import { Component, Mixins, Prop } from 'vue-property-decorator'
import AppMixin from '@/views/AI/mixin/app-mixin' // 考虑优化的mixin
import AlgoConfig from './AlgoConfig/index.vue'


//@ts-ignore
@Component({
  name: 'AlgoDevice',
  components: {
    AlgoConfig
  }
})
export default class extends Mixins(AppMixin) {
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

  private deviceId = '1'
  private configAlgoInfo =
    {
      name: 'test',
      effectiveTime: [{ start_time: '0:0', end_time: '0:0' }],
      algorithm: { code: '10031' },
      id: '1'
    }
  private dangerZone = null
  private frameImage = require('./AlgoConfig/plate4.jpg')

  private mounted() {
    this.loadIboxDevice()
  }

  public async loadIboxDevice() {
    const data = {
      'pageNum': 1,
      'pageSize': 20,
      'totalPage': 1,
      'totalNum': 3,
      'devices': [
        {
          'deviceId': '29942077814997590',
          'groupId': '883904285310976',
          'parentDeviceId': '29942103584801365',
          'dirId': '-1',
          'deviceType': 'ipc',
          'deviceVendor': '',
          'deviceName': 'test-ipc',
          'description': '',
          'deviceIp': '',
          'devicePort': 0,
          'inProtocol': '',
          'userName': 'user',
          'userPassword': 'user',
          'gbId': '34082400011328566275',
          'pullType': 2,
          'transPriority': 'tcp',
          'deviceEnabled': 1,
          'deviceStatus': 'new',
          'streamStatus': '',
          'sipTransType': '',
          'streamTransType': '',
          'createSubDevice': 1,
          'gbVersion': '2011',
          'deviceStats': {
            'channelSize': 1,
            'onlineChannels': 0,
            'offlineChannels': 0,
            'onlineStreams': 0,
            'offlineStreams': 0,
            'failedStreams': 0
          },
          'deviceDir': {
            'dirId': '0',
            'dirName': '',
            'description': '',
            'groupId': '0',
            'parentDirId': '0',
            'createdTime': '0001-01-01 00:00:00',
            'updatedTime': '0001-01-01 00:00:00'
          },
          'createdTime': '2020-09-02 17:44:12',
          'updatedTime': '2020-09-02 18:14:21',
          'requestId': '3247575e6e1044668962f5a464fa3885'
        },
        {
          'deviceId': '29942071372546647',
          'groupId': '883904285310976',
          'parentDeviceId': '29942103584801365',
          'dirId': '-1',
          'deviceType': 'nvr',
          'deviceChannels': [
            {
              'deviceId': '123',
              'outId': '1111111',
              'deviceChannelNum': '333',
              'deviceName': 'nvr-设备1',
              'deviceStatus': 'on',
              'streams': []
            }, {
              'deviceId': '223',
              'outId': '2222',
              'deviceChannelNum': '332',
              'deviceName': 'nvr-设备2',
              'deviceStatus': 'off',
              'streams': []
            }, {
              'deviceId': '323',
              'outId': '3333333',
              'deviceChannelNum': '323333',
              'deviceName': 'nvr-设备3',
              'deviceStatus': 'on',
              'streams': []
            }, {
              'deviceId': '423',
              'outId': '44444',
              'deviceChannelNum': '423333',
              'deviceName': 'nvr-设备4',
              'deviceStatus': 'new',
              'streams': []
            }
          ],
          'deviceVendor': '',
          'deviceName': 'test-nvr',
          'description': '',
          'deviceIp': '',
          'devicePort': 0,
          'inProtocol': '',
          'userName': 'user',
          'userPassword': 'user',
          'gbId': '34082400011328199910',
          'pullType': 2,
          'transPriority': 'tcp',
          'deviceEnabled': 1,
          'deviceStatus': 'new',
          'streamStatus': '',
          'sipTransType': '',
          'streamTransType': '',
          'createSubDevice': 1,
          'gbVersion': '2011',
          'deviceStats': {
            'channelSize': 1,
            'onlineChannels': 0,
            'offlineChannels': 0,
            'onlineStreams': 0,
            'offlineStreams': 0,
            'failedStreams': 0
          },
          'deviceDir': {
            'uirId': '0',
            'uirName': '',
            'uescription': '',
            'uroupId': '0',
            'uarentDirId': '0',
            'ureatedTime': '0001-01-01 00:00:00',
            'updatedTime': '0001-01-01 00:00:00'
          },
          'createdTime': '2020-09-02 17:44:12',
          'updatedTime': '2020-09-02 18:14:21',
          'requestId': '3247575e6e1044668962f5a464fa3885'
        }
      ]

    }
    this.iboxDevice = data.devices.map(device => {
      if(device.deviceType === 'nvr'){
        return {...device, disabled: true, meta: null }
      }
      return { ...device, meta: null }
    })

  }

  private changeStepPrev() {
    this.$emit('update:step', this.step - 1)
  }

  private checkCallback(data, isChecked) {
    if(isChecked && !data.meta){
      this.deviceId = data.deviceId
      this.meta = null
      this.canvasDialog = true
    }
  }

  private onSubmit() {

  }

  private addMeta(meta){
    const deviceTree: any = this.$refs.deviceTree
    const algoMeta = JSON.parse(meta.algorithmMetadata)
    if(algoMeta.DangerZone.length > 0){
      const node = deviceTree.getNode(meta.deviceId)
      this.$set(node.data, 'meta', meta)
    }
  }

  private editMeta(data){
    this.meta = data.meta
    this.canvasDialog = true
  }

  public closeCanvasDialog() {
    this.canvasDialog = false
    this.meta = null
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

  ::v-deep .is-disabled {
    visibility: hidden;
  }
}

.btns {
  margin-top: 40px;
}
</style>
