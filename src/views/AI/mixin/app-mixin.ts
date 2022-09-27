import { Component, Vue, Prop } from 'vue-property-decorator'
import { startOrStopApps, deleteApps } from '@/api/ai-app'
import { checkPermission } from '@/utils/permission'

@Component
export default class AppMixin extends Vue {
  @Prop() public prod!: any
  public checkPermission = checkPermission
  public alarms: any = []
  public period: any = {
    periodType: '今天',
    period: [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)]
  }
  public msOfADay = 864 * 100000

  public form: any = {
    algorithmMetadata: {
      trashRecycleType: [],
      helmetReflectiveType: [],
      animalDetectType: ['Bear']
    },
    beeNumber: 1
  }

  public effectiveTime: any = []
  public alertDisabled = false
  public interval = {
    alertPeriod: 's',
    alertSilencePeriod: 's'
  }

  /**
   * 刷新数据
   */
  public refresh() {}

  /**
   * 删除回调
   */
  public onDeleteApp() {}
  /**
   * 更新能力回调
   */
  public getAbilityList() {}

  /**
   * 查看详情
   */
  public appDetail(app: any, tabNum: any) {
    this.$router.push({
      name: 'AIAppDetail',
      query: {
        appid: app.id,
        tabNum
      }
    })
  }

  /**
   * 编辑
   */
  public editApp(app) {
    this.$router.push({
      name: 'AIEditApp',
      query: {
        id: app.id
      }
    })
  }

  /**
   * 删除应用
   */
  public deleteApp(app) {
    this.$alertDelete({
      type: '应用',
      msg: `删除操作不能恢复，确认删除AI应用"${app.name}"吗？`,
      method: deleteApps,
      payload: { id: [app.id] },
      onSuccess: () => {
        this.onDeleteApp()
        this.getAbilityList()
      }
    })
  }

  /**
   * 启动/停用设备
   */
  public async startOrStopApp(app, startOrStop) {
    try {
      const params: any = {
        id: [app.id],
        startOrStop
      }
      await startOrStopApps(params)
      const method = startOrStop ? '启用' : '停用'
      this.$message.success(`已通知${method}AI应用`)
      this.refresh()
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  /**
   * 返回应用列表
   */
  public cancel() {
    if (this.$route.path.endsWith('ibox/')) {
      this.$emit('back')
    } else {
      this.backToAppList()
    }
  }

  public backToAppList() {
    this.$router.push({
      name: 'AIAppList'
    })
  }

  /**
   * 得到N天前的时间戳
   */
  public getDateBefore(dayCount) {
    let dd = new Date()
    dd.setDate(dd.getDate() - dayCount)
    let time = dd.setHours(0, 0, 0)
    return time
  }

  public getAlarms() {}

  /**
   * 告警搜索时间
   */
  public handleChange() {
    this.getAlarms()
  }

  public generateAlgoParam() {
    this.generateEffectiveTime()
    let algorithmMetadata = this.form.algorithmMetadata
    if (algorithmMetadata) {
      Object.keys(algorithmMetadata).forEach(key => algorithmMetadata[key] === '' && delete algorithmMetadata[key])
    }
    if (this.form.algorithm?.code === '10003' || this.prod?.code === '10003') {
      algorithmMetadata.faceRatio = '0.7'
    }
    let param = {
      ...this.form,
      effectiveTime: this.effectiveTime,
      callbackKey: this.form.validateType === '无验证' ? '' : this.form.callbackKey,
      algorithmMetadata: algorithmMetadata ? JSON.stringify(algorithmMetadata) : '',
      confidence: this.form.confidence / 100,
      alertTriggerThreshold: this.alertDisabled ? this.form.alertTriggerThreshold : '0',
      alertPeriod: this.alertDisabled ? (this.interval.alertPeriod === 's' ? this.form.alertPeriod : this.interval.alertPeriod === 'm' ? +this.form.alertPeriod * 60 : +this.form.alertPeriod * 60 * 60).toString() : '0',
      alertSilencePeriod: this.alertDisabled ? (this.interval.alertSilencePeriod === 's' ? this.form.alertSilencePeriod : this.interval.alertSilencePeriod === 'm' ? +this.form.alertSilencePeriod * 60 : +this.form.alertSilencePeriod * 60 * 60).toString() : '0'
    }

    // 蜜蜂数量特殊处理
    if (this.form.algorithm?.code === '10010' || this.prod?.code === '10010') {
      param.confidence = this.form.beeNumber
    }
    return param
  }

  public generateEffectiveTime() {
    if (this.form.effectPeriod === '全天') {
      this.effectiveTime = [{ start_time: '00:00:00', end_time: '23:59:59' }]
    } else {
      this.effectiveTime = this.form.availableperiod.map(element => {
        return {
          start_time: element.period[0],
          end_time: element.period[1]
        }
      })
    }
    this.effectiveTime = JSON.stringify(this.effectiveTime)
  }
}
