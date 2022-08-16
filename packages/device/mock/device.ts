export const deviceMock = {
  device: {
    deviceId: '29941916753760267',
    deviceName: '设备名称',
    deviceType: 'ipc',
    deviceLongitude: '111',
    deviceLatitude: '222',
    deviceVendor: '海康',
    description: '设备描述',
    deviceIp: '1.1.1.1',
    devicePort: '123',
    deviceSerialNumber: '382393',
    deviceModel: 'A1292',
    deviceMac: '23882323',
    devicePoleId: '123123',
    deviceStreamAutoPull: 1
  },
  videos: [
    {
      gB28181Device: {
        sipId: '31011500012008469596',
        sipIp: '1.1.1.1',
        sipTcpPort: '123',
        sipUdpPort: '234',
        outId: '123',
        deviceStatus: {
          isOnline: 'on'
        },
        stream: {
          streamStatus: 'on',
          recordStatus: 1,
          streamTransType: 'ps_rtp_udp'
        }
      }
    }
  ],
  viids: [
    {
      gA1400Device: {
        httpEndpoint: '',
        httpsEndpoint: '',
        outId: '1233',
        deviceStatus: {
          isOnline: 'on'
        }
      }
    }
  ],
  industry: {
    industryName: '零售'
  }
}
