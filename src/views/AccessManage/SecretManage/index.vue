<template>
  <div class="app-container">
    <el-tabs v-model="activeName" v-loading="loading" type="border-card">
      <el-tab-pane label="API密钥管理" name="secret">
        <el-alert
          type="info"
          show-icon
          :closable="false"
          class="mb10"
        >
          <span slot="title">使用提示</span>
          <ul class="alert-desc">
            <li>API密钥用于您调用视频监控API时生成签名</li>
            <li>您的 API 密钥代表您的账号身份和所拥有的权限，等同于您的登录密码，切勿泄露他人，为了您的财产和服务安全，请妥善保存和定期更换密钥</li>
            <li>请勿通过任何方式（如 GitHub）上传或者分享您的密钥信息，一旦泄露至外部渠道，可能造成您的云上资产重大损失</li>
          </ul>
        </el-alert>
        <el-card>
          <div class="filter-container">
            <el-button type="primary" :disabled="!canCreateFlag" @click="handleCreate">新建密钥</el-button>
          </div>
          <el-table :data="dataList" fit>
            <el-table-column label="密钥" min-width="300">
              <template slot-scope="{row}">
                <div>
                  <span>{{ 'AccessKeyId: ' + row.accessKey }}</span>
                  <el-button v-clipboard:copy="row.accessKey" v-clipboard:success="copySuccess" v-clipboard:error="copyError" type="text" class="ml10">
                    <svg-icon name="copy" />
                  </el-button>
                </div>
                <div>
                  <span>{{ 'SecretAccessKey: ****** ' }}</span>
                  <el-popover
                    placement="right"
                    width="400"
                    trigger="hover"
                    :open-delay="300"
                    content="若SecretAccessKey遗失，请删除该密钥并重新创建"
                  >
                    <svg-icon slot="reference" class="form-question" name="help" />
                  </el-popover>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="createdTime" label="创建时间" min-width="160" />
            <el-table-column prop="updatedTime" label="上次访问时间" min-width="160" />
            <el-table-column label="状态">
              <template slot-scope="{row}">
                <status-badge :status="row.status ? 'on' : 'warning'" />
                {{ secretStatus[row.status] || "已启用" }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="200" fixed="right">
              <template slot-scope="scope">
                <template v-if="scope.row.status">
                  <el-button type="text" disabled @click="disableSecret(scope.row)">禁用</el-button>
                  <el-button type="text" @click="deleteSecret(scope.row)">删除</el-button>
                </template>
                <template v-else>
                  <el-button type="text" disabled @click="enableSecret(scope.row)">启用</el-button>
                  <el-button type="text" @click="deleteSecret(scope.row)">删除</el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      <el-tab-pane v-if="!isPrivate" label="OpenAPI授权" name="open">
        <el-alert
          type="info"
          show-icon
          :closable="false"
          class="mb10"
        >
          <span slot="title">使用提示</span>
          <ul class="alert-desc">
            <li>OpenAPI平台正在使用临时授权AK/SK访问资源和数据，调用时将发起线上真实资源操作，请谨慎使用以保护您的数据安全</li>
          </ul>
        </el-alert>
        <el-form :model="apiForm" label-width="240px">
          <el-form-item label="授权服务:">
            <span>OpenAPI</span>
          </el-form-item>
          <el-form-item label="授权时间:">
            <span>{{ apiForm.createdTime ? apiForm.createdTime : '—' }}</span>
          </el-form-item>

          <el-form-item label="AccessKeyId:">
            <span>{{ apiForm.accessKey ? `${apiForm.accessKey}` : '—' }}</span>
            <el-button v-if="apiForm.type" v-clipboard:copy="apiForm.accessKey" v-clipboard:success="copySuccess" v-clipboard:error="copyError" type="text" class="ml10">
              <svg-icon name="copy" />
            </el-button>
          </el-form-item>
          <el-form-item label="SecretAccessKey:">
            <span>{{ apiForm.type ? '****** ' : '—' }}</span>
            <el-popover
              v-if="apiForm.type"
              placement="right"
              width="400"
              trigger="hover"
              :open-delay="300"
              content="若SecretAccessKey遗失，请先取消授权，并重新授权"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="operateAuth">{{ `${apiForm.type ? '取消' : '立即'}授权` }}</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <tip-dialog v-if="showTipDialog" :data="dialogData" @on-close="closeTipDialog" />
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { Secret, SecretTip } from '@/type/Secret'
import { SecretStatus } from '@/dics'
import StatusBadge from '@/components/StatusBadge/index.vue'
import TipDialog from './components/TipDialog.vue'
import { getSecretList, createSecret, deleteSecret, enableSecret, disableSecret } from '@/api/secret'
import { MessageBox } from 'element-ui'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'secret-manage',
  components: { StatusBadge, TipDialog }
})
export default class extends Vue {
  private loading = false
  private dataList: Array<Secret> = []
  private secretStatus = SecretStatus
  private showTipDialog = false
  private dialogData: SecretTip

