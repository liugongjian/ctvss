import AMapLoader from '@amap/amap-jsapi-loader';

export interface mapObject {
  lng: number,
  lat: number,
  zoom: number,
  markerList: markerObject[],
}

export interface markerObject {
  lng: number,
  lat: number,
  id: string,
  name: string,
  dAngle: number,
  vAngle: number,
  vRadius: number
}

export enum mapStatus {
  Default = 1,
  Edit,
}

export default class VMap {
  AMap: any
  map: AMap.Map | null = null
  container = ''
  isEdit = false
  constructor(container: string) {
    this.container = container;
  }
  loadApi(){
    return new Promise((resolve, reject) => {
      AMapLoader.load({
        'key': '7f0b2bbe4de7b251916b60012a6fbe3d',
        'version': '2.0',
        'plugins': [],
      }).then((AMap)=>{
        resolve(AMap);
      }).catch(e => {
        console.log(e);
        reject(e);
      })
    })
  }
  async creatMap(lng: number, lat: number, zoom: number, list: markerObject[]) {
    try{
      const AMap: any = await this.loadApi();
      this.AMap = AMap;
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
      const markers = this.renderMarkerList(list);
      map.add(markers);
      // this.setCluster(map, this.handleMarkerlist(list));
      this.map = map;
    } catch(e) {
      console.log(e);
    }
  }
  handleMarkerlist(list): any[] {
    list.forEach(item => {
      item.lnglat = [item.lng, item.lat]
    })
    return list
  }

  changeEdit(status: boolean) {
    this.isEdit = status;
  }

  renderMap(map: mapObject) {
    const { lng, lat, zoom, markerList } = map;
    if (this.map) {
      this.map.setZoomAndCenter(zoom, [lng, lat]);
      this.map.clearMap();
      const markers = this.renderMarkerList(markerList);
      this.map.add(markers);
      // this.setCluster(this.map, this.handleMarkerlist(markerList));
    } else {
      this.creatMap(lng, lat, zoom, markerList);
    }
  }

  setCluster(map: AMap.Map, markers: any[]) {
    const count = markers.length;
    const _renderClusterMarker = function (context: any) {
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
      context.marker.setContent(div)
    };
    const _renderMarker = function(context: any) {
      const content = '<div style="background-color: hsla(180, 100%, 50%, 0.3); height: 18px; width: 18px; border: 1px solid hsl(180, 100%, 40%); border-radius: 12px; box-shadow: hsl(180, 100%, 50%) 0px 0px 3px;"></div>';
      const offset = new AMap.Pixel(-9, -9);
      context.marker.setContent(content)
      context.marker.setOffset(offset)
    }
    map.plugin(["AMap.MarkerCluster"], () => {
      const cluster = new this.AMap.MarkerCluster(map, markers, {
        gridSize: 80,
        // renderClusterMarker: _renderClusterMarker, // 自定义聚合点样式
        // renderMarker: _renderMarker, // 自定义非聚合点样式
      });
    });
  }

  renderMarkerList(list: markerObject[]): AMap.Marker[]{
    const mlist: AMap.Marker[] = [];
    list.forEach(marker => {
      mlist.push(this.createMarker(marker));
    })
    return mlist;
  }

  createMarker(markerOptions: markerObject, status: mapStatus = mapStatus.Default) {
    const { lng, lat, id } = markerOptions;
    const content = this.buildContent(markerOptions);
    const marker = new window.AMap.Marker({
      position: [lng, lat],
      draggable: true,
      clickable: true,
      extData: id,
      content
    });
    marker.on('click', () => {
      console.log(id, ' clicked');
    })
    return marker;
  }
  buildContent(markerOptions: markerObject) {
    const markerContent = document.createElement('div');
    markerContent.setAttribute('class', 'marker-containt');
    const sector = this.drawSector(markerOptions);
    const marker = this.createNode('<img class="marker-center" width="19px" height="32px" src="//webapi.amap.com/theme/v1.3/markers/b/mark_bs.png">')
    const label = this.createNode(`<div class="marker-label">${markerOptions.name}</div>`)
    markerContent.append(marker, sector, label);
    return markerContent;
  }

  createNode(htmlstr: string) {
    const div = document.createElement('div');
    div.innerHTML = htmlstr;
    return div.childNodes[0];
  }

  drawSector(markerOptions: markerObject) {
    const sectorSize = markerOptions.vRadius * 2;
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
    path.setAttribute('id', markerOptions.id);
    path.style.cssText = cssText;
    path.setAttribute('d', buildPath(markerOptions, this.map!));
    canvas.appendChild(path);

    function buildPath(markerOptions: markerObject, map: AMap.Map): string {
      const { vRadius, vAngle, dAngle } = markerOptions;
      const endPosX = Math.cos((vAngle / 180) * Math.PI) * vRadius + vRadius;
      const endPosY = Math.sin((vAngle / 180) * Math.PI) * vRadius + vRadius;
      return `M ${vRadius} ${vRadius} L ${vRadius * 2} ${vRadius} A ${vRadius} ${vRadius} 0 0 1 ${endPosX} ${endPosY} L ${vRadius} ${vRadius}`;
    }
    return canvas;
  }

}
