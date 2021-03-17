<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card v-if="cardIndex === 'form'" v-loading="loading.form">
      <div class="main-box">
        <el-form
          ref="userForm"
          :model="form"
          :rules="rules"
          label-position="right"
          label-width="150px"
        >
          <el-form-item prop="iamUserName" label="用户名：">
            <el-input v-model="form.iamUserName" placeholder="请填写用户名" />
            <el-row class="form-tip">可包含大小写字母、数字、中划线，用户名称不能重复</el-row>
          </el-form-item>
          <el-form-item prop="consoleEnabled" label="访问方式：">
            <template>
              <el-checkbox v-model="form.consoleEnabled">控制台访问</el-checkbox>
              <el-popover
                placement="top-start"
                title="控制台访问"
                width="400"
                trigger="hover"
                :open-delay="300"
                content="启用密码，允许用户登录到视频监控用户控制台。"
              >
                <svg-icon slot="reference" class="form-question sign" name="help" />
              </el-popover>
              <el-checkbox v-model="form.apiEnabled">编程访问</el-checkbox>
              <el-popover
                placement="top-start"
                title="编程访问"
                width="400"
                trigger="hover"
                :open-delay="300"
                content="启用SecretId和SecretKey，支持API、SDK和其他开发工具访问。"
              >
                <svg-icon slot="reference" class="form-question sign" name="help" />
              </el-popover>
            </template>
          </el-form-item>
          <el-form-item prop="policy" label="用户权限：">
            <el-table
              ref="policyList"
              v-loading="loading.table"
              :data="policyList"
              max-height="500"
              @selection-change="handleSelectionChange"
              @row-click="rowClick"
            >
              <el-table-column
                type="selection"
                width="55"
              />
              <el-table-column
                prop="policyName"
                label="策略名"
                width="150"
              />
              <el-table-column
                prop="policyDescribe"
                label="策略描述"
              />
            </el-table>
          </el-form-item>
          <el-form-item prop="resetPwdEnabled" label="是否重置密码：">
            <el-switch
              v-model="form.resetPwdEnabled"
              active-color="#FA8334"
              inactive-color="#CCCCCC"
            />
            <span class="item-tip">用户必须在下次登录时重置密码</span>
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
          <span class="text-btn" @click="exportCsv" style="margin: 0"> 下载 </span>
          当前新建用户的所有信息。
        </p>
        <el-table :data="newUserData" style="width: 100%">
          <el-table-column
            prop="userName"
            label="用户名"
          />
          <el-table-column prop="passwords" label="密码">
            <template slot-scope="scope">
              <span>{{ showPasswords ? scope.row.passwords : '****' }}</span>
              <span v-if="showPasswords" class="text-btn" @click="showPasswords = false">隐藏</span>
              <span v-else class="text-btn" @click="showPasswords = true">显示</span>
            </template>
          </el-table-column>
          <el-table-column prop="secrets" label="密钥">
            <template slot-scope="scope">
              <div>
                <span>SecretId：</span>
                <span>{{ scope.row.secretId ? scope.row.secretId : '--' }}</span>
              </div>
              <div v-if="scope.row.secretKey">
                <span>SecretKey：</span>
                <span>{{ showSecretKey ? scope.row.secretKey : '****' }}</span>
                <span v-if="showSecretKey" class="text-btn" @click="showSecretKey = false">隐藏</span>
                <span v-else class="text-btn" @click="showSecretKey = true">显示</span>
              </div>
              <div v-else>
                <span>SecretKey：--</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button type="text" @click="copyRow(scope.row)">复制</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-button type="primary" class="back-btn" @click="back">返回</el-button>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import copy from 'copy-to-clipboard'
import { ExportToCsv } from 'export-to-csv'
import { createUser, getUser, modifyUser, getPolicyList } from '@/api/accessManage'
@Component({
  name: 'CreateUser'
})
export default class extends Vue {
  private type: any = ''
  private loading: any = {
    form: false,
    table: false,
    submit: false
  }
  private cardIndex: string = 'form'
  private breadCrumbContent: string = ''
  private form: any = {
    iamUserName: '',
    consoleEnabled: true,
    apiEnabled: false,
    policy: [],
    resetPwdEnabled: true
  }
  private rules: any = {
    iamUserName: [
      { required: true, message: '用户名必填', trigger: 'blur' },
      { validator: this.validateUserName, trigger: 'blur' }
    ],
    policy: [
      { required: true, message: '请添加用户权限' }
    ]
  }
  private policyList: Array<object> = [
    {
      policyName: '策略1',
      policyId: '1',
      policyDescribe: '描述'
    },
    {
      policyName: '策略2',
      policyId: '2',
      policyDescribe: '描述'
    },
    {
      policyName: '策略3',
      policyId: '3',
      policyDescribe: '描述'
    },
    {
      policyName: '策略4',
      policyId: '4',
      policyDescribe: '描述'
    },
    {
      policyName: '策略5',
      policyId: '5',
      policyDescribe: '描述'
    }
  ]
  private newUserData: Array<object> = []
  private showPasswords: boolean = false
  private showSecretKey: boolean = false

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

