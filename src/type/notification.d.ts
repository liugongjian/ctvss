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
  id?: string;
  name: string;
  description?: string;
  source: string;
  sourceRules: string[];
  notifyChannel: string;
  notifyTemplate: string;
  effectiveTime: string;
  notifyFreq: string;
  notifyResources: string[];
  notifyDestinations: string[];
  active: number;
}
