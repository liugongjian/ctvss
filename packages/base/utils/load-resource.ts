function loadJs(src) {
  return new Promise<void>((resolve, reject) => {
    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = src
    document.body.appendChild(script)
    script.onload = () => {
      resolve()
    }
    script.onerror = () => {
      reject(new Error(`${src}，js加载失败`))
    }
  })
}

function loadCss(href) {
  return new Promise<void>((resolve, reject) => {
    let link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = href
    document.body.appendChild(link)
    link.onload = () => {
      resolve()
    }
    link.onerror = () => {
      reject(new Error(`${href}，css加载失败`))
    }
  })
}

export {
  loadJs,
  loadCss
}
