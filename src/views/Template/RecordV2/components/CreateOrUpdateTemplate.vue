<template>
  <div v-loading="submitting" class="app-container">
    <el-page-header content="新建录制模板" @back="back" />
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
            <el-radio :label="3">循环定时录制</el-radio>
            <el-radio :label="4">指定时间录制</el-radio>
            <el-radio :label="2">手动录制</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="form.recordType==3"
        >
          <el-table class="custom-time" border :show-header='false' :cell-class-name="cellClassName" :data="customRecordList" @cell-click="cellClick" style="min-width: 782px; width: 782px; font-size: 12px;">
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
              format="HH:mm"
              :picker-options="pickerOptions"
            />
            <el-popover
              placement="bottom"
              trigger="click"
              width="180"
              popper-class="popover-cus"
              @show="checkCopy"
            >
              <el-checkbox-group
                v-model="checkedDays"
                @change="checkedDayChange"
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
            <el-button><svg-icon name="delete" /></el-button>
          </div>
        </el-form-item>
        <el-form-item label="存储时长:" prop="storageTime" class="record-form-item">
          <el-input v-model.number="form.storageTime" type="number" min="0" oninput="value=value.replace(/[^\d]/g,'')" style="width: 150px;"><span slot="suffix">天</span></el-input>
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
import { time } from 'console'

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
    col: -1
  }

  private currentMouseDownDuration = {
    row: -1,
    col: -1
  }

  private currentStartTime = -1 // min -1：无效
  private currentWeekday = -1 // 1-7  星期一 -- 星期日 -1：未选择或无效

  private durationTime: any = null
  private showOpt = false

  private outRange = false

  private copyDay: any = null

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
    ]
  }

  @Watch('form.recordType', {
    immediate: true
  })
  private onTypeChange() {
    if (+this.form.recordType === 3) {
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
      // 清空
      if (this.weekdays) {
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
  }

  @Watch('showClickWrap', {
    immediate: true
  })
  private onShowClickWrap() {
    this.$nextTick(() => {
      // console.log('click  层', this.showClickWrap)
      if (this.showClickWrap) {
        const clickmask: any = document.getElementsByClassName('time-mask-click')
        for(let i = 0; i < clickmask.length; i++) {
          // 切换到click层，因为没有禁止接受鼠标事件，所以mousedown、Mousemove、mouseup是判断不准目标来源的，只能单独写方法来判断是否需要切换到 drag 层
          clickmask[i].addEventListener('mousedown', this.handleClickMousedown, false)
          clickmask[i].addEventListener('mouseup', this.handleClickMouseup, false)
          clickmask[i].addEventListener('mouseleave', this.handleMouseLeave, false)
        }
        // console.log('click 只绑定 mouse up')
      } else {
        // console.log('.....')
          this.clickMaskStyle.display = 'none'
      }
    })
  }

  @Watch('showDragWrap', {
    immediate: true
  })
  private onShowDragWrap() {
    this.$nextTick(() => {
      // console.log('drag  层', this.showDragWrap)
      if (this.showDragWrap) {
        const customers: any = document.getElementsByClassName('time-mask')
        for(let i = 0; i < customers.length; i++) {
          customers[i].addEventListener('mousedown', this.handleMousedown, true)
          customers[i].addEventListener('mousemove', this.handleMousemove, true)
          customers[i].addEventListener('mouseup', this.handleMouseup, true)
        }
      } else {
        this.dragMaskStyle.display = 'none'
        
      }
    })
  }

  private mounted() {
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
        storageTime: this.formData.storageTime / 60 / 60 / 24 // 秒 --> 天
      }
    }
  }

  private async submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.submitting = true
          // 提交时,不允许操作 模板列表
          this.$emit('on-submit', false)
          let templateId = this.templateId
          if (this.createOrUpdateFlag) {
            const params = {
              ...this.form,
              storageTime: this.form.storageTime * 24 * 60 * 60 // 秒 --> 天
            }
            const res = await createRecordTemplate(params)
            templateId = res.templateId
            this.$message.success('新建模板成功!')
          } else {
            const params = {
              ...this.form,
              storageTime: this.form.storageTime * 24 * 60 * 60 // 秒 --> 天
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
          this.$message.error(e)
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
    } else {
      callback()
    }
  }

  /**
  *
  * 定制录制时长 
  * 
   */
  private cellClick(row: any, column: any, cell: any, event: any) {
    console.log('🎶     🎶', row.index, column.index)
  }

  private cellClassName({row, column, rowIndex, columnIndex}) {
    row.index = rowIndex + 1
    column.index = columnIndex
    return 'cell-' + (rowIndex + 1) + '-' + columnIndex
  }

  private handleMousedown(e: any) {
    console.log('在拖拽区域外释放鼠标🖱 this.moveFlag', this.moveFlag)
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
    // console.log('handleMousedown     ', target, row, this.weekdays[row - 1], pixelOffsetX, e)
    // 还要加一个判断，判断在click层是否点到了duration
    if (this.startTimeValidate(this.weekdays[row - 1], clickTime)) {
      // 显示拖拽层，隐藏点击层
      this.showClickWrap = false
      this.showDragWrap = true
      this.clickMaskStyle.display = 'none'
      this.dragMaskStyle.display = 'flex'
      this.currentStartTime = clickTime
      console.log('人头马    XO ', this.currentStartTime)
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
      console.log('点在了duration上  mousedown 不做识别, 只识别click的 duration, 但是切换是在这里切换 置为点击层 激活寻找对应duration')
      // 设置当前点击点，以方便 click 层判断
      let {row, index} = this.findDuration(e)
      this.currentMouseDownDuration.row = row
      this.currentMouseDownDuration.col = index
      this.showClickWrap = true
      this.showDragWrap = false
      this.clickMaskStyle.display = 'flex'
      this.dragMaskStyle.display = 'none'
      console.log('🔥 ')
      this.resetMouse()
    }
  }

