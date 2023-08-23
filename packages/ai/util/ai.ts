/**
 * @param type event id
 * @param metaData AI接口返回的源数据
 * @return {
 *  top: 上边距,
 *  left: 左边距,
 *  width: 宽度,
 *  height: 高度,
 *  isWarning: 是否警告
 * }
 */

import { AnimalType, CityGovType } from '@vss/ai/dics/contants'
export const parseMetaData = (type: string, metaData: any) => {
  let locations = []
  switch (type) {
    // 未带口罩
    case '1':
      locations = metaData.face_list && metaData.face_list.map((face: any) => {
        return {
          ...face.face_location,
          isWarning: !face.isMask
        }
      })
      break
    // 人员聚集
    case '2':
      locations = metaData.result && metaData.result.map((face: any) => {
        return {
          top: face.box[1],
          left: face.box[0],
          width: face.box[2] - face.box[0],
          height: face.box[3] - face.box[1],
          isWarning: metaData.result.length > 10
        }
      })
      break
      // 人员布控
    case '3':
      locations = metaData.data && metaData.data.map((face: any) => {
        return {
          ...face.location,
          isWarning: true
        }
      })
      break
    // 研发二部人员布控
    case '4':
    case '10001':
      locations = metaData.Data && metaData.Data.MatchList.map((person: any) => {
        try {
          const name = (person.FaceItems.length > 0 && person.FaceItems[0].Labels.length > 0) ? JSON.parse(person.FaceItems[0].Labels).name : '-'
          return {
            top: person.Location.Y,
            left: person.Location.X,
            width: person.Location.Width,
            height: person.Location.Height,
            isWarning: person.FaceItems.length > 0 && person.FaceItems[0].Score > 60,
            score: person.FaceItems.length > 0 && Math.round(person.FaceItems[0].Score),
            name
          }
        } catch (error) {
          console.log(error)
        }
      })
      if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
        locations.push(
          {
            zone: metaData.DangerZoneBox
          }
        )
      }
      break

    case '34':
    case '10034':
    case '19':// 入侵检测
    case '10016':// 入侵检测
      locations = metaData && metaData.map((person: any) => {
        try {
          const rect = JSON.parse(person.FaceRectangles)
          return {
            top: rect[1],
            left: rect[0],
            width: rect[2],
            height: rect[3],
            isWarning: true,
            score: person.Score && Math.round(person.Score * 100),
            name: person.Name
          }
        } catch (error) {
          console.log(error)
        }
      })
      if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
        locations.push(
          {
            zone: metaData.DangerZoneBox
          }
        )
      }
      break

    case '29':// 垃圾站
    case '10026':// 垃圾站
    case '35':// 标准工作服检测
    case '10035':// 标准工作服检测
    case '10038':// 水泥缺陷检测
      locations = metaData.Data && metaData.Data.Boxes.map((box: any) => {
        try {
          let label
          switch (box.Label) {
            case 'cask_yes':
              label = '垃圾桶已盖'
              break
            case 'trash':
              label = '地面垃圾'
              break
            case 'cask_no':
              label = '垃圾桶未盖'
              break
            case 'cask_overflows':
              label = '垃圾桶溢满'
              break
            case 'Bear':
              label = '狗熊'
              break
            default:
              label = box.LabelCh
              break
          }
          return {
            top: box.TopLeftY,
            left: box.TopLeftX,
            width: box.BottomRightX - box.TopLeftX,
            height: box.BottomRightY - box.TopLeftY,
            isWarning: (box.Score.length > 0 && box.Score > 60) || box.Label === 'others',
            label
          }
        } catch (error) {
          console.log(error)
        }
      })
      if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
        locations.push(
          {
            zone: metaData.DangerZoneBox
          }
        )
      }
      break

    case '37':// 城市治理检测
    case '10037':// 城市治理检测
      locations = metaData.Data && metaData.Data.Boxes.map((box: any) => {
        try {
          let label
          const temp = CityGovType.filter(type => type.label === box.Label)
          if (temp.length > 0) {
            label = temp[0].cname
          }
          return {
            top: box.TopLeftY,
            left: box.TopLeftX,
            width: box.BottomRightX - box.TopLeftX,
            height: box.BottomRightY - box.TopLeftY,
            isWarning: (box.Score.length > 0 && box.Score > 60),
            label,
            label_en: box.Label
          }
        } catch (error) {
          console.log(error)
        }
      })
      if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
        locations.push(
          {
            zone: metaData.DangerZoneBox
          }
        )
      }
      break

    case '33':// 动物检测
    case '10033':// 动物检测
      // eslint-disable-next-line no-case-declarations
      const counts = {}
      AnimalType.forEach(item => { counts[item.label] = 0 })
      locations = metaData.Data && metaData.Data.Boxes.map((box: any) => {
        try {
          if (box.Label && typeof counts[box.Label] !== 'undefined') {
            counts[box.Label] += 1
          }
          return {
            top: box.TopLeftY,
            left: box.TopLeftX,
            width: box.BottomRightX - box.TopLeftX,
            height: box.BottomRightY - box.TopLeftY,
            isWarning: box.Score.length > 0 && box.Score > 60,
            label: box.Label
          }
        } catch (error) {
          console.log(error)
        }
      })
      if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
        locations.push(
          {
            zone: metaData.DangerZoneBox
          }
        )
      }
      // @ts-ignore
      locations.counts = counts // 动物数量对象
      break
    case '6': // 研发二部未带口罩
    case '10003': // 研发二部未带口罩
      if (metaData.Data && metaData.Data.FaceRectangles) {
        const boxes = metaData.Data.FaceRectangles
        for (let i = 0; i < boxes.length; i += 4) {
          const type = metaData.Data.ClassList[i / 4]
          locations.push(
            {
              top: boxes[i + 1],
              left: boxes[i],
              width: boxes[i + 2],
              height: boxes[i + 3],
              isWarning: type === 0 || type === 2,
              type
            }
          )
        }
      }
      break

    case '7': // 安全帽反光服检测
    case '10004': // 安全帽反光服检测
      if (metaData.Data && metaData.Data.DetectBoxes) {
        const boxes = metaData.Data.DetectBoxes
        // const label = metaData.Data.Label
        for (let i = 0; i < boxes.length; i += 4) {
          locations.push(
            {
              top: boxes[i + 1],
              left: boxes[i],
              width: boxes[i + 2],
              height: boxes[i + 3],
              // label: label[i / 4],
              isWarning: !![1, 2].includes(metaData.Data.DetectClses[i / 4]),
              isNoReflective: metaData.Data.DetectClses[i / 4] === 1
            }
          )
        }
      }
      if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
        locations.push(
          {
            zone: metaData.DangerZoneBox
          }
        )
      }
      break

    case '8': // 研发二部人员聚集
    case '10005': // 研发二部人员聚集
    case '5': // 抽烟检测
    case '10002': // 吸烟检测
    case '10': // 研发二部烟雾明火
    case '10007':// 研发二部烟雾明火
    case '11':// 研发二部冲压机
    case '16':// 医疗防护服
    case '10013': // 研发二部医疗防护服检测
    case '28': // 人员徘徊检测
    case '10025': // 人员徘徊检测
      if (metaData.Data && metaData.Data.DetectBoxes) {
        const boxes = metaData.Data.DetectBoxes
        for (let i = 0; i < boxes.length; i += 4) {
          locations.push(
            {
              top: boxes[i + 1],
              left: boxes[i],
              width: boxes[i + 2],
              height: boxes[i + 3],
              isWarning: !!metaData.Data.DetectClses[i / 4]
            }
          )
        }
      }
      break

    case '12':// 研发二人体识别
    case '10009': // 研发二人体识别
      if (metaData.Data && metaData.Data.Boxes) {
        const boxes = metaData.Data.Boxes
        const attributes = metaData.Data.Attributes
        for (let i = 0; i < boxes.length; i++) {
          locations.push(
            {
              top: boxes[i].TopLeftY,
              left: boxes[i].TopLeftX,
              width: boxes[i].BottomRightX - boxes[i].TopLeftX,
              height: boxes[i].BottomRightY - boxes[i].TopLeftY,
              attributes: parseBodyAttributes(attributes[i]),
              isWarning: false
            }
          )
        }
      }
      break

    case '13':// 研发二蜜蜂密度
    case '10010': // 研发二蜜蜂密度
      if (metaData.Data && metaData.Data.BeeDensity) {
        locations.push({
          beeDensity: Math.round(metaData.Data.BeeDensity)
        })
      }
      break

    case '14':// 研发二机房设备检测
    case '10011':// 研发二铁塔基站设备检测
    case '15':// 研发二铁塔天线检测
    case '10012': // 研发二铁塔天线检测
      if (metaData.Data && metaData.Data.Boxes) {
        const boxes = metaData.Data.Boxes
        for (let i = 0; i < boxes.length; i++) {
          locations.push(
            {
              top: boxes[i].TopLeftY,
              left: boxes[i].TopLeftX,
              width: boxes[i].BottomRightX - boxes[i].TopLeftX,
              height: boxes[i].BottomRightY - boxes[i].TopLeftY,
              isWarning: true
            }
          )
        }
      }
      break

    case '17': // 研发二车牌识别
    case '10014':// 研发二车牌识别
      if (metaData.Data && metaData.Data.Boxes) {
        locations = metaData.Data.Boxes.map((box: any, index: number) => {
          const xArray = box.map((point: any) => point[0])
          const yArray = box.map((point: any) => point[1])
          const [left, right] = [Math.min.apply(Math, xArray), Math.max.apply(Math, xArray)]
          const [top, bottom] = [Math.min.apply(Math, yArray), Math.max.apply(Math, yArray)]
          return {
            top: top,
            left: left,
            width: right - left,
            height: bottom - top,
            isWarning: true,
            text: metaData.Data.Texts[index]
          }
        })
      }
      if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
        locations.push(
          {
            zone: metaData.DangerZoneBox
          }
        )
      }
      break

      // case '19':// 入侵检测
      // case '10016':// 入侵检测
      //   locations = metaData.Data && metaData.Data.MatchList.map((person: any) => {
      //     return {
      //       top: person.Location.Y,
      //       left: person.Location.X,
      //       width: person.Location.Width,
      //       height: person.Location.Height,
      //       isWarning: person.FaceItems.length > 0 && person.FaceItems[0].Score > 60,
      //       score: person.FaceItems.length > 0 && Math.round(person.FaceItems[0].Score)
      //     }
      //   })
      //   break

    case '20':// 在场人员+口罩检测
    case '10017':// 在场人员+口罩检测
      if (metaData.Data && metaData.Data.FaceRectangles) {
        const boxes = metaData.Data.FaceRectangles
        for (let i = 0; i < boxes.length; i += 4) {
          const type = metaData.Data.ClassList[i / 4]
          locations.push(
            {
              top: boxes[i + 1],
              left: boxes[i],
              width: boxes[i + 2],
              height: boxes[i + 3],
              isWarning: type === 0 || type === 2,
              type
            }
          )
        }
      }
      break

    case '18':// 棉花
    case '10015':// 棉花
    case '22':// 车辆统计
    case '24': // 车辆违停
    case '25': // 车辆拥堵
    case '10019': // 车辆统计
    case '10021': // 车辆违停
    case '10022': // 车辆拥堵
    case '31':// 跌倒
    case '10028':// 跌倒
      if (metaData.Data && metaData.Data.Boxes) {
        const boxes = metaData.Data.Boxes
        for (let i = 0; i < boxes.length; i++) {
          locations.push(
            {
              top: boxes[i].TopLeftY,
              left: boxes[i].TopLeftX,
              width: boxes[i].BottomRightX - boxes[i].TopLeftX,
              height: boxes[i].BottomRightY - boxes[i].TopLeftY,
              isWarning: true
            }
          )
        }
      }
      if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
        locations.push(
          {
            zone: metaData.DangerZoneBox
          }
        )
      }
      // @ts-ignore
      metaData.Data.JamCount && (locations.JamCount = metaData.Data.JamCount) // 车辆拥堵
      // @ts-ignore
      metaData.Data.JamThreshold && (locations.JamThreshold = metaData.Data.JamThreshold) // 车辆拥堵
      break

    case '9':// 危险区域检测
    case '10006': // 危险区域检测
    case '26': // 人群感应检测
    case '27': // 实时在岗检测
    case '10023': // 人群感应检测
    case '10024': // 实时在岗检测
    case '21':// 垃圾检测
    case '23': // 电动车
    case '10018':// 垃圾检测
    case '10020':// 电动车
    case '32':// 人车流量统计
    case '10032':// 人车流量统计
    case '30':// 摄像头遮挡
    case '10027':// 摄像头遮挡
      if (metaData.Data && metaData.Data.DetectBoxes) {
        const boxes = metaData.Data.DetectBoxes
        for (let i = 0; i < boxes.length; i += 4) {
          locations.push(
            {
              top: boxes[i + 1],
              left: boxes[i],
              width: boxes[i + 2],
              height: boxes[i + 3],
              isWarning: metaData.Data.DetectClses ? metaData.Data.DetectClses[i / 4] : false
            }
          )
        }
      }
      if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
        locations.push(
          {
            zone: metaData.DangerZoneBox
          }
        )
      }
      // @ts-ignore
      locations.PersonNum = metaData.Data?.PersonNum // 人群感应
      // @ts-ignore
      locations.IsOffDuty = metaData.Data?.IsOffDuty // 实时在岗检测
      // @ts-ignore
      locations.IsSleepOnDuty = metaData.Data?.IsSleepOnDuty // 实时在岗检测
      break
  }
  return locations
}

