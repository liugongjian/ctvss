<template>
  <div id="mapContainer">
    <div class="play-wrap" v-if="playWindowInfo.show !== 'none'" :style="playWindowInfo.style">
     <live-view
       v-if="playWindowInfo.show === 'live'"
       :device-id="playWindowInfo.deviceId"
       :in-protocol="playWindowInfo.inProtocol"
     />
     <replay-view
       v-if="playWindowInfo.show === 'replay'"
       :device-id="playWindowInfo.deviceId"
       :in-protocol="playWindowInfo.inProtocol"
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
    this.setMap(this.mapOption);
  }

  private mounted() {
    getAMapLoad().then(() => {
      this.setMap(this.mapOption);
    })
  }

  async setMap(map) {
    this.vmap.renderMap(map)
    this.addMapEvent()
    try{
      const res = await getMapDevices({ mapId: map.mapId })
      this.markerlist = res.devices
    } catch (e) {
      console.log('获取标记点列表失败')
      this.markerlist = []
    } finally {
      this.setMarkerList(this.markerlist)
    }
  }

  addMapEvent() {
    const map = this.vmap.map;
    const getMapInfo = () => {
      const zoom = map.getZoom()
      const center = map.getCenter()
      this.$emit("mapChange",{
        zoom,
        center: [center.lng, center.lat]
      })
    };
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

  async handleMarkerModify(marker) {
    console.log('marker 修改了');
    try {
      const data = {
        mapId: this.mapOption.mapId,
        devices: [this.handleDevice(marker)]
      }
      console.log(data);
      await updateMarkers(data);
      this.markerlist = this.markerlist.map((item) => {
        if (marker.deviceId === item.deviceId) {
          item = marker;
        }
        return item
      })
      this.vmap.updateMarkerList(this.markerlist)
    } catch(e) {
      console.log('修改标记点失败')
    }
  }

  handleMarkerClick(marker) {
    console.log(`标记点${marker.deviceId}被点击了`)
    console.log(marker)
    this.$emit('mapClick', {
      type: 'marker',
      info: marker
    })
  }

  handleMarkerPlay(data) {
    console.log(`标记点${data.deviceId}开始播放了`)
    if (data.canPlay) {
      this.playWindowInfo = data;
      const width = 150;
      const height = data.show === 'live' ? 100 : 160;
      const size = 100;
      const style = {
        width: `${width}px`,
        height: `${height}px`,
        top: `${data.top - (height + size/2 + 40)}px`,
        left: `${data.left - width/2}px`
      };
      this.playWindowInfo = {
        ...data,
        style
      }
    }
  }

  async handleMarkerDelete(deviceId) {
    try {
      await deleteMarkers({
        mapId: this.mapOption.mapId,
        devices: [{ deviceId }]
      });
      this.markerlist = this.markerlist.filter(item => item.deviceId !== deviceId)
      this.vmap.updateMarkerList(this.markerlist);
      console.log(`标记点${deviceId}被删除了`)
    } catch(e) {
      console.log('添加标记点失败');
    }
  }

  changeEdit(status) {
    this.vmap.changeEdit(status);
    this.playWindowInfo.show = 'none';
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
    return result;
  }

  toggleMap3D(is3D) {
    this.vmap.change3D(is3D);
    this.setMarkerList(this.markerlist);
  }

  async addMarker(markerOption) {
    const {lng, lat} = this.vmap.map.getCenter();
    if (!markerOption.longitude) {
      markerOption.longitude = lng;
    }
    if (!markerOption.latitude) {
      markerOption.latitude = lat;
    }
    try {
      await addMarkers({
        mapId: this.mapOption.mapId,
        devices: [this.handleDevice(markerOption)]
      });
      this.vmap.addMarker(markerOption);
    } catch(e) {
      console.log('添加标记点失败');
    }
  }

  setMarkersView(isShow) {
    console.log('是否显示标记点：', isShow);
    this.vmap.setMarkersView(isShow);
  }

  setMarkerList(markerList) {
    this.markerlist = markerList;
    this.vmap.setMarkerList(markerList, {
      onClick: this.handleMarkerClick,
      onChange: this.handleMarkerModify,
      onDelete: this.handleMarkerDelete,
      onPlay: this.handleMarkerPlay
    });
  }
  toggleOverView(state) {
    this.vmap.toggleOverView(state);
  }
}
</script>
<style>
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
}
.play-wrap  .replay-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
