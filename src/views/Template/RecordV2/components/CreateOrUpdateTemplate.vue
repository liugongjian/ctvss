<template>
  <div v-loading="submitting" class="app-container">
    <el-page-header :content="createOrUpdateFlag ? '新建录制模板' : '编辑录制模板'" @back="back" />
    <div class="body">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="160px"
      >
        <el-form-item label="录制模板名称:" prop="templateName" class="form-with-tip">
          <el-input v-model="form.templateName" :disabled="!createOrUpdateFlag" style="width: 463px;" placeholder="请输入模板名称" />
          <div v-if="createOrUpdateFlag" class="form-tip">4-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。模板名称不能重复。</div>
        </el-form-item>
        <el-form-item label="录制类别:" prop="recordType">
          <el-radio-group v-model="form.recordType">
            <el-radio :label="1">全天录制</el-radio>
            <el-radio :label="2">循环定时录制</el-radio>
            <el-radio :label="3">指定时间录制</el-radio>
            <el-radio :label="5">手动录制</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="form.recordType==2"
        >
          <el-table class="loop-time" border :show-header='false' :cell-class-name="cellClassName" :data="customRecordList" style="min-width: 782px; width: 782px; font-size: 12px;">
            <el-table-column width="60" prop="weekday" />
            <el-table-column width="60" />
            <el-table-column width="60" />
            <el-table-column width="60" />
            <el-table-column width="60" />
            <el-table-column width="60" />
            <el-table-column width="60" />
            <el-table-column width="60" />
            <el-table-column width="60" />
            <el-table-column width="60" />
            <el-table-column width="60" />
            <el-table-column width="60" />
            <el-table-column width="60" />
          </el-table>
          <!-- 遮罩层1 拖选事件  （星期 --- 时间段） -->
          <!-- <div class="time-mask" :class="'row' + '-' + (i + 1)" :style="{'top': i * 44 + 'px'}" v-for="weekday, i in weekdays" :key="i"> -->
          <div class="time-mask" :class="'row-' + (i + 1)" :style="{'top': i * 44 + 'px', 'display': dragMaskStyle.display}" v-for="weekday, i in weekdays" :key="i">
            <span v-for="duration, index in weekday" :key="index" class="duration-default" :class="'row-'+(i+1)+'-col-'+index" :style="duration.durationStyle">
              <span v-show="(i+1)===currentDragRow && index==currentDragCol" class="stick" />
              <span v-show="(i+1)===currentDragRow && index==currentDragCol" class="stick" />
            </span>
          </div>
          <!-- 遮罩层2 点击事件 -->
          <!-- 是否触发了点击层，应该在 mouse down 和 mouse up 的时候一起判断以区分拖拽和点击 -->
          <div class="time-mask-click" :class="'row-' + (i + 1) + '-click'" :style="{'top': i * 44 + 'px', 'display': clickMaskStyle.display}" v-for="weekday, i in weekdays" :key="i+0.1" @click="clickDuration">
            <span v-for="duration, index in weekday" :key="index+0.2" class="duration-click" :class="'row-'+(i+1)+'-col-'+index+'-click'" :style="duration.durationStyle">
              <span v-show="(i+1)===currentClickRow && index===currentClickCol" class="stick-left" />
              <span v-show="(i+1)===currentClickRow && index===currentClickCol" class="stick-right" />
            </span>
          </div>
          <!-- duration上方操作栏与遮罩层2绑定出现 -->
          <div class="operation-mask" v-if="showOpt" :style="optStyle">
            <el-time-picker 
              is-range
              v-model="durationTime"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择时间范围"
              value-format="timestamp"
              :editable="false"
              format="HH:mm"
              :editable="false"
              :picker-options="pickerOptions"
              @change="timepickerChange"
            />
            <el-popover
              placement="bottom"
              trigger="click"
              width="180"
              popper-class="popover-cus"
              @show="checkedDayCopy"
            >
              <el-checkbox-group
                v-model="checkedDays"
                class="checkboxs"
              >
                <el-checkbox
                  v-for="day in week"
                  :key="day.value"
                  :label="day.value"
                  :disabled="day.disabled"
                  class="boxline"
                >
                  {{ day.label }}
                </el-checkbox>
              </el-checkbox-group>
              <div class="select-footer">
                <el-button class="select-btn" type="text" @click="selectClick">确定</el-button>
                <el-button class="select-btn" type="text" @click="selectClean">重置</el-button>
              </div>
              <el-button slot="reference">复制到</el-button>
            </el-popover>
            <!-- <el-select ref="selector" v-model="copyDay" multiple collapse-tags placeholder="复制到" @visible-change="addButton">
              <el-option 
                v-for="day in week"
                :key="day.value"
                :label="day.label"
                :value="day.value"
                :disabled="day.disabled"
                class="opt-select"
              />
            </el-select> -->
            <el-button @click="deleteLoop"><svg-icon name="delete" /></el-button>
          </div>
        </el-form-item>
        <el-form-item
          v-if="form.recordType==3">
          <div
            v-for="datePicker, index in customDates"
            :key="index"
            class="custom-picker"
          >
            <el-date-picker
              v-model="datePicker.startTime"
              type="datetime"
              placeholder="选择时间"
              value-format="timestamp"
              format="yyyy-MM-dd HH:mm"
              :picker-options="customPickerOptionsStart(index, customDates)"
              @change="(time) => customTimepickerChangeStart(time, index)"
            >
            </el-date-picker>
            -
            <el-date-picker
              v-model="datePicker.endTime"
              type="datetime"
              placeholder="选择时间"
              value-format="timestamp"
              format="yyyy-MM-dd HH:mm"
              :picker-options="customPickerOptionsEnd(index, customDates)"
              @change="(time) => customTimepickerChangeEnd(time, index)"
            >
            </el-date-picker>
            <el-button style="margin-left: 30px;" v-if="index!==0" @click="delCusCheck(index)"><svg-icon name="delete" /></el-button>
          </div>
          <div v-if="showCusTips" style="color: red;">
            {{cusTips}}
          </div>
          <div>
            <el-button type="text" @click="addCustomDate" :disabled="customDates.length >= 10">＋ 增加生效周期</el-button>
          </div>
        </el-form-item>
        <el-form-item label="存储时长:" prop="storageTime" class="record-form-item">
          <el-input v-model.number="form.storageTime" type="number" min="30" oninput="value=value.replace(/[^\d]/g,'')" style="width: 150px;"><span slot="suffix">天</span></el-input>
        </el-form-item>
        <el-form-item label="模板备注" prop="description">
          <el-input v-model="form.description" style="width: 463px;" type="textarea" maxlength="255" :autosize="{minRows: 3, maxRows: 5}" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="submit">{{ createOrUpdateFlag ? '新建' : '确定' }}</el-button>
          <el-button @click="back">取 消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { updateRecordTemplate, createRecordTemplate } from '@/api/template'

@Component({
  name: 'create-or-update-record-template'
})
export default class extends Vue {
  @Prop()
  private createOrUpdateFlag: boolean // 新建/编辑
  @Prop()
  private formData?: any // 编辑时,模板数据
  @Prop()
  private templateId!: string

