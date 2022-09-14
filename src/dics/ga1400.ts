// import { parseISO, lightFormat } from 'date-fns'
// 返回该信息是否展示
export const isShow = function(val, key) {
  // 对返回1970的日期进行处理
  if (typeof val === 'string' && val.startsWith('1970-')) {
    return false
  }
  if (['leftTopX', 'leftTopY', 'rightBtmX', 'rightBtmY'].includes(key)) {
    return true
  }
  if (!val) {
    return false
  }

  return true
}

const formatTime = function(strTime) {
  return strTime
}

const isOrNot = function(n) {
  return n > 1 ? '不确定' : (n > 0 ? '是' : '否')
}

const gender = function(g) {
  return genderTypes[g]
}

const hairStyle = function(h) {
  return hairStyleTypes[h]
}

// const source = function(s) {
//   return sourceTypes[s]
// }

const color = function(c) {
  return colorTypes[c]
}

const gesture = function(g) {
  return gestureTypes[g]
}

const personStatus = function(p) {
  return personStatusType[p]
}

const habitual = function(h) {
  return habitualActionType[h]
}

const behavior = function(b) {
  return behaviorType[b]
}

const appendage = function(a) {
  return appendageType[a]
}

const hat = function(h) {
  return hatStyleType[h]
}

const glass = function(g) {
  return glassesStyleType[g]
}

const bag = function(b) {
  return bagStyleType[b]
}

const coat = function(c) {
  return coatStyleType[c]
}

const coatLength = function(c) {
  return coatLengthType[c]
}

const pantLength = function(p) {
  return pantsStyleType[p]
}

const infoKindType = function(i) {
  return infoKindTypes[i]
}

