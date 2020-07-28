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
        <li>API密钥用于您调用视频监控API时生成签名</li>
        <li>您的 API 密钥代表您的账号身份和所拥有的权限，等同于您的登录密码，切勿泄露他人，为了您的财产和服务安全，请妥善保存和定期更换密钥</li>
        <li>请勿通过任何方式（如 GitHub）上传或者分享您的密钥信息，一旦泄露至外部渠道，可能造成您的云上资产重大损失</li>
      </ul>
    </el-alert>
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">新建密钥</el-button>
      </div>
      <el-table v-loading="loading" :data="dataList" fit>
        <el-table-column label="密钥" min-width="200">
          <template slot-scope="{row}">
            <div>
              <span>{{ 'SecretId: ' + row.accessKey }}</span>
              <i v-clipboard:copy="row.accessKey" v-clipboard:success="copySuccess" v-clipboard:error="copyError" class="el-icon-copy-document ml10" />
            </div>
            <div>
              <span>{{ 'SecretKey: ' + (row.hidden ? '******' : row.secretKey) }}</span>
              <el-button class="ml10" type="text" @click="toggleHidden(row)">{{ row.hidden ? '显示' : '隐藏' }}</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column prop="updateTime" label="上次访问时间" min-width="160" />
        <el-table-column label="状态">
          <template slot-scope="{row}">
            <status-badge :status="row.status ? 'on' : 'warning'" />
            {{ secretStatus[row.status] }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status" type="text" @click="disableSecret(scope.row)">禁用</el-button>
            <template v-else>
              <el-button type="text" @click="enableSecret(scope.row)">启用</el-button>
              <el-button type="text" @click="deleteSecret(scope.row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { Secret } from '@/type/secret'
import { SecretStatus } from '@/dics'
import StatusBadge from '@/components/StatusBadge/index.vue'
import { getSecretList, createSecret, deleteSecret, enableSecret, disableSecret } from '@/api/secret'
import { MessageBox, Message } from 'element-ui'

@Component({
  name: 'secret-manage',
  components: { StatusBadge }
})
export default class extends Vue {
  private loading = false
  private dataList: Array<Secret> = []
  private secretStatus = SecretStatus

  private async mounted() {
    await this.getList()
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

  private toggleHidden(row: Secret) {
    this.$set(row, 'hidden', !row.hidden)
  }

  private async enableSecret(row: Secret) {
    try {
      this.loading = true
      const res = await enableSecret(row.id)
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
      const res = await disableSecret(row.id)
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
      this.getList()
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
      showConfirmButton: false
    })
    this.createSecret()
  }

  private async deleteSecret(row: Secret) {
    this.$confirm(`删除此密钥后无法再恢复，视频监控API将拒绝此密钥的所有请求。是否确定要删除此密钥？`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async() => {
      try {
        this.loading = true
        const res = await deleteSecret(row.id)
        this.getList()
      } catch (e) {
        // TODO LIST
        // 错误处理
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
  font-size: 16px!important;
  width: 16px!important;
}
ul.alert-desc {
  padding-inline-start: 16px;
  li:not(:first-child) {
    margin-top: 12px;
  }
}
::v-deep .el-alert {
  align-items: flex-start!important;
  .el-alert__title {
    line-height: 16px!important;
  }
}
</style>
