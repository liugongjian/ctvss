<template>
  <div id="mapContainer"></div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import VMap from './models/vmap'
import AMapLoader from '@amap/amap-jsapi-loader';

@Component({
  name: 'MapView'
})
export default class MapView extends Vue {
  map = new VMap('mapContainer');
  mapList = [
    {
      id: 1,
      name: '地图1',
      zoom: 12,
      // center: [121.487207, 31.225348],
      lng: 121.487207,
      lat: 31.225348,
      markerList: [
        {
          id: '001',
          name: '设备1',
          lng: 121.487207,
          lat: 31.225348,
          vRadius: 100,
          vAngle: 120,
          dAngle: 0,
        },
        {
          id: '002',
          name: '设备2',
          lng: 121.527207,
          lat: 31.215348,
          vRadius: 80,
          vAngle: 90,
          dAngle: 20,
        },
        {
          id: '003',
          name: '设备3',
          lng: 121.526207,
          lat: 31.215148,
          vRadius: 80,
          vAngle: 90,
          dAngle: 20,
        }
      ],
    }
  ]
  mounted() {
    // const { lng, lat, zoom, markerList } = this.mapList[0];
    // AMapLoader.load({
    //   "key": "7f0b2bbe4de7b251916b60012a6fbe3d",
    //   "version": "2.0",
    //   "plugins": [],
    // }).then((AMap)=>{
    //   const map = new AMap.Map('mapContainer', {
    //     rotateEnable: false,
    //     pitchEnable: false,
    //     animateEnable: false,
    //     viewMode:'3D',
    //     pitch: 50,
    //     rotation: 0,
    //     zoom: zoom,
    //     center:[lng, lat],
    //   });
    // }).catch((e)=>{
    //   console.error(e);  //加载错误提示
    // });
    this.chooseMap(this.mapList[0])
  }

  chooseMap(map) {
    this.map.renderMap(map);
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
  position: absolute;
  bottom: 10px;
  font-size: 12px;
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