export const Filters = {
  PeopleInfos: {
    personID: '人员标识',
    infoKind: infoKindType,
    locationMarkTime: formatTime,
    personAppearTime: formatTime,
    personDisAppearTime: formatTime,
    iDType: '证件种类',
    iDNumber: '证件号',
    name: '姓名',
    usedName: '曾用名',
    alias: '绰号',
    genderCode: gender,
    ageUpLimit: '年龄上限',
    ageLowerLimit: '年龄下限',
    ethicCode: '民族代码',
    nationalityCode: '国籍代码',
    nativeCityCode: '籍贯省市县代码',
    residenceAdminDivision: '居住地行政区划',
    chineseAccentCode: '汉语口音代码',
    personOrg: '单位名称',
    jobCategory: '职业类别代码',
    accompanyNumber: '同行人数',
    heightUpLimit: '身高上限',
    heightLowerLimit: '身高下限',
    bodyType: '体型',
    skinColor: color,
    hairStyle: hairStyle,
    hairColor: color,
    gesture: gesture,
    status: personStatus,
    faceStyle: '脸型',
    facialFeature: '脸部特征',
    physicalFeature: '体貌特征',
    bodyFeature: '体表特征',
    habitualMovement: habitual,
    behavior: behavior,
    behaviorDescription: '行为描述',
    appendant: appendage,
    appendantDescription: '附属物描述',
    umbrellaColor: color,
    respiratorColor: color,
    capStyle: hat,
    capColor: color,
    glassStyle: glass,
    glassColor: color,
    scarfColor: color,
    bagStyle: bag,
    bagColor: color,
    coatStyle: coat,
    coatLength: coatLength,
    coatColor: color,
    trousersStyle: pantLength,
    trousersColor: color,
    trousersLen: '裤子长度',
    shoesStyle: '鞋子款式',
    shoesColor: color,
    isDriver: isOrNot,
    isForeigner: isOrNot,
    passportType: '护照证件种类',
    immigrantTypeCode: '出入境人员类别代码',
    isSuspectedTerrorist: isOrNot,
    suspectedTerroristNumber: '涉恐人员编号',
    isCriminalInvolved: isOrNot,
    criminalInvolvedSpecilisationCode: '涉案人员专长代码',
    bodySpeciallMark: '体表特殊标记',
    crimeMethod: '作案手段',
    crimeCharacterCode: '作案特点代码',
    escapedCriminalNumber: '在逃人员编号',
    isDetainees: isOrNot,
    detentionHouseCode: '看守所编码',
    detaineesIdentity: '在押人员身份',
    detaineesSpecialIdentity: '在押人员特殊身份',
    memberTypeCode: '成员类型代码',
    isVictim: isOrNot,
    victimType: '被害人种类',
    injuredDegree: '受伤害程度',
    corpseConditionCode: '尸体状况代码',
    isSuspiciousPerson: isOrNot
  },
  FaceInfos: {
    faceID: '人脸标识',
    infoKind: infoKindType,
    sourceID: '来源标识',
    deviceID: '设备编码',
    leftTopX: '左上角 X 坐标',
    leftTopY: '左上角 Y 坐标',
    rightBtmX: '右下角 X 坐标',
    rightBtmY: '右下角 Y 坐标',
    locationMarkTime: formatTime,
    faceAppearTime: formatTime,
    faceDisAppearTime: formatTime,
    iDType: '证件种类',
    iDNumber: '证件号码',
    name: '姓名',
    usedName: '曾用名',
    alias: '绰号',
    genderCode: gender,
    ageUpLimit: '年龄上限',
    ageLowerLimit: '年龄下限',
    ethicCode: '民族代码',
    nationalityCode: '国籍代码',
    nativeCityCode: '籍贯省市县代码',
    residenceAdminDivision: '居住地行政区划',
    chineseAccentCode: '汉语口音代码',
    jobCategory: '职业类别代码',
    accompanyNumber: '同行人脸数',
    skinColor: color,
    hairStyle: hairStyle,
    hairColor: color,
    faceStyle: '脸型',
    facialFeature: '脸部特征',
    physicalFeature: '体貌特征',
    respiratorColor: color,
    capStyle: hat,
    capColor: color,
    glassStyle: glass,
    glassColor: color,
    isDriver: isOrNot,
    isForeigner: isOrNot,
    passportType: '护照证件种类',
    immigrantTypeCode: '出入境人员类别代码',
    isSuspectedTerrorist: isOrNot,
    suspectedTerroristNumber: '涉恐人员编号',
    isCriminalInvolved: isOrNot,
    criminalInvolvedSpecilisationCode: '涉案人员专长代码',
    bodySpeciallMark: '体表特殊标记',
    crimeMethod: '作案手段',
    crimeCharacterCode: '作案特点代码',
    escapedCriminalNumber: '在逃人员编号',
    isDetainees: isOrNot,
    detentionHouseCode: '看守所编码',
    detaineesIdentity: '在押人员身份',
    detaineesSpecialIdentity: '在押人员特殊身份',
    memberTypeCode: '成员类型代码',
    isVictim: isOrNot,
    victimType: '被害人种类',
    injuredDegree: '受伤害程度',
    corpseConditionCode: '尸体状况代码',
    isSuspiciousPerson: isOrNot,
    attitude: '姿态分布',
    similaritydegree: '相似度',
    eyebrowStyle: '眉型',
    noseStyle: '鼻型',
    mustacheStyle: '胡型',
    lipStyle: '嘴唇',
    wrinklePouch: '皱纹眼袋',
    acneStain: '痤疮色斑',
    freckleBirthmark: '黑痣胎记',
    scarDimple: '疤痕酒窝',
    otherFeature: '其他特点'
  },
  MotorInfos: {
    motorVehicleID: '车辆标识',
    infoKind: infoKindType,
    sourceID: '来源标识',
    tollgateID: '关联卡口编号',
    deviceID: '设备编码',
    storageUrl1: '近景照片',
    storageUrl2: '车牌照片',
    storageUrl3: '远景照片',
    storageUrl4: '合成图',
    storageUrl5: '缩略图',
    leftTopX: '左上角X坐标',
    leftTopY: '左上角Y坐标',
    rightBtmX: '右下角X坐标',
    rightBtmY: '右下角Y坐标',
    markTime: formatTime,
    appearTime: formatTime,
    disappearTime: formatTime,
    laneNo: '车道号',
    hasPlate: '有无车牌',
    plateClass: '号牌种类',
    plateColor: color,
    plateNo: '车牌号',
    plateNoAttach: '挂车牌号',
    plateDescribe: '车牌描述',
    isDecked: isOrNot,
    isAltered: isOrNot,
    isCovered: isOrNot,
    speed: '行驶速',
    direction: '行驶方向',
    drivingStatusCode: '行驶状态代码',
    usingPropertiesCode: '车辆使用性质代码',
    vehicleClass: '车辆类型',
    vehicleBrand: '车辆品牌',
    vehicleModel: '车辆型号',
    vehicleStyles: '车辆年款',
    vehicleLength: '车辆长度',
    vehicleWidth: '车辆宽度',
    vehicleHeight: '车辆高度',
    vehicleColor: color,
    vehicleColorDepth: '颜色深浅',
    vehicleHood: '车前盖',
    vehicleTrunk: '车后盖',
    vehicleWheel: '车轮',
    wheelPrintedPattern: '车轮印花纹',
    vehicleWindow: '车窗',
    vehicleRoof: '车顶',
    vehicleDoor: '车门',
    sideOfVehicle: '车侧',
    carOfVehicle: '车厢',
    rearviewMirror: '后视镜',
    vehicleChassis: '底盘',
    vehicleShielding: '遮挡',
    filmColor: color,
    isModified: isOrNot,
    hitMarkInfo: '撞痕信息',
    vehicleBodyDesc: '车身描述',
    vehicleFrontItem: '车前部物品',
    descOfFrontItem: '车前部物品描述',
    vehicleRearItem: '车后部物品',
    descOfRearItem: '车后部物品描述',
    numOfPassenger: '车内人数',
    passTime: formatTime,
    nameOfPassedRoad: '经过道路名称',
    isSuspicious: isOrNot,
    sunvisor: '遮阳板状态',
    safetyBelt: '安全带状态',
    calling: '打电话状态',
    plateReliability: '号牌识别可信度',
    plateCharReliability: '每位号牌号码可信度',
    brandReliability: '品牌标志识别可信度'
  },
  NonMotorInfos: {
    nonMotorVehicleID: '车辆标识',
    infoKind: infoKindType,
    sourceID: '来源标识',
    deviceID: '设备编码',
    leftTopX: '左上角X坐标',
    leftTopY: '左上角Y坐标',
    rightBtmX: '右下角X坐标',
    rightBtmY: '右下角Y坐标',
    markTime: formatTime,
    appearTime: formatTime,
    disappearTime: formatTime,
    hasPlate: '有无车牌',
    plateClass: '号牌种类',
    plateColor: color,
    plateNo: '车牌号',
    plateNoAttach: '挂车牌号',
    plateDescribe: '车牌描述',
    isDecked: isOrNot,
    isAltered: isOrNot,
    isCovered: isOrNot,
    speed: '行驶速度',
    drivingStatusCode: '行驶状态代',
    usingPropertiesCode: '车辆使用性质代码',
    vehicleBrand: '车辆品牌',
    VehicleType: '车辆款型',
    vehicleLength: '车辆长度',
    vehicleWidth: '车辆宽度',
    vehicleHeight: '车辆高度',
    vehicleColor: color,
    vehicleHood: '车前盖',
    vehicleTrunk: '车后盖',
    vehicleWheel: '车轮',
    vheelPrintedPattern: '车轮印花纹',
    vehicleWindow: '车窗',
    vehicleRoof: '车顶',
    vehicleDoor: '车门',
    sideOfVehicle: '车侧',
    carOfVehicle: '车厢',
    rearviewMirror: '后视镜',
    vehicleChassis: '底盘',
    vehicleShielding: '遮挡',
    filmColor: color,
    isModified: isOrNot
  }

}

