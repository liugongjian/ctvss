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
  regionName?: any;
  sipId?: number;
  sipIp?: string;
  sipTcpPort?: number;
  sipUdpPort?: number;
  pullType?: number;
  pushType?: number;
}
