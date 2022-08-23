import JSEncrypt from 'jsencrypt'

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyCMh80EGZy2TUEbSkmUe
HoCPushsltxDrP5c7P70tkqyh6uuEQu7a5lPX9WZwFu7hH3e3HpWURLdghaZhiNs
wJYVZTCXmmGB16l/jLC4qvFL5Fq1OdzwPuhTLC9Rryo6D1UFdFdFNUYdDH9k8IJP
OJtJ1TRSsaafDO6ETZJI4dIw936GTr3PEf1fqQCgjnVzFaAhC9P7SNVHhfs5Ahj3
rs/Qxv8idopExF4/Fbp1006alWbK7a3ZUgbsAMeV327VbGMKFqGNTgHTZS8zTqNc
/A7C8F0oXp2HAG0PSAHl1UmDv/pGjLy9Zm4VkkoF0JTjEhNpjUwcHMu8gH6BMQWD
eQIDAQAB
-----END PUBLIC KEY-----`

const encryptor = new JSEncrypt()
encryptor.setPublicKey(publicKey)

export function encrypt(data: string) {
  return encryptor.encrypt(data)
}

// // fetch the part of the PEM string between header and footer
// const publicKeyHeader = '-----BEGIN PUBLIC KEY-----'
// const publicKeyFooter = '-----END PUBLIC KEY-----'
// const publicKeyContents = publicKey.substring(publicKeyHeader.length, publicKey.length - publicKeyFooter.length)
// // base64 decode the string to get the binary data
// const binaryDerString = window.atob(publicKeyContents)
// // convert from a binary string to an ArrayBuffer
// const binaryDer = stringToArrayBuffer(binaryDerString)

// const cryptoSubtle = (window.crypto || (window as any).msCrypto).subtle

// let importKeyPromise = new Promise((resolve) => {
//   let importKey = cryptoSubtle.importKey(
//     'spki',
//     binaryDer,
//     {
//       name: 'RSA-OAEP',
//       hash: { name: 'SHA-256' }
//     },
//     true,
//     ['encrypt']
//   )

//   if (importKey.then) {
//     resolve(importKey)
//   } else {
//     importKey.oncomplete = function(e) {
//       resolve(e.target.result)
//     }
//   }
// })

// function encryptDataWithPublicKey(data, key) {
//   return new Promise((resolve) => {
//     data = stringToArrayBuffer(data)
//     let crypRes = cryptoSubtle.encrypt(
//       {
//         name: 'RSA-OAEP',
//         hash: { name: 'SHA-256' }
//       },
//       key,
//       data
//     )
//     if (crypRes.then) {
//       resolve(crypRes)
//     } else {
//       crypRes.oncomplete = function(e) {
//         resolve(e.target.result)
//       }
//     }
//   })
// }

// export const encrypt = async function(data) {
//   const publicKey = await importKeyPromise
//   const result = await encryptDataWithPublicKey(data, publicKey)
//   const rdata = arrayBufferToString(result)
//   // Fixing TypeError: Invalid calling object in Edge #70 (https://github.com/mulesoft-labs/js-client-oauth2/pull/70/files)
//   // Internet Explorer 11 and Edge throws error Invalid calling object #77(https://github.com/tus/tus-js-client/issues/77)
//   var rResult = (window as any).original_btoa(rdata)
//   return rResult
// }

// function stringToArrayBuffer(str) {
//   var buf = new ArrayBuffer(str.length)
//   var bufView = new Uint8Array(buf)
//   for (var i = 0, strLen = str.length; i < strLen; i++) {
//     bufView[i] = str.charCodeAt(i)
//   }
//   return buf
// }

// function arrayBufferToString(str) {
//   var byteArray = new Uint8Array(str)
//   var byteString = ''
//   for (var i = 0; i < byteArray.byteLength; i++) {
//     byteString += String.fromCodePoint(byteArray[i])
//   }
//   return byteString
// }
