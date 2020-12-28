import { AlertType } from '@/dics'

export const renderAlertType = (node: any) => {
  if (node.type === 'ipc') {
    // 口罩识别
    const aiList1 = ['743488346910621696']
    if (~aiList1.indexOf(node.id)) {
      return `(${AlertType[1]})`
    }
    // 口罩识别
    const aiList2 = ['743488382117609472']
    if (~aiList2.indexOf(node.id)) {
      return `(${AlertType[2]})`
    }
    // 口罩识别
    const aiList3 = ['29941957555913602']
    if (~aiList3.indexOf(node.id)) {
      return `(${AlertType[3]})`
    }
  }
}
