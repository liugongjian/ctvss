<template>
  <div v-loading="loading.group" class="app-container">
    <el-card ref="deviceWrap" class="device-list-wrap">
      <div
        class="device-list"
        :style="{ height: `${maxHeight + 35}px` }"
        :class="{
          'device-list--collapsed': !isExpanded,
          'device-list--dragging': dirDrag.isDragging
        }"
      >
        <el-button class="device-list__expand" @click="toggledirList">
          <svg-icon name="hamburger" />
        </el-button>
        <div
          class="device-list__handle"
          :style="`left: ${dirDrag.width}px`"
          @mousedown="changeWidthStart($event)"
        />
        <div
          ref="dirList"
          class="device-list__left"
          :style="`width: ${dirDrag.width}px`"
        >
          <el-button class="map__add" size="small" @click="openMapEditDialog()">
            添加地图
          </el-button>
          <el-card v-if="curMap" ref="mapList" class="map__user">
            <div v-for="map in mapList" :key="map.mapId">
              <div
                class="choose-map"
                :class="map.mapId === curMap.mapId ? 'active' : ''"
                @click="chooseMap(map)"
              >
                <el-tooltip :content="map.name" placement="top">
                  <span class="map-text">{{ map.name }}</span>
                </el-tooltip>
                <div>
                  <!-- <span class="edit-icon"><svg-icon name="mark" @click.stop="editMark(map)" /></span> -->
                  <span class="edit-icon"><svg-icon name="edit" @click.stop="openMapEditDialog(map)" /></span>
                  <span class="delete-icon"><svg-icon name="delete" @click.stop="deleteMap(map)" /></span>
                </div>
              </div>
            </div>
          </el-card>
          <div class="device-tree__title">
            <span class="device-tree__text">设备树</span>
            <span class="device-tree__refresh" @click="refreshDir">
              <svg-icon name="refresh" />
            </span>
          </div>
          <div
            v-loading="loading.dir"
            class="dir-list__tree device-list__max-height el-tree__content"
            :style="{ height: `${maxHeight - 230}px` }"
          >
            <el-tree
              ref="dirTree"
              :key="treeKey"
              node-key="id"
              lazy
              :load="loadDirs"
              :props="treeProp"
              :check-strictly="false"
            >
              <span
                slot-scope="{ data }"
                class="custom-tree-node"
                :class="{ online: data.deviceStatus === 'on' }"
                @click.stop.prevent="deviceClick(data)"
              >
                <span class="node-name">
                  <status-badge
                    v-if="data.streamStatus"
                    :status="data.streamStatus"
                  />
                  <svg-icon :name="data.type" />
                  <span
                    class="node-label"
                    @mousedown="
                      (e) => {
                        mousedownHandle(e, data)
                      }
                    "
                  >{{ data.name }}</span>
                  <svg-icon
                    v-if="data.isLeaf && mapDeviceIds.indexOf(data.id) >= 0"
                    name="mark"
                  />
                  <span class="sum-icon" />
                </span>
                <el-tooltip content="添加该点位至地图" placement="top">
                  <span
                    v-if="data.isLeaf && mapDeviceIds.indexOf(data.id) < 0"
                    v-show="curMap && !showMapConfig"
                    class="node-option"
                    @click.stop.prevent="addMarker(data)"
                  >+</span>
                </el-tooltip>
                <el-tooltip content="将该点位从地图中移除" placement="top">
                  <span
                    v-if="data.isLeaf && mapDeviceIds.indexOf(data.id) >= 0"
                    v-show="!showMapConfig"
                    class="node-option"
                    @click.stop.prevent="deleteMarker(data)"
                  >-</span>
                </el-tooltip>
              </span>
            </el-tree>
          </div>
        </div>
        <div class="device-list__right">
          <div v-if="curMap" class="tools">
            <span class="left">
              <span class="btn-edit tools-item" @click="changeEdit(!isEdit)">{{
                isEdit ? '完成编辑' : '开启编辑'
              }}</span>
              <template v-if="isEdit">
                <div class="device-list__right__handleBox">
                  <el-tooltip
                    v-for="item in toolType"
                    :key="item.name"
                    :content="item.text"
                    placement="top"
                  >
                    <span
                      class="device-list__right__handleBox__tools"
                      :class="{ active: toolState === item.tool }"
                      @click="changeToolState(item.tool)"
                    >
                      <svg-icon :name="item.name" />
                    </span>
                  </el-tooltip>
                </div>
              </template>

              <el-tooltip
                v-if="!isEdit"
                content="关闭所有播放窗口"
                placement="top"
              >
                <span class="tools-item"><svg-icon name="close-all" @click="closeAllWindow()" /></span>
              </el-tooltip>

              <el-tooltip content="属性" placement="top">
                <span class="tools-item">
                  <svg-icon
                    v-if="showInfo"
                    name="unfold"
                    class="device-list__activeSvg"
                    @click="showInfo = false"
                  />
                  <svg-icon v-else name="fold" @click="showInfo = true" />
                </span>
              </el-tooltip>
              <el-tooltip content="进入全屏" placement="top">
                <span class="tools-item">
                  <svg-icon name="fullscreen" @click="fullscreenMap" />
                </span>
              </el-tooltip>
            </span>
          </div>
          <div
            class="device-list__max-height"
            :style="{ height: `${maxHeight}px` }"
          >
            <el-dialog
              title="修改地图"
              :visible.sync="modifyMapDialog"
              class="dialog-text"
            >
              <div>
                <h3>确定覆盖“{{ curMap && curMap.name }}”的属性？</h3>
              </div>
              <div>
                <el-checkbox v-model="modifyMapForm.center">
                  中心坐标
                </el-checkbox>
                <el-checkbox v-model="modifyMapForm.zoom">缩放</el-checkbox>
              </div>
              <span slot="footer" class="dialog-footer">
                <el-button @click="modifyMapDialog = false">取消</el-button>
                <el-button type="primary" @click="modifyMap">确定</el-button>
              </span>
            </el-dialog>

            <el-dialog
              title="添加监控点位"
              :visible.sync="addPositionDialog"
              class="dialog-text"
              :before-close="cancelAddMark"
            >
              <div>
                <h3>是否继承设备中的经纬度</h3>
                <h3>如不继承则使用地图当前的中心经纬度</h3>
              </div>
              <h3>
                <el-checkbox v-model="addPositionDialogCheck">
                  本次编辑不再询问
                </el-checkbox>
              </h3>
              <el-button @click="confirmAddMarker(true)">继承</el-button>
              <el-button @click="confirmAddMarker(false)">不继承</el-button>
              <el-button @click="cancelAddMark('addPositionDialogCheck')">
                取消
              </el-button>
            </el-dialog>

            <el-dialog
              title="添加监控点位"
              :visible.sync="dragAddPositionDialog"
              class="dialog-text"
              :before-close="cancelAddMark"
            >
              <div>
                <h3>是否继承设备中的经纬度</h3>
                <h3>如不继承则使用鼠标所在的经纬度</h3>
              </div>
              <h3>
                <el-checkbox v-model="dragAddPositionDialogCheck">
                  本次编辑不再询问
                </el-checkbox>
              </h3>
              <el-button @click="confirmAddMarker(true)">继承</el-button>
              <el-button @click="confirmDragAddPosition">不继承</el-button>
              <el-button @click="cancelAddMark('dragAddPositionDialogCheck')">
                取消
              </el-button>
            </el-dialog>

            <el-dialog
              title="添加监控点位"
              :visible.sync="addNoPositionDialog"
              class="dialog-text"
              :before-close="cancelAddMark"
            >
              <div>
                <h3>本设备未设置经纬度，是否使用地图当前的中心经纬度？</h3>
              </div>
              <h3>
                <el-checkbox v-model="addNoPositionDialogCheck">
                  本次编辑不再询问
                </el-checkbox>
              </h3>
              <el-button @click="confirmAddZeroMarker">确定</el-button>
              <el-button @click="cancelAddMark('addNoPositionDialogCheck')">
                取消
              </el-button>
            </el-dialog>

            <el-dialog
              title="添加监控点位"
              :visible.sync="dragAddNoPositionDialog"
              class="dialog-text"
              :before-close="cancelAddMark"
            >
              <div>
                <h3>本设备未设置经纬度，是否使用鼠标所在的经纬度？</h3>
              </div>
              <h3>
                <el-checkbox v-model="dragAddNoPositionDialogCheck">
                  本次编辑不再询问
                </el-checkbox>
              </h3>
              <el-button @click="confirmDragAddZeroMarker">确定</el-button>
              <el-button @click="cancelAddMark('dragAddNoPositionDialogCheck')">
                取消
              </el-button>
            </el-dialog>

            <el-dialog
              title="添加监控点位"
              :visible.sync="addRoleDeviceDialog"
              class="dialog-text"
              :before-close="cancelAddMark"
            >
              <div>
                <h3>
                  本设备是其他用户通过角色分享的设备，并且未设置经纬度，无法添加到地图中。
                </h3>
              </div>
              <h3></h3>
              <el-button @click="cancelAddMark">确定</el-button>
            </el-dialog>

            <div
              :class="[
                'mapwrap',
                showTitle ? '' : 'hide-title',
                isAddCustom ? 'in-add' : ''
              ]"
            >
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
                <el-button type="primary" @click="openMapEditDialog()">
                  添加地图
                </el-button>
              </div>
              <div v-show="showInfo" class="map-info__right">
                <custom-info
                  v-if="customInfoType"
                  :key="customInfoType"
                  :is-add="isAddCustom"
                  :is-edit="isEdit"
                  :custom-info-type="customInfoType"
                  @delete="handleCustomDelete"
                  @change="handleCustomChange"
                  @save="changeMapInfos"
                />
              </div>
            </div>
          </div>
          <map-config
            v-if="showMapConfig"
            :info="mapConfigInfo"
            @close="showMapConfig = false"
            @changeMap="addOrEditMap"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import IndexMixin from '../device/mixin/indexMixin'
