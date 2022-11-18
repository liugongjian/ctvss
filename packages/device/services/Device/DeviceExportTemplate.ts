import { getRegions } from '../../api/region'
import { getResources } from '../../api/billing'
import { getGa1400CertificateList } from '../../api/certificate'
// import { getDevice } from '../../api/device'

import { ResourceAiType } from '../../dicts/resource'
import { getIndustryList } from '../../api/dict'
import FullscreenMixin from '@/views/device/mixin/fullscreenMixin'
class ExportExcelTemplate {
  private excelName = ''
  private workbook: any
  public excelViews: any = [
    {
      x: 0,
      y: 0,
      width: 10000,
      height: 20000,
      firstSheet: 0,
      activeTab: 1,
      visibility: 'visible'
    }
  ]

  public regionList: any = []

  public industryList: any = []

  public resourceAiType: any = ResourceAiType

  public availableChannels: any = []

  public gbCertificateList: any = []

  public addressList: any = []

  public options: any = {
    gbAccountList: [],
    availableChannels: [],
    VIDEOList: [],
    BWList: [],
    options: [],
    AIList: []
  }

  private excelExplain = `
  1、视频包根据实际情况来显示，格式是"设备总路数:剩余路数:码率:存储类型||订单ID"
  2、AI包根据实际情况来显示，格式"设备总路数:剩余路数:AI类型||订单ID"
  3、上行带宽包根据实际情况来显示，格式"剩余总带宽||订单ID"
  4、至于**包资源有效期问题，没有过期且即将过期的情况比较少，故不展示
  5、专线用户就不需要显示“上行带宽包”、“下行带宽包”列
  6、预设城市、设备地址、所属行业继承当前业务组的信息
  7、该表格中的sheet顺序和名称不得修改`

  private worksheetExplainName = '表格说明'

  /**
   * 静态validation集合
   */
  private validation = {
    deviceType: {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: ['"IPC,NVR"'],
      error: '请选择设备类型'
    },
    deviceVendor: {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      // formulae: ['"海康,大华,宇视,科达,华为,其他"'],
      formulae: ['"海康,大华,宇视,其他"'],
      error: '请选择厂商'
    },
    deviceName: {
      type: 'textLength',
      allowBlank: false,
      operator: 'between',
      showInputMessage: true,
      showErrorMessage: true,
      formulae: [2, 64],
      prompt: '2至64位，可包含大小写字母、数字、中文、中划线。',
      error: '2至64位，可包含大小写字母、数字、中文、中划线。'
    },
    pullType: {
      type: 'list',
      allowBlank: false,
      showInputMessage: true,
      showErrorMessage: true,
      formulae: ['"是,否"'],
      prompt: '当启用自动拉流，设备注册成功后自动启动拉流。关闭该选项后需要通过触发的方式启动拉流。',
      error: '请选择是否启用设备拉流'
    },
    channelSize: {
      type: 'whole',
      allowBlank: true,
      showInputMessage: true,
      prompt: 'nvr设备时该项为必填'
    },
    inType: {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: ['"推流,拉流"'],
      error: '请选择视频流接入方式'
    },
    pushType: {
      type: 'list',
      allowBlank: false,
      showInputMessage: true,
      showErrorMessage: true,
      formulae: ['"是,否"'],
      prompt: '自动激活推流地址，设备创建完成后，平台立刻自动生成推流地址。关闭该选项后需要通过触发的方式生成推流地址',
      error: '请选择是否自动激活推流地址'
    },
    multiStreamSize: {
      type: 'list',
      allowBlank: false,
      showInputMessage: true,
      showErrorMessage: true,
      formulae: ['"单码流,双码流,三码流"'],
      prompt: '单码流（仅有一种码流），双码流（主、子码流），三码流（主、子、第三码流）',
      error: '请选择主子码流数量'
    },
    tags: {
      type: 'textLength',
      allowBlank: true,
      showInputMessage: true,
      showErrorMessage: true,
      prompt: '示例“{key1:value1,key2:value2}”'
    },
    transPriority: {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      formulae: ['"tcp,udp"'],
      error: '请从选项中选择传输协议'
    },
    network: {
      // 设备的网络标识, 取值如下： 0、1、2、3、4 为监控报警专网，5为公安信息网，6为政务网，7为Internet网，8为社会资源接入网，9预留
      type: 'list',
      allowBlank: false,
      showInputMessage: true,
      showErrorMessage: true,
      formulae: ['"监控报警专网,公安信息网,政务网,Internet网,社会资源接入网"'],
      error: '请从选项中选择网络标识'
    },
    ifTcp: {
      type: 'list',
      allowBlank: false,
      showInputMessage: true,
      showErrorMessage: true,
      formulae: ['"是,否"']
    },
    networkTypeExternal: {
      type: 'list',
      allowBlank: false,
      showInputMessage: true,
      showErrorMessage: true,
      formulae: ['"互联网,专线网络"']
    }
  }

