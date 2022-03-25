<template>
  <div id="mapContainer">
    <div class="play-wrap" v-if="playWindowInfo.show !== 'none'" :style="playWindowInfo.style">
      <i class="el-icon el-icon-close" @click="playWindowInfo.show = 'none'"></i>
      <live-view
        v-if="playWindowInfo.show === 'live'"
        :device-id="playWindowInfo.deviceId"
        :in-protocol="playWindowInfo.inProtocol"
      />
      <replay-view
        v-if="playWindowInfo.show === 'replay'"
        :device-id="playWindowInfo.deviceId"
        :in-protocol="playWindowInfo.inProtocol"
        :has-playlive="false"
      />
    </div>
  </div>
</template>
<script lang="ts">
import {Vue, Component, Prop, Watch } from 'vue-property-decorator'
import VMap, {getAMapLoad} from './models/vmap'
import { getMapDevices, updateMarkers, addMarkers, deleteMarkers } from '@/api/map'
import LiveView from '@/views/device/components/LiveView.vue'
import ReplayView from '@/views/device/components/ReplayView.vue'
// import { getDevice } from '@/api/device'
// import { DeviceStatus, RecordStatus } from '@/dics'

@Component({
  name: 'MapView',
  components: {
    LiveView,
    ReplayView
  }
})
export default class MapView extends Vue {
  @Prop()
  private mapOption: any
  @Prop()
  private isEdit: boolean

  vmap = new VMap('mapContainer')
  markerlist = []

  playWindowInfo = {
    style: null,
    show: 'none', // none|live|replay
    top: 0,
    left: 0,
    deviceId: '',
    inProtocol: ''
  }

  @Watch('mapOption')
  private onMapChange() {
    if (this.mapOption) {
      this.setMap(this.mapOption)
    }
  }
  @Watch('isEdit')
  private onEditChange() {
    this.changeEdit(this.isEdit)
  }

  private mounted() {
    getAMapLoad().then(() => {
      this.setMap(this.mapOption)
    })
  }

  async setMap(map) {
    this.vmap.renderMap(map)
    this.addMapEvent()
    try{
      const res = await getMapDevices({ mapId: map.mapId })
      this.markerlist = res.devices
    } catch (e) {
      this.markerlist = []
    } finally {
      this.setMarkerList(this.markerlist)
      this.$emit('markerlistChange', this.markerlist)
    }
  }

  setMapCenter(lng, lat) {
    this.vmap.map.setCenter([lng, lat]);
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
      this.$emit("mapChange", {
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
    this.$emit("mapChange", {
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
    } catch(e) {
      console.log('修改标记点失败')
    }
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
        top: `${data.top - (height + size/2 + 40)}px`,
        left: `${data.left - width/2}px`
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
    const {lng, lat} = this.vmap.map.getCenter()
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
    } catch(e) {
      console.log('添加标记点失败')
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
<style lang="scss">
#mapContainer {
  width: 100%;
  height: 100%;
}
.marker-containt {
  position: relative;
  display: flex;
  width: 50px;
  height: 50px;
  justify-content: center;
  align-items: center;
}
.marker-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  background: orange;
  opacity: 0.3;
  border-radius: 50%;
}
.marker-label {
  display: block;
  position: absolute;
  bottom: 10px;
  font-size: 12px;
}
.hide-title .marker-label {
  display: none;
}
.marker-center {
  position: absolute;
  top: -7px;
  left: 15px;
}
.marker-wrap {
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid rgba(217, 0, 27, 1);
  background-color: rgba(217, 0, 27, 0.0745098039215686);
  padding: 5px;
}
.marker-options {
  text-align: right;
}
.marker-options .icon-wrap {
  display: inline-block;
  width: 20px;
  height: 20px;
  overflow: hidden;
  margin-right: 5px;
}
.marker-options .icon-wrap:last-child{
  margin-right: 0;
}
.marker-options .icon {
  display: inline-block;
  width: 20px;
  height: 20px;
}
.marker-options .off .icon{
  position: relative;
  left: -20px;
  filter: drop-shadow(#ccc 20px 0);
}
.marker-options .icon_delete {
  background: url('~@/icons/svg/delete.svg') no-repeat;
  background-size: contain;
}
.marker-options .icon_preview {
  background: url('~@/icons/svg/player.svg') no-repeat;
  background-size: contain;
}
.marker-options .icon_replay {
  background: url('~@/icons/svg/play-video.svg') no-repeat;
  background-size: contain;
}
.play-wrap {
  position: absolute;
  z-index: 9;
  background: #000;
  .replay-view {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .el-icon{
    position: absolute;
    top: 5px;
    right: 5px;
  }
}
</style>
