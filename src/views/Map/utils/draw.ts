import { markerObject } from '@/views/Map/models/VMap'
import { checkPermission } from '@/utils/permission'
import { drawCameraBg } from './svg'

const createNode = (htmlstr: string) => {
  const div = document.createElement('div')
  div.innerHTML = htmlstr
  return div.childNodes[0]
}

export const drawCamera = (markerOptions: markerObject, options) => {
  const markerContent = document.createElement('div')
  markerContent.setAttribute('class', 'marker-containt marker-camera')
  const appearance = markerOptions.appearance || '{}'
  let mColor = JSON.parse(appearance).color || '#FA8334'
  if (mColor === '0') {
    mColor = '#FA8334'
  }
  const cameraBg = createNode(drawCameraBg(mColor))
  // eslint-disable-next-line max-len
  const marker = createNode('<svg class="icon-camera" style="fill:#fff; enable-background:new 0 0 198.7 179.4;" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 198.7 179.4" xml:space="preserve"> <path d="M41.9,123.8H20.6V96.9L0,93.1v86.3l20.6-6.9v-30h33.1l18.1-24.4l-23.8-12.5L41.9,123.8z M149.4,129.4l48.1-30.6L47.5,0H30 L6.2,37.5V50l131.9,80h11.2L149.4,129.4L149.4,129.4z M131.3,135.6L17.5,61.9L5.6,74.4l131.9,80h11.9l6.2-6.2l6.2-18.1 c0,0-17.5,12.5-18.1,12.5C136.9,138.1,131.3,135.6,131.3,135.6z"/> </svg>')
  const label = createNode(`<div class="marker-label">${markerOptions.deviceLabel}</div>`)
  markerContent.append(cameraBg, marker, label)
  if (markerOptions.selected) {
    let optionDiv
    if (!options.isEdit) {
      let previewIcon = ''
      let replayIcon = ''
      if (checkPermission(['ScreenPreview'])) {
        previewIcon = `<span class="icon-wrap ${markerOptions.deviceStatus === 'on' ? '' : 'off'}" onclick="previewMarker()" title="实时预览"><i class="icon icon_preview"></i></span>`
      }
      if (checkPermission(['ReplayRecord'])) {
        replayIcon = '<span class="icon-wrap" onclick="replayMarker()" title="录像回放"><i class="icon icon_replay"></i></span>'
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
  const appearance = point.appearance || '{}'
  const color = JSON.parse(appearance).color || '#FA8334'
  const show = JSON.parse(appearance).showLabel || false
  const marker = createNode(`<svg class="icon-interest" width="26px" height="30px" viewBox="0 0 26 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g id="Web端" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="电子地图--兴趣点工具" transform="translate(-734.000000, -370.000000)" fill="${color}" fill-rule="nonzero"> <g id="摄像头点位-copy" transform="translate(620.000000, 200.000000)"> <path d="M126.727273,170 C133.746556,170 139.454545,175.625 139.454545,182.45 C139.454545,191.75 127.807163,199.475 127.344353,199.775 C127.190083,199.925 126.958678,200 126.727273,200 C126.495868,200 126.341598,199.925 126.110193,199.775 C125.570248,199.475 114,191.75 114,182.45 C114,175.625 119.707989,170 126.727273,170 Z M126.272727,177.272727 C123.503497,177.272727 121.272727,179.503497 121.272727,182.272727 C121.272727,185.041958 123.503497,187.272727 126.272727,187.272727 C129.041958,187.272727 131.272727,185.041958 131.272727,182.272727 C131.272727,179.503497 129.041958,177.272727 126.272727,177.272727 Z M126.272727,185.454545 C125.038961,185.454545 124,184.207792 124,182.727273 C124,181.246753 125.038961,180 126.272727,180 C127.506494,180 128.545455,181.246753 128.545455,182.727273 C128.545455,184.207792 127.506494,185.454545 126.272727,185.454545 L126.272727,185.454545 Z" id="Shape-Copy-3"></path> </g> </g> </g> </svg>`)
  const deleteIcon = `<i class="icon icon_delete" onclick="deleteInterest('${point.tagId}', '${point.type}')"></i>`
  const optionDiv = createNode(`<div class="marker-options">${deleteIcon}</div>`)
  markerContent.append(optionDiv)
  markerContent.append(marker)
  if (show) {
    const label = createNode(`<div class="marker-label">${point.tagName}</div>`)
    markerContent.append(label)
  }
  return markerContent
}

export const drawTextPoint = (point) => {
  const markerContent = document.createElement('div')
  markerContent.setAttribute('class', 'marker-containt marker-textPoint')
  markerContent.setAttribute('id', `marker-point-${point.tagId}`)
  const appearance = point.appearance || '{}'
  let style = ''
  const color = JSON.parse(appearance).color
  const fontSize = JSON.parse(appearance).fontSize
  const bolder = JSON.parse(appearance).bolder
  const italic = JSON.parse(appearance).italic
  color && (style += `color: ${color};`)
  fontSize && (style += `font-size: ${fontSize}px;`)
  bolder && (style += 'font-weight: bolder;')
  italic && (style += 'font-style: italic;')
  const marker = createNode(`<div class="text-wrap" style="${style}" title="${point.tagName}">${point.tagName}</div>`)
  const deleteIcon = `<i class="icon icon_delete" onclick="deleteInterest('${point.tagId}', '${point.type}')"></i>`
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