  // excel 模板实体内容
  private get excelTemplateSheet() {
    return [
      {
        name: 'GB28181导入表格',
        content: [
          {
            title: { header: '*设备类型', key: 'deviceType', width: 16 },
            validation: this.validation.deviceType
          },
          {
            title: { header: '接入网络类型', key: 'inNetworkType', width: 16 },
            validation: this.validation.networkTypeExternal
          },
          {
            title: { header: '接入区域', key: 'region', width: 16 },
            validation: this.getRegionValidation()
          },
          {
            title: { header: '设备地址', key: 'deviceAddresses', width: 16 },
            validation: this.getAddressList()
          },
          {
            title: { header: '所属行业', key: 'industry', width: 16 },
            validation: this.getIndustryList()
          },
          {
            title: { header: '网络标识', key: 'network', width: 16 },
            validation: this.validation.network
          },
          {
            title: { header: '*国标版本', key: 'gbVersion', width: 16 },
            validation: {
              type: 'list',
              allowBlank: true,
              showInputMessage: true,
              showErrorMessage: true,
              formulae: ['"2011,2016"'],
              prompt: '当选择 “IPC” 或 “NVR” 设备类型时为必选',
              error: '请从选项中选择国标版本'
            }
          },
          {
            title: { header: '*设备厂商', key: 'deviceVendor', width: 16 },
            validation: this.validation.deviceVendor
          },
          {
            title: { header: '*设备名称', key: 'deviceName', width: 24 },
            validation: this.validation.deviceName
          },
          {
            title: { header: '设备描述', key: 'description', width: 16 },
            validation: null
          },
          {
            title: { header: '设备IP', key: 'deviceIp', width: 24 },
            validation: null
          },
          {
            title: { header: '设备端口', key: 'devicePort', width: 16 },
            validation: null
          },
          // {
          //   title: { header: '国标ID', key: 'gbId', width: 24, style: { numFmt: '@' } },
          //   validation: {
          //     type: 'textLength',
          //     allowBlank: false,
          //     operator: 'equal',
          //     showErrorMessage: true,
          //     formulae: [20],
          //     error: '请输入规范国标ID。'
          //   }
          // },
          {
            title: { header: '*国标用户名', key: 'userName', width: 16 },
            validation: this.getGbAccountValidation()
          },
          {
            title: { header: '设备MAC地址', key: 'macAddr', width: 24 },
            validation: null
          },
          // {
          //   title: { header: '杆号', key: 'poleId', width: 24, style: { numFmt: '@' } },
          //   validation: {
          //     type: 'textLength',
          //     allowBlank: false,
          //     operator: 'between',
          //     showErrorMessage: true,
          //     formulae: [1, 21],
          //     error: '请输入规范杆号。'
          //   }
          // },
          {
            title: { header: '经度', key: 'deviceLongitude', width: 16 },
            validation: null
          },
          {
            title: { header: '纬度', key: 'deviceLatitude', width: 16 },
            validation: null
          },
          {
            title: { header: '*是否启用自动拉流', key: 'pullType', width: 30 },
            validation: this.validation.pullType
          },
          {
            title: { header: '*设备视频流优先传输协议', key: 'transPriority', width: 30 },
            validation: this.validation.transPriority
          },
          {
            title: { header: '*设备通道数量（设备类型为NVR时，该项必填）', key: 'channelSize', width: 16 },
            validation: this.validation.channelSize
          },
          {
            title: { header: '*视频包', key: 'videoPackage', width: 40 },
            validation: this.getVideoPackageValidation()
          },
          {
            title: { header: 'AI包', key: 'AIPackage', width: 40 },
            validation: this.getAIPackageValidation()
          },
          {
            title: { header: '上行带宽包', key: 'BWPackage', width: 40 },
            validation: this.getBWPackageValidation()
          }
        ]
      },
      {
        name: 'EHOME导入表格',
        content: [
          {
            title: { header: '*设备类型', key: 'deviceType', width: 16 },
            validation: {
              type: 'list',
              allowBlank: false,
              showErrorMessage: true,
              formulae: ['"IPC,NVR"'],
              error: '请选择设备类型'
            }
          },
          {
            title: { header: '接入网络类型', key: 'inNetworkType', width: 16 },
            validation: this.validation.networkTypeExternal
          },
          {
            title: { header: '接入区域', key: 'region', width: 16 },
            validation: this.getRegionValidation()
          },
          {
            title: { header: '设备地址', key: 'deviceAddresses', width: 16 },
            validation: this.getAddressList()
          },
          {
            title: { header: '所属行业', key: 'industry', width: 16 },
            validation: this.getIndustryList()
          },
          {
            title: { header: '网络标识', key: 'network', width: 16 },
            validation: this.validation.network
          },
          {
            title: { header: '*版本', key: 'ehomeVersion', width: 16, style: { numFmt: '0.0' } },
            validation: {
              type: 'list',
              allowBlank: false,
              showErrorMessage: true,
              formulae: ['"2.0"'],
              error: '请选择版本'
            }
          },
          {
            title: { header: '*设备厂商', key: 'ehomeVendor', width: 16 },
            validation: {
              type: 'list',
              allowBlank: false,
              showErrorMessage: true,
              formulae: ['"海康"'],
              error: '请选择厂商'
            }
          },
          {
            title: { header: '*设备名称', key: 'deviceName', width: 16 },
            validation: this.validation.deviceName
          },
          {
            title: { header: '设备描述', key: 'description', width: 16 },
            validation: null
          },
          {
            title: { header: '设备IP', key: 'deviceIp', width: 24 },
            validation: null
          },
          {
            title: { header: '设备端口', key: 'devicePort', width: 16 },
            validation: null
          },
          {
            title: { header: 'MAC地址', key: 'mac', width: 24 },
            validation: null
          },
          {
            title: { header: '经度', key: 'deviceLongitude', width: 16 },
            validation: null
          },
          {
            title: { header: '纬度', key: 'deviceLatitude', width: 16 },
            validation: null
          },
          {
            title: { header: '*主子码流数量', key: 'multiStreamSize', width: 16 },
            validation: this.validation.multiStreamSize
          },
          {
            title: { header: '*自动拉流', key: 'pullType', width: 16 },
            validation: this.validation.pullType
          },
          {
            title: { header: '*自动拉取码流（开启自动拉流，该项必填）', key: 'AutoStreamNum', width: 16 },
            validation: {
              type: 'list',
              allowBlank: true,
              showInputMessage: true,
              showErrorMessage: true,
              formulae: ['"主码流,子码流,第三码流"'],
              prompt: '1、自动拉流的情况下，“自动拉取码流”项才会生效；2、自动拉取码流的范围不得超过主子码流数量'
            }
          },
          {
            title: { header: 'TCP传输', key: 'ifTcp', width: 16 },
            validation: this.validation.ifTcp
          },
          {
            title: { header: '*子设备数量（设备类型为NVR时，该项必填）', key: 'channelSize', width: 16 },
            validation: this.validation.channelSize
          },
          {
            title: { header: '*视频包', key: 'videoPackage', width: 40 },
            validation: this.getVideoPackageValidation()
          },
          {
            title: { header: 'AI包', key: 'AIPackage', width: 40 },
            validation: this.getAIPackageValidation()
          },
          {
            title: { header: '上行带宽包', key: 'BWPackage', width: 40 },
            validation: this.getBWPackageValidation()
          }
        ]
      },
      {
        name: 'RTMP导入表格',
        content: [
          {
            title: { header: '*视频流接入方式', key: 'inType', width: 24 },
            validation: {
              type: 'list',
              allowBlank: false,
              showErrorMessage: true,
              formulae: ['"推流"'],
              error: '请选择视频流接入方式'
            }
          },
          {
            title: { header: '接入网络类型', key: 'inNetworkType', width: 16 },
            validation: this.validation.networkTypeExternal
          },
          {
            title: { header: '接入区域', key: 'region', width: 16 },
            validation: this.getRegionValidation()
          },
          // {
          //   title: { header: '设备地址', key: 'deviceAddresses', width: 16 },
          //   validation: this.getAddressList()
          // },
          // {
          //   title: { header: '所属行业', key: 'industry', width: 16 },
          //   validation: this.getIndustryList()
          // },
          // {
          //   title: { header: '网络标识', key: 'network', width: 16 },
          //   validation: this.validation.network
          // },
          {
            title: { header: '*设备类型', key: 'deviceType', width: 16 },
            validation: {
              type: 'list',
              allowBlank: false,
              showErrorMessage: true,
              formulae: ['"IPC"'],
              error: '请选择设备类型'
            }
          },
          {
            title: { header: '*设备厂商', key: 'deviceVendor', width: 16 },
            validation: this.validation.deviceVendor
          },
          {
            title: { header: '*设备名称', key: 'deviceName', width: 24 },
            validation: this.validation.deviceName
          },
          {
            title: { header: 'MAC地址', key: 'mac', width: 24 },
            validation: null
          },
          {
            title: { header: '经度', key: 'deviceLongitude', width: 16 },
            validation: null
          },
          {
            title: { header: '纬度', key: 'deviceLatitude', width: 16 },
            validation: null
          },
          {
            title: { header: '设备描述', key: 'description', width: 16 },
            validation: null
          },
          {
            title: { header: '*是否启用自动拉流（接入方式为拉流，该项必填）', key: 'pullType', width: 30 },
            validation: this.validation.pullType
          },
          {
            title: { header: '*是否启用自动激活推流地址（接入方式为推流，该项必填）', key: 'pushType', width: 30 },
            validation: this.validation.pushType
          },
          {
            title: { header: '*拉流地址（接入方式为拉流，该项必填）', key: 'pullUrl', width: 24 },
            validation: null
          },
          {
            title: { header: '视频流标签', key: 'tags', width: 24 },
            validation: this.validation.tags
          },
          {
            title: { header: '*视频包', key: 'videoPackage', width: 40 },
            validation: this.getVideoPackageValidation()
          },
          {
            title: { header: 'AI包', key: 'AIPackage', width: 40 },
            validation: this.getAIPackageValidation()
          },
          {
            title: { header: '上行带宽包', key: 'BWPackage', width: 40 },
            validation: this.getBWPackageValidation()
          }
        ]
      },
      {
        name: 'RTSP导入表格',
        content: [
          {
            title: { header: '*视频流接入方式', key: 'inType', width: 24 },
            validation: {
              type: 'list',
              allowBlank: false,
              showErrorMessage: true,
              formulae: ['"拉流"'],
              error: '请选择视频流接入方式'
            }
          },
          {
            title: { header: '接入网络类型', key: 'inNetworkType', width: 16 },
            validation: this.validation.networkTypeExternal
          },
          {
            title: { header: '接入区域', key: 'region', width: 16 },
            validation: this.getRegionValidation()
          },
          // {
          //   title: { header: '设备地址', key: 'deviceAddresses', width: 16 },
          //   validation: this.getAddressList()
          // },
          // {
          //   title: { header: '所属行业', key: 'industry', width: 16 },
          //   validation: this.getIndustryList()
          // },
          // {
          //   title: { header: '网络标识', key: 'network', width: 16 },
          //   validation: this.validation.network
          // },
          {
            title: { header: '*设备类型', key: 'deviceType', width: 16 },
            validation: {
              type: 'list',
              allowBlank: false,
              showErrorMessage: true,
              formulae: ['"IPC,NVR"'],
              error: '请选择设备类型'
            }
          },
          {
            title: { header: '*设备厂商', key: 'deviceVendor', width: 16 },
            validation: this.validation.deviceVendor
          },
          {
            title: { header: '*设备名称', key: 'deviceName', width: 16 },
            validation: this.validation.deviceName
          },
          {
            title: { header: '设备描述', key: 'description', width: 16 },
            validation: null
          },
          {
            title: { header: '*用户名（视频接入方式为拉流时，该项必填）', key: 'userName', width: 16 },
            validation: null
          },
          {
            title: { header: '*密码（视频接入方式为拉流时，该项必填）', key: 'password', width: 16 },
            validation: null
          },
          {
            title: { header: 'MAC地址', key: 'mac', width: 24 },
            validation: null
          },
          {
            title: { header: '经度', key: 'deviceLongitude', width: 16 },
            validation: null
          },
          {
            title: { header: '纬度', key: 'deviceLatitude', width: 16 },
            validation: null
          },
          {
            title: { header: '*是否启动域名', key: 'enableDomain', width: 16 },
            validation: {
              type: 'list',
              allowBlank: true,
              showErrorMessage: true,
              formulae: ['"是,否"'],
              error: '请选择是否启动域名'
            }
          },
          {
            title: { header: '*自定义拉流地址（设备厂商选择其他时，该项必填）', key: 'deviceIp', width: 24 },
            validation: null
          },

          {
            title: { header: '*设备IP（未启动域名必填）', key: 'deviceIp', width: 24 },
            validation: null
          },
          {
            title: { header: '*设备域名（启动域名必填）', key: 'deviceDomain', width: 24 },
            validation: null
          },
          {
            title: { header: '*设备端口', key: 'devicePort', width: 16 },
            validation: null
          },
          {
            title: { header: '*设备通道数量（设备类型为NVR，必填）', key: 'channelSize', width: 16 },
            validation: this.validation.channelSize
          },
          {
            title: { header: '*主子码流数量', key: 'multiStreamSize', width: 16 },
            validation: this.validation.multiStreamSize
          },
          {
            title: { header: '是否启用自动拉流', key: 'pullType', width: 24 },
            validation: this.validation.pullType
          },
          {
            title: { header: '*自动拉取第几个码流（开启自动拉流时，该项必填）', key: 'AutoStreamNum', width: 24 },
            validation: {
              type: 'list',
              allowBlank: true,
              showInputMessage: true,
              showErrorMessage: true,
              formulae: ['"主码流,子码流,第三码流"'],
              prompt: '如果启用自动拉流，该项为必选'
            }
          },
          {
            title: { header: '是否启用自动激活推流地址', key: 'pushType', width: 30 },
            validation: this.validation.pushType
          },
          {
            title: { header: '设备视频流优先传输协议', key: 'transPriority', width: 30 },
            validation: this.validation.transPriority
          },
          // {
          //   title: { header: '拉流地址', key: 'pullAddress', width: 30 },
          //   validation: null
          // },
          // {
          //   title: { header: '视频流标签', key: 'tags', width: 24 },
          //   validation: this.validation.tags
          // },
          {
            title: { header: '*视频包', key: 'videoPackage', width: 40 },
            validation: this.getVideoPackageValidation()
          },
          {
            title: { header: 'AI包', key: 'AIPackage', width: 40 },
            validation: this.getAIPackageValidation()
          },
          {
            title: { header: '上行带宽包', key: 'BWPackage', width: 40 },
            validation: this.getBWPackageValidation()
          }
        ]
      }
    ]
  }

