<template>
  <div id="mapContainer">
    <div class="search-wrap">
      <el-input id="map-tip-input" v-model="mapTip" placeholder="请输入关键字" />
    </div>
    <div
      v-for="playWindowInfo in playWindowList"
      :key="playWindowInfo.deviceId"
      v-draggable:[playWindowInfo.deviceId]="{cb: changeStyle, screen: playWindowInfo.screen}"
      class="play-wrap"
      :style="playWindowInfo.style"
      :class="{'screen-container--fullscreen': isFullscreen, 'selected': playWindowInfo.selected, 'isFullscreen': playWindowInfo.screen.isFullscreen}"
      @mousedown="choosePlayer(playWindowInfo.deviceId)"
    >
      <div v-if="playWindowInfo.show !== 'none'" class="play-container">
        <i class="el-icon el-icon-close" @click="closePlayer(playWindowInfo)" />
        <live-player
          v-if="playWindowInfo.show === 'live'"
          :screen="playWindowInfo.screen"
        />
        <replay-view
          v-if="playWindowInfo.show === 'replay'"
          :screen="playWindowInfo.screen"
          :has-axis="true"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import VMap, { getAMapLoad } from './models/VMap'
import { MapModule } from '@/store/modules/map'
import axios from 'axios'
import {
  getMapDevices,
  updateMarkers,
  addMarkers,
  deleteMarkers,
  getInterestList,
  addInterestPoint,
  editInterestPoint,
  delInterestPoint
} from '@/api/map'
import { Screen } from '@/views/device/services/Screen/Screen'
import LivePlayer from '@/views/device/components/LivePlayer.vue'
import ReplayView from '@/views/device/components/ReplayPlayer/index.vue'
import draggable from '@/views/Map/directives/draggable'
import settings from './settings'

@Component({
  name: 'MapView',
  components: {
    LivePlayer,
    ReplayView
  },
  directives: {
    draggable
  }
})
export default class MapView extends Vue {
  @Prop() private mapOption: any
  @Prop() private isEdit: boolean

  public vmap = new VMap('mapContainer')
  private markerlist = []
  private mapTip = ''
  private pageTotal = 1
  private axiosSourceList = []
  private playWindowList = []
  private hightAreaList = [] // 高亮区域
  private interestBuildingList = [] // 兴趣点建筑
  private interestPointList = [] // 兴趣点

  private screen: Screen = null

  private playWindowStyle = {
    width: 400,
    height: 300
  }

  private get isFullscreen() {
    return this.playWindowList.filter(item => item.screen.isFullscreen).length > 0
  }

  private handleMapClick

  @Watch('isEdit')
  private onEditChange() {
    this.changeEdit(this.isEdit)
  }

  private mounted() {
    getAMapLoad().then(() => {
      this.setMap(this.mapOption)
      this.vmap.setInterestHandlers({
        addPoi: this.addInterestPoi,
        clickPoi: this.choosePoi,
        deletePoi: this.deleteInterest,
        changePoi: this.interestChange,
        addPolygon: this.addPolygon,
        clickPolygon: this.handlePolygonClick,
        changePolygon: this.polygonChange
      })
    })
  }

  private async getMapMarkers(pageNum) {
    let params: any = {
      pageNum,
      pageSize: 2000,
      mapId: this.mapId
    }
    try {
      const axiosSource = axios.CancelToken.source()
      this.axiosSourceList.push(axiosSource)
      const res = await getMapDevices(params, axiosSource.token)
      if (pageNum === 1) {
        this.markerlist = []
        this.axiosSourceList.forEach(axiosSource => {
          axiosSource && axiosSource.cancel()
        })
      }
      this.markerlist = this.markerlist.concat(res.devices)
      this.pageTotal = res.totalPage
    } catch (e) {
      console.log(e)
    } finally {
      this.setMarkerList(this.markerlist)
      this.$emit('markerlistChange', this.markerlist)
    }
  }

  // 获取兴趣点信息
  private async getPointList() {
    this.hightAreaList = []
    this.interestBuildingList = []
    this.interestPointList = []
    const param = {
      mapId: this.mapId,
      pageNum: 1,
      pageSize: 1000,
      tagName: ''
    }
    try {
      const res = await getInterestList(param)
      res.tags.forEach(item => {
        if (item.type === 'HighLightArea') {
          this.hightAreaList.push(item)
        } else if (item.type === 'InterestBuilding') {
          this.interestBuildingList.push(item)
        } else if (item.type === 'InterestPoint') {
          this.interestPointList.push(item)
        }
      })
    } catch (e) {
      console.log(e)
    } finally {
      this.renderPoints()
    }
  }

