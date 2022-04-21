<template>
  <div v-loading.body="loading.group" class="app-container">
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div class="device-list" :style="{height: `${maxHeight + 35}px`}" :class="{'device-list--collapsed': !isExpanded, 'device-list--dragging': dirDrag.isDragging}">
        <el-button class="device-list__expand" @click="toggledirList">
          <svg-icon name="hamburger" />
        </el-button>
        <div
          class="device-list__handle"
          :style="`left: ${dirDrag.width}px`"
          @mousedown="changeWidthStart($event)"
        />
        <div ref="dirList" class="device-list__left" :style="`width: ${dirDrag.width}px`">
          <el-button class="map__add" size="small" @click="openMapEditDialog()">添加地图</el-button>
          <el-card v-if="curMap" class="map__user">
            <div v-for="map in mapList" :key="map.mapId">
              <div class="choose-map" :class="map.mapId === curMap.mapId ? 'active' : ''" @click="chooseMap(map)">
                <span class="map-text">{{ map.name }}</span>
                <span class="edit-icon"><svg-icon name="edit" @click.stop="openMapEditDialog(map)" /></span>
                <span class="delete-icon"><svg-icon name="delete" @click.stop="deleteMap(map)" /></span>
              </div>
            </div>
          </el-card>
          <div class="device-tree__title">
            <span class="device-tree__text">设备树</span>
            <span class="device-tree__refresh" @click="initDirs">
              <svg-icon name="refresh" />
            </span>
          </div>
          <div v-loading.body="loading.dir" class="dir-list__tree device-list__max-height el-tree__content" :style="{height: `${maxHeight-230}px`}">
            <el-tree
              ref="dirTree"
              node-key="id"
              lazy
              :data="dirList"
              :load="loadDirs"
              :props="treeProp"
              :check-strictly="false"
            >
              <span slot-scope="{node, data}" class="custom-tree-node" :class="{'online': data.deviceStatus === 'on'}" @click="deviceClick(data)">
                <!-- <template v-if="data.isLeaf">
                  <draggable
                    @unchoose="(e) => {
                      nodeNameUnchoose(e,data)
                    }"
                    @start="startDragNodeName"
                  >
                    <transition-group>
                      <span :key="data.id" class="node-name" :class="data.isLeaf ? 'node-name-move' : '' ">
                        <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                        <svg-icon :name="data.type" />
                        {{ node.label }}
                        <svg-icon v-if="mapDeviceIds.indexOf(data.id) >= 0" name="mark" />
                        <span class="sum-icon">{{ getSums(data) }}</span>
                      </span>
                    </transition-group>
                  </draggable>
                </template>
                <template v-else>
                  <span class="node-name">
                    <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                    <svg-icon :name="data.type" />
                    {{ node.label }}
                    <svg-icon v-if="data.isLeaf && mapDeviceIds.indexOf(data.id) >= 0" name="mark" />
                    <span class="sum-icon">{{ getSums(data) }}</span>
                  </span>
                </template> -->
                <span class="node-name">
                  <status-badge v-if="data.streamStatus" :status="data.streamStatus" />
                  <svg-icon :name="data.type" />
                  <span class="node-label">{{ node.label }}{{ getNumbers(node,data) }}</span>
                  <svg-icon v-if="data.isLeaf && mapDeviceIds.indexOf(data.id) >= 0" name="mark" />
                  <span class="sum-icon" />
                </span>
                <el-tooltip content="添加该点位至地图" placement="top">
                  <span
                    v-if="data.isLeaf && mapDeviceIds.indexOf(data.id) < 0"
                    class="node-option"
                    @click.stop.prevent="addMarker(data)"
                  >+</span>
                </el-tooltip>
                <el-tooltip content="将该点位从地图中移除" placement="top">
                  <span
                    v-if="data.isLeaf && mapDeviceIds.indexOf(data.id) >= 0"
                    class="node-option"
                    @click.stop.prevent="deleteMarker(data)"
                  >-</span>
                </el-tooltip>
              </span>
            </el-tree>
          </div>
        </div>
        <div class="device-list__right">
          <div class="tools">
            <span class="left">
              <span class="btn-edit tools-item" @click="changeEdit()">{{ isEdit ? '完成编辑' : '开启编辑' }}</span>
              <!-- <span class="tools-item"><svg-icon name="selects" /></span> -->
              <el-tooltip :content="hideTitle ? '显示监控点位名称': '隐藏监控点位名称'" placement="top">
                <span class="tools-item"><svg-icon name="title" :class="curMap && !hideTitle ?'active':''" @click="changeTitleShow()" /></span>
              </el-tooltip>
              <el-tooltip :content="overView ? '隐藏鹰眼地图' : '显示鹰眼地图'" placement="top">
                <span class="tools-item"><svg-icon name="hawkeye" :class="curMap && overView?'active':''" @click="toggleOverView()" /></span>
              </el-tooltip>
              <el-tooltip :content="is3D ? '关闭2.5D视图' : '显示2.5D视图'" placement="top">
                <span class="tools-item"><svg-icon name="3d" :class="curMap && is3D?'active':''" @click="toggleMap3D()" /></span>
              </el-tooltip>
              <!--              <el-tooltip :content="showMarkers ? '隐藏监控点位' : '显示监控点位'" placement="top">-->
              <!--                <span class="tools-item"><svg-icon name="mark" :class="curMap && showMarkers?'active':''" @click="toggleMarkersShow()" /></span>-->
              <!--              </el-tooltip>-->
              <el-tooltip content="关闭所有播放窗口" placement="top">
                <span class="tools-item"><svg-icon name="close-all" @click=" closeAllWindow()" /></span>
              </el-tooltip>
              <!-- <span class="tools-item"><svg-icon name="magnifier" /></span> -->
              <!-- <span class="tools-item tools-item__cup">|</span>
              <span class="tools-item"><svg-icon name="player" /></span>
              <span class="tools-item"><svg-icon name="play-video" /></span>
              <span class="tools-item"><svg-icon name="delete" /></span> -->
              <el-tooltip content="进入全屏" placement="top">
                <span class="tools-item">
                  <svg-icon name="fullscreen" @click="fullscreenMap" />
                </span>
              </el-tooltip>
            </span>
            <span class="right">
              <el-tooltip content="属性" placement="top">
                <span class="tools-item"><svg-icon name="toggle-show" @click="showInfo = !showInfo" /></span>
              </el-tooltip>
            </span>
          </div>
          <div class="device-list__max-height" :style="{height: `${maxHeight}px`}">
            <el-dialog :title="mapEditDialog.status === 'add' ? '添加地图' : '编辑地图'" :visible.sync="mapEditDialog.dialogVisible" width="45%" class="dialog-text">
              <el-form ref="mapform" :model="form" label-width="150px" :rules="rules">
                <el-form-item label="名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入地图名称" />
                </el-form-item>
                <el-form-item label="中心点经度" prop="longitude">
                  <el-input v-model="form.longitude" placeholder="请输入地图中心点经度" />
                </el-form-item>
                <el-form-item label="中心点纬度" prop="latitude">
                  <el-input v-model="form.latitude" placeholder="请输入地图中心点纬度" />
                </el-form-item>
                <el-form-item prop="zoom">
                  <template slot="label">
                    <span>默认缩放比例
                      <el-tooltip content="设置地图的默认缩放比例，表示每厘米对应实际的距离。">
                        <svg-icon name="help" />
                      </el-tooltip>
                    </span>
                  </template>
                  <div class="block">
                    <el-slider v-model="form.zoom" :min="3" :max="20" />
                    <span class="zoomdesc">{{ zoomDesc }}</span>
                  </div>
                </el-form-item>
              </el-form>
              <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addOrEditMap">确定</el-button>
                <el-button @click="mapEditDialog.dialogVisible = false">取消</el-button>
              </span>
            </el-dialog>
            <el-dialog title="修改地图" :visible.sync="modifyMapDialog" class="dialog-text">
              <div>
                <h3>确定覆盖“{{ curMap && curMap.name }}”的属性？</h3>
              </div>
              <div>
                <el-checkbox v-model="modifyMapForm.center">中心坐标</el-checkbox>
                <el-checkbox v-model="modifyMapForm.zoom">缩放</el-checkbox>
              </div>
              <span slot="footer" class="dialog-footer">
                <el-button @click="modifyMapDialog = false">取消</el-button>
                <el-button type="primary" @click="modifyMap">确定</el-button>
              </span>
            </el-dialog>
            <el-dialog title="添加监控点位" :visible.sync="addPositionDialog" class="dialog-text">
              <div>
                <h3>是否继承设备中的经纬度</h3>
                <h3>如不继承则使用地图当前的中心经纬度</h3>
              </div>
              <h3>
                <el-checkbox v-model="addPositionDialogCheck">本次编辑不再询问</el-checkbox>
              </h3>
              <el-button @click="confirmAddMarker(true)">继承</el-button>
              <el-button @click="confirmAddMarker(false)">不继承</el-button>
              <el-button @click="cancelAddMark()">取消</el-button>
            </el-dialog>
            <el-dialog title="添加监控点位" :visible.sync="addNoPositionDialog" class="dialog-text">
              <div>
                <h3>本设备未设置经纬度，是否使用地图当前的中心经纬度？</h3>
              </div>
              <h3>
                <el-checkbox v-model="addNoPositionDialogCheck">本次编辑不再询问</el-checkbox>
              </h3>
              <el-button @click="confirmAddZeroMarker">确定</el-button>
              <el-button @click="cancelAddMark">取消</el-button>
            </el-dialog>
            <div :class="['mapwrap', hideTitle?'hide-title':'']">
              <!-- ifMapDisabled -->
              <map-view
                v-if="mapList.length > 0 && curMap"
                ref="mapview"
                :map-option="curMap"
                :is-edit="isEdit"
                @mapChange="handleMapInfo"
                @mapClick="handleMapClick"
                @markerlistChange="handleMarksChange"
              />
              <div v-else class="init-map">
                <el-button type="primary" @click="openMapEditDialog()">添加地图</el-button>
              </div>
              <div v-show="showInfo" class="map-info__right">
                <div v-if="showMapInfo">
                  <map-info :is-edit="isEdit" :map="curMap" @save="changeMapInfos" />
                </div>
                <div v-if="!showMapInfo">
                  <point-info :is-edit="isEdit" :marker="curMarkInfo" @save="changeMarkerInfos" />
                <!-- <selected-point /> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Mixins,
  // Prop,
  Watch } from 'vue-property-decorator'
