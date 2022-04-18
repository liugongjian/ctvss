
export const getRule = (msg) => {
  let rule = []
  if (msg === '应用名称') {
    rule.push({ min: 1, max: 10, message: '名称需在 1 到 10 个字符之间', trigger: 'blur' })
  } else if (msg === '人员数量阈值' || msg === '车辆数量阈值' ||
             msg === '临停时间' || msg === '拥堵车辆阈值' ||
             msg === '人员数量阈值' || msg === '脱岗超时时间' ||
             msg === '睡岗超时时间' || msg === '临停时间' ||
             msg === '拥堵车辆阈值' || msg === '徘徊时间') {
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
    if (msg === '人员数量阈值') {
      rule.push({
        validator: (rule, value, callback) => {
          if (parseInt(value) > 100) {
            callback(new Error('需小于100'))
          } else if (parseInt(value) === 0) {
            callback(new Error('请输入合理的整数'))
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
            callback(new Error('需大于等于0的整数'))
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