  private form: any = {}
  private submitting = false

  private customRecordList = [{'weekday': '星期一'}, {'weekday': '星期二'}, {'weekday': '星期三'}, {'weekday': '星期四'}, {'weekday': '星期五'}, {'weekday': '星期六'}, {'weekday': '星期日'}]

  // 每一行都有一个收集时间段的数组，用于控制起始时间和结束时间的位置、判断起始时间是否有效
  // 约束时间段位置、时间段复制时做有效性判断
  // 该数组以时间顺序严格递增
  private MonList = []
  private TusList = []
  private WesList = []
  private ThrList = []
  private FriList = []
  private StrList = []
  private SunList = []

  // 渲染遮罩层
  private get weekdays() {
    return [this.MonList, this.TusList, this.WesList, this.ThrList, this.FriList, this.StrList, this.SunList]
  } 
  // private dayList = [{
  //   startX: 0,
  //   endX: 230,
  //   style: {width: Math.abs(endX - startX)px,等},
  //    moveable: false // 是否可以拖拽绘制
  // }, {
  //   startX: 250,
  //   end:X 630
  //   style: {width: Math.abs(endX - startX)px,等}
  // }]

  private optStyle: any = null

  private startPos = -1 // 正常拖拽时的固定位
  private startPosClickFix = -1 // 点击 stick 拖拽时的固定位
  private moveFlag = false

  private currentDragRow = -1
  private currentDragCol = -1
  private currentClickRow = -1
  private currentClickCol = -1

  private currentDragDuration = {
    row: -1,
    col: -1,
    startTimeX: -1, // duration 开始时间
    endTimeX: -1, // duration 结束时间
  }

  private currentMouseDownDuration = {
    row: -1,
    col: -1
  }

  private currentStartTime = -1 // min -1：无效
  private currentWeekday = -1 // 1-7  星期一 -- 星期日 -1：未选择或无效

  private durationTime: any = null
  private currentClickDurationTime: any = null // 保存当前duration的起止时间，用于OPT
  private showOpt = false

  private outRange = false

  private copyDay: any = null

  private oriCusData: any = null

  private showDragWrap = true
  private showClickWrap = false
  private dragMaskStyle: any = {
    display: 'flex'
  }
  private clickMaskStyle: any = {
    display: 'none'
  }

  private pickerOptions = {
    step: '00:01',
    format: 'HH:mm'
  }

  private checkedDays = []

  private week = [
    {
      value: 1,
      label: '星期一',
      disabled: false
    },
    {
      value: 2,
      label: '星期二',
      disabled: false
    },
    {
      value: 3,
      label: '星期三',
      disabled: false
    },
    {
      value: 4,
      label: '星期四',
      disabled: false
    },
    {
      value: 5,
      label: '星期五',
      disabled: false
    },
    {
      value: 6,
      label: '星期六',
      disabled: false
    },
    {
      value: 7,
      label: '星期日',
      disabled: false
    }
  ]

  private rules = {
    templateName: [
      { required: true, message: '请输入录制模板名称', trigger: 'blur' },
      { validator: this.validateTemplateName, trigger: 'blur' }
    ],
    storageTime: [
      { required: true, message: '请填写存储时长', trigger: 'blur' },
      { validator: this.validateStorageTime, trigger: 'blur' }
    ],
    recordType: [
      { required: true,message: '请选择录制类别', trigger: 'blur'  }
    ]
  }

  // -----指定时间相关
  private customDates = [{
    startTime: null, // 选择时间用的
    endTime: null, 
  }]

  private cusTips = ''
  private showCusTips = false

  @Watch('form.recordType', {
    immediate: true
  })
  private onTypeChange() {
    if (+this.form.recordType === 2) {
      // 绑定鼠标事件
      this.$nextTick(() => {
        const customers: any = document.getElementsByClassName('time-mask')
        for(let i = 0; i < customers.length; i++) {
          customers[i].addEventListener('mousedown', this.handleMousedown, true)
          customers[i].addEventListener('mousemove', this.handleMousemove, true)
          // customers[i].addEventListener('mouseup', this.handleMouseup, false)
          customers[i].addEventListener('mouseleave', this.handleMouseLeave, true)
        }
      })
      document.body.addEventListener('mouseup', this.handleMouseup, false)
      // document.body.addEventListener('mousemove', this.handleMousemove, false)
    } else {
      // 注销 body 注册事件
      document.body.removeEventListener('mouseup', this.handleMouseup)
      // 清空 循环相关数据,新建清空，编辑保留
      if (this.weekdays && this.createOrUpdateFlag) {
        this.MonList = []
        this.TusList = []
        this.WesList = []
        this.ThrList = []
        this.FriList = []
        this.StrList = []
        this.SunList = []
      }
      this.showOpt = false
      // 重置遮罩层
      this.dragMaskStyle = {
        display: 'flex'
      }
      this.clickMaskStyle = {
        display: 'none'
      }
    }
    // ---------------
    // 清空 指定相关数据
    if (+this.form.recordType !== 3 && this.createOrUpdateFlag) {
      this.customDates = [{
        startTime: null,
        endTime: null
      }]
      this.showCusTips = false
      this.cusTips = ''
    }
      
  }

  @Watch('showClickWrap', {
    immediate: true
  })
  private onShowClickWrap() {
    this.$nextTick(() => {
      if (this.showClickWrap) {
        const clickmask: any = document.getElementsByClassName('time-mask-click')
        for(let i = 0; i < clickmask.length; i++) {
          // 切换到click层，因为没有禁止接受鼠标事件，所以mousedown、Mousemove、mouseup是判断不准目标来源的，只能单独写方法来判断是否需要切换到 drag 层
          clickmask[i].addEventListener('mousedown', this.handleClickMousedown, false)
          clickmask[i].addEventListener('mouseup', this.handleClickMouseup, false)
          clickmask[i].addEventListener('mouseleave', this.handleMouseLeave, false)
        }
      } else {
        this.clickMaskStyle.display = 'none'
      }
    })
  }

  @Watch('showDragWrap', {
    immediate: true
  })
  private onShowDragWrap() {
    this.$nextTick(() => {
      if (this.showDragWrap) {
        const customers: any = document.getElementsByClassName('time-mask')
        for(let i = 0; i < customers.length; i++) {
          customers[i].addEventListener('mousedown', this.handleMousedown, false)
          customers[i].addEventListener('mousemove', this.handleMousemove, false)
          customers[i].addEventListener('mouseup', this.handleMouseup, false)
        }
      } else {
        this.dragMaskStyle.display = 'none'
        
      }
    })
  }

