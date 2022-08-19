export const deviceMock = {
  device: {
    deviceId: '29941916753760267',
    deviceName: '设备名称',
    deviceType: 'nvr',
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
    deviceStreamAutoPull: 1,
    deviceStreamSize: 3,
    deviceStreamPullIndex: 1,
    deviceChannelSize: 5,
    deviceStats: {
      onlineChannels: 4
    }
  },
  videos: [
    {
      inVideoProtocol: 'ehome',
      gB28181Device: {
        sipId: '31011500012008469596',
        sipIp: '1.1.1.1',
        sipTcpPort: '123',
        sipUdpPort: '234',
        outId: '123',
        inVersion: '2016',
        inUserName: 'abc',
        transPriority: 'udp',
        sipTransType: 'udp',
        errorMsg: '设备下线',
        deviceStatus: {
          isOnline: 'on'
        },
        stream: {
          streamStatus: 'on',
          recordStatus: 1,
          streamTransType: 'ps_rtp_udp',
          bitrate: 12
        }
      },
      ehomeDevice: {
        sipIp: '1.1.1.1',
        sipTcpPort: '123',
        sipUdpPort: '234',
        outId: '123',
        inVersion: '2020',
        inUserName: 'abc',
        transPriority: 'udp',
        sipTransType: 'udp',
        errorMsg: '设备下线',
        deviceStatus: {
          isOnline: 'on'
        },
        stream: {
          streamStatus: 'on',
          recordStatus: 1,
          streamTransType: 'ps_rtp_udp',
          bitrate: 12
        }
      }
    }
  ],
  viids: [
    {
      inViidProtocol: 'ga1400',
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
