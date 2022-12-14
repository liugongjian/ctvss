<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card v-loading="isloading">
      <el-form ref="form" class="form" :rules="rules" :model="form" label-width="120px">
        <!-- <el-form-item v-if="isUpdate" label="策略ID：" prop="id">
          <el-input v-model="form.id" class="form__input" :disabled="isUpdate" />
        </el-form-item> -->
        <el-form-item label="策略名：" prop="name">
          <el-input v-model="form.name" class="form__input" placeholder="请填写策略名称" />
          <div class="form-tip">2-32位，可包含大小写字母、数字、中文、中划线、空格。</div>
        </el-form-item>
        <el-form-item label="描述：" prop="description">
          <el-input
            v-model="form.description"
            class="form__input"
            type="textarea"
            rows="4"
          />
        </el-form-item>
        <el-form-item label="推送方式：" prop="notifyChannel">
          <el-radio-group v-model="form.notifyChannel" disabled>
            <el-radio label="1">邮件推送</el-radio>
            <el-radio label="2">
              短信推送
              <el-popover
                placement="top-start"
                width="400"
                trigger="hover"
                :open-delay="300"
                content="使用推送对象的邮箱和手机信息"
              >
                <svg-icon slot="reference" class="form-question" name="help" />
              </el-popover>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="推送时段：" prop="effectiveTime">
          <el-radio-group v-model="form.effectiveTimeType">
            <el-radio label="all">全天</el-radio>
            <el-radio label="range">时间段</el-radio>
          </el-radio-group>
          <el-table
            v-if="form.effectiveTimeType === 'range'"
            ref="timeTable"
            class="time-table"
            :data="effectiveTimeList"
            empty-text="请选择生效时间段"
            max-height="400"
          >
            <el-table-column key="effectiveTime" prop="effectiveTime" width="380">
              <template slot="header">
                <span>生效时间段 </span>
                <!-- <el-tooltip
                  content="添加"
                  placement="right"
                >
                  <el-button type="text" @click="addEffectiveTime()">
                    <svg-icon name="plus" width="15" height="15" />
                  </el-button>
                </el-tooltip> -->
              </template>
              <template slot-scope="{row}">
                <el-time-picker
                  v-model="row.effectiveTime"
                  is-range
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围"
                  format="HH:mm"
                  @change="transformFormData"
                />
              </template>
            </el-table-column>
            <!-- <el-table-column label="操作" prop="action" class-name="col-action" width="110" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" @click="removeEffectiveTime(scope.$index)">移除</el-button>
              </template>
            </el-table-column> -->
          </el-table>
        </el-form-item>
        <el-form-item label="推送频率：" prop="notifyFreq">
          <el-select v-model="form.notifyFreq">
            <el-option
              v-for="(item, index) in notifyFreqOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消息类型：" prop="source">
          <el-radio-group v-model="form.source" @change="handleSourceChange">
            <el-radio label="1">设备消息</el-radio>
            <!-- <el-radio label="2">资源包消息</el-radio> -->
            <el-radio label="3">AI消息</el-radio>
            <el-radio label="4">平台事件消息</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.source !== '2'" label="子类型：" class="source-rules">
          <el-form-item prop="sourceRules" :class="{'source-rules__name': showSourceRuleValue}">
            <el-select :key="form.source" v-model="form.sourceRules" :multiple="form.source !== '4'">
              <el-option
                v-for="item in sourceRulesOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="showSourceRuleValue" prop="sourceRulesValue" class="source-rules__value">
            <el-input v-model="form.sourceRulesValue" />
            <el-popover
              placement="right"
              width="400"
              trigger="hover"
              :open-delay="300"
              content=""
            >
              <div>
                触发事件的阈值<br>请输入1-100整数<br>
              </div>
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </el-form-item>
        </el-form-item>
        <el-form-item label="消息内容：" prop="notifyTemplate">
          <el-input
            v-model="form.notifyTemplate"
            class="form__input"
            type="textarea"
            rows="4"
            disabled
          />
        </el-form-item>
        <el-form-item v-if="form.source !== '2'" label="生效资源：" prop="notifyResources">
          <resource-tree
            v-if="isloading === false"
            :checked-list="form.notifyResources"
            @resourceListChange="resourceListChange"
          />
        </el-form-item>
        <el-form-item label="推送对象：" prop="notifyDestinations">
          <destinations-tree
            v-if="isloading === false"
            :checked-list="form.notifyDestinations"
            @destinationListChange="destinationListChange"
          />
        </el-form-item>
        <el-form-item label="立即生效：" prop="active">
          <el-switch
            v-model="form.active"
            active-color="#FA8334"
            inactive-color="#C1C1C1"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item>
          <el-row style="margin: 20px 0;">
            <el-button :loading="uploadLoading" type="primary" class="confirm" @click="upload">确定</el-button>
            <el-button :loading="uploadLoading" @click="back">取消</el-button>
          </el-row>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getNotificationPolicyInfo, createNotificationPolicy, editNotificationPolicy } from '@/api/notification'