  private mounted() {
    window.addEventListener('resize', this.calOptY)
    if (this.createOrUpdateFlag) {
    // 新建
      this.form = {
        templateId: this.templateId,
        templateName: '',
        description: '',
        recordType: 1,
        storageTime: 30
      }
    } else {
      // 编辑
      this.form = {
        templateId: this.templateId,
        templateName: this.formData.templateName,
        description: this.formData.description,
        recordType: this.formData.recordType,
        storageTime: +this.formData.storageTime / 60 / 60 / 24 // 秒 --> 天
      }
      // 构建循环录制数据
      if (this.formData.recordType === 2) {
        // 2 数据不可清除
        this.fixDataType = 2
        this.buildLoopData(this.formData.weekTimeSections)
      }
      // 构建定时录制数据
      // 原始数据时间可能会小于当前时间导致无法提交
      if (this.formData.recordType === 3) {
        this.fixDataType = 3
        this.buildCusData(this.formData.specTimeSections)
      }
    }
  }

  private destroyed() {
    window.removeEventListener('resize', this.calOptY)
  } 

  private async submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          let templateId = this.templateId
          let recordModes: any = undefined
          if (this.form.recordType === 1) {
            recordModes = this.tidyNormalData(1)
          }
          if (this.form.recordType === 2) {
            recordModes = this.tidyLoopData()
          }
          if (this.form.recordType === 3) {
            if (this.cusSubmitCheck()) return
            recordModes = this.tidyCusDate()
          }
          if (this.form.recordType === 5) {
            recordModes = this.tidyNormalData(5)
          }
          this.submitting = true
          // 提交时,不允许操作 模板列表
          this.$emit('on-submit', false)
          if (this.createOrUpdateFlag) {
            const params = {
              templateName: this.form.templateName,
              description: this.form.description,
              ...recordModes
            }
            const res = await createRecordTemplate(params)
            templateId = res.templateId
            this.$message.success('新建模板成功!')
          } else {
            const params = {
              templateName: this.form.templateName,
              description: this.form.description,
              templateId: templateId,
              ...recordModes
              // weekTimeSections: weekTimeSections,
              // specTimeSections: specTimeSections,
              // storageTime: this.form.storageTime * 24 * 60 * 60 // 秒 --> 天
            }
            await updateRecordTemplate(params)
            this.$message.success('修改模板成功!')
          }
          this.submitting = false
          this.closePage(true, templateId)
          this.$emit('on-submit', true)
        } catch (e) {
          this.submitting = false
          this.$emit('on-submit', true)
          this.$message.error(e.message)
        }
      }
    })
  }

  private closePage(isRefresh: boolean, templateId?) {
    this.$emit('on-close', {
      isRefresh, templateId
    })
    // 清空数据
    const form: any = this.$refs.dataForm
    form.resetFields()
  }

  private back() {
    this.closePage(false)
  }

  private validateTemplateName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-()（）_\s]{4,64}$/u.test(value)) {
      callback(new Error('录制模板名称格式错误'))
    } else if (/^[\s]|[\s]$/.test(value)) {
      callback(new Error('不能以空格作为名称的首尾。'))
    } else {
      callback()
    }
  }

  private validateStorageTime(rule: any, value: number, callback: Function) {
    if (value > 1095) {
      callback(new Error('存储时长输入过长，最大时长不超过1095天'))
    } else if (value < 30) {
      callback(new Error('存储时长输入过短，最小时长不少于30天'))
    } else {
      callback()
    }
  }

  // 计算OPT显示高度
  private calOptY() {
    const opt: any = document.getElementsByClassName('operation-mask')[0]
    if (this.showOpt && opt) {
      const height = opt.clientHeight
      if (height === 72) {
        // currentClickRow 是准的
        this.optStyle.top = this.currentClickRow * 44 - 84 - 36 + 'px'
      }
      if (height === 36) {
        this.optStyle.top = this.currentClickRow * 44 - 84 + 'px'
      }
    }
  }

  private optWrap(left: number) {
    const body: any = document.getElementsByClassName('body')[0]
    return left + 560 > body.clientWidth
  }

  /**
  *
  * 定制录制时长 
  * 
   */

  private cellClassName({row, column, rowIndex, columnIndex}) {
    row.index = rowIndex + 1
    column.index = columnIndex
    return 'cell-' + (rowIndex + 1) + '-' + columnIndex
  }

  private handleMousedown(e: any) {
    if(this.form.recordType!==2) return
    if (this.moveFlag) {
      // 在拖拽区域外释放鼠标,删除该绘制状态
      this.weekdays[this.currentWeekday - 1].map((item: any, i: any) => {
      if (item.moveable) {
        this.weekdays[this.currentWeekday - 1].splice(i, 1)
        this.resetMouse()
      }
    })
    }
    //  拖拽的时候显示拖拽层，隐藏点击层
    // 判断鼠标的点是否在可拖拽区域，或者是选中了某个duration
    // 确定单元格
    const target: any = (e.target.className.split(' '))[e.target.className.split(' ').length - 1]
    const row = target.split('-')[1]
    // 计算时间
    let pixelOffsetX =  e.offsetX > 0 ? e.offsetX : 0
    let pixelOffsetY =  e.offsetY > 0 ? e.offsetY : 0
    // 起始时间
    let clickTime = pixelOffsetX * 2 // 分钟
    // 判断是否可以作为拖拽的有效起始时间
    // 还要加一个判断，判断在click层是否点到了duration
    if (this.startTimeValidate(this.weekdays[row - 1], clickTime)) {
      // 显示拖拽层，隐藏点击层
      this.showClickWrap = false
      this.showDragWrap = true
      this.clickMaskStyle.display = 'none'
      this.dragMaskStyle.display = 'flex'
      this.currentStartTime = clickTime
      this.startPos = e.offsetX // 当前次拖动的开始位置
      // 固定当前所在行
      this.currentWeekday = row
      // 允许拖拽
      this.moveFlag = true
      // 创建时间段单元
      let duration: any = {
        // startX  就是点击的开始时间，是固定的
        startX: this.startPos,
        endX: this.startPos,
        durationStyle: {
          'width': 0, // 初始
          'left': this.startPos + 'px'
        },
        startTime: clickTime, // 分钟
        endTime: -1,
        moveable: true
      }
      this.weekdays[row - 1].push(duration)
    } else {
      // 无效判定\重置
      // 点击事件选中了某个duration
      // 显示点击层,隐藏拖拽层
      // 设置当前点击点，以方便 click 层判断
      let {row, index} = this.findDuration(e)
      this.currentMouseDownDuration.row = row
      this.currentMouseDownDuration.col = index
      this.showClickWrap = true
      this.showDragWrap = false
      this.clickMaskStyle.display = 'flex'
      this.dragMaskStyle.display = 'none'
      this.resetMouse()
    }
  }