// 人员标识
export const PeopleInfos = {
  personID: '人员标识',
  infoKind: '信息分类',
  sourceID: '来源标识',
  deviceID: '设备编码',
  leftTopX: '左上角X坐标',
  leftTopY: '左上角Y坐标',
  rightBtmX: '右下角X坐标',
  rightBtmY: '右下角Y坐标',
  locationMarkTime: '位置标记时间',
  personAppearTime: '人员出现时间',
  personDisAppearTime: '人员消失时间',
  iDType: '证件种类',
  iDNumber: '证件号',
  name: '姓名',
  usedName: '曾用名',
  alias: '绰号',
  genderCode: '性别',
  ageUpLimit: '年龄上限',
  ageLowerLimit: '年龄下限',
  ethicCode: '民族代码',
  nationalityCode: '国籍代码',
  nativeCityCode: '籍贯省市县代码',
  residenceAdminDivision: '居住地行政区划',
  chineseAccentCode: '汉语口音代码',
  personOrg: '单位名称',
  jobCategory: '职业类别代码',
  accompanyNumber: '同行人数',
  heightUpLimit: '身高上限',
  heightLowerLimit: '身高下限',
  bodyType: '体型',
  skinColor: '肤色',
  hairStyle: '发型',
  hairColor: '发色',
  gesture: '姿态',
  status: '状态',
  faceStyle: '脸型',
  facialFeature: '脸部特征',
  physicalFeature: '体貌特征',
  bodyFeature: '体表特征',
  habitualMovement: '习惯动作',
  behavior: '行为',
  behaviorDescription: '行为描述',
  appendant: '附属物',
  appendantDescription: '附属物描述',
  umbrellaColor: '伞颜色',
  respiratorColor: '口罩颜色',
  capStyle: '帽子款式',
  capColor: '帽子颜色',
  glassStyle: '眼镜款式',
  glassColor: '眼镜颜色',
  scarfColor: '围巾颜色',
  bagStyle: '包款式',
  bagColor: '包颜色',
  coatStyle: '上衣款式',
  coatLength: '上衣长',
  coatColor: '上衣颜色',
  trousersStyle: '裤子款式',
  trousersColor: '裤子颜色',
  trousersLen: '裤子长度',
  shoesStyle: '鞋子款式',
  shoesColor: '鞋子颜色',
  isDriver: '是否驾驶员',
  isForeigner: '是否涉外人员',
  passportType: '护照证件种类',
  immigrantTypeCode: '出入境人员类别代码',
  isSuspectedTerrorist: '是否涉恐人员',
  suspectedTerroristNumber: '涉恐人员编号',
  isCriminalInvolved: '是否涉案人员',
  criminalInvolvedSpecilisationCode: '涉案人员专长代码',
  bodySpeciallMark: '体表特殊标记',
  crimeMethod: '作案手段',
  crimeCharacterCode: '作案特点代码',
  escapedCriminalNumber: '在逃人员编号',
  isDetainees: '是否在押人员',
  detentionHouseCode: '看守所编码',
  detaineesIdentity: '在押人员身份',
  detaineesSpecialIdentity: '在押人员特殊身份',
  memberTypeCode: '成员类型代码',
  isVictim: '是否被害人',
  victimType: '被害人种类',
  injuredDegree: '受伤害程度',
  corpseConditionCode: '尸体状况代码',
  isSuspiciousPerson: '是否可疑人'
}