// import { getGroups } from '@/api/group'
import { renderAlertType, getSums } from '@/utils/device'
// import { getDeviceTree, getDevice } from '@/api/device'
import { getDevice } from '@vss/device/api/device'
import StatusBadge from '@/components/StatusBadge/index.vue'
import MapView from './MapView.vue'
import { getMaps, deleteMap, modifyMap } from '@/api/map'
import { mapObject } from '@/views/Map/models/VMap'
import CustomInfo from './components/CustomInfo/index.vue'
import MapConfig from './MapConfig.vue'
import { MapModule } from '@/store/modules/map'
import { getNodeInfo } from '@vss/device/api/dir'
import { DirectoryTypeEnum } from '@vss/device/enums/index'
import { VideoDevice } from '@vss/device/type/Device'
import * as dicts from '@vss/device/dicts'
import { FullscreenTypeEnum } from '@vss/device/enums/screen'
import { ScreenModule } from '@vss/device/store/modules/screen'

@Component({
  name: 'Map',
  components: {
    StatusBadge,
    MapView,
    CustomInfo,
    MapConfig
  }
})
export default class extends Mixins(IndexMixin) {
  public $refs: {
    mapview: MapView
    dirTree: any
    mapform: any
    deviceWrap: any
    mapList: any
  }
  private renderAlertType = renderAlertType
  private getSums = getSums
  private mapConfigInfo = null
  private editDialog = false
  private deleteDialog = false
  private deletesDialog = false
  private isEdit = false
  private editValue = 'sss'
  // public breadcrumb: Array<any> = []
  private showTitle = false
  private showInfo = false
  private firstShowMarkerInfo = true
  private addPositionDialog = false // 显示询问本次编辑要不要继承设备坐标的对话弹窗
  private addPositionDialogCheck = false // 是否询问本次编辑要不要继承设备坐标
  private dragAddNoPositionDialogCheck = false
  private uselnglat = true // 是否要继承设备坐标
  private addNoPositionDialog = false
  private dragAddPositionDialog = false
  private dragAddPositionDialogCheck = false
  private addNoPositionDialogCheck = false
  private dragAddNoPositionDialog = false
  private addRoleDeviceDialog = false // 添加虚拟目录下的无经纬度设备的提示
  private deviceInfo: any = {}
  private markerInfo: any = {}
  private dragNodeInfo: any = {}
  private ifDragging = false
  private customInfoType = ''

