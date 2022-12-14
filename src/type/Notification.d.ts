import { MESSAGE_TYPE } from '@/type/enum'

export interface INotifictionPolicy {
  id?: string;
  name?: string;
  description?: string;
  source?: string;
  sourceLabel?: string;
  sourceRules?: string;
  sourceRulesLabel?: string;
  notifyChannel?: string;
  notifyChannelLabel?: string;
  notifyTemplate?: string;
  effectiveTime?: string;
  effectiveTimeLabel?: string;
  notifyFreq?: string;
  notifyFreqLabel?: string;
  notifyResources?: string;
  notifyDestinations?: string;
  active?: number;
  createTime?: string;
  updateTime?: string;
}

export interface INotifictionPolicyForm {
  id?: string
  name: string
  description?: string
  notifyChannel: string
  effectiveTime: any[]
  notifyFreq: string
  source: MESSAGE_TYPE
  sourceRules: string[],
  sourceRulesValue?: string,
  notifyTemplate: string
  notifyResources: string[]
  notifyDestinations: string[]
  active: number
  effectiveTimeType: 'all' | 'range'
  resourceList?: any
  policyName?: string
  desc?: string
}