// 新ai版本 -- 废弃
// export const parseMetaDataNewAi = (type: string, metaData: any) => {
//   let locations = []
//   switch (type) {
//     // 研发二部人员布控
//     case '10001':
//       locations = metaData.Data && metaData.Data.MatchList.map((person: any) => {
//         try {
//           const name = (person.FaceItems.length > 0 && person.FaceItems[0].Labels.length > 0) ? JSON.parse(person.FaceItems[0].Labels).name : '-'
//           return {
//             top: person.Location.Y,
//             left: person.Location.X,
//             width: person.Location.Width,
//             height: person.Location.Height,
//             isWarning: person.FaceItems.length > 0 && person.FaceItems[0].Score > 60,
//             score: person.FaceItems.length > 0 && Math.round(person.FaceItems[0].Score),
//             name
//           }
//         } catch (error) {
//           console.log(error)
//         }
//       })
//       if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
//         locations.push(
//           {
//             zone: metaData.DangerZoneBox
//           }
//         )
//       }
//       break
//     // 吸烟检测
//     case '10002':
//       if (metaData.Data && metaData.Data.DetectBoxes) {
//         const boxes = metaData.Data.DetectBoxes
//         for (let i = 0; i < boxes.length; i += 4) {
//           locations.push(
//             {
//               top: boxes[i + 1],
//               left: boxes[i],
//               width: boxes[i + 2],
//               height: boxes[i + 3],
//               isWarning: !!metaData.Data.DetectClses[i / 4]
//             }
//           )
//         }
//       }
//       break
//     // 研发二部未带口罩
//     case '10003':
//       if (metaData.Data && metaData.Data.FaceRectangles) {
//         const boxes = metaData.Data.FaceRectangles
//         for (let i = 0; i < boxes.length; i += 4) {
//           const type = metaData.Data.ClassList[i / 4]
//           locations.push(
//             {
//               top: boxes[i + 1],
//               left: boxes[i],
//               width: boxes[i + 2],
//               height: boxes[i + 3],
//               isWarning: type === 0 || type === 2,
//               type
//             }
//           )
//         }
//       }
//       break
//     // 安全帽反光服检测
//     case '10004':
//       if (metaData.Data && metaData.Data.DetectBoxes) {
//         const boxes = metaData.Data.DetectBoxes
//         for (let i = 0; i < boxes.length; i += 4) {
//           locations.push(
//             {
//               top: boxes[i + 1],
//               left: boxes[i],
//               width: boxes[i + 2],
//               height: boxes[i + 3],
//               isWarning: !!~[1, 2].indexOf(metaData.Data.DetectClses[i / 4])
//             }
//           )
//         }
//       }
//       break
//     // 研发二部人员聚集
//     case '10005':
//       if (metaData.Data && metaData.Data.DetectBoxes) {
//         const boxes = metaData.Data.DetectBoxes
//         for (let i = 0; i < boxes.length; i += 4) {
//           locations.push(
//             {
//               top: boxes[i + 1],
//               left: boxes[i],
//               width: boxes[i + 2],
//               height: boxes[i + 3],
//               isWarning: !!metaData.Data.DetectClses[i / 4]
//             }
//           )
//         }
//       }
//       break
//     // 危险区域检测
//     case '10006':
//       if (metaData.Data && metaData.Data.DetectBoxes) {
//         const boxes = metaData.Data.DetectBoxes
//         for (let i = 0; i < boxes.length; i += 4) {
//           locations.push(
//             {
//               top: boxes[i + 1],
//               left: boxes[i],
//               width: boxes[i + 2],
//               height: boxes[i + 3],
//               isWarning: !metaData.Data.DetectClses[i / 4]
//             }
//           )
//         }
//         const zoneBoxes = metaData.DangerZoneBox
//         if (zoneBoxes && zoneBoxes.length) {
//           locations.push(
//             {
//               zone: zoneBoxes
//             }
//           )
//         }
//       }
//       break
//     // 研发二部烟雾明火
//     case '10007':
//       if (metaData.Data && metaData.Data.DetectBoxes) {
//         const boxes = metaData.Data.DetectBoxes
//         for (let i = 0; i < boxes.length; i += 4) {
//           locations.push(
//             {
//               top: boxes[i + 1],
//               left: boxes[i],
//               width: boxes[i + 2],
//               height: boxes[i + 3],
//               isWarning: !!metaData.Data.DetectClses[i / 4]
//             }
//           )
//         }
//       }
//       break

