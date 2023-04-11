<template>
  <el-form-item label="蜜蜂数量阈值" prop="beeNumber">
    <el-input v-model="form.beeNumber" />
  </el-form-item>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'form',
  components: {}
})
export default class extends Vue {
  @Prop() private form!: any
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
</style>
