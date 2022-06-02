import { UserModule } from '@/store/modules/user'

export const getStyle = () => {
  let styleUrl = 'amap://styles/8c65d7b363c7c535a46140225aab21ce'
  if (UserModule.tags.customMapStyle === '1') {
    // customMapStyle = 1 对重庆公租房用户设定指定的地图风格。
    // 城市环线：显示
    // 三级路面：#F1AF5E
    // 四级路面：#EFDB8C
    // 其余道路均设置为“不显示”
    styleUrl = 'amap://styles/a43b0fb67742c83e2fad7da99d6aa888'
  }
  return styleUrl
}