import IndexMixin from '../device/mixin/indexMixin'
import { getGroups } from '@/api/group'
import { setDirsStreamStatus, renderAlertType, getSums } from '@/utils/device'
// import { describeShareDevices, getPlatforms } from '@/api/upPlatform'
import {
  // getDeviceEvents, getDevices,
  getDeviceTree, getDevice } from '@/api/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import MapView from './mapview.vue'
import PointInfo from './components/PointInfo.vue'
import SelectedPoint from './components/SelectedPoint.vue'
import MapInfo from './components/MapInfo.vue'
import { getMaps, createMap, deleteMap, modifyMap } from '@/api/map'
import { mapObject } from '@/views/map/models/vmap'
// import draggable from 'vuedraggable'

@Component({
  name: 'Map',
  components: {
    StatusBadge,
    MapView,
    MapInfo,
    PointInfo,
    SelectedPoint
    // draggable
  }
})
export default class extends Mixins(IndexMixin) {
  public $refs: {
    mapview: MapView
    dirTree: any
    mapform: any
    deviceWrap: any
  }
  private renderAlertType = renderAlertType
  private getSums = getSums
  private mapEditDialog = { // 修改或添加地图对话框
    dialogVisible: false,
    status: 'add' // add|edit
  }
  private editDialog = false
  private deleteDialog = false
  private deletesDialog = false
  private isEdit = false
  private editValue = 'sss'
  // public breadcrumb: Array<any> = []
  private hideTitle = true
  private showInfo = false
  private showMapInfo = true
  private addPositionDialog = false // 显示询问本次编辑要不要继承设备坐标的对话弹窗
  private addPositionDialogCheck = false // 是否询问本次编辑要不要继承设备坐标
  private uselnglat = true // 是否要继承设备坐标
  private addNoPositionDialog = false
  private addNoPositionDialogCheck = false
  private deviceInfo: any = {}
  private markerInfo: any = {}
  private form = {
    mapId: '',
    name: '',
    longitude: '',
    latitude: '',
    zoom: 12
  }
  private get zoomDesc() {
    const map = {
      20: '1:10m',
      19: '1:10m',
      18: '1:25m',
      17: '1:50m',
      16: '1:100m',
      15: '1:200m',
      14: '1:500m',
      13: '1:1km',
      12: '1:2km',
      11: '1:5km',
      10: '1:10km',
      9: '1:20km',
      8: '1:30km',
      7: '1:50km',
      6: '1:100km',
      5: '1:200km',
      4: '1:500km',
      3: '1:1000km',
      2: '1:1000km'
    }
    return map[this.form.zoom]
  }
  private rules = {
    name: [
      { required: true, message: '请填写地图名称', trigger: 'blur' }
    ],
    longitude: [
      // { required: true, message: '请填写地图经度，[-180, 180]', trigger: 'blur' },
      { validator: this.validatelng, trigger: 'blur' }
    ],
    latitude: [
      // { required: true, message: '请填写地图纬度，[-90, 90]', trigger: 'blur' },
      { validator: this.validatelat, trigger: 'blur' }
    ]
  }
  private ifMapDisabled = false

