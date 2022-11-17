import { DirectiveOptions } from 'vue'
import { removeClass, addClass } from '@vss/base/utils'

function ondragover(e) {
  // prevent default to allow drop
  e.preventDefault()
  addClass(this, 'drag-hover')
}

function ondrop(dropCallbalck, e) {
  const nodeData = JSON.parse(e.dataTransfer.getData('deviceTreeNode'))
  dropCallbalck(nodeData)
  removeClass(this, 'drag-hover')
}

function ondragleave() {
  removeClass(this, 'drag-hover')
}

export const droppable: DirectiveOptions = {
  bind(el: any, binding) {
    el.ondragover = ondragover.bind(el)
    el.ondrop = ondrop.bind(el, binding.value)
    el.ondragleave = ondragleave.bind(el)
  }
}
