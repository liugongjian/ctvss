import { DeviceEnum } from '../enums'

interface DeviceStats {
  [DeviceEnum.ChannelSize]: number; // 通道数量
  [DeviceEnum.OnlineChannels]: number; // 在线通道数量
  [DeviceEnum.OfflineChannels]: number; // 离线通道数量
  [DeviceEnum.OnlineStreams]: number; // 在线流数量
  [DeviceEnum.OfflineStreams]: number; // 离线流数量
  [DeviceEnum.FailedStreams]: number; // 失败流数量
  [DeviceEnum.MaxChannelSize]: number; // 最大通道数量
}

interface DeviceBasic {
  [DeviceEnum.DeviceId]: string;
  [DeviceEnum.DeviceName]: string;
  [DeviceEnum.DeviceLocalName]: string; // 设备侧名称
  [DeviceEnum.DeviceType]: string,
  [DeviceEnum.DeviceLongitude]?: string;
  [DeviceEnum.DeviceLatitude]?: string;
  [DeviceEnum.DeviceVendor]: string;
  [DeviceEnum.Description]?: string;
  [DeviceEnum.DeviceIp]?: string;
  [DeviceEnum.DevicePort]?: string;
  [DeviceEnum.DeviceSerialNumber]?: string; // 设备序列号
  [DeviceEnum.DeviceModel]?: string; // 设备型号
  [DeviceEnum.DeviceMac]?: string; // 设备MAC地址
  [DeviceEnum.DevicePoleId]?: string; // 设备杆号
  [DeviceEnum.DeviceChannelSize]?: number;
  [DeviceEnum.DeviceStats]?: DeviceStats;
}

/**
 * 视频接入协议
 */
interface DeviceStatus {
  [DeviceEnum.IsOnline]: 'on' | 'off'; // 是否在线,on-在线，off-离线
  [DeviceEnum.RegisterTime]: number; // 注册时间
  [DeviceEnum.KeepliveTime]: number; // 保活时间
  [DeviceEnum.UnregisterTime]: number; // 注销时间
}

/**
 * 视频接入协议
 */
interface Stream {
  [DeviceEnum.StreamNum]: string;
  [DeviceEnum.StreamStatus]: string;
  [DeviceEnum.RecordStatus]: number;
  [DeviceEnum.StreamTransType]: string; // 流传输类型
  [DeviceEnum.Bitrate]: number;
}

/**
 * 视频各协议设备输出信息
 */
interface VideoDevice {
  [DeviceEnum.OutId]?: string;
  [DeviceEnum.InVersion]?: string;
  [DeviceEnum.InUserName]?: string;
  [DeviceEnum.DeviceStreamSize]?: number;
  [DeviceEnum.DeviceStreamAutoPull]?: number;
  [DeviceEnum.DeviceStreamPullIndex]?: number;
  [DeviceEnum.StreamTransProtocol]?: string;
  [DeviceEnum.SipTransType]?: string;
  [DeviceEnum.SipId]?: string;
  [DeviceEnum.SipIp]?: string;
  [DeviceEnum.SipTcpPort]?: string;
  [DeviceEnum.SipUdpPort]?: string;
  [DeviceEnum.InType]?: string; // 视频流接入方式，取值: push, pull
  [DeviceEnum.PushType]?: number; // 是否启用自动激活推流地址，InType设置为push，该字段才有效。
  [DeviceEnum.PushUrl]?: string;
  [DeviceEnum.PullUrl]?: string;
  [DeviceEnum.UserName]?: string;
  [DeviceEnum.Password]?: string;
  [DeviceEnum.DeviceIp]?: string;
  [DeviceEnum.DevicePort]?: string;
  [DeviceEnum.EnableDomain]?: number; // 是否启动域名
  [DeviceEnum.DeviceDomain]?: string; // 设备域名
  [DeviceEnum.DeviceStatus]: DeviceStatus;
  [DeviceEnum.Tags]: string;
  [DeviceEnum.Stream]: Stream;
  [DeviceEnum.ErrorMsg]: string;
}

/**
 * 视频接入
 */
interface Video {
  [DeviceEnum.InVideoProtocol]: string;
  [DeviceEnum.Gb28181Devices]?: VideoDevice;
  [DeviceEnum.RtmpDevice]?: VideoDevice;
  [DeviceEnum.RtspDevice]?: VideoDevice;
  [DeviceEnum.EhomeDevice]?: VideoDevice;
  [DeviceEnum.OnvifDevicevice]?: VideoDevice;
}

/**
 * 视图各协议设备输出信息
 */
interface ViidDevice {
  [DeviceEnum.HttpEndpoint]: string;
  [DeviceEnum.HttpsEndpoint]: string;
  [DeviceEnum.OutId]: string;
  [DeviceEnum.DeviceStatus]: DeviceStatus;
}

/**
 * 视图接入
 */
interface Viid {
  [DeviceEnum.InVideoProtocol]: string;
  [DeviceEnum.Ga1400Device]?: ViidDevice;
}

/**
 * 国标ID生成
 */
interface Industry {
  [DeviceEnum.InOrgRegion]: string; // 设备区域编码，编码长度为8位
  [DeviceEnum.InOrgRegionLevel]: string; // 设备区域级别，编码长度为1位
  [DeviceEnum.IndustryCode]: string; // 设备行业编码，编码长度为2位
  [DeviceEnum.NetworkCode]: string; // 设备的网络标识, 取值如下： 0、1、2、3、4 为监控报警专网，5为公安信息网，6为政务网，7为Internet网，8为社会资源接入网，9预留
}

/**
 * 资源包
 */
interface Resource {
  [DeviceEnum.OrderResource]: {
    [DeviceEnum.WorkOrderId]: string; // 订单ID
    [DeviceEnum.ResourceId]: string; // 资源ID
    [DeviceEnum.ResourceType]: string; // 资源类型
  },
  [DeviceEnum.OrderAIApp]: {
    [DeviceEnum.Id]: string;
    [DeviceEnum.AnalyseType]: string;
  }
}

/**
 * 设备
 */
interface Device {
  [DeviceEnum.DeviceId]?: string;
  [DeviceEnum.Region]: string;
  [DeviceEnum.InNetworkType]: string; // 接入网络类型, 取值：public, private, 默认public
  [DeviceEnum.OutNetworkType]: string; // 播放网络类型, 取值：public, private, 默认public
  [DeviceEnum.Device]: DeviceBasic;
  [DeviceEnum.Videos]: Video[];
  [DeviceEnum.Viids]: Viid[];
  [DeviceEnum.Industry]: Industry;
  [DeviceEnum.Resource]: Resource;
}

/**
 * 设备地址
 */
interface DeviceAddress {
  code: string;
  level: string;
}

export {
  DeviceAddress,
  DeviceBasic,
  VideoDevice,
  Industry,
  Device
}
