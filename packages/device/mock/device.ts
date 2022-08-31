export const deviceMock = {
  device: {
    deviceId: '29941916753760267',
    deviceName: '设备名称ABC',
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
    deviceChannelSize: 5,
    deviceStats: {
      onlineChannels: 4
    }
  },
  videos: [
    {
      inVideoProtocol: 'rtsp',
      gb28181Device: {
        sipId: '31011500012008469596',
        sipIp: '1.1.1.1',
        sipTcpPort: '123',
        sipUdpPort: '234',
        outId: '123',
        inVersion: '2016',
        inUserName: '123',
        deviceStreamAutoPull: 1,
        streamTransProtocol: 'udp',
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
        deviceMac: '23882323',
        deviceStreamAutoPull: 1,
        deviceStreamSize: 3,
        deviceStreamPullIndex: 1,
        streamTransProtocol: 'udp',
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
      rtspDevice: {
        sipIp: '1.1.1.1',
        sipTcpPort: '123',
        sipUdpPort: '234',
        outId: '123',
        inVersion: '2020',
        userName: 'abc',
        password: '333',
        streamTransProtocol: 'udp',
        sipTransType: 'udp',
        errorMsg: '设备下线',
        inType: 'pull',
        pullUrl: 'http://abc.com',
        enableDomain: 2,
        deviceDomain: 'http://www.domain.com',
        deviceIp: '1.1.1.1',
        devicePort: '123',
        deviceStreamAutoPull: 1,
        deviceStreamSize: 3,
        deviceStreamPullIndex: 1,
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
      ga1400Device: {
        httpEndpoint: '',
        httpsEndpoint: '',
        outId: '1233',
        inUserName: 'abc',
        viidServerIp: '1.1.1.1',
        viidServerPort: '1322',
        ip: '1.1.1.1',
        port: '1322',
        lowerApsId: '123',
        protocolDeviceType: 'aps',
        deviceStatus: {
          isOnline: 'on'
        }
      }
    }
  ],
  industry: {
    industryName: '零售',
    industryCode: '11',
    networkCode: '6',
    inOrgRegion: '12011900',
    inOrgRegionLevel: '3'
  },
  region: '0230001',
  inNetworkType: 'public',
  outNetworkType: 'public'
}
