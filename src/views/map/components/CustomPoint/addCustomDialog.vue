<template>
  <el-dialog
    :title="`${isUpdated ? '编辑' : '新建'}${activeInfo.label}`"
    :visible="showAddDialog"
    :append-to-body="true"
    width="600px"
    :before-close="handleClose"
    :destroy-on-close="true"
  >
    <el-form ref="pointForm" :model="pointForm" label-width="110px" :rules="formRules">
      <el-form-item :label="activeInfo.sortName" prop="tagName">
        <el-input v-model.trim="pointForm.tagName" :placeholder="`请输入${activeInfo.sortName}`" />
      </el-form-item>
      <el-form-item label="备注" prop="description">
        <el-input
          v-model="pointForm.description"
          type="textarea" maxlength="60" show-word-limit
          :autosize="{minRows: 4, maxRows: 4}"
        />
      </el-form-item>
      <el-form-item label="坐标点">
        <div class="custom-point-item">
          <el-row
            v-for="(item,index) in pointForm.points"
            :key="index"
            :class="{'custom-point-item__box': activeInfo.name !=='InterestPoint' || showError}"
          >
            <el-col :span="10">
              <el-form-item
                :prop="`longlat${[index]}`"
                :rules="{validator: (rule,val,cb) => validateLonglat(rule,val,cb,item), trigger: 'blur'}"
              >
                <el-input v-model="item.longitude" class="custom-point-box__info" placeholder="请输入经度" />
              </el-form-item>
            </el-col>
            <el-col :span="1" style="text-align: center;">:</el-col>
            <el-col :span="10">
              <el-form-item
                :prop="`longlat${[index]}`"
                :rules="{validator: (rule,val,cb) => validateLonglat(rule,val,cb,item), trigger: 'blur'}"
              >
                <el-input v-model="item.latitude" class="custom-point-box__info" placeholder="请输入纬度" />
              </el-form-item>
            </el-col>
            <el-col v-if="activeInfo.name !=='InterestPoint'" :span="3" style="text-align: center;">
              <el-button type="text" @click.prevent="removeThis(item,index)">删除</el-button>
            </el-col>
          </el-row>
        </div>
      </el-form-item>
      <el-form-item v-if="activeInfo.name !=='InterestPoint'" class="custom-point-item__addBtn">
        <el-button class="custom-point-btn" @click="addPoints">添加坐标点</el-button>
      </el-form-item>
      <el-form-item v-if="activeInfo.name ==='InterestPoint'" label="类型">
        <el-select v-model="pointForm.colorType" placeholder="请选择气泡类型">
          <el-option label="气泡" value="bubble" />
          <el-option label="文本" value="text" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="activeInfo.name ==='InterestPoint'" label="颜色">
        <el-select v-model="pointForm.color" placeholder="请选择气泡颜色">
          <el-option v-for="item in colorList" :key="item.label" :label="item.label" :value="item.color">
            <span class="custom-point-option-color" :style="`background-color: ${item.color}`" />
            <span class="custom-point-option">{{ item.label }}</span>
          </el-option>
        </el-select>
        <span class="custom-point-color-info" :style="`background-color: ${pointForm.color}`">{{ pointForm.color }}</span>
      </el-form-item>
    </el-form>
    <span slot="footer" class="custom-point-dialog-footer">
      <el-button type="primary" @click="sureThis">确 定</el-button>
      <el-button @click="cancelThis">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { addInterestPoint, editInterestPoint } from '@/api/map'

@Component({
  name: 'addCustomDialog',
  components: {
  }
})

export default class addCustomDialog extends Vue {
  @Prop() private activeInfo: any
  @Prop() private showAddDialog: boolean
  @Prop() private customPointInfo: any
  @Prop() private isUpdated: boolean
  // @Prop() private editData: any
  @Prop() private pointData: any

  private pointForm: any = {}

  private formRules: any = {}

  private showError: boolean = false