  /**
   * 动态validation
   */
  private getGbAccountValidation() {
    return {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      // formulae: this.options.gbAccountList.length ? [`'gbAccountListSheet'!$${String.fromCharCode(65)}$1:$${String.fromCharCode(64 + this.options.gbAccountList.length)}$1`] : ['""'],
      formulae: [this.joinDropdownlist(this.options.gbAccountList)],
      error: '请选择国标用户名'
    }
  }

  private getAvailableChannelsValidation() {
    return {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: [this.joinDropdownlist(this.options.availableChannels)],
      error: '请选择通道号'
    }
  }

  private getVideoPackageValidation() {
    return {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      formulae: [this.joinDropdownlist(this.options.VIDEOList)],
      error: '请选择视频包'
    }
  }

  private getAIPackageValidation() {
    return {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      formulae: [this.joinDropdownlist(this.options.AIList)],
      error: '请选择AI包'
    }
  }

  private getBWPackageValidation() {
    return {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      formulae: [this.joinDropdownlist(this.options.BWList)],
      error: '请选择上行带宽包'
    }
  }

  private getRegionValidation() {
    return {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: [this.joinDropdownlist(this.regionList)],
      error: '请选择接入区域'
    }
  }

  private getIndustryList() {
    return {
      type: 'list',
      allowBlank: false,
      showInputMessage: true,
      showErrorMessage: true,
      formulae: [this.joinDropdownlist(this.industryList)],
      error: '请从选项中选择所属行业'
    }
  }

