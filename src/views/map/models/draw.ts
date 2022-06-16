import { markerEventHandlers, markerObject } from '@/views/map/models/vmap'
import { checkPermission } from '@/utils/permission'

const createNode = (htmlstr: string) => {
  const div = document.createElement('div')
  div.innerHTML = htmlstr
  return div.childNodes[0]
}

export const drawCamera = (markerOptions: markerObject, handlers: markerEventHandlers) => {
  const markerContent = document.createElement('div')
  markerContent.setAttribute('class', 'marker-camera')
  let mColor = markerOptions.deviceColor || '#1e78e0'
  if (mColor === '0') {
    mColor = '#1e78e0'
  }
  const marker = createNode(`<svg class="icon icon-camera" style="fill:${mColor}" t="1655107099025" viewBox="0 0 1600 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="33340" xmlns:xlink="http://www.w3.org/1999/xlink" width="312.5" height="200"><defs><style type="text/css">@font-face { font-family: feedback-iconfont; src: url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.woff2?t=1630033759944") format("woff2"), url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.woff?t=1630033759944") format("woff"), url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.ttf?t=1630033759944") format("truetype"); }\\n\` + '</style></defs><path d="M342.4 702.272h-108.8v-137.6L128 545.472v441.6l105.6-35.2v-153.6H403.2l92.8-124.8-121.6-64-32 92.8z m550.4 28.8l246.4-156.8-768-505.6H281.6l-121.6 192v64l675.2 409.6h57.6v-3.2z m-92.8 32l-582.4-377.6-60.8 64 675.2 409.6h60.8l32-32 32-92.8s-89.6 64-92.8 64c-35.2-22.4-64-35.2-64-35.2z" p-id="33341"></path></svg>`)
  const label = createNode(`<div class="marker-label">${markerOptions.deviceLabel}</div>`)
  markerContent.append(marker, label)
  if (markerOptions.selected) {
    let optionDiv
    if (!this.isEdit) {
      let previewIcon = ''
      let replayIcon = ''
      if (checkPermission(['ScreenPreview'])) {
        previewIcon = `<span class="icon-wrap ${markerOptions.deviceStatus === 'on' ? '' : 'off'}" onclick="previewMarker()"><i class="icon icon_preview"></i></span>`
      }
      if (checkPermission(['ReplayRecord'])) {
        replayIcon = '<span class="icon-wrap" onclick="replayMarker()"><i class="icon icon_replay"></i></span>'
      }
      optionDiv = `<div class="marker-options">${previewIcon}${replayIcon}</div>`
    } else { // 编辑状态
      markerContent.setAttribute('class', 'marker-camera selected')
      const deleteIcon = `<i class="icon icon_delete" onclick="deleteMarker('${markerOptions.deviceId}', '${markerOptions.deviceLabel}')"></i>`
      optionDiv = `<div class="marker-options">${deleteIcon}</div>`
    }
    window.previewMarker = () => {
      const pos = this.map.lngLatToContainer(new AMap.LngLat(markerOptions.longitude, markerOptions.latitude))
      const data = {
        show: 'live',
        deviceId: markerOptions.deviceId,
        inProtocol: markerOptions.inProtocol,
        top: pos.y,
        left: pos.x,
        canPlay: markerOptions.deviceStatus === 'on'
      }
      handlers.onPlay && handlers.onPlay(data)
    }
    window.replayMarker = () => {
      const pos = this.map.lngLatToContainer(new AMap.LngLat(markerOptions.longitude, markerOptions.latitude))
      const data = {
        show: 'replay',
        deviceId: markerOptions.deviceId,
        inProtocol: markerOptions.inProtocol,
        top: pos.y,
        left: pos.x,
        canPlay: true
      }
      handlers.onPlay && handlers.onPlay(data)
    }
    window.deleteMarker = (id, name) => {
      handlers.onDelete(id, name)
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