//     case '10013': // 研发二部医疗防护服检测
//     case '10025': // 人员徘徊检测
//       if (metaData.Data && metaData.Data.DetectBoxes) {
//         const boxes = metaData.Data.DetectBoxes
//         for (let i = 0; i < boxes.length; i += 4) {
//           locations.push(
//             {
//               top: boxes[i + 1],
//               left: boxes[i],
//               width: boxes[i + 2],
//               height: boxes[i + 3],
//               isWarning: !!metaData.Data.DetectClses[i / 4]
//             }
//           )
//         }
//       }
//       break
//     // 研发二人体识别
//     case '10009':
//       if (metaData.Data && metaData.Data.Boxes) {
//         const boxes = metaData.Data.Boxes
//         const attributes = metaData.Data.Attributes
//         for (let i = 0; i < boxes.length; i++) {
//           locations.push(
//             {
//               top: boxes[i].TopLeftY,
//               left: boxes[i].TopLeftX,
//               width: boxes[i].BottomRightX - boxes[i].TopLeftX,
//               height: boxes[i].BottomRightY - boxes[i].TopLeftY,
//               attributes: parseBodyAttributes(attributes[i]),
//               isWarning: false
//             }
//           )
//         }
//       }
//       break
//     // 研发二蜜蜂密度
//     case '10010':
//       if (metaData.Data && metaData.Data.BeeDensity) {
//         locations.push({
//           beeDensity: Math.round(metaData.Data.BeeDensity)
//         })
//       }
//       break
//     // 研发二铁塔基站设备检测
//     case '10011':
//       if (metaData.Data && metaData.Data.Boxes) {
//         const boxes = metaData.Data.Boxes
//         for (let i = 0; i < boxes.length; i++) {
//           locations.push(
//             {
//               top: boxes[i].TopLeftY,
//               left: boxes[i].TopLeftX,
//               width: boxes[i].BottomRightX - boxes[i].TopLeftX,
//               height: boxes[i].BottomRightY - boxes[i].TopLeftY,
//               isWarning: true
//             }
//           )
//         }
//       }
//       break
//     // 研发二铁塔天线检测
//     case '10012':
//       if (metaData.Data && metaData.Data.Boxes) {
//         const boxes = metaData.Data.Boxes
//         for (let i = 0; i < boxes.length; i++) {
//           locations.push(
//             {
//               top: boxes[i].TopLeftY,
//               left: boxes[i].TopLeftX,
//               width: boxes[i].BottomRightX - boxes[i].TopLeftX,
//               height: boxes[i].BottomRightY - boxes[i].TopLeftY,
//               isWarning: true
//             }
//           )
//         }
//       }
//       break
//       // 研发二车牌识别
//     case '10014':
//       if (metaData.Data && metaData.Data.Boxes) {
//         locations = metaData.Data.Boxes.map((box: any, index: number) => {
//           const xArray = box.map((point: any) => point[0])
//           const yArray = box.map((point: any) => point[1])
//           const [left, right] = [Math.min.apply(Math, xArray), Math.max.apply(Math, xArray)]
//           const [top, bottom] = [Math.min.apply(Math, yArray), Math.max.apply(Math, yArray)]
//           return {
//             top: top,
//             left: left,
//             width: right - left,
//             height: bottom - top,
//             isWarning: true,
//             text: metaData.Data.Texts[index]
//           }
//         })
//       }
//       if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
//         locations.push(
//           {
//             zone: metaData.DangerZoneBox
//           }
//         )
//       }
//       break
//     // 棉花
//     case '10015':
//       if (metaData.Data && metaData.Data.Boxes) {
//         const boxes = metaData.Data.Boxes
//         for (let i = 0; i < boxes.length; i++) {
//           locations.push(
//             {
//               top: boxes[i].TopLeftY,
//               left: boxes[i].TopLeftX,
//               width: boxes[i].BottomRightX - boxes[i].TopLeftX,
//               height: boxes[i].BottomRightY - boxes[i].TopLeftY,
//               isWarning: true
//             }
//           )
//         }
//         const zoneBoxes = metaData.DangerZoneBox
//         if (zoneBoxes && zoneBoxes.length) {
//           locations.push(
//             {
//               zone: zoneBoxes
//             }
//           )
//         }
//       }
//       break
//       // 入侵检测
//     case '10016':
//       locations = metaData.Data && metaData.Data.MatchList.map((person: any) => {
//         return {
//           top: person.Location.Y,
//           left: person.Location.X,
//           width: person.Location.Width,
//           height: person.Location.Height,
//           isWarning: true,
//           score: person.FaceItems.length > 0 && Math.round(person.FaceItems[0].Score)
//         }
//       })
//       break
//     // 在场人员+口罩检测
//     case '10017':
//       if (metaData.Data && metaData.Data.FaceRectangles) {
//         const boxes = metaData.Data.FaceRectangles
//         for (let i = 0; i < boxes.length; i += 4) {
//           const type = metaData.Data.ClassList[i / 4]
//           locations.push(
//             {
//               top: boxes[i + 1],
//               left: boxes[i],
//               width: boxes[i + 2],
//               height: boxes[i + 3],
//               isWarning: type === 0 || type === 2,
//               type
//             }
//           )
//         }
//       }
//       break
//     case '10018':// 垃圾检测
//     case '10020':// 电动车
//       if (metaData.Data && metaData.Data.DetectBoxes) {
//         const boxes = metaData.Data.DetectBoxes
//         for (let i = 0; i < boxes.length; i += 4) {
//           locations.push(
//             {
//               top: boxes[i + 1],
//               left: boxes[i],
//               width: boxes[i + 2],
//               height: boxes[i + 3],
//               isWarning: !!metaData.Data.DetectClses[i / 4]
//             }
//           )
//         }
//         if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
//           locations.push(
//             {
//               zone: metaData.DangerZoneBox
//             }
//           )
//         }
//       }
//       break