// 拖拽
  private handleMousemove(e: any) {
    if(this.form.recordType!==2) return
    if (!this.moveFlag) return
    // 隐藏OPT
    this.showOpt = false
    // 拖动的时候就开始生成拖选区域
    // 绘制区域
    // 寻找未闭合的duration，即当前duration,并计算数据
    let index = -1
    let startTimeX = -1
    let endTimeX = -1
    this.weekdays[this.currentWeekday - 1].map((item: any, i: any) => {
      if (item.moveable) {
        // 数据计算与属性更新
        item = this.dynamicProp(item, e)
        index = i
        startTimeX = item.endX > item.startX ? item.startX : item.endX
        endTimeX =  item.endX > item.startX ? item.endX : item.startX
      }
    })
    // 保存当前duration信息
    this.currentDragDuration.startTimeX = startTimeX
    this.currentDragDuration.endTimeX = endTimeX
    // }
  }
  
  private handleMouseup(e: any) {
    if(this.form.recordType!==2) return
    if (!this.moveFlag) return
    // 如果只是点击没有移动，则清空当前操作
    // 如果结束点位置和开始点一致，删除绘制
    let resetFlag = false
    this.weekdays[this.currentWeekday - 1].map((item: any, i: any) => {
      if (item.moveable) {
        if (e.offsetX === item.startX) {
          this.weekdays[this.currentWeekday - 1].splice(i, 1)
          this.resetMouse()
          resetFlag = true
        }
      }
    })
    if (resetFlag) return
    let optLeft = -1
    let currentMouseupIndex = -1
    this.weekdays[this.currentWeekday - 1].map((item: any, i: any) => {
      if (item.moveable) {
        // duration start time表示拖拽结束后,duration的开始时间
        // duration end time表示拖拽结束后,duration的结束时间
        item.durationStartTime = item.endX > item.startX ? item.startX * 2 : item.endX * 2
        item.durationEndTime = item.endX > item.startX ? item.endX * 2 : item.startX * 2
        if (this.outRange) {
          // 越界
          optLeft = this.currentDragDuration.startTimeX
        } else {
          // 数据计算与属性更新
          item = this.dynamicProp(item, e)
          optLeft = item.durationStartTime / 2
          currentMouseupIndex = i
        }
        item.moveable = false
        // 将最终的数据更新到OPT上
        // 如果拖到24：00，置为23：59
        if (item.durationEndTime === 24 * 60) {
          item.durationEndTime = item.durationEndTime - 1
        }
        const timestamp = (new Date((new Date()).toLocaleDateString())).getTime() // 当天零点毫秒
        this.durationTime = [timestamp + item.durationStartTime * 1000 * 60, timestamp + item.durationEndTime * 1000 * 60]
        this.currentClickDurationTime = [timestamp + item.durationStartTime * 1000 * 60, timestamp + item.durationEndTime * 1000 * 60]
      }
    })
    // !this.outRange && this.weekdays[this.currentWeekday - 1].map((item: any, i: any) => {
    //   if (item.moveable) {
    //     // 数据计算与属性更新
    //     item = this.dynamicProp(item, e)
    //     item.moveable = false
    //     // duration start time表示拖拽结束后,duration的开始时间
    //     // duration end time表示拖拽结束后,duration的结束时间
    //     item.durationStartTime = item.endX > item.startX ? item.startX * 2 : item.endX * 2
    //     item.durationEndTime = item.endX > item.startX ? item.endX * 2 : item.startX * 2
    //     optLeft = item.durationStartTime / 2
    //     currentMouseupIndex = i
    //   }
    // })
    // this.outRange && (optLeft = this.currentDragDuration.startTimeX)
    // 显示 OPT操作框
    // 设置 stick 激活状态
    this.currentDragRow = this.currentDragDuration.row
    this.currentDragCol = this.currentDragDuration.col
    const wrap = this.optWrap(optLeft)
    this.optStyle = {
      'position': 'absolute',
      'left': optLeft + 60 + 'px',
      // 'top': this.currentDragRow * 44 - 84 + 'px',
      'top': wrap ? this.currentDragRow * 44 - 84 - 36 + 'px' : this.currentDragRow * 44 - 84 + 'px',
      'z-index': 1
    }
    this.showOpt = true
    // 拖拽完成之后就跳转到 click 层
    // 设置 click 层的 stick
    let {row} = this.outRange ? {row: this.currentDragDuration.row} : this.findDuration(e)
    this.currentMouseDownDuration.row = row
    // this.currentMouseDownDuration.col = index
    this.currentMouseDownDuration.col = this.outRange ? this.currentDragDuration.col : currentMouseupIndex
    this.showClickWrap = true
    this.showDragWrap = false
    this.clickMaskStyle.display = 'flex'
    this.dragMaskStyle.display = 'none'
    this.currentClickRow = row
    this.currentClickCol = this.outRange ? this.currentDragDuration.col : currentMouseupIndex
    // 给stick绑定拖拽事件，当拖拽的时候切回drag页面
    // 重置
    this.resetMouse()
    // 重置 drag 相关数据
    this.currentDragDuration.row = -1
    this.currentDragDuration.col = -1
    // this.startPosClickFix = -1
  }

  // 寻找特定duration
  private findDuration(e: any) {
    // 确定单元格
    if(this.outRange) return
    const {target, row, type, clickOffsetX} = this.getDurationDomInfo(e)
    // const target: any = (e.target.className.split(' '))[e.target.className.split(' ').length - 1]
    // const row = +target.split('-')[1]
    // const type = target.split('-').length
    // 计算时间
    let pixelOffsetX =  e.offsetX > 0 ? e.offsetX : 0
    // 起始时间
    let clickTime = pixelOffsetX * 2 // 分钟
    // 确定duration
    let index = -1
    if (type === 5) {
      // click 层
      index = +target.split('-')[3]
    } else {
      // drag 层 
      // 存在 只有行标记没有列标记的情况
      // 存在 当前duration被挡住但是鼠标还能移动到其他坐标的情况
      this.weekdays[row - 1].map((item: any, i: any) => {
        // if (item.startTime <= clickTime && item.endTime >= clickTime) index = i
        if (!(item.durationEndTime >= 0 && item.durationStartTime >= 0) && item.durationStartTime <= clickTime && item.durationEndTime >= clickTime) index = i
        if (item.moveable) index = i
      })
    }
    return {
      row: row,
      index: index,
      clickOffsetX: clickOffsetX
    }
  }

  // 确定单元格
  private getDurationDomInfo(e: any) {
    const target: any = (e.target.className.split(' '))[e.target.className.split(' ').length - 1]
    const row = +target.split('-')[1]
    const type = target.split('-').length
    // const clickOffsetX = e.target.offsetLeft // click层用于渲染OPT
    const clickOffsetX = e.target.getBoundingClientRect().left - 713 // click层用于渲染OPT 精确到小数点
    // const clickOffsetWidth = e.target.offsetWidth // click层用于渲染OPT
    const clickOffsetWidth = e.target.getBoundingClientRect().width // click层用于渲染OPT 精确到小数点
    return {target, row, type, clickOffsetX, clickOffsetWidth}
  }

  // 属性计算和更新
  private dynamicProp(currentDuration: any,e: any) {
    let currentOffsetX =  e.offsetX > 0 ? e.offsetX : 0
    let currentTime = currentOffsetX * 2
    // 校验边界区域合法性,区分计算方式
    let calcType = this.dragTimeValidate(this.weekdays[this.currentWeekday - 1], currentTime, this.currentStartTime)
    let width = Math.abs(currentDuration.startX - currentOffsetX) // duration 宽度
    if (calcType.type === 1) {
      // 拖拽位置停留在left边界处,left和width同时变化,保证起始位置看上去没有变化
      currentDuration.durationStyle.left = calcType.left + 'px'
      width = Math.abs(currentDuration.startX - calcType.left)
      // endX 拖拽结束时 位置
      currentDuration.endX = calcType.left
      // 更新 endTime前 startTime后  
      currentDuration.endTime = Math.max(calcType.currentTime, this.currentStartTime)
      currentDuration.startTime = Math.min(calcType.currentTime, this.currentStartTime)
    } else if (calcType.type === 2) {
      // 起始位置固定不变,拖拽位置停留在right边界处
      width = Math.abs(currentDuration.startX - calcType.left)
      currentDuration.durationStyle.left = currentDuration.startX + 'px'
      // endX 拖拽结束时 位置
      currentDuration.endX = calcType.left
      // 更新 endTime前 startTime后  
      currentDuration.endTime = Math.max(calcType.currentTime, this.currentStartTime)
      currentDuration.startTime = Math.min(calcType.currentTime, this.currentStartTime)
    } else if (calcType.type === 3) {
      // 正常
      if (currentOffsetX > currentDuration.startX) {
        currentDuration.durationStyle.left = Math.min(currentOffsetX, +((currentDuration.durationStyle.left).slice(0,-2))) + 'px'
      } else if (currentOffsetX <= currentDuration.startX) {
        currentDuration.durationStyle.left = currentOffsetX + 'px'
      }
      // endX 拖拽结束时 位置
      currentDuration.endX = e.offsetX
      // 更新 endTime前 startTime后  
      // endtime表示拖拽结束的时间
      // starttime表示拖拽开始的时间
      currentDuration.endTime = Math.max(currentTime, this.currentStartTime, this.startPosClickFix * 2)
      currentDuration.startTime = Math.min(currentTime, this.currentStartTime)
      // currentDuration.endTime = currentDuration.endX * 2
      // currentDuration.startTime = currentDuration.startX * 2
      // 调整多次点击时，数据更新
      if (currentDuration.endX * 2 > currentDuration.startTime && currentDuration.startTime !== this.currentStartTime) {
        currentDuration.startTime = currentDuration.endX * 2
      }
    }
    currentDuration.durationStyle.width = width + 'px'
    // 拖拽时显示 对应 duration 的 stick
    let {row, index} = this.findDuration(e)
    if (this.currentDragDuration.row === -1) {
      // 初次赋值
      // 避免鼠标移动到其他duration时候产生污染
      this.currentDragDuration.row = row
      this.currentDragDuration.col = index
    }
    // this.currentDragRow = row
    // this.currentDragCol = index
    this.currentDragRow = this.currentDragDuration.row
    this.currentDragCol = this.currentDragDuration.col
    // 重置click层的stick
    this.currentClickRow = -1
    this.currentClickCol = -1
    this.currentMouseDownDuration.row = -1
    this.currentMouseDownDuration.col = -1
    this.showOpt = false
    // const duration: any = document.getElementsByClassName('row-'+row+'-col-'+index)
    return currentDuration
  }

  // 重置
  private resetMouse() {
    this.moveFlag = false
    // this.currentStartTime = -1
    this.currentWeekday = -1
    this.startPos = -1
  }

  // 校验起始时间有效性
  private startTimeValidate(weekdayList: any, currentTime: number) {
    if (weekdayList.length === 0) return true
    let a = !weekdayList.some((item: any) => {
      // return item.startTime <= currentTime && currentTime <= item.endTime
      return item.durationStartTime <= currentTime && currentTime <= item.durationEndTime
    })
    return a
  }

  // 校验拖拽时间有效性
  private dragTimeValidate(weekdayList: any, currentTime: number, fixTime: number) {
    if (weekdayList.some((item: any) => {
      // return currentTime <= item.endTime && !item.moveable && fixTime > item.endTime
      return currentTime <= item.durationEndTime && !item.moveable && fixTime >= item.durationEndTime
    })) {
      // 找到左侧 endTime 最大值
      let timeList = []
      weekdayList.map((item: any) => {
        // if (currentTime <= item.endTime && !item.moveable && fixTime > item.endTime) timeList.push(item.endTime)
        if (currentTime <= item.durationEndTime && !item.moveable && fixTime >= item.durationEndTime) timeList.push(item.durationEndTime)
      })
      let maxTime = Math.max(...timeList)
      return {
        type: 1,
        // left: Math.ceil((maxTime + 1) / 2),
        // currentTime: maxTime + 1
        left: maxTime / 2,
        currentTime: maxTime + 1
      }
    }
    // 与右边界重叠
    if (weekdayList.some((item: any) => {
      // return currentTime >= item.startTime && !item.moveable && fixTime < item.startTime
      return currentTime >= item.durationStartTime && !item.moveable && fixTime <= item.durationStartTime
    })) {
      // 找到右侧 startTime 最小值
      let timeList = []
      weekdayList.map((item: any) => {
        // if (currentTime >= item.startTime && !item.moveable && fixTime < item.startTime) timeList.push(item.startTime)
        if (currentTime >= item.durationStartTime && !item.moveable && fixTime <= item.durationStartTime) timeList.push(item.durationStartTime)
      })
      let minTime = Math.min(...timeList)
      return {
        type: 2,
        // left: Math.floor((minTime - 1) / 2),
        // currentTime: minTime - 1
        left: minTime / 2,
        currentTime: minTime - 1
      }
    }
    return {
      type: 3
    }
  }

  /**
   * click  层的鼠标事件 
   * handleClickMousedown
   * handleClickMouseup
   * clickDuration
  */
 private handleClickMousedown(e: any) {
  if(this.form.recordType!==2) return
  // 直接通过target的class判断
  const target: any = (e.target.className.split(' '))[e.target.className.split(' ').length - 1]
  const type = target.split('-').length
  if (type === 3) {
    // 切换到 drag 层
    this.startPosClickFix = -1
    this.showClickWrap = false
    this.showDragWrap = true
    this.clickMaskStyle.display = 'none'
    this.dragMaskStyle.display = 'flex'
    // 组装初始化 duration
    const pixelOffsetX =  e.offsetX > 0 ? e.offsetX : 0
    const row = target.split('-')[1]
    const clickTime = pixelOffsetX * 2
    this.currentStartTime = clickTime
    this.startPos = e.offsetX // 当前次拖动的开始位置
    // 固定当前所在行
    this.currentWeekday = row
    // 允许拖拽
    this.moveFlag = true
    // 创建时间段单元
    let duration: any = {
      // startX  就是点击的开始时间，是固定的
      startX: this.startPos,
      endX: this.startPos,
      durationStyle: {
        'width': 0, // 初始
        'left': this.startPos + 'px'
      },
      startTime: clickTime, // 分钟
      endTime: -1,
      moveable: true
    }
    this.weekdays[row - 1].push(duration)
  } else if (type === 2) {
    // 点在 stick 上
    const side = target.split('-')[1] // left or right
    this.showClickWrap = false
    this.showDragWrap = true
    this.clickMaskStyle.display = 'none'
    this.dragMaskStyle.display = 'flex'
    const row = (e.target.parentNode.classList[1]).split('-')[1]
    const index = (e.target.parentNode.classList[1]).split('-')[3]
    const currentDuration = this.weekdays[row - 1][index]
    const currentWidth = Math.abs(currentDuration.startX - currentDuration.endX)
    if (side === 'left') {
      // 组装新的duration
      // 每次点击都会重新固定一个 stick 
      // 固定位置在当前duration的结束时间
      // this.startPosClickFix = currentDuration.endTime / 2
      this.startPosClickFix = currentDuration.durationEndTime / 2
      // this.currentStartTime = currentDuration.startTime
      this.currentStartTime = currentDuration.durationStartTime
      // let left = currentDuration.startTime / 2
      let left = currentDuration.durationStartTime / 2
      this.currentWeekday = row
      this.moveFlag = true
      let duration: any = {
        // startX  就是点击的开始时间，是固定的
        // 已经有endX了
        startX: this.startPosClickFix,
        // endX: currentDuration.startTime / 2,
        endX: currentDuration.durationStartTime / 2,
        durationStyle: {
          'width': currentWidth, // 初始
          'left':  left + 'px'
        },
        // startTime: currentDuration.startTime, // 分钟
        startTime: currentDuration.durationStartTime, // 分钟
        endTime: this.startPosClickFix * 2,
        moveable: true
      }
      // 替换掉原来位置的duration
      // this.weekdays[row - 1][index] = duration 不能直接赋值，指针会乱掉
      this.weekdays[row - 1].splice(index, 1, duration)
    } else if (side === 'right') {
      // 点右边的stick， 则固定位置为当前duration 的 start time 处
      // this.startPosClickFix = currentDuration.startTime / 2
      // this.currentStartTime = currentDuration.endTime
      // let left = currentDuration.startTime / 2
      this.startPosClickFix = currentDuration.durationStartTime / 2
      this.currentStartTime = currentDuration.durationEndTime
      let left = currentDuration.durationStartTime / 2
      this.currentWeekday = row
      this.moveFlag = true
      let duration: any = {
        startX: this.startPosClickFix,
        // endX: currentDuration.endTime / 2,
        endX: currentDuration.durationEndTime / 2,
        durationStyle: {
          'width': currentWidth, // 初始
          'left': left + 'px'
        },
        startTime: this.startPosClickFix * 2, // 分钟
        // endTime: currentDuration.endTime,
        endTime: currentDuration.durationEndTime,
        moveable: true
      }
      // 替换掉原来位置的duration
      // this.weekdays[row - 1][index] = duration 不能直接赋值，指针会乱掉
      this.weekdays[row - 1].splice(index, 1, duration)
    }
  }
 }

  // 点击duration
  private clickDuration(e: any) {
    // 在这里判断点击事件是否发生在 click 层的 duration 上
    // 激活 stick
    // 确定单元格
    const {target, row, clickOffsetX, clickOffsetWidth} = this.getDurationDomInfo(e)
    if (isNaN(+target.split('-')[3])) return
    this.currentMouseDownDuration.row = row
    this.currentMouseDownDuration.col = +target.split('-')[3]
    this.currentClickRow = this.currentMouseDownDuration.row
    this.currentClickCol = this.currentMouseDownDuration.col
    const wrap = this.optWrap(clickOffsetX)
    this.optStyle = {
      'position': 'absolute',
      'left': clickOffsetX + 60 + 'px',
      // 'top': this.currentClickRow * 44 - 84 + 'px',
      'top': wrap ? this.currentClickRow * 44 - 84 - 36 + 'px' : this.currentClickRow * 44 - 84 + 'px',
      'z-index': 1
    }
    // 设置当前锁定的duration
    // 更新OPT时间
    const timestamp = (new Date((new Date()).toLocaleDateString())).getTime() // 当天零点毫秒
    const startTime = clickOffsetX * 2 * 60 * 1000 + timestamp
    const endTime = (clickOffsetX + clickOffsetWidth) * 2 * 60 * 1000 + timestamp
    this.durationTime = [startTime, endTime]
    this.currentClickDurationTime = [startTime, endTime]
    this.showOpt = true
    this.resetMouse()
    // 点击之后绘制
  }

  // 当显示 click层后，通过mouse up事件来判断选中了哪个duration
  private handleClickMouseup(e: any) {
    if(this.form.recordType!==2) return
    let {row, index, clickOffsetX} = this.findDuration(e)
    if (index === -1) return
    // 点击后有移动鼠标到其他非起始duration位置，则不做判定
    if (row !== this.currentMouseDownDuration.row || index !== this.currentMouseDownDuration.col) return
    this.$nextTick(() => {
      // 修改duration样式
      // drag 层过渡到 click 层
      this.currentClickRow = row
      this.currentClickCol = index
      const wrap = this.optWrap(clickOffsetX)
      this.optStyle = {
        'position': 'absolute',
        'left': clickOffsetX + 60 + 'px',
        'top': wrap ? this.currentClickRow * 44 - 84 - 36 + 'px' : this.currentClickRow * 44 - 84 + 'px',
        // 'top': this.currentClickRow * 44 - 84 + 'px',
        'z-index': 1
      }
      this.showOpt = true
      // 重置drag层的stick
      this.currentDragRow = -1
      this.currentDragCol = -1
      this.currentDragDuration.row = -1
      this.currentDragDuration.col = -1
      // this.startPosClickFix === -1
    })
  }

  // 处理拖拽超出正常区域的情况
  private handleMouseLeave(e: any) {
    if(this.form.recordType!==2) return
    const list: any = e.toElement.classList
    let inRange = false
    for(let i = 0; i < list.length; i++) {
      if(list[i].indexOf('time-mask') >= 0) {
        inRange = true
        break
      }
    }
    if (!inRange && this.moveFlag) {
      this.outRange = true
    } else {
      this.outRange = false
    }

  }

  /**
   *  opt 复制校验
   * */ 
  private checkedDayCopy() {
    this.checkedDays = [] //重置
    // 定位当前duration
    const duration = this.weekdays[this.currentClickRow - 1][this.currentClickCol]
    const sortWeekdays: any = JSON.parse(JSON.stringify(this.weekdays))
    // 排序
    // const sortWeekdays = this.weekdays.map((day: any, index: number) => {
    sortWeekdays.map((day: any, index: number) => {
      if (day.length < 2) return day
      return day.sort(function(a: any, b: any) {
        return (a.durationStartTime - b.durationStartTime)
      })
    })
    // 筛选设置disabled
    sortWeekdays.map((day: any, index: number) => {
      const len = day.length
      const weekday = this.week[index]
      weekday.disabled = true
      if (len === 0) weekday.disabled = false
      if (len > 0) {
        if (duration.durationEndTime < day[0].durationStartTime) weekday.disabled = false
        if (duration.durationStartTime > day[len - 1].durationEndTime) weekday.disabled = false
        for(let i = 0; i < len - 1; i++) {
          if (day[i].durationEndTime < duration.durationStartTime && day[i + 1].durationStartTime > duration.durationEndTime) weekday.disabled = false
        }
      }
    })
  }

  private selectClick() {
    if (this.checkedDays.length === 0) return
    // 当前duration
    const duration = this.weekdays[this.currentClickRow - 1][this.currentClickCol]
    for (let i = 0; i < this.checkedDays.length; i++) {
      this.weekdays[this.checkedDays[i] - 1].push(duration)
    }
    // 关闭opt,进行复制和渲染
    this.showOpt = false
  }

  private selectClean() {
    this.checkedDays = []
  }

  // time picker 变化
  // 时间选择器的时间是根据当天的时间换算成24小时的，需要及时更新当天的时间
  private timepickerChange(times: any) {
    // 校验修改的时间是否有效
    // 转换时间，剔除日期的影响
    const checkStartTime = (times[0] - (new Date((new Date()).toLocaleDateString())).getTime()) / 1000 / 60 // 分钟
    const checkEndTime = (times[1] - (new Date((new Date()).toLocaleDateString())).getTime()) / 1000 / 60 // 分钟
    const isCovered = this.weekdays[this.currentClickRow - 1].some((item: any, index: any) => {
      if (index !== this.currentClickCol) {
        const flag1 = checkStartTime < item.durationStartTime && checkEndTime > item.durationStartTime 
        const flag2 = checkStartTime < item.durationEndTime && checkEndTime > item.durationEndTime 
        const flag3 = checkStartTime > item.durationStartTime && checkEndTime < item.durationEndTime
        return flag1 || flag2 || flag3
      }
    })
    if (isCovered) {
      // 有覆盖情况,还原时间,提示错误
      this.durationTime = [this.currentClickDurationTime[0], this.currentClickDurationTime[1]]      
      return this.$message.error('设置时间段存在重叠部分！')
    } else {
      // 无覆盖情况，更新 duration
      const width = (checkEndTime - checkStartTime) / 2
      const duration: any = {
        durationStartTime: checkStartTime,
        durationEndTime: checkEndTime,
        startX: checkStartTime / 2,
        endX: checkEndTime / 2,
        durationStyle: {
          'width': width + 'px', // 更新
          'left': checkStartTime / 2 + 'px'
        },
        startTime: checkStartTime, // 分钟
        endTime: checkEndTime,
        moveable: false
      }
      // 更新 currentClickDurationTime
      this.currentClickDurationTime = [times[0], times[1]]
      this.weekdays[this.currentClickRow - 1].splice(this.currentClickCol, 1, duration)
    }
  }

  // 整理全天录制和手动录制
  private tidyNormalData(recordType: number) {
    return {
      recordType: recordType,
      storageTime: this.form.storageTime * 24 * 60 * 60 // 秒
    }
  }

  // 整理循环定时录制数据
  private tidyLoopData() {
    let recordModes: any = {
      recordType: 2,
      weekTimeSections: [],
      storageTime: this.form.storageTime * 24 * 60 * 60 // 秒
    }
    // 按 durationStartTime 排序
    this.weekdays.map((day: any, index: any) => {
      const len = day.length
      for (let i = 0; i < len; i++) {
        for (let j = 0; j < i; j++) {
          if (day[j].durationStartTime > day[i].durationStartTime) {
            const temp = day[j]
            day[j] = day[i]
            day[i] = temp
          }
        }
      }
    })
    this.weekdays.map((day: any, index: any) => {
      // 合并连续的时间
      let temp: any = JSON.parse(JSON.stringify(day))
      this.joinLoop(temp, 0)
      // 补全录制时长
      return temp.map((item: any) => {
        recordModes.weekTimeSections.push({
          dayofWeek: index + 1,
          startTime: parseInt(item.durationStartTime * 60 + ''), // 秒
          endTime: parseInt(item.durationEndTime * 60 + 59 + '')// 秒
        })
      })
    })
    return recordModes
  }

  private joinLoop(day: any, index: any = 0) {
    if (index + 1 < day.length) {
      if ((day[index].durationEndTime * 60 + 59) >= (day[index + 1].durationStartTime * 60)) {
        day[index].durationEndTime = day[index + 1].durationEndTime
        day.splice(index + 1, 1)
        this.joinLoop(day, index)
      } else {
        this.joinLoop(day, index + 1)
      }
    } else {
      return day
    }
  }

  // 删除 循环定时录制的 某个duration
  private deleteLoop() {
    this.weekdays[this.currentClickRow - 1].splice(this.currentClickCol, 1)
    this.showOpt = false
    this.durationTime = []
    // 重置
    this.currentClickRow = -1
    this.currentClickCol = -1
    this.currentMouseDownDuration.row = -1
    this.currentMouseDownDuration.col = -1
    this.currentDragDuration.row = -1
    this.currentDragDuration.col = -1
    this.resetMouse()
  }

  // ---------------------------
  /**
   * 指定时间录制相关
   */
  private customTimepickerChangeStart(time: any, index: any) {
    // 原始数据不检查
    if (this.oriCusData && this.oriCusData.length - 1 >= index && this.oriCusData[index].startTime === time) {
      this.showCusTips = false // 重置
      this.cusTips = '' // 重置
      return
    }
    if (time <= 0) {
      // this.$nextTick(() => {
        this.showCusTips = true
        this.cusTips = '存在空白时间，请选择时间'
      // })
      return 
    }
    this.showCusTips = false // 重置
    this.cusTips = '' // 重置
    // 检查时间有效性
    const timeNow = (new Date()).getTime()
    if (time <= timeNow) {
      // this.$nextTick(() => {
        this.showCusTips = true
        this.cusTips = '开始时间不能早于当前时间'
      // })
    }
    const endTime = this.customDates[index]['endTime'] || -1
    if (endTime > 0) {
      if (time >= endTime) {
        // this.$nextTick(() => {
          this.showCusTips = true
          this.cusTips = '开始时间不能晚于或等于结束时间'
        // })
        return
      } else if (Math.abs(endTime - time) > (6 * 24 * 60 * 60 * 1000)) {
        // this.$nextTick(() => {
          this.showCusTips = true
          this.cusTips = '时间跨度不能超过7天'
        // })
        return
      } else {
        // 与其他项校验是否交叉
        this.customDates.forEach((item: any, index: number) => {
          if (item.startTime > 0 && item.endTime > 0 && endTime > 0) {
            if ((time < item.startTime && endTime > item.startTime) || (time < item.endTime && endTime > item.endTime) || (time > item.startTime && endTime < item.endTime)) {
              // this.$nextTick(() => {
                this.showCusTips = true
                this.cusTips = '生效时间之间不能有交叉，请检查！'
              // })
            }
          } else {
            // this.$nextTick(() => {
              this.showCusTips = true
              this.cusTips = '请选择时间'
            // })
          }
        })
      }
    }
  }

  private customTimepickerChangeEnd(time: any, index: any) {
    // 原始数据不检查
    if (this.oriCusData && this.oriCusData.length - 1 >= index && this.oriCusData[index].endTime === time) {
      this.showCusTips = false // 重置
      this.cusTips = '' // 重置
      return
    }
    if (time <= 0) {
      // this.$nextTick(() => {
        this.showCusTips = true
        this.cusTips = '存在空白时间，请选择时间'
      // })
      return 
    }
    this.showCusTips = false // 重置
    this.cusTips = '' // 重置
    // 检查时间有效性
    const timeNow = (new Date()).getTime()
    if (time <= timeNow) {
      // this.$nextTick(() => {
        this.showCusTips = true
        this.cusTips = '结束时间不能早于或等于当前时间'
      // })
    }
    const startTime = this.customDates[index]['startTime'] || -1
    if (startTime > 0) {
      if (time <= startTime) {
        // this.$nextTick(() => {
          this.showCusTips = true
          this.cusTips = '结束时间不能早于或等于开始时间'
        // })
        return
      }
    }
    // 与其他项校验是否交叉
    this.customDates.forEach((item: any, index: number) => {
      if (item.startTime > 0 && item.endTime > 0 && startTime > 0) {
        if ((startTime < item.startTime && time > item.startTime) || (startTime < item.endTime && time > item.endTime) || (startTime > item.startTime && time < item.endTime)) {
          // this.$nextTick(() => {
            this.showCusTips = true
            this.cusTips = '生效时间之间不能有交叉，请检查！'
          // })
        }
      } else {
        // this.$nextTick(() => {
          this.showCusTips = true
          this.cusTips = '存在空白时间，请选择时间'
        // })
      }
    })
  }

  // 时间选择器联动
  private customPickerOptionsStart(index: number, customDates: any) {
    return {
      disabledDate(time: any) {
        return time < new Date(new Date(Date.now()).toLocaleDateString()).getTime()  // 零点
      }
    }
  }

  private customPickerOptionsEnd(index: number, customDates: any) {
    return {
      disabledDate(time: any) {
        let startTime = customDates[index]['startTime'] || -1
        if (startTime > 0) {
          startTime = new Date((new Date(startTime)).toLocaleDateString()).getTime() // 零点
          return time < startTime || time > startTime + 6 * 24 * 60 * 60 * 1000
        } else {
          return time <= Date.now()
        }
      }
    }
  }

  private addCustomDate() {
    if (this.customDates.length < 10) {
      this.$nextTick(() => {
        this.customDates.push({
          startTime: null,
          endTime: null
        })
      })
    }
  }

  // 整理指定时间录制时间
  private tidyCusDate() {
    let recordModes: any = {
      recordType: 3,
      specTimeSections: [],
      storageTime: this.form.storageTime * 24 * 60 * 60 // 秒
    }
    this.customDates.map((item: any) => {
      recordModes.specTimeSections.push({
        startTime: Math.floor(item.startTime / 1000),  // ms -> s
        endTime: Math.floor(item.endTime / 1000) + 59
      }) 
    })
    return recordModes
  }

  private delCusCheck(index: number) {
    this.showCusTips = false // 重置后重新判断
    this.customDates.splice(index, 1)
    // 删除后校验
    if(this.customDates.some((item: any) => {
      return item.startTime <= 0 || item.startTime == null || item.endTime <= 0 || item.endTime == null
    })) {
      this.showCusTips = true
      this.cusTips = '请检查所选时间！'
      // return flag = true
    }
    for(let i = 0; i < this.customDates.length; i++) {
      this.customTimepickerChangeStart(this.customDates[i].startTime, i)
      // if (this.showCusTips) return flag = true
      this.customTimepickerChangeEnd(this.customDates[i].endTime, i)
      // if (this.showCusTips) return flag = true
    }
  }

  private cusSubmitCheck() {
    let flag = false
    if(this.customDates.some((item: any) => {
      return item.startTime <= 0 || item.startTime == null || item.endTime <= 0 || item.endTime == null
    }) || this.showCusTips) {
      this.showCusTips = true
      this.cusTips = '请检查所选时间！'
      return flag = true
    }
    for(let i = 0; i < this.customDates.length; i++) {
      this.customTimepickerChangeStart(this.customDates[i].startTime, i)
      if (this.showCusTips) return flag = true
      this.customTimepickerChangeEnd(this.customDates[i].endTime, i)
      if (this.showCusTips) return flag = true
    }
    return flag
  }

  // --------------------------------
  // 初始化编辑数据
  private buildLoopData(loop: any) {
    loop.map((duration: any) => {
      let width = (duration.endTime - duration.startTime) / 60 / 2
      let data = {
        startX: duration.startTime / 60 / 2,
        endX: duration.endTime / 60 / 2,
        durationStyle: {
          'width': width + 'px',
          'left': duration.startTime / 60 / 2 + 'px'
        },
        startTime: duration.startTime / 60, // 分钟
        endTime: (duration.endTime - 59) / 60,
        moveable: false,
        durationStartTime: duration.startTime / 60, 
        durationEndTime: (duration.endTime - 59) / 60
      }
      this.weekdays[duration.dayofWeek - 1].push(data)
    })
    // 展示click层
    this.showClickWrap = true
    this.showDragWrap = false
    this.clickMaskStyle.display = 'flex'
    this.dragMaskStyle.display = 'none'
    // this.resetMouse()
  }

  private buildCusData(cus: any) {
    this.customDates.pop()
    cus.map((duration: any) => {
      this.customDates.push({
        startTime: duration.startTime * 1000,
        endTime: (duration.endTime - 59) * 1000
      })
    })
    // 如果是原始的数据没有修改则不判断
    this.oriCusData = JSON.parse(JSON.stringify(this.customDates))
  }

}
</script>
<style lang="scss">
.popover-cus {
  padding: 0;
}

