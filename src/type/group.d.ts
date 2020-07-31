export interface Group {
  groupId?: string;
  groupName: string;
  groupStatus?: string;
  groupStats?: {
    deviceSize: number;
  },
  inProtocol?: string;
  outProtocol?: Array<string>;
  region?: string;
  createdTime?: string;
  description?: string;
  streamTransProtocol?: string;
  sipTransProtocol?: string;
  sipId?: number;
  sipIp?: string;
  sipTcpPort?: number;
  sipUdpPort?: number;
  pullType?: number;
}
