import { markerObject } from '@/views/map/models/vmap'
import { checkPermission } from '@/utils/permission'

const createNode = (htmlstr: string) => {
  const div = document.createElement('div')
  div.innerHTML = htmlstr
  return div.childNodes[0]
}

export const drawCamera = (markerOptions: markerObject, options) => {
  const markerContent = document.createElement('div')
  markerContent.setAttribute('class', 'marker-camera')
  let mColor = markerOptions.deviceColor || '#1e78e0'
  if (mColor === '0') {
    mColor = '#1e78e0'
  }
  const marker = createNode(`<svg class="icon-camera" style="fill:${mColor}; enable-background:new 0 0 198.7 179.4;" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 198.7 179.4" xml:space="preserve"> <path d="M41.9,123.8H20.6V96.9L0,93.1v86.3l20.6-6.9v-30h33.1l18.1-24.4l-23.8-12.5L41.9,123.8z M149.4,129.4l48.1-30.6L47.5,0H30 L6.2,37.5V50l131.9,80h11.2L149.4,129.4L149.4,129.4z M131.3,135.6L17.5,61.9L5.6,74.4l131.9,80h11.9l6.2-6.2l6.2-18.1 c0,0-17.5,12.5-18.1,12.5C136.9,138.1,131.3,135.6,131.3,135.6z"/> </svg>`)
  const label = createNode(`<div class="marker-label">${markerOptions.deviceLabel}</div>`)
  markerContent.append(marker, label)
  if (markerOptions.selected) {
    let optionDiv
    if (!options.isEdit) {
      let previewIcon = ''
      let replayIcon = ''
      if (checkPermission(['ScreenPreview'])) {
        previewIcon = `<span class="icon-wrap ${markerOptions.deviceStatus === 'on' ? '' : 'off'}" onclick="previewMarker()"><i class="icon icon_preview"></i></span>`
      }
      if (checkPermission(['ReplayRecord'])) {
        replayIcon = '<span class="icon-wrap" onclick="replayMarker()"><i class="icon icon_replay"></i></span>'
      }
      optionDiv = createNode(`<div class="marker-options">${previewIcon}${replayIcon}</div>`)
    } else { // 编辑状态
      markerContent.setAttribute('class', 'marker-camera selected')
      const deleteIcon = `<i class="icon icon_delete" onclick="deleteMarker('${markerOptions.deviceId}', '${markerOptions.deviceLabel}')"></i>`
      optionDiv = createNode(`<div class="marker-options">${deleteIcon}</div>`)
    }
    window.previewMarker = () => {
      const pos = options.map.lngLatToContainer(new AMap.LngLat(markerOptions.longitude, markerOptions.latitude))
      const data = {
        show: 'live',
        deviceId: markerOptions.deviceId,
        inProtocol: markerOptions.inProtocol,
        top: pos.y,
        left: pos.x,
        canPlay: markerOptions.deviceStatus === 'on'
      }
      options.handlers.onPlay && options.handlers.onPlay(data)
    }
    window.replayMarker = () => {
      const pos = options.map.lngLatToContainer(new AMap.LngLat(markerOptions.longitude, markerOptions.latitude))
      const data = {
        show: 'replay',
        deviceId: markerOptions.deviceId,
        inProtocol: markerOptions.inProtocol,
        top: pos.y,
        left: pos.x,
        canPlay: true
      }
      options.handlers.onPlay && options.handlers.onPlay(data)
    }
    window.deleteMarker = (id, name) => {
      options.handlers.onDelete(id, name)
    }
    markerContent.append(optionDiv)
  }
  return markerContent
}

// const drawSector = (markerOptions: markerObject) => {
//   const sectorSize = Number(markerOptions.viewRadius) * 2
//   const canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
//   canvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
//   canvas.setAttribute('width', sectorSize.toString())
//   canvas.setAttribute('height', sectorSize.toString())
//   canvas.setAttribute('style', 'position: absolute')
//   canvas.setAttribute('top', `${50 - sectorSize}px`)
//   canvas.setAttribute('left', `${50 - sectorSize}px`)
//   const styleText = []
//   styleText.push('stroke:red')
//   styleText.push('fill:green')
//   styleText.push('fill-opacity:0.3')
//   const cssText = styleText.join(';')
//   const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
//   path.setAttribute('id', markerOptions.deviceId)
//   path.style.cssText = cssText
//   path.setAttribute('d', buildPath(markerOptions))
//   path.setAttribute('transform', `rotate(${Number(markerOptions.deviceAngle) - 90 - Number(markerOptions.viewAngle) / 2}, ${markerOptions.viewRadius}, ${markerOptions.viewRadius})`)
//   canvas.appendChild(path)
//
//   function buildPath(markerOptions: markerObject): string {
//     const viewRadius = Number(markerOptions.viewRadius)
//     const viewAngle = Number(markerOptions.viewAngle)
//     const endPosX = Math.cos((viewAngle / 180) * Math.PI) * viewRadius + viewRadius
//     const endPosY = Math.sin((viewAngle / 180) * Math.PI) * viewRadius + viewRadius
//     return `M ${viewRadius} ${viewRadius} L ${viewRadius * 2} ${viewRadius} A ${viewRadius} ${viewRadius} 0 0 1 ${endPosX} ${endPosY} L ${viewRadius} ${viewRadius}`
//   }
//   return canvas
// }
