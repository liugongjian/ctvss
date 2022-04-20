<template>
  <div id="mapContainer">
    <!-- <draggable> -->
    <div class="search-wrap">
      <el-input id="map-tip-input" v-model="mapTip" placeholder="请输入关键字" />
    </div>
    <div
      v-for="playWindowInfo in playWindowList"
      v-draggable
      :key="playWindowInfo.deviceId"
      class="play-wrap"
      :style="playWindowInfo.style"
      :class="{'screen-container--fullscreen': isFullscreen}"
    >
      <div v-if="playWindowInfo.show !== 'none'">
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
    <!-- </draggable> -->
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import VMap, { getAMapLoad } from './models/vmap'
import axios from 'axios'
import { getMapDevices, updateMarkers, addMarkers, deleteMarkers } from '@/api/map'
import { Screen } from '@/views/device/models/Screen/Screen'
import LivePlayer from '@/views/device/components/LivePlayer.vue'
import ReplayView from '@/views/device/components/ReplayPlayer/index.vue'
import draggable from "@/views/map/directives/draggable";

@Component({
  name: 'MapView',
  components: {
    LivePlayer,
    ReplayView
    // draggable
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

  private vmap = new VMap('mapContainer')
  private markerlist = []
  private mapTip = ''
  private pageTotal = 1
  private axiosSourceList = []
  private playWindowList = []

  // private playWindowInfo = {
  //   style: null,
  //   show: 'none', // none|live|replay
  //   top: 0,
  //   left: 0,
  //   deviceId: null,
  //   inProtocol: ''
  // }

  private screen: Screen = null

  private get isFullscreen() {
    return this.playWindowList.filter(item => item.screen.isFullscreen).length > 0
  }

  @Watch('isEdit')
  private onEditChange() {
    this.changeEdit(this.isEdit)
  }

  // @Watch('playWindowInfo.show')
  // @Watch('playWindowInfo.deviceId')
  // private onPlayWindowInfoChange() {
  //   if (this.playWindowInfo.show !== 'none') {
  //     this.screen = new Screen()
  //     this.screen.deviceId = this.playWindowInfo.deviceId
  //     this.screen.inProtocol = this.playWindowInfo.inProtocol
  //     this.screen.isLive = this.playWindowInfo.show === 'live'
  //     this.screen.init()
  //   }
  // }

  private mounted() {
    getAMapLoad().then(() => {
      this.setMap(this.mapOption)
    })
  }

  private async getMapMarkers(pageNum) {
    let params: any = {
      pageNum,
      pageSize: 100,
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

  async setMap(map) {
    this.vmap.renderMap(map)
    this.addMapEvent()
    this.mapId = map.mapId
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
    map.on('click', () => {
      this.vmap.cancelChoose()
      this.$emit('mapClick', {
        type: 'map',
        info: this.mapOption
      })
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
      const width = 400
      const height = 300
      const size = 100
      const style = {
        width: `${width}px`,
        height: `${height}px`,
        top: `${data.top - (height + size / 2 + 40)}px`,
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
    // this.playWindowInfo.show = 'none'
    this.closeAllPlayer()
  }

  handleDevice(device) {
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
      unitInfo: device.unitInfo
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

  setMarkersView(isShow) {
    this.vmap.setMarkersView(isShow)
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
  background: #000;
  .vss-player__wrap {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .el-icon{
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 2001;
    color: #fff;
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
}
</style>
