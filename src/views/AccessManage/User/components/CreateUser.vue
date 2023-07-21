<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card v-if="cardIndex === 'form'" v-loading="loading.form">
      <div>
        <el-steps :active="activeStep" :space="420" finish-status="success">
          <el-step title="填写账号信息" />
          <el-step title="设置账号策略" />
          <el-step title="审阅" />
        </el-steps>
        <el-form ref="userForm" :model="form" :rules="rules" label-position="right" label-width="150px">
          <div v-show="activeStep === 0">
            <el-form-item prop="userInfo" label="设置账号信息：" class="user-info">
              <el-table
                :data="form.userInfo"
                class="fixed-width-table"
                empty-text="暂无账号信息"
                max-height="300"
                row-key="id"
                style="margin-bottom: 10px;"
                size="mini"
              >
                <el-table-column prop="iamUserName" label="用户名">
                  <template slot-scope="{ row, $index }">
                    <el-form-item
                      :prop="'userInfo.' + $index + '.iamUserName'"
                      :rules="rules.iamUserName"
                      :inline-message="true"
                    >
                      <el-input v-model="row.iamUserName" placeholder="请填写用户名" />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column prop="email" label="邮箱">
                  <template slot-scope="{ row, $index }">
                    <el-form-item
                      :prop="'userInfo.' + $index + '.email'"
                      :rules="rules.email"
                      :inline-message="true"
                    >
                      <el-input v-model="row.email" placeholder="请填写邮箱" />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column prop="phone" label="手机">
                  <template slot-scope="{ row, $index }">
                    <el-form-item
                      :prop="'userInfo.' + $index + '.phone'"
                      :rules="rules.phone"
                      :inline-message="true"
                    >
                      <el-input v-model="row.phone" placeholder="请填写手机号" />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column prop="desc" label="备注">
                  <template slot-scope="{ row }">
                    <el-input v-model="row.desc" />
                  </template>
                </el-table-column>
                <el-table-column v-if="type === 'add'" label="操作" width="110">
                  <template slot-scope="scope">
                    <el-button type="text" @click="removeUser(scope.$index)">移除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-row
                v-if="form.userInfo.length"
                style="color: #888; font-size: 12px; line-height: 1; padding: 6px 0;"
              >
                用户名：2-16位，可包含大小写字母、数字、中文、中划线，用户名称不能重复。创建账号后，将会给该号码发送验证短信，验证通过后完成绑定。
              </el-row>
              <template v-if="type === 'add'">
                <el-button :disabled="form.userInfo.length >= 10" @click="addUser">添加成员</el-button>
                <el-button type="text">一次性最多添加10名成员</el-button>
              </template>
            </el-form-item>
            <el-form-item prop="accessType" label="访问方式：">
              <el-checkbox v-model="form.consoleEnabled" :disabled="type === 'edit'" @change="accessTypeChange">控制台访问</el-checkbox>
              <el-popover placement="top-start" title="控制台访问" width="400" trigger="hover" :open-delay="300" content="启用密码，允许用户登录到视频监控客户控制台。">
                <svg-icon slot="reference" class="form-question sign" name="help" />
              </el-popover>
              <el-checkbox v-model="form.apiEnabled" :disabled="type === 'edit'" @change="accessTypeChange">编程访问</el-checkbox>
              <el-popover placement="top-start" title="编程访问" width="400" trigger="hover" :open-delay="300" content="启用Access Key ID和Secret Access Key，支持API、SDK和其他开发工具访问。">
                <svg-icon slot="reference" class="form-question sign" name="help" />
              </el-popover>
            </el-form-item>
            <el-form-item prop="resetPwdEnabled" label="是否重置密码：">
              <el-switch v-model="form.resetPwdEnabled" active-color="#FA8334" inactive-color="#CCCCCC" />
              <span class="item-tip">用户必须在下次登录时重置密码</span>
            </el-form-item>
            <el-form-item prop="passwordLifeTime" label="密码有效期：">
              <el-radio-group v-model="form.passwordLifeTime">
                <el-radio
                  v-for="item in lifeTimeOptions"
                  :key="item.value"
                  :label="item.value"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item prop="maxOnline" label="最大登录人数：">
              <el-input v-model.number="form.maxOnline" placeholder="请填写最大登录人数" style="width: 320px;" />
            </el-form-item>
            <el-form-item prop="isMutualLogout" label="是否同端互踢：">
              <el-switch v-model="form.isMutualLogout" active-color="#FA8334" inactive-color="#CCCCCC" />
              <span class="item-tip">是否开启登录互踢</span>
            </el-form-item>
            <el-form-item v-if="type === 'edit'" prop="subUserLoginLink" label="子用户登录链接：">
              <span>{{ $route.query.subUserLoginLink }}</span>
              <el-tooltip class="item" effect="dark" content="复制链接" placement="top">
                <el-button type="text" style="margin-left: 10px;" @click="copyRow($route.query.subUserLoginLink, 'link')">
                  <svg-icon name="copy" />
                </el-button>
              </el-tooltip>
            </el-form-item>
          </div>
          <div v-show="activeStep === 1">
            <div class="group-dialog__inherited">
              <span class="group-dialog__inherited_title">继承上级部门策略:</span>
              <div class="group-dialog__inherited_tag">
                <template v-if="inheritedPolicies.length">
                  <el-tag
                    v-for="policy in inheritedPolicies"
                    :key="policy.name"
                    style="margin-right: 10px; margin-bottom: 3px;"
                  >
                    {{ `${policy.policyName}(${policy.groupDetails.groupName})` }}
                  </el-tag>
                </template>
                <el-button v-else type="text">暂无继承策略</el-button>
              </div>
            </div>
            <el-tabs v-model="activeName">
              <el-tab-pane label="自定义权限" name="select">
                <div style="margin-bottom: 10px;">请选择策略列表:</div>
                <el-form-item prop="policies" label-width="0">
                  <el-table
                    ref="policyList"
                    v-loading="loading.table"
                    class="fixed-width-table"
                    :data="policyList"
                    max-height="500"
                    @selection-change="handleSelectionChange"
                  >
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
                    <el-table-column prop="policyDesc" label="策略描述" :show-overflow-tooltip="true" min-width="180">
                      <template slot-scope="scope">
                        {{ scope.row.policyDesc || '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                      <template slot-scope="{ row }">
                        <el-button type="text" size="mini" @click="editPolicy(row)">{{ row.policyScope === 'ctyun' ? '查看策略' : '编辑策略' }}</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-form-item>
              </el-tab-pane>
              <el-tab-pane label="复用权限" name="copy" class="tab-pane__copy">
                <div class="tab-pane__copy_title">账号列表：</div>
                <el-form-item label-width="0" prop="copyUser">
                  <div v-loading="" class="tab-pane__copy_user-list">
                    <div class="tab-pane__copy_user-list_left">
                      <el-tree
                        ref="groupTree"
                        :props="props"
                        node-key="groupId"
                        highlight-current
                        :expand-on-click-node="false"
                        :default-expanded-keys="['']"
                        current-node-key=""
                        lazy
                        :load="loadGroups"
                        @current-change="loadIamUsers"
                      />
                    </div>
                    <div class="tab-pane__copy_user-list_right">
                      <el-table
                        ref="userList"
                        :data="userList"
                        class="user-table"
                        size="mini"
                        @selection-change="handleUserListChange"
                      >
                        <el-table-column type="selection" />
                        <el-table-column prop="iamUserName" label="账号名" min-width="120" />
                        <el-table-column prop="desc" label="备注" min-width="220" show-overflow-tooltip>
                          <template slot-scope="{ row }">
                            <span>{{ row.desc || '-' }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column label="账号关联策略" min-width="300">
                          <template slot-scope="{ row }">
                            <el-tag v-for="policy in row.policies" :key="policy.policyId" style="margin-right: 3px;">{{ policy.policyName }}</el-tag>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                  </div>
                </el-form-item>
              </el-tab-pane>
            </el-tabs>
          </div>
          <div v-show="activeStep === 2">
            <el-form-item label="账号信息：" prop="userInfo">
              <el-table
                :data="form.userInfo"
                class="fixed-width-table"
                empty-text="暂无账号信息"
                max-height="300"
                row-key="id"
                size="mini"
              >
                <el-table-column prop="iamUserName" label="用户名" />
                <el-table-column prop="email" label="邮箱" />
                <el-table-column prop="phone" label="手机" />
                <el-table-column prop="desc" label="备注" />
              </el-table>
            </el-form-item>
            <el-form-item prop="accessType" label="访问方式：">
              <el-checkbox v-model="form.consoleEnabled" :disabled="true">控制台访问</el-checkbox>
              <el-popover placement="top-start" title="控制台访问" width="400" trigger="hover" :open-delay="300" content="启用密码，允许用户登录到视频监控客户控制台。">
                <svg-icon slot="reference" class="form-question sign" name="help" />
              </el-popover>
              <el-checkbox v-model="form.apiEnabled" :disabled="true">编程访问</el-checkbox>
              <el-popover placement="top-start" title="编程访问" width="400" trigger="hover" :open-delay="300" content="启用Access Key ID和Secret Access Key，支持API、SDK和其他开发工具访问。">
                <svg-icon slot="reference" class="form-question sign" name="help" />
              </el-popover>
            </el-form-item>
            <el-form-item prop="resetPwdEnabled" label="是否重置密码：">
              <el-switch v-model="form.resetPwdEnabled" disabled active-color="#FA8334" inactive-color="#CCCCCC" />
              <span class="item-tip">用户必须在下次登录时重置密码</span>
            </el-form-item>
            <el-form-item prop="passwordLifeTime" label="密码有效期：">
              <el-radio-group v-model="form.passwordLifeTime" disabled>
                <el-radio
                  v-for="item in lifeTimeOptions"
                  :key="item.value"
                  :label="item.value"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item prop="maxOnline" label="最大登录人数：">
              <el-input v-model.number="form.maxOnline" disabled placeholder="请填写最大登录人数" style="width: 320px;" />
            </el-form-item>
            <el-form-item prop="isMutualLogout" label="是否同端互踢：">
              <el-switch v-model="form.isMutualLogout" disabled active-color="#FA8334" inactive-color="#CCCCCC" />
              <span class="item-tip">是否开启登录互踢</span>
            </el-form-item>
            <el-form-item label="生效策略：">
              <el-table :data="effectivePolicies" class="fixed-width-table" max-height="350">
                <template slot="empty">
                  <span>暂无策略，请先添加策略。</span>
                </template>
                <el-table-column prop="policyName" label="策略名" min-width="100" :show-overflow-tooltip="true" />
                <el-table-column
                  prop="inherited"
                  label="是否继承"
                >
                  <template slot-scope="{ row }">
                    <el-tag v-if="row.inherited" type="success">是</el-tag>
                    <el-tag v-else type="primary">否</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="scope" label="策略归属域" width="120">
                  <template slot-scope="scope">
                    <el-button v-if="scope.row.policyScope === 'ctyun'" type="danger" size="mini">系统策略</el-button>
                    <el-button v-else type="success" size="mini">自定义策略</el-button>
                  </template>
                </el-table-column>
                <el-table-column prop="policyDesc" label="策略描述" :show-overflow-tooltip="true" min-width="180">
                  <template slot-scope="scope">
                    {{ scope.row.policyDesc || '-' }}
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </div>
          <el-form-item label-width="0" style="width: 1000px;">
            <el-button :disabled="activeStep === 0" type="primary" @click="gotoPrev">上一步</el-button>
            <el-button :disabled="activeStep === 2" type="primary" @click="gotoNext">下一步</el-button>
            <el-button v-if="activeStep === 2" :disabled="loading.submit" type="primary" @click="operateUser(type)">确定</el-button>
            <el-button :disabled="loading.submit" @click="back">取消</el-button>
            <el-button
              v-if="activeStep === 2 && effectivePolicies.length"
              type="primary"
              style="float: right;"
              @click="showPreviewDialog"
            >
              预览权限详情
            </el-button>
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
            <template slot-scope="{ row }">
              <div v-if="row.passwords">
                <span>{{ row.showPasswords ? row.passwords : '****' }}</span>
                <span v-if="row.showPasswords" class="text-btn" @click="row.showPasswords = false">隐藏</span>
                <span v-else class="text-btn" @click="row.showPasswords = true">显示</span>
              </div>
              <div v-else>
                <span>--</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="secrets" label="密钥">
            <template slot-scope="{ row }">
              <div>
                <span>AccessKeyId：</span>
                <span>{{ row.secretId ? row.secretId : '--' }}</span>
              </div>
              <div v-if="row.secretKey">
                <span>SecretAccessKey：</span>
                <span>{{ row.showSecretKey ? row.secretKey : '****' }}</span>
                <span v-if="row.showSecretKey" class="text-btn" @click="row.showSecretKey = false">隐藏</span>
                <span v-else class="text-btn" @click="row.showSecretKey = true">显示</span>
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
    <PreviewPermission v-if="showPreviewPermission" :dialog-data="previewDialogData" @on-close="closePreviewDialog" />
  </div>
</template>

<script lang="ts">
import {
  createUser, getPolicyList, getUser, getUserList,
  modifyUser, getGroupList, getGroupInheritedPolicies, getGroup
} from '@/api/accessManage'
import TemplateBind from '@/views/components/TemplateBind.vue'
import copy from 'copy-to-clipboard'
import { Component, Vue } from 'vue-property-decorator'
import EditAccessType from './dialogs/EditAccessType.vue'
import PreviewPermission from './dialogs/PreviewPermission.vue'

Component.registerHooks(['beforeRouteEnter'])

@Component({
  components: {
    TemplateBind,
    EditAccessType,
    PreviewPermission
  },
  name: 'CreateUser'
})
export default class extends Vue {
  private type: any = ''
  private loading: any = {
    form: false,
    submit: false
  }
  private props: object = {
    label: 'groupName',
    children: 'children'
  }
  private showPreviewPermission = false
  private previewDialogData = {}
  private activeStep = 0
  private activeName = 'select'
  private userList = []
  private effectivePolicies = []
  private inheritedPolicies = []
  private cardIndex = 'form'
  private breadCrumbContent = ''
  private lifeTimeOptions = [
    {
      value: 30,
      label: '30天'
    },
    {
      value: 90,
      label: '90天'
    },
    {
      value: 180,
      label: '180天'
    },
    {
      value: 0,
      label: '永久'
    }
  ]
  private form: any = {
    userInfo: [],
    mainUserId: '',
    accessType: true,
    consoleEnabled: true,
    apiEnabled: false,
    resetPwdEnabled: true,
    passwordLifeTime: 0,
    maxOnline: 3,
    isMutualLogout: false,
    policies: [],
    copyUser: []
  }
  private rules: any = {
    iamUserName: [
      { required: true, message: '用户名不能为空', trigger: ['blur', 'change'] },
      { validator: this.validateUserName, trigger: 'blur' }
    ],
    userInfo: [
      { required: true, message: '至少添加一个成员', trigger: 'blur' }
    ],
    policies: [{ validator: this.validatePolicies, trigger: ['blur', 'change'] }],
    copyUser: [{ validator: this.validateCopyUser, trigger: ['blur', 'change'] }],
    accessType: [
      { required: true, validator: this.validateAccessType, trigger: 'change' }
    ],
    email: [
      { required: true, message: '邮箱不能为空', trigger: ['blur', 'change'] },
      { validator: this.validateEmail, trigger: 'blur' }
    ],
    phone: [
      { validator: this.validatePhone, trigger: 'blur' }
    ],
    passwordLifeTime: [
      { required: true, message: '请选择密码有效期', trigger: 'blur' }
    ],
    maxOnline: [
      { required: true, message: '请填写最大登录人数', trigger: 'blur' },
      { validator: this.validateMaxOnline, trigger: 'blur' }
    ],
    isMutualLogout: [
      { required: true, message: '请选择是否同端互踢', trigger: 'blur' }
    ]
  }
  private policyList: Array<object> = []
  private newUserData: Array<object> = []
  private showSecretKey = false
  private fromUrl = ''

  private editPolicy(row: any) {
    this.$router.push({
      path: '/access-manage/policy/edit',
      query: {
        policyId: row.policyId,
        policyScope: row.policyScope
      }
    })
  }

  private addUser() {
    const form: any = this.$refs.userForm
    form.clearValidate('userInfo')
    this.form.userInfo.push({
      id: new Date().getTime() + '',
      iamUserName: '',
      email: '',
      phone: '',
      desc: ''
    })
  }

  private removeUser(index: number) {
    this.form.userInfo.splice(index, 1)
  }

  private showPreviewDialog() {
    this.previewDialogData = {
      iamGroupId: this.$route.query.groupId,
      policyIds: this.effectivePolicies
        .filter(effectivePolicy => !effectivePolicy.inherited)
        .map(policy => policy.policyId)
    }
    this.showPreviewPermission = true
  }

  private closePreviewDialog() {
    this.showPreviewPermission = false
  }

  private gotoPrev() {
    this.activeStep -= 1
  }

  private gotoNext() {
    const validateArr = []
    if (this.activeStep === 0) {
      validateArr.push(...['userInfo', 'accessType', 'resetPwdEnabled', 'passwordLifeTime', 'maxOnline', 'isMutualLogout'])
      const tempArr = []
      this.form.userInfo.forEach((user: any, index: number) => {
        tempArr.push(`userInfo.${index}.iamUserName`, `userInfo.${index}.email`, `userInfo.${index}.phone`)
      })
      validateArr.push(...tempArr)
    } else if (this.activeStep === 1) {
      if (this.activeName === 'select') {
        validateArr.push('policies')
      } else {
        validateArr.push('copyUser')
      }
    }

    const validateResult = []
    const form: any = this.$refs.userForm
    form.validateField(validateArr, (errMessage) => {
      validateResult.push(errMessage)
    })
    if (validateResult.every(message => !message)) {
      this.activeStep += 1
      if (this.activeStep === 2) {
        const inheritedPolicies = this.inheritedPolicies.map((inheritedPolicy: any) => ({
          ...inheritedPolicy,
          inherited: true
        }))

        if (this.activeName === 'select') {
          this.effectivePolicies = inheritedPolicies.concat(this.form.policies)
        } else {
          this.effectivePolicies = inheritedPolicies.concat(this.form.copyUser?.[0]?.policies || [])
        }
      }
    }
  }

  private async loadIamUsers(data: any) {
    try {
      const params = {
        groupId: data.groupId,
        pageSize: -1,
        pageNum: -1
      }
      const res: any = await getUserList(params)
      this.userList = res.iamUsers.map((iamUser: any) => {
        return {
          iamUserId: iamUser.iamUserId,
          iamUserName: iamUser.iamUserName,
          desc: iamUser.desc,
          policies: iamUser.policies
        }
      })
    } catch (e) {
      console.log('e: ', e)
    }
  }

  private async loadGroups(node: any, resolve: Function) {
    if (node.level === 0) {
      await this.loadIamUsers({
        groupId: ''
      })
      return resolve([
        { groupName: '通讯录', groupId: '', children: [] }
      ])
    }
    try {
      const res = await getGroupList({
        parentGroupId: node.data.groupId
      })
      const groups = res.groups
      const dirs: any = groups.map((group: any) => {
        return {
          groupName: group.groupName,
          groupId: group.groupId
        }
      })
      resolve(dirs)
    } catch (e) {
      console.log(e)
    }
  }

  private accessTypeChange() {
    this.form.accessType = this.form.consoleEnabled || this.form.apiEnabled
  }

  private handleSelectionChange(selection: any) {
    console.log('selection: ', selection)
    this.form.policies = selection
  }

  private handleUserListChange(rows: any) {
    if (rows.length > 1) {
      const userList: any = this.$refs.userList
      userList.clearSelection()
      userList.toggleRowSelection(rows.pop())
    } else {
      this.form.copyUser = rows
    }
  }

  private rowClick(row: any) {
    const policyList: any = this.$refs.policyList
    policyList.toggleRowSelection(row)
  }

  private copyRow(row: any, type: any) {
    if (type === 'data') {
      const str = `
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
      const query: any = this.$route.query
      this.$router.push({
        name: 'AccessManageUser',
        params: {
          nodeKeyPath: query.nodeKeyPath
        }
      })
    }
  }

  private async initParentGroupInfo(parentGroupId: string) {
    try {
      const params = {
        groupId: parentGroupId
      }
      const [inheritedPoliciesRes, groupRes] =
        await Promise.all([getGroupInheritedPolicies(params), getGroup(params)])

      const iamPolicies: any = this.policyList
      const policyIds = groupRes.policyIds
      const tempPolicies = policyIds.map(id => {
        const policy = iamPolicies.find(iamPolicy => iamPolicy.policyId === id)
        return {
          policyId: policy.policyId,
          policyName: policy.policyName,
          policyDesc: policy.policyDesc,
          policyScope: policy.policyScope,
          groupDetails: {
            groupId: groupRes.groupId,
            groupName: groupRes.groupName,
            groupDesc: groupRes.groupDesc
          }
        }
      })
      const inheritPolicies = inheritedPoliciesRes.inheritedPolicies
      inheritPolicies.forEach(inherit => {
        if (!policyIds.includes(inherit.policyId)) {
          tempPolicies.push(inherit)
        }
      })
      this.inheritedPolicies = tempPolicies
    } catch (e) {
      this.$message.error(e)
    }
  }

  private async mounted() {
    try {
      this.loading.form = true
      await this.getPolicyList()
      this.type = this.$route.query.type
      const parentGroupId: any = this.$route.query.groupId
      await this.initParentGroupInfo(parentGroupId)
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
    const params: any = {
      pageSize: 1000,
      policyType: 'subUser'
    }
    try {
      const res: any = await getPolicyList(params)
      this.policyList = res.iamPolicies
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  private async getUser() {
    try {
      const userId = this.$router.currentRoute.query.userId
      const res = await getUser({
        iamUserId: userId
      })
      this.form = {
        userInfo: [{
          id: userId,
          iamUserName: res.iamUserName,
          email: res.email,
          phone: res.phone,
          desc: res.desc
        }],
        consoleEnabled: res.consoleEnabled === '1',
        apiEnabled: res.apiEnabled === '1',
        resetPwdEnabled: res.resetPwdEnabled === '1',
        accessType: res.apiEnabled === '1' || res.consoleEnabled === '1',
        passwordLifeTime: res.passwordLifeTime,
        maxOnline: res.maxOnline,
        isMutualLogout: res.isMutualLogout,
        policies: res.policies || [],
        copyUser: []
      }
      const policyList: any = this.$refs.policyList
      if (policyList) {
        res.policies.forEach(policy => {
          const selectRow = this.policyList.find((row: any) => {
            return row.policyId === policy.policyId
          })
          policyList.toggleRowSelection(selectRow)
        })
      }
    } catch (e) {
      this.$message.error(e && e.message)
      this.back()
    }
  }

  private async operateUser(type: any) {
    const form: any = this.$refs.userForm
    form.validate(async(valid: any) => {
      const form = this.form
      const params: any = {
        userProperties: this.form.userInfo,
        policyIds: this.activeName === 'select'
          ? form.policies.map(policy => policy.policyId)
          : form.copyUser?.[0]?.policies.map(policy => policy.policyId),
        consoleEnabled: form.consoleEnabled ? '1' : '2',
        apiEnabled: form.apiEnabled ? '1' : '2',
        resetPwdEnabled: form.resetPwdEnabled ? '1' : '2',
        passwordLifeTime: form.passwordLifeTime,
        maxOnline: form.maxOnline,
        isMutualLogout: form.isMutualLogout
      }
      try {
        if (valid) {
          this.loading.submit = true
          if (type === 'add') {
            params.groupId = this.$router.currentRoute.query.groupId
            const res = await createUser(params)
            this.cardIndex = 'table'
            if (res.verifySMSSent) {
              this.$message.success('手机号信息更新，平台将会发送绑定验证短信，请注意查收确认')
            }
            this.newUserData = res.createdUserInfos.map(userInfo => ({
              mainUserId: userInfo.mainUserId,
              userName: userInfo.iamUserName,
              passwords: userInfo.iamUserPasswd,
              secretId: userInfo.ak,
              secretKey: userInfo.sk,
              showPasswords: false,
              showSecretKey: false
            }))
          } else if (type === 'edit') {
            const row = this.form.userInfo[0]
            params.iamUserId = this.$router.currentRoute.query.userId
            params.iamUserName = row.iamUserName
            params.phone = row.phone
            params.email = row.email
            params.desc = row.desc
            delete params.userProperties
            const res = await modifyUser(params)
            if (res.verifySMSSent) {
              this.$message.success('修改用户成功！手机号信息更新，平台将会发送绑定验证短信，请注意查收确认')
            } else {
              this.$message.success('修改用户成功')
            }
            this.back()
          }
        } else {
          this.$message.error('存在校验未通过字段，请检查确认！')
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
    const exelName = '新建用户的所有信息'
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
    const blob = new Blob([buffer], { type: 'application/xlsx' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${exelName}.xlsx`
    link.click()
  }

  private validateUserName(rule: any, value: any, callback: Function) {
    if (!value) {
      callback(new Error('用户名必填'))
    } else if (!/^[\u4e00-\u9fa50-9a-zA-Z-]{2,16}$/.test(value)) {
      callback(new Error('2-16位，可包含大小写字母、数字、中划线'))
    } else {
      callback()
    }
  }

  private validatePolicies(rule: any, value: any, callback: Function) {
    if (this.activeName === 'select' && !this.inheritedPolicies.length && !this.form.policies.length) {
      callback(new Error('无继承策略情况下，请至少勾选一条策略'))
    } else {
      callback()
    }
  }

  private validateCopyUser(rule: any, value: any, callback: Function) {
    if (this.activeName === 'copy' && !this.form.copyUser.length) {
      callback(new Error('请选择要拷贝权限的用户'))
    } else if (this.activeName === 'copy' && !this.inheritedPolicies.length && !this.form.copyUser[0].policies.length) {
      callback(new Error('拷贝该用户后会导致无生效策略，请切换其他用户'))
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
    if (!value) {
      callback(new Error('邮箱必填'))
    } else if (value && !/^[\w-.]+@[a-zA-Z\d-]+(\.[a-zA-Z]{2,8}){1,2}$/gi.test(value)) {
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

  private validateMaxOnline(rule: any, value: string, callback: Function) {
    if (!/^[1-9]\d*$/.test(value)) {
      callback(new Error('最大登录人数只能为正整数'))
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

.fixed-width-table.el-table {
  width: 850px;

  ::v-deep {
    .el-table__header-wrapper .el-checkbox {
      display: none;
    }
  }
}

.user-table.el-table {
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
  color: $primary;
  margin-left: 10px;
  cursor: pointer;
}

.back-btn {
  margin-top: 20px;
  margin-left: 20px;
}

.tab-pane__copy {
  &_title {
    margin-bottom: 10px;
  }

  &_user-list {
    display: flex;
    border: 1px solid #dfe6ec;

    &_left {
      margin-bottom: 8px;
      width: 40%;
    }

    &_right {
      width: 60%;
      border-left: 1px solid #dfe6ec;
    }
  }
}

.group-dialog {
  &__inherited {
    margin-bottom: 7px;

    &_title {
      font-size: 16px;
      display: inline-block;
      margin-bottom: 10px;
    }

    &_tag {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
    }
  }

  &__policy {
    margin-bottom: 20px;

    &_title {
      font-size: 16px;
      display: inline-block;
      margin-bottom: 10px;
    }
  }
}

::v-deep .user-info .is-required .el-input.el-input--medium {
  .el-input__inner {
    width: 90%;
  }

  &:before {
    content: '*';
    color: #f5212d;
    margin-right: 4px;
  }
}
</style>