  private validatelng(rule: any, value: string, callback: Function) {
    const val = Number(value)
    if (!this.checklng(val)) {
      callback(new Error('请填写正确的经度'))
    } else {
      callback()
    }
  }
  private validatelat(rule: any, value: string, callback: Function) {
    const val = Number(value)
    if (!this.checklat(val)) {
      callback(new Error('请填写正确的纬度'))
    } else {
      callback()
    }
  }

  private checklng(lng) {
    const val = Number(lng)
    const result = isNaN(val) || val < -180 || val > 180
    return !result
  }

  private checklat(lat) {
    const val = Number(lat)
    const result = isNaN(val) || val < -90 || val > 90
    return !result
  }
  private checkZoom(zoom) {
    const val = Number(zoom)
    const result = isNaN(val) || val < 3 || val > 20
    return !result
  }

  private modifyMapDialog = false
  private modifyMapForm = {
    center: false,
    zoom: false
  }
  private submitting = false
  public dirList: any = []
  private deviceList: any = []
  public treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }
  private mapList = []
  private mapPager = {}
  private markerList = []
  private curMap = null
  private curMapInfo = null
  private curMarkInfo = null
  private overView = false
  private showMarkers = true
  private is3D = true
  private marker = null
  // @Prop()
  // private platformId: any = '417932083494649856'
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
          groupStats: group.groupStats,
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
  public async loadDirs(node: any, resolve: Function) {
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
          disabled: sharedFlag,
          path: node.data.path.concat([dir]),
          sharedFlag: sharedFlag,
          roleId: node.data.roleId || '',
          realGroupId: node.data.realGroupId || '',
          realGroupInProtocol: node.data.realGroupInProtocol || '',
          onlineSize: dir.onlineSize,
          totalSize: dir.totalSize
        }
      })
      dirs = setDirsStreamStatus(dirs)
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
   *  地图进入全屏
  */
  private fullscreenMap() {
    const mapwrap: any = document.querySelector('.mapwrap')
    if (mapwrap.requestFullscreen) {
      mapwrap.requestFullscreen()
    } else if (mapwrap.webkitRequestFullScreen) {
      mapwrap.webkitRequestFullScreen()
    } else if (mapwrap.mozRequestFullScreen) {
      mapwrap.mozRequestFullScreen()
    } else if (mapwrap.msRequestFullscreen) {
      mapwrap.webkitRequestFullscreen()
    } else if (typeof window.ActiveXObject !== 'undefined') {
      const wscript = new ActiveXObject('WScript.Shell')
      if (wscript != null) {
        wscript.SendKeys('{F11}')
      }
    }
    const mapInfo: any = document.querySelector('.map-info__right')
    mapInfo.style.top = 0
  }

  // 判断是否全屏
  private getIfFullscreen() {
    const doc: any = document
    return doc.webkitIsFullScreen || doc.mozFullScreen || doc.msFullscreenElement || doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullscreenElement
  }

  /**
   *  地图退出全屏
   */
  private exitFullscreenMap() {
    const mapInfo: any = document.querySelector('.map-info__right')
    mapInfo.style.top = '40px'
  }

  /**
   *  设备数 点位开始拖拽事件
  */
  private startDragNodeName(e: Event) {
    this.ifMapDisabled = true
    console.log(e)
  }

  /**
   * 设备数拖拽后松开鼠标事件
  */
  private nodeNameUnchoose(e: Event, item: any) {
    console.log(e)
    console.log(item)
  }

  /**
   * 获取设备数 设备数量
   */
  private getNumbers(node: any, data: any) {
    if (node.level === 1) {
      return ` (${data.groupStats.onlineIpcSize}/${data.groupStats.deviceSize})`
    }
    return this.getSums(data)
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
  handleMapClick(infos) {
    const { type, info } = infos
    if (type === 'map') {
      this.showInfo = false
      this.showMapInfo = true
    } else if (type === 'marker') {
      this.showMapInfo = false
      this.showInfo = true
      this.curMarkInfo = info
    }
  }

  handleMarksChange(list) {
    this.markerList = list
  }

  private get mapDeviceIds() {
    return this.markerList.map(marker => marker.deviceId)
  }

  changeTitleShow() {
    if (this.curMap) {
      this.hideTitle = !this.hideTitle
    }
  }

  changeEdit() {
    this.isEdit = !this.isEdit
    this.addPositionDialogCheck = false
    this.addNoPositionDialogCheck = false
  }

  cancelAddMark() {
    this.addPositionDialog = false
    this.addPositionDialogCheck = false
    this.addNoPositionDialog = false
    this.addNoPositionDialogCheck = false
  }

  addMarker(marker) {
    if (!this.isEdit) {
      this.$msgbox({
        title: '开始编辑',
        message: '当前为查看模式，是否确定进入编辑模式？',
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.isEdit = true
        this.handleMarkerOn(marker)
      }).catch(() => {
        console.log('取消进入编辑模式')
      })
    } else {
      this.handleMarkerOn(marker)
    }
  }

  private async handleMarkerOn(marker) {
    this.marker = marker
    await this.getDeviceInfo()
    if (Number(this.deviceInfo.deviceLongitude) && Number(this.deviceInfo.deviceLatitude)) {
      if (!this.addPositionDialogCheck) {
        this.addPositionDialog = true
      } else {
        this.confirmAddMarker(this.uselnglat)
      }
    } else {
      if (!this.addNoPositionDialogCheck) {
        this.addNoPositionDialog = true
      } else {
        this.confirmAddZeroMarker()
      }
    }
  }

  private async getDeviceInfo() {
    const { id, inProtocol } = this.marker
    this.deviceInfo = await getDevice({
      deviceId: id,
      inProtocol: inProtocol
    })
    this.markerInfo = {
      deviceId: this.deviceInfo.deviceId,
      inProtocol: this.deviceInfo.inProtocol,
      deviceType: this.deviceInfo.deviceType,
      deviceLabel: this.deviceInfo.deviceName,
      longitude: '',
      latitude: '',
      deviceStatus: this.deviceInfo.deviceStatus,
      streamStatus: this.deviceInfo.streamStatus,
      recordStatus: this.deviceInfo.recordStatus,
      regionNames: this.deviceInfo.regionNames,
      viewRadius: '0',
      viewAngle: '0',
      deviceAngle: '0',
      population: '',
      houseInfo: '',
      unitInfo: ''
    }
  }

  private confirmAddMarker(uselnglat: boolean) {
    this.uselnglat = uselnglat
    try {
      // const device = await getDevice({
      //   deviceId: this.marker.id,
      //   inProtocol: this.marker.inProtocol
      // })
      // const markerInfo = {
      //   deviceId: this.deviceInfo.deviceId,
      //   inProtocol: this.deviceInfo.inProtocol,
      //   deviceType: this.deviceInfo.deviceType,
      //   deviceLabel: this.deviceInfo.deviceName,
      //   longitude: '',
      //   latitude: '',
      //   deviceStatus: this.deviceInfo.deviceStatus,
      //   streamStatus: this.deviceInfo.streamStatus,
      //   recordStatus: this.deviceInfo.recordStatus,
      //   regionNames: this.deviceInfo.regionNames,
      //   viewRadius: '0',
      //   viewAngle: '0',
      //   deviceAngle: '0',
      //   population: '',
      //   houseInfo: '',
      //   unitInfo: ''
      // }
      if (uselnglat && this.deviceInfo.deviceLongitude && this.deviceInfo.deviceLatitude) {
        const checklnglat = this.checklng(this.deviceInfo.deviceLongitude) && this.checklat(this.deviceInfo.deviceLatitude)
        if (!checklnglat) {
          this.$confirm('当前设备的经纬度有误，继续添加将默认设为当前地图的中心点，是否继续?', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.markerInfo.longitude = ''
            this.markerInfo.latitude = ''
            this.$refs.mapview.addMarker(this.markerInfo)
          }).catch(() => {
            console.log('cancel')
          })
        } else {
          this.markerInfo.longitude = this.deviceInfo.deviceLongitude
          this.markerInfo.latitude = this.deviceInfo.deviceLatitude
          this.$refs.mapview.addMarker(this.markerInfo)
        }
      } else {
        this.$refs.mapview.addMarker(this.markerInfo)
      }
    } catch (e) {
      this.$alertError(e)
    } finally {
      this.addPositionDialog = false
    }
  }

  private confirmAddZeroMarker() {
    this.$refs.mapview.addMarker(this.markerInfo)
    this.addNoPositionDialog = false
  }

  deviceClick(data) {
    if (data.isLeaf && this.mapDeviceIds.indexOf(data.id) < 0) {
      this.$message.warning('该设备尚未添加到当前地图上')
    } else if (data.isLeaf && this.mapDeviceIds.indexOf(data.id) >= 0) {
      const marker = this.markerList.filter(item => item.deviceId === data.id)[0]
      this.$refs.mapview.setMapCenter(marker.longitude, marker.latitude)
      this.$refs.mapview.chooseDevice(marker)
    }
  }

  deleteMarker(marker) {
    this.$refs.mapview.handleMarkerDelete(marker.id, marker.label)
  }

  toggleMarkersShow() {
    if (this.curMap) {
      this.showMarkers = !this.showMarkers
      this.$refs.mapview.setMarkersView(this.showMarkers)
    }
  }
  toggleOverView() {
    if (this.mapList.length > 0) {
      this.overView = !this.overView
      this.$refs.mapview.toggleOverView(this.overView)
    }
  }
  toggleMap3D() {
    if (this.curMap) {
      this.is3D = !this.is3D
      this.$refs.mapview.toggleMap3D(this.is3D)
    }
  }

  addOrEditMap() {
    this.$refs.mapform.validate(async(valid: any) => {
      if (valid) {
        try {
          const map = {
            name: this.form.name,
            longitude: this.form.longitude || '116.397428',
            latitude: this.form.latitude || '39.90923',
            zoom: this.form.zoom
          }
          if (this.mapEditDialog.status === 'add') {
            const res = await createMap(map)
            const mapId = res.mapId
            this.curMap = { ...map, mapId }
            if (this.mapList.length > 0) {
              this.$refs.mapview.setMap(this.curMap)
              this.$refs.mapview.closeAllPlayer()
            }
            this.mapList.push(this.curMap)
            this.mapEditDialog.dialogVisible = false
          } else {
            await modifyMap(this.form)
            this.mapList = this.mapList.map(item => {
              if (item.mapId === this.form.mapId) {
                return this.form
              } else {
                return item
              }
            })
            this.curMap = this.form
            this.$refs.mapview.setMapZoomAndCenter(this.curMap.zoom, this.curMap.longitude, this.curMap.latitude)
            this.$alertSuccess('地图修改成功')
            this.mapEditDialog.dialogVisible = false
          }
        } catch (e) {
          this.$alertError(e.message)
        }
      } else {
        return false
      }
    })
  }

  changeMarkerInfos(mark) {
    const checklnglat = this.checklng(mark.longitude) && this.checklat(mark.latitude)
    if (checklnglat) {
      this.$refs.mapview.markerChange(mark)
    } else {
      this.$alertError('请填写正确的经纬度')
    }
  }

  changeMapInfos(map) {
    this.curMapInfo = map
    this.modifyMapDialog = true
  }

  private closeAllWindow() {
    this.$refs.mapview.closeAllPlayer()
  }

  // 打开地图信息编辑弹窗 新增/修改
  private openMapEditDialog(map?: mapObject) {
    if (map) {
      this.form = {
        mapId: map.mapId,
        name: map.name,
        longitude: map.longitude + '',
        latitude: map.latitude + '',
        zoom: Number(map.zoom)
      }
      this.mapEditDialog.status = 'edit'
    } else {
      this.form = {
        mapId: '',
        name: '',
        longitude: '',
        latitude: '',
        zoom: 12
      }
      this.mapEditDialog.status = 'add'
    }
    this.mapEditDialog.dialogVisible = true
  }

  /**
   * 加载地图列表
   */
  public async getMapList() {
    try {
      let params: any = {
        pageNum: 0,
        pageSize: 20
      }
      let res: any
      res = await getMaps(params)
      this.mapList = res.maps
      this.mapPager = {
        pageNum: res.pageNum,
        pageSize: res.pageSize,
        total: res.totalNum
      }
    } catch (e) {
      this.$alertError(e.message)
      this.mapList = []
    }
  }

  private chooseMap(map) {
    this.showInfo = false
    this.showMapInfo = true
    this.showMarkers = true
    this.curMap = map
    this.$refs.mapview.setMap(map)
    this.$refs.mapview.closeAllPlayer()
  }

  private deleteMap(map) {
    this.$alertDelete({
      type: '地图',
      msg: `确定删除"${map.name}"?`,
      method: deleteMap,
      payload: { mapId: map.mapId },
      onSuccess: () => {
        this.mapList = this.mapList.filter(item => item.mapId !== map.mapId)
        if (this.curMap.mapId === map.mapId) {
          this.curMap = this.mapList[0] || null
        }
      }
    })
  }
  private handleMapInfo(infos) {
    const { type, info } = infos
    if (type === 'map') {
      this.curMap = info
    } else if (type === 'marker') {
      this.curMarkInfo = info
    }
  }

  private async modifyMap() {
    let checklnglat = true
    let checkzoom = true
    const originMap = this.mapList.filter(item => item.mapId === this.curMap.mapId)[0]
    try {
      const params = { ...originMap }
      if (this.modifyMapForm.center) {
        params.longitude = this.curMapInfo.longitude
        params.latitude = this.curMapInfo.latitude
        checklnglat = this.checklng(params.longitude) && this.checklat(params.latitude)
      }
      if (this.modifyMapForm.zoom) {
        params.zoom = this.curMapInfo.zoom
        checkzoom = this.checkZoom(params.zoom)
      }
      if (checklnglat && checkzoom) {
        await modifyMap(params)
        this.curMap = params
        this.mapList = this.mapList.map(item => {
          if (item.mapId === params.mapId) {
            return params
          } else {
            return item
          }
        })
        this.$refs.mapview.setMapZoomAndCenter(this.curMap.zoom, this.curMap.longitude, this.curMap.latitude)
        this.$alertSuccess('地图修改成功')
      } else {
        if (!checklnglat) {
          this.$alertError('请填写正确的经纬度')
        } else if (!checkzoom) {
          this.$alertError('级别取值范围为[3, 20]')
        }
      }
    } catch (e) {
      this.$alertError(e.message)
    } finally {
      this.modifyMapDialog = false
    }
  }

  private calHeight() {
    const deviceWrap: any = this.$refs.deviceWrap
    const size = deviceWrap.$el.getBoundingClientRect()
    const top = size.top
    const documentHeight = document.body.offsetHeight
    this.maxHeight = documentHeight - top - 60
    if (!this.getIfFullscreen()) {
      // 退出全屏
      this.exitFullscreenMap()
    }
  }

  private async mounted() {
    this.initDirs()
    await this.getMapList()
    this.curMap = this.mapList[0]
    this.calHeight()
    window.addEventListener('resize', this.calHeight)
  }

  private destroyed() {
    window.removeEventListener('resize', this.calHeight)
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
  padding: 15px 12px;
  overflow: scroll;
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
  margin: 30px 0;
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
  width: 150px;
  height: 100%;
  padding: 10px;
  overflow: scroll;
  z-index: 10;
}

