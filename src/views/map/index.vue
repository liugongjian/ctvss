<template>
  <div v-loading="loading.group" class="app-container">
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div class="device-list" :class="{'device-list--collapsed': !isExpanded, 'device-list--dragging': dirDrag.isDragging}">
        <el-button class="device-list__expand" @click="toggledirList">
          <svg-icon name="hamburger" />
        </el-button>
        <div
          class="device-list__handle"
          :style="`left: ${dirDrag.width}px`"
          @mousedown="changeWidthStart($event)"
        />
        <div ref="dirList" class="device-list__left" :style="`width: ${dirDrag.width}px`">
          <el-button class="map__add" size="small" @click="dialogVisible = true">添加地图</el-button>
          <el-card class="map__user">
            <el-button class="map-item__user">我的地图</el-button>
          </el-card>
          <div class="device-tree__title">
            <span class="device-tree__text">设备树</span>
            <span class="device-tree__refresh">
              <svg-icon name="refresh" />
            </span>
          </div>
          <div v-loading="loading.dir" class="dir-list__tree device-list__max-height el-tree__content" :style="{height: `${maxHeight-230}px`}">
            <el-tree
              ref="dirTree"
              node-key="id"
              lazy
              show-checkbox
              :data="dirList"
              :load="loadDirs"
              :props="treeProp"
              :check-strictly="false"
              @check="checkCallback"
              @check-change="onCheckDevice"
              @node-click="selectDevice"
            >
              <span slot-scope="{node, data}" class="custom-tree-node" :class="{'online': data.deviceStatus === 'on'}">
                <span class="node-name">
                  <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                  <svg-icon :name="data.type" />
                  {{ node.label }}
                </span>
              </span>
            </el-tree>
          </div>
        </div>
        <div class="device-list__right">
          <div class="breadcrumb">
            <span class="breadcrumb__item">
              <el-button size="small" @click="changeEdit()">开启编辑</el-button>
              <el-button size="small" @click="addMarker()">添加标记</el-button>
              <el-button size="small" @click="changeTitleShow()">隐藏/显示title</el-button>
              <el-button size="small" @click="fntest()">测试</el-button>
            </span>
          </div>
          <div class="device-list__max-height" :style="{height: `${maxHeight}px`}">
            <el-dialog title="添加地图" :visible.sync="dialogVisible" width="45%">
              <el-form ref="form" :model="form" label-width="150px">
                <el-form-item label="名称">
                  <el-input v-model="form.name" placeholder="请输入地图名称" />
                </el-form-item>
                <el-form-item label="中心点经度">
                  <el-input v-model="form.longitude" placeholder="请输入地图中心点经度" />
                </el-form-item>
                <el-form-item label="中心点纬度">
                  <el-input v-model="form.latitude" placeholder="请输入地图中心点纬度" />
                </el-form-item>
                <div class="block">
                  <span class="demonstration">默认缩放级别</span>
                  <el-slider v-model="value" :min="3" :max="18" />
                </div>
                <div class="footer">
                  <el-button @click="dialogVisible = false">确定</el-button>
                  <el-button @click="dialogVisible = false">取消</el-button>
                </div>
              </el-form>
            </el-dialog>
