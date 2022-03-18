import { DirectiveOptions } from 'vue'

/**
 * 鼠标进入回调
 */
function onMouseOver() {
  this.timer && clearTimeout(this.timer)
  showTools.call(this)
}

/**
 * 鼠标移出回调
 */
function onMouseOut() {
  setMouseEvent.call(this, 500)
}

/**
 * 鼠标移动回调
 */
function onMouseMove() {
  const eventTarget: EventTarget = window.event?.target
  if (checkIsVideo(eventTarget)) {
    setMouseEvent.call(this, 3000)
  }
}

/**
 * 延时隐藏工具栏
 * @param delay 延时时间
 */
function setMouseEvent(delay: number) {
  this.timer && clearTimeout(this.timer)
  showTools.call(this)
  this.timer = setTimeout(() => {
    hiddenTools.call(this)
  }, delay)
}

/**
 * 校验鼠标是否指向视频
 * @param dom 鼠标指向的DOM元素
 * @returns 校验结果
 */
function checkIsVideo(dom: EventTarget) {
  if (['VIDEO', 'CANVAS'].includes((dom as HTMLElement).nodeName)) {
    return true
  } else {
    return false
  }
}

/**
 * 隐藏player__wrap工具栏与头部
 */
function hiddenTools() {
  let classVal = this.getAttribute('class')
  classVal = classVal.concat(classVal.indexOf('player__wrap--hidden cursor--hidden') >= 0 ? '' : ' player__wrap--hidden cursor--hidden')
  this.setAttribute('class', classVal)
  // 去除tooltip（可能出现tooltip隐藏不了）
  let tooltipDoms = document.getElementsByClassName('el-tooltip__popper')
  Array.from(tooltipDoms).forEach((dom: any) => {
    dom.style.display = 'none'
  })
}

/**
 * 显示player__wrap工具栏与头部
 */
function showTools() {
  let classVal = this.getAttribute('class')
  classVal = classVal.replace(' player__wrap--hidden cursor--hidden', '')
  this.setAttribute('class', classVal)
}

export const adaptiveTools: DirectiveOptions = {
  bind(el: HTMLElement) {
    el.setAttribute('timer', null)
    hiddenTools.call(el)
    el.addEventListener('mouseover', onMouseOver.bind(el))
    el.addEventListener('mouseout', onMouseOut.bind(el))
    el.addEventListener('mousemove', onMouseMove.bind(el))
  },

  unbind(el: HTMLElement) {
    showTools.call(el)
    el.removeEventListener('mouseover', onMouseOver)
    el.addEventListener('mouseout', onMouseOut)
    el.addEventListener('mousemove', onMouseMove)
  }
}
