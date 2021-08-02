const ExcelJS = require('exceljs')
const path = require('path')
const fs = require('fs');

(
  async function() {
    const workbook = new ExcelJS.Workbook()
    const workbookObj = await workbook.xlsx.readFile('./region.xlsx')
    let sum = 2
    let jsonArr = []
    let valid1 = []
    let valid2 = []
    console.log(workbookObj._worksheets[1].getRow(2).values)
    while (workbookObj._worksheets[1].getRow(sum).values.length > 0) {
      let res = workbookObj._worksheets[1].getRow(sum).values
      if (!valid1.includes(res[2].result)) {
        valid1.push(res[2].result)
        valid2 = []
        jsonArr.push({
          name: res[2].result,
          code: res[1],
          level: 1,
          children: []
        })
      }
      let index1 = jsonArr.findIndex((item) => {
        return item.name === res[2].result
      })
      if (!valid2.includes(res[4].result)) {
        valid2.push(res[4].result)
        jsonArr[index1].children.push({
          name: res[4].result,
          code: res[3],
          level: 2,
          children: []
        })
      }
      let index2 = jsonArr[index1].children.findIndex((item) => {
        return item.name === res[4].result
      })
      jsonArr[index1].children[index2].children.push({
        name: res[6].result,
        code: res[5],
        level: 3,
        children: []
      })
      sum++
    }
    let jsonData = JSON.stringify(jsonArr)
    let file = path.join(__dirname, 'region.json')
    fs.writeFile(file, jsonData, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('文件创建成功~' + file)
      }
    })
  }
)()
