export interface Group {
  groupId?: number;
  groupName: string;
  groupStatus?: string;
  groupStats?: {
    deviceSize: number;
  },
  inProtocol?: string;
  outProtocol?: Array<string>;
  region?: string;
  createdTime?: number;
  description?: string;
  streamProtocol?: string;
  sipProtocol?: string;
  sipId?: number;
  sipIp?: string;
  sipTcpPort?: number;
  sipUdpPort?: number;
  pullType?: number;
}