//     case '10019': // 车辆统计
//     case '10021': // 车辆违停
//     case '10022': // 车辆拥堵
//       if (metaData.Data && metaData.Data.Boxes) {
//         const boxes = metaData.Data.Boxes
//         for (let i = 0; i < boxes.length; i++) {
//           locations.push(
//             {
//               top: boxes[i].TopLeftY,
//               left: boxes[i].TopLeftX,
//               width: boxes[i].BottomRightX - boxes[i].TopLeftX,
//               height: boxes[i].BottomRightY - boxes[i].TopLeftY,
//               isWarning: metaData.Data.DetectClses ? metaData.Data.DetectClses[i / 4] : false
//             }
//           )
//         }
//       }
//       if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
//         locations.push(
//           {
//             zone: metaData.DangerZoneBox
//           }
//         )
//       }
//       // @ts-ignore
//       metaData.Data.JamCount && (locations.JamCount = metaData.Data.JamCount)
//       // @ts-ignore
//       metaData.Data.JamThreshold && (locations.JamThreshold = metaData.Data.JamThreshold)
//       break

//     case '10023': // 人群感应检测
//     case '10024': // 实时在岗检测
//       if (metaData.Data && metaData.Data.DetectBoxes) {
//         const boxes = metaData.Data.DetectBoxes
//         for (let i = 0; i < boxes.length; i += 4) {
//           locations.push(
//             {
//               top: boxes[i + 1],
//               left: boxes[i],
//               width: boxes[i + 2],
//               height: boxes[i + 3],
//               isWarning: metaData.Data.DetectClses ? metaData.Data.DetectClses[i / 4] : false
//             }
//           )
//         }
//       }
//       if (metaData.DangerZoneBox && metaData.DangerZoneBox.length) {
//         locations.push(
//           {
//             zone: metaData.DangerZoneBox
//           }
//         )
//       }
//       // @ts-ignore
//       locations.PersonNum = metaData.Data?.PersonNum// 人群感应
//       // @ts-ignore
//       locations.IsOffDuty = metaData.Data?.IsOffDuty// 实时在岗
//       // @ts-ignore
//       locations.IsSleepOnDuty = metaData.Data?.IsSleepOnDuty// 实时在岗
//       break
//   }
//   return locations
// }

