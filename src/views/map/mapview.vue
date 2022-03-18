<template>
  <div id="mapContainer"></div>
</template>
<script lang="ts">
import {Vue, Component, Prop, Watch } from 'vue-property-decorator'
import VMap, {getAMapLoad} from './models/vmap'
import { getMapDevices, updateMarkers } from '@/api/map'

@Component({
  name: 'MapView'
})
export default class MapView extends Vue {
  @Prop()
  private mapOption: any

  vmap = new VMap('mapContainer');
  markerlist = [];

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
    this.vmap.renderMap(map);
    this.addMapEvent();
    let markerlist = [];
    try{
      const res = await getMapDevices({ mapId: map.mapId });
      markerlist = res.devices;
    } catch (e) {
      console.log('获取标记点列表失败');
      markerlist = [];
    } finally {
      this.setMarkerList(markerlist);
    }
  }

  addMapEvent() {
    const map = this.vmap.map;
    const getMapInfo = () => {
      const zoom = map.getZoom();
      const center = map.getCenter();
      this.$emit("mapChange",{
        zoom,
        center: [center.lng, center.lat]
      })
    };
    map.on('moveend', getMapInfo);
    map.on('zoomend', getMapInfo);
  }

  async handleMarkerModify(marker) {
    console.log('marker 修改了');
    console.log(marker);
    this.markerlist = this.markerlist.map((item) => {
      if (marker.deviceId === item.deviceId) {
        item = marker;
      }
      return item
    })
    this.vmap.updateMarkerList(this.markerlist);
    // try {
    //   await updateMarkers({
    //     mapId: this.mapOption.mapId,
    //     devices: [marker]
    //   })
    // } catch(e) {
    //   console.log('修改标记点失败');
    // }
  }

  handleMarkerClick(marker) {
    console.log(`标记点${marker.deviceId}被点击了`)
  }

  handleMarkerDelete(deviceId) {
    this.markerlist = this.markerlist.filter(item => item.deviceId !== deviceId);
    this.vmap.updateMarkerList(this.markerlist);
    console.log(`标记点${deviceId}被删除了`)
  }

  changeEdit(status) {
    this.vmap.changeEdit(status);
  }

  addMarker(markerOption) {
    this.vmap.addMarker(markerOption);
  }

  setMarkerList(markerList) {
    this.markerlist = markerList;
    this.vmap.setMarkerList(markerList, {
      onClick: this.handleMarkerClick,
      onChange: this.handleMarkerModify,
      onDelete: this.handleMarkerDelete
    });
  }
  toggleOverView(state) {
    this.vmap.toggleOverView(state);
  }
}
</script>
<style>
#mapContainer{
  width: 100%;
  height: 100%;
}
.marker-containt{
  position: relative;
  display: flex;
  width: 50px;
  height: 50px;
  justify-content: center;
  align-items: center;
}
.marker-circle{
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  background: orange;
  opacity: 0.3;
  border-radius: 50%;
}
.marker-label{
  display: block;
  position: absolute;
  bottom: 10px;
  font-size: 12px;
}
.hide-title .marker-label{
  display: none;
}
.marker-center{
  position: absolute;
  top: -7px;
  left: 15px;
}
.marker-wrap{
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid rgba(217, 0, 27, 1);
  background-color: rgba(217, 0, 27, 0.0745098039215686);
  padding: 5px;
}
.marker-options{
  text-align: right;
}
.marker-options .icon{
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 1px solid #000;
}
</style>
