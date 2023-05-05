<template>
  <div class="app-container">
    <el-card>
      <div class="filter-container">
        <el-button type="primary" @click="handleCreate">新建GB35114凭证</el-button>
        <div class="filter-container__right">
          <el-input
            v-model="searchKey"
            class="filter-container__search-group"
            placeholder="请输入设备名称/国标ID"
            clearable
            @keyup.enter.native="handleFilter"
          >
            <el-button
              slot="append"
              class="el-button-rect"
              @click="handleFilter"
            >
              <svg-icon name="search" />
            </el-button>
          </el-input>
          <el-button class="el-button-rect" @click="refresh">
            <svg-icon name="refresh" />
          </el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="dataList" fit>
        <el-table-column prop="sort" label="序号" min-width="100">
          <template slot-scope="{ $index }">
            {{ $index + 1 + pager.pageSize * (pager.pageNum - 1) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="160" show-overflow-tooltip />
        <el-table-column prop="deviceName" label="设备名称" min-width="160" />
        <el-table-column prop="outId" label="国标ID" min-width="200" />
        <el-table-column prop="createTime" label="创建时间" min-width="160">
          <template slot-scope="{ row }">
            {{ dateFormat(+row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="160">
          <template slot-scope="{ row }">
            {{ dateFormat(+row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="expireTime" label="证书有效期时间" min-width="160">
          <template slot-scope="{ row }">
            {{ dateFormat(+row.expireTime * 1000) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100">
          <template slot-scope="{ row }">
            {{ row.status === 'on' ? '使用中' : '未使用' }}
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作" width="180" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" @click="edit(row)">编辑</el-button>
            <el-button type="text" @click="downloadCertificate(row)">下载证书</el-button>
            <el-button type="text" :disabled="row.status === 'on'" @click="deleteCertificate(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="pager.pageNum"
        :page-size="pager.pageSize"
        :total="pager.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Watch } from 'vue-property-decorator'
import { dateFormat } from '@vss/base/utils/date'
import { describeGb35114CertificateList, deleteGb35114Certificate, downloadGb35114Certificate } from '@vss/device/api/certificate'

@Component({
  name: 'CertificateGb35114List'
})
export default class extends Vue {
  private userType = ''
  private searchKey = ''
  private loading = false
  private dataList = []
  private pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private dateFormat = dateFormat

  @Watch('dataList.length')
  private onDataListChange(data: any) {
    data === 0 &&
      this.pager.pageNum > 1 &&
      this.handleCurrentChange(this.pager.pageNum - 1)
  }

  private async refresh() {
    await this.getList()
  }

  private async mounted() {
    await this.getList()
  }

  private async getList() {
    this.loading = true
    try {
      const params = {
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize,
        searchKey: this.searchKey
      }
      const res = await describeGb35114CertificateList(params)
      this.dataList = res.gb35114Certs
      this.pager.total = res.totalNum
      this.pager.pageSize = res.pageSize
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getList()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getList()
  }

  private handleCreate() {
    this.$router.push('/certificate/gb35114/create')
  }

  private async handleFilter() {
    this.pager.pageNum = 1
    await this.getList()
  }

  private edit(row: any) {
    this.$router.push({
      name: 'gb35114-update',
      params: {
        outId: row.outId,
        certId: row.certId
      }
    })
  }

  private async deleteCertificate(row) {
    this.$alertDelete({
      type: 'GB35114凭证',
      msg: '是否确认删除GB35114凭证',
      method: deleteGb35114Certificate,
      payload: {
        outId: row.outId,
        certId: row.certId
      },
      onSuccess: this.getList
    })
  }

  /**
   * 下载证书
   */
  private async downloadCertificate(row) {
    try {
      const res = await downloadGb35114Certificate({ outId: row.outId })
      const file = res.certsZip
      const blob = this.base64ToBlob(`data:application/zip;base64,${file}`)
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = '相关证书文件压缩包'
      link.click()
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  // base64转blob
  public base64ToBlob(base64: any) {
    const arr = base64.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  &__search-group {
    margin-right: 10px;
  }

  &__select {
    display: inline;
    margin-right: 10px;
  }
}
</style>