export const FaceInfos = {
  faceID: '人脸标识',
  infoKind: '信息分类',
  sourceID: '来源标识',
  deviceID: '设备编码',
  leftTopX: '左上角 X 坐标',
  leftTopY: '左上角 Y 坐标',
  rightBtmX: '右下角 X 坐标',
  rightBtmY: '右下角 Y 坐标',
  locationMarkTime: '位置标记时间',
  faceAppearTime: '人脸出现时间',
  faceDisAppearTime: '人脸消失时间',
  iDType: '证件种类',
  iDNumber: '证件号码',
  name: '姓名',
  usedName: '曾用名',
  alias: '绰号',
  genderCode: '性别',
  ageUpLimit: '年龄上限',
  ageLowerLimit: '年龄下限',
  ethicCode: '民族代码',
  nationalityCode: '国籍代码',
  nativeCityCode: '籍贯省市县代码',
  residenceAdminDivision: '居住地行政区划',
  chineseAccentCode: '汉语口音代码',
  jobCategory: '职业类别代码',
  accompanyNumber: '同行人脸数',
  skinColor: '肤色',
  hairStyle: '发型',
  hairColor: '发色',
  faceStyle: '脸型',
  facialFeature: '脸部特征',
  physicalFeature: '体貌特征',
  respiratorColor: '口罩颜色',
  capStyle: '帽子款式',
  capColor: '帽子颜色',
  glassStyle: '眼镜款式',
  glassColor: '眼镜颜色',
  isDriver: '是否驾驶员',
  isForeigner: '是否涉外人员',
  passportType: '护照证件种类',
  immigrantTypeCode: '出入境人员类别代码',
  isSuspectedTerrorist: '是否涉恐人员',
  suspectedTerroristNumber: '涉恐人员编号',
  isCriminalInvolved: '是否涉案人员',
  criminalInvolvedSpecilisationCode: '涉案人员专长代码',
  bodySpeciallMark: '体表特殊标记',
  crimeMethod: '作案手段',
  crimeCharacterCode: '作案特点代码',
  escapedCriminalNumber: '在逃人员编号',
  isDetainees: '是否在押人员',
  detentionHouseCode: '看守所编码',
  detaineesIdentity: '在押人员身份',
  detaineesSpecialIdentity: '在押人员特殊身份',
  memberTypeCode: '成员类型代码',
  isVictim: '是否被害人',
  victimType: '被害人种类',
  injuredDegree: '受伤害程度',
  corpseConditionCode: '尸体状况代码',
  isSuspiciousPerson: '是否可疑人',
  attitude: '姿态分布',
  similaritydegree: '相似度',
  eyebrowStyle: '眉型',
  noseStyle: '鼻型',
  mustacheStyle: '胡型',
  lipStyle: '嘴唇',
  wrinklePouch: '皱纹眼袋',
  acneStain: '痤疮色斑',
  freckleBirthmark: '黑痣胎记',
  scarDimple: '疤痕酒窝',
  otherFeature: '其他特点'
}

