import AMapLoader from '@amap/amap-jsapi-loader'
import LngLat = AMap.LngLat
import { getDevice } from '@/api/device'
// import { checkPermission } from '@/utils/permission'
import { getStyle } from '@/utils/map'
import { drawCamera, drawBubblePoint, drawTextPoint } from '../utils/draw'
import { MapModule } from '@/store/modules/map'
import { isEqual } from 'lodash'
import settings from '../settings'
export interface mapObject {
  mapId: string,
  name: string,
  longitude: number,
  latitude: number,
  zoom: number,
  mask?: string
  eagle?: string
  dimension?: string
  marker?: string
  groupByGroupId?: string
  groupByAdjacent?: string
  defaultDeviceColor?: string
}

declare global {
  interface Window {
    deleteDevice?: any,
    replayMarker?: any,
    previewMarker?: any,
    _AMapSecurityConfig?: any,
    deleteInterest?: any
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
  appearance?: string
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
  window._AMapSecurityConfig = {
    securityJsCode: 'c2a13cfa2724b2aecf4af86c7dfcb3e2'
  }
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap)
    } else {
      AMapLoader.load({
        'key': '9a9dac9cd0638cf37e2277ec8e60c0ee',
        'version': '2.0',
        'plugins': [
          'AMap.MarkerCluster',
          'AMap.HawkEye',
          'AMap.AutoComplete',
          'AMap.Scale',
          'AMap.ControlBar',
          'AMap.IndexCluster',
          'AMap.MouseTool',
          'AMap.PolygonEditor',
          'AMap.MapType'
        ]
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
  eventState = 'map' // 点击状态 polygen，poi，font
  overView: AMap.HawkEye | null = null
  markerCluster: AMap.MarkerCluster | null = null
  indexCluster: AMap.IndexCluster | null = null
  markerEventHandlers: markerEventHandlers
  community: AMap.Polygon | null = null // 社区高亮区域（有蒙版）
  highlightAreas = [] // 社区高亮多边形（无蒙版）
  pois: Array<AMap.Marker> = [] // 兴趣点
  buildingLayer: AMap.Buildings | null = null // 兴趣点建筑
  mouseTool: AMap.MouseTool | null = null
  mouseToolHandler: any
  polygonEditor: AMap.PolygonEditor | null = null
  InterestEventHandlers: any
  polygons = [] // 为了编辑临时显示的多边形
  EscEvent: any = () => {}
  constructor(container: string) {
    this.container = container
  }

  creatMap(lng: number, lat: number, zoom: number, is3D: boolean = false, isOverView: boolean = false) {
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
        visible: isOverView,
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
      const mapType = new AMap.MapType({
        defaultType: 0,
        position: {
          bottom: '130px',
          left: '210px'
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
      map.addControl(mapType)
      // map.on('click', () => {
      //   this.cancelChoose()
      // })
      this.polygonEditor = new AMap.PolygonEditor(map)
      this.map = map
    } catch (e) {
      console.log(e)
    }
  }

  setInterestHandlers(handlers) {
    this.InterestEventHandlers = handlers
    this.mouseTool = new AMap.MouseTool(this.map)
    this.mouseTool.on('draw', (e) => {
      if (this.eventState === 'interest') {
        if (this.map.getZoom() < 15) {
          this.map.setZoomAndCenter(15, e.obj.getPosition())
        }
        this.InterestEventHandlers.addPoi(e.obj.getPosition(), 'interest')
      } else if (this.eventState === 'font') {
        if (this.map.getZoom() < 15) {
          this.map.setZoomAndCenter(15, e.obj.getPosition())
        }
        this.InterestEventHandlers.addPoi(e.obj.getPosition(), 'font')
      } else if (this.eventState === 'polygon') {
        const path = e.obj.getPath()
        const area = Math.round(AMap.GeometryUtil.ringArea(path))
        if (area > 0) {
          this.InterestEventHandlers.addPolygon(e.obj.getPath())
        }
        this.mouseTool.close(true)
        this.mouseTool.polygon({
          fillOpacity: 0,
          strokeWeight: 1
        })
      } else {
        console.log('other')
      }
    })
    const handlePolyEdit = (polygon) => {
      const newPath = polygon.getPath()
      const newPoints = newPath.map(item => ({ longitude: item.lng.toString(), latitude: item.lat.toString() }))
      const newPolygon = {
        ...polygon.getExtData(),
        points: newPoints
      }
      this.InterestEventHandlers.changePolygon(newPolygon)
    }
    this.polygonEditor.on('adjust', (e) => {
      handlePolyEdit(e.target)
    })
    this.polygonEditor.on('addnode', (e) => {
      handlePolyEdit(e.target)
    })
    this.polygonEditor.on('removenode', (e) => {
      handlePolyEdit(e.target)
    })
    this.polygonEditor.on('end', (e) => {
      const newId = e.target.getExtData().tagId
      const oldId = MapModule.polygonEdit?.id
      const newPath = e.target.getPath()
      const oldPoints = MapModule.polygonEdit?.points
      const newPoints = newPath.map(item => ({ longitude: item.lng.toString(), latitude: item.lat.toString() }))
      if (isEqual(newId, oldId) && !isEqual(oldPoints, newPoints)) {
        const newPolygon = {
          ...e.target.getExtData(),
          points: newPoints
        }
        this.InterestEventHandlers.changePolygon(newPolygon)
      }
    })
    this.EscEvent = (e) => {
      if (e.code === 'Escape') {
        this.mouseTool.close(true)
        this.mouseTool.polygon({
          fillOpacity: 0,
          strokeWeight: 1
        })
      }
    }
  }

  change3D(is3D, isOverView) {
    const { longitude, latitude, zoom } = this.curMapOptions
    this.map.destroy()
    this.creatMap(longitude, latitude, zoom, is3D, isOverView)
    this.setInterestHandlers(this.InterestEventHandlers)
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
    // 切换编辑状态，自动切换3D角度setPitch
    if (!this.isEdit) {
      this.map.setPitch(50)
      this.map.remove(this.polygons)
      this.pois.forEach(poi => {
        poi.setDraggable(false)
      })
    } else {
      this.map.setPitch(0)
      this.pois.forEach(poi => {
        poi.setDraggable(true)
      })
    }
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
    this.markerCluster && this.markerCluster.addData(this.wrapMarkers([marker]))
    this.indexCluster && this.indexCluster.addData(this.wrapMarkers([marker]))
  }

  renderMap(map: mapObject) {
    const { longitude, latitude, zoom, dimension, eagle } = map
    const is3D = dimension === 'Y'
    const overView = eagle === 'Y'
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
      this.creatMap(longitude, latitude, zoom, is3D, overView)
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
    this.markerCluster && this.markerCluster.setData(this.wrapMarkers(markers))
    this.indexCluster && this.indexCluster.setData(this.wrapMarkers(markers))
  }

  cancelChoose() {
    if (this.curMarkerList && this.curMarkerList.length > 0) {
      this.curMarkerList.forEach((item) => {
        item.selected = false
      })
      this.setCluster(this.wrapMarkers(this.curMarkerList))
    }
  }

  setCluster(markers: any[]) {
    let minZoom = 0
    if (this.curMapOptions.groupByGroupId === 'Y') {
      this.setIndexCluster(markers)
      minZoom = 15
    }
    this.setMarkerCluster(markers, minZoom)
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
      div.style.backgroundColor = this.curMapOptions.defaultDeviceColor
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
  setMarkerCluster(markers: any[], minZoom = 0) {
    if (this.markerCluster) {
      this.markerCluster.setMap(null)
    }
    const count = markers.length
    const _renderClusterMarker = (context: any) => {
      if (this.map.getZoom() < minZoom) {
        context.marker.setContent(' ')
      } else {
        const div = document.createElement('div')
        const bgColor = this.curMapOptions.defaultDeviceColor || settings.defaultDeviceColor
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
      if (this.map.getZoom() < minZoom) {
        context.marker.setContent(' ')
      } else {
        // const content = this.buildContent(context.data[0])
        const content = drawCamera(context.data[0], {
          defaultDeviceColor: this.curMapOptions.defaultDeviceColor,
          handlers: this.markerEventHandlers,
          isEdit: this.isEdit,
          map: this.map
        })
        context.marker.setContent(content)
        context.marker.setOffset(new AMap.Pixel(-20, -65))
        context.marker.setExtData(context.data[0])
        if (this.isEdit && this.eventState === 'pointer') {
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
          if (this.eventState === 'pointer') {
            const marker = context.marker.getExtData()
            this.cancelPoly()
            this.InterestEventHandlers.clickPoi()
            this.chooseMarker(marker)
          }
        })
        context.marker.setLabel({
          offset: new AMap.Pixel(0, 10),
          content: `<div class='marker-label-info'>${context.data[0].deviceLabel}</div>`,
          direction: 'center'
        })
      }
    }

    this.markerCluster = new window.AMap.MarkerCluster(this.map, this.wrapMarkers(markers), {
      maxZoom: this.curMapOptions.groupByAdjacent === 'Y' ? 19 : 0.1,
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

  /**
   * 渲染社区蒙版
   */
  public renderCommunity(pointsList, mask) {
    if (this.community) {
      this.map.remove(this.community)
    }
    if (this.highlightAreas.length > 0) {
      this.map.remove(this.highlightAreas)
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
    } else {
      this.highlightAreas = []
      pointsList.forEach(area => {
        const appearance = area.appearance || '{}'
        const { fillColor, fillOpacity, strokeColor, strokeWeight } = JSON.parse(appearance)
        const polygon = new AMap.Polygon({
          path: this.handlePoint(area.points),
          fillColor: fillColor || '#545d80',
          fillOpacity: fillOpacity || 0.45,
          strokeColor: strokeColor || '#ffc000',
          strokeWeight: strokeWeight || 0
        })
        this.highlightAreas.push(polygon)
      })
      this.map.add(this.highlightAreas)
    }
  }

  /**
   * 渲染兴趣点
   */
  public renderPoi(pointsList) {
    if (this.pois.length > 0) {
      this.map.remove(this.pois)
    }
    this.pois = []
    window.deleteInterest = (id, type) => {
      this.InterestEventHandlers.deletePoi(id, type)
    }
    pointsList.forEach(point => {
      const appearance = point.appearance || '{}'
      const { colorType } = JSON.parse(appearance)
      if (colorType === 'bubble') {
        const marker = new AMap.Marker({
          position: this.handlePoint(point.points)[0],
          offset: new AMap.Pixel(-20, -20),
          zooms: [15, 20],
          content: drawBubblePoint(point),
          draggable: this.isEdit && this.eventState === 'pointer'
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
        marker.on('click', () => {
          if (this.eventState === 'pointer' && this.isEdit) {
            this.cancelChoose()
            this.cancelPoly()
            this.InterestEventHandlers.clickPoi(point, 'interest')
          }
        })
        marker.on('dragend', () => {
          const { lng, lat } = marker.getPosition()
          const newPoint = {
            ...point,
            points: [{ longitude: lng.toString(), latitude: lat.toString() }],
            appearance: JSON.parse(appearance)
          }
          this.InterestEventHandlers.changePoi('interest', newPoint)
        })
        this.pois.push(marker)
      } else if (colorType === 'text') {
        const marker = new AMap.Marker({
          position: this.handlePoint(point.points)[0],
          offset: new AMap.Pixel(-90, -26),
          zooms: [15, 20],
          content: drawTextPoint(point),
          draggable: this.isEdit && this.eventState === 'pointer'
        })
        marker.on('click', () => {
          if (this.eventState === 'pointer' && this.isEdit) {
            this.cancelChoose()
            this.InterestEventHandlers.clickPoi(point, 'font')
            this.cancelPoly()
          }
        })
        marker.on('dragend', () => {
          const { lng, lat } = marker.getPosition()
          const newPoint = {
            ...point,
            points: [{ longitude: lng.toString(), latitude: lat.toString() }],
            appearance: JSON.parse(appearance)
          }
          this.InterestEventHandlers.changePoi('font', newPoint)
        })
        this.pois.push(marker)
      }
    })
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
      const appearance = area.appearance || '{}'
      const { roofColor, wallColor } = JSON.parse(appearance)
      areas.push({
        color1: roofColor || '#ffce6f',
        color2: wallColor || '#eab754',
        path: this.handlePoint(area.points)
      })
    })

    const buildingOptions = {
      hideWithoutStyle: false, // 是否隐藏设定区域外的楼块
      areas
    }
    this.buildingLayer.setStyle(buildingOptions)
  }

  cancelPoly(isFromMap = false) {
    this.polygonEditor.close()
    if (!isFromMap) {
      MapModule.SetIsClickInterest(true)
    }
  }

  choosePolygon(interest) {
    MapModule.SetIsClickInterest(true)
    MapModule.SetPolygonEdit({
      id: interest.tagId,
      points: interest.points
    })
    const polygon = this.polygons.find(item => item.getExtData().tagId === interest.tagId)
    this.cancelChoose()
    this.InterestEventHandlers.clickPoi()
    this.InterestEventHandlers.clickPolygon(interest)
    this.polygonEditor.setTarget(polygon)
    this.polygonEditor.open()
  }

  /**
   * 创建多边形区域，为了修改编辑
   */
  renderPolygon(highlightList, buildingList) {
    this.map.remove(this.polygons)
    this.polygons = []
    const polygons = highlightList.concat(buildingList)
    polygons.forEach(item => {
      const polygon = new AMap.Polygon({
        map: this.map,
        path: this.handlePoint(item.points),
        fillOpacity: 0,
        strokeWeight: 1,
        strokeOpacity: 0.5,
        extData: item
      })
      polygon.on('click', () => {
        if (this.eventState === 'pointer' && this.isEdit) {
          this.choosePolygon(item)
        }
      })
      this.polygons.push(polygon)
    })
  }

  handlePoint(points) {
    return points.map(item => [parseFloat(item.longitude), parseFloat(item.latitude)])
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

  drawInterest(type) {
    switch (type) {
      case 'interest':
        this.mouseTool.marker({ content: '<div></div>' })
        break
      case 'font':
        this.mouseTool.marker({ content: '<div></div>' })
        break
      case 'polygon':
        this.mouseTool.polygon({
          fillOpacity: 0,
          strokeWeight: 1
        })
        break
    }
  }
  changeMapState(state) {
    if (this.eventState !== state) {
      this.mouseTool && this.mouseTool.close(true)
      this.eventState = state
      this.cancelChoose()
      this.cancelPoly()
      this.InterestEventHandlers && this.InterestEventHandlers.clickPoi()
      window.removeEventListener('keydown', this.EscEvent)
      if (state === 'polygon') {
        window.addEventListener('keydown', this.EscEvent)
      }
      if (state === 'pointer') {
        (document.getElementsByClassName('amap-maps')[0] as HTMLElement).style.cursor = 'default'
        this.isEdit && this.pois.forEach(poi => {
          poi.setDraggable(true)
        })
      } else {
        (document.getElementsByClassName('amap-maps')[0] as HTMLElement).style.cursor = 'crosshair'
        this.pois.forEach(poi => {
          poi.setDraggable(false)
        })
        this.drawInterest(state)
      }
    }
  }
}