<!--            <div><img src="./dashboard.png" alt=""></div>-->
            <div :class="['mapwrap', hideTitle?'hide-title':'']">
              <map-view ref="mapview"></map-view>
            </div>
            <div class="map-info__right" v-show="showInfo">
              <el-descriptions title="基本信息" :column="1">
                <el-descriptions-item label="设备名称">
                  <el-input v-model="editValue" disabled />
                </el-descriptions-item>
                <el-descriptions-item label="设备状态">
                  <el-input v-model="editValue" disabled />
                </el-descriptions-item>
                <el-descriptions-item label="流状态">
                  <el-input v-model="editValue" disabled />
                </el-descriptions-item>
                <el-descriptions-item label="录制状态">
                  <el-input v-model="editValue" disabled />
                </el-descriptions-item>
              </el-descriptions>
              <el-descriptions title="位置信息" :column="1">
                <el-descriptions-item label="经度">
                  <el-input v-model="editValue" :disabled="!isEdit" />
                </el-descriptions-item>
                <el-descriptions-item label="纬度">
                  <el-input v-model="editValue" :disabled="!isEdit" />
                </el-descriptions-item>
                <el-descriptions-item label="设备角度">
                  <el-input v-model="editValue" :disabled="!isEdit" />
                </el-descriptions-item>
                <el-descriptions-item label="可视角度">
                  <el-input v-model="editValue" :disabled="!isEdit" />
                </el-descriptions-item>
                <el-descriptions-item label="可视半径">
                  <el-input v-model="editValue" :disabled="!isEdit" />
                </el-descriptions-item>
              </el-descriptions>
              <el-descriptions title="一标三实" :column="1">
                <el-descriptions-item label="地址">
                  <el-input v-model="editValue" :disabled="!isEdit" />
                </el-descriptions-item>
                <el-descriptions-item label="人口信息">
                  <el-input v-model="editValue" :disabled="!isEdit" />
                </el-descriptions-item>
                <el-descriptions-item label="房屋信息">
                  <el-input v-model="editValue" :disabled="!isEdit" />
                </el-descriptions-item>
                <el-descriptions-item label="单位信息">
                  <el-input v-model="editValue" :disabled="!isEdit" />
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import IndexMixin from '../device/mixin/indexMixin'
import { getGroups } from '@/api/group'
import { setDirsStreamStatus, renderAlertType, getSums } from '@/utils/device'
import { describeShareDevices } from '@/api/upPlatform'
import { getDeviceTree } from '@/api/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { renderAlertType, getSums } from '@/utils/device'
import MapView from './mapview.vue'
import { getAMapLoad } from './models/vmap'

