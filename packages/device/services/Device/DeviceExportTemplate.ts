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

  private options: any = {
    gbAccountList: [],
    availableChannels: [],
    VIDEOList: [],
    BWList: [],
    options: []
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


  // excel 模板实体内容
  private get excelTemplateSheet() {
    return [
      {
        name: 'GB28181',
        content: [
          // {
          //   title: { header: '*设备类型', key: 'deviceType', width: 16 },
          //   validation: this.validation.deviceType
          // },
          // {
          //   title: { header: '*国标版本', key: 'gbVersion', width: 16 },
          //   validation: {
          //     type: 'list',
          //     allowBlank: true,
          //     showInputMessage: true,
          //     showErrorMessage: true,
          //     formulae: ['"2011,2016"'],
          //     prompt: '当选择 “IPC” 或 “NVR” 设备类型时为必选',
          //     error: '请从选项中选择国标版本'
          //   }
          // },
          // {
          //   title: { header: '*设备厂商', key: 'deviceVendor', width: 16 },
          //   validation: this.validation.deviceVendor
          // },
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
          }
          // {
          //   title: { header: '上行带宽包', key: 'BWPackage', width: 40 },
          //   validation: this.getBWPackageValidation()
          // }
        ]
      },
      {
        name: 'EHOME',
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
        ]
      },
      {
        name: 'RTMP',
        content: [
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
        name: 'RTSP',
        content: [
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
          {
            title: { header: '拉流地址', key: 'pullAddress', width: 30 },
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
      }
    ]
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
      //   formulae: this.options.AIList.length ? [`'AIListSheet'!$${String.fromCharCode(65)}$1:$${String.fromCharCode(64 + this.options.AIList.length)}$1`] : ['""'],
      formulae: '',
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
   *
   * @memberof 导出模板
   */
  public async exportTemplate(data: any) {

    console.log('exportTemplate--data----->', data)

    const ExcelJS = await import(/* webpackChunkName: "exceljs" */ 'exceljs')
    const excelName = this.excelName || '设备模板'

    this.workbook = new ExcelJS.Workbook()
    this.workbook.views = this.excelViews

    //Todo 获取四个sheet 中下拉框数据

    this.excelTemplateSheet.forEach((item: any) => {
      const worksheet: any = this.workbook.addWorksheet('My Sheet')
      worksheet.name = item.name
      worksheet.columns = item.content.map((val: any) => val.title)

      // Todo 增加校验规则

      // 调整样式
      worksheet._columns.forEach((column: any) => {
        column.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true
        }
      })

      // Todo 增加过滤器
    })

    // 增加第五个sheet
    const worksheetExplain: any =  this.workbook.addWorksheet('My Sheet')
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
}

export default new ExportExcelTemplate()