export const MotorInfos = {
  motorVehicleID: '车辆标识',
  infoKind: '信息分类',
  sourceID: '来源标识',
  tollgateID: '关联卡口编号',
  deviceID: '设备编码',
  storageUrl1: '近景照片',
  storageUrl2: '车牌照片',
  storageUrl3: '远景照片',
  storageUrl4: '合成图',
  storageUrl5: '缩略图',
  leftTopX: '左上角X坐标',
  leftTopY: '左上角Y坐标',
  rightBtmX: '右下角X坐标',
  rightBtmY: '右下角Y坐标',
  markTime: '位置标记时间',
  appearTime: '车辆出现时间',
  disappearTime: '车辆消失时间',
  laneNo: '车道号',
  hasPlate: '有无车牌',
  plateClass: '号牌种类',
  plateColor: '车牌颜色',
  plateNo: '车牌号',
  plateNoAttach: '挂车牌号',
  plateDescribe: '车牌描述',
  isDecked: '是否套牌',
  isAltered: '是否涂改',
  isCovered: '是否遮挡',
  speed: '行驶速',
  direction: '行驶方向',
  drivingStatusCode: '行驶状态代码',
  usingPropertiesCode: '车辆使用性质代码',
  vehicleClass: '车辆类型',
  vehicleBrand: '车辆品牌',
  vehicleModel: '车辆型号',
  vehicleStyles: '车辆年款',
  vehicleLength: '车辆长度',
  vehicleWidth: '车辆宽度',
  vehicleHeight: '车辆高度',
  vehicleColor: '车身颜色',
  vehicleColorDepth: '颜色深浅',
  vehicleHood: '车前盖',
  vehicleTrunk: '车后盖',
  vehicleWheel: '车轮',
  wheelPrintedPattern: '车轮印花纹',
  vehicleWindow: '车窗',
  vehicleRoof: '车顶',
  vehicleDoor: '车门',
  sideOfVehicle: '车侧',
  carOfVehicle: '车厢',
  rearviewMirror: '后视镜',
  vehicleChassis: '底盘',
  vehicleShielding: '遮挡',
  filmColor: '贴膜颜色',
  isModified: '改装标志',
  hitMarkInfo: '撞痕信息',
  vehicleBodyDesc: '车身描述',
  vehicleFrontItem: '车前部物品',
  descOfFrontItem: '车前部物品描述',
  vehicleRearItem: '车后部物品',
  descOfRearItem: '车后部物品描述',
  numOfPassenger: '车内人数',
  passTime: '经过时刻',
  nameOfPassedRoad: '经过道路名称',
  isSuspicious: '是否可疑车',
  sunvisor: '遮阳板状态',
  safetyBelt: '安全带状态',
  calling: '打电话状态',
  plateReliability: '号牌识别可信度',
  plateCharReliability: '每位号牌号码可信度',
  brandReliability: '品牌标志识别可信度'

}

