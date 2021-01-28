import { AlertType } from '@/dics'

export const renderAlertType = (node: any) => {
  if (node.type === 'ipc') {
    // 口罩识别
    const aiList1 = ['85528303785607251']
    if (~aiList1.indexOf(node.id)) {
      return `(${AlertType[1]})`
    }
    // 人员聚集
    const aiList2 = ['85528303785607264', '85528303785607265', '85528295195672581', '85528303785607240', '85528303785607235', '85528303785607236', '85528303785607239']
    if (~aiList2.indexOf(node.id)) {
      return `(${AlertType[2]})`
    }
    // 人员布控
    const aiList3 = ['85528303785607259']
    if (~aiList3.indexOf(node.id)) {
      return `(${AlertType[3]})`
    }
  }
}
