<template>
  <el-form-item label="检测项" prop="algorithmMetadata.clothesDetectItems">
    <el-radio-group v-model="type" @input="typeChange">
      <el-radio v-for="(value, key) in types" :key="key" :label="key">{{ value }}</el-radio>
    </el-radio-group>
    <div>
      <el-checkbox-group ref="clothes" v-model="clothes" @change="clothChange">
        <el-checkbox v-for="(value, key) in colors" :key="key" class="inside-pic" :label="key" border>
          <div class="img">
            <div class="sub-img">
              <el-image :src="require('@vss/ai/assets/costume/' + key + '.png')" />
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

  private clothes = []

  @Watch('form.algorithmMetadata.clothesDetectItems', { immediate: true })
  private clothesDetectItems(){
    if (this.form.algorithmMetadata.clothesDetectItems.length > 0){
      this.clothes = this.form.algorithmMetadata.clothesDetectItems.map(item => {
        this.type = item[0]
        return item.split('_')[1]
      })
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

  private colors = CostumColors

  private clothChange(value){
    const cloth_type = value.map(item => this.type + '_' + item)
    this.$set(this.form.algorithmMetadata, 'clothesDetectItems', cloth_type )
  }

  private typeChange(value){
    const cloth_type = this.form.algorithmMetadata.clothesDetectItems.map(item => {
      return value + '_' + item.split('_')[1]
    })
    this.$set(this.form.algorithmMetadata, 'clothesDetectItems', cloth_type )
  }
}
</script>
<style lang="scss" scoped>
.el-form-item {
  padding-top: 10px
}
.inside-pic {
  height: fit-content !important;
  position: relative;
  padding: 0 !important;
  line-height: 0;
  z-index: 2;
  ::v-deep .el-checkbox__input{
    position: absolute;
    bottom: -23px;
    left:8px;
  }
  ::v-deep .el-checkbox__label{
    padding: 0 18px;
    font-size: 0px;
  }
  .img{
    position: relative;
    display: flex;
    .sub-img {
      width: 44px;
      height: 80px;
      .el-image{
        width: 100%;
        height: 100%;
      }
    }
    .label{
      position: absolute;
      left: 7px;
      bottom: -22px;
    }
    .light{
    background: grey;
    }
    .blue{
      background: blue;
    }
    .red{
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

.el-checkbox-group{
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
    background: #F8F8F8;
    border: 1px solid rgba(221,221,221,1);
    border-radius: 2px;
  }
}
.error:after{
    content: '';
    border: 1px solid #f5212d;
}
.error-msg{
  margin-top: 5px;
  font-size: 12px;
  color: #f5212d;
}

</style>
