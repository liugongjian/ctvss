import { Component, Vue } from 'vue-property-decorator'
import ExcelJS from 'exceljs'

@Component
export default class ExcelMixin extends Vue {
  public exportData: any = []
  public columns: any = []
  public exelName: string = ''
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

  /**
   * 导出模板
   */
  public async exportExel() {
    const workbook = new ExcelJS.Workbook()
    workbook.views = this.excelViews
    const worksheet: any = workbook.addWorksheet('My Sheet')
    worksheet.name = this.exelName
    worksheet.columns = this.columns.map((column: any) => {
      return {
        header: column.label,
        key: column.prop,
        width: 25
      }
    })
    this.exportData.forEach((data: any) => {
      worksheet.addRow(data)
    })
    // 调整样式
    worksheet._columns.forEach((column: any) => {
      column.style = {
        alignment: {
          horizontal: 'left'
        }
      }
      if (column._number === 10) {
        column.numFmt = '@'
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
    link.download = `${worksheet.name}.xlsx`
    link.click()
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
