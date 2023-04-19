<template>
  <el-form-item prop="algorithmMetadata.FaceDbName" label="人脸库">
    <el-select
      v-model="form.algorithmMetadata.FaceDbName"
      placeholder="请选择人脸库"
      :loading="isfaceLibLoading"
    >
      <el-option
        v-for="item in faceLibs"
        :key="item.id"
        :label="item.name"
        :value="item.id + ''"
      />
    </el-select>
    <i class="el-icon-refresh" @click="refreshFaceLib" />
    <el-button type="text" @click="goFaceLib">+新建人脸库</el-button>
  </el-form-item>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { listGroup } from '@vss/device/api/face'

@Component({
  name: 'form',
  components: {}
})
export default class extends Vue {
  @Prop() private form!: any
  private faceLibs: any = []
  private isfaceLibLoading = false

  private async mounted() {
    try {
      this.isfaceLibLoading = true
      const { groups } = await listGroup({
        pageNum: 0,
        pageSize: 3000
      })
      this.faceLibs = groups
    } catch (e) {
      this.$alertError(e && e.message)
    } finally {
      this.isfaceLibLoading = false
    }
  }

  private async refreshFaceLib() {
    this.isfaceLibLoading = true
    const { data } = await listGroup({
      pageNum: 0,
      pageSize: 3000
    })
    this.faceLibs = data
    this.isfaceLibLoading = false
  }

  private goFaceLib() {
    const addr = this.$router.resolve({
      name: 'facelib'
    })
    window.open(addr.href, '_blank')
  }
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
