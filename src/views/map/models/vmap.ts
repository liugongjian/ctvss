import AMapLoader from '@amap/amap-jsapi-loader'
import LngLat = AMap.LngLat
import { getDevice } from '@/api/device'
import { checkPermission } from '@/utils/permission'
import { getStyle } from '@/utils/map'
import { drawCamera } from './draw'

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
        'plugins': ['AMap.MarkerCluster', 'AMap.HawkEye', 'AMap.AutoComplete', 'AMap.Scale', 'AMap.ControlBar', 'AMap.IndexCluster']
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
  markerCluster: AMap.MarkerCluster | null = null
  indexCluster: AMap.IndexCluster | null = null
  markerEventHandlers: markerEventHandlers
  community: AMap.Polygon | null = null // 社区高亮区域
  pois: Array<AMap.Marker | AMap.LabelsLayer> | null = null // 兴趣点
  buildingLayer: AMap.Buildings | null = null // 兴趣点建筑
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
        mapStyle: getStyle()
      }
      if (is3D) {
        options.viewMode = '3D'
      }
      const map = new AMap.Map(this.container, options)
      this.buildingLayer = new AMap.Buildings({
        wallColor: 'rgba(220, 220, 220, 0)',
        roofColor: 'rgba(220, 220, 220, 0)',
        opacity: 0.9,
        zIndex: 130
      })
      map.add(this.buildingLayer)
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
    this.markerCluster.addData(this.wrapMarkers([marker]))
    this.indexCluster.addData(this.wrapMarkers([marker]))
  }

  renderMap(map: mapObject) {
    const { longitude, latitude, zoom } = map
    this.curMapOptions = map
    if (this.map) {
      this.map.setZoomAndCenter(zoom, [longitude, latitude])
      this.map.clearMap()
      if (this.markerCluster) {
        this.markerCluster.setMap(null)
      }
      if (this.indexCluster) {
        this.indexCluster.setMap(null)
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
    this.markerCluster.setData(this.wrapMarkers(markers))
    this.indexCluster.setData(this.wrapMarkers(markers))
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
      this.markerCluster.setMap(null)
      this.indexCluster.setMap(null)
    }
  }

  setCluster(markers: any[]) {
    this.setIndexCluster(markers)
    this.setMarkerCluster(markers)
  }

  // 设置索引聚合
  private setIndexCluster(markers: any[]) {
    if (this.indexCluster) {
      this.indexCluster.setMap(null)
    }
    const clusterIndexSet = {
      groupName: {
        minZoom: 3,
        maxZoom: 15
      }
    }

    const _getStyle = (context) => {
      const clusterData = context.clusterData
      const index = context.index
      const count = context.count
      const indexs = Object.keys(clusterIndexSet)
      const i = indexs.indexOf(index.mainKey)
      let text = clusterData[0][index.mainKey]
      let size = Math.round(30 + Math.pow(count / markers.length, 1 / 5) * 70)
      if (i <= 3) {
        const extra = '<span class="showCount">' + context.count + '</span>'
        text = '<span class="showName">' + text + '</span>'
        text += extra
      } else {
        size = 12 * text.length + 20
      }
      return {
        text: text,
        size: size,
        index: i,
        textAlign: 'center'
      }
    }
    // 自定义聚合点样式
    const _renderIndexClusterMarker = (context) => {
      const index = context.index
      const styleObj = _getStyle(context)
      // 自定义点标记样式
      const div = document.createElement('div')
      div.className = 'index-cluster'
      div.style.width = styleObj.size + 'px'
      div.style.height = styleObj.size + 'px'
      // 自定义点击事件
      context.marker.on('click', (e) => {
        let curZoom = this.map.getZoom()
        if (curZoom < 20) {
          curZoom = clusterIndexSet[index.mainKey].maxZoom
        }
        this.map.setZoomAndCenter(curZoom, e.lnglat)
      })
      div.innerHTML = styleObj.text
      const centerLnglat = this.calAverageLnglat(context.clusterData)
      context.marker.setPosition(new AMap.LngLat(centerLnglat[0], centerLnglat[1]))
      context.marker.setContent(div)
      context.marker.setAnchor('center')
    }

    this.indexCluster = new AMap.IndexCluster(this.map, this.wrapMarkers(markers), {
      averageCenter: false,
      renderClusterMarker: _renderIndexClusterMarker,
      clusterIndexSet: clusterIndexSet
    })
  }

  // 设置相邻聚合
  setMarkerCluster(markers: any[]) {
    if (this.markerCluster) {
      this.markerCluster.setMap(null)
    }
    const count = markers.length
    const _renderClusterMarker = (context: any) => {
      if (this.map.getZoom() < 15) {
        context.marker.setContent(' ')
      } else {
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
    }
    const _renderMarker = (context: any) => {
      if (this.map.getZoom() < 15) {
        context.marker.setContent(' ')
      } else {
        // const content = this.buildContent(context.data[0])
        const content = drawCamera(context.data[0], this.markerEventHandlers)
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
    }

    this.markerCluster = new window.AMap.MarkerCluster(this.map, this.wrapMarkers(markers), {
      maxZoom: 19,
      renderClusterMarker: _renderClusterMarker, // 自定义聚合点样式
      renderMarker: _renderMarker // 自定义非聚合点样式
    })

    this.markerCluster.on('click', item => {
      const len = item.clusterData.length
      if (len <= 1) {
        return
      }
      this.map.setZoomAndCenter(this.map.getZoom() + 1, this.calAverageLnglat(item.clusterData))
    })
  }

  buildContent(markerOptions: markerObject) {
    const markerContent = document.createElement('div')
    markerContent.setAttribute('class', 'marker-containt')
    let mColor = markerOptions.deviceColor || '#1e78e0'
    if (mColor === '0') {
      mColor = '#1e78e0'
    }
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

  /**
   * 渲染社区蒙版
   */
  public renderCommunity(pointsList, mask) {
    if (this.community) {
      this.map.remove(this.community)
    }
    if (mask === 'Y') {
      const outer = [
        new AMap.LngLat(-360, 90, true),
        new AMap.LngLat(-360, -90, true),
        new AMap.LngLat(360, -90, true),
        new AMap.LngLat(360, 90, true)
      ]
      const holes = []
      pointsList.forEach(list => {
        holes.push(this.handlePoint(list.points))
      })
      const path = [
        outer,
        ...holes
      ]
      this.community = new AMap.Polygon({
        // zIndex: 30,
        bubble: true,
        fillColor: '#545d80',
        fillOpacity: 0.45,
        strokeColor: '#ffc000',
        strokeWeight: 0,
        path
      })
      this.map.add(this.community)
    }
  }
  /**
   * 渲染兴趣点
   */
  public renderPoi(pointsList) {
    if (this.pois) {
      this.map.remove(this.pois)
    }
    this.pois = []
    const layer = new AMap.LabelsLayer({
      zooms: [17, 20],
      zIndex: 200,
      collision: true,
      allowCollision: true
    })
    pointsList.forEach(point => {
      if (point.colorType === 'bubble') {
        const marker = new AMap.Marker({
          position: this.handlePoint(point.points)[0],
          offset: new AMap.Pixel(-10, -20),
          zooms: [17, 20],
          content: `<svg class="marker-icon" style="fill:${point.color}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5241"><path d="M832.179718 379.057175c0-176.277796-143.353942-319.077106-320.18023-319.077106-176.898943 0-320.18023 142.79931-320.18023 319.077106 0 212.71159 320.18023 584.961732 320.18023 584.961732S832.179718 591.768765 832.179718 379.057175zM378.580826 379.057175c0-73.443709 59.737546-132.942825 133.418662-132.942825 73.610508 0 133.421732 59.499116 133.421732 132.942825 0 73.364915-59.811224 132.942825-133.421732 132.942825C438.318372 512 378.580826 452.42209 378.580826 379.057175z" p-id="5242"></path></svg>`
        })
        marker.on('mouseover', () => {
          marker.setLabel({
            content: point.tagName,
            direction: 'bottom'
          })
          marker.setzIndex(20)
        })
        marker.on('mouseout', () => {
          marker.setLabel({
            content: ''
          })
          marker.setzIndex(12)
        })
        this.pois.push(marker)
      } else if (point.colorType === 'text') {
        const labelMarker = new AMap.LabelMarker({
          text: {
            content: point.tagName,
            direction: 'right',
            offset: [-20, -15],
            style: {
              fontSize: 12,
              fillColor: '#555',
              strokeColor: '#fff',
              strokeWidth: 2
            }
          },
          position: this.handlePoint(point.points)[0]
        })
        layer.add(labelMarker)
      }
    })
    this.pois.push(layer)
    this.map.add(this.pois)
  }

  /**
   * 渲染楼房颜色
   */
  public renderBuilding(highlightList, buildingList) {
    const areas = []

    // 增加高亮区域楼层颜色
    highlightList.forEach(area => {
      areas.push({
        color1: '#bccfde', // 楼顶颜色
        color2: '#cfdde8', // 楼面颜色
        path: this.handlePoint(area.points)
      })
    })

    // 增加兴趣楼房颜色
    buildingList.forEach(area => {
      areas.push({
        color1: '#ffce6f',
        color2: '#eab754',
        path: this.handlePoint(area.points)
      })
    })

    const buildingOptions = {
      hideWithoutStyle: false, // 是否隐藏设定区域外的楼块
      areas
    }
    this.buildingLayer.setStyle(buildingOptions)
  }

  handlePoint(points) {
    return points.map(item => [item.longitude, item.latitude])
  }

  /**
   * 计算平均坐标
   */
  private calAverageLnglat(points) {
    let lng = 0
    let lat = 0
    points.forEach(point => {
      lng += point.lnglat.lng
      lat += point.lnglat.lat
    })
    return [lng / points.length, lat / points.length]
  }
}
