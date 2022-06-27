import AMapLoader from '@amap/amap-jsapi-loader'
import LngLat = AMap.LngLat
import { getDevice } from '@/api/device'
// import { checkPermission } from '@/utils/permission'
import { getStyle } from '@/utils/map'
import { drawCamera, drawBubblePoint, drawTextPoint } from '../utils/draw'

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
          'AMap.PolygonEditor'
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
  community: AMap.Polygon | null = null // 社区高亮区域
  pois: Array<AMap.Marker | AMap.LabelsLayer> | null = null // 兴趣点
  buildingLayer: AMap.Buildings | null = null // 兴趣点建筑
  mouseTool: AMap.MouseTool | null = null
  mouseToolHandler: any
  polygonEditor: AMap.PolygonEditor | null = null
  InterestEventHandlers: any
  polygons = [] // 为了编辑临时显示的多边形
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
      // pointer，polygen，interest，font)
      if (this.eventState === 'interest') {
        this.InterestEventHandlers.addPoi(e.obj.getPosition(), 'interest')
      } else if (this.eventState === 'font') {
        this.InterestEventHandlers.addPoi(e.obj.getPosition(), 'font')
        console.log('draw font')
      } else if (this.eventState === 'polygon') {
        this.InterestEventHandlers.addPolygon(e.obj.getPath())
        console.log('draw polygen')
      } else {
        console.log('other')
      }
    })
  }

  change3D(is3D) {
    const { longitude, latitude, zoom } = this.curMapOptions
    this.map.destroy()
    this.creatMap(longitude, latitude, zoom, is3D)
  }

  async chooseMarker(marker) {
    if (!marker.selected) {
      this.cancelChoose(true)
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

  // @isMarker 是否摄像头点位本身触发的取消选取
  cancelChoose(isMarker) {
    if (isMarker) {
      this.InterestEventHandlers.clickPoi(null)
      this.polygonEditor.close()
    }
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
        const content = drawCamera(context.data[0], {
          handlers: this.markerEventHandlers,
          isEdit: this.isEdit,
          map: this.map
        })
        context.marker.setContent(content)
        context.marker.setOffset(new AMap.Pixel(-20, -65))
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
          if (this.eventState === 'pointer') {
            const marker = context.marker.getExtData()
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
    window.deleteInterest = (id) => {
      this.InterestEventHandlers.deletePoi(id)
    }
    pointsList.forEach(point => {
      const { colorType } = JSON.parse(point.appearance)
      if (colorType === 'bubble') {
        const marker = new AMap.Marker({
          position: this.handlePoint(point.points)[0],
          offset: new AMap.Pixel(-20, -20),
          zooms: [15, 20],
          // content: `<svg class="marker-icon" style="fill:${point.color}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5241"><path d="M832.179718 379.057175c0-176.277796-143.353942-319.077106-320.18023-319.077106-176.898943 0-320.18023 142.79931-320.18023 319.077106 0 212.71159 320.18023 584.961732 320.18023 584.961732S832.179718 591.768765 832.179718 379.057175zM378.580826 379.057175c0-73.443709 59.737546-132.942825 133.418662-132.942825 73.610508 0 133.421732 59.499116 133.421732 132.942825 0 73.364915-59.811224 132.942825-133.421732 132.942825C438.318372 512 378.580826 452.42209 378.580826 379.057175z" p-id="5242"></path></svg>`
          content: drawBubblePoint(point)
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
            this.cancelChoose(false)
            this.InterestEventHandlers.clickPoi(point)
            this.polygonEditor.close()
          }
        })
        this.pois.push(marker)
      } else if (colorType === 'text') {
        const marker = new AMap.Marker({
          position: this.handlePoint(point.points)[0],
          offset: new AMap.Pixel(-90, -26),
          zooms: [15, 20],
          content: drawTextPoint(point)
        })
        marker.on('click', () => {
          if (this.eventState === 'pointer' && this.isEdit) {
            this.cancelChoose(false)
            this.InterestEventHandlers.clickPoi(point)
            this.polygonEditor.close()
          }
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

  /**
   * 创建多边形区域，为了修改编辑
   */
  renderPolygon(highlightList, buildingList) {
    console.log('renderPolygon')
    this.map.remove(this.polygons)
    this.polygons = []
    const polygons = highlightList.concat(buildingList)
    polygons.forEach(item => {
      const polygon = new AMap.Polygon({
        map: this.map,
        path: this.handlePoint(item.points),
        fillOpacity: 0,
        bubble: false
      })
      polygon.on('click', () => {
        if (this.eventState === 'pointer' && this.isEdit) {
          console.log('polygon click')
          this.cancelChoose(false) // 取消摄像头点位点击
          this.InterestEventHandlers.clickPoi() // 取消兴趣点点位点击
          this.InterestEventHandlers.clickPolygon(item)
          this.polygonEditor.setTarget(polygon)
          this.polygonEditor.open()
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
        this.mouseTool.marker({content: '<div></div>'})
        break
      case 'font':
        this.mouseTool.marker({content: '<div></div>'})
        break
      case 'polygon':
        this.mouseTool.polygon({
          fillOpacity: 0
        })
        break
    }
  }
  changeMapState(state) {
    if (this.eventState !== state) {
      console.log('changeMapState')
      this.mouseTool && this.mouseTool.close(true)
      const drawState = ['interest', 'font', 'polygon']
      this.eventState = state
      if (drawState.includes(state)) {
        (document.getElementsByClassName('amap-maps')[0] as HTMLElement).style.cursor = 'crosshair'
        this.drawInterest(state)
      } else {
        (document.getElementsByClassName('amap-maps')[0] as HTMLElement).style.cursor = 'default'
        this.eventState = 'pointer'
      }
    }
  }
}

