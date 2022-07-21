const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA02dyq6ECbfuFyiD70V5n
QT/6tu8VyFd0u9m7IMx76SfNUXGHD2vlSsrT7BfM/+DgaIsG1to62LmTr+aV+LPo
CM64/9QtoJsFNnR4DNJD4tKhdP+4v9vxvzqViDeZbzLO70Vbddyq1cf2Mhg+e5qg
g2v7KyQSgoBEC3a/veMX7L5StzIU83EkPQEVGBCo2wOvHJ42ODa6mGfmrUjbyk14
MztLBmCtTZ9Dmn/hIuGGtFErG7H2FR9GSGuivAJoP83jH1R45vyuTktIVFYaWu+f
LFqqqDyBPx29eN+KgzTL6lD5w15djIAdK6B2QEcxv9t0H7T+6XpcgbZcy/HN82u/
JwIDAQAB
-----END PUBLIC KEY-----`

// fetch the part of the PEM string between header and footer
const publicKeyHeader = '-----BEGIN PUBLIC KEY-----'
const publicKeyFooter = '-----END PUBLIC KEY-----'
const publicKeyContents = publicKey.substring(publicKeyHeader.length, publicKey.length - publicKeyFooter.length)
// base64 decode the string to get the binary data
const binaryDerString = window.atob(publicKeyContents)
// convert from a binary string to an ArrayBuffer
const binaryDer = stringToArrayBuffer(binaryDerString)

const cryptoSubtle = (window.crypto || (window as any).msCrypto).subtle

let importKeyPromise = new Promise((resolve) => {
  let importKey = cryptoSubtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-256' }
    },
    true,
    ['encrypt']
  )

  if (importKey.then) {
    resolve(importKey)
  } else {
    importKey.oncomplete = function(e) {
      resolve(e.target.result)
    }
  }
})

function encryptDataWithPublicKey(data, key) {
  return new Promise((resolve) => {
    data = stringToArrayBuffer(data)
    let crypRes = cryptoSubtle.encrypt(
      {
        name: 'RSA-OAEP',
        hash: { name: 'SHA-256' }
      },
      key,
      data
    )
    if (crypRes.then) {
      resolve(crypRes)
    } else {
      crypRes.oncomplete = function(e) {
        resolve(e.target.result)
      }
    }
  })
}

export const encrypt = async function(data) {
  const publicKey = await importKeyPromise
  const result = await encryptDataWithPublicKey(data, publicKey)
  const rdata = arrayBufferToString(result)
  // Fixing TypeError: Invalid calling object in Edge #70 (https://github.com/mulesoft-labs/js-client-oauth2/pull/70/files)
  // Internet Explorer 11 and Edge throws error Invalid calling object #77(https://github.com/tus/tus-js-client/issues/77)
  var rResult = (window as any).original_btoa(rdata)
  return rResult
}

function stringToArrayBuffer(str) {
  var buf = new ArrayBuffer(str.length)
  var bufView = new Uint8Array(buf)
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

function arrayBufferToString(str) {
  var byteArray = new Uint8Array(str)
  var byteString = ''
  for (var i = 0; i < byteArray.byteLength; i++) {
    byteString += String.fromCodePoint(byteArray[i])
  }
  return byteString
}
