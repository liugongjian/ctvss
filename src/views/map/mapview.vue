<template>
  <div id="mapContainer"></div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import VMap from './models/vmap'

@Component({
  name: 'MapView'
})
export default class MapView extends Vue {
  map = new VMap('mapContainer');
  mapOption = null;
  markerlist = [];

  chooseMap(map) {
    this.mapOption = map;
    this.map.renderMap(map);
  }

  changeEdit(status) {
    this.map.changeEdit(status);
  }

  reMarker(markerOption) {
    this.map.reSetMarker(markerOption);
  }

  getZoom() {
    console.log(this.map.getZoom());
  }

  // 标记点信息修改后处理
  handleReMarker(markerOption) {
    // 修改标记点信息
    console.log(`修改标记点：地图${this.mapOption.id}, 标记信息${JSON.stringify(markerOption)}`);
  }

  addMarker(markerOption) {
    this.map.addMarker(markerOption);
    console.log(this.markerlist)
  }
  setMarkerList(markerList) {
    this.markerlist = markerList;
    this.map.setMarkerList(markerList);
  }
  toggleOverView(state) {
    this.map.toggleOverView(state);
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
.sector {
  width: 50px;
  height: 50px;
  position: absolute;
  clip: rect(0 50px 50px 25px);
  overflow: hidden;
  top: 0;
  left: 0;
}
.sector::after {
  content: '';
  width: 100%; height: 100%;
  background: yellow;
  position: absolute;
  clip: rect(0 25px 50px 0);
  transform: rotate(120deg);
  border-radius: 50%;
  top: 0;
  left: 0;
}
</style>