export const NonMotorInfos = {
  nonMotorVehicleID: '车辆标识',
  infoKind: '信息分类',
  sourceID: '来源标识',
  deviceID: '设备编码',
  leftTopX: '左上角X坐标',
  leftTopY: '左上角Y坐标',
  rightBtmX: '右下角X坐标',
  rightBtmY: '右下角Y坐标',
  markTime: '位置标记时间',
  appearTime: '车辆出现时间',
  disappearTime: '车辆消失时间',
  hasPlate: '有无车牌',
  plateClass: '号牌种类',
  plateColor: '车牌颜色',
  plateNo: '车牌号',
  plateNoAttach: '挂车牌号',
  plateDescribe: '车牌描述',
  isDecked: '是否套牌',
  isAltered: '是否涂改',
  isCovered: '是否遮挡',
  speed: '行驶速度',
  drivingStatusCode: '行驶状态代',
  usingPropertiesCode: '车辆使用性质代码',
  vehicleBrand: '车辆品牌',
  VehicleType: '车辆款型',
  vehicleLength: '车辆长度',
  vehicleWidth: '车辆宽度',
  vehicleHeight: '车辆高度',
  vehicleColor: '车身颜色',
  vehicleHood: '车前盖',
  vehicleTrunk: '车后盖',
  vehicleWheel: '车轮',
  vheelPrintedPattern: '车轮印花纹',
  vehicleWindow: '车窗',
  vehicleRoof: '车顶',
  vehicleDoor: '车门',
  sideOfVehicle: '车侧',
  carOfVehicle: '车厢',
  rearviewMirror: '后视镜',
  vehicleChassis: '底盘',
  vehicleShielding: '遮挡',
  filmColor: '贴膜颜色',
  isModified: '改装标志'
}

const infoKindTypes = {
  '0': '其他',
  '1': '自动采集',
  '2': '人工采集'
}

const sourceTypes = {
  '1': '政府机关监控',
  '2': '社会面治安监控',
  '3': '交通监控（含轨道交通监控）',
  '4': '出入境监控',
  '5': '港口监控',
  '6': '金融系统监控',
  '7': '旅馆监控',
  '8': '互联网营业场所监控',
  '9': '娱乐服务场所监控',
  '10': '其他企业/事业单位监控',
  '11': '居民自建监控',
  '12': '公安内部',
  '13': '监所',
  '14': '讯问室',
  '15': '车（船、直升机等）载终端拍摄',
  '16': '移动执法',
  '17': '手机、平板电脑拍摄',
  '18': 'DV拍摄',
  '19': '相机拍摄',
  '20': '网络获取',
  '21': '声像资料片',
  '99': '其他'
}

