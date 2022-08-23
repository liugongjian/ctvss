interface DeviceStats {
  channelSize: number; // 通道数量
  onlineChannels: number; // 在线通道数量
  offlineChannels: number; // 离线通道数量
  onlineStreams: number; // 在线流数量
  offlineStreams: number; // 离线流数量
  failedStreams: number; // 失败流数量
  maxChannelSize: number; // 最大通道数量
}

interface DeviceBasic {
  deviceId: string;
  deviceName: string;
  deviceLocalName: string; // 设备侧名称
  deviceType: string,
  deviceLongitude?: string;
  deviceLatitude?: string;
  deviceVendor: string;
  description?: string;
  deviceIp?: string;
  devicePort?: string;
  deviceChannelSize?: number;
  DeviceStats?: DeviceStats;
}

/**
 * 视频接入协议
 */
interface DeviceStatus {
  isOnline: 'on' | 'off'; // 是否在线,on-在线，off-离线
  registerTime: number; // 注册时间
  keepliveTime: number; // 保活时间
  unregisterTime: number; // 注销时间
}

/**
 * 视频接入协议
 */
interface Stream {
  StreamNum: string;
  streamStatus: string;
  recordStatus: number;
  streamTransType: string;
  bitrate: number;
}

/**
 * 视频各协议设备输出信息
 */
interface VideoDevice {
  outId?: string;
  inVersion?: string;
  inUserName?: string;
  deviceSerialNumber?: string;
  deviceModel?: string;
  deviceMac?: string;
  devicePoleId?: string;
  deviceStreamAutoPull?: number;
  streamTransProtocol?: string;
  sipTransType?: string;
  sipId?: string;
  sipIp?: string;
  sipTcpPort?: string;
  sipUdpPort?: string;
  inType?: string; // 视频流接入方式，取值: push, pull
  pushType?: number; // 是否启用自动激活推流地址，InType设置为push，该字段才有效。
  pushUrl?: string;
  pullUrl?: string;
  enableDomain?: number; // 是否启动域名
  deviceDomain?: string; // 设备域名
  errorMsg: string;
  deviceStatus: DeviceStatus;
  stream: Stream;
}

/**
 * 视频接入
 */
interface Video {
  inVideoProtocol: string;
  gB28181Devices?: VideoDevice;
  rtmpDevice?: VideoDevice;
  rtspDevice?: VideoDevice;
  ehomeDevice?: VideoDevice;
  rtspDeonvifDevicevice?: VideoDevice;
}

/**
 * 视图各协议设备输出信息
 */
interface ViidDevice {
  httpEndpoint: string;
  httpsEndpoint: string;
  outId: string;
  deviceStatus: DeviceStatus;
}

/**
 * 视图接入
 */
interface Viid {
  inVideoProtocol: string;
  gA1400Devices?: ViidDevice;
}

/**
 * 国标ID生成
 */
interface Industry {
  InOrgRegion: string; // 设备区域编码，编码长度为8位
  InOrgRegionLevel: string; // 设备区域级别，编码长度为1位
  IndustryCode: string; // 设备行业编码，编码长度为2位
  NetworkCode: string; // 设备的网络标识, 取值如下： 0、1、2、3、4 为监控报警专网，5为公安信息网，6为政务网，7为Internet网，8为社会资源接入网，9预留
}

/**
 * 资源包
 */
interface Resource {
  orderResource: {
    workOrderId: string; // 订单ID
    resourceId: string; // 资源ID
    resourceType: string; // 资源类型
  },
  orderAIApp: {
    id: string;
    analyseType: string;
  }
}

/**
 * 设备
 */
interface Device {
  region: string;
  inNetworkType: string; // 接入网络类型, 取值：public, private, 默认public
  outNetworkType: string; // 播放网络类型, 取值：public, private, 默认public
  device: DeviceBasic;
  videos: Video[];
  viids: Viid[];
  industry: Industry;
  resource: Resource;
}

export {
  VideoDevice,
  Device
}