// 拖拽
  private handleMousemove(e: any) {
    if (!this.moveFlag) return
    // console.log('拖拽计算 👈🖱👉  重绘矩形', e.target.classList, e.offsetX, e.layerX)
    // 隐藏OPT
    this.showOpt = false
    // 拖动的时候就开始生成拖选区域
      // 绘制区域
      // 寻找未闭合的duration，即当前duration,并计算数据
      let index = -1
      this.weekdays[this.currentWeekday - 1].map((item: any, i: any) => {
        if (item.moveable) {
          // 数据计算与属性更新
          item = this.dynamicProp(item, e)
          index = i
        }
      })
      // 保存当前duration信息
      console.log('duration   drag 信息', this.currentDragDuration.row, this.currentDragDuration.col, this.currentWeekday, index)
    // }
    // console.log('👈🖱👉  this.outRange', this.outRange) 拦截不到正确的识别信息
  }
  
  private handleMouseup(e: any) {
    console.log('抬起鼠标   this.outRange', this.outRange)
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
    console.log('mouse up       this.outRange   💪', this.outRange, this.currentDragDuration.row, this.currentDragDuration.col)
    !this.outRange && this.weekdays[this.currentWeekday - 1].map((item: any, i: any) => {
      if (item.moveable) {
        // 数据计算与属性更新
        item = this.dynamicProp(item, e)
        item.moveable = false
        // duration start time表示拖拽结束后,duration的开始时间
        // duration end time表示拖拽结束后,duration的结束时间
        item.durationStartTime = item.endX > item.startX ? item.startX * 2 : item.endX * 2
        item.durationEndTime = item.endX > item.startX ? item.endX * 2 : item.startX * 2
        optLeft = item.durationStartTime / 2
        currentMouseupIndex = i
        console.log('拖拽结束   最终的 🔚 duration  ', item)
      }
    })
    // 显示 OPT操作框
    // 设置 stick 激活状态
    this.currentDragRow = this.currentDragDuration.row
    this.currentDragCol = this.currentDragDuration.col
    this.optStyle = {
      'position': 'absolute',
      'left': optLeft + 60 + 'px',
      'top': this.currentDragRow * 44 - 84 + 'px',
      'z-index': 1
    }
    this.showOpt = true
    // 拖拽完成之后就跳转到 click 层
    // 设置 click 层的 stick
    let {row} = this.outRange ? {row: this.currentDragDuration.row} : this.findDuration(e)
    console.log('🐖 row, this.currentDragDuration.col', row, this.currentDragDuration.col)
    this.currentMouseDownDuration.row = row
    // this.currentMouseDownDuration.col = index
    this.currentMouseDownDuration.col = this.outRange ? this.currentDragDuration.col : currentMouseupIndex
    this.showClickWrap = true
    this.showDragWrap = false
    this.clickMaskStyle.display = 'flex'
    this.dragMaskStyle.display = 'none'
    this.currentClickRow = row
    // this.currentClickCol = index
    this.currentClickCol = currentMouseupIndex
    // 给stick绑定拖拽事件，当拖拽的时候切回drag页面
    // 重置
    this.resetMouse()
    // 重置 drag 相关数据
    this.currentDragDuration.row = -1
    this.currentDragDuration.col = -1
    // console.log('hhhh   -')
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
    const clickOffsetX = e.target.offsetLeft // click层用于渲染OPT
    return {target, row, type, clickOffsetX}
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
    console.log('算')
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
  // console.log('检查是否需要切换到 drag 层', e)
  // 直接通过target的class判断
  const target: any = (e.target.className.split(' '))[e.target.className.split(' ').length - 1]
  // console.log('🍃', target.split('-').length)
  const type = target.split('-').length
  if (type === 3) {
    // 切换到 drag 层
    // console.log('切换到 drag 层', e.offsetX)
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
    const {target, row, clickOffsetX} = this.getDurationDomInfo(e)
    this.currentMouseDownDuration.row = row
    this.currentMouseDownDuration.col = +target.split('-')[3]
    this.currentClickRow = this.currentMouseDownDuration.row
    this.currentClickCol = this.currentMouseDownDuration.col
    this.optStyle = {
      'position': 'absolute',
      'left': clickOffsetX + 60 + 'px',
      'top': this.currentClickRow * 44 - 84 + 'px',
      'z-index': 1
    }
    // 设置当前锁定的duration
    this.showOpt = true
    this.resetMouse()
    // 点击之后绘制
  }

  // 当显示 click层后，通过mouse up事件来判断选中了哪个duration
  private handleClickMouseup(e: any) {
    let {row, index, clickOffsetX} = this.findDuration(e)
    // 点击后有移动鼠标到其他非起始duration位置，则不做判定
    if (row !== this.currentMouseDownDuration.row || index !== this.currentMouseDownDuration.col) return
    this.$nextTick(() => {
      // 修改duration样式
      // drag 层过渡到 click 层
      this.currentClickRow = row
      this.currentClickCol = index
      this.optStyle = {
        'position': 'absolute',
        'left': clickOffsetX + 60 + 'px',
        'top': this.currentClickRow * 44 - 84 + 'px',
        'z-index': 1
      }
      this.showOpt = true
      // 重置drag层的stick
      this.currentDragRow = -1
      this.currentDragCol = -1
      this.currentDragDuration.row = -1
      this.currentDragDuration.col = -1
      // console.log('mo   -')
      // this.startPosClickFix === -1
    })
  }

  // 添加按钮
  // private addButton(show: any) {
  //   if (show) {
  //     const ref: any = this.$refs.selector
  //     let popper = ref.$refs.popper.$el
  //     console.log('.....       ', ref, popper)
  //     if (!Array.from(popper.children).some((item: any) => item.className === 'el-cascader-menu__list')) {
  //       const el: any = document.createElement('ul');
  //       el.className = 'el-cascader-menu__list';
  //       el.style = 'border-top: solid 1px #E4E7ED; padding:0; color: #606266;';
  //       el.innerHTML = `<li class="el-cascader-node" style="height:38px;line-height: 38px">
  //       <button class="el-cascader-node__label confirm" style="margin-left: 10px">确定</button>
  //       <button class="el-cascader-node__label reset" style="margin-left: 10px">重置</button>
  //       </li>`
  //       popper.appendChild(el)
  //       el.onclick = (e: any) => {
  //         console.log('⭐', e)
  //       }
  //     }
  //   }
  // }

  // 处理拖拽超出正常区域的情况
  private handleMouseLeave(e: any) {
    const list: any = e.toElement.classList
    console.log('list   e', list, e)
    let inRange = false
    for(let i = 0; i < list.length; i++) {
      if(list[i].indexOf('time-mask') >= 0) {
        inRange = true
        break
      }
    }
    console.log('inrange ', inRange)
    if (!inRange) {
      console.log('拖拽崩了        🦅  最后拖在哪里是哪里')
      this.outRange = true
    } else {
      this.outRange = false
    }

  }

  /**
   *  opt 复制校验
   * */ 
  private checkCopy() {
    // 定位当前duration
    console.log('⛄    复制校验', this.currentClickCol, this.currentClickRow)
  }

  private checkedDayChange() {
    console.log('勾选变化', this.checkedDays)
  }

  private selectClick() {
    console.log('哟西', this.checkedDays)
    // 关闭opt,进行复制和渲染
    this.showOpt = false

  }

  private selectClean() {
    console.log('重置')
  }
}
</script>
<style lang="scss">
.popover-cus {
  padding: 0;
}
</style>
<style lang="scss" scoped>
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
  background-color: rgba(175, 85, 85, 10%);
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
  background-color: rgba(87, 148, 52, 10%);
}

.stick {
  width: 2px;
  height: 44px;
  background-color: black;
  pointer-events: none; // 禁止接收鼠标事件
}

.stick-left,
.stick-right {
  width: 2px;
  height: 44px;
  background-color: turquoise;
  cursor: col-resize;
}

.duration-default {
  background-color: rgba(1, 1, 1, 20%);
  position: absolute;
  height: 44px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.duration-click {
  background-color: rgba(1, 1, 1, 20%);
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