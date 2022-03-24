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
            <div v-for="map in mapList" :key="map.mapId">
              <el-button class="choose-map" @click="chooseMap(map)">
                <span class="map-text">{{ map.name }}</span>
                <span class="edit-icon"><svg-icon name="edit" @click="editMap(map.mapId)" /></span>
                <span class="delete-icon"><svg-icon name="delete" @click="deleteMap(map)" /></span>
              </el-button>
            </div>
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
              :data="dirList"
              :load="loadDirs"
              :props="treeProp"
              :check-strictly="false"
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
          <div class="tools">
            <span class="left">
              <el-button size="small" @click="changeEdit()" class="tools-item">{{ isEdit ? '完成编辑' : '开启编辑' }}</el-button>
              <span>
                <!-- <span class="tools-item"><svg-icon name="selects" /></span> -->
                <span class="tools-item"><svg-icon name="title" @click="changeTitleShow()" /></span>
                <span class="tools-item"><svg-icon name="hawkeye" @click="toggleOverView()" /></span>
                <span class="tools-item"><svg-icon name="3d" @click="toggleMap3D()" /></span>
                <span class="tools-item"><svg-icon size="30" name="mark" @click="toggleMarkersShow()" /></span>
                <span class="tools-item"><svg-icon name="close-all" /></span>
                <!-- <span class="tools-item"><svg-icon name="magnifier" /></span> -->
                <!-- <span class="tools-item tools-item__cup">|</span>
                <span class="tools-item"><svg-icon name="player" /></span>
                <span class="tools-item"><svg-icon name="play-video" /></span>
                <span class="tools-item"><svg-icon name="delete" /></span> -->
              </span>
            </span>
            <span class="right">
              <span class="tools-item"><svg-icon name="toggle-show" @click="showInfo = !showInfo" /></span>
            </span>
          </div>
          <div class="device-list__max-height" :style="{height: `${maxHeight}px`}">
            <el-dialog title="添加地图" :visible.sync="dialogVisible" width="45%">
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
                <el-form-item>
                  <div class="block">
                    <span class="demonstration">默认缩放级别</span>
                    <el-slider v-model="form.zoom" :min="3" :max="18" />
                  </div>
                </el-form-item>
                <el-form-item>
                  <div class="footer">
                    <el-button type="primary" @click="addMap"> 确定 </el-button>
                    <el-button @click="dialogVisible = false">取消</el-button>
                  </div>
                </el-form-item>
              </el-form>
            </el-dialog>
            <el-dialog title="修改地图" :visible.sync="modifyMapDialog" class="dialog-text">
              <div>
                <h3>确定覆盖“{{ curMapInfo && curMapInfo.name }}”的属性？</h3>
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
                <h3>如不继续则使用鼠标所在的经纬度</h3>
              </div>
              <el-checkbox v-model="checked">本次编辑不再询问</el-checkbox>
              <el-button @click="addPositionDialog = false">继承</el-button>
              <el-button @click="addPositionDialog = false">不继承</el-button>
              <el-button @click="addPositionDialog = false">取消</el-button>
            </el-dialog>
            <el-dialog title="开始编辑" :visible.sync="editDialog">
              <div>
                <h3>当前为查看模式，是否确定进入编辑模式？</h3>
              </div>
              <el-checkbox v-model="checked">本次编辑不再询问</el-checkbox>
              <div class="footer">
                <el-button @click="editDialog = false">确定</el-button>
                <el-button @click="editDialog = false">取消</el-button>
              </div>
            </el-dialog>
            <el-dialog title="删除监控点位" :visible.sync="deleteDialog">
              <div>
                <h3>确定在地图中删除监控点位"IPC1"？</h3>
              </div>
              <el-button @click="deleteDialog = false">确定</el-button>
              <el-button @click="deleteDialog = false">取消</el-button>
            </el-dialog>
            <el-dialog title="批量删除监控点位" :visible.sync="deletesDialog">
              <div>
                <h3>确定在地图中删除以下3个监控点位？</h3>
              </div>
              <el-button @click="deletesDialog = false">确定</el-button>
              <el-button @click="deletesDialog = false">取消</el-button>
            </el-dialog>
            <!--<div><img src="./dashboard.png" alt=""></div>-->
            <div :class="['mapwrap', hideTitle?'hide-title':'']">
              <map-view
                v-if="mapList.length > 0 && curMap"
                ref="mapview"
                :map-option="curMap"
                @mapChange="modifyMapInfo"
                @mapClick="handleMapClick"
              />
              <div v-else class="init-map">
                <el-button @click="dialogVisible = true">添加地图</el-button>
              </div>
            </div>
            <div v-show="showInfo" class="map-info__right">
              <div v-show="showMapInfo">
                <map-info :map="curMapInfo" @save="modifyMapDialog = true"/>
              </div>
              <div v-show="!showMapInfo">
                <point-info :is-edit="isEdit" :marker="curMarkInfo" />
                <!-- <selected-point /> -->
              </div>
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
import { describeShareDevices, getPlatforms } from '@/api/upPlatform'
import { getDeviceTree } from '@/api/device'
import { describeShareDevices } from '@/api/upPlatform'
import {getDeviceEvents, getDevices, getDeviceTree} from '@/api/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import MapView from './mapview.vue'
import PointInfo from './components/PointInfo.vue'
import SelectedPoint from './components/SelectedPoint.vue'
import MapInfo from './components/MapInfo.vue'
// import { getAMapLoad } from './models/vmap'
import { getMaps, createMap, deleteMap, modifyMap } from '@/api/map'

