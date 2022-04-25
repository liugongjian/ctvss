export const getRule = (msg) => {
  let rule = []
  if (msg === '应用名称') {
    rule.push({ min: 1, max: 10, message: '名称需在 1 到 10 个字符之间', trigger: 'blur' })
  } else if (['人员数量阈值', '车辆数量阈值',
    '临停时间', '拥堵车辆阈值', '人员数量阈值',
    '脱岗超时时间', '睡岗超时时间', '临停时间',
    '拥堵车辆阈值', '视野遮挡阈值', '徘徊时间'].includes(msg)) {
    rule.push({ required: true, message: '不能为空', trigger: 'blur' })
    rule.push({
      validator: (rule, value, callback) => {
        if (/^(?:[0-9]\d*)$/.test(value) === false) {
          callback(new Error('请输入合理的整数'))
        } else {
          callback()
        }
      },
      trigger: 'blur' })
    if (msg === '人员数量阈值' || msg === '视野遮挡阈值') {
      rule.push({
        validator: (rule, value, callback) => {
          if (parseInt(value) > 100) {
            callback(new Error('需小于100'))
          } else if (parseInt(value) === 0) {
            callback(new Error('请输入大于等于1的整数'))
          } else {
            callback()
          }
        },
        trigger: 'blur' })
    } else if (msg === '脱岗超时时间' || msg === '睡岗超时时间') {
      rule.push({
        validator: (rule, value, callback) => {
          if (parseInt(value) > 600) {
            callback(new Error('需小于600'))
          } else if (parseInt(value) === 0) {
            callback(new Error('请输入大于等于1的整数'))
          } else {
            callback()
          }
        },
        trigger: 'blur' })
    }
  } else if (msg === '起始时间') {
    rule.push({
      validator: (rule, value, callback) => {
        value[0] === value[1] ? callback(new Error('起始时间不能相同')) : callback()
      },
      trigger: 'blur' })
  }
  rule.push({ required: true, trigger: 'blur', message: '请输入' + msg })
  return rule
}

export const formRule = {
  name: getRule('应用名称'),
  analyseType: getRule('分析类型'),
  effectPeriod: getRule('生效时段'),
  'algorithmMetadata.FaceDbName': getRule('人脸库'),
  'algorithmMetadata.pedThreshold': getRule('人员数量阈值'),
  confidence: getRule('置信度'),
  callbackKey: getRule('回调key'),
  'algorithmMetadata.crowdThreShold': getRule('人员数量阈值'),
  'algorithmMetadata.offDutyThreShold': getRule('脱岗超时时间'),
  'algorithmMetadata.sleepOnDutyThreShold': getRule('睡岗超时时间'),
  'algorithmMetadata.pvTime': getRule('临停时间'),
  'algorithmMetadata.jamThreshold': getRule('拥堵车辆阈值'),
  'algorithmMetadata.timeSlide': getRule('时间窗口'),
  'algorithmMetadata.vehiclesThreshold': getRule('车辆数量阈值'),
  'algorithmMetadata.lingerInterval': getRule('徘徊时间'),
  'algorithmMetadata.areaThreshold': getRule('视野遮挡阈值'),
  'algorithmMetadata.trashRecycleType': getRule('细分检测项'),
  period: getRule('起始时间')
}

export const formTips = {
  offDutyThreShold: '不能超过600分钟',
  sleepOnDutyThreShold: '不能超过600分钟',
  pvTime: '超过临停时间阈值车辆未行驶离开拍摄区域即被定义违停，默认时间为10分钟，只可以输入整数',
  jamThreshold: '通过拍摄区域的车辆低于“拥堵车辆阈值”即视为拥堵'
}
