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
  selected?: boolean
}

export enum mapStatus {
  Default = 1,
  Edit,
}

export interface events {
  reMarkerEvent: any
}

export interface markerEventHandlers {
  onClick?: any
  onChange?: any
  onDelete?: any
}

export const getAMapLoad = () => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap);
    } else {
      AMapLoader.load({
        'key': '7f0b2bbe4de7b251916b60012a6fbe3d',
        'version': '2.0',
        'plugins': ['AMap.MarkerCluster', 'AMap.HawkEye'],
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
  overView: AMap.HawkEye | null = null
  cluster: AMap.MarkerCluster | null = null
  markerEventHandlers: markerEventHandlers
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
        zooms: [3, 20]
      });
      this.overView = new AMap.HawkEye({
        opened: false,
        width: '300px',
        height: '200px',
      });
      map.addControl(this.overView);
      map.on('click', () => {
        this.cancelChoose();
      });
      this.map = map;
    } catch(e) {
      console.log(e);
    }
  }

  chooseMarker(marker) {
    this.curMarkerList = this.curMarkerList.map((item) => {
      if (item.deviceId === marker.deviceId) {
        item.selected = true;
      }
      return item
    })
    this.setCluster(this.wrapMarkers(this.curMarkerList));
  }

  changeEdit(status: boolean) {
    this.isEdit = status;
    this.setCluster(this.curMarkerList);
  }

  toggleOverView(show) {
    if (show) {
      this.overView.show();
    } else {
      this.overView.hide();
    }
  }

  getZoomAndCenter(): object {
    const zoom = this.map.getZoom();
    const center = this.map.getCenter();
    return {
      zoom,
      center
    }
  }

  addMarker(marker): void {
    const {lng, lat} = this.map.getCenter();
    if (!marker.longitude) {
      marker.longitude = lng;
    }
    if (!marker.latitude) {
      marker.latitude = lat;
    }
    this.curMarkerList.push(marker);
    this.cluster.addData(this.wrapMarkers([marker]));
  }

  renderMap(map: mapObject) {
    const { longitude, latitude, zoom } = map;
    this.curMapOptions = map;
    if (this.map) {
      this.map.setZoomAndCenter(zoom, [longitude, latitude]);
      this.map.clearMap();
      if (this.cluster) {
        this.cluster.setMap(null);
      }
    } else {
      this.creatMap(longitude, latitude, zoom);
    }
  }
  setMarkerList(markers: any[], handlers: markerEventHandlers) {
    this.curMarkerList = markers;
    this.setCluster(markers);
    this.markerEventHandlers = handlers;
  }

  wrapMarkers(markers: any[]) {
    const result = markers.map((marker) => {
      return {
        ...marker,
        lnglat: [marker.longitude, marker.latitude]
      }
    })
    return result;
  }
  updateMarkerList(markers) {
    this.curMarkerList = markers;
    this.cluster.setData(this.wrapMarkers(markers));
  }

  cancelChoose() {
    if (this.curMarkerList.length > 0) {
      this.curMarkerList = this.curMarkerList.map((item) => {
        item.selected = false;
        return item
      })
      this.setCluster(this.wrapMarkers(this.curMarkerList));
    }
  }

  setCluster(markers: any[]) {
    if (this.cluster) {
      this.cluster.setMap(null);
    }
    const count = markers.length;
    const _renderClusterMarker =  (context: any) => {
      const div = document.createElement('div');
      const bgColor = '#009dd9';
      const fontColor = '#fff';
      div.style.backgroundColor = bgColor;
      const size = Math.round(100 + Math.pow(context.count / count, 1 / 5) * 20);
      div.style.width = div.style.height = size + 'px';
      div.style.borderRadius = size / 2 + 'px';
      div.innerHTML = `${context.count}个监控点位`;
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
          const marker = context.marker.getExtData();
          const {lng, lat} = context.marker.getPosition();
          marker.latitude = lat;
          marker.longitude = lng;
          this.markerEventHandlers.onChange && this.markerEventHandlers.onChange(marker);
        })
      }
      context.marker.on('click', () => {
        const marker = context.marker.getExtData();
        if (!marker.selected) {
          this.cancelChoose();
          this.chooseMarker(marker);
        }
        this.markerEventHandlers.onClick && this.markerEventHandlers.onClick(marker);
      })
    }

    this.cluster = new window.AMap.MarkerCluster(this.map, this.wrapMarkers(markers), {
      gridSize: 80,
      renderClusterMarker: _renderClusterMarker, // 自定义聚合点样式
      renderMarker: _renderMarker, // 自定义非聚合点样式
    });

    this.cluster.on('click', item => {
      const len = item.clusterData.length;
      if (len <= 1) {
        return;
      }
      let alllng = 0;
      let alllat = 0;
      for (let mo of item.clusterData) {
        alllng += mo.lnglat.lng;
        alllat += mo.lnglat.lat;
      }
      const lat = alllat / len;
      const lng = alllng / len;
      this.map.setZoomAndCenter(this.map.getZoom() + 3, [lng, lat]);
    })
  }

  buildContent(markerOptions: markerObject) {
    const markerContent = document.createElement('div');
    markerContent.setAttribute('class', 'marker-containt');
    const sector = this.drawSector(markerOptions);
    const marker = this.createNode('<img class="marker-center" width="19px" height="32px" src="//webapi.amap.com/theme/v1.3/markers/b/mark_bs.png">')
    const label = this.createNode(`<div class="marker-label">${markerOptions.deviceId}</div>`)
    if (markerOptions.selected) {
      const size = markerOptions.viewRadius * 2 + 60;
      const wrapStyle = `width: ${size}px; height: ${size}px; top: ${(50 - size) / 2}px; left: ${(50 - size) / 2}px`;
      let wrapDiv;
      let optionDiv;
      if (this.isEdit) { // 编辑状态
        const previewIcon = `<i class="icon icon_preview" onclick="previewMarker('${markerOptions.deviceId}')">p</i>`
        const replayIcon = `<i class="icon icon_replay" onclick="replayMarker('${markerOptions.deviceId}')">r</i>`
        optionDiv = `<div class="marker-options">${previewIcon}${replayIcon}</div>`;
      } else {
        const deleteIcon = `<i class="icon icon_delete" onclick="deleteMarker('${markerOptions.deviceId}')">×</i>`
        optionDiv = `<div class="marker-options">${deleteIcon}</div>`;
      }
      window.previewMarker = (id) => {
        console.log('播放'+ id);
      }
      window.replayMarker = (id) => {
        console.log('回放'+ id);
      }
      window.deleteMarker = (id) => {
        this.markerEventHandlers.onDelete(id);
      }
      wrapDiv = this.createNode(`<div class="marker-wrap" style="${wrapStyle}">${optionDiv}</div>`);
      markerContent.append(wrapDiv);
    }
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