  private copyRow(row: any) {
    let str =
    `
    主账号ID：100008184984
    用户名：${row.userName}
    登录密码：${row.passwords}
    SecretId：${row.secretId}
    SecretKey：${row.secretKey}
    
    `
    copy(str)
    this.$message.success('复制成功')
  }

  private back() {
    this.$router.push(`/accessManage/user`)
  }

  private mounted() {
    this.getPolicyList()
    this.type = this.$router.currentRoute.query.type
    if (this.type === 'edit') {
      this.breadCrumbContent = '编辑用户'
      this.getUser()
    } else if (this.type === 'add') {
      this.breadCrumbContent = '创建用户'
    }
  }

  private async getPolicyList() {
    // let params: any = {}
    // try {
    //   this.loading.table = true
    //   let res: any = await getPolicyList(params)
    //   this.policyList = []
    //   for (let i = 0; i < res.iamPolices.length; i++) {
    //     let obj: object = {
    //       policyName: res.iamPolices.policyName,
    //       policyDescribe: res.iamPolices.describe,
    //       policyId: res.iamPolices.policyId
    //     }
    //     this.policyList.push(obj)
    //   }
    // } catch (e) {
    //   this.$message.error(e && e.message)
    // } finally {
    //   this.loading.table = false
    // }
  }

  private async getUser() {
    // try {
    //   this.loading.form = true
    //   let res = await getUser({ iamUserId: this.$router.currentRoute.query.userId })
    //   this.form = {
    //     iamUserName: res.iamUserName,
    //     consoleEnabled: res.consoleEnabled === '1',
    //     apiEnabled: res.consoleEnabled === '1',
    //     policy: {
    //       policyName: res.policyName,
    //       policyId: res.policyId,
    //       policyDescribe: res.policyDescribe
    //     },
    //     resetPwdEnabled: true
    //   }
    //   const policyList: any = this.$refs.policyList
    //   policyList.toggleRowSelection(this.form.policy)
    // } catch (e) {
    //   this.$message.error(e && e.message)
    // } finally {
    //   this.loading.form = false
    // }
  }
  private async operateUser(type: any) {
    const form: any = this.$refs.userForm
    form.validate(async(valid: any) => {
      let params: any = {
        iamUserName: this.form.iamUserName,
        policyId: this.form.policy.policyId,
        consoleEnabled: this.form.consoleEnabled ? '1' : '2',
        apiEnabled: this.form.apiEnabled ? '1' : '2',
        resetPwdEnabled: this.form.resetPwdEnabled ? '1' : '2'
      }
      try {
        if (valid) {
          this.loading.submit = true
          if (type === 'add') {
            params.groupId = this.$router.currentRoute.query.groupId
            // await createUser(params)
            this.cardIndex = 'table'
            this.newUserData = [
              {
                userName: '用户01',
                passwords: 'yhJD-43/',
                secretId: 'AKIDS3OUO8N8rJ7k7DtA5sSZ8bxHWP2UwndC',
                secretKey: 'TfbLtDIFyxkMZgpmJfHfUX6XkhUVIrGV'
              }
            ]
          } else if (type === 'edit') {
            params.iamUserId = this.$router.currentRoute.query.userId
            // await modifyUser(params)
            this.$message.success('修改用户成功')
            this.$router.push(`/accessManage/user`)
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
   * 导出CSV
   */
  private exportCsv() {
    const options = {
      filename: '新建用户的所有信息',
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true
    }
    const csvExporter = new ExportToCsv(options)
    const data = this.newUserData.map((user: any) => {
      return {
        '用户名': user.userName,
        '密码': user.passwords,
        'secretId': user.secretId ? user.secretId : '--',
        'secretKey': user.secretKey ? user.secretKey : '--'
      }
    })
    csvExporter.generateCsv(data)
  }

  private validateUserName(rule: any, value: any, callback: Function) {
    if (!/^[0-9a-zA-Z-]{1,}$/.test(value)) {
      callback(new Error('仅允许包含大小写字母、数字、中划线'))
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
      width: 500px
    }
  }
  .el-table {
    width: 700px;
    ::v-deep .el-table__header-wrapper  .el-checkbox {
      display:none
    }
  }
  .sign {
    color: #888888;
    margin: 0 30px 0 5px
  }
  .el-checkbox {
    margin: 0;
  }
  .item-tip {
    font-size: 13px;
    color: #999999;
    margin-left: 10px;
  }
  .text-btn {
    color: #FA8334;
    margin-left: 10px;
    cursor: pointer;
  }
  .back-btn {
    margin-top: 20px;
    margin-left: 20px;
  }
</style>
