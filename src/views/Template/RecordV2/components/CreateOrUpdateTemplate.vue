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
          <!-- 遮罩层  （星期 --- 时间段） -->
          <div class="time-mask" :class="'row' + '-' + (i + 1)" :style="{'top': i * 44 + 'px'}" v-for="weekday, i in weekdays" :key="i">
            <span v-for="duration, index in weekday" :key="index" :style="duration.durationStyle">
              <span v-if="stickVisiable" class="stick"/>
              <span v-if="stickVisiable" class="stick"/>
            </span>
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
  private stickVisiable = false

  private currentStartTime = -1 // min -1：无效
  private currentWeekday = -1 // 1-7  星期一 -- 星期日 -1：未选择或无效

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
        console.log('customers   ', customers)
        for(let i = 0; i < customers.length; i++) {
          customers[i].addEventListener('mousedown', this.handleMousedown)
          customers[i].addEventListener('mousemove', this.handleMousemove)
          customers[i].addEventListener('mouseup', this.handleMouseup)
        }
      })
      
    }
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
    // console.log('row', row)
    // console.log('column', column)
    row.index = rowIndex + 1
    column.index = columnIndex
    return 'cell-' + (rowIndex + 1) + '-' + columnIndex
    // const test = document.getElementById(column)
    // console.log('test    ', test)
  }

  private handleMousedown(e: any) {
    // 确定单元格
    const target: any = (e.target.className.split(' '))[e.target.className.split(' ').length - 1]
    const row = target.split('-')[1]
    // console.log('🐂🍺  X  Y  ', e, row)
    // 计算时间
    let pixelOffsetX =  e.offsetX > 0 ? e.offsetX : 0
    let pixelOffsetY =  e.offsetY > 0 ? e.offsetY : 0
    // 起始时间
    let clickTime = pixelOffsetX * 2 // 分钟
    // let weekdayList = this.setWeekday(row)
    // let weekdayList = this.weekdays[row - 1]
    // 判断是否可以作为有效起始时间
    // if (this.startTimeValidate(weekdayList, clickTime)) {
    if (this.startTimeValidate(this.weekdays[row - 1], clickTime)) {
      this.currentStartTime = clickTime
      // this.startPos = e.clientX // 当前次拖动的开始位置
      this.startPos = e.offsetX // 当前次拖动的开始位置
      // 固定当前所在行
      this.currentWeekday = row
      // 允许拖拽
      this.moveFlag = true
      // 创建时间段单元
      let duration: any = {
        startX: this.startPos,
        endX: this.startPos,
        durationStyle: {
          'width': 0, // 初始
          'left': this.startPos + 'px',
          'background-color': 'rgba(1,1,1,0.2)',
        },
        startTime: clickTime, // 分钟
        endTime: -1,
        moveable: true
      }
      // this.$set(duration.durationStyle, 'left', e.clientX)
      // weekdayList.push(duration)
      this.weekdays[row - 1].push(duration)
      console.log('duration.durationStyle 🤡', duration.durationStyle.left)
    } else {
      // 无效判定\重置
      this.resetMouse()
    }
  }

// 拖拽
  private handleMousemove(e: any) {
    if (!this.moveFlag) return
    // 拖动的时候就开始生成拖选区域
    if (e.clientX != this.startPos) {
      // 绘制区域
      console.log('拖拽计算   重绘矩形', e.clientX, e.offsetX, e.layerX)
      // 寻找未闭合的duration，即当前duration,并计算数据
      // this.setWeekday(this.currentWeekday).map((item: any, i: any) => {
      this.weekdays[this.currentWeekday - 1].map((item: any, i: any) => {
        if (item.moveable) {
          this.stickVisiable = true
          // 数据计算与属性更新
          item = this.dynamicProp(item, e)
          // console.log('👈🖱👉   item', item)
        }
      })
    }
    // 拖动后渲染中间部分和结束stick的移动
  }
  
  private handleMouseup(e: any) {
    // console.log('👆      ', e)
    // 如果结束点位置和开始点一致，删除绘制
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

  // 属性计算和更新
  private dynamicProp(currentDuration: any,e: any) {
    let pixelOffsetX =  e.offsetX > 0 ? e.offsetX : 0
    // let width = Math.abs(currentDuration.startX - e.clientX) // duration 宽度
    let width = Math.abs(currentDuration.startX - e.offsetX) // duration 宽度
    currentDuration.durationStyle.width = width + 'px'
    currentDuration.durationStyle.left = Math.min(pixelOffsetX, +((currentDuration.durationStyle.left).slice(0,-2))) + 'px'
    // this.$set(currentDuration.durationStyle, 'left', Math.min(pixelOffsetX, currentDuration.durationStyle.left) + 'px')
    currentDuration.startTime = Math.min(pixelOffsetX * 2, currentDuration.startTime)
    currentDuration.endTime = Math.max(pixelOffsetX * 2, currentDuration.startTime)
    currentDuration.endX = e.clientX
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
    return weekdayList.filter((item: any) => {
      return item.start <= currentTime && currentTime <= item.end
    })
  }

  // //将数据压入对应星期
  // private setWeekday(row: number, duration: any) {
  //   switch(row) {
  //     case 1:
  //       this.MonList.push(duration)
  //       break
  //     case 2:
  //       this.TusList.push(duration)
  //       break
  //     case 3:
  //       this.WesList.push(duration)
  //       break 
  //     case 4:
  //       this.ThrList.push(duration)
  //       break 
  //     case 5:
  //       this.FriList.push(duration)
  //       break 
  //     case 6:
  //       this.StrList.push(duration)
  //       break 
  //     case 7:
  //       this.SunList.push(duration)
  //       break
  //   }
  // }

  // 选中选择时间段，显示stick
  private showStick(e) {
    console.log('点击  哪个duration   🚀', e)
  }
}
</script>
<style lang="scss" scoped>
.time-mask {
  width: 720px;
  height: 44px;
  background-color: rgba(175, 85, 85, 50%);
  position: absolute;
  left: 60px;
  display: flex;
  cursor: pointer;
  justify-content: space-between;
}

.stick {
  width: 2px;
  height: 44px;
  background-color: black;
  cursor: col-resize;
}
</style>