  private activeName = 'secret'
  private apiForm: any = { type: false }

  private closeTipDialog() {
    this.dialogData = {
      type: '',
      headline: '',
      id: '',
      accessKey: '',
      secretKey: ''
    }
    this.showTipDialog = false
  }

  private async mounted() {
    await this.getList()
    this.getAuth()
  }

  private get canCreateFlag() {
    return !this.loading && this.dataList.length < 2
  }

  private get isPrivate() {
    return UserModule.isPrivate
  }

  private async getList() {
    try {
      this.loading = true
      const res = await getSecretList()
      this.dataList = res.keys
    } catch (e) {
      // TODO
      // 错误处理
    } finally {
      this.loading = false
    }
  }

  private async getAuth() {
    try {
      const res = await getSecretList({ type: 'public' })
      if (res.keys.length > 0) {
        this.apiForm = { ...res.keys[0], type: true }
      } else {
        this.apiForm = { type: false }
      }
    } catch (e) {
      this.$message({
        message: e,
        type: 'error'
      })
    }
  }

  private copySuccess() {
    this.$message({
      message: '密钥拷贝成功',
      type: 'success'
    })
  }

  private copyError() {
    this.$message({
      message: '密钥拷贝失败',
      type: 'error'
    })
  }

  private async enableSecret(row: Secret) {
    try {
      this.loading = true
      await enableSecret(row.id)
      this.$message({
        message: '启用密钥成功',
        type: 'success'
      })
      this.getList()
    } catch (e) {
      // TODO
      // 错误处理
    } finally {
      this.loading = false
    }
  }

  private async disableSecret(row: Secret) {
    try {
      this.loading = true
      await disableSecret(row.id)
      this.$message({
        message: '禁用密钥成功',
        type: 'success'
      })
      this.getList()
    } catch (e) {
      // TODO
      // 错误处理
    } finally {
      this.loading = false
    }
  }

  private async createSecret() {
    try {
      const res = await createSecret()
      await this.getList()
      this.dialogData = {
        type: 'api',
        headline: '新建密钥成功',
        id: res.id,
        accessKey: res.accessKey,
        secretKey: res.secretKey
      }
      this.showTipDialog = true
    } catch (e) {
      // TODO
      // 错误处理
    } finally {
      MessageBox.close()
    }
  }

  private handleCreate() {
    MessageBox.alert('请稍后，正在创建密钥......', '正在创建密钥', {
      showClose: false,
      closeOnClickModal: false,
      showConfirmButton: false
    })
    this.createSecret()
  }

  private async deleteSecret(row: Secret) {
    this.$confirm('删除此密钥后无法再恢复，视频监控API将拒绝此密钥的所有请求。是否确定要删除此密钥？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async() => {
      try {
        this.loading = true
        await deleteSecret(row.id)
        await this.getList()
      } catch (e) {
        // TODO LIST
        // 错误处理
      } finally {
        this.loading = false
      }
    })
  }

  private async operateAuth() {
    const auth = '同意赋予OpenAPI权限后，将允许该服务调用部分开放接口，访问您视频监控资源，并读取您在视频监控上产生的业务数据，请谨慎使用以保护您的数据安全？'
    const unauth = '取消后将暂停OpenAPI的访问权限（可按需重新授权），确定取消？'
    this.$confirm(this.apiForm.type ? unauth : auth,
      `${this.apiForm.type ? '取消' : ''}授权`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async() => {
      try {
        this.loading = true
        const res = this.apiForm.type ? await deleteSecret(this.apiForm.id, 'public') : await createSecret({ type: 'public' })
        this.$message({
          message: `${this.apiForm.type ? '取消' : ''}授权成功`,
          type: 'success'
        })
        await this.getAuth()
        if (this.apiForm.type) {
          this.dialogData = {
            type: 'public',
            headline: 'OpenAPI授权成功',
            id: res.id,
            accessKey: res.accessKey,
            secretKey: res.secretKey
          }
          this.showTipDialog = true
        }
      } catch (e) {
        this.$message({
          message: `${this.apiForm.type ? '取消' : ''}授权失败 :${e}`,
          type: 'error'
        })
      } finally {
        this.loading = false
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.filter-container__search-group {
  margin-right: 10px;
}

::v-deep .el-alert__icon.is-big {
  font-size: 16px !important;
  width: 16px !important;
}

ul.alert-desc {
  padding-inline-start: 16px;

  li:not(:first-child) {
    margin-top: 12px;
  }
}

::v-deep .el-alert {
  align-items: flex-start !important;

  .el-alert__title {
    line-height: 16px !important;
  }
}
</style>