  private form = {
    mapId: '',
    name: '',
    longitude: '',
    latitude: '',
    zoom: 12,
    mask: false
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
    const zoomGrade = Math.round(this.form.zoom)
    return map[zoomGrade]
  }
  private rules = {
    name: [{ validator: this.validateName, trigger: 'blur' }],
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

  private validateName(rule: any, value: string, callback: Function) {
    const val = value.trim()
    if (!val.trim()) {
      callback(new Error('地图名称不能为空'))
    } else if (val.length > 64) {
      callback(new Error('地图名称过长，请输入64字以内名称'))
    } else if (/^[\s]|[\s]$/.test(value)) {
      callback(new Error('不能以空格作为名称的首尾。'))
    } else {
      callback()
    }
  }
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
    center: true,
    zoom: true
  }
  private submitting = false
  public dirList: any = []
  private deviceList: any = []
  public treeProp = {
    label: 'name',
    children: 'children',
    isLeaf: 'isLeaf'
  }
  private mapList = []
  private mapPager = {}
  private markerList = []
  private curMap = null
  private curMapInfo = null
  private overView = false
  private is3D = false
  private marker = null
  // @Prop()
  // private platformId: any = '417932083494649856'
  private typeMapping: any = {
    dir: 0,
    nvr: 1
  }

  private showMapConfig = false

  private toolType = [
    {
      name: 'pointer',
      text: '指针工具',
      tool: 'pointer'
    },
    {
      name: 'polygon',
      text: '多边形工具',
      tool: 'polygon'
    },
    {
      name: 'interest',
      text: '兴趣点工具',
      tool: 'interest'
    },
    {
      name: 'font',
      text: '文本工具',
      tool: 'font'
    }
  ]
  private toolState = 'pointer' // 当前工具栏状态

  private treeKey = 'ct' + new Date().getTime()

  private get isAddCustom() {
    return this.toolState !== 'pointer'
  }

  @Watch('curMap')
  private curmapChange() {
    MapModule.SetMapInfo(this.curMap)
  }

  /**
   * 目录初始化
   */
  // public async initDirs() {
  //   try {
  //     this.loading.dir = true
  //     const res = await getGroups({
  //       pageSize: 1000
  //     })
  //     this.dirList = []
  //     res.groups.forEach((group: any) => {
  //       // 放开rtsp rtmp
  //       // (group.inProtocol === 'gb28181' || group.inProtocol === 'ehome' || group.inProtocol === 'vgroup') && (
  //       this.dirList.push({
  //         id: group.groupId,
  //         groupId: group.groupId,
  //         label: group.groupName,
  //         inProtocol: group.inProtocol,
  //         type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group',
  //         disabled: false,
  //         groupStats: group.groupStats,
  //         path: [{
  //           id: group.groupId,
  //           label: group.groupName,
  //           type: group.inProtocol === 'vgroup' ? 'vgroup' : 'top-group'
  //         }]
  //       })
  //     })
  //   } catch (e) {
  //     this.dirList = []
  //   } finally {
  //     this.loading.dir = false
  //   }
  // }

  @Watch('$route.query')
  private onRouterChange() {
    !this.defaultKey && this.gotoRoot()
  }

  /**
   * 加载目录
   */
  // public async loadDirs(node: any, resolve: Function) {
  //   if (node.level === 0) return resolve([])
  //   const dirs = await this.getTree(node)
  //   resolve(dirs)
  // }

