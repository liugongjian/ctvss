<template>
  <div class="app-container">
    <el-card>
      <template v-if="subscribeStatus === 0">
        <div class="title">
          <div class="title-block" />
          <div>已开通计费项</div>
        </div>
        <el-descriptions
          label-class-name="desc-label"
          content-class-name="desc-content"
          :column="1"
          border
        >
          <el-descriptions-item v-if="billInfo && billInfo['VSS_VIDEO_OD']">
            <template slot="label"> 设备 </template>
            设备管理费
          </el-descriptions-item>
          <el-descriptions-item
            v-if="
              billInfo &&
                (billInfo['VSS_UPLOAD_BW_OD'] || billInfo['VSS_DOWNLOAD_BW_OD'])
            "
          >
            <template slot="label"> 带宽 </template>
            <div class="desc-button">
              <div>
                <div v-if="billInfo['VSS_UPLOAD_BW_OD']">
                  上行带宽
                  <span
                    v-if="
                      billingType[billInfo['VSS_UPLOAD_BW_OD'].billingType] &&
                        billingType[billInfo['VSS_UPLOAD_BW_OD'].billingType]
                          .length > 0
                    "
                  >
                    {{
                      '(' +
                        billingType[billInfo['VSS_UPLOAD_BW_OD'].billingType] +
                        ')'
                    }}
                  </span>
                </div>
                <div v-if="billInfo['VSS_DOWNLOAD_BW_OD']">
                  下行带宽
                  <span
                    v-if="
                      billingType[billInfo['VSS_DOWNLOAD_BW_OD'].billingType] &&
                        billingType[billInfo['VSS_DOWNLOAD_BW_OD'].billingType]
                          .length > 0
                    "
                  >
                    {{
                      '(' +
                        billingType[billInfo['VSS_DOWNLOAD_BW_OD'].billingType] +
                        ')'
                    }}
                  </span>
                </div>
              </div>
              <!-- <div><el-button type="text" @click="changeChargeType">变更带宽计费类型</el-button></div> -->
            </div>
          </el-descriptions-item>
          <el-descriptions-item v-if="billInfo && billInfo['VSS_STORAGE_OD']">
            <template slot="label"> 存储 </template>
            <div v-if="billInfo['VSS_STORAGE_OD'].storageType === '2'">
              <div>视频存储费</div>
              <div>视图存储费</div>
            </div>
            <div v-else>
              <div v-if="billInfo['VSS_STORAGE_OD'].storageType === '0'">
                视频存储费
              </div>
              <div v-if="billInfo['VSS_STORAGE_OD'].storageType === '1'">
                视图存储费
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item v-if="billInfo && billInfo['VSS_AI_OD']">
            <template slot="label"> AI服务 </template>
            <div>AI服务费</div>
          </el-descriptions-item>
        </el-descriptions>
      </template>
      <div v-else>
        <div class="title no-content">
          <div class="title-block" />
          <div>{{ `计费状态：${subscribeStatus === 2 ? '已冻结' : '未开通'}` }}</div>
        </div>
      </div>
      <div class="title">
        <div class="title-block" />
        <div>历史记录</div>
      </div>
      <el-table :data="tableData" style="width: 100%;">
        <el-table-column prop="billingType" label="计费模式变更">
        </el-table-column>
        <el-table-column prop="updateTime" label="变更时间"> </el-table-column>
        <el-table-column prop="effectiveTime" label="生效时间">
        </el-table-column>
      </el-table>
    </el-card>
    <dialogue :visible.sync="dialogueVisible" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import Dialogue from './component/Dialogue.vue'
import {
  getBillOfOndemand,
  getBillTypeLogs,
  getIsOndemand
} from '@/api/billing'
import { resourceTypes, billingType } from '@/dics'
import { dateFormat } from '@/utils/date'

@Component({
  name: 'OnDemand',
  components: {
    Dialogue
  }
})
export default class extends Vue {
  private dialogueVisible = false
  private tableData = []

  private billInfo = {}

  private subscribeStatus = 1

  private resourceTypes = resourceTypes

  private billingType = billingType

  @Watch('$route.path')
  public pathChange() {
    this.$nextTick(() => {
      if (this.$route.path === '/billing/ondemand') {
        this.getData()
      }
    })
  }

  private mounted() {
    this.getData()
  }

  private async getData() {
    this.resetData()
    const { onDemandSubscribeStatus } = await getIsOndemand()
    this.subscribeStatus = onDemandSubscribeStatus
    if (this.subscribeStatus !== 1) {
      getBillOfOndemand().then((res) => {
        if (res.onDemandResources) {
          res.onDemandResources.forEach((resource) => {
            this.$set(this.billInfo, resource.resourceType, resource)
          })
        }
      })
      getBillTypeLogs().then((res) => {
        this.tableData = res.historyRecords.map((record) => ({
          billingType:
            record.billingType === 'DAY_PEAK'
              ? '带宽计费类型：日峰值带宽'
              : '带宽计费类型：按流量',
          updateTime: dateFormat(+record.updateTime * 1000),
          effectiveTime: dateFormat(+record.effectiveTime * 1000)
        }))
      })
    }
  }

  private resetData() {
    this.isSubscribe = false
    this.billInfo = {}
    this.tableData = []
  }

  private changeChargeType() {
    this.dialogueVisible = true
  }
}
</script>
<style lang="scss" scoped>
.el-card {
  padding: 0 20px;
  min-height: 88vh;

  ::v-deep &__body {
    padding: 0 !important;
  }

  ::v-deep .desc-label {
    width: 150px;
    text-align: right;
    padding-right: 20px;
  }

  ::v-deep .desc-content {
    padding-left: 20px;
    line-height: 30px;
  }

  .desc-button {
    display: flex;
    justify-content: space-between;
  }

  .title {
    margin-top: 23px;
    display: flex;
    margin-bottom: 16px;

    .title-block {
      width: 4px;
      height: 14px;
      background-color: $primary;
      border: none;
      margin-top: 2px;
      margin-right: 12px;
      display: inline-block;

      & ~ div {
        font-size: 14px;
        color: #333;
        line-height: 20px;
        font-weight: 500;
      }
    }
  }

  .no-content {
    margin-bottom: 155px;
  }
}
</style>
