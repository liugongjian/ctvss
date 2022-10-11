import { UserModule } from '@/store/modules/user'

export const getStyle = () => {
  let styleUrl = 'amap://styles/9736ab8b519f0619320c24679dd3c75e'
  if (UserModule.tags.customMapStyle === '1') {
    // customMapStyle = 1 对重庆公租房用户设定指定的地图风格。
    // 城市环线：显示
    // 三级路面：#F1AF5E
    // 四级路面：#EFDB8C
    // 其余道路均设置为“不显示”
    styleUrl = 'amap://styles/34a37eb08952c648a88765bbc887e979'
  }
  return styleUrl
}