  private colorList = [
    { label: '#1e78e0', color: '#1e78e0' },
    { label: '#007f1b', color: '#007f1b' },
    { label: '#eab809', color: '#eab809' },
    { label: '#ee5007', color: '#ee5007' },
    { label: '#b22727', color: '#b22727' },
    { label: '#a85cf9', color: '#a85cf9' },
    { label: '#5534a5', color: '#5534a5' },
    { label: '#4b7be5', color: '#4b7be5' }
  ]
  // [{
  //   color: '#1e78e0',
  //   label: '#1e78e0'
  // }, {
  //   color: '#19a22b',
  //   label: '#19a22b'
  // }, {
  //   color: '#ab3312',
  //   label: '#ab3312'
  // }, {
  //   color: '#ffaa00',
  //   label: '#ffaa00'
  // }]

  private mounted() {
    this.setEditData()
    this.formRules = {
      tagName: [
        { required: true, message: `请输入${this.activeInfo.sortName}`, trigger: 'blur' }
      ]
    }
  }

  private setEditData() {
    if (this.isUpdated) {
      const { tagName, type, description, points, color, colorType } = this.pointData
      this.pointForm = {
        tagName,
        type,
        description,
        points,
        color,
        colorType
      }
    } else {
      this.pointForm = {
        points: [{ longitude: '0.000000', latitude: '0.000000' }],
        color: this.colorList[0].color,
        colorType: 'bubble'
      }
    }
  }

  private validateLonglat(rule: any, value: string, callback: Function, item: any) {
    if (!/^[-+]?(0(\.\d{1,10})?|([1-9](\d)?)(\.\d{1,10})?|1[0-7]\d{1}(\.\d{1,10})?|180\.0{1,10})$/.test(item.longitude)) {
      this.showError = true
      callback(new Error('经度坐标格式错误'))
    } else if (!/^[-+]?((0|([1-9]\d?))(\.\d{1,10})?|90(\.0{1,10})?)$/.test(item.latitude)) {
      this.showError = true
      callback(new Error('纬度坐标格式错误'))
    } else {
      this.showError = false
      callback()
    }
  }

  private sureThis() {
    const form: any = this.$refs.pointForm
    form.validate((val: any) => {
      if (!val) return
      const param = {
        tagName: this.pointForm.tagName,
        type: this.activeInfo.name,
        description: this.pointForm.description,
        mapId: this.customPointInfo.mapId,
        points: this.pointForm.points,
        color: this.pointForm.color,
        colorType: this.pointForm.colorType
      }
      if (this.isUpdated) {
        const { tagId } = this.pointData
        editInterestPoint({ ...param, tagId }).then(() => {
          this.$message.success('编辑成功')
          this.$parent.freshList()
        }).catch(err => {
          this.$message.error(`${err.message ? err.message : err}`)
        })
      } else {
        addInterestPoint(param).then(() => {
          this.$message.success('新增成功')
          this.$parent.freshList()
        }).catch(err => {
          this.$message.error(`${err.message ? err.message : err}`)
        })
      }
    })
  }

  private cancelThis() {
    const form: any = this.$refs.pointForm
    form.clearValidate()
    form.resetFields()
    this.$parent.closeThis()
  }

  private handleClose() {
    const form: any = this.$refs.pointForm
    form.clearValidate()
    form.resetFields()
    this.$parent.closeThis()
  }

  private addPoints() {
    this.pointForm.points.push({ longitude: '0.000000', latitude: '0.000000' })
  }

  private removeThis(item: any, idx: number) {
    this.pointForm.points.splice(idx, 1)
  }
}
</script>

<style lang="scss" scoped>
.custom-point-btn {
  width: 100%;
}

.custom-point-item {
  max-height: 300px;
  height: 100%;
  overflow-y: auto;

  &__box {
    margin-bottom: 22px;
  }

  &__addBtn {
    margin-top: -24px;
  }
}

.custom-point-color-info {
  display: inline-block;
  padding: 10px 20px;
  margin-left: 20px;
  font-size: 14px;
  line-height: 14px;
  color: #fff;
}

.custom-point-option {
  float: right;
  height: 34px;
  line-height: 34px;
}

.custom-point-option-color {
  display: inline-block;
  width: 10px;
  height: 10px;
}

::v-deep .el-dialog__footer {
  text-align: center;
}
</style>
