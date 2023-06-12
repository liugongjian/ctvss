import { DirectiveOptions } from 'vue'
import { removeClass, addClass } from '@/utils'
import { checkPermission } from '@vss/base/utils/permission'

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
  drag.cloneElm.remove()
  drag.isDragging = false
  removeClass(document.querySelector('.screen-grid'), 'dragging-node')
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
    const { node, isLive, view } = binding.value
    if (view !== 'screen') return
    if (node.data.type !== 'ipc') return
    if (isLive && node.data.deviceStatus !== 'on') return
    const perms = isLive ? ['ivs:GetLiveStream'] : ['ivs:GetCloudRecord']
    if (!checkPermission(perms, node.data)) {
      return
    }
    drag.context = vnode.context
    el.node = node
    el.elm = vnode.elm
    el.addEventListener('mousedown', onMouseDown.bind(el))
  },

  unbind(el: HTMLElement) {
    el.removeEventListener('mousedown', onMouseDown)
  }
}
