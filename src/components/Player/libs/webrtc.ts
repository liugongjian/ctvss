import axios from 'axios'

const fillQuery = (queryString: any, obj: any) => {
  // pure user query object.
  obj.userQuery = {}

  if (queryString.length === 0) {
    return
  }

  // split again for angularjs.
  if (queryString.indexOf('?') >= 0) {
    queryString = queryString.split('?')[1]
  }

  const queries = queryString.split('&')
  for (let i = 0; i < queries.length; i++) {
    const elem = queries[i]

    const query = elem.split('=')
    obj[query[0]] = query[1]
    obj.userQuery[query[0]] = query[1]
  }

  // alias domain for vhost.
  if (obj.domain) {
    obj.vhost = obj.domain
  }
}

const parseRtmpUrl = (rtmpUrl: string) => {
  // @see: http://stackoverflow.com/questions/10469575/how-to-use-location-object-to-parse-url-without-redirecting-the-page-in-javascri
  const a = document.createElement('a')
  a.href = rtmpUrl.replace('rtmp://', 'http://')
    .replace('webrtc://', 'http://')
    .replace('rtc://', 'http://')

  let vhost = a.hostname
  let app = a.pathname.substr(1, a.pathname.lastIndexOf('/') - 1)
  const stream = a.pathname.substr(a.pathname.lastIndexOf('/') + 1)

  // parse the vhost in the params of app, that srs supports.
  app = app.replace('...vhost...', '?vhost=')
  if (app.indexOf('?') >= 0) {
    const params = app.substr(app.indexOf('?'))
    app = app.substr(0, app.indexOf('?'))

    if (params.indexOf('vhost=') > 0) {
      vhost = params.substr(params.indexOf('vhost=') + 'vhost='.length)
      if (vhost.indexOf('&') > 0) {
        vhost = vhost.substr(0, vhost.indexOf('&'))
      }
    }
  }

  // when vhost equals to server, and server is ip,
  // the vhost is __defaultVhost__
  if (a.hostname === vhost) {
    const re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
    if (re.test(a.hostname)) {
      vhost = '__defaultVhost__'
    }
  }

  // parse the schema
  let schema = 'rtmp'
  if (rtmpUrl.indexOf('://') > 0) {
    schema = rtmpUrl.substr(0, rtmpUrl.indexOf('://'))
  }

  let port: any = a.port
  if (!port) {
    if (schema === 'http') {
      port = 80
    } else if (schema === 'https') {
      port = 443
    } else if (schema === 'rtmp') {
      port = 1935
    }
  }

  const ret: any = {
    url: rtmpUrl,
    schema: schema,
    server: a.hostname,
    port: port,
    vhost: vhost,
    app: app,
    stream: stream
  }
  fillQuery(a.search, ret)

  // For webrtc API, we use 443 if page is https, or schema specified it.
  if (!ret.port) {
    if (schema === 'webrtc' || schema === 'rtc') {
      if (ret.userQuery.schema === 'https') {
        ret.port = 443
      } else if (window.location.href.indexOf('https://') === 0) {
        ret.port = 443
      } else {
        // For WebRTC, SRS use 80 as default API port.
        ret.port = 80
      }
    }
  }

  return ret
}

export const prepareUrl = (url: string) => {
  let apiUrl, streamUrl

  const urlObject = parseRtmpUrl(url)

  // If user specifies the schema, use it as API schema.
  let schema = urlObject.userQuery.schema
  schema = schema ? schema + ':' : window.location.protocol

  let port = urlObject.port || 80
  if (schema === 'https:') {
    port = urlObject.port || 443
  }

  // @see https://github.com/rtcdn/rtcdn-draft
  // var api = urlObject.userQuery.play || '/rtc/v1/play/'
  let api = urlObject.userQuery.play || '/streamingserver/v1/webrtc/sdp'
  if (urlObject.userQuery.play && api.lastIndexOf('/') !== api.length - 1) {
    api += '/'
  }

  apiUrl = schema + '//' + urlObject.server + ':' + port + api
  for (const key in urlObject.userQuery) {
    if (key !== 'api' && key !== 'play') {
      apiUrl += '&' + key + '=' + urlObject.userQuery[key]
    }
  }
  // Replace /rtc/v1/play/&k=v to /rtc/v1/play/?k=v
  apiUrl = apiUrl.replace(api + '&', api + '?')

  streamUrl = urlObject.url

  return { apiUrl: apiUrl, streamUrl: streamUrl, schema: schema, urlObject: urlObject, port: port }
}

export const srsRtcPlayerAsync = () => {
  var self: any = {
    play: async function(apiUrl: string, streamUrl: string) {
      self.pc.addTransceiver('audio', { direction: 'recvonly' })
      self.pc.addTransceiver('video', { direction: 'recvonly' })

      const offer = await self.pc.createOffer()
      await self.pc.setLocalDescription(offer)
      const res: any = await new Promise(function(resolve, reject) {
        // @see https://github.com/rtcdn/rtcdn-draft
        const data = {
          api: apiUrl, streamurl: streamUrl, clientip: null, sdp: offer.sdp
        }
        // console.log('Generated offer: ', data)

        axios.post(apiUrl, data).then(function(data: any) {
          // console.log('Got answer: ', data)
          if (data.code) {
            reject(data); return
          }

          resolve(data)
        }).catch(function(reason: any) {
          reject(reason)
        })
      })
      const session = res.data

      // console.log({ type: 'answer', sdp: session.sdp })
      await self.pc.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp: session.sdp })
      )
      return session
    },
    close: function() {
      self.pc && self.pc.close()
    },
    // callbacks.
    onaddstream: null,
    onconnectionstatechange: null
  }

  self.pc = new RTCPeerConnection()

  self.pc.onaddstream = function(event: any) {
    if (self.onaddstream) {
      self.onaddstream(event)
    }
  }

  self.pc.onconnectionstatechange = function() {
    if (self.onconnectionstatechange) {
      self.onconnectionstatechange(self.pc.connectionState)
    }
  }

  return self
}