.el-range-editor--medium.el-input__inner {
  width: 200px;
}
</style>
<style lang="scss" scoped>
.custom-picker {
  margin-bottom: 10px;
}

.checkboxs {
  display: grid;
  height: 222px;
}

.boxline {
  margin: 0;
  padding-left: 10px;
  padding-top: 5px;
  padding-bottom: 5px;

  &:hover,
  &:focus {
    color: #fa8334;
    border-color: #fedac2;
    background-color: #fff3eb;
  }
}

.time-mask {
  width: 720px;
  height: 44px;
  // background-color: rgba(175, 85, 85, 10%);
  background-color: transparent;
  position: absolute;
  left: 60px;
  // display: flex;
  cursor: pointer;
  justify-content: space-between;
}

.time-mask-click {
  width: 720px;
  height: 44px;
  position: absolute;
  left: 60px;
  // display: flex;
  cursor: pointer;
  justify-content: space-between;
  // background-color: rgba(87, 148, 52, 10%);
  background-color: transparent;
}

.stick {
  width: 2px;
  height: 44px;
  background-color: rgb(1, 4, 206);
  pointer-events: none; // 禁止接收鼠标事件
}

.stick-left,
.stick-right {
  width: 2px;
  height: 44px;
  background-color: rgba(1, 4, 206);
  cursor: col-resize;
}

.duration-default {
  background-color: rgba(66, 124, 231, 69.9%);
  position: absolute;
  height: 44px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.duration-click {
  background-color: rgba(66, 124, 231, 69.9%);
  position: absolute;
  height: 44px;
  display: flex;
  justify-content: space-between;
}

.select-footer {
  justify-content: space-evenly;
  border-top: 1px solid red;
  padding: 5px;
  display: flex;
}

</style>