/**
 * 将坐标转为百分比，危险区域转成svg polygon
 */
export const transformLocation = (locations: any, img: any) => {
  locations && locations.forEach((location: any) => {
    location.imgNaturalWidth = img.naturalWidth
    location.imgNaturalHeight = img.naturalHeight
    if (location.zone) {
      let zoneSvg = ''
      const zoneBoxes = location.zone.map((point: number, index: number) => {
        if (index % 2) {
          return point * img.naturalHeight / 100
        } else {
          return point * img.naturalWidth / 100
        }
      })
      for (let i = 0; i < zoneBoxes.length; i += 2) {
        const sub = zoneBoxes.slice(i, i + 2)
        zoneSvg += (sub.join(',') + ' ')
      }
      location.zoneSvg = zoneSvg
    } else {
      const ratio = img.clientWidth / img.naturalWidth
      location.clientTopPercent = location.top * ratio / img.clientHeight * 100
      location.clientLeftPercent = location.left * ratio / img.clientWidth * 100
      location.clientWidthPercent = location.width * ratio / img.clientWidth * 100
      location.clientHeightPercent = location.height * ratio / img.clientHeight * 100
    }
  })
  return locations
}
/**
 * AI应用中使用的
 */
export const transformLocationAi = (locations: any, img: any) => {
  locations && locations.forEach((location: any) => {
    location.imgNaturalWidth = img?.naturalWidth
    location.imgNaturalHeight = img?.naturalHeight
    if (location.zone) {
      let zoneSvg = ''
      const zoneBoxes = location.zone.map((point: number, index: number) => {
        if (index % 2) {
          return point * img.naturalHeight / 100
        } else {
          return point * img.naturalWidth / 100
        }
      })
      for (let i = 0; i < zoneBoxes.length; i += 2) {
        const sub = zoneBoxes.slice(i, i + 2)
        zoneSvg += (sub.join(',') + ' ')
      }
      location.zoneSvg = zoneSvg
    } else {
      const ratioW = img.clientWidth / img.naturalWidth
      const ratioH = img.clientHeight / img.naturalHeight
      location.clientTopPercent = location.top * ratioH / img.clientHeight * 100
      location.clientLeftPercent = location.left * ratioW / img.clientWidth * 100
      location.clientWidthPercent = location.width * ratioW / img.clientWidth * 100
      location.clientHeightPercent = location.height * ratioH / img.clientHeight * 100
      if (location.clientTopPercent + location.clientHeightPercent >= 100) {
        location.clientHeightPercent = 100 - location.clientTopPercent
      }
      if (location.clientWidthPercent + location.clientLeftPercent >= 100) {
        location.clientWidthPercent = 100 - location.clientLeftPercent
      }
    }
  })
  return locations
}

const parseBodyAttributes = (attributes: any) => {
  const attributesArray = []
  for (const key in attributes) {
    attributesArray.push({
      key: key.toLocaleLowerCase(),
      value: attributes[key].Name
    })
  }
  return attributesArray
}
