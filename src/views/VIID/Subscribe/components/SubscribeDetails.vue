<template>
  <el-dialog
    title="订阅详情"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="700px"
    center
    class="dialog"
    @close="closeDialog"
  >
    <div class="detail__section">
      <el-descriptions :column="2">
        <el-descriptions-item label="订阅标题">
          {{ detail.title || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="订阅ID">
          {{ detail.subscribeID || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="订阅资源路径">
          {{ detail.resourceURI || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="信息接收地址">
          {{ detail.receiveAddr || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="申请人">
          {{ detail.applicantName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="申请单位">
          {{ detail.applicantOrg || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="订阅执行状态">
          {{ SubscribeStatus[detail.subscribeStatus] || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="订阅类别">
          {{ handleSubscribeDetail(detail.subscribeDetail) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="理由">
          {{ detail.reason || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ formatTime(detail.beginTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ formatTime(detail.endTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatTime(detail.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="订阅取消人">
          {{ detail.subscribeCancelPerson || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="订阅取消单位">
          {{ detail.subscribeCancelOrg || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="取消时间">
          {{ formatTime(detail.cancelTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="取消原因">
          {{ detail.cancelReason || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">关 闭</el-button>
    </div>
  </el-dialog>
</template>
<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator'
import { subscribeDetailList, subscribeStatus } from '@/dics/viid'
import { dateFormat } from '@/utils/date'

@Component({
  name: 'SubscribeDetails'
})
export default class extends Vue {
  @Prop() private detail
  private dialogVisible = true
  private SubscribeStatus = subscribeStatus
  private handleSubscribeDetail(detail) {
    const res = []
    const details = detail.split(',')
    details.forEach(item => {
      res.push(subscribeDetailList.find(d => d.value === item).label)
    })
    return res.join('，')
  }
  private formatTime(val) {
    if (val === 0) return '-'
    return dateFormat(new Date(val))
  }

  private closeDialog() {
    this.$emit('on-close')
  }
}
</script>

<style lang="scss" scoped>
.detail__section {
  padding: 0 15px;
  overflow: hidden;
}

::v-deep .el-descriptions {
  &__header {
    margin: 10px 0;
  }

  &-item {
    vertical-align: top;

    &__content {
      word-break: break-all;
    }

    &__label {
      min-width: 100px;
      text-align: right;
      color: $textGrey;
    }
  }

  td {
    padding: 10px 0;
  }

  .el-link {
    margin-left: 10px;
  }
}

.dialog-footer {
  margin-top: 30px;
  text-align: center;
}
</style>