@Component({
  name: 'Map',
  components: {
    StatusBadge,
    MapView,
    MapInfo,
    PointInfo,
    SelectedPoint
  }
})
export default class extends Mixins(IndexMixin) {
  private renderAlertType = renderAlertType
  private getSums = getSums
  private dialogVisible = false
  private addPositionDialog = false
  private editDialog = false
  private deleteDialog = false
  private deletesDialog = false
  private isEdit = false
  private editValue = 'sss'
  private breadcrumb: Array<any> = []
  private platformList: Array<any> = []
  private hideTitle = false
  private showInfo = false
  private showMapInfo = true
  private marker = {
    deviceId: '399422801670782976',
    inProtocol: 'rtmp',
    deviceType: 'ipc',
    deviceLabel: 'ipc006',
    longitude: 121.487207,
    latitude: 31.225348,
    viewRadius: '0',
    viewAngle: '0',
    deviceAngle: '0',
    population: 'xx',
    houseInfo: 'xx',
    unitInfo: 'xx'
  }
  private form = {
    name: '',
    longitude: '',
    latitude: '',
    zoom: 3
  }
  private rules = {
    name: [
      { required: true, message: '请填写地图名称', trigger: 'blur' }
    ],
    longitude: [
      { required: true, message: '请填写地图经度，[-180, 180]', trigger: 'blur' },
      { validator: this.validatelng, trigger: 'blur' }
    ],
    latitude: [
      { required: true, message: '请填写地图纬度，[-90, 90]', trigger: 'blur' },
      { validator: this.validatelat, trigger: 'blur' }
    ]
  }
  private validatelng(rule: any, value: string, callback: Function) {
    const val = Number(value)
    if (isNaN(val) || val < -180 || val > 180) {
      callback(new Error('请填写正确的经度'))
    } else {
      callback()
    }
  }
  private validatelat(rule: any, value: string, callback: Function) {
    const val = Number(value)
    if (isNaN(val) || val < -90 || val > 90) {
      callback(new Error('请填写正确的纬度'))
    } else {
      callback()
    }
  }
  private modifyMapDialog = false
  private modifyMapForm = {
    center: false,
    zoom: false
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
  private mapPager = {}
  private markerList = []
  private curMap = null
  private curMapInfo = null
  private curMarkInfo = null
  private overView = false
  private showMarkers = true
  private is3D = true
  @Prop()
  private platformId: any = '417932083494649856'
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
      const result = await getPlatforms({
        pageNum: 1,
        pageSize: 1000
      })
      this.platformList = result.platforms
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
      console.log('gettree')
      if (node.data.type === 'role') {
        node.data.roleId = node.data.id
      } else if (node.data.type === 'group') {
        node.data.realGroupId = node.data.id
        node.data.realGroupInProtocol = node.data.inProtocol
      }
      let shareDeviceIds: any = []
      if (node.data.type !== 'vgroup' && node.data.type !== 'role') {
        console.log('this.platformId', this.platformId)
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

  changeTitleShow() {
    this.hideTitle = !this.hideTitle
  }

  changeEdit() {
    this.isEdit = !this.isEdit
    this.$refs.mapview.changeEdit(this.isEdit)
  }

  addMarker() {
    const marker = {
      deviceId: '399422801670782977',
      inProtocol: 'rtmp',
      deviceType: 'ipc',
      deviceLabel: 'ipc006',
      // longitude: 121.487207,
      // latitude: 31.225348,
      viewRadius: '0',
      viewAngle: '0',
      deviceAngle: '0',
      population: 'xx',
      houseInfo: 'xx',
      unitInfo: 'xx'
    }
    this.$refs.mapview.addMarker(marker)
  }

  toggleMarkersShow() {
    this.showMarkers = !this.showMarkers
    this.$refs.mapview.setMarkersView(this.showMarkers)
  }
  toggleOverView() {
    this.overView = !this.overView
    this.$refs.mapview.toggleOverView(this.overView)
  }
  toggleMap3D() {
    this.is3D = !this.is3D
    this.$refs.mapview.toggleMap3D(this.is3D)
  }

  addMap() {
    this.$refs.mapform.validate(async (valid: any) => {
      if (valid) {
        console.log(this.form)
        try {
          const map = {
            name: this.form.name,
            longitude: this.form.longitude,
            latitude: this.form.latitude,
            zoom: this.form.zoom
          }
          const res = await createMap(map)
          const mapId = res.mapId
          this.curMap = {...map, mapId}
          this.curMapInfo = this.curMap
          this.mapList.push(this.curMap)
          this.dialogVisible = false
        } catch (e) {
          this.$alertError(e.message)
        }
      } else {
        return false
      }
    })
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
    this.showMarkers = true
    this.curMap = map
    this.curMapInfo = this.curMap
  }

  private deleteMap(map) {
    this.$alertDelete({
      type: '地图',
      msg: `确定删除"${map.name}"?`,
      method: deleteMap,
      payload: { mapId: map.mapId },
      onSuccess: () => {
        this.mapList = this.mapList.filter(item => item.mapId !== map.mapId);
        if (this.curMap.mapId === map.mapId) {
          this.curMap = this.mapList[0] || null
          this.curMapInfo = this.curMap
        }
      }
    })
  }
  private modifyMapInfo(info) {
    this.curMapInfo = info
  }

  private async modifyMap() {
    try {
      const params = { ...this.curMap }
      if (this.modifyMapForm.center) {
        params.longitude = this.curMapInfo.longitude
        params.latitude = this.curMapInfo.latitude
      }
      if (this.modifyMapForm.zoom) {
        params.zoom = this.curMapInfo.zoom;
      }
      await modifyMap(params)
      this.curMap = params
      this.mapList = this.mapList.map(item => {
        if (item.mapId === params.mapId) {
          return params
        } else {
          return item
        }
      })
    } catch (e) {
      this.$alertError(e.message)
    } finally {
      this.modifyMapDialog = false
    }
  }

  calHeight() {
    const deviceWrap: any = this.$refs.deviceWrap
    const size = deviceWrap.$el.getBoundingClientRect()
    const top = size.top
    const documentHeight = document.body.offsetHeight
    this.maxHeight = documentHeight - top - 60
  }

  private async mounted() {
    this.initDirs()
    await this.getMapList()
    this.curMap = this.mapList[0]
    this.curMapInfo = this.curMap
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
  width: 20%;
  height: 100%;
  padding: 20px 0 0 20px;
}

.map-info__right .el-descriptions {
  margin-bottom: 20px;
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
  svg {
    font-size: 20px;
  }
  .left {
    .tools-item{
      margin-right: 20px;
    }
  }
}

.tools-item__cup {
  color: rgb(189, 188, 188);
}

.init-map {
  text-align: center;
  line-height: 100%;
}

.choose-map {
  width: 100%;
}

.choose-map .map-text {
  margin-right: 10px;
}

.choose-map .delete-icon {
  display: none;
}

.choose-map .edit-icon {
  display: none;
}

.choose-map:hover .delete-icon {
  display: inline-block;
  margin-right: 10px;
}

.choose-map:hover .edit-icon {
  display: inline-block;
  margin-right: 10px;
}

// .tip {
//   display: inline-block;
//   position: relative;
//   z-index: 2000;
//   background: #303133;
//   width: 50px;
//   height: 30px;
//   margin-left: 8px;
//   line-height: 30px;
//   font-size: 12px;
//   color: #FFFFFF;
//   border-radius: 4px;
//   word-wrap: break-word;
// }

// .tip:before {
//   position: absolute;
//   left: -29%;
//   top: 25%;
//   content: '';
//   color: #303133;
//   overflow: hidden;
//   pointer-events: none;
//   border: 0.6em solid transparent;
//   border-right-color: currentColor;
//   visibility: visible;
//   white-space: nowrap;
//   opacity: 1;
// }

::v-deep .el-dialog__body {
  text-align: center;
}

::v-deep .el-descriptions-item__content {
  text-align: center;
  line-height: 36px;
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
