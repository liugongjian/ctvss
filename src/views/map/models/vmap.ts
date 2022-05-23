import AMapLoader from '@amap/amap-jsapi-loader'
import LngLat = AMap.LngLat
import { getDevice } from '@/api/device'
import { checkPermission } from '@/utils/permission'

export interface mapObject {
  mapId: string,
  name: string,
  longitude: number,
  latitude: number,
  zoom: number,
  mask?: string
}

declare global {
  interface Window {
    deleteMarker?: any,
    replayMarker?: any,
    previewMarker?: any,
  }
}

export interface markerObject {
  longitude: number,
  latitude: number,
  deviceId: string,
  deviceType: string,
  inProtocol: string,
  deviceLabel: string,
  deviceAngle: string,
  viewAngle: string,
  viewRadius: string,
  population?: string,
  houseInfo?: string,
  unitInfo?: string,
  selected?: boolean,
  lnglat?: [number, number] | LngLat,
  deviceStatus?: string,
  streamStatus?: string,
  recordStatus?: number,
  gbRegionNames?: Array<any>,
  groupId?: string
  deviceColor?: string
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
  onPlay?: any
}

export const getAMapLoad = () => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap)
    } else {
      AMapLoader.load({
        'key': '7f0b2bbe4de7b251916b60012a6fbe3d',
        'version': '2.0',
        'plugins': ['AMap.MarkerCluster', 'AMap.HawkEye', 'AMap.AutoComplete', 'AMap.Scale', 'AMap.ControlBar']
      }).then((AMap) => {
        resolve(AMap)
      }).catch(e => {
        console.log(e)
        reject(e)
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
    this.container = container
  }
  creatMap(lng: number, lat: number, zoom: number, is3D: boolean = true) {
    try {
      const AMap = window.AMap
      const options = {
        rotateEnable: false,
        pitchEnable: false,
        animateEnable: false,
        zoom: zoom,
        viewMode: '2D',
        pitch: 50,
        rotation: 0,
        center: [Number(lng), Number(lat)],
        zooms: [3, 20],
        mapStyle: process.env.VUE_APP_MAP_STYLE
      }
      if (is3D) {
        options.viewMode = '3D'
      }
      const map = new AMap.Map(this.container, options)
      const buildingLayer = new AMap.Buildings({
        zIndex: 10,
        zooms: [15, 20],
        heightFactor: 2,
        wallColor: 'ffc9d2dc',
        roofColor: 'ffdce3ec'
      })
      map.add([buildingLayer])
      this.overView = new AMap.HawkEye({
        visible: false,
        width: '300px',
        height: '200px'
      })
      const scale = new AMap.Scale({
        visible: true
      })
      const controlBar = new AMap.ControlBar({
        visible: true,
        position: {
          top: '10px',
          right: '10px'
        }
      })

      const auto = new AMap.AutoComplete({ input: 'map-tip-input' })
      auto.on('select', (e) => {
        if (e.poi.location) {
          map.setCenter(e.poi.location)
        }
      })
      map.addControl(this.overView)
      map.addControl(scale)
      map.addControl(controlBar)
      map.on('click', () => {
        this.cancelChoose()
      })
      this.map = map
    } catch (e) {
      console.log(e)
    }
  }

  change3D(is3D) {
    const { longitude, latitude, zoom } = this.curMapOptions
    this.map.destroy()
    this.creatMap(longitude, latitude, zoom, is3D)
  }

  async chooseMarker(marker) {
    if (!marker.selected) {
      this.cancelChoose()
      if (!marker.deviceStatus) {
        const { deviceId, inProtocol } = marker
        const deviceInfo = await getDevice({
          deviceId,
          inProtocol
        })
        let deviceLabel = deviceInfo.deviceName
        if (deviceInfo.deviceChannels.length > 0) {
          deviceLabel = deviceInfo.deviceChannels[0].channelName
        }
        marker.deviceStatus = deviceInfo.deviceStatus
        marker.streamStatus = deviceInfo.streamStatus
        marker.recordStatus = deviceInfo.recordStatus
        marker.deviceLabel = deviceLabel
      }
      this.curMarkerList.forEach((item) => {
        if (item.deviceId === marker.deviceId) {
          item.selected = true
          item.deviceStatus = marker.deviceStatus
          item.streamStatus = marker.streamStatus
          item.recordStatus = marker.recordStatus
          item.deviceLabel = marker.deviceLabel
        }
      })
      this.setCluster(this.wrapMarkers(this.curMarkerList))
    }
    this.markerEventHandlers.onClick && this.markerEventHandlers.onClick(marker)
  }

  changeEdit(status: boolean) {
    this.isEdit = status
    this.setCluster(this.curMarkerList)
  }

  toggleOverView(show) {
    if (show) {
      this.overView.show()
    } else {
      this.overView.hide()
    }
  }

  getZoomAndCenter(): object {
    const zoom = this.map.getZoom()
    const center = this.map.getCenter()
    return {
      zoom,
      center
    }
  }

  addMarker(marker): void {
    this.curMarkerList.push(marker)
    this.cluster.addData(this.wrapMarkers([marker]))
  }

  renderMap(map: mapObject) {
    const { longitude, latitude, zoom } = map
    this.curMapOptions = map
    if (this.map) {
      this.map.setZoomAndCenter(zoom, [longitude, latitude])
      this.map.clearMap()
      if (this.cluster) {
        this.cluster.setMap(null)
      }
    } else {
      this.creatMap(longitude, latitude, zoom)
    }
  }
  setMarkerList(markers: any[], handlers: markerEventHandlers) {
    this.curMarkerList = markers
    this.setCluster(markers)
    this.markerEventHandlers = handlers
  }

  wrapMarkers(markers: any[]) {
    const result = markers.map((marker) => {
      return {
        ...marker,
        lnglat: [marker.longitude, marker.latitude]
      }
    })
    return result
  }
  updateMarkerList(markers) {
    this.curMarkerList = markers
    this.cluster.setData(this.wrapMarkers(markers))
  }

  cancelChoose() {
    if (this.curMarkerList.length > 0) {
      this.curMarkerList.forEach((item) => {
        item.selected = false
      })
      this.setCluster(this.wrapMarkers(this.curMarkerList))
    }
  }
  setMarkersView(show: boolean) {
    if (show) {
      this.setCluster(this.curMarkerList)
    } else {
      this.cluster.setMap(null)
    }
  }

  setCluster(markers: any[]) {
    if (this.cluster) {
      this.cluster.setMap(null)
    }
    const count = markers.length
    const _renderClusterMarker = (context: any) => {
      const div = document.createElement('div')
      const bgColor = 'rgba(0, 157, 217, 0.8)'
      const fontColor = '#fff'
      div.style.backgroundColor = bgColor
      const size = Math.round(15 + Math.pow(context.count / count, 1 / 5) * 20)
      div.style.width = div.style.height = size + 'px'
      div.style.borderRadius = size / 2 + 'px'
      div.innerHTML = `${context.count}`
      div.style.lineHeight = size + 'px'
      div.style.color = fontColor
      div.style.fontSize = '14px'
      div.style.textAlign = 'center'
      context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2))
      context.marker.setContent(div)
      let content = ''
      const len = context.clusterData.length
      if (len >= 1) {
        content += `${context.clusterData[0].deviceLabel}`
      }
      if (len >= 2) {
        content += `<br>${context.clusterData[1].deviceLabel}`
      }
      if (context.count > 2) {
        content += '<br>......'
      }
      context.marker.setLabel({
        content: `<div class='marker-label-info'>${content}</div>`,
        direction: 'bottom'
      })
    }
    const _renderMarker = (context: any) => {
      const content = this.buildContent(context.data[0])
      context.marker.setContent(content)
      context.marker.setOffset(new AMap.Pixel(-25, -25))
      context.marker.setExtData(context.data[0])
      if (this.isEdit) {
        context.marker.setDraggable(true)
        context.marker.setCursor('move')
        context.marker.on('dragend', () => {
          const marker = context.marker.getExtData()
          const { lng, lat } = context.marker.getPosition()
          marker.latitude = lat
          marker.longitude = lng
          this.markerEventHandlers.onChange && this.markerEventHandlers.onChange(marker)
        })
      }
      if (context.data[0].selected) {
        context.marker.dom.setAttribute('class', 'amap-marker selected')
      }
      context.marker.on('click', () => {
        const marker = context.marker.getExtData()
        this.chooseMarker(marker)
      })
      context.marker.setLabel({
        offset: new AMap.Pixel(0, 10),
        content: `<div class='marker-label-info'>${context.data[0].deviceLabel}</div>`,
        direction: 'center'
      })
    }

    this.cluster = new window.AMap.MarkerCluster(this.map, this.wrapMarkers(markers), {
      gridSize: 80,
      renderClusterMarker: _renderClusterMarker, // 自定义聚合点样式
      renderMarker: _renderMarker // 自定义非聚合点样式
    })

    this.cluster.on('click', item => {
      const len = item.clusterData.length
      if (len <= 1) {
        return
      }
      let alllng = 0
      let alllat = 0
      for (let mo of item.clusterData) {
        alllng += mo.lnglat.lng
        alllat += mo.lnglat.lat
      }
      const lat = alllat / len
      const lng = alllng / len
      this.map.setZoomAndCenter(this.map.getZoom() + 2, [lng, lat])
    })
  }

  buildContent(markerOptions: markerObject) {
    const markerContent = document.createElement('div')
    markerContent.setAttribute('class', 'marker-containt')
    const mColor = markerOptions.deviceColor || '#1e78e0'
    // const sector = this.drawSector(markerOptions)
    // const marker = this.createNode('<img class="marker-center" width="19px" height="32px" src="//webapi.amap.com/theme/v1.3/markers/b/mark_bs.png">')
    const marker = this.createNode(`<svg class="marker-center" style="fill:${mColor}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8054"><path d="M97.28 572.928l-65.536-13.312c-10.752-2.048-20.992 5.12-23.04 15.36-0.512 1.536-0.512 3.072-0.512 4.608v402.944c0 16.896 16.896 28.672 32.256 22.528l26.624-9.728c27.136-9.728 45.568-35.84 45.568-65.024v-92.672c0-11.264 8.704-19.968 19.456-19.968h139.776c6.144 0 12.288-3.072 15.872-8.192l73.728-99.328c6.656-9.216 4.096-22.016-5.12-28.672-0.512-0.512-81.92-51.2-81.92-51.2-9.216-5.12-20.992-2.048-26.112 7.168-0.512 1.536-1.536 2.56-1.536 4.096l-20.48 65.024c-2.56 8.192-10.24 13.824-18.432 13.824H132.608c-10.752 0-19.456-9.216-19.456-19.968v-107.008c0-10.24-6.656-18.432-15.872-20.48zM684.544 732.16L87.04 317.952c-24.576-16.896-31.744-50.176-16.896-74.24l118.272-185.856c15.36-24.576 48.64-29.696 68.608-14.336l650.752 487.936c34.304 25.6 34.816 70.656 5.12 90.624l-171.008 112.128c-17.408 11.264-39.936 10.24-57.344-2.048zM81.92 397.312l-28.672 40.448c-6.144 9.216-4.608 21.504 4.096 28.16l1.024 1.024 675.84 440.832c8.192 5.632 19.456 4.096 26.112-3.584l87.04-100.352c7.168-8.192 6.656-20.48-0.512-28.672l-2.048-2.048c-7.168-7.68-18.944-8.704-27.136-2.048l-60.416 48.128c-6.656 5.632-16.384 5.632-23.552 1.024L108.032 392.704c-8.704-6.144-20.48-4.096-26.112 4.608z" p-id="8055"></path></svg>`)
    const label = this.createNode(`<div class="marker-label">${markerOptions.deviceLabel}</div>`)
    if (markerOptions.selected) {
      // const size = markerOptions.viewRadius * 2 + 60
      const size = 100
      // const wrapStyle = `width: ${size}px; height: ${size + 20}px; top: ${(50 - size) / 2 - 20}px; left: ${(50 - size) / 2}px`
      const wrapStyle = `width: ${size}px; height: ${size}px; top: ${(50 - size) / 2 - 20}px; left: ${(50 - size) / 2}px`
      let wrapDiv
      let optionDiv
      if (!this.isEdit) { // 编辑状态
        let previewIcon = ''
        let replayIcon = ''
        if (checkPermission(['ScreenPreview'])) {
          previewIcon = `<span class="icon-wrap ${markerOptions.deviceStatus === 'on' ? '' : 'off'}" onclick="previewMarker('${markerOptions.deviceId}')"><i class="icon icon_preview"></i></span>`
        }
        if (checkPermission(['ReplayRecord'])) {
          replayIcon = `<span class="icon-wrap" onclick="replayMarker('${markerOptions.deviceId}')"><i class="icon icon_replay"></i></span>`
        }
        optionDiv = `<div class="marker-options">${previewIcon}${replayIcon}</div>`
      } else {
        const deleteIcon = `<i class="icon icon_delete" onclick="deleteMarker('${markerOptions.deviceId}', '${markerOptions.deviceLabel}')"></i>`
        optionDiv = `<div class="marker-options">${deleteIcon}</div>`
      }
      window.previewMarker = (id) => {
        console.log('播放' + id)
        const pos = this.map.lngLatToContainer(new AMap.LngLat(markerOptions.longitude, markerOptions.latitude))
        const data = {
          show: 'live',
          deviceId: markerOptions.deviceId,
          inProtocol: markerOptions.inProtocol,
          top: pos.y,
          left: pos.x,
          canPlay: markerOptions.deviceStatus === 'on'
        }
        this.markerEventHandlers.onPlay && this.markerEventHandlers.onPlay(data)
      }
      window.replayMarker = (id) => {
        console.log('回放' + id)
        const pos = this.map.lngLatToContainer(new AMap.LngLat(markerOptions.longitude, markerOptions.latitude))
        const data = {
          show: 'replay',
          deviceId: markerOptions.deviceId,
          inProtocol: markerOptions.inProtocol,
          top: pos.y,
          left: pos.x,
          canPlay: true
        }
        this.markerEventHandlers.onPlay && this.markerEventHandlers.onPlay(data)
      }
      window.deleteMarker = (id, name) => {
        this.markerEventHandlers.onDelete(id, name)
      }
      wrapDiv = this.createNode(`<div class="marker-wrap" style="${wrapStyle}">${optionDiv}</div>`)
      markerContent.append(wrapDiv)
    }
    // markerContent.append(sector, marker, label)
    markerContent.append(marker, label)
    return markerContent
  }

  createNode(htmlstr: string) {
    const div = document.createElement('div')
    div.innerHTML = htmlstr
    return div.childNodes[0]
  }

  drawSector(markerOptions: markerObject) {
    const sectorSize = Number(markerOptions.viewRadius) * 2
    const canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    canvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    canvas.setAttribute('width', sectorSize.toString())
    canvas.setAttribute('height', sectorSize.toString())
    canvas.setAttribute('style', 'position: absolute')
    canvas.setAttribute('top', `${50 - sectorSize}px`)
    canvas.setAttribute('left', `${50 - sectorSize}px`)
    const styleText = []
    styleText.push('stroke:red')
    styleText.push('fill:green')
    styleText.push('fill-opacity:0.3')
    const cssText = styleText.join(';')
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('id', markerOptions.deviceId)
    path.style.cssText = cssText
    path.setAttribute('d', buildPath(markerOptions))
    path.setAttribute('transform', `rotate(${Number(markerOptions.deviceAngle) - 90 - Number(markerOptions.viewAngle) / 2}, ${markerOptions.viewRadius}, ${markerOptions.viewRadius})`)
    canvas.appendChild(path)

    function buildPath(markerOptions: markerObject): string {
      const viewRadius = Number(markerOptions.viewRadius)
      const viewAngle = Number(markerOptions.viewAngle)
      const endPosX = Math.cos((viewAngle / 180) * Math.PI) * viewRadius + viewRadius
      const endPosY = Math.sin((viewAngle / 180) * Math.PI) * viewRadius + viewRadius
      return `M ${viewRadius} ${viewRadius} L ${viewRadius * 2} ${viewRadius} A ${viewRadius} ${viewRadius} 0 0 1 ${endPosX} ${endPosY} L ${viewRadius} ${viewRadius}`
    }
    return canvas
  }
}
