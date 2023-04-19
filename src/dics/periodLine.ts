/*
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-24 10:09:38
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-04-13 16:56:45
 * @FilePath: /vss-user-web/src/dics/periodLine.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const Options = {
  bandwidth: [
    {
      value: 'upload_traffic',
      label: '上行流量',
      kind: 'bandwidth'
    },
    {
      value: 'upload_bandwidth',
      label: '上行带宽',
      kind: 'bandwidth'
    },
    {
      value: 'download_traffic',
      label: '下行流量',
      kind: 'bandwidth'
    },
    {
      value: 'download_bandwidth',
      label: '下行带宽',
      kind: 'bandwidth'
    }
  ],
  storage: [
    {
      value: 'video',
      label: '视频存储',
      kind: 'storage'
    },
    {
      value: 'viid',
      label: '视图存储',
      kind: 'storage'
    }
  ],
  service: [
    {
      value: 'AI-100',
      label: '分钟级',
      type: 'service'
    },
    {
      value: 'AI-200',
      label: '秒级',
      type: 'service'
    },
    {
      value: 'AI-300',
      label: '高算力',
      type: 'service'
    }
  ]
}

export const KindToText = {
  device: {
    name: '设备接入详情(路)',
    func: 'getDeviceData'
  },
  bandwidth: {
    name: '带宽用量详情(Mbps)',
    func: 'getBandwidthData'
  },
  storage: {
    name: '存储用量详情(MB)',
    func: 'getStorageData'
  },
  service: {
    name: 'AI服务用量详情(路)',
    func: 'getServiceData'
  }
}
