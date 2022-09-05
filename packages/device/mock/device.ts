export const deviceMock = {
  Device: {
    DeviceId: '29941916753760267',
    DeviceName: '设备名称ABC',
    DeviceType: 'ipc',
    DeviceLongitude: '111',
    DeviceLatitude: '222',
    DeviceVendor: '海康',
    Description: '设备描述',
    DeviceIp: '1.1.1.1',
    DevicePort: '123',
    DeviceSerialNumber: '382393',
    DeviceModel: 'A1292',
    DeviceMac: '23882323',
    DevicePoleId: '123123',
    DeviceChannelSize: 5,
    DeviceStats: {
      OnlineChannels: 4
    }
  },
  Videos: [
    {
      InVideoProtocol: 'rtsp',
      Gb28181Device: {
        SipId: '31011500012008469596',
        SipIp: '1.1.1.1',
        SipTcpPort: '123',
        SipUdpPort: '234',
        OutId: '123',
        InVersion: '2016',
        InUserName: '123',
        DeviceStreamAutoPull: 1,
        DeviceStreamPullIndex: 0,
        StreamTransProtocol: 'udp',
        SipTransType: 'udp',
        ErrorMsg: '设备下线',
        DeviceStatus: {
          IsOnline: 'on'
        },
        Streams: [{
          StreamStatus: 'on',
          RecordStatus: 'on',
          StreamTransType: 'ps_rtp_udp',
          Bitrate: 12
        }]
      },
      EhomeDevice: {
        SipIp: '1.1.1.1',
        SipTcpPort: '123',
        SipUdpPort: '234',
        OutId: '123',
        InVersion: '2020',
        InUserName: 'abc',
        DeviceMac: '23882323',
        DeviceStreamAutoPull: 1,
        DeviceStreamSize: 3,
        DeviceStreamPullIndex: 0,
        StreamTransProtocol: 'udp',
        SipTransType: 'udp',
        ErrorMsg: '设备下线',
        DeviceStatus: {
          IsOnline: 'on'
        },
        Streams: [{
          StreamStatus: 'on',
          RecordStatus: 'on',
          StreamTransType: 'ps_rtp_udp',
          Bitrate: 12
        }]
      },
      RtspDevice: {
        SipIp: '1.1.1.1',
        SipTcpPort: '123',
        SipUdpPort: '234',
        OutId: '123',
        InVersion: '2020',
        UserName: 'abc',
        Password: '333',
        StreamTransProtocol: 'udp',
        SipTransType: 'udp',
        ErrorMsg: '设备下线',
        InType: 'pull',
        PullUrl: 'http://abc.com',
        EnableDomain: 2,
        DeviceDomain: 'http://www.domain.com',
        DeviceIp: '1.1.1.1',
        DevicePort: '123',
        DeviceStreamAutoPull: 1,
        DeviceStreamSize: 3,
        DeviceStreamPullIndex: 0,
        DeviceStatus: {
          IsOnline: 'on'
        },
        Streams: [{
          StreamStatus: 'on',
          RecordStatus: 'on',
          StreamTransType: 'ps_rtp_udp',
          Bitrate: 12
        }]
      }
    }
  ],
  Viids: [
    {
      InViidProtocol: 'ga1400',
      Ga1400Device: {
        HttpEndpoint: '',
        HttpsEndpoint: '',
        OutId: '1233',
        InUserName: 'abc',
        ViidServerIp: '1.1.1.1',
        ViidServerPort: '1322',
        Ip: '1.1.1.1',
        Port: '1322',
        LowerApsId: '123',
        ProtocolDeviceType: 'aps',
        DeviceStatus: {
          IsOnline: 'on'
        }
      }
    }
  ],
  Industry: {
    IndustryName: '零售',
    IndustryCode: '11',
    NetworkCode: '6',
    InOrgRegion: '12011900',
    InOrgRegionLevel: '3'
  },
  Region: '0230001',
  InNetworkType: 'public',
  OutNetworkType: 'public'
}