@Component({
  name: 'Map',
  components: {
    StatusBadge,
    MapView
  }
})
export default class extends Mixins(IndexMixin) {
  private renderAlertType = renderAlertType
  private getSums = getSums
  private dialogVisible = false
  private value = 3
  private isEdit = false
  private editValue = 'sss'
  private breadcrumb: Array<any> = []
  private hideTitle = false
  private form = {
    name: '',
    longitude: '',
    latitude: ''
  }
  private submitting = false
  private dirList: any = []
  private deviceList: any = []
  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }
  private mapList = []
  private markerList = []
  private curMap = {}
  private test = 4
  private overView = false
  @Prop()
  private platformId: any
  private typeMapping: any = {
    dir: 0,
    nvr: 1
  }

  /**
   * 目录初始化
   */
  public async initDirs() {
    try {
      this.loading.dir = true
      const res = await getGroups({
        pageSize: 1000
      })
      this.dirList = []
      res.groups.forEach((group: any) => {
        // 放开rtsp rtmp
        // (group.inProtocol === 'gb28181' || group.inProtocol === 'ehome' || group.inProtocol === 'vgroup') && (
        this.dirList.push({
          id: group.groupId,
          groupId: group.groupId,
          label: group.groupName,
          inProtocol: group.inProtocol,
          type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
          disabled: false,
          path: [{
            id: group.groupId,
            label: group.groupName,
            type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group'
          }]
        })
      })
    } catch (e) {
      this.dirList = []
    } finally {
      this.loading.dir = false
    }
  }

  @Watch('$route.query')
  private onRouterChange() {
    !this.defaultKey && this.gotoRoot()
  }

  /**
   * 加载目录
   */
  private async loadDirs(node: any, resolve: Function) {
    if (node.level === 0) return resolve([])
    const dirs = await this.getTree(node)
    resolve(dirs)
  }

  /**
   * 获取菜单树
   */
  private async getTree(node: any) {
    try {
      if (node.data.type === 'role') {
        node.data.roleId = node.data.id
      } else if (node.data.type === 'group') {
        node.data.realGroupId = node.data.id
        node.data.realGroupInProtocol = node.data.inProtocol
      }
      let shareDeviceIds: any = []
      if (node.data.type !== 'vgroup' && node.data.type !== 'role') {
        let params: any = {
          platformId: this.platformId,
          inProtocol: node.data.inProtocol,
          groupId: node.data.realGroupId || node.data.groupId,
          dirId: node.data.type === 'top-group' || node.data.type === 'group' ? 0 : node.data.id,
          dirType: '0',
          pageNum: 1,
          pageSize: 1000
        }
        const shareDevices: any = await describeShareDevices(params)
        shareDeviceIds = shareDevices.devices.map((device: any) => {
          return device.deviceId
        })
      }

      const devices: any = await getDeviceTree({
        groupId: node.data.groupId,
        id: node.data.type === 'top-group' || node.data.type === 'vgroup' ? 0 : node.data.id,
        inProtocol: node.data.inProtocol,
        type: node.data.type === 'top-group' || node.data.type === 'vgroup' ? undefined : node.data.type,
        'self-defined-headers': {
          'role-id': node.data.roleId,
          'real-group-id': node.data.realGroupId
        }
      })
      // if (node.data.type === 'role') {
      //   devices.dirs = devices.dirs.filter((dir: any) => dir.inProtocol === 'gb28181' || dir.inProtocol === 'ehome')
      // }
      const dirTree: any = this.$refs.dirTree
      let checkedKeys = dirTree.getCheckedKeys()
      let dirs: any = devices.dirs.map((dir: any) => {
        let sharedFlag = false
        if (shareDeviceIds.includes(dir.id) && dir.type === 'ipc') {
          sharedFlag = true
          checkedKeys.push(dir.id)
          dirTree.setCheckedKeys(checkedKeys)
        }
        if (dir.type === 'ipc') {
          node.data.disabled = false
        }
        return {
          id: dir.id,
          groupId: node.data.groupId,
          label: dir.label,
          inProtocol: dir.inProtocol || node.data.inProtocol,
          isLeaf: dir.isLeaf,
          type: dir.type,
          deviceStatus: dir.deviceStatus,
          streamStatus: dir.streamStatus,
          // disabled: dir.type !== 'ipc' || sharedFlag,
          disabled: sharedFlag,
          path: node.data.path.concat([dir]),
          sharedFlag: sharedFlag,
          roleId: node.data.roleId || '',
          realGroupId: node.data.realGroupId || '',
          realGroupInProtocol: node.data.realGroupInProtocol || ''
        }
      })
      dirs = setDirsStreamStatus(dirs)
      console.log(dirs)
      return dirs
    } catch (e) {
      console.log(e)
    }
  }

  private async checkCallback(data: any) {
    const dirTree: any = this.$refs.dirTree
    const node = dirTree.getNode(data.id)
    this.checkNodes(dirTree, node)
  }

  private async checkNodes(dirTree: any, node: any) {
    if (node.checked) {
      if (node.loaded) {
        node.expanded = true
      } else {
        const dirs = await this.getTree(node)
        dirTree.updateKeyChildren(node.data.id, dirs)
        node.expanded = true
        node.loaded = true
      }
      node.childNodes.forEach((child: any) => {
        child.checked = true
        if (child.data.type !== 'ipc') {
          this.checkNodes(dirTree, child)
        }
      })
      this.onCheckDevice()
    }
  }

  /**
   * 单击ipc时直接勾选
   */
  private selectDevice(data: any) {
    if (data.type === 'ipc' && !data.sharedFlag) {
      const dirTree: any = this.$refs.dirTree
      const node = dirTree.getNode(data.id)
      dirTree.setChecked(data.id, !node.checked)
    }
  }

  /**
   * 当设备被选中时回调，将选中的设备列出
   */
  private onCheckDevice() {
    const dirTree: any = this.$refs.dirTree
    const nodes = dirTree.getCheckedNodes()
    this.deviceList = nodes.filter((node: any) => {
      return (node.type === 'ipc' && !node.sharedFlag)
    })
  }
  changeTitleShow() {
    this.hideTitle = !this.hideTitle;
  }
  changeEdit() {
    this.isEdit = !this.isEdit
    this.$refs.mapview.changeEdit(this.isEdit);
  }
  fntest() {
    this.$refs.mapview.getZoom();
  }
  addMarker() {
    const marker = {
      deviceId: `00${this.test++}`,
      inProtocol: 'rtsp',
      deviceType: 'ipc',
      // longitude: 121.487207,
      // latitude: 31.225348,
      viewRadius: 30,
      viewAngle: 100,
      deviceAngle: 0,
      population: '人口信息',
      houseInfo: '房屋信息',
      unitInfo: '单位信息'
    }
    this.$refs.mapview.addMarker(marker);
  }
  toggleOverView() {
    this.overView = !this.overView;
    this.$refs.mapview.toggleOverView(this.overView);
  }
  addMap() {
    const map = {
      name: '地图1',
      longitude: 116.391467,
      latitude: 39.927761,
      zoom: 15,
    }
    this.$refs.mapview.chooseMap(map);
  }
  mounted() {
    this.initDirs()
    // 获取地图信息
    this.mapList = [
      {
        mapId: 1,
        name: '地图1',
        zoom: 12,
        longitude: 121.487207,
        latitude: 31.225348,
      }
    ]
    this.markerList = [
      {
        deviceId: '001',
        inProtocol: 'rtsp',
        deviceType: 'ipc',
        longitude: 121.487207,
        latitude: 31.225348,
        viewRadius: 100,
        viewAngle: 120,
        deviceAngle: 0,
        population: '人口信息',
        houseInfo: '房屋信息',
        unitInfo: '单位信息'
      },
      {
        deviceId: '002',
        inProtocol: 'rtsp',
        deviceType: 'ipc',
        longitude: 121.527207,
        latitude: 31.215348,
        viewRadius: 80,
        viewAngle: 90,
        deviceAngle: 20,
        population: '人口信息',
        houseInfo: '房屋信息',
        unitInfo: '单位信息'
      },
      {
        deviceId: '003',
        inProtocol: 'rtsp',
        deviceType: 'ipc',
        longitude: 121.526207,
        latitude: 31.215148,
        viewRadius: 80,
        viewAngle: 90,
        deviceAngle: 20,
        population: '人口信息',
        houseInfo: '房屋信息',
        unitInfo: '单位信息'
      },
    ];
    this.curMap = this.mapList[0];
    getAMapLoad().then(() => {
      this.$refs.mapview.chooseMap(this.curMap);
      this.$refs.mapview.setMarkerList(this.markerList);
    })
  }
}
</script>
<style lang="scss" scoped>
.mapwrap {
  width: 100%;
  height: 100%;
}

