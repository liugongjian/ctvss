import AMapLoader from "@amap/amap-jsapi-loader";

export interface mapObject {
  mapId: string,
  name: string,
  longitude: number,
  latitude: number,
  zoom: number,
}

export interface markerObject {
  longitude: number,
  Latitude: number,
  deviceId: string,
  deviceAngle: number,
  viewAngle: number,
  viewRadius: number,
  population?: string,
  houseInfo?: string,
  unitInfo?: string,
}

export enum mapStatus {
  Default = 1,
  Edit,
}

export interface events {
  reMarkerEvent: any
}

export const getAMapLoad = () => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap);
    } else {
      AMapLoader.load({
        'key': '7f0b2bbe4de7b251916b60012a6fbe3d',
        'version': '2.0',
        'plugins': ['AMap.MarkerCluster'],
      }).then((AMap)=>{
        resolve(AMap);
      }).catch(e => {
        console.log(e);
        reject(e);
      })
    }
  })
}

export default class VMap {
  map: AMap.Map | null = null
  curMapOptions: mapObject
  curMarkerList: markerObject[]
  container = ''
  isEdit = false
  cluster: AMap.MarkerCluster | null = null
  constructor(container: string) {
    this.container = container;
  }
  creatMap(lng: number, lat: number, zoom: number) {
    try{
      const AMap = window.AMap;
      const map = new AMap.Map(this.container, {
        rotateEnable: false,
        pitchEnable: false,
        animateEnable: false,
        viewMode:'3D',
        pitch: 50,
        rotation: 0,
        zoom: zoom,
        center:[Number(lng), Number(lat)],
      });
      this.map = map;
    } catch(e) {
      console.log(e);
    }
  }

  changeEdit(status: boolean) {
    this.isEdit = status;
    this.setCluster(this.curMarkerList);
  }

  reSetMarker(id, options): void {
    this.curMarkerList = this.curMarkerList.map((item) => {
      if (id === item.deviceId) {
        item = {...item, ...options};
      }
      return item
    })
    this.cluster.setData(this.curMarkerList);
  }

  addMarker(marker): void {
    const {lng, lat} = this.map.getCenter();
    if (!marker.longitude) {
      marker.longitude = lng;
    }
    if (!marker.latitude) {
      marker.latitude = lat;
    }
    if (!marker.lnglat) {
      marker.lnglat = [marker.longitude, marker.latitude];
    }
    this.curMarkerList.push(marker);
    this.cluster.addData([marker]);
  }

  renderMap(map: mapObject) {
    const { longitude, latitude, zoom } = map;
    this.curMapOptions = map;
    if (this.map) {
      this.map.setZoomAndCenter(zoom, [longitude, latitude]);
      this.map.clearMap();
    } else {
      this.creatMap(longitude, latitude, zoom);
    }
  }
  setMarkerList(markers: any[]) {
    this.curMarkerList = markers;
    this.setCluster(markers);
  }

  setCluster(markers: any[]) {
    if (this.cluster) {
      this.cluster.setMap(null);
    }
    markers.forEach(item => {
      if (!item.lnglat) {
        item.lnglat = [item.longitude, item.latitude];
      }
    });
    const count = markers.length;
    const _renderClusterMarker =  (context: any) => {
      const factor = Math.pow(context.count / count, 1 / 18);
      const div = document.createElement('div');
      const Hue = 180 - factor * 180;
      const bgColor = 'hsla(' + Hue + ',100%,40%,0.7)';
      const fontColor = 'hsla(' + Hue + ',100%,90%,1)';
      const borderColor = 'hsla(' + Hue + ',100%,40%,1)';
      const shadowColor = 'hsla(' + Hue + ',100%,90%,1)';
      div.style.backgroundColor = bgColor;
      const size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20);
      div.style.width = div.style.height = size + 'px';
      div.style.border = 'solid 1px ' + borderColor;
      div.style.borderRadius = size / 2 + 'px';
      div.style.boxShadow = '0 0 5px ' + shadowColor;
      div.innerHTML = context.count;
      div.style.lineHeight = size + 'px';
      div.style.color = fontColor;
      div.style.fontSize = '14px';
      div.style.textAlign = 'center';
      context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
      context.marker.setContent(div);
    };
    const _renderMarker = (context: any) => {
      const content = this.buildContent(context.data[0]);
      context.marker.setContent(content)
      context.marker.setExtData(context.data[0]);
      if (this.isEdit) {
        context.marker.setDraggable(true);
        context.marker.setCursor('move');
        context.marker.on('dragend', (ev) => {
          const deviceId = context.marker.getExtData().deviceId;
          const {lng, lat} = context.marker.getPosition();
          this.reSetMarker(deviceId, { lnglat: [lng, lat] });
        })
      }
    }

    this.cluster = new window.AMap.MarkerCluster(this.map, markers, {
      gridSize: 80,
      renderClusterMarker: _renderClusterMarker, // 自定义聚合点样式
      renderMarker: _renderMarker, // 自定义非聚合点样式
    });
  }

  buildContent(markerOptions: markerObject) {
    const markerContent = document.createElement('div');
    markerContent.setAttribute('class', 'marker-containt');
    const sector = this.drawSector(markerOptions);
    const marker = this.createNode('<img class="marker-center" width="19px" height="32px" src="//webapi.amap.com/theme/v1.3/markers/b/mark_bs.png">')
    const label = this.createNode(`<div class="marker-label">${markerOptions.deviceId}</div>`)
    markerContent.append(sector, marker, label);
    return markerContent;
  }

  createNode(htmlstr: string) {
    const div = document.createElement('div');
    div.innerHTML = htmlstr;
    return div.childNodes[0];
  }

  drawSector(markerOptions: markerObject) {
    const sectorSize = markerOptions.viewRadius * 2;
    const canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    canvas.setAttribute('width', sectorSize.toString());
    canvas.setAttribute('height', sectorSize.toString());
    canvas.setAttribute('style', 'position: absolute');
    canvas.setAttribute('top', `${50 - sectorSize}px`);
    canvas.setAttribute('left', `${50 - sectorSize}px`);
    const styleText = [];
    styleText.push('stroke:red');
    styleText.push('fill:green');
    styleText.push('fill-opacity:0.3');
    const cssText = styleText.join(';');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', markerOptions.deviceId);
    path.style.cssText = cssText;
    path.setAttribute('d', buildPath(markerOptions, this.map!));
    path.setAttribute('transform', `rotate(${markerOptions.deviceAngle - 90 - markerOptions.viewAngle / 2}, ${markerOptions.viewRadius}, ${markerOptions.viewRadius})`);
    canvas.appendChild(path);

    function buildPath(markerOptions: markerObject, map: AMap.Map): string {
      const { viewRadius, viewAngle } = markerOptions;
      const endPosX = Math.cos((viewAngle / 180) * Math.PI) * viewRadius + viewRadius;
      const endPosY = Math.sin((viewAngle / 180) * Math.PI) * viewRadius + viewRadius;
      return `M ${viewRadius} ${viewRadius} L ${viewRadius * 2} ${viewRadius} A ${viewRadius} ${viewRadius} 0 0 1 ${endPosX} ${endPosY} L ${viewRadius} ${viewRadius}`;
    }
    return canvas;
  }

}
