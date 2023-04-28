import { Component, Vue } from 'vue-property-decorator'
import { getList as getGbList } from '@/api/certificate/gb28181'
import { exportDeviceAll, exportDeviceOption, getDevice } from '@/api/device'
// import { cityMapping, provinceMapping } from '@/assets/region/cities'
import { getResources } from '@/api/billing'
import { ResourceAiType } from '@/dics'
// import ExcelJS from 'exceljs'

@Component
export default class ExcelMixin extends Vue {
  private workbook = null
  public resourceAiType: any = ResourceAiType
  public exelType = ''
  public exelDeviceType: any = ''
  public exportData: any = []
  public exelName = ''
  public parentDeviceId = ''
  public excelInProtocol: any = ''
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

  public regionName = ''
  public excelGroupDate: any
  private gbAccountList: any = []
  private availableChannels: any = []
  private cityList: any = []
  private AIList: any = []
  private VIDEOList: any = []
  private BWList: any = []
  private options: any = {
    gbAccountList: [],
    availableChannels: [],
    VIDEOList: [],
    BWList: [],
    options: []
  }

  // 表格字段配置
  private get excelTemplate() {
    return {
      gb28181: [
        {
          title: { header: '*设备类型', key: 'deviceType', width: 16 },
          validation: this.validation.deviceType
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
        {
          title: { header: '国标ID', key: 'gbId', width: 24, style: { numFmt: '@' } },
          validation: {
            type: 'textLength',
            allowBlank: false,
            operator: 'equal',
            showErrorMessage: true,
            formulae: [20],
            error: '请输入规范国标ID。'
          }
        },
        {
          title: { header: '*国标用户名', key: 'userName', width: 16 },
          validation: this.getGbAccountValidation()
        },
        {
          title: { header: '设备MAC地址', key: 'macAddr', width: 24 },
          validation: null
        },
        {
          title: { header: '杆号', key: 'poleId', width: 24, style: { numFmt: '@' } },
          validation: {
            type: 'textLength',
            allowBlank: false,
            operator: 'between',
            showErrorMessage: true,
            formulae: [1, 21],
            error: '请输入规范杆号。'
          }
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
      ],
      ehome: [
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
      ],
      rtmp: [
        {
          title: { header: '*视频流接入方式', key: 'inType', width: 24 },
          validation: this.validation.inType
        },
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
      ],
      rtsp: [
        {
          title: { header: '*视频流接入方式', key: 'inType', width: 24 },
          validation: this.validation.inType
        },
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
        // { header: '*自定义拉流地址（设备厂商选择其他时，该项必填）', key: 'deviceIp', width: 24 },
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
          title: { header: '是否启用自动拉流', key: 'pullType', width: 24 },
          validation: this.validation.pullType
        },
        {
          title: { header: '是否启用自动激活推流地址', key: 'pushType', width: 30 },
          validation: this.validation.pushType
        },
        {
          title: { header: '设备视频流优先传输协议', key: 'transPriority', width: 30 },
          validation: this.validation.transPriority
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
      ],
      nvr: [
        {
          title: { header: '通道号', key: 'channelNum', width: 10 },
          validation: this.getAvailableChannelsValidation()
        },
        {
          title: { header: '厂商', key: 'deviceVendor', width: 16 },
          validation: this.validation.deviceVendor
        },
        {
          title: { header: '通道名称', key: 'channelName', width: 16 },
          validation: this.validation.deviceName
        }
      ]
    }
  }

  /**
   * 静态validation集合
   */
  private validation = {
    deviceType: {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: ['"IPC,NVR,Platform"'],
      error: '请选择设备类型'
    },
    deviceVendor: {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      // formulae: ['"海康,大华,宇视,科达,华为,其他"'],
      formulae: ['"海康,大华,宇视,科达,金三立,华为,其他"'],
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
    }
  }

  /**
   * 动态validation
   */
  private getGbAccountValidation() {
    console.log()
    return {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: this.options.gbAccountList.length ? [`'gbAccountListSheet'!$${String.fromCharCode(65)}$1:$${String.fromCharCode(64 + this.options.gbAccountList.length)}$1`] : ['""'],
      error: '请选择国标用户名'
    }
  }

  private getAvailableChannelsValidation() {
    return {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: this.options.availableChannels.length ? [`'availableChannelsSheet'!$${String.fromCharCode(65)}$1:$${String.fromCharCode(64 + this.options.availableChannels.length)}$1`] : ['""'],
      error: '请选择通道号'
    }
  }

  private getVideoPackageValidation() {
    return {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      formulae: this.options.VIDEOList.length ? [`'VIDEOListSheet'!$${String.fromCharCode(65)}$1:$${String.fromCharCode(64 + this.options.VIDEOList.length)}$1`] : ['""'],
      error: '请选择视频包'
    }
  }

  private getAIPackageValidation() {
    return {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      formulae: this.options.AIList.length ? [`'AIListSheet'!$${String.fromCharCode(65)}$1:$${String.fromCharCode(64 + this.options.AIList.length)}$1`] : ['""'],
      error: '请选择AI包'
    }
  }

  private getBWPackageValidation() {
    return {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      formulae: this.options.BWList.length ? [`'BWListSheet'!$${String.fromCharCode(65)}$1:$${String.fromCharCode(64 + this.options.BWList.length)}$1`] : ['""'],
      error: '请选择上行带宽包'
    }
  }

  /**
   * 获取动态validation选项
   */
  private async getOptions() {
    // 获取资源包选项
    try {
      const VIDEORes: any = await getResources({ type: 'VSS_VIDEO' })
      this.options.VIDEOList = VIDEORes.resPkgList
        ? VIDEORes.resPkgList.filter(pkg => new Date().getTime() < new Date(pkg.expireTime).getTime()).map((item: any) => {
          return `${item.totalDeviceCount}路:${item.remainDeviceCount}路:${item.bitRate}M:${item.storageTime}天||${item.resourceId}`
        })
        : []
      const AIRes: any = await getResources({ type: 'VSS_AI' })
      this.options.AIList = AIRes.resPkgList
        ? AIRes.resPkgList.filter(pkg => new Date().getTime() < new Date(pkg.expireTime).getTime()).map((item: any) => {
          return `${item.totalDeviceCount}路:${item.remainDeviceCount}路:${this.resourceAiType[item.aiType]}||${item.resourceId}`
        })
        : []
      const BWRes: any = await getResources({ type: 'VSS_UPLOAD_BW' })
      this.options.BWList = BWRes.resPkgList
        ? BWRes.resPkgList.filter(pkg => new Date().getTime() < new Date(pkg.expireTime).getTime()).map((item: any) => {
          return `${item.bitRate}M||${item.resourceId}`
        })
        : []
    } catch (e) {
      console.error(e)
    }
    if (this.exelDeviceType === 'gb28181') {
      // 获取设备用户选项
      try {
        const res = await getGbList({
          pageSize: 1000
        })
        res.gbCerts.forEach((account: any) => {
          this.options.gbAccountList.push(account.userName)
        })
      } catch (e) {
        console.error(e)
      }
      // 获取预设城市选项
      // const mainUserAddress: any = this.$store.state.user.mainUserAddress
      // this.cityList = mainUserAddress.split(',').map((addressCode: any) => {
      //   if (!addressCode) {
      //     let findKey = (value: any, compare = (a: any, b: any) => a.substring(0, 2) === b.substring(0, 2)) => {
      //       return Object.keys(cityMapping).find(k => compare(cityMapping[k], value))
      //     }
      //     addressCode = findKey(this.regionName)
      //     if (!addressCode) {
      //       return []
      //     }
      //   }
      //   let provincelevelCities = [
      //     '北京市',
      //     '天津市',
      //     '上海市',
      //     '重庆市',
      //     '台湾省',
      //     '香港特别行政区',
      //     '澳门特别行政区'
      //   ]
      //   let city = cityMapping[addressCode]
      //   if (provincelevelCities.includes(city)) {
      //     return city
      //   } else {
      //     return provinceMapping[addressCode.substring(0, 2)] + city
      //     // let test = []
      //     // for (let i = 0; i < 20; i++) {
      //     //   test.push('广东省清远市连州派出所')
      //     // }
      //     // return test
      //   }
      // })
    } else if (this.exelDeviceType === 'nvr') {
      // 构建可选择的通道，排除已选择通道
      const info = await getDevice({
        deviceId: this.parentDeviceId,
        inProtocol: this.excelInProtocol
      })
      const usedChannelNum = info.deviceChannels.map((channel: any) => {
        return channel.channelNum
      })
      const channelSize = info.deviceStats.maxChannelSize
      this.options.availableChannels = []
      for (let i = 1; i <= channelSize; i++) {
        if (!~usedChannelNum.indexOf(i)) {
          this.availableChannels.push(`D${i}`)
        }
      }
    }
    // 生成额外sheet存储动态选项
    for (const key in this.options) {
      if (this.options[key].length) {
        const sheet = this.workbook.addWorksheet(`${key}Sheet`)
        sheet.state = 'hidden'
        sheet.addRow(this.options[key])
      }
    }
  }

  /**
   * 表格填写各字段校验
   */
  private optionsInit(worksheet: any, template: any) {
    template.forEach((column, index) => {
      const columnIndex = String.fromCharCode(65 + index)
      worksheet.dataValidations.add(`${columnIndex}2:${columnIndex}9999`, column.validation)
    })
  }

  private coulumnFilter(coulumns: any) {
    const result: any = {}
    Object.keys(coulumns).filter((key) => key !== 'BWPackage').forEach((key) => {
      result[key] = coulumns[key]
    })
    return result
  }

  /**
   * 导出模板
   */
  public async exportExel() {
    const ExcelJS = await import(/* webpackChunkName: "exceljs" */'exceljs')
    const exelName = this.exelName
    this.workbook = new ExcelJS.Workbook()
    this.workbook.views = this.excelViews
    await this.getOptions()
    const worksheet: any = this.workbook.addWorksheet('My Sheet')
    worksheet.name = exelName
    let template = this.excelTemplate[this.exelDeviceType]
    // 过滤template
    let filters: Array<string> = ['gbId']
    if (this.$store.state.user.tags.enabled_input_gbid === 'Y') {
      filters = filters.filter(item => item !== 'gbId')
    }
    template = template.filter(item => !filters.includes(item.title.key))
    // 插入表格列对应title
    worksheet.columns = template.map(item => {
      return item.title
    })
    this.exportData.map((device: any) => {
      worksheet.addRow(device)
    })
    // 添加校验规则
    this.optionsInit(worksheet, template)
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
    const buffer = await this.workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/xlsx' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${exelName}.xlsx`
    link.click()
  }

  // 导出设备表格
  public async exportDevicesExcel(data: any) {
    const params: any = {
      groupId: data.groupId,
      inProtocol: data.inProtocol,
      dirId: data.dirId.toString(),
      parentDeviceId: data.parentDeviceId
    }
    let res: any = {}
    // data.parentDeviceId && (params.parentDeviceId = data.parentDeviceId)
    try {
      if (data.command === 'all') {
        const query = this.$route.query
        params.deviceStatusKeys = query.deviceStatusKeys || undefined
        params.streamStatusKeys = query.streamStatusKeys || undefined
        params.deviceAddresses = query.deviceAddresses || undefined
        params.matchKeys = query.matchKeys
        params.searchKey = query.searchKey || undefined
        params.pageSize = 5000
        params.pageNum = 1
        res = await exportDeviceAll(params)
      } else if (data.command === 'selected') {
        params.deviceIds = data.deviceIds
        res = await exportDeviceOption(params)
      }
      console.log('v1---->', res)
      this.downloadFileUrl(`${params.inProtocol}导出设备表格`, res.exportFile)
    } catch (e) {
      console.log(e)
    }
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
      reader.onload = function() {
        fileResult = reader.result
      }
      reader.onerror = function(error: any) {
        reject(error)
      }
      reader.onloadend = function() {
        resolve(fileResult)
      }
    })
  }
}