.device-list__left {
  position: relative;
}

.map__add {
  position: absolute;
  right: 10px;
  top: 5px;
}

.map__user {
  position: absolute;
  top: 40px;
  width: 100%;
  height: 150px;
  text-align: center;
}

.map-item__user {
  width: 90%;
}

.device-tree {
  position: absolute;
  top: 300px;
}

.device-tree__title {
  position: absolute;
  top: 190px;
  background: #f8f8f8;
  width: 100%;
  height: 40px;
}

.device-tree__text {
  position: absolute;
  left: 20px;
  height: 100%;
  line-height: 40px;
}

.device-tree__refresh {
  position: absolute;
  right: 20px;
  height: 100%;
  line-height: 40px;
}

.el-tree__content {
  position: absolute;
  top: 230px;
  width: 100%;
}

.footer {
  text-align: center;
}

.slider {
  display: inline-block;
  width: 50%;
}

.map-info__right {
  position: absolute;
  top: 40px;
  right: 0;
  background: rgba(255, 255, 255, 80%);
  width: 20%;
  height: 100%;
  padding: 20px 0 0 20px;
}

.map-info__right .el-descriptions {
  margin-bottom: 20px;
}

::v-deep .el-descriptions-item__label {
  min-width: 60px;
  line-height: 36px;
}

::v-deep .el-descriptions__body {
  background-color: rgba(255, 255, 255, 0%);
}

::v-deep .el-input__inner {
  background-color: rgba(255, 255, 255, 0%);
  border: none;
  border-radius: 0;
  border-bottom: 1px solid black;
}

::v-deep .el-input.is-disabled .el-input__inner {
  background-color: rgba(255, 255, 255, 0%);
  color: rgba(0, 0, 0, 85%);
  border: none;
  cursor: default;
}

</style>
