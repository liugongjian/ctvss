<template>
  <el-tabs v-model="resourceTabType" type="card" class="resource-tabs">
    <el-tab-pane label="视频包" name="video">
      <!--视频包-->
      <div v-loading="loading.resouceVideoList" class="resource-tabs__content">
        <el-table :data="resouceVideoList" fit @row-click="onResourceRowClick('video', ...arguments)">
          <el-table-column prop="resourceId" label="编号" min-width="120">
            <template slot-scope="scope">
              <span class="resource-id">
                <el-radio v-model="form.resouceVideoId" :label="scope.row.resourceId" />
                {{ scope.row.resourceId.substr(0, 10) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="totalDeviceCount" label="可接入设备数量">
            <template slot-scope="scope">
              {{ scope.row.totalDeviceCount }}路
            </template>
          </el-table-column>
          <el-table-column prop="remainDeviceCount" label="接入设备余量">
            <template slot-scope="scope">
              {{ scope.row.remainDeviceCount }}路
            </template>
          </el-table-column>
          <el-table-column prop="bitRate" label="码率">
            <template slot-scope="scope">
              {{ scope.row.bitRate }}Mbps
            </template>
          </el-table-column>
          <el-table-column prop="storageTime" label="存储周期" min-width="90">
            <template slot-scope="scope">
              {{ scope.row.storageTime }}天
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="开通时间" min-width="170" />
          <el-table-column prop="expireTime" label="到期时间" min-width="170" />
        </el-table>
        <div v-if="isUpdate || isFreeUser" class="resource-tabs__none">
          <el-radio v-model="form.resouceVideoId" :label="-1" @change="onFormChange(false)">不绑定任何视频包</el-radio>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane v-if="inProtocol === 'gb28181'" label="AI包" name="ai">
      <!--AI包-->
      <div v-loading="loading.resouceAiList" class="resource-tabs__content">
        <el-table :data="resouceAiList" fit @row-click="onResourceRowClick('ai', ...arguments)">
          <el-table-column prop="resourceId" label="编号" min-width="120">
            <template slot-scope="scope">
              <span class="resource-id">
                <el-radio v-model="form.resouceAiId" :label="scope.row.resourceId" />
                {{ scope.row.resourceId.substr(0, 10) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="totalDeviceCount" label="可接入设备数量">
            <template slot-scope="scope">
              {{ scope.row.totalDeviceCount }}路
            </template>
          </el-table-column>
          <el-table-column prop="remainDeviceCount" label="接入设备余量">
            <template slot-scope="scope">
              {{ scope.row.remainDeviceCount }}路
            </template>
          </el-table-column>
          <el-table-column prop="aiType" label="分析类型">
            <template slot-scope="scope">
              {{ resourceAiType[scope.row.aiType] }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="开通时间" min-width="170" />
          <el-table-column prop="expireTime" label="到期时间" min-width="170" />
        </el-table>
        <div class="resource-tabs__none">
          <el-radio v-model="form.resouceAiId" :label="-1" @change="doNotBind">不绑定任何AI包</el-radio>
        </div>
        <el-tabs v-if="form.resouceAiId !== -1" v-model="algoTabType" type="card" class="algoTab" @tab-click="changeTabType">
          <el-tab-pane v-for="item in aiAbilityTab" :key="item.id" :label="`${item.name}(${item.aiApps})`" :name="item.id">
            <el-table
              :ref="`algoTable${Number(item.id)}`"
              v-loading="loading.resouceAiTable"
              class="algoTabTable"
              tooltip-effect="dark"
              :data="algoListData"
              style="width: 100%"
              empty-text="暂无AI应用，请在AI应用管理中创建"
              @selection-change="selectAlgoChange"
              @select="selectHandle"
              @row-click="onResourceTabsRowClick"
            >
              <el-table-column type="selection" width="55" :selectable="ifDisable" prop="selection" />
              <el-table-column prop="name" label="应用名称" />
              <el-table-column label="算法类型" width="120">
                <template slot-scope="scope">{{ scope.row.algorithm.name }}</template>
              </el-table-column>
              <el-table-column prop="analyseType" label="分析类型">
                <template slot-scope="scope">
                  {{ resourceAiType[scope.row.analyseType] }}
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述" show-overflow-tooltip />
            </el-table>
          </el-tab-pane>
        </el-tabs>
        <div v-if="showTips" class="algoWarning algoWarningTip">
          <i class="el-icon-warning" />
          <span>已选择{{ selectAlgoId.length }}种AI应用，将扣除{{ chooseData.name }}包中{{ selectAlgoId.length }}路资源。</span>
        </div>
        <div v-if="showError" class="algoWarning algoWarningError">
          <i class="el-icon-warning" />
          <span>已选择{{ selectAlgoId.length }}种AI应用，{{ chooseData.name }}包接入余量不足。</span>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane v-if="!isPrivateInNetwork" label="上行带宽包" name="upload">
      <!--上行带宽包-->
      <div v-loading="loading.resouceUploadList" class="resource-tabs__content">
        <el-table :data="resouceUploadList" fit @row-click="onResourceRowClick('upload', ...arguments)">
          <el-table-column prop="resourceId" label="编号" min-width="120">
            <template slot-scope="scope">
              <span class="resource-id">
                <el-radio v-model="form.resouceUploadId" :label="scope.row.resourceId" />
                {{ scope.row.resourceId.substr(0, 10) }}
              </span>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="value" label="剩余上行带宽">
            <template slot-scope="scope">
              {{ scope.row.value }}Mbps
            </template>
          </el-table-column> -->
          <el-table-column prop="bandWidth" label="上行带宽总量">
            <template slot-scope="scope">
              {{ scope.row.bandWidth }}Mbps
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="开通时间" min-width="170" />
          <el-table-column prop="expireTime" label="到期时间" min-width="170" />
        </el-table>
        <div v-if="isUpdate || isFreeUser" class="resource-tabs__none">
          <el-radio v-model="form.resouceUploadId" :label="-1" @change="onFormChange(false)">不绑定任何上行带宽包</el-radio>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
<script lang='ts'>
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { ResourceAiType } from '@/dics'
import { getResources
  , getResourceIdAttachedAppIds
} from '@/api/billing'
import { UserModule } from '@/store/modules/user'
import { getAbilityList, getAppList } from '@/api/ai-app'

@Component({
  name: 'ResourceTabs'
})
export default class extends Vue {
  @Prop() private value?: any
  @Prop() private isUpdate?: boolean
  @Prop() private inProtocol?: string
  @Prop() private isPrivateInNetwork?: string
  @Prop() private vssAiApps?:any
  @Prop() private algoTabTypeDefault?:string
  @Prop() private deviceId?:string

  private resourceTabType = 'video'
  private resourceAiType = ResourceAiType
  private form: any = {
    resouceVideoId: -1,
    resouceAiId: -1,
    resouceUploadId: -1
  }
  private loading:any = {
    resouceVideoList: false,
    resouceAiList: false,
    resouceUploadList: false,
    resouceAiTable: false
  }
  private resouceVideoList = []
  private resouceAiList = []
  private resouceUploadList = []

  private algoListData:any = []
  private algoTabType = '1'
  private totalDeviceConfigCount = 0
  private remainDeviceConfigCount = 0
  private selectAlgoId = []
  private showError = false
  private showTips = false
  private aiAbilityTab = []
  private chooseData:any = {}
  // private checkIds = []
  private checkInfoObj:any = {}
  private resourceAlgo:any = {}
  private resourceHasAppIds = []

  public get isFreeUser() {
    return UserModule.tags && UserModule.tags.resourceFree === '1'
  }

  private async mounted() {
    this.resouceVideoList = await this.getResouces('VSS_VIDEO', 'resouceVideoList')
    this.resouceAiList = await this.getResouces('VSS_AI', 'resouceAiList')
    this.resouceUploadList = await this.getResouces('VSS_UPLOAD_BW', 'resouceUploadList')
    this.handleResourceAppIds()
    this.onFormChange(true)
    this.defaultTab()
  }

  /**
   * 加载资源包
   */
  private async getResouces(type: string, loadingType: string) {
    try {
      this.loading[loadingType] = true
      const res = await getResources({
        type
      })
      // 过滤已过期的资源包
      const list = res.resPkgList.filter((resource: any) => {
        if (new Date().getTime() < new Date(resource.expireTime).getTime()) {
          return resource
        }
      })
      return list
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.loading[loadingType] = false
    }
  }

  /**
   * 监听设备详情
   */
  @Watch('value', {
    deep: true
  })
  private onDeviceChange(resources: any) {
    resources.forEach((resource: any) => {
      switch (resource.resourceType) {
        case 'VSS_VIDEO':
          this.form.resouceVideoId = resource.resourceId
          break
        case 'VSS_AI':
          this.form.resouceAiId = resource.resourceId
          break
        case 'VSS_UPLOAD_BW':
          this.form.resouceUploadId = resource.resourceId
          break
      }
    })
    this.onFormChange(true)
  }

  /**
   * 切换资源包
   */
  private onFormChange(isInit: boolean) {
    const resouceVideo = this.resouceVideoList.find((resource: any) => resource.resourceId === this.form.resouceVideoId)
    const resouceAi = this.resouceAiList.find((resource: any) => resource.resourceId === this.form.resouceAiId)
    const resouceUpload = this.resouceUploadList.find((resource: any) => resource.resourceId === this.form.resouceUploadId)
    const resources = [resouceVideo, resouceAi, resouceUpload]
    const result: any = []
    const mapping: any = []

    resources.forEach((resource: any) => {
      if (resource) {
        const resourceResult = {
          workOrderId: resource.workOrderId,
          resourceId: resource.resourceId,
          resourceType: resource.type
        }
        result.push(resourceResult)
        mapping[resource.resourceId] = Object.assign(resourceResult, { remainDeviceCount: resource.remainDeviceCount })
      }
    })
    if (!isInit) {
      this.$emit('input', result)
    }
    this.$emit('on-change', {
      isInit,
      mapping
    })
  }

  /**
   * 单击行
   */
  private onResourceRowClick(type: string, row: any) {
    switch (type) {
      case 'video':
        this.form.resouceVideoId = row.resourceId
        break
      case 'ai':
        this.form.resouceAiId = row.resourceId
        this.onRadioChange(type, row)
        break
      case 'upload':
        this.form.resouceUploadId = row.resourceId
        break
    }
    this.onFormChange(false)
  }

  private handleResourceAppIds() {
    this.ifHasCheceked()
    this.createCheckInfo()
  }

  private createCheckInfo() {
    this.resouceAiList.forEach(item => {
      this.checkInfoObj[item.resourceId] = {}
    })
  }

  // 判断是否是编辑进入
  private ifHasCheceked() {
    if (this.isUpdate) {
      this.selectAlgoId = this.vssAiApps && this.vssAiApps.length ? this.vssAiApps : []
      const result = this.resouceAiList.find(item => {
        return this.value.some((val:any) => {
          return item.resourceId === val.resourceId
        })
      })
      if (Object.keys(result).length > 0) {
        // this.getAiAlgoList(result)
        this.onRadioChange('ai', result)
      }
    }
  }

  // 不绑定AI包单独处理
  private doNotBind() {
    this.onFormChange(false)
    this.$emit('changevssaiapps', [])
  }

  // AI包radio事件
  private onRadioChange(type: string, row: any) {
    console.log('onRadioChangeRow===>', row)
    if (this.isUpdate) {
      this.getResourceIdAttachedAppIds(row)
    }
    this.closeTips()
    this.chooseData = row
    this.getAiAlgoList(row)
    this.totalDeviceConfigCount = row.totalDeviceCount
    this.remainDeviceConfigCount = row.remainDeviceCount
  }

  private async getResourceIdAttachedAppIds(row:any) {
    if (!this.checkInfoObj[row.resourceId] || Object.values(this.checkInfoObj[row.resourceId]).length === 0) {
      const { appIdList } = await getResourceIdAttachedAppIds({ resourceId: row.resourceId, deviceId: this.deviceId })
      this.resourceHasAppIds = appIdList
      if (this.selectAlgoId.length === 0) {
        this.selectAlgoId = this.resourceHasAppIds.map((item:any) => item.appId)
      }
    }
  }

  // 获取算法名
  private async getAiAlgoList(row:any) {
    const { aiAbilityList } = await getAbilityList({ id: row.id })
    this.aiAbilityTab = aiAbilityList
    this.algoTabType = aiAbilityList[0]?.id
    this.getAlgoList()
  }

  // 关闭两个tips
  private closeTips() {
    this.showError = false
    this.showTips = false
  }

  // 获取算法能力
  private async getAlgoList() {
    try {
      this.loading.resouceAiTable = true
      const algoListResult = await getAppList({ abilityId: this.algoTabType })
      this.algoListData = algoListResult.aiApps
      if (this.isUpdate) {
        if (this.resourceHasAppIds.length > 0) {
          const result = this.algoListData.filter((item:any) => this.resourceHasAppIds.some(val => item.id === val.appId))
          // 过滤已选中数据和已编辑过得数据
          // const resultFinal = this.checkInfoObj[this.chooseData.resourceId][this.algoTabType] && this.checkInfoObj[this.chooseData.resourceId][this.algoTabType].filter((item:any) => result.some((val:any) => val.id !== item.id))

          if (this.checkInfoObj[this.chooseData.resourceId][this.algoTabType]) {
            const resultFinal = this.checkInfoObj[this.chooseData.resourceId][this.algoTabType] && this.checkInfoObj[this.chooseData.resourceId][this.algoTabType].filter((item:any) => result.some((val:any) => val.id !== item.id))
            if (resultFinal && resultFinal.length > 0) {
              this.checkInfoObj[this.chooseData.resourceId][this.algoTabType].push(resultFinal)
            }
          } else {
            this.checkInfoObj[this.chooseData.resourceId][this.algoTabType] = result
          }
        }
      }
      this.setChecked()
      this.$emit('changevssaiapps', this.selectAlgoInfo)
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.resouceAiTable = false
    }
  }

  // 判断当前table列是否可选
  private ifDisable(row:any) {
    return row.analyseType <= this.chooseData.aiType
  }
  // tab切换回调
  private changeTabType() {
    this.getAlgoList()
  }

  private defaultTab() {
    if (this.algoTabTypeDefault === 'AI') {
      this.resourceTabType = 'ai'
    }
  }

  // 获取rowkey
  private getTableRowKey(row:any) {
    return row.id
  }

  // 能力列表 行点击
  private onResourceTabsRowClick(row:any) {
    this.$refs[`algoTable${this.algoTabType}`][0].toggleRowSelection(row, true)
  }

  // 能力checkbox点击
  private selectHandle(selection:any, row:any) {
    const result = selection.filter((item:any) => item.id === row.id)
    if (result.length > 0) {
      this.setChecked()
    } else {
      this.selectAlgoId = this.selectAlgoId.filter(item => item.appId !== row.id)
      this.checkInfoObj[this.chooseData.resourceId][this.algoTabType] = this.checkInfoObj[this.chooseData.resourceId][this.algoTabType].filter((item:any) => item.id !== row.id)
      this.filterCheckedStatus()
    }
  }

  // 能力checkbox改变逻辑
  private selectAlgoChange(val:any) {
    this.checkInfoObj[this.chooseData.resourceId][this.algoTabType] = val
    this.filterCheckedStatus()

    if (!this.selectAlgoId.length) {
      this.showError = false
      this.showTips = false
    } else if (this.selectAlgoId.length > this.remainDeviceConfigCount) {
      this.showError = true
    } else {
      this.showTips = true
    }
  }

  // 过滤编辑过的选中和当前选中
  private filterCheckedStatus() {
    const temp = Object.values(this.checkInfoObj[this.chooseData.resourceId]).map((item:any) => {
      return item.map((ele:any) => ele)
    })
    // this.selectAlgoInfo = result.flat() this.resourceHasAppIds
    if (this.resourceHasAppIds && this.resourceHasAppIds.length > 0) {
      const result = temp.flat().filter((item:any) => {
        return this.resourceHasAppIds.some((val:any) => {
          return val.appId !== item.appId
        })
      })
      const resultFinal = result.map((item:any) => {
        return {
          appId: item.id,
          analyseType: item.analyseType
        }
      })
      this.selectAlgoInfo = resultFinal
    } else {
      const result = Object.values(this.checkInfoObj[this.chooseData.resourceId]).map((item:any) => {
        return item.map((ele:any) => {
          return {
            appId: ele.id,
            analyseType: ele.analyseType
          }
        })
      })
      this.selectAlgoInfo = result.flat()
    }

    this.selectAlgoId = this.selectAlgoInfo.map((item:any) => item.appId)
    this.setChecked()
    this.$emit('changevssaiapps', this.selectAlgoInfo)
  }

  // 设置选中状态
  private setChecked() {
    const result = this.algoListData.filter((item:any) => {
      return this.checkInfoObj[this.chooseData.resourceId][this.algoTabType]?.some((val:any) => {
        return val.id === item.id
      })
    })
    this.$nextTick(() => {
      result.forEach((element:any) => {
        if (this.$refs[`algoTable${this.algoTabType}`]) {
          this.$refs[`algoTable${this.algoTabType}`][0].toggleRowSelection(element, true)
        }
      })
    })
  }
}
</script>
<style lang="scss" scoped>
  .resource-tabs {
    &.el-tabs {
      margin: 0;
    }

    .resource-id {
      ::v-deep .el-radio__label {
        display: none;
      }
      ::v-deep .el-radio__input {
        margin-right: 3px;
      }
    }

    ::v-deep .el-tabs__header {
      margin-bottom: 0;
    }

    &__content {
      border: 1px solid #dfe4ed;
      border-top: none;
      padding: 10px;

      .el-radio__label {
        font-weight: normal;
      }
    }

    &__none {
      line-height: 23px;
      transition: 'background' 0.2s;
      label {
        padding: 10px;
        display: block;
      }
      &:hover {
        background: #F5F7FA;
      }
    }

    ::v-deep .el-table .el-table__row {
      cursor: pointer;
    }
  }
  .algoTab{
    margin-top: 10px;
    .algoTabTable{
      margin-top: 10px;
    }
  }
  .algoWarning{
    padding: 5px 10px;
    border: 1px solid;
    span{
      margin-left: 12px;
      font-size: 12px;
      display: inline-block;
    }
    ::v-deep .el-icon-warning{
      font-size: 18px;
      vertical-align: middle;
    }
    &.algoWarningError{
      border-color: #950012;
      color: #950012;
      background: #FADEE0;
    }
    &.algoWarningTip{
      border-color: #4A88DB;
      color: #4A88DB;
      background: #EDF4FE;
    }
  }
</style>
