<template>
  <el-dialog
    v-loading="loading"
    width="30%"
    :title="title"
    :visible="true"
    append-to-body
    @close="closeDialog"
  >
    <el-form :label-position="'right'" label-width="130px" :rules="rules" :model="form">
      <el-form-item label="分组名" prop="dirName">
        <el-input v-model="form.dirName" placeholder="请输入目录名称" class="form__input" />
      </el-form-item>
      <el-form-item v-if="mode === 'vgroup'" label="所属行业" prop="industryCode">
        <el-select v-model="form.industryCode" placeholder="请选择所属行业">
          <el-option v-for="(item, index) in industryList" :key="index" :label="item.name" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="上级平台区域" prop="gbRegion">
        <AddressCascader
          :code="form.gbRegion"
          :level="form.gbRegionLevel"
          :disabled="false"
          @change="onDeviceAddressChange"
        />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" placeholder="请输入相关描述" class="form__input" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { } from '@/api/upPlatform'
import AddressCascader from '@/views/components/AddressCascader.vue'

@Component({
  name: 'InnerDialog',
  components: { AddressCascader }
})
export default class extends Vue {
  @Prop()
  private platformId!: any

  private rules = {
    dirName: [
      { required: true, message: '请输入目录名称', trigger: 'blur' }
    ],
    industryCode: [
      { required: true, message: '请选择所属行业', trigger: 'blur' }
    ],
    gbRegion: [
      { required: true, message: '请选择上级平台区域', trigger: 'blur' }
    ]
  }

  private loading = false
  private form: any = {
    id: '',
    dirName: '',
    description: '',
    industryCode: '',
    gbRegion: '',
    gbRegionLevel: ''
  }

  private async mounted() {
  }

  private closeDialog(isRefresh: boolean) {
    this.$emit('close-dialog', isRefresh)
  }

  private async submit() {
    try {
      const form: any = this.$refs.form
      form.validate(async(valid: boolean) => {
        if (valid) {
          await func(param)
          this.successInfo()
        } else {
          return false
        }
      })
    } catch (e) {
      this.$message.error('操作失败: ' + e.message)
      console.log(e)
    }
  }
}
</script>
<style lang="scss" scoped>
.delete-content {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.el-form-item {
  .el-cascader--medium,
  .el-select {
    width: fill-available;
  }
}
</style>
