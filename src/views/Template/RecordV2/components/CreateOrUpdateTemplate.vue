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
          <el-table class="custom-time" border :show-header='false' :cell-class-name="cellClassName" :data="customRecordList" @cell-click="cellClick" style="width: 781px; font-size: 12px;">
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
              <span v-if="i+1===currentDragRow && index===currentDragCol" class="stick" />
              <span v-if="i+1===currentDragRow && index===currentDragCol" class="stick" />
            </span>
          </div>
          <!-- 遮罩层2 点击事件 -->
          <!-- 是否触发了点击层，应该在 mouse down 和 mouse up 的时候一起判断以区分拖拽和点击 -->
          <div class="time-mask-click" :class="'row-' + (i + 1) + '-click'" :style="{'top': i * 44 + 'px', 'display': clickMaskStyle.display}" v-for="weekday, i in weekdays" :key="i+0.1">
            <span v-for="duration, index in weekday" :key="index+0.2" class="duration-click" :class="'row-'+(i+1)+'-col-'+index+'-click'" :style="duration.durationStyle" @click="clickDuration">
              <span v-if="i+1===currentClickRow && index===currentClickCol" class="stick"/>
              <span v-if="i+1===currentClickRow && index===currentClickCol" class="stick"/>
            </span>
          </div>
          <!-- duration上方操作栏与遮罩层2绑定出现 -->
          <div class="operation-mask" v-if="showOpt">
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
            <el-select v-model="copyDay" multiple collapse-tags placeholder="复制到">
              <el-option 
                v-for="day in week"
                :key="day.value"
                :label="day.label"
                :value="day.value"
                :disabled="day.disabled"
              />
            </el-select>
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

  private startPos = -1
  private moveFlag = false

  private currentDragRow = -1
  private currentDragCol = -1
  private currentClickRow = -1
  private currentClickCol = -1

  private currentStartTime = -1 // min -1：无效
  private currentWeekday = -1 // 1-7  星期一 -- 星期日 -1：未选择或无效

  private durationTime: any = null
  private showOpt = false

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

  private week = [
    {
      value: '星期一',
      label: '星期一',
      disabled: false
    },
    {
      value: '星期二',
      label: '星期二',
      disabled: false
    },
    {
      value: '星期三',
      label: '星期三',
      disabled: false
    },
    {
      value: '星期四',
      label: '星期四',
      disabled: false
    },
    {
      value: '星期五',
      label: '星期五',
      disabled: false
    },
    {
      value: '星期六',
      label: '星期六',
      disabled: false
    },
    {
      value: '星期日',
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
          customers[i].addEventListener('mouseup', this.handleMouseup, true)
        }
      })
      
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
      console.log('click  层', this.showClickWrap)
      if (this.showClickWrap) {
        const clickmask: any = document.getElementsByClassName('time-mask-click')
        for(let i = 0; i < clickmask.length; i++) {
          clickmask[i].addEventListener('mousedown', this.handleMousedown, true)
          // clickmask[i].addEventListener('mousemove', this.handleMousemove, true)
          clickmask[i].addEventListener('mouseup', this.handleClickMouseup, true)
        }
      } else {
        console.log('.....')
          this.clickMaskStyle.display = 'none'
      }
    })
  }

  @Watch('showDragWrap', {
    immediate: true
  })
  private onShowDragWrap() {
    this.$nextTick(() => {
      console.log('drag  层', this.showDragWrap)
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
    console.log('handleMousedown     ', target, row, this.weekdays[row - 1])
    if (this.startTimeValidate(this.weekdays[row - 1], clickTime)) {
      // 显示拖拽层，隐藏点击层
      console.log('点在了 可拖拽区域   置为 drag 层')
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
      console.log('点在了duration上    置为点击层 激活寻找对应duration')
      this.showClickWrap = true
      this.showDragWrap = false
      this.clickMaskStyle.display = 'flex'
      this.dragMaskStyle.display = 'none'
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
      this.weekdays[this.currentWeekday - 1].map((item: any, i: any) => {
        if (item.moveable) {
          // 数据计算与属性更新
          item = this.dynamicProp(item, e)
        }
      })
    // }
    // 拖动后渲染中间部分和结束stick的移动
  }
  
  private handleMouseup(e: any) {
    if (!this.moveFlag) return
    console.log('👆      ', e.offsetX)
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
    this.weekdays[this.currentWeekday - 1].map((item: any, i: any) => {
      if (item.moveable) {
        // 数据计算与属性更新
        item = this.dynamicProp(item, e)
        item.moveable = false
        console.log('最终的 🔚 duration', e, item)
      }
    })
    // 重置
    this.resetMouse()
    // 固定结束sitck、更新比对数据信息
  }

  // 当显示 click层后，通过mouse up事件来判断选中了哪个duration
  private handleClickMouseup(e: any) {
    console.log('click 层的 mmouse up', e)
    let {row, index} = this.findDuration(e)
    // 修改duration样式
    this.currentClickRow = row
    this.currentClickCol = index
    // 重置drag层的stick
    this.currentDragRow = -1
    this.currentDragCol = -1
  }

  // 寻找特定duration
  private findDuration(e: any) {
     // 确定单元格
    const target: any = (e.target.className.split(' '))[e.target.className.split(' ').length - 1]
    const row = target.split('-')[1]
    console.log('target   ', target)
    // 计算时间
    let pixelOffsetX =  e.offsetX > 0 ? e.offsetX : 0
    // 起始时间
    let clickTime = pixelOffsetX * 2 // 分钟
    // 确定duration
    let index = -1
    console.log('find   row  this.weekdays[row - 1]', row, this.weekdays[row - 1])
    this.weekdays[row - 1].map((item: any, i: any) => {
      if (item.startTime <= clickTime && item.endTime >= clickTime) index = i
    })
    return {
      row: row,
      index: index
    }
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
      currentDuration.endTime = Math.max(currentTime, this.currentStartTime)
      currentDuration.startTime = Math.min(currentTime, this.currentStartTime)
    }
    currentDuration.durationStyle.width = width + 'px'
    // 拖拽时显示 对应 duration 的 stick
    let {row, index} = this.findDuration(e)
    console.log('row index', row, index)
    this.currentDragRow = row
    this.currentDragCol = index
    // 重置click层的stick
    this.currentClickRow = -1
    this.currentClickCol = -1
    const duration: any = document.getElementsByClassName('row-'+row+'-col-'+index)
    return currentDuration
  }

  // 重置
  private resetMouse() {
    this.moveFlag = false
    this.currentStartTime = -1
    this.currentWeekday = -1
    this.startPos = -1
  }

  // 校验起始时间有效性
  private startTimeValidate(weekdayList: any, currentTime: number) {
    console.log('🐻  weekdayList   click   drag ', weekdayList, this.clickMaskStyle.display, this.dragMaskStyle.display)
    if (weekdayList.length === 0) return true
    return !weekdayList.some((item: any) => {
      return item.startTime <= currentTime && currentTime <= item.endTime
    })
  }

  // 校验拖拽时间有效性
  private dragTimeValidate(weekdayList: any, currentTime: number, fixTime: number) {
    if (weekdayList.some((item: any) => {
      return currentTime < item.endTime && !item.moveable && fixTime > item.endTime
    })) {
      // 找到左侧 endTime 最大值
      let timeList = []
      weekdayList.map((item: any) => {
        if (currentTime <= item.endTime && !item.moveable && fixTime > item.endTime) timeList.push(item.endTime)
      })
      let maxTime = Math.max(...timeList)
      return {
        type: 1,
        left: maxTime / 2,
        currentTime: maxTime
      }
    }
    // 与右边界重叠
    if (weekdayList.some((item: any) => {
      return currentTime > item.startTime && !item.moveable && fixTime < item.startTime
    })) {
      // 找到右侧 startTime 最小值
      let timeList = []
      weekdayList.map((item: any) => {
        if (currentTime >= item.startTime && !item.moveable && fixTime < item.startTime) timeList.push(item.startTime)
      })
      let minTime = Math.min(...timeList)
      return {
        type: 2,
        left: minTime / 2,
        currentTime: minTime
      }
    }
    return {
      type: 3
    }
  }

  // 点击duration
  private clickDuration(e) {
    console.log('点击啦     ⚡', e)
    // 显示点击层，隐藏拖拽层
    this.showClickWrap = true
    this.showDragWrap = false
    this.showOpt = true
    this.clickMaskStyle.display = 'flex'
    this.dragMaskStyle.display = 'none'
    // 点击之后绘制
  }
}
</script>
<style lang="scss" scoped>
.time-mask {
  width: 720px;
  height: 44px;
  background-color: rgba(175, 85, 85);
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
  background-color: rgba(87, 148, 52);
}

.stick {
  width: 2px;
  height: 44px;
  background-color: black;
  pointer-events: none; // 禁止接收鼠标事件
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
  background-color: rgba(1, 1, 1, 20%);
}
</style>