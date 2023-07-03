<template>
  <el-form-item label="检测项" prop="algorithmMetadata.clothesDetectItems">
    <template slot="label">
      检测项
      <el-popover
        placement="top-start"
        width="300"
        trigger="hover"
        :open-delay="400"
        content="已勾选的类别将视为正确穿戴，AI应用不会产生告警。"
      >
        <svg-icon slot="reference" class="form-question" name="help" />
      </el-popover>
    </template>
    <el-radio-group v-if="isCustomClothModel" v-model="type" @input="typeChange">
      <el-radio v-for="(value, key) in types" :key="key" :label="key">{{ value }}</el-radio>
    </el-radio-group>
    <div>
      <el-checkbox-group ref="clothes" v-model="clothes" @change="clothChange">
        <el-checkbox v-for="(value, key) in colors" :key="key" class="inside-pic" :label="key" border>
          <div class="img">
            <div class="sub-img">
              <!-- <el-image :src="require(`@vss/ai/assets/costume/` + key + '.png')" /> -->
              <el-image :src="require('../../../assets/costume/' + key + '.png')" />
            </div>
            <div class="label"> {{ value }}</div>
          </div>
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <div v-if="error.length > 0" class="error-msg">{{ error }}</div>
  </el-form-item>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { CostumColors } from '@vss/ai/dics/contants'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'form',
  components: {}
})
export default class extends Vue {
  @Prop() private form!: any
  @Prop() private error: string
  private types = {
    1: '工作服模型1',
    2: '工作服模型2'
  }

  private type = '1'
  private manualChange = false

  private clothes = []

  private get isCustomClothModel() {
    return UserModule.tags && UserModule.tags.customClothModel && UserModule.tags.customClothModel === 'Y'
  }

  private get colors() {
    return CostumColors[this.type]
  }

  @Watch('form.algorithmMetadata.clothesDetectItems', { immediate: true })
  private clothesDetectItems() {
    if (this.manualChange) {
      return
    }
    if (!this.isCustomClothModel) {
      this.type = '2'
    }
    if (this.form.algorithmMetadata.clothesDetectItems.length > 0){
      this.clothes = this.form.algorithmMetadata.clothesDetectItems.map(item => {
        this.type = item[0]
        return item.split('_')[1]
      })
    } else if (!this.manualChange) {
      // 非编辑状态，默认全选
      this.clothes = Object.getOwnPropertyNames(this.colors)
      this.clothChange(this.clothes)
    }
  }

  @Watch('error')
  private onError(){
    if (this.error.length > 0){
      // @ts-ignore
      this.$refs.clothes.$el.classList.add('error')
    } else {
      // @ts-ignore
      this.$refs.clothes.$el.classList.remove('error')
    }
  }

  private clothChange(value) {
    this.manualChange = true
    const cloth_type = value.map(item => this.type + '_' + item)
    this.$set(this.form.algorithmMetadata, 'clothesDetectItems', cloth_type )
  }

  private typeChange() {
    this.manualChange = true
    this.clothes = []
    this.$set(this.form.algorithmMetadata, 'clothesDetectItems', [] )
  }
}
</script>
<style lang="scss" scoped>
.el-form-item {
  padding-top: 10px;
}

.inside-pic {
  height: fit-content !important;
  position: relative;
  padding: 0 !important;
  line-height: 0;
  z-index: 2;

  ::v-deep .el-checkbox__input {
    position: absolute;
    bottom: -23px;
    left: 8px;
  }

  ::v-deep .el-checkbox__label {
    padding: 0 18px;
    font-size: 0;
  }

  .img {
    position: relative;
    display: flex;

    .sub-img {
      width: 44px;
      height: 80px;

      .el-image {
        width: 100%;
        height: 100%;
      }
    }

    .label {
      position: absolute;
      left: 7px;
      bottom: -22px;
    }

    .light {
      background: grey;
    }

    .blue {
      background: blue;
    }

    .red {
      background: red;
    }

    .dark {
      background: black;
    }

    .orange {
      background: orange;
    }

    .bust {
      background: rgb(60, 143, 13);
    }

    .others {
      background: rgb(148, 113, 130);
    }
  }
}

.el-checkbox-group {
  position: relative;
  margin-top: 10px;
  min-width: 585px;
  z-index: 2;

  &:after {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    display: block;
    width: 585px;
    height: 120px;
    background: #f8f8f8;
    border: 1px solid rgba(221, 221, 221, 100%);
    border-radius: 2px;
  }
}

.error:after {
  content: '';
  border: 1px solid #f5212d;
}

.error-msg {
  margin-top: 5px;
  font-size: 12px;
  color: #f5212d;
}

</style>
