<template>
  <div id="mapContainer">
    <div class="search-wrap">
      <el-input id="map-tip-input" v-model="mapTip" placeholder="请输入关键字" />
    </div>
    <div v-if="playWindowInfo.show !== 'none'" class="play-wrap" :style="playWindowInfo.style">
      <i class="el-icon el-icon-close" @click="playWindowInfo.show = 'none'" />
      <live-player
        v-if="playWindowInfo.show === 'live'"
        :screen="screen"
      />
      <replay-view
        v-if="playWindowInfo.show === 'replay'"
        :screen="screen"
        :has-axis="true"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import VMap, { getAMapLoad } from './models/vmap'
import { getMapDevices, updateMarkers, addMarkers, deleteMarkers } from '@/api/map'
import { Screen } from '@/views/device/models/Screen/Screen'
import LivePlayer from '@/views/device/components/LivePlayer.vue'
import ReplayView from '@/views/device/components/ReplayPlayer/index.vue'

@Component({
  name: 'MapView',
  components: {
    LivePlayer,
    ReplayView
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

  private playWindowInfo = {
    style: null,
    show: 'none', // none|live|replay
    top: 0,
    left: 0,
    deviceId: null,
    inProtocol: ''
  }

  private screen: Screen = null

  @Watch('isEdit')
  private onEditChange() {
    this.changeEdit(this.isEdit)
  }

  @Watch('playWindowInfo.show')
  @Watch('playWindowInfo.deviceId')
  private onPlayWindowInfoChange() {
    if (this.playWindowInfo.show !== 'none') {
      this.screen = new Screen()
      this.screen.deviceId = this.playWindowInfo.deviceId
      this.screen.inProtocol = this.playWindowInfo.inProtocol
      this.screen.isLive = this.playWindowInfo.show === 'live'
      this.screen.init()
    }
  }

  private mounted() {
    getAMapLoad().then(() => {
      this.setMap(this.mapOption)
    })
  }

  async setMap(map) {
    this.vmap.renderMap(map)
    this.addMapEvent()
    try {
      const res = await getMapDevices({ mapId: map.mapId })
      this.markerlist = res.devices
    } catch (e) {
      this.$alertError(e)
      this.markerlist = []
    } finally {
      this.setMarkerList(this.markerlist)
      this.$emit('markerlistChange', this.markerlist)
    }
  }

  public setMapCenter(lng, lat) {
    this.vmap.map.setCenter([lng, lat])
  }

  public setMapZoomAndCenter(zoom, lng, lat) {
    this.vmap.map.setZoomAndCenter(zoom, [lng, lat])
  }

  public closePlayer() {
    this.playWindowInfo.show = 'none'
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

  handleMarkerPlay(data) {
    if (data.canPlay) {
      this.playWindowInfo = data
      const width = data.show === 'live' ? 160 : 400
      const height = data.show === 'live' ? 100 : 300
      const size = 100
      const style = {
        width: `${width}px`,
        height: `${height}px`,
        top: `${data.top - (height + size / 2 + 40)}px`,
        left: `${data.left - width / 2}px`
      }
      this.playWindowInfo = {
        ...data,
        style
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
    this.playWindowInfo.show = 'none'
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
}
</style>