  // 渲染兴趣点
  public renderPoints() {
    this.renderMask(this.mapMask)
    this.vmap.renderBuilding(this.hightAreaList, this.interestBuildingList)
    this.vmap.renderPoi(this.interestPointList)
  }

  public renderMask(mask) {
    this.mapMask = mask
    this.vmap.renderCommunity(this.hightAreaList, mask)
  }

  async setMap(map) {
    this.vmap.renderMap(map)
    this.addMapEvent()
    this.mapId = map.mapId
    this.mapMask = map.mask
    this.axiosSourceList.forEach(axiosSource => {
      axiosSource && axiosSource.cancel()
    })
    await this.getMapMarkers(1)
    const promiseList = []
    let pageNum = 2
    while (pageNum <= this.pageTotal) {
      promiseList.push(this.getMapMarkers(pageNum))
      pageNum += 1
    }
    await Promise.all(promiseList)
    await this.getPointList()
  }

  public setMapCenter(lng, lat) {
    this.vmap.map.setCenter([lng, lat])
  }

  public setMapZoomAndCenter(zoom, lng, lat) {
    this.vmap.map.setZoomAndCenter(zoom, [lng, lat])
  }

  addMapEvent() {
    const map = this.vmap.map
    const getMapInfo = () => {
      const zoom = map.getZoom()
      const center = map.getCenter()
      const mapInfo = {
        mapId: this.mapOption.mapId,
        name: this.mapOption.name,
        groupByGroupId: this.mapOption.groupByGroupId,
        groupByAdjacent: this.mapOption.groupByAdjacent,
        defaultDeviceColor: this.mapOption.defaultDeviceColor,
        longitude: center.lng,
        latitude: center.lat,
        zoom
      }
      this.$emit('mapChange', mapInfo)
    }
    map.on('moveend', getMapInfo)
    map.on('zoomend', getMapInfo)
    this.changeMapClickEvent('pointer')
  }

  private choosePlayer(id) {
    this.playWindowList = this.playWindowList.map(item => {
      if (item.deviceId === id) {
        item.selected = true
      } else {
        item.selected = false
      }
      return item
    })
  }

  private handleMarkerModify(marker) {
    this.$emit('mapClick', {
      type: 'marker',
      info: marker
    })
    const appearance = marker.appearance || '{}'
    this.markerChange({
      ...marker,
      appearance: JSON.parse(appearance)
    })
  }

  public async markerChange(marker) {
    try {
      const data = {
        mapId: this.mapId,
        devices: [this.handleDevice(marker)]
      }
      await updateMarkers(data)
      const appearance = marker.appearance// || { color: this.mapOption.defaultDeviceColor }
      const mapMarker = { ...marker, appearance: JSON.stringify(appearance) }
      MapModule.SetMarkerInfo(mapMarker)
      this.markerlist = this.markerlist.map((item) => {
        if (marker.deviceId === item.deviceId) {
          item = mapMarker
          item.selected = true
        } else {
          item.selected = false
        }
        return item
      })
      this.$emit('markerlistChange', this.markerlist)
      this.vmap.updateMarkerList(this.markerlist)
      this.cancleInterest()
    } catch (e) {
      this.$alertError(e)
      console.log('修改标记点失败')
    }
  }

  private polygonChange(data) {
    const appearance = data.appearance || '{}'
    const newInterest = {
      ...data,
      appearance: JSON.parse(appearance)
    }
    this.interestChange('polygon', newInterest)
  }

  public async interestChange(type, interest) {
    try {
      const appearance = interest.appearance || { color: settings.defaultDeviceColor }
      const data = {
        ...interest,
        mapId: this.mapId,
        appearance: JSON.stringify(appearance)
      }
      await editInterestPoint(data)
      switch (type) {
        case 'interest':
          MapModule.SetInterestInfo(data)
          this.interestPointList = this.interestPointList.map((item) => {
            if (data.tagId === item.tagId) {
              item = data
            }
            return item
          })
          this.vmap.renderPoi(this.interestPointList)
          this.choosePoi(data, 'interest')
          break
        case 'font':
          MapModule.SetFontInfo(data)
          this.interestPointList = this.interestPointList.map((item) => {
            if (data.tagId === item.tagId) {
              item = data
            }
            return item
          })
          this.vmap.renderPoi(this.interestPointList)
          this.choosePoi(data, 'font')
          break
        case 'polygon':
          MapModule.SetPolygonInfo(data)
          this.handlePolygonChange(data)
          break
      }
      this.vmap.cancelChoose()
    } catch (e) {
      this.$alertError(e)
      console.log('修改兴趣点失败')
    }
  }

