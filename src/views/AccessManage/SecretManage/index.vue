<template>
  <div class="app-container">
    <el-alert
      type="info"
      show-icon
      :closable="false"
      class="mb10"
    >
      <span slot="title">使用提示</span>
      <ul class="alert-desc">
        <li>API密钥是构建 API 请求的重要凭证。用于您调用视频监控API时生成签名，查看<el-link href="https://vcn.ctyun.cn/document/api/RequestMethod/Signature" target="_blank">生成签名算法</el-link></li>
        <li>如果访问密钥泄露，可能造成您的云上资产重大损失。每个访问密钥仅能下载一次，为了帐号安全性，建议您定期更换并妥善保存API密钥。</li>
      </ul>
    </el-alert>
    <el-card>
      <div class="filter-container">
        <el-button type="primary" :disabled="!canCreateFlag" @click="handleCreate">新建密钥</el-button>
        <span class="hint">您还可以添加<span class="num">{{2 - dataList.length}}</span>个API密钥</span>
      </div>
      <el-table :data="dataList" fit>
        <el-table-column label="API密钥ID" min-width="300">
          <template slot-scope="{ row }">
            <div>
              <span>{{ row.accessKey }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="160" />
        <el-table-column prop="createdTime" label="创建时间" min-width="160" />
        <el-table-column prop="updatedTime" label="上次访问时间" min-width="160" />
        <el-table-column label="状态">
          <template slot-scope="{ row }">
            <status-badge :status="row.status" />
            {{ secretStatus[row.status === 'on'] || "已启用" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template slot-scope="scope">
            <template v-if="scope.row.status === 'on'">
              <el-button type="text" @click="editSecret(scope.row)">编辑</el-button>
              <el-button type="text" :disabled="canDisable" @click="disableSecret(scope.row)">禁用</el-button>
              <el-button type="text" @click="deleteSecret(scope.row)">删除</el-button>
            </template>
            <template v-else>
              <el-button type="text" @click="editSecret(scope.row)">编辑</el-button>
              <el-button type="text" @click="enableSecret(scope.row)">启用</el-button>
              <el-button type="text" @click="deleteSecret(scope.row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <tip-dialog
      v-if="showTipDialog"
      :data="dialogData"
      :step="dialogStep"
      :loading="dialogLoading"
      :edit-flag="editFlag"
      @on-close="closeTipDialog"
      @create-secret="createSecret"
      @edit-secret="editSecretDesc"
      @loading-change="loadingChange"
    />
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { Secret, SecretTip } from '@/type/Secret'
import { SecretStatus } from '@/dics'
import StatusBadge from '@/components/StatusBadge/index.vue'
import TipDialog from './components/TipDialog.vue'
import { getSecretList, createSecret, deleteSecret, enableSecret, disableSecret, updateSecret } from '@/api/secret'
import { UserModule } from '@/store/modules/user'
import format from 'date-fns/format'

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

  private dialogStep = 0

  private editFlag = false

  private apiForm: any = { type: false }

  private closeTipDialog() {
    this.dialogData = {
      type: '',
      headline: '',
      id: '',
      accessKey: '',
      secretKey: '',
      description: ''
    }
    this.showTipDialog = false
    this.dialogStep = 0
    this.editFlag = false
  }

  private async mounted() {
    await this.getList()
  }

  private get canCreateFlag() {
    return !this.loading && this.dataList.length < 2
  }

  private get canDisable(){
    let count = 0
    this.dataList.forEach(data => {
      data.status === 'on' && count++
    })
    return count < 2
  }

  private get isPrivate() {
    return UserModule.isPrivate
  }

  private async getList() {
    try {
      this.loading = true
      const { keys } = await getSecretList()
      this.dataList = keys.map(key => ({
        ...key,
        createdTime: format(new Date(+key.createdTime), 'yyyy-MM-dd HH:mm:ss'),
        updatedTime: format(new Date(+key.updatedTime), 'yyyy-MM-dd HH:mm:ss'),
      }))
      this.dialogStep = 1
    } catch (e) {
      // TODO
      // 错误处理
    } finally {
      this.loading = false
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
      this.$message({
        message: e,
        type: 'error'
      })
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  private async editSecret(row: Secret){
    this.showTipDialog = true
    this.dialogStep = 0
    this.dialogData = {
        type: 'api',
        headline: '编辑密钥',
        id: row.id + '',
        accessKey: row.accessKey,
        secretKey: row.secretKey,
        description: row.description
      }
    this.editFlag = true
  }

  private async editSecretDesc({ id, description }){
    try {
      await updateSecret({ id, description })
      this.$message.success('更新密钥成功')
    } catch (e){
      this.$message.error('更新失败：' + e)
    } finally {
      this.getList()
      this.showTipDialog = false
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
      this.$message({
        message: e,
        type: 'error'
      })
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  private async createSecret(description) {
    try {
      this.dialogLoading = true
      const res = await createSecret({ description })
      await this.getList()
      this.dialogData = {
        type: 'api',
        headline: '新建密钥成功',
        id: res.id,
        accessKey: res.accessKey,
        secretKey: res.secretKey,
        description: res.description
      }
      this.dialogStep = 1
      this.dialogLoading = false
      this.$forceUpdate()
      // this.showTipDialog = true
    } catch (e) {
      // TODO
      // 错误处理
    }
  }

  private handleCreate() {
    this.dialogStep = 0
    this.showTipDialog = true
    this.dialogData = {
      type: '',
      headline: '新建密钥',
      id: '',
      accessKey: '',
      secretKey: '',
      description: ''
    }
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

  private loadingChange(status){
    this.dialogLoading = status
    this.$forceUpdate()
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

.hint {
  margin-left: 20px;

  .num {
    color: red;
  }
}
</style>