  private getAddressList() {
    return {
      type: 'list',
      allowBlank: false,
      showInputMessage: true,
      showErrorMessage: true,
      formulae: [this.joinDropdownlist(this.addressList)],
      error: '请从选项中选择设备地址'
    }
  }

  // 动态校验 formulae值 转换处理
  public joinDropdownlist = (data: any) => {
    return data.length ? '"' + data.join(',') + '"' : '""'
  }

  // 调接口获取下拉数据 --- start ---
  private async getRegionList() {
    try {
      const regionList = await getRegions()
      this.regionList = regionList
        ?.map((item: any) => {
          return item.children.map((val: any) => {
            return `${item.value}/${val.label}`
          })
        })
        .flat()
    } catch (e) {
      console.error(e)
    }
  }

  private async getIndustry() {
    try {
      const industryList = await getIndustryList()
      this.industryList = industryList.data.map((item: any) => item.name)
    } catch (e) {
      console.error(e)
    }
  }

  private async getOptions() {
    // 获取资源包选项
    try {
      const VIDEORes: any = await getResources({ type: 'VSS_VIDEO' })
      this.options.VIDEOList = VIDEORes.resPkgList
        ? VIDEORes.resPkgList
            .filter((pkg) => new Date().getTime() < new Date(pkg.expireTime).getTime())
            .map((item: any) => {
              return `${item.totalDeviceCount}路:${item.remainDeviceCount}路:${item.bitRate}M:${item.storageTime}天||${item.workOrderNo}`
            })
        : []
      const AIRes: any = await getResources({ type: 'VSS_AI' })
      this.options.AIList = AIRes.resPkgList
        ? AIRes.resPkgList
            .filter((pkg) => new Date().getTime() < new Date(pkg.expireTime).getTime())
            .map((item: any) => {
              return `${item.totalDeviceCount}路:${item.remainDeviceCount}路:${this.resourceAiType[item.aIType]}||${item.workOrderNo}`
            })
        : []
      const BWRes: any = await getResources({ type: 'VSS_UPLOAD_BW' })
      this.options.BWList = BWRes.resPkgList
        ? BWRes.resPkgList
            .filter((pkg) => new Date().getTime() < new Date(pkg.expireTime).getTime())
            .map((item: any) => {
              return `${item.bitRate}M||${item.workOrderNo}`
            })
        : []
    } catch (e) {
      console.error(e)
    }
    // 获取设备用户选项
    try {
      const res = await getGa1400CertificateList({
        pageSize: 1000
      })
      res.data.forEach((account: any) => {
        this.options.gbAccountList.push(account.username)
      })
    } catch (e) {
      console.error(e)
    }

    // todo   通道 构建可选择的通道，排除已选择通道
    // const info = await getDevice({
    //   deviceId: this.parentDeviceId,
    //   inProtocol: this.excelInProtocol
    // })
    // const usedChannelNum = info.deviceChannels.map((channel: any) => {
    //   return channel.channelNum
    // })
    // const channelSize = info.deviceStats.maxChannelSize
    // this.options.availableChannels = []
    // for (let i = 1; i <= channelSize; i++) {
    //   if (!~usedChannelNum.indexOf(i)) {
    //     this.availableChannels.push(`D${i}`)
    //   }
    // }

    // 生成额外sheet存储动态选项  暂时关闭
    // for (const key in this.options) {
    //   if (this.options[key].length) {
    //     const sheet = this.workbook.addWorksheet(`${key}Sheet`)
    //     sheet.addRow(this.options[key])
    //     sheet.state = 'hidden'
    //   }
    // }
  }
  // 调接口获取下拉数据 --- end ---