  private handlePolygonChange(data) {
    let oldType = ''
    if (this.hightAreaList.some((item) => data.tagId === item.tagId)) {
      oldType = 'HighLightArea'
    } else {
      oldType = 'InterestBuilding'
    }
    if (oldType === 'HighLightArea' && data.type === 'HighLightArea') {
      this.hightAreaList = this.hightAreaList.map((item) => {
        if (data.tagId === item.tagId) {
          item = data
        }
        return item
      })
      this.renderMask(this.mapMask)
    } else if (oldType === 'InterestBuilding' && data.type === 'InterestBuilding') {
      this.interestBuildingList = this.interestBuildingList.map((item) => {
        if (data.tagId === item.tagId) {
          item = data
        }
        return item
      })
      this.vmap.renderBuilding(this.hightAreaList, this.interestBuildingList)
    } else if (oldType === 'HighLightArea' && data.type === 'InterestBuilding') {
      this.hightAreaList = this.hightAreaList.filter((item) => data.tagId !== item.tagId)
      this.interestBuildingList.push(data)
      this.renderMask(this.mapMask)
      this.vmap.renderBuilding(this.hightAreaList, this.interestBuildingList)
    } else if (oldType === 'InterestBuilding' && data.type === 'HighLightArea') {
      this.interestBuildingList = this.interestBuildingList.filter((item) => data.tagId !== item.tagId)
      this.hightAreaList.push(data)
      this.renderMask(this.mapMask)
      this.vmap.renderBuilding(this.hightAreaList, this.interestBuildingList)
    }
    this.vmap.renderPolygon(this.hightAreaList, this.interestBuildingList)
    this.vmap.choosePolygon(data)
  }

  public chooseDevice(device) {
    this.vmap.chooseMarker(device)
  }

  handleMarkerClick(marker) {
    this.$emit('mapClick', {
      type: 'marker',
      info: marker
    })
  }

  closeAllPlayer() {
    this.playWindowList = []
  }

  closePlayer(info) {
    if (this.isFullscreen) {
      this.exitFullscreen()
    }
    this.playWindowList = this.playWindowList.filter(item => item.deviceId !== info.deviceId)
  }

  /**
   * 退出全屏
   */
  public exitFullscreen() {
    const doc: any = document
    if (doc.exitFullscreen) {
      doc.exitFullscreen()
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen()
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen()
    } else if (doc.webkitCancelFullScreen) {
      doc.webkitCancelFullScreen()
    }
  }

  handleMarkerPlay(data) {
    if (data.canPlay) {
      const width = this.playWindowStyle.width
      const height = this.playWindowStyle.height
      const markerHeight = 65
      const style = {
        width: `${width}px`,
        height: `${height}px`,
        top: `${data.top - height - markerHeight - 10}px`,
        left: `${data.left - width / 2}px`
      }
      const screen = new Screen()
      screen.deviceId = data.deviceId
      screen.inProtocol = data.inProtocol
      screen.isLive = data.show === 'live'
      screen.init()
      const playIndex = this.playWindowList.findIndex(item => item.deviceId === data.deviceId)
      const newPlayer = {
        ...data,
        style,
        screen
      }
      if (playIndex >= 0) {
        this.playWindowList.splice(playIndex, 1, newPlayer)
      } else {
        this.playWindowList.push(newPlayer)
      }
    }
  }

  async handleMarkerDelete(deviceId, deviceName) {
    this.$alertDelete({
      type: '监控点位',
      msg: `确定在地图中删除监控点位"${deviceName}"?`,
      method: deleteMarkers,
      payload: {
        mapId: this.mapOption.mapId,
        devices: [{ deviceId }]
      },
      onSuccess: () => {
        this.markerlist = this.markerlist.filter(item => item.deviceId !== deviceId)
        this.$emit('markerlistChange', this.markerlist)
        this.vmap.updateMarkerList(this.markerlist)
        this.$emit('mapClick', {
          type: 'map',
          info: this.mapOption
        })
      }
    })
  }

  changeEdit(status) {
    this.vmap.changeEdit(status)
    this.closeAllPlayer()
    if (status) {
      this.vmap.renderPolygon(this.hightAreaList, this.interestBuildingList)
    }
  }

