<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card v-loading="loading">
      <el-form
        ref="userForm"
        :model="form"
        :rules="rules"
        label-position="right"
        label-width="150px"
      >
        <el-form-item v-if="isEdit" label="角色ID" prop="roleId">
          <el-input v-model="form.roleId" disabled />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="绑定账户ID" prop="bindingUserId">
          <el-input v-model="form.bindingUserId" placeholder="请输入绑定账户ID" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="策略选择" prop="policyId">
          <el-table
            ref="policyList"
            :data="policyList"
            max-height="500"
            @row-click="rowClick"
          >
            <template slot="empty">
              <span>暂无策略，请先添加策略。</span>
            </template>
            <el-table-column width="55" align="center">
              <template slot-scope="scope">
                <el-radio v-model="form.policyId" :label="scope.row.policyId" disabled>{{ '' }}</el-radio>
              </template>
            </el-table-column>
            <el-table-column
              prop="policyName"
              label="策略名"
              width="180"
            />
            <el-table-column
              prop="policyDescribe"
              label="策略描述"
            />
          </el-table>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="form.description" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item>
          <el-button :disabled="loading" type="primary" @click="submit">提交</el-button>
          <el-button :disabled="loading" @click="back">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getPolicyList, iamGetRole, iamCreateRole, iamModifyRole } from '@/api/accessManage'
@Component({
  name: 'CreateRole'
})
export default class extends Vue {
  private loading = false
  private query: any = null
  private breadCrumbContent = ''
  private form = {
    roleId: '',
    roleName: '',
    bindingUserId: '',
    policyId: '',
    description: ''
  }
  private policyList: any = []
  private rules = {
    roleName: [
      { required: true, message: '请填写角色名称', trigger: 'blur' },
      { validator: this.validateRoleName, trigger: 'blur' }
    ],
    bindingUserId: [
      { required: true, message: '请填写绑定账户ID', trigger: 'blur' }
    ],
    policyId: [
      { required: true, message: '请添加用户权限' }
    ]
  }

  private get isEdit() {
    return this.$route.query.type === 'edit'
  }

  private validateRoleName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-\s]{0,64}$/u.test(value)) {
      callback(new Error('角色名称格式错误。不超过64个字符，可包含大小写字母、数字、中文、中划线、空格。'))
    } else {
      callback()
    }
  }

  private async mounted() {
    await this.getPolicyList()
    this.query = this.$route.query
    if (this.query.type === 'edit') {
      this.breadCrumbContent = '编辑角色'
      await this.getRoleInfo()
    } else if (this.query.type === 'add') {
      this.breadCrumbContent = '创建角色'
      this.form.policyId = this.policyList && this.policyList[0] && this.policyList[0].policyId
    }
  }

  /**
   * 查询角色信息
   */
  private async getRoleInfo() {
    try {
      this.loading = true
      const res: any = await iamGetRole({ roleId: this.query.roleId })
      this.form = { ...res }
    } catch (e) {
      this.$$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 获取策略列表
   */
  private async getPolicyList() {
    const params: any = {
      pageSize: 1000,
      policyType: 'role'
    }
    try {
      this.loading = true
      const res: any = await getPolicyList(params)
      this.policyList = []
      for (let i = 0; i < res.iamPolicies.length; i++) {
        const obj: object = {
          policyName: res.iamPolicies[i].policyName,
          policyDescribe: res.iamPolicies[i].policyDesc,
          policyId: res.iamPolicies[i].policyId
        }
        this.policyList.push(obj)
      }
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async createOrUpdateRole() {
    try {
      this.loading = true
      const request = this.isEdit ? iamModifyRole : iamCreateRole
      await request(this.form)
      this.$message.success(this.isEdit ? '编辑角色成功' : '新增角色成功')
      this.back()
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async submit() {
    const form: any = this.$refs.userForm
    form.validate(async(valid: any) => {
      if (!valid) return
      this.createOrUpdateRole()
    })
  }

  private back() {
    this.$router.go(-1)
    // this.$router.push({
    //   name: 'accessManage-role'
    // })
  }

  private rowClick(row: any) {
    this.form.policyId = row.policyId
  }
}
</script>

<style lang="scss" scoped>
  .el-input {
    width: 400px;
  }

  .el-textarea {
    width: 500px;
  }

  .el-date-editor {
    width: 200px;
  }

  .el-table {
    width: 500px;
  }

  .tree-container {
    width: 430px;
    max-height: 300px;
    border-radius: 5px;
    padding: 10px;
    overflow: auto;
    border: 1px solid #dcdfe6;
  }

  .policy-label {
    margin-top: 20px;

    ::v-deep {
      .el-input__inner {
        border-color: #dcdfe6 !important;
      }
    }
  }

  .policy {
    &__init {
      &__system {
        max-height: 400px;
        transition: 0.3s;
        overflow: hidden;
      }

      &__customize {
        max-height: 400px;
        transition: 0.3s;
        overflow: hidden;
      }
    }

    &__collapse {
      max-height: 0 !important;
    }
  }
</style>