  /**
   *
   * @memberof 导出模板
   */
  public async exportTemplate(addressList: any) {
    this.addressList = addressList

    await this.getRegionList()

    await this.getIndustry()

    const ExcelJS = await import(/* webpackChunkName: "exceljs" */ 'exceljs')
    const excelName = this.excelName || '设备模板'

    this.workbook = new ExcelJS.Workbook()
    this.workbook.views = this.excelViews

    await this.getOptions() // todo 待完善

    this.excelTemplateSheet.forEach((item: any) => {
      const worksheet: any = this.workbook.addWorksheet('My Sheet')
      worksheet.name = item.name
      worksheet.columns = item.content.map((val: any) => val.title)

      //增加校验规则
      item.content.forEach((val: any, idx) => {
        const columnIndex = String.fromCharCode(65 + idx)
        worksheet.dataValidations.add(`${columnIndex}2:${columnIndex}9999`, val.validation)
      })

      // 调整样式
      worksheet._columns.forEach((column: any) => {
        column.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true
        }
      })

      // 添加过滤器
      worksheet.autoFilter = {
        from: {
          row: 1,
          column: 1
        },
        to: {
          row: 9999,
          column: worksheet._columns.length
        }
      }
    })

    // 增加第五个sheet
    const worksheetExplain: any = this.workbook.addWorksheet('My Sheet')
    worksheetExplain.name = this.worksheetExplainName

