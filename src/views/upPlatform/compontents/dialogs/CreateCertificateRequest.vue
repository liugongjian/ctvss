<template>
  <el-dialog
    width="30%"
    title="创建证书请求"
    :visible="true"
    append-to-body
    center
    @close="closeDialog"
  >
    <el-form ref="form" :label-position="'right'" label-width="80px" :rules="rules" :model="form">
      <el-form-item label="国家" prop="country">
        <el-input v-model="form.country" disabled class="form__input" />
      </el-form-item>
      <el-form-item label="省/州" prop="stateOrProvince">
        <el-input v-model="form.stateOrProvince" class="form__input" />
      </el-form-item>
      <el-form-item label="地区" prop="locality">
        <el-input v-model="form.locality" class="form__input" />
      </el-form-item>
      <el-form-item label="组织" prop="organization">
        <el-input v-model="form.organization" class="form__input" />
      </el-form-item>
      <el-form-item label="单位" prop="organizationalUnit">
        <el-input v-model="form.organizationalUnit" class="form__input" />
      </el-form-item>
      <el-form-item label="邮箱" prop="emailAddress">
        <el-input v-model="form.emailAddress" class="form__input" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :loading="loading" type="primary" @click="submit">确 定</el-button>
      <el-button v-if="!loading" @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { generateCsr } from '@/api/upPlatform'
import AddressCascader from '@/views/components/AddressCascader.vue'

@Component({
  name: 'InnerDialog',
  components: { AddressCascader }
})
export default class extends Vue {
  @Prop()
  private platformId!: any

  private loading = false

  private rules = {
    country: [
      { required: true, message: '请填写国家名称', trigger: 'blur' }
    ],
    stateOrProvince: [
      { validator: this.validateLetterOnly, trigger: 'blur' }
    ],
    locality: [
      { validator: this.validateLetterOnly, trigger: 'blur' }
    ],
    organization: [
      { validator: this.validateLetterOnly, trigger: 'blur' }
    ],
    organizationalUnit: [
      { validator: this.validateLetterOnly, trigger: 'blur' }
    ],
    emailAddress: [
      { validator: this.validateEmail, trigger: 'blur' }
    ]
  }

  private form: any = {
    country: 'CN',
    stateOrProvince: 'shanghai',
    locality: 'shanghai',
    organization: 'ctyun',
    organizationalUnit: 'ctyun',
    emailAddress: ''
  }

  private closeDialog(isRefresh?: boolean) {
    this.$emit('on-close', isRefresh)
  }

  private async submit() {
    try {
      const form: any = this.$refs.form
      form.validate(async(valid: boolean) => {
        if (valid) {
          try {
            this.loading = true
            await generateCsr({
              platformId: this.platformId,
              ...this.form
            })
            this.closeDialog(true)
            this.$message.success('创建成功')
          } catch (e) {
            console.log(e && e.message)
          } finally {
            this.loading = false
          }
        } else {
          return false
        }
      })
    } catch (e) {
      this.$message.error('操作失败: ' + e.message)
      console.log(e)
    }
  }

  private validateLetterOnly(rule: any, value: string, callback: Function) {
    if (value && !/^[a-zA-Z]*$/.test(value)) {
      callback(new Error('仅支持大小写字母'))
    } else {
      callback()
    }
  }

  private validateEmail(rule: any, value: string, callback: Function) {
    if (value && !/^[\w-.]+@[a-zA-Z\d-]+(\.[a-zA-Z]{2,8}){1,2}$/gi.test(value)) {
      callback(new Error('请输入正确的邮箱'))
    } else {
      callback()
    }
  }
}
</script>