import { getAlgorithmList } from '@/api/ai-app'
import { INotifictionPolicyForm } from '@/type/Notification'
import { MESSAGE_TYPE } from '@/type/enum'
import { dateFormat } from '@/utils/date'
import ResourceTree from './components/ResourceTree.vue'
import DestinationsTree from './components/DestinationsTree.vue'
import { pick } from 'lodash'

@Component({
  name: 'notification-policy-create-or-update',
  components: {
    ResourceTree,
    DestinationsTree
  }
})
export default class extends Vue {
  private breadCrumbContent = ''
  private defaultValue = [new Date(2022, 4, 5, 0, 0), new Date(2022, 4, 5, 23, 59)]
  private dirList: any = []
  public isloading: boolean | null = null
  public uploadLoading: boolean = false
  private treeProp = {
    label: 'label',
    children: 'children',
    isLeaf: 'isLeaf'
  }
  private form: INotifictionPolicyForm = {
    /* 接口字段 */
    id: '',
    name: '',
    description: '',
    notifyChannel: '2',
    effectiveTime: [],
    notifyFreq: '240',
    source: MESSAGE_TYPE.DEVICE_MSG,
    sourceRules: [],
    sourceRulesValue: '',
    // eslint-disable-next-line no-template-curly-in-string
    notifyTemplate: '',
    notifyResources: [],
    notifyDestinations: [],
    active: 1,
    /* 辅助字段 */
    effectiveTimeType: 'all',
    policyName: '',
    desc: ''
  }

  private effectiveTimeList: any[] = [{ effectiveTime: [new Date(2022, 4, 5, 0, 0), new Date(2022, 4, 5, 23, 59)] }]

  private notifyFreqOptions = [
    { value: '30', label: '半小时' },
    { value: '60', label: '1小时' },
    { value: '120', label: '2小时' },
    { value: '240', label: '4小时' },
    { value: '480', label: '8小时' },
    { value: '1440', label: '24小时' }
  ]

  private aiSourceRulesOptions = []
  private deviceSourceRulesOptions = [
    { value: '1', label: '设备离线' },
    { value: '2', label: '流离线' },
    { value: '3', label: '录制失败' }
  ]
  private platformSourceRulesOptions = [
    { value: '1', label: '设备离线', needConfig: true }
  ]

  private notifyTemplate = {
    // eslint-disable-next-line no-template-curly-in-string
    ai: '【天翼云CDN+】尊敬的${userName}：根据推送策略[${policyName}]，最近${notify_freq}内，天翼云瞰共检测到AI告警${count}条，请及时处理。详情请登录平台查看。感谢您对天翼云视频监控的支持。',
    // eslint-disable-next-line no-template-curly-in-string
    device: '【天翼云CDN+】尊敬的${userName}：根据推送策略[${policyName}]，最近${notify_freq}内，天翼云瞰共检测到${主类型}-${子类型}告警${count}条，请及时处理。详情请登录平台查看。感谢您对天翼云视频监控的支持。',
    // eslint-disable-next-line no-template-curly-in-string
    platform: '【天翼云CDN+】尊敬的用户：根据推送策略[${policyName}]，最近${notify_freq}内，天翼云瞰检测到${主类型}-${子类型}事件[值:${value}]，请及时处理。详情请登录平台查看。感谢您对天翼云视频监控的支持。'
  }

  private rules = {
    name: [
      { required: true, message: '请填写策略名', trigger: 'blur' },
      { validator: this.validatePolicyName, trigger: 'blur' }
    ],
    notifyChannel: [
      { required: true, message: '请选择推送方式', trigger: 'blur' }
    ],
    effectiveTime: [
      { required: true, message: '请选择推送时间段', trigger: 'blur' },
      { validator: this.validateEffectiveTime, trigger: 'blur' }
    ],
    notifyFreq: [
      { required: true, message: '请选择推送频率', trigger: 'blur' }
    ],
    source: [
      { required: true, message: '请选择消息类型', trigger: 'blur' }
    ],
    sourceRules: [
      { required: true, message: '请选择子类型', trigger: 'blur' }
    ],
    sourceRulesValue: [
      { required: true, message: '阈值不能为空', trigger: 'blur' },
      { validator: this.validateResourceRuleValue, trigger: 'blur' }
    ],
    notifyTemplate: [
      { required: true, message: '请选择消息内容', trigger: 'blur' }
    ],
    notifyResources: [
      { required: true, message: '请选择生效资源', trigger: 'blur' },
      { validator: this.validateResourceList, trigger: 'blur' }
    ],
    notifyDestinations: [
      { required: true, message: '请选择推送对象', trigger: 'blur' },
      { validator: this.validateResourceList, trigger: 'blur' }
    ]
  }

