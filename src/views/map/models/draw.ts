import { markerObject } from '@/views/map/models/vmap'
import { checkPermission } from '@/utils/permission'

const createNode = (htmlstr: string) => {
  const div = document.createElement('div')
  div.innerHTML = htmlstr
  return div.childNodes[0]
}

export const drawCamera = (markerOptions: markerObject, options) => {
  const markerContent = document.createElement('div')
  markerContent.setAttribute('class', 'marker-containt marker-camera')
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
      markerContent.setAttribute('class', 'marker-containt marker-camera selected')
      const deleteIcon = `<i class="icon icon_delete" onclick="deleteDevice('${markerOptions.deviceId}', '${markerOptions.deviceLabel}')"></i>`
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
    window.deleteDevice = (id, name) => {
      options.handlers.onDelete(id, name)
    }
    markerContent.append(optionDiv)
  }
  return markerContent
}

export const drawBubblePoint = (point) => {
  const markerContent = document.createElement('div')
  markerContent.setAttribute('class', 'marker-containt marker-bubblePoint')
  markerContent.setAttribute('id', `marker-point-${point.tagId}`)
  const marker = createNode(`<svg class="icon-interest" style="fill:${point.color}; viewBox="0 0 14 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <title>interest</title> <g id="Web端" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="电子地图--点位编辑" transform="translate(-1224.000000, -73.000000)" fill="#333333" fill-rule="nonzero"> <g id="工具" transform="translate(1174.000000, 68.000000)"> <path d="M56.6,5.33333334 C52.96,5.33333334 50,8.33333334 50,11.9733333 C50,16.9333333 56,21.0533333 56.28,21.2133333 C56.4,21.2933333 56.48,21.3333333 56.6,21.3333333 C56.72,21.3333333 56.84,21.2933333 56.92,21.2133333 C57.16,21.0533333 63.2,16.9333333 63.2,11.9733333 C63.2,8.33333334 60.24,5.33333334 56.6,5.33333334 Z M56.6,20.0133333 C55.36,19.0933333 51.2,15.7333333 51.2,12.0133333 C51.2,9.01333333 53.64,6.57333334 56.6,6.57333334 C59.56,6.57333334 62,9.01333333 62,12.0133333 C62,15.6933333 57.84,19.0933333 56.6,20.0133333 Z M56.6,9.73333333 C55.16,9.73333333 54,10.8933333 54,12.3333333 C54,13.7733333 55.16,14.9333333 56.6,14.9333333 C58.04,14.9333333 59.2,13.7733333 59.2,12.3333333 C59.2,10.8933333 58.04,9.73333333 56.6,9.73333333 Z M56.6,13.7333333 C55.84,13.7333333 55.2,13.0933334 55.2,12.3333333 C55.2,11.5733333 55.84,10.9333333 56.6,10.9333333 C57.36,10.9333333 58,11.5733333 58,12.3333333 C58,13.0933334 57.36,13.7333333 56.6,13.7333333 L56.6,13.7333333 Z" id="interest"></path> </g> </g> </g> </svg>`)
  // const label = createNode(`<div class="marker-label">${point.tagId}</div>`)
  const deleteIcon = `<i class="icon icon_delete" onclick="deleteInterest('${point.tagId}')"></i>`
  const optionDiv = createNode(`<div class="marker-options">${deleteIcon}</div>`)
  markerContent.append(optionDiv)
  markerContent.append(marker)
  return markerContent
}

export const drawTextPoint = (point) => {
  const markerContent = document.createElement('div')
  markerContent.setAttribute('class', 'marker-containt marker-textPoint')
  markerContent.setAttribute('id', `marker-point-${point.tagId}`)
  const marker = createNode(`<div class="text-wrap">${point.tagName}</div>`)
  const deleteIcon = `<i class="icon icon_delete" onclick="deleteInterest('${point.tagId}')"></i>`
  const optionDiv = createNode(`<div class="marker-options">${deleteIcon}</div>`)
  markerContent.append(marker, optionDiv)
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
