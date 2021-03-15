<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card v-if="cardIndex === 'form'">
      <div class="main-box">
        <el-form
          ref="userForm"
          :model="form"
          :rules="form.rules"
          label-position="right"
          label-width="150px"
        >
          <el-form-item prop="userName" label="用户名：">
            <el-input v-model="form.userName" placeholder="请填写用户名" />
            <el-row class="form-tip">可包含大小写字母、数字、中划线，用户名称不能重复</el-row>
          </el-form-item>
          <el-form-item prop="accessType" label="访问方式：">
            <el-radio v-model="form.accessType" label="control">控制台访问</el-radio>
            <el-tooltip placement="top-start" effect="light">
              <div slot="content">
                启用密码，允许用户登录到视频监控用户控制台。
              </div>
              <i class="sign el-icon-question"></i>
            </el-tooltip>
            <el-radio v-model="form.accessType" label="code">编程访问</el-radio>
            <el-tooltip placement="top-start" effect="light">
              <div class="sign" slot="content">
                启用SecretId和SecretKey，支持API、SDK和其他开发工具访问。
              </div>
              <i class="sign el-icon-question"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item prop="policyChecked" label="用户权限：">
            <el-table ref="policyList" :data="policyList" max-height="500" @selection-change="handleSelectionChange">
              <el-table-column
                type="selection"
                width="55">
              </el-table-column>
              <el-table-column
                prop="policyName"
                label="策略名"
                width="150">
              </el-table-column>
              <el-table-column
                prop="policyDescribe"
                label="策略描述">
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item prop="isResetPassword" label="是否重置密码：">
            <el-switch
              v-model="form.isResetPassword"
              active-color="#FA8334"
              inactive-color="#CCCCCC">
            </el-switch>
            <span class="item-tip">用户必须在下次登录时重置密码</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submit">{{ '确定' }}</el-button>
            <el-button @click="back">取消</el-button>
          </el-form-item>
        </el-form>  
      </div>
    </el-card>
    <el-card v-if="cardIndex === 'table'">
      <div class="main-box">
        <h2>成功新建成员</h2>
        <p class="item-tip">您已经成功新建用户，用户基础信息如下所示。您可以点击复制或者<a>下载</a>当前新建用户的所有信息。</p>
        <el-table :data="newUserData" style="width: 100%">
          <el-table-column
            prop="userName"
            label="用户名">
          </el-table-column>
          <el-table-column prop="passwords" label="密码">
            <template slot-scope="scope">
              <span>{{ showPasswords ? scope.row.passwords : '****'}}</span>
              <el-button v-if="showPasswords" type="text" @click="showPasswords = false">隐藏</el-button>
              <el-button v-else type="text" @click="showPasswords = true">显示</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="secrets" label="密钥">
            <template slot-scope="scope">
              SecretId：<span>{{ scope.row.secretId }}</span><br/>
              SecretKey：<span>{{ showSecretKey ? scope.row.secretKey : '****' }}</span>
              <el-button v-if="showSecretKey" type="text" @click="showSecretKey = false">隐藏</el-button>
              <el-button v-else type="text" @click="showSecretKey = true">显示</el-button>
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
@Component({
  name: 'CreateUser'
})
export default class extends Vue {
  private validateUserName = (rule: any, value: any, callback: Function) => {
    if(!/^[0-9a-zA-Z-]{1,}$/.test(value)){
      callback(new Error("仅允许包含大小写字母、数字、中划线"))
    }else {
      callback()
    }
  }
  private cardIndex: string = 'form'
  private breadCrumbContent: string = ''
  private form: any = {
    userName: '',
    accessType: 'control',
    policyChecked: [],
    isResetPassword: true,
    rules: {
      userName: [
        {required: true, message: '用户名必填', trigger: 'blur'},
        {validator: this.validateUserName, trigger: 'blur'},
      ],
      policyChecked: [
        {required: true, message: '请添加用户权限'}
      ]
    }
  }
  private policyList: Array<object> = [
    {
      policyName: '策略1',
      policyDescribe: '描述'
    },
    {
      policyName: '策略2',
      policyDescribe: '描述'
    },
    {
      policyName: '策略3',
      policyDescribe: '描述'
    },
    {
      policyName: '策略4',
      policyDescribe: '描述'
    },
    {
      policyName: '策略5',
      policyDescribe: '描述'
    }
  ]
  private newUserData: Array<object> = []
  private showPasswords: boolean = false
  private showSecretKey: boolean = false

  private handleSelectionChange(selection: any) {
    this.form.policyChecked = selection[0]
    if (selection.length > 1) {
      const policyList: any = this.$refs.policyList
      policyList.clearSelection()
      policyList.toggleRowSelection(selection.pop())
    }
  }

  private submit() {
    const form: any = this.$refs.userForm
    form.validate((valid: any) => {
      if(valid) {
        console.log(this.form)
        this.cardIndex = 'table'
        this.newUserData = [
          {
            userName: '用户01',
            passwords: 'yhJD-43/',
            secretId: 'AKIDS3OUO8N8rJ7k7DtA5sSZ8bxHWP2UwndC',
            secretKey: 'TfbLtDIFyxkMZgpmJfHfUX6XkhUVIrGV'
          }
        ]
      }
    })
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
    this.$message.success("复制成功")
  }

  private back() {
    this.$router.push(`/accessManage/user`)
  }

  private mounted() {
    this.breadCrumbContent = this.$route.meta.title
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
  .sign {
    margin-right: 30px;
  }
  .el-radio {
    margin-right: 5px;
  }
  .el-table {
    width: 700px;
    ::v-deep .el-table__header-wrapper  .el-checkbox {
      display:none
    }
  }
  .item-tip {
    font-size: 13px;
    color: #999999;
    margin-left: 10px;
  }
  .back-btn {
    margin-top: 20px;
    margin-left: 20px;
  }
</style>