  private validatePolicyName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-\s]{2,32}$/.test(value)) {
      callback(new Error('策略名称格式错误。2-32位，可包含大小写字母、数字、中文、中划线、空格。'))
    } else {
      callback()
    }
  }

  private validateResourceRuleValue(rule: any, value: string, callback: Function) {
    if (!/^[1-9]\d?$/.test(value)) {
      callback(new Error('阈值必须在1-100之间'))
    } else {
      callback()
    }
  }

  private validateResourceList(rule: any, value: string, callback: Function) {
    if (!this.form.notifyResources.length) {
      callback(new Error('资源列表不能为空！'))
    } else {
      callback()
    }
  }

  private validateEffectiveTime(rule: any, value: any, callback: Function) {
    if (value[0].start_time === value[0].end_time) {
      callback(new Error('起止时间不能相同！'))
    } else {
      callback()
    }
  }

  private get sourceRulesOptions() {
    switch (this.form.source) {
      case MESSAGE_TYPE.DEVICE_MSG:
        return this.deviceSourceRulesOptions
      case MESSAGE_TYPE.AI_MSG:
        return this.aiSourceRulesOptions
      case MESSAGE_TYPE.PLATFORM_MSG:
        return this.platformSourceRulesOptions
      default:
        return []
    }
  }

  private get showSourceRuleValue() {
    const options = this.sourceRulesOptions
    if (this.form.source === MESSAGE_TYPE.PLATFORM_MSG) {
      const selectedRule = options.find((option: any) => option.value === this.form.sourceRules[0])
      return selectedRule && selectedRule.needConfig
    }
    return false
  }

  private get isUpdate() {
    return this.$route.name === 'NotificationPolicyEdit'
  }

  private handleSourceChange(newValue: MESSAGE_TYPE) {
    this.form.sourceRules = []
    switch (newValue) {
      case MESSAGE_TYPE.DEVICE_MSG:
        this.form.notifyTemplate = this.notifyTemplate.device
        break
      case MESSAGE_TYPE.AI_MSG:
        this.form.notifyTemplate = this.notifyTemplate.ai
        break
      case MESSAGE_TYPE.PLATFORM_MSG:
        this.form.notifyTemplate = this.notifyTemplate.platform
        break
    }
  }

  private async mounted() {
    this.isloading = true
    this.breadCrumbContent = this.$route.meta.title
    await this.getAlgorithmList()
    if (this.isUpdate) {
      const id = this.$route.query.id
      if (id) {
        this.$set(this.form, 'id', id)
        await this.initNotificationPolicy()
      } else {
        this.back()
      }
    } else {
      this.handleSourceChange(this.form.source)
    }
    this.isloading = false
  }

  /**
   * 初始化策略信息
   */
  private async initNotificationPolicy() {
    try {
      const info = await getNotificationPolicyInfo({ id: this.form.id })
      Object.assign(this.form, pick(info, ['name', 'description', 'notifyChannel', 'notifyFreq', 'source', 'notifyTemplate', 'active']))
      const sourceRules = JSON.parse(info.sourceRules)
      console.log('sourceRules: ', sourceRules)
      if (sourceRules[0].includes('_')) {
        const splitArr = sourceRules[0].split('_')
        // 平台事件消息的子类型只能单选
        this.form.sourceRules = splitArr[0]
        this.form.sourceRulesValue = splitArr[1]
      } else {
        this.form.sourceRules = sourceRules
      }
      console.log('this.form.sourceRules: ', this.form.sourceRules)
      console.log('this.form.sourceRulesValue: ', this.form.sourceRulesValue)
      this.form.notifyResources = JSON.parse(info.notifyResources)
      this.form.notifyDestinations = JSON.parse(info.notifyDestinations)
      this.form.effectiveTime = JSON.parse(info.effectiveTime)
      this.parseEffectiveTime(this.form.effectiveTime)
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  /**
   * 获取算法列表
   */
  private parseEffectiveTime(effectiveTime) {
    this.form.effectiveTime = []
    if (effectiveTime[0].start_time === '00:00:00' && effectiveTime[0].end_time === '23:59:00') {
      this.form.effectiveTimeType = 'all'
    } else {
      this.form.effectiveTimeType = 'range'
      this.effectiveTimeList = effectiveTime.map(item => {
        let start = new Date()
        let end = new Date()
        start.setHours(item.start_time.split(':')[0])
        start.setMinutes(item.start_time.split(':')[1])
        start.setSeconds(item.start_time.split(':')[2])
        end.setHours(item.end_time.split(':')[0])
        end.setMinutes(item.end_time.split(':')[1])
        end.setSeconds(item.end_time.split(':')[2])
        return { effectiveTime: [start, end] }
      })
    }
    this.transformFormData()
  }

  /**
   * 获取算法列表
   */
  private async getAlgorithmList() {
    try {
      const { aiAbilityAlgorithms } = await getAlgorithmList({ name: this.searchApp, abilityId: this.activeName })
      this.aiSourceRulesOptions = aiAbilityAlgorithms.map(item => {
        return {
          value: item.id,
          label: item.name
        }
      })
    } catch (e) {
      this.$alertError(e && e.message)
    }
  }

  /**
   * 上传配置
   */
  private upload() {
    this.transformFormData()
    const form: any = this.$refs.form
    form.validate(async(valid: boolean) => {
      try {
        if (valid) {
          this.uploadLoading = true
          let params: any = {}
          Object.assign(params, pick(this.form, ['name', 'description', 'notifyChannel', 'notifyFreq', 'source', 'notifyTemplate', 'active']))
          params.effectiveTime = JSON.stringify(this.form.effectiveTime)
          params.sourceRules = Array.isArray(this.form.sourceRules) ? JSON.stringify(this.form.sourceRules) : JSON.stringify([this.form.sourceRules + '_' + this.form.sourceRulesValue])
          params.notifyResources = JSON.stringify(this.form.notifyResources)
          params.notifyDestinations = JSON.stringify(this.form.notifyDestinations)
          if (this.isUpdate) {
            params.id = this.form.id
            await editNotificationPolicy(params)
          } else {
            await createNotificationPolicy(params)
          }
          this.$message.success(`${this.isUpdate ? '编辑策略成功！' : '创建策略成功！'}`)
          this.back()
        } else {
          return false
        }
      } catch (e) {
        this.$message.error(e && e.message)
      } finally {
        this.uploadLoading = false
      }
    })
  }

  /**
   * 转换form相关字段
   */
  private transformFormData() {
    // 获取effectiveTime
    if (this.form.effectiveTimeType === 'all') {
      this.form.effectiveTime = [{
        start_time: '00:00:00',
        end_time: '23:59:00'
      }]
    } else {
      let timeList = this.effectiveTimeList.filter(item => {
        return item.effectiveTime && item.effectiveTime[0] && item.effectiveTime[1]
      })
      this.form.effectiveTime = timeList.map(item => {
        return {
          start_time: dateFormat(item.effectiveTime[0]).split(' ')[1],
          end_time: dateFormat(item.effectiveTime[1]).split(' ')[1]
        }
      })
    }
  }

  private resourceListChange(resourceList) {
    this.form.notifyResources = resourceList
  }

  private destinationListChange(destinationList) {
    this.form.notifyDestinations = destinationList
  }

  private back() {
    // this.$router.push(`/accessManage/policy`)
    this.$router.go(-1)
  }

  /* 时间段选择相关 */

  /**
   * 添加时间段条目
   */
  addEffectiveTime() {
    this.effectiveTimeList.push({
      effectiveTime: [{ effectiveTime: [new Date(2022, 4, 5, 0), new Date(2022, 4, 5, 23)] }]
    })
  }

  /**
   * 移除时间段条目
   * @param index 条目索引
   */
  removeEffectiveTime(index: any) {
    this.effectiveTimeList.splice(index, 1)
  }
}
</script>

<style lang="scss" scoped>
  .form {
    margin-left: 10px;

    &__input {
      width: 600px;
    }

    ::v-deep .source-rules {
      .el-form-item__content {
        display: flex;

        .source-rules__name {
          width: 450px;
        }

        .source-rules__value {
          padding-left: 5px;
          width: 150px;
        }
      }
    }

    .el-select {
      width: 600px;
    }

    .el-select.source-rules-with-value {
      width: 450px;
    }
  }

  .policy {
    display: flex;
  }

  .time-table {
    width: 600px;
  }
</style>
