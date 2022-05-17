<template>
  <el-dialog
    :title="`新建${activeInfo.label}`"
    :visible="showAddDialog"
    :append-to-body="true"
    width="600px"
    :before-close="handleClose"
  >
    <el-form ref="pointForm" :model="pointForm" label-width="110px" :rules="formRules">
      <el-form-item :label="activeInfo.sortName" prop="tagName">
        <el-input v-model="pointForm.tagName" :placeholder="`请输入${activeInfo.sortName}`" />
      </el-form-item>
      <el-form-item label="备注" prop="description">
        <el-input v-model="pointForm.description" />
      </el-form-item>
      <el-form-item label="坐标点">
        <div class="custom-point-item">
          <el-row
            v-for="(item,index) in pointForm.points"
            :key="index"
            class="custom-point-item__box"
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
            <el-col :span="3" style="text-align: center;">
              <el-button type="text" @click.prevent="removeThis(item,index)">删除</el-button>
            </el-col>
          </el-row>
        </div>
      </el-form-item>
      <el-form-item class="custom-point-item__addBtn">
        <el-button class="custom-point-btn" @click="addPoints">添加坐标点</el-button>
      </el-form-item>
    </el-form>
    <span slot="footer" class="custom-point-dialog-footer">
      <el-button type="primary" @click="sureThis">确 定</el-button>
      <el-button @click="cancelThis">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { addInterestPoint } from '@/api/map'

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
      const { tagName, type, description, points } = this.pointData
      this.pointForm = {
        tagName,
        type,
        description,
        points
      }
    } else {
      this.pointForm = {
        points: [{ longitude: '0.000000', latitude: '0.000000' }]
      }
    }
  }

  private validateLonglat(rule: any, value: string, callback: Function, item: any) {
    if (!/^[-+]?(0(\.\d{1,10})?|([1-9](\d)?)(\.\d{1,10})?|1[0-7]\d{1}(\.\d{1,10})?|180\.0{1,10})$/.test(item.longitude)) {
      callback(new Error('经度坐标格式错误'))
    } else if (!/^[-+]?((0|([1-9]\d?))(\.\d{1,10})?|90(\.0{1,10})?)$/.test(item.latitude)) {
      callback(new Error('纬度坐标格式错误'))
    } else {
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
        points: this.pointForm.points
      }
      addInterestPoint(param).then(() => {
        this.$parent.freshList()
      }).catch(err => console.log(err))
    })
  }

  private cancelThis() {
    this.$parent.closeThis()
  }

  private handleClose() {
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

::v-deep .el-dialog__footer {
  text-align: center;
}
</style>
