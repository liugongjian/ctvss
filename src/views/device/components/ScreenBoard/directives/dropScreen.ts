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
  drag.isDragging = true
  drag.node = this.node
  drag.cloneElm = this.elm.cloneNode(true)
  drag.cloneElm.style.display = 'none'
  addClass(drag.cloneElm, 'dragging-node')
  document.body.append(drag.cloneElm)
  addClass(document.querySelector('.screen-grid'), 'dragging-node')
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
  drag.isDragging = false
  let target = e.target
  while (target) {
    if (target.className.startsWith('screen-item')) {
      break
    }
    target = target.parentElement
  }
  if (target) {
    console.log(target.dataset.index)
    drag.context.screenManager.openTreeItem(drag.node.data, null, parseInt(target.dataset.index))
  }
  drag.cloneElm.remove()
  removeClass(document.querySelector('.screen-grid'), 'dragging-node')
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

export const dropScreen: DirectiveOptions = {
  bind(el: any, binding, vnode) {
    const { node, isLive, view } = binding.value
    if (view !== 'screen') return
    if (node.data.type !== 'ipc') return
    if (isLive && node.data.deviceStatus !== 'on') return
    drag.context = vnode.context
    el.node = node
    el.elm = vnode.elm
    el.addEventListener('mousedown', onMouseDown.bind(el))
  },

  unbind(el: HTMLElement) {
    el.removeEventListener('mousedown', onMouseDown)
  }
}
