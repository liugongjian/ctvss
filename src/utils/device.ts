import { AlertType } from '@/dics'

export const renderAlertType = (node: any) => {
  let resultStr = ''
  if (node.type === 'ipc') {
    // 口罩识别
    const aiList1 = ['85528303785607251']
    if (~aiList1.indexOf(node.id)) {
      resultStr += (resultStr ? `&${AlertType[6]}` : `${AlertType[6]}`)
    }
    // 人员聚集
    const aiList2 = ['85528303785607264', '85528303785607265', '85528295195672581', '85528303785607240', '85528303785607235', '85528303785607236', '85528303785607239']
    if (~aiList2.indexOf(node.id)) {
      resultStr += (resultStr ? `&${AlertType[8]}` : `${AlertType[8]}`)
    }
    // 人员布控
    const aiList3 = ['85528303785607259']
    if (~aiList3.indexOf(node.id)) {
      resultStr += (resultStr ? `&${AlertType[4]}` : `${AlertType[4]}`)
    }
    // 吸烟检测
    const aiList5 = ['85528295195672640', '85528295195672684', '85528295195672656', '85528295195672676', '85528303785607251', '85528303785607259', '85528303785607265', '85528303785607264']
    if (~aiList5.indexOf(node.id)) {
      resultStr += (resultStr ? `&${AlertType[5]}` : `${AlertType[5]}`)
    }
    return resultStr ? '(' + resultStr + ')' : ''
  }
}

/**
 * 获取目录设备数统计信息
 */
export const getSums = (data: any) => {
  if (~['nvr', 'dir', 'platform', 'platformDir'].indexOf(data.type)) {
    return ` (${data.onlineSize}/${data.totalSize})`
  } else {
    return ''
  }
}

/**
 * 获取自定义设备数统计信息
 */
export const getTotalOfTree = (data: any) => {
  if (~['nvr', 'dir', 'platform', 'platformDir', 'top-group'].indexOf(data.type)) {
    return ` (${data.onlineSize}/${data.totalSize})`
  } else {
    return ''
  }
}

/**
 * 设置目录树设备流状态
 */
export const setDirsStreamStatus = (dirs: any) => {
  return dirs.map((dir: any) => {
    if (!dir.streamStatus && dir.deviceStreams && dir.deviceStreams.length > 0) {
      const hasOnline = dir.deviceStreams.some((stream: any) => {
        return stream.streamStatus === 'on'
      })
      if (hasOnline) {
        dir.streamStatus = 'on'
      }
    }
    return dir
  })
}
