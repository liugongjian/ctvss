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
              v-if="!search.revertSearchFlag"
              ref="tree"
              key="device-el-tree-original"
              empty-text="暂无目录或设备"
              :data="dirList"
              node-key="id"
              highlight-current
              lazy
              :load="loadDirs"
              :props="treeProps"
              :default-expanded-keys="defaultExpandedKeys"
            >
              <span
                slot-scope="{node, data}"
                class="custom-tree-node"
                :class="{'online': data.deviceStatus === 'on'}"
              >
                <span class="node-name">
                  <svg-icon v-if="data.type !== 'dir'" :name="data.type" width="15" height="15" />
                  <span v-else class="node-dir">
                    <svg-icon name="dir" width="15" height="15" />
                    <svg-icon name="dir-close" width="15" height="15" />
                  </span>
                  <!-- <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" /> -->
                  {{ node.label }}
                  <span class="sum-icon">{{ getSums(data) }}</span>
                </span>
              </span>
            </el-tree>
            <el-tree
              v-else
              key="device-el-tree-filter"
              ref="dirTree"
              empty-text="暂无目录或设备"
              :data="dirList"
              node-key="id"
              highlight-current
              :props="treeProp"
              :current-node-key="defaultKey"
              default-expand-all
              @node-click="deviceRouter"
            >
              <span
                slot-scope="{node, data}"
                class="custom-tree-node"
                :class="{'online': data.deviceStatus === 'on'}"
              >
                <span class="node-name">
                  <svg-icon v-if="data.type !== 'dir' && data.type !== 'platformDir'" :name="data.type" width="15" height="15" />
                  <span v-else class="node-dir">
                    <svg-icon name="dir" width="15" height="15" />
                    <svg-icon name="dir-close" width="15" height="15" />
                  </span>
                  <status-badge v-if="data.type === 'ipc'" :status="data.streamStatus" />
                  {{ node.label }}
                  <span class="sum-icon">{{ getSums(data) }}</span>
                  <span class="alert-type">{{ renderAlertType(data) }}</span>
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
              <el-button size="small" @click="changeTitleShow()">隐藏/显示信息栏</el-button>
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
import { Component, Watch, Mixins, Provide } from 'vue-property-decorator'
import IndexMixin from '@/views/device/mixin/indexMixin'
import { DeviceModule } from '@/store/modules/device'
import CreateDir from '@/views/device/components/dialogs/CreateDir.vue'
import SortChildren from '@/views/device/components/dialogs/SortChildren.vue'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { renderAlertType, getSums } from '@/utils/device'
import { VGroupModule } from '@/store/modules/vgroup'
import MapView from './mapview.vue'
import { getAMapLoad } from './models/vmap'

@Component({
  name: 'Map',
  components: {
    CreateDir,
    StatusBadge,
    SortChildren,
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
  private hideTitle = false
  private form = {
    name: '',
    longitude: '',
    latitude: ''
  }
  private mapList = []
  private markerList = []
  private curMap = {}
  private test = 4
  @Watch('$route.query')
  private onRouterChange() {
    !this.defaultKey && this.gotoRoot()
  }

  @Watch('currentGroupId', { immediate: true })
  private onCurrentGroupChange(groupId: string, oldGroupId: string) {
    this.search = {
      ...this.search,
      inputKey: '',
      searchKey: '',
      statusKey: 'all',
      revertSearchFlag: false
    }
    if (!groupId) return
    this.$nextTick(() => {
      if (oldGroupId || !this.defaultKey) {
        this.gotoRoot()
      }
      this.initDirs()
    })
  }
  @Provide('gotoRoot')
  private async gotoRoot() {
    const dirTree: any = this.$refs.dirTree
    dirTree.setCurrentKey(null)
    await DeviceModule.ResetBreadcrumb()
    await VGroupModule.resetVGroupInfo()
    this.deviceRouter({
      id: '0',
      type: 'dir'
    })
  }
  changeTitleShow() {
    this.hideTitle = !this.hideTitle;
  }
  changeEdit() {
    this.isEdit = !this.isEdit
    this.$refs.mapview.changeEdit(this.isEdit);
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
  mounted() {
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
.mapwrap{
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