    // 设置列的宽度
    worksheetExplain.properties.defaultColWidth = 16

    // 合并单元格
    worksheetExplain.mergeCells('A1:E6')
    worksheetExplain.getCell('E6').value = this.excelExplain
    // 让文字换行
    worksheetExplain.getCell('E6').alignment = { wrapText: true }

    const buffer = await this.workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/xlsx' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${excelName}.xlsx`
    link.click()
  }

  // 下载 文件流格式 表格
  public downloadFileWithBlob(fileName: string, file: any) {
    console.log('file.type ----->', file.headers['content-type'] )
    const blob = new Blob([file.data], { type:file.headers['content-type'] })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${fileName}.xlsx`
    link.click()
    link.remove()
  }

  // 下载表格
  public downloadFileUrl(fileName: string, file: any) {
    const blob = this.base64ToBlob(`data:application/zip;base64,${file}`)
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${fileName}.xlsx`
    link.click()
  }
  // base64转blob
  public base64ToBlob(base64: any) {
    const arr = base64.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  // 文件转base64
  public fileToBase64(file: any, reader: any) {
    return new Promise((resolve, reject) => {
      reader = new FileReader()
      let fileResult: any = ''
      reader.readAsDataURL(file)
      reader.onload = function () {
        fileResult = reader.result
      }
      reader.onerror = function (error: any) {
        reject(error)
      }
      reader.onloadend = function () {
        resolve(fileResult)
      }
    })
  }
}

export default new ExportExcelTemplate()
