<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card v-if="cardIndex === 'form'" v-loading="loading.form">
      <div class="main-box">
        <el-form ref="userForm" :model="form" :rules="rules" label-position="right" label-width="150px">
          <el-form-item prop="iamUserName" label="用户名：">
            <el-input v-model="form.iamUserName" placeholder="请填写用户名" />
            <el-row class="form-tip">2-16位，可包含大小写字母、数字、中文、中划线，用户名称不能重复。</el-row>
          </el-form-item>
          <el-form-item prop="phone" label="电话：">
            <el-input v-model="form.phone" placeholder="请填写用户电话" />
          </el-form-item>
          <el-form-item prop="email" label="邮箱：">
            <el-input v-model="form.email" placeholder="请填写用户邮箱" />
          </el-form-item>
          <el-form-item prop="accessType" label="访问方式：">
            <template>
              <el-checkbox v-model="form.consoleEnabled" :disabled="type === 'edit'" @change="accessTypeChange">控制台访问</el-checkbox>
              <el-popover placement="top-start" title="控制台访问" width="400" trigger="hover" :open-delay="300" content="启用密码，允许用户登录到视频监控客户控制台。">
                <svg-icon slot="reference" class="form-question sign" name="help" />
              </el-popover>
              <el-checkbox v-model="form.apiEnabled" :disabled="type === 'edit'" @change="accessTypeChange">编程访问</el-checkbox>
              <el-popover placement="top-start" title="编程访问" width="400" trigger="hover" :open-delay="300" content="启用Access Key ID和Secret Access Key，支持API、SDK和其他开发工具访问。">
                <svg-icon slot="reference" class="form-question sign" name="help" />
              </el-popover>
            </template>
          </el-form-item>
          <el-form-item prop="policy" label="用户权限：">
            <el-table ref="policyList" v-loading="loading.table" :data="policyList" max-height="500" @selection-change="handleSelectionChange" @row-click="rowClick">
              <template slot="empty">
                <span>暂无策略，请先添加策略。</span>
              </template>
              <el-table-column type="selection" width="55" />
              <el-table-column prop="policyName" label="策略名" min-width="100" :show-overflow-tooltip="true" />
              <el-table-column prop="scope" label="策略归属域" width="120">
                <template slot-scope="scope">
                  <el-button v-if="scope.row.policyScope === 'ctyun'" type="danger" size="mini">系统策略</el-button>
                  <el-button v-else type="success" size="mini">自定义策略</el-button>
                </template>
              </el-table-column>
              <el-table-column prop="policyDesc" label="策略描述" :show-overflow-tooltip="true" min-width="180" />
              <el-table-column label="操作" width="80">
                <template slot-scope="{row}">
                  <el-button type="text" size="mini" @click="editPolicy(row)">{{ row.policyScope === 'ctyun' ? '查看策略' : '编辑策略' }}</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item prop="resetPwdEnabled" label="是否重置密码：">
            <el-switch v-model="form.resetPwdEnabled" active-color="#FA8334" inactive-color="#CCCCCC" />
            <span class="item-tip">用户必须在下次登录时重置密码</span>
          </el-form-item>
          <el-form-item v-if="type === 'edit'" prop="subUserLoginLink" label="子用户登录链接：">
            <span>{{ $route.query.subUserLoginLink }}</span>
            <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
              <el-button type="text" style="margin-left: 10px;" @click="copyRow($route.query.subUserLoginLink, 'link')">
                <svg-icon name="copy" />
              </el-button>
            </el-tooltip>
          </el-form-item>
          <el-form-item>
            <el-button :disabled="loading.submit" type="primary" @click="operateUser(type)">确定</el-button>
            <el-button :disabled="loading.submit" @click="back">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card v-if="cardIndex === 'table'">
      <div class="main-box">
        <h2>成功新建成员</h2>
        <p class="item-tip">
          您已经成功新建用户，用户基础信息如下所示。您可以点击复制或者
          <span class="text-btn" style="margin: 0;" @click="exportExel"> 下载 </span>
          当前新建用户的所有信息。
        </p>
        <el-table :data="newUserData" style="width: 100%;">
          <el-table-column prop="userName" label="用户名" />
          <el-table-column prop="passwords" label="密码">
            <template slot-scope="scope">
              <div v-if="scope.row.passwords">
                <span>{{ showPasswords ? scope.row.passwords : '****' }}</span>
                <span v-if="showPasswords" class="text-btn" @click="showPasswords = false">隐藏</span>
                <span v-else class="text-btn" @click="showPasswords = true">显示</span>
              </div>
              <div v-else>
                <span>--</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="secrets" label="密钥">
            <template slot-scope="scope">
              <div>
                <span>AccessKeyId：</span>
                <span>{{ scope.row.secretId ? scope.row.secretId : '--' }}</span>
              </div>
              <div v-if="scope.row.secretKey">
                <span>SecretAccessKey：</span>
                <span>{{ showSecretKey ? scope.row.secretKey : '****' }}</span>
                <span v-if="showSecretKey" class="text-btn" @click="showSecretKey = false">隐藏</span>
                <span v-else class="text-btn" @click="showSecretKey = true">显示</span>
              </div>
              <div v-else>
                <span>SecretAccessKey：--</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button type="text" @click="copyRow(scope.row, 'data')">复制</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-button type="primary" class="back-btn" @click="back">返回</el-button>
    </el-card>
  </div>
