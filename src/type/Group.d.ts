export interface Group {
  groupId?: string;
  groupName: string;
  groupStatus?: string;
  groupStats?: {
    deviceSize: number;
  },
  inProtocol?: string;
  outProtocol?: Array<string>;
  region?: string | Array<string>;
  createdTime?: string;
  description?: string;
  regionName?: string;
  sipId?: number;
  sipIp?: string;
  sipTcpPort?: number;
  sipUdpPort?: number;
  pullType?: number;
  pushType?: number;
  inNetworkType?: string;
  outNetworkType?: string;
  gbRegionNames?: Array<string>;
  gbId?: any;
  gbRegion?: string;
  gbRegionLevel?: string;
  industryCode?: string;
  networkCode?: string;
  isCustomTree?: boolean;
}