.dialog-text {
  .block {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    color: #888;
  }

  .zoomdesc {
    margin-left: 20px;
    min-width: 60px;
  }

  ::v-deep .el-dialog__footer {
    text-align: center;
  }

  ::v-deep .el-button + .el-button {
    margin-left: 30px;
  }

  ::v-deep .el-dialog__body {
    padding: 30px 50px;
  }

  ::v-deep .el-form-item__content {
    padding-right: 50px;
  }

  ::v-deep .el-slider {
    flex: 1;
  }

  ::v-deep .el-slider__marks-text {
    width: 30px;
    color: #fa8334;
  }
}

.tools {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 0 15px;
  border-bottom: 1px solid #eee;
  background: #f8f8f8;
  white-space: nowrap;
  overflow: hidden;
  transition: padding-left 0.2s;

  .btn-edit {
    width: 90px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background: #fa8334;
    color: #fff;
    border-radius: 5px;
    font-size: 12px;
  }

  svg {
    font-size: 20px;
  }

  .tools-item {
    cursor: pointer;

    .active {
      color: #fa8334;
    }
  }

  .left {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;

    .tools-item {
      margin-right: 20px;
    }
  }
}

.device-list__left .dir-list__tree .custom-tree-node {
  width: calc(100% - 26px); // 滚动条宽度是26px
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .node-option {
    padding: 2px;
    font-size: 18px;
    font-weight: bolder;
    margin-left: auto;
  }

  .node-name {
    display: flex;
    width: calc(100% - 20px);
  }

  .node-label {
    display: inline-block;
    width: 80%;
    flex: 1;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .node-name-move {
    cursor: move;
  }
}

.dialog-text {
  text-align: center;
}

.tools-item__cup {
  color: rgb(189, 188, 188);
}

.init-map {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.choose-map {
  height: 33px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 0 auto;
  padding: 0 10px;
  border-radius: 5px;
  cursor: pointer;

  .map-text {
    flex: 1;
    text-align: left;
  }

  &.active {
    background: #fa8334;
    color: #fff;
  }

  .edit-icon,
  .delete-icon {
    display: none;
  }

  .edit-icon {
    margin-right: 5px;
  }

  &:hover {
    .edit-icon,
    .delete-icon {
      display: inline-block;
    }
  }
}

.map-info__right {
  ::v-deep .el-descriptions {
    font-size: 12px;
    margin-top: 10px;
  }

  ::v-deep .el-descriptions__title{
    font-size: 14px;
  }

  ::v-deep .el-descriptions__header {
    margin-bottom: 12px;
  }

  ::v-deep .el-descriptions__body {
    background: transparent;
  }

  ::v-deep .el-input--medium {
    font-size: 12px;
  }

  ::v-deep .el-input .el-input__inner {
    background-color: rgba(255, 255, 255, 0%);
    border: none;
    border-radius: 0;
    border-bottom: 1px solid black;
    height: 18px;
    line-height: 18px;
    font-size: 12px;
    padding: 0;
  }

  ::v-deep .el-input.is-disabled .el-input__inner {
    background-color: rgba(255, 255, 255, 0%);
    color: rgba(0, 0, 0, 85%);
    border: none;
    cursor: default;
    padding: 0;
    text-overflow: ellipsis;
  }

  ::v-deep .el-descriptions-item__label:not(.is-bordered-label) {
    min-width: 52px;
  }
}
</style>