  /**
   * 获取菜单树
   */
  // private async getTree(node: any) {
  //   try {
  //     if (node.data.type === 'role') {
  //       node.data.roleId = node.data.id
  //     } else if (node.data.type === 'group') {
  //       node.data.realGroupId = node.data.id
  //       node.data.realGroupInProtocol = node.data.inProtocol
  //     }
  //     const shareDeviceIds: any = []
  //     const devices: any = await getDeviceTree({
  //       groupId: node.data.groupId,
  //       id: node.data.type === 'top-group' || node.data.type === 'vgroup' ? 0 : node.data.id,
  //       inProtocol: node.data.inProtocol,
  //       type: node.data.type === 'top-group' || node.data.type === 'vgroup' ? undefined : node.data.type,
  //       'self-defined-headers': {
  //         'role-id': node.data.roleId,
  //         'real-group-id': node.data.realGroupId
  //       }
  //     })
  //     const dirTree: any = this.$refs.dirTree
  //     const checkedKeys = dirTree.getCheckedKeys()
  //     let dirs: any = devices.dirs.map((dir: any) => {
  //       let sharedFlag = false
  //       if (shareDeviceIds.includes(dir.id) && dir.type === 'ipc') {
  //         sharedFlag = true
  //         checkedKeys.push(dir.id)
  //         dirTree.setCheckedKeys(checkedKeys)
  //       }
  //       if (dir.type === 'ipc') {
  //         node.data.disabled = false
  //       }
  //       return {
  //         id: dir.id,
  //         groupId: node.data.groupId,
  //         label: dir.label,
  //         inProtocol: dir.inProtocol || node.data.inProtocol,
  //         isLeaf: dir.isLeaf,
  //         type: dir.type,
  //         deviceStatus: dir.deviceStatus,
  //         streamStatus: dir.streamStatus,
  //         disabled: sharedFlag,
  //         path: node.data.path.concat([dir]),
  //         sharedFlag: sharedFlag,
  //         roleId: node.data.roleId || '',
  //         realGroupId: node.data.realGroupId || '',
  //         realGroupInProtocol: node.data.realGroupInProtocol || '',
  //         onlineSize: dir.onlineSize,
  //         totalSize: dir.totalSize
  //       }
  //     })
  //     dirs = setDirsStreamStatus(dirs)
  //     return dirs
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  /**
   * 懒加载时加载节点方法
   * @param node 节点信息
   */
  public async loadDirs(node: any, resolve: Function) {
    try {
      let res
      if (node.level === 0) {
        this.loading.dir = true
        res = await getNodeInfo({
          type: DirectoryTypeEnum.Dir,
          inProtocol: 'video'
        })
        // this.deviceTree.loadChildren('01')
        this.loading.dir = false
      } else {
        res = await getNodeInfo({
          id: node.data.id,
          type: node.data.type,
          inProtocol: 'video'
        })
      }
      resolve(res.dirs)
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 刷新树
   */
  private refreshDir() {
    this.treeKey = 'ct' + new Date().getTime()
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
    const docEle: any = document.documentElement
    ScreenModule.pushFullscreenStack(FullscreenTypeEnum.Board)
    if (docEle.requestFullscreen) {
      docEle.requestFullscreen()
    } else if (docEle.webkitRequestFullScreen) {
      docEle.webkitRequestFullScreen()
    } else if (docEle.mozRequestFullScreen) {
      docEle.mozRequestFullScreen()
    } else if (docEle.msRequestFullscreen) {
      docEle.webkitRequestFullscreen()
    } else if (typeof window.ActiveXObject !== 'undefined') {
      const wscript = new ActiveXObject('WScript.Shell')
      if (wscript != null) {
        wscript.SendKeys('{F11}')
      }
    }
    mapwrap.style.position = 'fixed'
    mapwrap.style.zIndex = '2001'
    mapwrap.style.left = '0'
    mapwrap.style.top = '0'

    const mapInfo: any = document.querySelector('.map-info__right')
    mapInfo.style.top = 0
  }

  // 判断是否全屏
  private getIfFullscreen() {
    const doc: any = document
    return (
      doc.webkitIsFullScreen ||
      doc.mozFullScreen ||
      doc.msFullscreenElement ||
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullscreenElement
    )
  }

  /**
   *  地图退出全屏
   */
  private exitFullscreenMap() {
    const mapInfo: any = document.querySelector('.map-info__right')
    mapInfo.style.top = '60px'

    const mapwrap: any = document.querySelector('.mapwrap')
    mapwrap.style.position = 'initial'
    mapwrap.style.zIndex = 'initial'
    mapwrap.style.left = 'initial'
    mapwrap.style.top = 'initial'
    setTimeout(() => {
      // 设置 setTimeout 确保完全退出全屏后重新计算宽高
      this.$refs.mapview && this.$refs.mapview.adjustPlayWindowPos()
    }, 0)
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
   * 设备树 设备绑定拖拽事件(鼠标事件代替拖拽事件)
   */
  private mousedownHandle(eve: any, data: any) {
    if (
      !data.isLeaf ||
      (data.isLeaf && this.mapDeviceIds.indexOf(data.id) >= 0) ||
      this.showMapConfig
    )
      return

    this.ifDragging = true
    const { target: ele } = eve

    // 计算鼠标与目标元素的初始偏移量
    const shiftX = eve.clientX - ele.getBoundingClientRect().left
    const shiftY = eve.clientY - ele.getBoundingClientRect().top

    const cloneEle = ele.cloneNode(true)

    this.dragNodeInfo = {
      shiftX,
      shiftY,
      ele: cloneEle,
      data: data
    }

    cloneEle.style.position = 'absolute'
    cloneEle.style.zIndex = 10000
    cloneEle.style.cursor = 'move'
    document.body.append(cloneEle)
    document.body.style.userSelect = 'none'

    // 获取可拖动边界与可释放边界
    this.getBoundary()

    this.startMovePoint(eve.pageX, eve.pageY)

    document.addEventListener('mousemove', this.mousemoveHandle)
    document.addEventListener('mouseup', this.mouseupHandle)
  }

  private mousemoveHandle(eve: any) {
    this.startMovePoint(eve.pageX, eve.pageY)
  }

  /**
   * 鼠标松开
   */
  private mouseupHandle(eve: any) {
    const { pageX, pageY } = eve
    const { releaseBoundaryInfo, data } = this.dragNodeInfo

    const { startTop, startLeft, endTop, endLeft } = releaseBoundaryInfo

    // 处理可释放边界逻辑,即地图范围内可以释放
    if (
      pageX >= startLeft &&
      pageX <= endLeft &&
      pageY >= startTop &&
      pageY <= endTop
    ) {
      const pixelXInMap = pageX - startLeft
      const pixelYInMap = pageY - startTop

      const pixel = new AMap.Pixel(pixelXInMap, pixelYInMap)
      const lnglat = this.$refs.mapview.vmap.map.containerToLngLat(pixel)

      const { lat, lng } = lnglat

      this.dragNodeInfo.lat = lat
      this.dragNodeInfo.lng = lng

      document.body.style.userSelect = 'auto'

      this.addMarker(data)
    } else {
      this.ifDragging = false
      this.dragAddNoPositionDialog = false
    }

    this.dragNodeInfo.ele.remove()
    document.body.style.userSelect = 'auto'
    this.dragNodeInfo.ele.cursor = 'auto'

    document.removeEventListener('mousemove', this.mousemoveHandle)
    document.removeEventListener('mouseup', this.mouseupHandle)
  }

  private getBoundary() {
    // 获取范围，需要处理边界
    const releaseBoundaryWrap = document
      .querySelector('.mapwrap')
      .getBoundingClientRect()
    const moveBoundaryWrap = document
      .querySelector('.device-list')
      .getBoundingClientRect()
    const { top, left, right, bottom } = releaseBoundaryWrap
    const {
      top: topM,
      left: leftM,
      right: rightM,
      bottom: bottomM
    } = moveBoundaryWrap

    // 有效可释放边界，地图范围
    this.dragNodeInfo.releaseBoundaryInfo = {
      startTop: top,
      startLeft: left,
      endTop: bottom,
      endLeft: right
    }
    // 有效可拖动边界，页面有效区域
    this.dragNodeInfo.moveBoundaryInfo = {
      startTop: topM + 40,
      startLeft: leftM,
      endTop: bottomM,
      endLeft: rightM // 如果影响右侧滚动条，需要  减去 （ele的宽度除以2）
    }
  }

  /**
   * 鼠标按住的移动事件
   */
  private startMovePoint(pageX: number, pageY: number) {
    const { ele, shiftX, shiftY } = this.dragNodeInfo
    const { startTop, startLeft, endTop, endLeft } =
      this.dragNodeInfo.moveBoundaryInfo

    // 在边界内，则任意移动
    if (
      pageX > startLeft &&
      pageX < endLeft &&
      pageY > startTop &&
      pageY < endTop
    ) {
      ele.style.left = `${pageX - shiftX}px`
      ele.style.top = `${pageY - shiftY}px`
    } else {
      // 边界外，取一个最大值，一个移动值
      // 左右移动 超出边界
      if (pageX >= startLeft && pageX <= endLeft) {
        ele.style.left = `${pageX - shiftX}px`
      } else if (pageX > endLeft) {
        ele.style.left = `${endLeft - shiftX}px`
      } else if (pageX < startLeft) {
        ele.style.left = `${startLeft - shiftX}px`
      }

      // 上下移动 超出边界
      if (pageY >= startTop && pageY <= endTop) {
        ele.style.top = `${pageY - shiftY}px`
      } else if (pageY > endTop) {
        ele.style.top = `${endTop - shiftY}px`
      } else if (pageY < startTop) {
        ele.style.top = `${startTop - shiftY}px`
      }
    }
  }

  /**
   * 当设备被选中时回调，将选中的设备列出
   */
  private onCheckDevice() {
    const dirTree: any = this.$refs.dirTree
    const nodes = dirTree.getCheckedNodes()
    this.deviceList = nodes.filter((node: any) => {
      return node.type === 'ipc' && !node.sharedFlag
    })
  }

  private handleMapClick(infos) {
    const { type, info } = infos
    this.customInfoType = type
    switch (type) {
      case 'map':
        // this.showInfo = false
        break
      case 'marker':
        if (this.firstShowMarkerInfo) {
          this.showInfo = true
          this.firstShowMarkerInfo = false
        }
        MapModule.SetMarkerInfo(info)
        break
      case 'interest':
        MapModule.SetInterestInfo(info)
        break
      case 'font':
        MapModule.SetFontInfo(info)
        break
      case 'polygon':
        MapModule.SetPolygonInfo(info)
        break
    }
  }

  private changeToolState(type) {
    if (this.toolState !== type) {
      this.toolState = type
      this.$refs.mapview.changeMapClickEvent(type)
      switch (type) {
        case 'interest':
          MapModule.ResetInterestInfo()
          this.showInfo = true
          this.customInfoType = type
          break
        case 'font':
          MapModule.ResetFontInfo()
          this.showInfo = true
          this.customInfoType = type
          break
        case 'polygon':
          MapModule.ResetPolygonInfo()
          this.showInfo = true
          this.customInfoType = type
          break
        case 'pointer':
          // this.showInfo = false
          this.customInfoType = 'map'
          break
      }
    }
  }

  handleMarksChange(list) {
    this.markerList = list
  }

  private get mapDeviceIds() {
    return this.markerList.map((marker) => marker.deviceId)
  }

  changeEdit(state) {
    this.isEdit = state
    this.addPositionDialogCheck = false
    this.addNoPositionDialogCheck = false
    this.dragAddNoPositionDialogCheck = false
    this.dragAddPositionDialogCheck = false
    this.changeToolState('pointer')
    const mapview = this.$refs.mapview
    mapview && mapview.changeMapClickEvent('pointer')
    if (!this.isEdit) {
      const interType = ['interest', 'font', 'polygon']
      if (interType.includes(this.customInfoType)) {
        this.customInfoType = 'map'
        // this.showInfo = false
        this.$refs.mapview.cancleInterest()
      }
    }
  }

  cancelAddMark() {
    this.ifDragging = false
    this.addPositionDialog = false
    this.addPositionDialogCheck = false
    this.addNoPositionDialog = false
    this.addNoPositionDialogCheck = false
    this.dragAddNoPositionDialog = false
    this.dragAddNoPositionDialogCheck = false
    this.addRoleDeviceDialog = false
  }

  addMarker(marker) {
    if (!this.isEdit) {
      this.$msgbox({
        title: '开始编辑',
        message: '当前为查看模式，是否确定进入编辑模式？',
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          this.isEdit = true
          this.handleMarkerOn(marker)
        })
        .catch(() => {
          console.log('取消进入编辑模式')
        })
    } else {
      this.handleMarkerOn(marker)
    }
  }

  private async handleMarkerOn(marker) {
    this.marker = marker
    await this.getDeviceInfo()

    if (
      Number(this.deviceInfo.deviceLongitude) &&
      Number(this.deviceInfo.deviceLatitude)
    ) {
      if (this.ifDragging) {
        if (!this.dragAddPositionDialogCheck) {
          this.dragAddPositionDialog = true
        } else {
          this.confirmAddMarker(this.uselnglat)
        }
      } else {
        if (!this.addPositionDialogCheck) {
          this.addPositionDialog = true
        } else {
          this.confirmAddMarker(this.uselnglat)
        }
      }
    } else if (this.deviceInfo.device.isRoleShared) {
      this.addRoleDeviceDialog = true
    } else {
      if (this.ifDragging) {
        if (!this.dragAddNoPositionDialogCheck) {
          this.dragAddNoPositionDialog = true
        } else {
          this.confirmDragAddZeroMarker()
        }
      } else {
        if (!this.addNoPositionDialogCheck) {
          this.addNoPositionDialog = true
        } else {
          this.confirmAddZeroMarker()
        }
      }
    }
  }

  private async getDeviceInfo() {
    const { id } = this.marker
    this.deviceInfo = await getDevice({
      deviceId: id
    })
    const deviceLabel = this.deviceInfo.device.deviceName
    const inVideoProtocol =
      this.deviceInfo.videos &&
      this.deviceInfo.videos.length &&
      this.deviceInfo.videos[0]?.inVideoProtocol
    const videoInfo: VideoDevice =
      inVideoProtocol &&
      this.deviceInfo.videos[0][
        dicts.InVideoProtocolModelMapping[inVideoProtocol]
      ]
    const streamInfo =
      videoInfo &&
      videoInfo.streams.length &&
      videoInfo.streams.find(
        (stream) => stream.streamNum === videoInfo.deviceStreamPullIndex
      )
    const deviceStatus = videoInfo && videoInfo.deviceStatus

    this.markerInfo = {
      deviceId: this.deviceInfo.device.deviceId,
      dirId: this.deviceInfo.device.dirId,
      inProtocol: inVideoProtocol,
      deviceType: this.deviceInfo.device.deviceType,
      deviceLabel,
      longitude: '',
      latitude: '',
      deviceStatus: deviceStatus.isOnline,
      streamStatus: streamInfo.streamStatus,
      recordStatus: streamInfo.recordStatus,
      // regionNames: this.deviceInfo.regionNames,
      // gbRegionNames: this.deviceInfo.gbRegionNames,
      viewRadius: '0',
      viewAngle: '0',
      deviceAngle: '0',
      population: '',
      houseInfo: '',
      unitInfo: '',
      deviceColor: ''
    }
  }

  private confirmAddMarker(uselnglat: boolean) {
    this.uselnglat = uselnglat
    try {
      if (
        uselnglat &&
        this.deviceInfo.device.deviceLongitude &&
        this.deviceInfo.device.deviceLatitude
      ) {
        const checklnglat =
          this.checklng(this.deviceInfo.device.deviceLongitude) &&
          this.checklat(this.deviceInfo.device.deviceLatitude)
        if (!checklnglat) {
          this.$confirm(
            '当前设备的经纬度有误，继续添加将默认设为当前地图的中心点，是否继续?',
            {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              this.markerInfo.longitude = ''
              this.markerInfo.latitude = ''
              this.$refs.mapview.addMarker(this.markerInfo)
            })
            .catch(() => {
              console.log('cancel')
            })
        } else {
          this.markerInfo.longitude = this.deviceInfo.device.deviceLongitude
          this.markerInfo.latitude = this.deviceInfo.device.deviceLatitude
          this.$refs.mapview.addMarker(this.markerInfo)
        }
      } else {
        this.$refs.mapview.addMarker(this.markerInfo)
      }
    } catch (e) {
      this.$alertError(e)
    } finally {
      this.addPositionDialog = false
      this.dragAddPositionDialog = false
      this.ifDragging = false
    }
  }

  private confirmAddZeroMarker() {
    this.$refs.mapview.addMarker(this.markerInfo)
    this.addNoPositionDialog = false
  }

  private confirmDragAddZeroMarker() {
    const { lat, lng } = this.dragNodeInfo
    this.markerInfo.longitude = lng
    this.markerInfo.latitude = lat
    this.$refs.mapview.addMarker(this.markerInfo)
    this.dragAddNoPositionDialog = false
    this.ifDragging = false
  }

  private confirmDragAddPosition() {
    const { lat, lng } = this.dragNodeInfo
    this.markerInfo.longitude = lng
    this.markerInfo.latitude = lat
    this.$refs.mapview.addMarker(this.markerInfo)
    this.dragAddPositionDialog = false
    this.ifDragging = false
  }

  deviceClick(data) {
    if (this.showMapConfig) return
    if (data.isLeaf && this.mapDeviceIds.indexOf(data.id) < 0) {
      this.$message.warning('该设备尚未添加到当前地图上')
    } else if (data.isLeaf && this.mapDeviceIds.indexOf(data.id) >= 0) {
      const marker = this.markerList.filter(
        (item) => item.deviceId === data.id
      )[0]
      this.$refs.mapview.setMapCenter(marker.longitude, marker.latitude)
      this.$refs.mapview.chooseDevice(marker)
    }
  }

  deleteMarker(marker) {
    this.$refs.mapview.handleMarkerDelete(marker.id, marker.label)
  }

  toggleMarkersShow(isOpen) {
    const flag = isOpen === 'Y'
    if (this.showTitle !== flag) {
      this.showTitle = flag
    }
  }

  toggleOverView(isOpen) {
    const flag = isOpen === 'Y'
    if (this.overView !== flag) {
      this.overView = flag
      this.$refs.mapview.toggleOverView(flag)
    }
  }
  toggleMap3D(isOpen, overViewFlag) {
    const flag = isOpen === 'Y'
    if (this.is3D !== flag) {
      this.is3D = flag
      const oflag = overViewFlag === 'Y'
      this.overView = oflag
      this.$refs.mapview.toggleMap3D(flag, oflag)
    }
  }

  addOrEditMap(infos) {
    const { type, mapinfo } = infos
    if (type === 'add') {
      this.curMap = mapinfo
      this.mapList.push(this.curMap)
      this.changeEdit(false)
      this.customInfoType = 'map'
      if (this.mapList.length > 0) {
        this.$refs.mapview.setMap(this.curMap)
        this.$refs.mapview.closeAllPlayer()
        // 跳转到新建地图位置
        this.$nextTick(() => {
          const mapItems = this.$refs.mapList.$el.querySelectorAll('.choose-map')
          const lastMapItem = mapItems[mapItems.length - 1]
          this.$refs.mapList.$el.scrollTop = lastMapItem.offsetTop
        })
      }
    } else {
      this.mapList = this.mapList.map((item) => {
        if (item.mapId === mapinfo.mapId) {
          return mapinfo
        } else {
          return item
        }
      })
      this.curMap = mapinfo
      this.$refs.mapview.setMapZoomAndCenter(
        this.curMap.zoom,
        this.curMap.longitude,
        this.curMap.latitude
      )
      this.$refs.mapview.renderMask(mapinfo.mask)
      this.$alertSuccess('地图修改成功')
    }
    this.toggleMap3D(mapinfo.dimension, mapinfo.eagle)
    this.toggleOverView(mapinfo.eagle)
    this.toggleMarkersShow(mapinfo.marker)
  }

  handleCustomDelete(infos) {
    const { type, id, info } = infos
    if (type === 'marker') {
      this.$refs.mapview.handleMarkerDelete(info.deviceId, info.deviceLabel)
    } else {
      this.$refs.mapview.deleteInterest(id, type)
    }
  }

  handleCustomChange(infos) {
    const { type, info } = infos
    switch (type) {
      case 'map':
        this.curMap = info
        this.$refs.mapview.setMapZoomAndCenter(
          info.zoom,
          info.longitude,
          info.latitude
        )
        break
      case 'marker':
        this.$refs.mapview.markerChange(info)
        break
      case 'interest':
        this.$refs.mapview.interestChange('interest', info)
        break
      case 'font':
        this.$refs.mapview.interestChange('font', info)
        break
      case 'polygon':
        this.$refs.mapview.interestChange('polygon', info)
        break
    }
  }

  changeMapInfos(map) {
    this.curMapInfo = map
    this.modifyMapDialog = true
    this.modifyMapForm = {
      center: true,
      zoom: true
    }
  }
  private closeAllWindow() {
    this.$refs.mapview.closeAllPlayer()
  }

  handleOpenMapConfig(map) {
    if (map) {
      this.mapConfigInfo = {
        mapId: map.mapId,
        name: map.name,
        longitude: map.longitude + '',
        latitude: map.latitude + '',
        zoom: Number(map.zoom),
        mask: map.mask === 'Y',
        eagle: map.eagle === 'Y',
        dimension: map.dimension === 'Y',
        marker: map.marker === 'Y'
      }
      this.mapConfigInfo.status = 'edit'
    } else {
      this.mapConfigInfo = {
        mapId: '',
        name: '',
        longitude: '',
        latitude: '',
        zoom: 12,
        mask: false,
        eagle: false,
        dimension: false,
        marker: false
      }
      this.mapConfigInfo.status = 'add'
    }
    this.showMapConfig = true
  }

  // 打开地图信息编辑弹窗 新增/修改
  private openMapEditDialog(map?: mapObject) {
    if (map && map.mapId !== this.curMap.mapId) {
      this.$confirm('本次操作将切换当前地图，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.handleChooseMap(map)
          this.handleOpenMapConfig(map)
        })
        .catch(() => {
          console.log('cancel')
        })
    } else {
      this.handleOpenMapConfig(map)
    }
  }

  /**
   * 加载地图列表
   */
  public async getMapList() {
    try {
      const params: any = {
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

  private handleChooseMap(map) {
    if (!map) {
      this.curMap = null
      return
    }
    this.showMapConfig = false
    this.curMap = map
    this.changeEdit(false)
    this.customInfoType = 'map'
    this.toggleMap3D(map.dimension, map.eagle)
    this.toggleOverView(map.eagle)
    this.toggleMarkersShow(map.marker)
    this.$refs.mapview.setMap(map)
    this.$refs.mapview.closeAllPlayer()
  }

  private chooseMap(map) {
    if (this.showMapConfig) {
      const option = this.mapConfigInfo.status === 'edit' ? '编辑' : '新建'
      this.$confirm(`是否放弃本次${option}操作？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.handleChooseMap(map)
        })
        .catch(() => {
          console.log('cancel')
        })
    } else {
      this.handleChooseMap(map)
    }
  }

  private deleteMap(map) {
    this.$alertDelete({
      type: '地图',
      msg: `确定删除"${map.name}"?`,
      method: deleteMap,
      payload: { mapId: map.mapId },
      onSuccess: () => {
        this.mapList = this.mapList.filter((item) => item.mapId !== map.mapId)
        if (this.mapList.length && this.curMap.mapId === map.mapId) {
          // this.curMap = this.mapList[0] || null
          this.handleChooseMap(this.mapList[0])
        }
        if (!this.mapList.length) {
          this.markerList = []
          this.curMap = null
        }
      }
    })
  }
  private handleMapInfo(info) {
    this.curMap = info
  }

  private async modifyMap() {
    let checklnglat = true
    let checkzoom = true
    const originMap = this.mapList.filter(
      (item) => item.mapId === this.curMap.mapId
    )[0]
    try {
      const params = { ...originMap }
      if (this.modifyMapForm.center) {
        params.longitude = this.curMapInfo.longitude.toString()
        params.latitude = this.curMapInfo.latitude.toString()
        checklnglat =
          this.checklng(params.longitude) && this.checklat(params.latitude)
      }
      if (this.modifyMapForm.zoom) {
        params.zoom = this.curMapInfo.zoom.toString()
        checkzoom = this.checkZoom(params.zoom)
      }
      if (checklnglat && checkzoom) {
        await modifyMap(params)
        this.curMap = params
        this.mapList = this.mapList.map((item) => {
          if (item.mapId === params.mapId) {
            return params
          } else {
            return item
          }
        })
        this.$refs.mapview.setMapZoomAndCenter(
          this.curMap.zoom,
          this.curMap.longitude,
          this.curMap.latitude
        )
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
    await this.getMapList()
    if (this.mapList.length > 0) {
      this.curMap = this.mapList[0]
      this.customInfoType = 'map'
      this.is3D = this.curMap.dimension === 'Y'
      this.overView = this.curMap.eagle === 'Y'
      this.toggleMarkersShow(this.curMap.marker)
    }
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

.device-list__left,
.device-list__right {
  position: relative;
}

.device-list__right {
  &__handleBox {
    background-color: #e2e2e2;
    padding: 5px 15px;
    margin-right: 20px;
    border-radius: 5px;

    &__tools {
      display: inline-block;
      width: 40px;
      margin-right: 0;
      text-align: center;
      cursor: pointer;

      &.active {
        color: #fa8334;
      }

      &:not(:last-child) {
        border-right: 1px solid #d3d3d3;
      }
    }
  }
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
  cursor: pointer;
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
    font-size: 18px;
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
    transition: margin-left 0.3s;
    margin-left: auto;

    .tools-item {
      margin-right: 20px;
    }
  }
}

.device-list {
  &__activeSvg {
    fill: #fa8334;
  }
}

.device-list--collapsed .tools .left {
  margin-left: 50px;
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

.dialog-text .mask {
  text-align: left;
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
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  padding: 0 10px;
  border-radius: 5px;
  cursor: pointer;

  .map-text {
    flex: 1;
    text-align: left;
    overflow: hidden;
    max-width: 140px;
    white-space: nowrap;
    text-overflow: ellipsis;
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
  position: absolute;
  top: 60px;
  right: 20px;
  background: rgba(255, 255, 255, 50%);
  width: 246px;
  height: calc(100% - 80px);
  border: 1px solid #d3d3d3;
  border-radius: 5px;
  overflow: auto;
  z-index: 10;
  backdrop-filter: blur(3px);

  /* ::v-deep .el-descriptions {
    font-size: 12px;
    margin-top: 10px;
  }

  ::v-deep .el-descriptions__title {
    font-size: 14px;
  }

  ::v-deep .el-descriptions__header {
    margin-bottom: 12px;
  }

  ::v-deep .el-descriptions__body {
    background: transparent;
  } */

  ::v-deep .el-input--medium {
    font-size: 14px;
  }

  ::v-deep .el-input .el-input__inner {
    background-color: rgba(255, 255, 255, 0%);
    border: none;
    border-radius: 0;
    border-bottom: 1px solid black;
    height: 18px;
    line-height: 18px;
    font-size: 14px;
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
