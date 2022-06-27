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
import VMap, { getAMapLoad } from './models/vmap'
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
import draggable from '@/views/map/directives/draggable'

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
  @Prop()
  private mapOption: any
  @Prop()
  private isEdit: boolean

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
        addPoi: this.addInterstPoi,
        clickPoi: this.choosePoi,
        deletePoi: this.deleteInterest,
        addPolygon: this.addPolygon,
        clickPolygon: this.choosePolygon,
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
  private async getPointList(map) {
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
      this.renderPoints(map)
    }
  }

  // 渲染兴趣点
  public renderPoints(map) {
    this.renderMask(map.mask)
    this.vmap.renderBuilding(this.hightAreaList, this.interestBuildingList)
    this.vmap.renderPoi(this.interestPointList)
  }

  public renderMask(mask) {
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
    await this.getPointList(map)
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
        longitude: center.lng,
        latitude: center.lat,
        zoom
      }
      this.$emit('mapChange', {
        type: 'map',
        info: mapInfo
      })
    }
    map.on('moveend', getMapInfo)
    map.on('zoomend', getMapInfo)
    this.changeMapClickEvent('map')
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

  private async handleMarkerModify(marker) {
    this.$emit('mapChange', {
      type: 'marker',
      info: marker
    })
    this.markerChange(marker, false)
  }

  public async markerChange(marker, showMsg = true) {
    try {
      const data = {
        mapId: this.mapOption.mapId,
        devices: [this.handleDevice(marker)]
      }
      await updateMarkers(data)
      this.markerlist = this.markerlist.map((item) => {
        if (marker.deviceId === item.deviceId) {
          item = marker
        }
        return item
      })
      this.$emit('markerlistChange', this.markerlist)
      this.vmap.updateMarkerList(this.markerlist)
      showMsg && this.$alertSuccess('标记点修改成功')
    } catch (e) {
      this.$alertError(e)
      console.log('修改标记点失败')
    }
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

  async handleMarkerDelete(id, deviceName) {
    console.log('delete device id: ', id)
    this.$alertDelete({
      type: '监控点位',
      msg: `确定在地图中删除监控点位"${deviceName}"?`,
      method: deleteMarkers,
      payload: {
        mapId: this.mapOption.mapId,
        devices: [{ id }]
      },
      onSuccess: () => {
        this.markerlist = this.markerlist.filter(item => item.deviceId !== id)
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
    // this.playWindowInfo.show = 'none'
    this.closeAllPlayer()
  }

  handleDevice(device) {
    const appearance = {color: 'red'}
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

  toggleMap3D(is3D) {
    this.vmap.change3D(is3D)
    this.setMarkerList(this.markerlist)
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
      await addMarkers({
        mapId: this.mapOption.mapId,
        devices: [this.handleDevice(markerOption)]
      })
      this.vmap.addMarker(markerOption)
      this.$emit('markerlistChange', this.markerlist)
    } catch (e) {
      this.$alertError(e)
    }
  }

  choosePoi(point) {
    if (point) {
      const otherPoints = document.getElementsByClassName('marker-containt')
      let len = otherPoints.length
      for (let i = 0; i < len; i += 1) {
        const nClass = otherPoints[i].getAttribute('class').replace('selected', '')
        otherPoints[i].setAttribute('class', nClass)
        otherPoints[i].parentElement.setAttribute('class', 'amap-marker')
      }
      const $point = document.getElementById(`marker-point-${point.tagId}`);
      const nClass = $point.getAttribute('class')
      $point.setAttribute('class', `${nClass} selected`)
      $point.parentElement.setAttribute('class', 'amap-marker selected')

      console.log('点击了 poi，', point)
      // 弹出右边的信息窗
      // this.$emit('mapClick', {
      //   type: 'marker',
      //   info: point
      // })
    } else {
      const otherPoints = document.getElementsByClassName('marker-containt')
      let len = otherPoints.length
      for (let i = 0; i < len; i += 1) {
        const nClass = otherPoints[i].getAttribute('class').replace('selected', '')
        otherPoints[i].setAttribute('class', nClass)
        otherPoints[i].parentElement.setAttribute('class', 'amap-marker')
      }
    }
  }

  choosePolygon(polygon) {
    if (polygon) {
      console.log('点击了polygon，', polygon)
      // 弹出右边的信息窗
      // this.$emit('mapClick', {
      //   type: 'marker',
      //   info: point
      // })
    } else {
      console.log('取消了 polygon 点击')
    }
  }

  addInterstPoi(position, type) {
    console.log('addInterstPoi', type)
    const tagName = type === 'interest' ? '兴趣点标记' : '文本标记'
    const colorType = type === 'interest' ? 'bubble' : 'text'
    const { lng, lat } = position
    const appearance = {color: 'yellow', colorType}
    const param = {
      tagName,
      type: 'InterestPoint',
      description: 'aaaaa',
      mapId: this.mapId,
      points: [{ longitude: lng.toString(), latitude: lat.toString() }],
      color: '',
      colorType: '',
      appearance: JSON.stringify(appearance)
    }
    console.log('新增兴趣点： ', param.points[0])
    addInterestPoint(param).then(data => {
      const { tagId } = data
      this.interestPointList.push({...param, tagId});
      this.vmap.renderPoi(this.interestPointList)
      return true
    }).catch(err => {
      this.$message.error(`${err.message ? err.message : err}`)
      return false
    })
  }

  addPolygon(points) {
    const type = 'InterestBuilding' // HighLightArea;InterestBuilding
    console.log('addPolygon', type)
    const tagName = '楼层' //  高亮 '楼层'
    const colorType = ''
    const param = {
      tagName,
      type: 'InterestPoint',
      description: '',
      mapId: this.mapId,
      points: points.map(item => ({longitude: item.lng.toString(), latitude: item.lat.toString()})),
      color: 'blue',
      colorType
    }
    console.log('新增polygon： ', param.points)
    // addInterestPoint(param).then(() => {
    //   this.$message.success('新增成功')
    // }).catch(err => {
    //   this.$message.error(`${err.message ? err.message : err}`)
    // }
    const suc = true
    if (suc) {
      if (type === 'HighLightArea') {
        this.hightAreaList.push(param)
        console.log('mask: ', this.mapMask)
        this.renderMask(this.mapMask)
      } else {
        this.interestBuildingList.push(param)
        this.vmap.renderBuilding(this.hightAreaList, this.interestBuildingList)
        return true
      }
    } else {
      return false
    }
  }

  deleteInterest(id) {
    console.log('delete interest id: ', id)
    // delInterestPoint({ tagId: id}).then(() => {
    //   this.interestPointList = this.interestPointList.filter(item => item.tagId !== id)
    // })
  }

  setMarkersView(isShow) {
    this.vmap.setMarkersView(isShow)
  }

  changeMapClickEvent(type) {
    console.log('changeMapClickEvent', type)
    const map = this.vmap.map
    map.off('click', this.handleMapClick)
    let event
    switch (type) {
      case 'interest':
        this.vmap.changeMapState('interest')
        event = () => {
          console.log('click interest')
        }
        break
      case 'font':
        this.vmap.changeMapState('font')
        event = () => {
          console.log('font')
          // addInterestPoint(param).then(() => {
          //   this.$message.success('新增成功')
          // }).catch(err => {
          //   this.$message.error(`${err.message ? err.message : err}`)
          // })
        }
        break
      case 'polygon':
        this.vmap.changeMapState('polygon')
        event = () => {
          console.log('click polygon')
        }
        break;
        break
      case 'map':
      default:
        this.vmap.changeMapState('pointer')
        if (this.isEdit) {
          this.vmap.renderPolygon(this.hightAreaList, this.interestBuildingList)
        }
        event = () => {
          console.log('点击其他')
          this.vmap.cancelChoose()
          this.$emit('mapClick', {
            type: 'map',
            info: this.mapOption
          })
        }
    }
    this.handleMapClick = event
    map.on('click', this.handleMapClick)
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