</template>

<script lang="ts">
import {
  createUser, getPolicyList, getUser,
  modifyUser
} from '@/api/accessManage'
import TemplateBind from '@/views/components/TemplateBind.vue'
import copy from 'copy-to-clipboard'
import { Component, Vue } from 'vue-property-decorator'

Component.registerHooks(['beforeRouteEnter'])

@Component({
  components: { TemplateBind },
  name: 'CreateUser'
})
export default class extends Vue {
  private type: any = ''
  private loading: any = {
    form: false,
    submit: false
  }
  private cardIndex: string = 'form'
  private breadCrumbContent: string = ''
  private form: any = {
    mainUserId: '',
    iamUserName: '',
    accessType: true,
    consoleEnabled: true,
    apiEnabled: false,
    policy: null,
    email: '',
    phone: '',
    resetPwdEnabled: true
  }
  private rules: any = {
    iamUserName: [
      { required: true, message: '用户名必填', trigger: 'blur' },
      { validator: this.validateUserName, trigger: 'blur' }
    ],
    policy: [{ required: true, message: '请添加用户权限' }],
    accessType: [
      { required: true, validator: this.validateAccessType, trigger: 'change' }
    ],
    email: [
      { required: true, message: '请填写邮箱', trigger: 'blur' },
      { validator: this.validateEmail, trigger: 'blur' }
    ],
    phone: [{ validator: this.validatePhone, trigger: 'blur' }]
  }
  private policyList: Array<object> = []
  private newUserData: Array<object> = []
  private showPasswords: boolean = false
  private showSecretKey: boolean = false
  private fromUrl: string = ''

  private editPolicy(row: any) {
    this.$router.push({
      path: '/access-manage/policy/edit',
      query: {
        policyId: row.policyId,
        policyScope: row.policyScope
      }
    })
  }

  private accessTypeChange() {
    this.form.accessType = this.form.consoleEnabled || this.form.apiEnabled
  }

  private handleSelectionChange(selection: any) {
    this.form.policy = selection[0]
    if (selection.length > 1) {
      const policyList: any = this.$refs.policyList
      policyList.clearSelection()
      policyList.toggleRowSelection(selection.pop())
    }
  }

  private rowClick(row: any) {
    const policyList: any = this.$refs.policyList
    policyList.toggleRowSelection(row)
  }

  private copyRow(row: any, type: any) {
    if (type === 'data') {
      let str = `
      主账号ID：${row.mainUserId}
      用户名：${row.userName}
      登录密码：${row.passwords}
      AccessKeyId：${row.secretId}
      SecretAccessKey：${row.secretKey}
      
      `
      copy(str)
    } else if (type === 'link') {
      const subUserLoginLink = row
      copy(subUserLoginLink + '')
    }
    this.$message.success('复制成功')
  }

  private beforeRouteEnter(to: any, from: any, next: any) {
    next((vm: any) => {
      vm.fromUrl = from.name
    })
  }

  private back() {
    if (this.fromUrl === 'access-manage-dashboard') {
      this.$router.go(-1)
    } else {
      let query: any = this.$route.query
      this.$router.push({
        name: 'AccessManageUser',
        params: {
          nodeKeyPath: query.nodeKeyPath
        }
      })
    }
  }

  private async mounted() {
    try {
      this.loading.form = true
      await this.getPolicyList()
      this.type = this.$route.query.type
      if (this.type === 'edit') {
        this.breadCrumbContent = '编辑用户'
        this.getUser()
      } else if (this.type === 'add') {
        this.breadCrumbContent = '创建用户'
      }
    } catch (e) {
      console.log(e)
    } finally {
      this.loading.form = false
    }
  }

