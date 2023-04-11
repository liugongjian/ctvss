<template>
  <el-form-item label="细分检测项" prop="algorithmMetadata.cityGovType">
    <el-select
      v-model="form.algorithmMetadata.cityGovType"
      multiple
      class="city-gov-type"
    >
      <el-option
        v-for="type in CityGovType"
        :key="type.label"
        :value="type.label"
        :label="type.cname"
      />
    </el-select>
  </el-form-item>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { CityGovType } from '@vss/ai/dics/contants'

@Component({
  name: 'form',
  components: {}
})
export default class extends Vue {
  @Prop() private form!: any
  private CityGovType = CityGovType
}
</script>
<style lang="scss" scoped>
.confidence-info {
  display: inline-block;
  height: 45px;
  line-height: 100%;
  vertical-align: middle;
  margin-left: -71px;

  & > span:nth-child(2) {
    margin-left: 10px;
    margin-right: 10px;
  }
}

.el-slider {
  width: 500px;
  display: inline-block;

  ::v-deep .el-slider__input {
    width: 60px;
    margin-right: 80px;
  }
}

.el-input,
.el-textarea,
.el-table {
  width: 500px;
}

.tabrow-add {
  padding-left: 180px;
}

.mb5 {
  width: 500px;
}

.el-icon-refresh {
  margin-left: 20px;
  font-size: 16px;

  &:hover {
    cursor: pointer;
  }
}

.el-button--text {
  margin-left: 15px;
}

.comment {
  padding-left: 10px;
  color: $textGrey;
}

.el-form-item.is-error.el-form-item--medium {
  margin-bottom: 20px;
}

.alarm {
  width: 112px;
  margin-right: 18px;

  & + .el-select {
    width: 80px;
  }
}

.inline-form-item {
  width: fit-content;
  display: inline-block;
}

.interval-unit {
  width: 65px;
}

.city-gov-type {
  width: 500px;

  ::v-deep .el-tag {
    margin-right: 8px;
  }
}
</style>
