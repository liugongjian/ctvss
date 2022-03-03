import { Component, Vue } from 'vue-property-decorator'
import { getList as getGbList } from '@/api/certificate/gb28181'
import { exportDeviceAll, exportDeviceOption, getDevice } from '@/api/device'
// import { cityMapping, provinceMapping } from '@/assets/region/cities'
import { getResources } from '@/api/billing'
import { ResourceAiType } from '@/dics'
import ExcelJS from 'exceljs'

@Component
export default class ExcelMixin extends Vue {
  public resourceAiType: any = ResourceAiType
  public exelType: string = ''
  public exelDeviceType: string = ''
  public exportData: any = []
  public exelName: string = ''
  public parentDeviceId: string = ''
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
  // 表格字段配置
  private columnsTemplate: any = {
    gb28181: {
      template: [
        { header: '*设备类型', key: 'deviceType', width: 16 },
        { header: '*国标版本', key: 'gbVersion', width: 16 },
        { header: '*设备厂商', key: 'deviceVendor', width: 16 },
        { header: '*设备名称', key: 'deviceName', width: 24 },
        { header: '设备描述', key: 'description', width: 16 },
        { header: '设备IP', key: 'deviceIp', width: 24 },
        { header: '设备端口', key: 'devicePort', width: 16 },
        { header: '*国标用户名', key: 'userName', width: 16 },
        { header: '设备MAC地址', key: 'mac', width: 24 },
        { header: '经度', key: 'deviceLongitude', width: 16 },
        { header: '纬度', key: 'deviceLatitude', width: 16 },
        { header: '*是否启用自动拉流', key: 'pullType', width: 30 },
        { header: '*设备视频流优先传输协议', key: 'transPriority', width: 30 },
        { header: '*设备通道数量（设备类型为NVR时，该项必填）', key: 'channelSize', width: 16 },
        { header: '*视频包', key: 'videoPackage', width: 40 },
        { header: 'AI包', key: 'AIPackage', width: 40 },
        { header: '上行带宽包', key: 'BWPackage', width: 40 }
      ]
    },
    rtmp: {
      template: [
        { header: '*视频流接入方式', key: 'inType', width: 24 },
        { header: '*设备类型', key: 'deviceType', width: 16 },
        { header: '*设备厂商', key: 'deviceVendor', width: 16 },
        { header: '*设备名称', key: 'deviceName', width: 24 },
        { header: '经度', key: 'deviceLongitude', width: 16 },
        { header: '纬度', key: 'deviceLatitude', width: 16 },
        { header: '设备描述', key: 'description', width: 16 },
        { header: '*是否启用自动拉流（接入方式为拉流，该项必填）', key: 'pullType', width: 30 },
        { header: '*是否启用自动激活推流地址（接入方式为推流，该项必填）', key: 'pushType', width: 30 },
        { header: '*拉流地址（接入方式为拉流，该项必填）', key: 'pullUrl', width: 24 },
        { header: '视频流标签', key: 'tags', width: 24 },
        { header: '*视频包', key: 'videoPackage', width: 40 },
        { header: 'AI包', key: 'AIPackage', width: 40 },
        { header: '上行带宽包', key: 'BWPackage', width: 40 }
      ]
    },
    rtsp: {
      template: [
        { header: '*视频流接入方式', key: 'inType', width: 24 },
        { header: '*设备类型', key: 'deviceType', width: 16 },
        { header: '*设备厂商', key: 'deviceVendor', width: 16 },
        { header: '*设备名称', key: 'deviceName', width: 16 },
        { header: '设备描述', key: 'description', width: 16 },
        { header: '*用户名（视频接入方式为拉流时，该项必填）', key: 'userName', width: 16 },
        { header: '*密码（视频接入方式为拉流时，该项必填）', key: 'password', width: 16 },
        { header: '经度', key: 'deviceLongitude', width: 16 },
        { header: '纬度', key: 'deviceLatitude', width: 16 },
        { header: '*是否启动域名', key: 'enableDomain', width: 16 },
        // { header: '*自定义拉流地址（设备厂商选择其他时，该项必填）', key: 'deviceIp', width: 24 },
        { header: '*设备IP（未启动域名必填）', key: 'deviceIp', width: 24 },
        { header: '*设备域名（启动域名必填）', key: 'deviceDomain', width: 24 },
        { header: '*设备端口', key: 'devicePort', width: 16 },
        { header: '*设备通道数量（设备类型为NVR，必填）', key: 'channelSize', width: 16 },
        { header: '*主子码流数量', key: 'multiStreamSize', width: 16 },
        // { header: '是否启用自动拉流', key: 'pullType', width: 24 },
        { header: '*自动拉取第几个码流（开启自动拉流时，该项必填）', key: 'AutoStreamNum', width: 24 },
        { header: '是否启用自动拉流', key: 'pullType', width: 24 },
        { header: '是否启用自动激活推流地址', key: 'pushType', width: 30 },
        { header: '设备视频流优先传输协议', key: 'transPriority', width: 30 },
        { header: '*视频包', key: 'videoPackage', width: 40 },
        { header: 'AI包', key: 'AIPackage', width: 40 },
        { header: '上行带宽包', key: 'BWPackage', width: 40 }
      ]
    },
    ehome: {
      template: [
        { header: '*设备类型', key: 'deviceType', width: 16 },
        { header: '*版本', key: 'ehomeVersion', width: 16, style: { numFmt: '0.0' } },
        { header: '*设备厂商', key: 'ehomeVendor', width: 16 },
        { header: '*设备名称', key: 'deviceName', width: 16 },
        { header: '设备描述', key: 'description', width: 16 },
        { header: '设备IP', key: 'deviceIp', width: 24 },
        { header: '设备端口', key: 'devicePort', width: 16 },
        { header: 'MAC地址', key: 'mac', width: 24 },
        { header: '经度', key: 'deviceLongitude', width: 16 },
        { header: '纬度', key: 'deviceLatitude', width: 16 },
        { header: '*主子码流数量', key: 'multiStreamSize', width: 16 },
        { header: '*自动拉流', key: 'pullType', width: 16 },
        { header: '*自动拉取码流（开启自动拉流，该项必填）', key: 'AutoStreamNum', width: 16 },
        { header: '*设备通道数量（设备类型为NVR时，该项必填）', key: 'channelSize', width: 16 },
        { header: '*视频包', key: 'videoPackage', width: 40 },
        { header: 'AI包', key: 'AIPackage', width: 40 },
        { header: '上行带宽包', key: 'BWPackage', width: 40 }
      ]
    },
    nvr: {
      template: [
        { header: '通道号', key: 'channelNum', width: 10 },
        { header: '厂商', key: 'deviceVendor', width: 16 },
        { header: '通道名称', key: 'channelName', width: 16 }
      ]
    }
  }
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
    }
  }

  private getVideoPackageValidation(VIDEOList: any) {
    return {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      formulae: [`"${VIDEOList.join(',')}"`],
      error: '请选择视频包'
    }
  }

  private getAIPackageValidation(AIList: any) {
    return {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      formulae: [`"${AIList.join(',')}"`],
      error: '请选择AI包'
    }
  }

  private getBWPackageValidation(BWList: any) {
    return {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      formulae: [`"${BWList.join(',')}"`],
      error: '请选择上行带宽包'
    }
  }

  private async getOptions() {
    // 获取资源包选项
    try {
      let VIDEORes: any = await getResources({ type: 'VSS_VIDEO' })
      this.VIDEOList = VIDEORes.resPkgList ? VIDEORes.resPkgList.filter(pkg => new Date().getTime() < new Date(pkg.expireTime).getTime()).map((item: any) => {
        return `${item.totalDeviceCount}路:${item.remainDeviceCount}路:${item.bitRate}M:${item.storageTime}天||${item.resourceId}`
      }) : []
      let AIRes: any = await getResources({ type: 'VSS_AI' })
      this.AIList = AIRes.resPkgList ? AIRes.resPkgList.filter(pkg => new Date().getTime() < new Date(pkg.expireTime).getTime()).map((item: any) => {
        return `${item.totalDeviceCount}路:${item.remainDeviceCount}路:${this.resourceAiType[item.aiType]}||${item.resourceId}`
      }) : []
      let BWRes: any = await getResources({ type: 'VSS_UPLOAD_BW' })
      this.BWList = BWRes.resPkgList ? BWRes.resPkgList.filter(pkg => new Date().getTime() < new Date(pkg.expireTime).getTime()).map((item: any) => {
        return `${item.bitRate}M||${item.resourceId}`
      }) : []
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
          this.gbAccountList.push(account.userName)
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
      this.availableChannels = []
      for (let i = 1; i <= channelSize; i++) {
        if (!~usedChannelNum.indexOf(i)) {
          this.availableChannels.push(`D${i}`)
        }
      }
    }
  }

  // 表格填写各字段校验
  private gb28181OptionsInit(worksheet: any) {
    worksheet.dataValidations.add('A2:A9999', this.validation.deviceType)
    worksheet.dataValidations.add('B2:B9999', {
      type: 'list',
      allowBlank: true,
      showInputMessage: true,
      showErrorMessage: true,
      formulae: ['"2011,2016"'],
      prompt: '当选择 “IPC” 或 “NVR” 设备类型时为必选',
      error: '请从选项中选择国标版本'
    })
    worksheet.dataValidations.add('C2:C9999', this.validation.deviceVendor)
    worksheet.dataValidations.add('D2:D9999', this.validation.deviceName)
    worksheet.dataValidations.add('H2:H9999', {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: [`"${this.gbAccountList.join(',')}"`],
      error: '请选择国标用户名'
    })
    worksheet.dataValidations.add('L2:L9999', this.validation.pullType)
    // worksheet.dataValidations.add('L2:L9999', {
    //   type: 'textLength',
    //   allowBlank: true,
    //   operator: 'equal',
    //   formulae: [20],
    //   showInputMessage: true,
    //   showErrorMessage: true,
    //   prompt: '当选择 “Platform” 设备类型时为必选',
    //   error: '请检查国标ID格式是否正确'
    // })
    worksheet.dataValidations.add('M2:M9999', this.validation.transPriority)
    worksheet.dataValidations.add('N2:N9999', this.validation.channelSize)
    // worksheet.dataValidations.add('M2:M9999', {
    //   type: 'list',
    //   allowBlank: false,
    //   showErrorMessage: true,
    //   formulae: [`"${this.cityList.join(',')}"`],
    //   error: '请选择预设城市'
    // })
    worksheet.dataValidations.add('O2:O9999', this.getVideoPackageValidation(this.VIDEOList))
    worksheet.dataValidations.add('P2:P9999', this.getAIPackageValidation(this.AIList))
    worksheet.dataValidations.add('Q2:Q9999', this.getBWPackageValidation(this.BWList))
  }

  private rtmpOptionsInit(worksheet: any) {
    worksheet.dataValidations.add('A2:A9999', this.validation.inType)
    worksheet.dataValidations.add('B2:B9999', {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: ['"IPC"'],
      error: '请选择设备类型'
    })
    worksheet.dataValidations.add('C2:C9999', this.validation.deviceVendor)
    worksheet.dataValidations.add('D2:D9999', this.validation.deviceName)
    worksheet.dataValidations.add('H2:H9999', this.validation.pullType)
    worksheet.dataValidations.add('I2:I9999', this.validation.pushType)
    worksheet.dataValidations.add('K2:K9999', this.validation.tags)
    worksheet.dataValidations.add('L2:L9999', this.getVideoPackageValidation(this.VIDEOList))
    worksheet.dataValidations.add('M2:M9999', this.getAIPackageValidation(this.AIList))
    worksheet.dataValidations.add('N2:N9999', this.getBWPackageValidation(this.BWList))
  }

  private rtspOptionsInit(worksheet: any) {
    worksheet.dataValidations.add('A2:A9999', this.validation.inType)
    worksheet.dataValidations.add('B2:B9999', {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: ['"IPC,NVR"'],
      error: '请选择设备类型'
    })
    worksheet.dataValidations.add('C2:C9999', this.validation.deviceVendor)
    worksheet.dataValidations.add('D2:D9999', this.validation.deviceName)
    worksheet.dataValidations.add('J2:J9999', {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      formulae: ['"是,否"'],
      error: '请选择是否启动域名'
    })
    worksheet.dataValidations.add('N2:N9999', this.validation.channelSize)
    worksheet.dataValidations.add('O2:O9999', this.validation.multiStreamSize)
    worksheet.dataValidations.add('P2:P9999', {
      type: 'list',
      allowBlank: true,
      showInputMessage: true,
      showErrorMessage: true,
      formulae: ['"主码流,子码流,第三码流"'],
      prompt: '如果启用自动拉流，该项为必选'
    })
    worksheet.dataValidations.add('Q2:Q9999', this.validation.pullType)
    worksheet.dataValidations.add('R2:R9999', this.validation.pushType)
    worksheet.dataValidations.add('S2:S999', this.validation.transPriority)
    worksheet.dataValidations.add('T2:T9999', this.getVideoPackageValidation(this.VIDEOList))
    worksheet.dataValidations.add('U2:U9999', this.getAIPackageValidation(this.AIList))
    worksheet.dataValidations.add('V2:V9999', this.getBWPackageValidation(this.BWList))
  }

  private ehomeOptionsInit(worksheet: any) {
    worksheet.dataValidations.add('A2:A9999', {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: ['"IPC,NVR"'],
      error: '请选择设备类型'
    })
    worksheet.dataValidations.add('B2:B9999', {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: ['"2.0"'],
      error: '请选择版本'
    })
    worksheet.dataValidations.add('C2:C9999', {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: ['"海康"'],
      error: '请选择厂商'
    })
    worksheet.dataValidations.add('D2:D9999', this.validation.deviceName)
    worksheet.dataValidations.add('K2:K9999', this.validation.multiStreamSize)
    worksheet.dataValidations.add('L2:L9999', this.validation.pullType)
    worksheet.dataValidations.add('M2:M9999', {
      type: 'list',
      allowBlank: true,
      showInputMessage: true,
      showErrorMessage: true,
      formulae: ['"主码流,子码流,第三码流"'],
      prompt: '1、自动拉流的情况下，“自动拉取码流”项才会生效；2、自动拉取码流的范围不得超过主子码流数量'
    })
    worksheet.dataValidations.add('N2:N9999', this.validation.channelSize)
    worksheet.dataValidations.add('O2:O9999', this.getVideoPackageValidation(this.VIDEOList))
    worksheet.dataValidations.add('P2:P9999', this.getAIPackageValidation(this.AIList))
    worksheet.dataValidations.add('Q2:Q9999', this.getBWPackageValidation(this.BWList))
  }

  private nvrOptionsInit(worksheet: any) {
    worksheet.dataValidations.add('A2:A9999', {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: [`"${this.availableChannels.join(',')}"`],
      error: '请选择通道号'
    })
    worksheet.dataValidations.add('B2:B9999', this.validation.deviceVendor)
    worksheet.dataValidations.add('C2:C9999', this.validation.deviceName)
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
    await this.getOptions()
    const exelName = this.exelName
    const workbook = new ExcelJS.Workbook()
    workbook.views = this.excelViews
    const worksheet: any = workbook.addWorksheet('My Sheet')
    worksheet.name = exelName
    let accessColumns = this.columnsTemplate[this.exelDeviceType][this.exelType]
    if (this.excelGroupDate && this.excelGroupDate.inNetworkType === 'private') {
      worksheet.columns = accessColumns.filter((item: any) => item.key !== 'BWPackage')
    }
    worksheet.columns = this.columnsTemplate[this.exelDeviceType][this.exelType]
    this.exportData.map((device: any) => {
      worksheet.addRow(device)
    })
    if (this.exelDeviceType === 'gb28181') this.gb28181OptionsInit(worksheet)
    if (this.exelDeviceType === 'rtmp') this.rtmpOptionsInit(worksheet)
    if (this.exelDeviceType === 'rtsp') this.rtspOptionsInit(worksheet)
    if (this.exelDeviceType === 'ehome') this.ehomeOptionsInit(worksheet)
    if (this.exelDeviceType === 'nvr') this.nvrOptionsInit(worksheet)
    // 调整样式
    worksheet._columns.forEach((column: any) => {
      // column.style = {
      //   alignment: {
      //     vertical: 'middle',
      //     horizontal: 'center'
      //   }
      // }
      if (column._number === 10) {
        column.numFmt = '@'
      }
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
    const buffer = await workbook.xlsx.writeBuffer()
    var blob = new Blob([buffer], { type: 'application/xlsx' })
    var link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${exelName}.xlsx`
    link.click()
  }

  // 导出设备表格
  public async exportDevicesExcel(data: any) {
    let params: any = {
      groupId: data.groupId,
      inProtocol: data.inProtocol,
      dirId: data.dirId.toString(),
      parentDeviceId: data.parentDeviceId
    }
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
        var res = await exportDeviceAll(params)
      } else if (data.command === 'selected') {
        params.deviceIds = data.deviceIds
        res = await exportDeviceOption(params)
      }
      this.downloadFileUrl(`${params.inProtocol}导出设备表格`, res.exportFile)
    } catch (e) {
      console.log(e)
    }
  }

  // 下载表格
  public downloadFileUrl(fileName: string, file: any) {
    const blob = this.base64ToBlob(`data:application/zip;base64,${file}`)
    var link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${fileName}.xlsx`
    link.click()
  }
  // base64转blob
  public base64ToBlob(base64: any) {
    var arr = base64.split(',')
    var mime = arr[0].match(/:(.*?);/)[1]
    var bstr = atob(arr[1])
    var n = bstr.length
    var u8arr = new Uint8Array(n)
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