  private async getPolicyList() {
    let params: any = {
      pageSize: 1000,
      policyType: 'subUser'
    }
    try {
      let res: any = await getPolicyList(params)
      this.policyList = res.iamPolices
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  private async getUser() {
    try {
      let res = await getUser({
        iamUserId: this.$router.currentRoute.query.userId
      })
      this.form = {
        iamUserName: res.iamUserName,
        consoleEnabled: res.consoleEnabled === '1',
        apiEnabled: res.apiEnabled === '1',
        resetPwdEnabled: res.resetPwdEnabled === '1',
        accessType: res.apiEnabled === '1' || res.consoleEnabled === '1',
        email: res.email,
        phone: res.phone
      }
      let selectRow = this.policyList.find((policy: any) => {
        return policy.policyId === res.policyId
      })
      const policyList: any = this.$refs.policyList
      policyList.toggleRowSelection(selectRow)
    } catch (e) {
      this.$message.error(e && e.message)
      this.back()
    }
  }
  private async operateUser(type: any) {
    const form: any = this.$refs.userForm
    form.validate(async(valid: any) => {
      let params: any = {
        iamUserName: this.form.iamUserName,
        policyId: this.form.policy.policyId,
        consoleEnabled: this.form.consoleEnabled ? '1' : '2',
        apiEnabled: this.form.apiEnabled ? '1' : '2',
        resetPwdEnabled: this.form.resetPwdEnabled ? '1' : '2',
        phone: this.form.phone || undefined,
        email: this.form.email
      }
      try {
        if (valid) {
          this.loading.submit = true
          if (type === 'add') {
            params.groupId = this.$router.currentRoute.query.groupId
            let res = await createUser(params)
            this.cardIndex = 'table'
            this.newUserData = [
              {
                mainUserId: res.mainUserId,
                userName: res.iamUserName,
                passwords: res.iamUserPasswd,
                secretId: res.ak,
                secretKey: res.sk
              }
            ]
          } else if (type === 'edit') {
            params.iamUserId = this.$router.currentRoute.query.userId
            await modifyUser(params)
            this.$message.success('修改用户成功')
            this.back()
          }
        } else {
          return false
        }
      } catch (e) {
        this.$message.error(e && e.message)
      } finally {
        this.loading.submit = false
      }
    })
  }

  /**
   * 导出xlsx
   */
  private async exportExel() {
    const ExcelJS = await import(/* webpackChunkName: "exceljs" */ 'exceljs')
    const exelName: string = '新建用户的所有信息'
    const workbook = new ExcelJS.Workbook()
    workbook.views = [
      {
        x: 0,
        y: 0,
        width: 10000,
        height: 20000,
        firstSheet: 0,
        activeTab: 1,
        visibility: 'visible'
      }
    ]
    const worksheet: any = workbook.addWorksheet('My Sheet')
    worksheet.name = exelName
    worksheet.columns = [
      { header: '用户名', key: 'userName', width: 16 },
      { header: '密码', key: 'passwords', width: 16 },
      { header: 'secretId', key: 'secretId', width: 48 },
      { header: 'secretKey', key: 'secretKey', width: 48 }
    ]
    this.newUserData.forEach((user: any) => {
      worksheet.addRow(user)
    })
    const buffer = await workbook.xlsx.writeBuffer()
    var blob = new Blob([buffer], { type: 'application/xlsx' })
    var link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${exelName}.xlsx`
    link.click()
  }

  private validateUserName(rule: any, value: any, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-]{2,16}$/.test(value)) {
      callback(new Error('2-16位，可包含大小写字母、数字、中划线'))
    } else {
      callback()
    }
  }

  private validateAccessType(rule: any, value: any, callback: Function) {
    if (!value) {
      callback(new Error('请至少选择一种访问方式'))
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

  private validatePhone(rule: any, value: string, callback: Function) {
    if (value && !/^\d{11}$/.test(value)) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
  }
}
</script>

<style lang="scss" scoped>
.main-box {
  margin-left: 10px;

  .el-input {
    width: 500px;
  }
}

.el-table {
  width: 700px;

  ::v-deep {
    .el-table__header-wrapper .el-checkbox {
      display: none;
    }
    //单选补充样式
    .el-checkbox__inner {
      border-radius: 100%;

      &:after {
        opacity: 1;
        position: absolute;
        width: 0.3px;
        height: 0.3px;
        background: #fff;
        border-radius: 100%;
        top: 4px;
        left: 4px;
        border: 2px solid #fff;
      }
    }
  }
}

.sign {
  color: #888;
  margin: 0 30px 0 5px;
}

.el-checkbox {
  margin: 0;
}

.item-tip {
  font-size: 13px;
  color: #999;
  margin-left: 10px;
}

.text-btn {
  color: #fa8334;
  margin-left: 10px;
  cursor: pointer;
}

.back-btn {
  margin-top: 20px;
  margin-left: 20px;
}
</style>
