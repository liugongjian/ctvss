<!--
 * @Author: 邱文琦
 * @LastEditors: 邱文琦
 * @LastEditTime: 2023-07-03 15:16:39
 * @Description: 
-->
<template>
  <div class="dashboard-tips">
    <el-alert
      title="成功提示的文案"
      type="success"
    >
      <template slot="title">
        <div class="iconSize">
          尊敬的客户，设备管理模块已升级至全新版本，您可在设备树创建任意目录进行分组管理，分组不再有业务组协议限制，详细操作可查看
          <a href="https://www.ctyun.cn/document/10011391/10011410" target="_blank">帮助中心</a>
          ，也欢迎您提供
          <a @click="dialogVisible = true">在线反馈</a>
          。若您有任何问题，请随时与客户经理或售后人员联系，感谢您使用天翼云智能视图服务！
        </div>
      </template>
    </el-alert>
    <el-dialog
      title="我要反馈"
      :visible.sync="dialogVisible"
      width="35%"
      center
    >
      <el-form ref="ruleForm" :model="form" :rules="rules">
        <el-form-item label="反馈内容" label-width="100px" prop="contnet">
          <el-input v-model="form.contnet" type="textarea" maxlength="500" rows="6" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" label-width="100px" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="submitForm()">提 交</el-button>
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator'
import { getFeedback } from '@/api/dashboard'

@Component({
  name: 'DashboardTips',
})
export default class extends Vue {
  @Ref('ruleForm')
  private ruleForm

  private dialogVisible = false
  
  private form = {
    contnet: '',
    phoneNumber: '',
    source: 'web'
  }

  private rules = {
    contnet: [
      { required: true, message: '请输入反馈内容', trigger: 'blur' },
    ],
    phoneNumber: [
      { required: false },
      { validator: this.checkPhone, trigger: 'blur' },
    ],
  }

  private checkPhone(rule, value, callback) {
    if (!(/^1(3|4|5|6|7|8|9)+\d{9}$/.test(value))) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
  }

  private submitForm() {
    this.ruleForm.validate(async(valid) => {
      if (valid) {
        try {
          await getFeedback(this.form)
          this.form.contnet = ''
          this.form.phoneNumber = ''
          this.$message.success('提交成功')
          this.dialogVisible = false
        } catch (err) {
          this.$message.error(err.message)
        }
      } else {
        return false
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.dashboard-tips {

  a {
    cursor: pointer;
  }

  .el-dialog__wrapper {
    ::v-deep .el-dialog {
      .el-dialog__body {
        padding-right: 80px;
      }
      .el-dialog__footer{
        .el-button {
          padding: 9px 20px;
          border-radius: 2px;
        }
      }
    }
  }
}
</style>
