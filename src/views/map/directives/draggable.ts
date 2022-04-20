const draggable = {
  inserted: function(el) {
    el.style.cursor = 'move'
    el.onmousedown = function(e) {
      let disx = e.pageX - el.offsetLeft
      let disy = e.pageY - el.offsetTop
      const pw = parseInt(window.getComputedStyle(el.parentElement).width)
      const ph = parseInt(window.getComputedStyle(el.parentElement).height)
      const ew = parseInt(window.getComputedStyle(el).width)
      const eh = parseInt(window.getComputedStyle(el).height)
      document.onmousemove = function(e) {
        let x = e.pageX - disx
        let y = e.pageY - disy
        let maxX = pw - ew
        let maxY = ph - eh
        if (x < 0) {
          x = 0
        } else if (x > maxX) {
          x = maxX
        }

        if (y < 0) {
          y = 0
        } else if (y > maxY) {
          y = maxY
        }

        el.style.left = x + 'px'
        el.style.top = y + 'px'
      }
      document.onmouseup = function() {
        document.onmousemove = document.onmouseup = null
      }
    }
  }
}
export default draggable
