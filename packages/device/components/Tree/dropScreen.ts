import { DirectiveOptions } from 'vue'
import { removeClass, addClass } from '@/utils'

const drag: any = {
  isDragging: false,
  context: null,
  node: null,
  cloneElm: null
}

/* 开始拖拽 */
function onMouseDown() {
  console.log('start')
  drag.isDragging = true
  drag.node = this.node
  drag.cloneElm = document.createElement('div')
  drag.cloneElm.append(this.elm.cloneNode(true))
  drag.cloneElm.style.display = 'none'
  addClass(drag.cloneElm.children[0], 'dragging-node')
  document.body.append(drag.cloneElm)
  const screenGrid: HTMLDivElement = document.querySelector('.screen-grid')
  screenGrid && addClass(screenGrid, 'dragging-node')
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

/* 拖拽中 */
function onMouseMove(e) {
  drag.cloneElm.style.display = 'block'
  drag.cloneElm.style.position = 'absolute'
  drag.cloneElm.style.left = `${e.x + 10}px`
  drag.cloneElm.style.top = `${e.y + 10}px`
}

/* 结束拖拽 */
function onMouseUp(e) {
  drag.cloneElm.remove()
  drag.isDragging = false
  const screenGrid: HTMLDivElement = document.querySelector('.screen-grid')
  screenGrid && removeClass(screenGrid, 'dragging-node')
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  let target = e.target
  while (target) {
    if (target.className && target.className.startsWith('screen-item')) {
      break
    }
    target = target.parentElement
  }
  if (target) {
    drag.context.screenManager.openTreeItem(drag.node.data, null, parseInt(target.dataset.index))
  }
}

export const dropScreen: DirectiveOptions = {
  bind(el: any, binding, vnode) {
    // console.log(binding.value, el)
    const { node } = binding.value
    // if (view !== 'screen') return
    if (node.data.type !== 'ipc') return
    // if (isLive && node.data.deviceStatus !== 'on') return
    drag.context = vnode.context
    el.node = node
    el.elm = vnode.elm
    el.addEventListener('mousedown', onMouseDown.bind(el))
  },

  unbind(el: HTMLElement) {
    el.removeEventListener('mousedown', onMouseDown)
  }
}