const colorTypes = {
  '1': '黑',
  '2': '白',
  '3': '灰',
  '4': '红',
  '5': '蓝',
  '6': '黄',
  '7': '橙',
  '8': '棕',
  '9': '绿',
  '10': '紫',
  '11': '青',
  '12': '粉',
  '13': '透明',
  '99': '其他'
}

const hairStyleTypes = {
  '1': '平头',
  '2': '中分',
  '3': '偏分',
  '4': '额秃',
  '5': '项秃',
  '6': '全秃',
  '7': '卷发',
  '8': '波浪发',
  '9': '麻花辫',
  '10': '盘发',
  '11': '披肩',
  '99': '其他'
}

const genderTypes = {
  '0': '未知的性别',
  '1': '男性',
  '2': '女性',
  '9': '未说明的性别'
}

const gestureTypes = {
  '1': '站',
  '2': '蹲',
  '3': '卧',
  '4': '躺',
  '5': '坐',
  '6': '行走',
  '7': '奔跑',
  '8': '跳跃',
  '9': '攀登',
  '10': '匍匐',
  '99': '其他'
}

const personStatusType = {
  '1': '醉酒',
  '2': '亢奋',
  '3': '正常',
  '99': '其他'
}

const habitualActionType = {
  '1': '翻眼',
  '2': '眨眼',
  '3': '皱眉',
  '4': '挑眉',
  '5': '推镜',
  '6': '抓头',
  '7': '挖鼻',
  '8': '摸下巴',
  '9': '打手势',
  '10': '左撇子',
  '11': '缩颈',
  '12': '走路摇摆',
  '13': '外八字',
  '14': '内八字',
  '15': '面肌抽搐',
  '16': '说话歪嘴',
  '17': '摆头',
  '18': '手抖',
  '99': '其他'
}

const behaviorType = {
  '1': '尾随',
  '2': '徘徊',
  '3': '取款',
  '4': '打架',
  '5': '开车',
  '6': '打手机',
  '99': '其他'
}

const appendageType = {
  '1': '手机',
  '2': '伞',
  '3': '口罩',
  '4': '手表',
  '5': '头盔',
  '6': '眼镜',
  '7': '帽子',
  '8': '包',
  '9': '围巾',
  '99': '其他'
}

const hatStyleType = {
  '1': '毛线帽',
  '2': '贝雷帽',
  '3': '棒球帽',
  '4': '平项帽',
  '5': '渔夫帽',
  '6': '套头帽',
  '7': '鸭舌帽',
  '8': '大檐帽',
  '99': '其他'
}

const glassesStyleType = {
  '1': '全框',
  '2': '半框',
  '3': '无框',
  '4': '眉线框',
  '5': '多功能框',
  '6': '变色镜',
  '7': '太阳镜',
  '8': '无镜片',
  '9': '透明色',
  '99': '其他'
}

const bagStyleType = {
  '1': '单肩包',
  '2': '手提包',
  '3': '双肩包',
  '4': '钱包',
  '5': '手拿包',
  '6': '腰包',
  '7': '钥匙包',
  '8': '卡包',
  '9': '手拉箱',
  '10': '旅行包',
  '11': '牛仔包',
  '12': '斜挎包',
  '99': '其他'
}

const coatStyleType = {
  '1': '西装',
  '2': '民族服',
  '3': 'T恤',
  '4': '衬衫',
  '5': '卫衣',
  '6': '夹克',
  '7': '皮夹克',
  '8': '大衣',
  '9': '风衣',
  '10': '毛衣',
  '11': '棉衣',
  '12': '羽绒服',
  '13': '运动服',
  '14': '工作服',
  '15': '牛仔服',
  '16': '睡衣',
  '17': '连衣裙',
  '18': '无上衣',
  '99': '其他'
}

const coatLengthType = {
  '1': '长袖',
  '2': '短袖',
  '3': '无袖'
}

const pantsStyleType = {
  '1': '牛仔裤',
  '2': '西裤',
  '3': '工装裤',
  '4': '皮裤',
  '5': '沙滩裤',
  '6': '运动裤',
  '7': '睡裤',
  '8': '无裤子',
  '99': '其他'
}