  handleDevice(device) {
    const appearance = device.appearance// || { color: this.mapOption.defaultDeviceColor }
    const result = {
      deviceId: device.deviceId,
      inProtocol: device.inProtocol,
      deviceType: device.deviceType,
      deviceLabel: device.deviceLabel,
      longitude: device.longitude.toString(),
      latitude: device.latitude.toString(),
      viewRadius: device.viewRadius,
      viewAngle: device.viewAngle,
      deviceAngle: device.deviceAngle,
      population: device.population,
      houseInfo: device.houseInfo,
      unitInfo: device.unitInfo,
      gbRegionNames: device.gbRegionNames,
      groupId: device.groupId,
      deviceColor: '',
      appearance: JSON.stringify(appearance)
    }
    return result
  }

  toggleMap3D(is3D, isOverView) {
    this.vmap.change3D(is3D, isOverView)
    this.setMarkerList(this.markerlist)
    this.renderPoints()
  }

  async addMarker(markerOption) {
    const { lng, lat } = this.vmap.map.getCenter()
    if (!markerOption.longitude) {
      markerOption.longitude = lng
    }
    if (!markerOption.latitude) {
      markerOption.latitude = lat
    }
    try {
      const data = await addMarkers({
        mapId: this.mapOption.mapId,
        devices: [this.handleDevice(markerOption)]
      })
      this.vmap.addMarker(data.devices[0])
      this.$emit('markerlistChange', this.markerlist)
    } catch (e) {
      this.$alertError(e)
    }
  }

  cancleInterest() {
    this.choosePoi(null)
    this.vmap.cancelPoly(true)
  }

  choosePoi(point, type?) {
    if (point) {
      const otherPoints = document.getElementsByClassName('marker-containt')
      let len = otherPoints.length
      for (let i = 0; i < len; i += 1) {
        const nClass = otherPoints[i].getAttribute('class').replace('selected', '')
        otherPoints[i].setAttribute('class', nClass)
        otherPoints[i].parentElement.setAttribute('class', 'amap-marker')
      }
      const $point = document.getElementById(`marker-point-${point.tagId}`)
      const nClass = $point.getAttribute('class')
      $point.setAttribute('class', `${nClass} selected`)
      $point.parentElement.setAttribute('class', 'amap-marker selected')
      this.$emit('mapClick', {
        type,
        info: point
      })
    } else {
      const otherPoints = document.getElementsByClassName('marker-containt')
      let len = otherPoints.length
      for (let i = 0; i < len; i += 1) {
        // 只需要取消兴趣点位，不能取消摄像头点位
        const classes = otherPoints[i].getAttribute('class')
        if (classes.indexOf('marker-camera') < 0) {
          const nClass = classes.replace('selected', '')
          otherPoints[i].setAttribute('class', nClass)
          otherPoints[i].parentElement.setAttribute('class', 'amap-marker')
        }
      }
    }
  }

  public choosePolygon(polygon) {
    this.vmap.choosePolygon(polygon)
  }

  handlePolygonClick(polygon) {
    this.$emit('mapClick', {
      type: 'polygon',
      info: polygon
    })
  }

  async addInterestPoi(position, type) {
    let infos
    if (type === 'interest') {
      infos = MapModule.interestInfo
    } else {
      infos = MapModule.fontInfo
    }
    const { lng, lat } = position
    const param = {
      ...infos,
      mapId: this.mapId,
      points: [{ longitude: lng.toString(), latitude: lat.toString() }],
      appearance: JSON.stringify(infos.appearance)
    }
    try {
      const data = await addInterestPoint(param)
      const { tagId } = data
      // const tagId = Math.random().toString()
      const newPoint = { ...param, tagId }
      type === 'interest' ? MapModule.SetInterestInfo(newPoint) : MapModule.SetFontInfo(newPoint)
      this.interestPointList.push(newPoint)
      this.vmap.renderPoi(this.interestPointList)
      this.choosePoi(newPoint, type)
    } catch (e) {
      this.$alertError(e)
      console.log('新增失败')
    }
  }

  async addPolygon(points) {
    const infos = MapModule.polygonInfo
    const param = {
      ...infos,
      mapId: this.mapId,
      points: points.map(item => ({ longitude: item.lng.toString(), latitude: item.lat.toString() })),
      appearance: JSON.stringify(infos.appearance)
    }
    try {
      const data = await addInterestPoint(param)
      const { tagId } = data
      // const tagId = Math.random().toString()
      const newPoint = { ...param, tagId }
      MapModule.SetPolygonInfo(newPoint)
      if (newPoint.type === 'HighLightArea') {
        this.hightAreaList.push(newPoint)
        this.renderMask(this.mapMask)
      } else {
        this.interestBuildingList.push(newPoint)
        this.vmap.renderBuilding(this.hightAreaList, this.interestBuildingList)
      }
      this.vmap.renderPolygon(this.hightAreaList, this.interestBuildingList)
      this.choosePolygon(newPoint)
    } catch (e) {
      this.$alertError(e)
      console.log('新增失败')
    }
  }

