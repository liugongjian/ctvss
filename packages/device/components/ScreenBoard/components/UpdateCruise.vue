<template>
  <el-dialog
    :title="isCreate ? '创建巡航路径' : `${currentName}配置`"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="600px"
    center
    @close="closeDialog"
  >
    <el-form
      ref="dataForm"
      v-loading="loading.form"
      :model="form"
      :rules="rules"
      label-position="right"
      label-width="100px"
      @submit.native.prevent
    >
      <el-form-item label="路径名称:" prop="cruiseName">
        <el-input v-model="form.cruiseName" />
        <div class="form-tip">1-10位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。</div>
      </el-form-item>
      <el-form-item label="巡航速度:" prop="speed">
        <el-slider
          v-model="form.speed"
          :min="1"
          :max="40"
          :show-input="true"
          :show-input-controls="false"
        />
      </el-form-item>
      <el-form-item label="停留间隔:" prop="holdTime">
        <el-input v-model="form.holdTime" class="time-input" /> 秒
        <div class="form-tip">支持120-3600秒。</div>
      </el-form-item>
      <el-form-item label="巡航列表:" prop="path">
        <div class="path-list">
          <div class="path-list__header">
            预置位
            <el-button type="text" title="添加" @click="addItem"><i class="el-icon-plus" /></el-button>
          </div>
          <div class="path-list__content">
            <div
              v-for="(item, index) in form.pathList"
              :key="index"
              class="path-list__item"
            >
              <el-form-item label-width="0" :prop="'pathList.' + index" :rules="rules.pathIem">
                <el-select v-model="form.pathList[index]" size="mini" filterable>
                  <el-option
                    v-for="(preset, presetIndex) in presets"
                    :key="presetIndex"
                    :label="preset.name"
                    :value="preset.value"
                  />
                </el-select>
                <!-- <el-input v-model="form.pathList[index]" size="mini" /> -->
                <el-button type="text" title="删除" @click="deleteItem(index)"><i class="el-icon-minus" /></el-button>
              </el-form-item>
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="loading.submit" @click="submit">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { describeDevicePresets, describePTZCruise, updatePTZCruise } from '../../../api/ptz_control'

@Component({
  name: 'CreateDir'
})
export default class extends Vue {
  @Prop()
  private isCreate?: boolean
  @Prop()
  private currentIndex?: any
  @Prop()
  private currentName?: any
  @Prop()
  private deviceId?: any
  private dialogVisible = true
  private loading: any = {
    form: false,
    submit: false
  }
  private form: any = {
    cruiseName: '',
    speed: 20,
    holdTime: '',
    path: '',
    pathList: []
  }
  private presets: Array<any> = []
  private rules = {
    cruiseName: [
      { required: true, message: '请填写路径名称', trigger: 'blur' },
      { validator: this.validateName, trigger: 'blur' }
    ],
    holdTime: [
      { required: true, message: '请填写停留间隔', trigger: 'blur' },
      { validator: this.validateTime, trigger: 'blur' }
    ],
    path: [
      { required: true, message: '巡航列表不能为空', trigger: 'blur' }
    ],
    pathIem: [
      { required: true, message: '请选择预置位', trigger: 'blur' }
      // { validator: this.validatePathItem, trigger: 'blur' }
    ]
  }

  private mounted() {
    this.init()
  }

  private async init() {
    this.form.cruiseName = `巡航路径${this.currentIndex}`
    try {
      this.loading.form = true
      await this.initPresets()
      if (!this.isCreate) {
        const res: any = await describePTZCruise({
          deviceId: this.deviceId,
          cruiseId: this.currentIndex
        })
        const cruisePath = res.cruisePresets?.map(cruise => {
          return cruise.presetId
        })
        this.form = {
          ...res,
          speed: parseInt(res.speed),
          pathList: cruisePath,
          path: cruisePath ? cruisePath.join(',') : ''
        }
      }
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading.form = false
    }
  }

  // 初始化预置位列表
  private async initPresets() {
    const res = await describeDevicePresets({ deviceId: this.deviceId })
    this.presets = Array.from({ length: 255 }, (value, index) => {
      const found = res.presets.find((preset: any) => preset.presetId === (index + 1).toString())
      return {
        setFlag: !!found,
        name: found?.presetName || `预置位 ${index + 1}`,
        value: (index + 1).toString()
      }
    }).filter((preset: any) => preset.setFlag)
  }

  private addItem() {
    this.form.pathList.push('')
  }

  private deleteItem(index: number) {
    this.form.pathList.splice(index, 1)
  }

  private async submit() {
    this.form.path = this.form.pathList.join(',')
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.loading.submit = true
          await updatePTZCruise({
            cruiseId: this.currentIndex.toString(),
            deviceId: this.deviceId,
            cruiseName: this.form.cruiseName,
            holdTime: this.form.holdTime,
            speed: this.form.speed.toString(),
            cruises: this.form.pathList.map(presetId => {
              return {
                presetId
              }
            })
          })
          this.$message({
            type: 'success',
            message: '设置成功'
          })
          this.closeDialog(true)
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.loading.submit = false
        }
      }
    })
  }

  private closeDialog(isRefresh = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }

  private validateName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-()（）_\s]{1,10}$/u.test(value)) {
      callback(new Error('名称格式错误'))
    } else if (/^[\s]|[\s]$/.test(value)) {
      callback(new Error('不能以空格作为名称的首尾。'))
    } else {
      callback()
    }
  }

  private validateTime(rule: any, value: any, callback: Function) {
    if (!/^[0-9]*$/.test(value)) {
      callback(new Error('时间格式错误'))
    } else if (value < 120 || value > 3600) {
      callback(new Error('仅支持120-3600秒'))
    } else {
      callback()
    }
  }

  // private validatePathItem(rule: any, value: any, callback: Function) {
  //   if (!/^[0-9]*$/.test(value)) {
  //     callback(new Error('格式错误'))
  //   } else if (value < 1 || value > 255) {
  //     callback(new Error('仅支持1-255'))
  //   } else {
  //     callback()
  //   }
  // }
}
</script>
<style lang="scss" scoped>
.el-form {
  ::v-deep {
    .el-slider.el-slider--with-input {
      .el-slider__input {
        width: 50px;
      }

      input {
        padding-left: 4px;
        padding-right: 4px;
      }
    }

    .el-slider__runway.show-input {
      margin-right: 60px;
    }
  }

  .time-input {
    width: 80px;
    margin-right: 10px;
  }

  .path-list {
    border: 1px solid #dcdfe6;
    border-radius: 5px;
    text-align: center;
    height: 200px;

    &__header {
      width: 90%;
      display: inline-block;
      border-bottom: 1px solid #dcdfe6;
      margin-bottom: 15px;

      .el-button {
        margin-left: 10px;
      }
    }

    &__content {
      height: 145px;
      overflow: auto;
    }

    &__item {
      height: 50px;
      line-height: 50px;

      .el-select {
        width: 120px;
        margin-right: 10px;
      }

      ::v-deep {
        .el-input__inner {
          text-align: center;
        }

        .el-form-item__error {
          left: 25%;
          top: calc(100% - 6px);
        }
      }
    }
  }
}
</style>
