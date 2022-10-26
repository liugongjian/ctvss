export interface Location {
  top: number
  left: number
  width: number
  height: number
  isWarning: boolean
  isNoReflective?: boolean
  type?: number,
  attributes?: Attribute[]
}

export interface Attribute {
  key: string
  value: string
}
