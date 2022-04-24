import { DirectiveOptions } from 'vue'
let nodeObj: any = {
  ele: null,
  shiftX: 0,
  shiftY: 0,
  context: null,
  data: null,
  releaseBoundaryInfo: null,
  moveBoundaryInfo: null
}

const mousedownHandle = (eve: any, ele: any, data: any) => {
  const shiftX = eve.clientX - ele.getBoundingClientRect().left
  const shiftY = eve.clientY - ele.getBoundingClientRect().top

  const cloneEle = ele.cloneNode(true)
  nodeObj = {
    ele: cloneEle,
    shiftX,
    shiftY,
    data
  }
  cloneEle.style.position = 'absolute'
  cloneEle.style.zIndex = 10000
  document.body.append(cloneEle)
  document.body.style.userSelect = 'none'
  getBoundary()

  startMovePoint(eve.pageX, eve.pageY)

  document.addEventListener('mousemove', mousemoveHandle)
  document.addEventListener('mouseup', mouseupHandle)
}

// 有效边界
const getBoundary = () => {
  // 获取范围，需要处理边界
  const releaseBoundaryWrap = document.querySelector('.mapwrap').getBoundingClientRect()
  const moveBoundaryWrap = document.querySelector('.device-list').getBoundingClientRect()
  const { top, left, width, height } = releaseBoundaryWrap
  const { top: topM, left: leftM, width: widthM, height: heightM } = moveBoundaryWrap

  // 有效可释放边界
  nodeObj.releaseBoundaryInfo = {
    startTop: top,
    startLeft: left,
    endTop: top + height,
    endLeft: left + width
  }
  // 有效可拖动边界
  nodeObj.moveBoundaryInfo = {
    startTop: topM + 40,
    startLeft: leftM,
    endTop: topM + heightM + 40,
    endLeft: leftM + widthM
  }
}

const mousemoveHandle = (eve: any) => {
  const { startTop, startLeft, endTop, endLeft } = nodeObj.moveBoundaryInfo
  if (eve.pageX > startLeft && eve.pageX < endLeft && eve.pageY > startTop && eve.pageY < endTop) {
    startMovePoint(eve.pageX, eve.pageY)
  } else {
    // todo  边界移动
  }
}

const mouseupHandle = async(eve: any) => {
  const { pageX, pageY } = eve
  const { releaseBoundaryInfo, context, data } = nodeObj

  const { startTop, startLeft, endTop, endLeft } = releaseBoundaryInfo

  if (pageX >= startLeft && pageX <= endLeft && pageY >= startTop && pageY <= endTop) {
    await context.addMarker(data)
    console.log('context.markerInfo====>', context.markerInfo)
    // context.$refs.mapview()
  } else {
    // todo  边界移动
  }

  nodeObj.ele.remove()
  nodeObj = {}
  document.body.style.userSelect = 'auto'
  document.removeEventListener('mousemove', mousemoveHandle)
  document.removeEventListener('mouseup', mouseupHandle)
}

const startMovePoint = (pageX, pageY) => {
  const { ele, shiftX, shiftY } = nodeObj
  ele.style.left = `${pageX - shiftX}px`
  ele.style.top = `${pageY - shiftY}px`
}

const nodeDrag: DirectiveOptions = {
  bind(el: any, { value }, vnode) {
    const { data } = value
    nodeObj.context = vnode.context
    if (!data.isLeaf) return
    console.log('value===>', value, 'data====>', data)
    console.log('context===>', nodeObj.context)
    el.addEventListener('mousedown', (eve) => { mousedownHandle(eve, el, data) })
    el.addEventListener('dragstart', (eve) => { eve.preventDefault() })
    el.addEventListener('dragend', (eve) => { eve.preventDefault() })
    el.addEventListener('dragover', (eve) => { eve.preventDefault() })
  },
  unbind(el: HTMLElement, { value }) {
    const { data } = value
    el.removeEventListener('mousedown', (eve) => { mousedownHandle(eve, el, data) })
  }

}

export default nodeDrag