  async deleteInterest(id, tagType) {
    try {
      await delInterestPoint({ tagId: id })
      this.$emit('mapClick', {
        type: 'map',
        info: this.mapOption
      })
      switch (tagType) {
        case 'InterestPoint':
          this.interestPointList = this.interestPointList.filter(item => item.tagId !== id)
          this.vmap.renderPoi(this.interestPointList)
          break
        case 'HighLightArea':
          this.hightAreaList = this.hightAreaList.filter(item => item.tagId !== id)
          this.renderMask(this.mapMask)
          this.vmap.renderPolygon(this.hightAreaList, this.interestBuildingList)
          this.vmap.cancelPoly()
          break
        case 'InterestBuilding':
          this.interestBuildingList = this.interestBuildingList.filter(item => item.tagId !== id)
          this.vmap.renderBuilding(this.hightAreaList, this.interestBuildingList)
          this.vmap.renderPolygon(this.hightAreaList, this.interestBuildingList)
          this.vmap.cancelPoly()
          break
      }
    } catch (e) {
      this.$alertError(e)
      console.log('删除失败')
    }
  }

  changeMapClickEvent(type) {
    this.$nextTick(() => {
      const map = this.vmap.map
      map.off('click', this.handleMapClick)
      let event
      switch (type) {
        case 'interest':
          this.vmap.changeMapState('interest')
          event = () => {}
          break
        case 'font':
          this.vmap.changeMapState('font')
          event = () => {}
          break
        case 'polygon':
          this.vmap.changeMapState('polygon')
          event = () => {}
          break
        case 'pointer':
          this.vmap.changeMapState('pointer')
          if (this.isEdit) {
            this.vmap.renderPolygon(this.hightAreaList, this.interestBuildingList)
          }
          event = () => {
            if (!MapModule.isClickInterest) {
              this.vmap.cancelChoose()
              this.cancleInterest()
              this.$emit('mapClick', {
                type: 'map',
                info: this.mapOption
              })
            }
            MapModule.SetIsClickInterest(false)
          }
          break
      }
      this.handleMapClick = event
      map.on('click', this.handleMapClick)
    })
  }

  setMarkerList(markerList) {
    this.markerlist = markerList
    this.$emit('markerlistChange', this.markerlist)
    this.vmap.setMarkerList(markerList, {
      onClick: this.handleMarkerClick,
      onChange: this.handleMarkerModify,
      onDelete: this.handleMarkerDelete,
      onPlay: this.handleMarkerPlay
    })
  }
  toggleOverView(state) {
    this.vmap.toggleOverView(state)
  }

  changeStyle(id, left, top) {
    this.playWindowList = this.playWindowList.map(item => {
      if (item.deviceId === id) {
        item.style.left = left + 'px'
        item.style.top = top + 'px'
      }
      return item
    })
  }

  public adjustPlayWindowPos() {
    if (this.playWindowList.length > 0) {
      const pw = parseInt(window.getComputedStyle(document.getElementById('mapContainer')).width)
      const ph = parseInt(window.getComputedStyle(document.getElementById('mapContainer')).height)
      const maxX = pw - this.playWindowStyle.width
      const maxY = ph - this.playWindowStyle.height
      this.playWindowList = this.playWindowList.map(item => {
        let x = parseInt(item.style.left)
        let y = parseInt(item.style.top)
        if (x > maxX) {
          x = maxX
        }
        if (x < 0) {
          x = 0
        }
        if (y > maxY) {
          y = maxY
        }
        if (y < 0) {
          y = 0
        }

        item.style.left = x + 'px'
        item.style.top = y + 'px'
        return item
      })
    }
  }
}
</script>
<style lang="scss" scoped>
#mapContainer {
  width: 100%;
  height: 100%;
}

.search-wrap {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 8;
}

.play-wrap {
  position: absolute;
  z-index: 9;
  background: #333;

  &.selected {
    z-index: 10;
  }

  .vss-player__wrap {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .el-icon {
    display: inline-block;
    position: absolute;
    padding: 5px;
    background: rgba(0, 0, 0, 40%);
    top: 5px;
    right: 5px;
    z-index: 2001;
    color: #fff;
    cursor: pointer;
  }

  ::v-deep .preview-player {
    height: auto;
  }

  &.screen-container--fullscreen {
    position: fixed;
    z-index: 2002;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    height: 100% !important;
    width: 100% !important;
  }

  &.screen-container--fullscreen.selected {
    z-index: 2003;
  }
}

.play-container {
  width: 100%;
  height: 100%;
}
</style>
