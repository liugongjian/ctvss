/**
 * 资源包
 */
type Resource = {
  resourceIds: number[],
  aIApps?: AIApp[],
  aiApps?: AIApp[]
}

/**
 * AI应用
 */
type AIApp = {
  aIAppId: string
  aIType: string
}

export {
  Resource,
  AIApp
}
