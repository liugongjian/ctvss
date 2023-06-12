<template>
  <div class="advanced-search">
    <el-button class="advanced-search__button" :type="highlightFilterButton ? 'primary' : 'default'" size="mini" @click="openAdvancedSearch">
      <svg-icon name="filter" />
    </el-button>
    <el-tooltip class="item" effect="dark" content="支持国标ID、设备IP、设备名查询" placement="top-start">
      <!-- TIPS 需要处理为空时候的直接回车 -->
      <el-input v-model="form.inputKey" size="mini" placeholder="支持国标ID、设备IP、设备名查询" @keyup.enter.native="enterKeySearch" />
    </el-tooltip>
    <el-button class="advanced-search__button" type="primary" size="mini" icon="el-icon-search" :disabled="!form.inputKey.length" @click="filterSearchResult" />
    <el-button v-if="form.revertSearchFlag" type="primary" size="mini" @click="revertSearchResult">
      <svg-icon name="revert" />
    </el-button>
    <el-dialog
      v-if="dialog.advancedSearch"
      title="高级搜索"
      :close-on-click-modal="false"
      :visible="true"
      width="600px"
      center
      @close="closeDialog({ isRefresh: false })"
    >
      <el-form
        ref="searchForm"
        :model="form"
        label-position="right"
        label-width="120px"
        @submit.native.prevent
      >
        <el-form-item label="视频接入:" prop="deviceStatusKeys">
          <el-checkbox-group v-model="innerForm.deviceStatusKeys">
            <el-checkbox v-for="deviceStatus in deviceStatusList" :key="deviceStatus.value" :label="deviceStatus.value">{{ deviceStatus.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="视频流:" prop="streamStatusKeys">
          <el-checkbox-group v-model="innerForm.streamStatusKeys">
            <el-checkbox v-for="streamStatus in streamStatusList" :key="streamStatus.value" :label="streamStatus.value">{{ streamStatus.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="设备地址:">
          <AddressCascader
            :code="innerForm.deviceAddresses.code"
            :level="innerForm.deviceAddresses.level"
            @change="onDeviceAddressChange"
          />
        </el-form-item>
        <el-form-item label="关键字匹配:" prop="matchKeys">
          <el-checkbox-group v-model="innerForm.matchKeys">
            <el-checkbox v-for="matchKey in matchKeyList" :key="matchKey.value" :label="matchKey.value">{{ matchKey.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="closeDialog({ isRefresh: false })">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import AddressCascader from './AddressCascader.vue'
import { AdvancedSearch } from '../type/AdvancedSearch'
import { DeviceAddress } from '../type/Device'

@Component({
  name: 'AdvancedSearch',
  components: { AddressCascader }
})
export default class extends Vue {
  @Prop()
  private searchForm!: AdvancedSearch
  private dialog = {
    advancedSearch: false
  }
  private deviceStatusList = [
    {
      label: '在线',
      value: 'on'
    },
    {
      label: '离线',
      value: 'off'
    },
    {
      label: '未注册',
      value: 'new'
    }
  ]
  private streamStatusList = [
    {
      label: '在线',
      value: 'on'
    },
    {
      label: '离线',
      value: 'off'
    },
    {
      label: '失败',
      value: 'failed'
    }
  ]
  private matchKeyList = [
    {
      label: '设备名',
      value: 'deviceName'
    },
    {
      label: '国标ID',
      value: 'gbId'
    },
    {
      label: '设备IP',
      value: 'deviceIp'
    },
    {
      label: '杆位',
      value: 'poleId'
    }
  ]
  public get highlightFilterButton() {
    return this.searchForm.deviceStatusKeys.length || this.searchForm.streamStatusKeys.length || this.searchForm.matchKeys.length || this.searchForm.deviceAddresses.code
  }
  private form: AdvancedSearch = {
    deviceStatusKeys: [],
    streamStatusKeys: [],
    deviceAddresses: {
      code: '',
      level: ''
    },
    matchKeys: [],
    inputKey: '',
    searchKey: '',
    revertSearchFlag: false
  }

  private innerForm: any = {
    deviceStatusKeys: [],
    streamStatusKeys: [],
    deviceAddresses: {
      code: '',
      level: ''
    },
    matchKeys: []
  }

  private mounted() {
  }

  private openAdvancedSearch() {
    this.innerForm = JSON.parse(JSON.stringify(this.form))
    this.dialog.advancedSearch = true
  }

  /**
   * 回车键搜索（需额外处理输入框为空的情况）
   */
  private enterKeySearch() {
    if (!this.form.inputKey) {
      return
    }
    this.filterSearchResult()
  }

  /**
   * 搜索过滤
   */
  private async filterSearchResult() {
    const query = {
      ...this.$route.query,
      inProtocol: this.$route.query.inProtocal,
      deviceStatusKeys: this.form.deviceStatusKeys.join(','),
      streamStatusKeys: this.form.streamStatusKeys.join(','),
      deviceAddresses: this.form.deviceAddresses.code + ',' + this.form.deviceAddresses.level,
      matchKeys: this.form.matchKeys.join(','),
      searchKey: this.form.inputKey
    }
    this.$router.replace({
      query
    })
    this.form.searchKey = this.form.inputKey
    this.form.revertSearchFlag = Boolean(this.form.searchKey ||
                                          this.form.deviceStatusKeys.length ||
                                          this.form.streamStatusKeys.length ||
                                          this.form.deviceAddresses.code)
    this.$emit('search', this.form)
  }

  /**
   * 退出“搜索过滤”
   */
  private async revertSearchResult() {
    this.form.inputKey = ''
    this.form.searchKey = ''
    this.form.deviceStatusKeys = []
    this.form.streamStatusKeys = []
    this.form.deviceAddresses = {
      code: '',
      level: ''
    }
    this.form.matchKeys = []
    this.form.revertSearchFlag = false
    // 退出搜索时不清空当前所在路径，便于initDirs后直接定位到之前路径
    const query = {
      ...this.$route.query,
      deviceStatusKeys: '',
      streamStatusKeys: '',
      deviceAddresses: '',
      matchKeys: '',
      searchKey: ''
    }
    this.$router.replace({
      query
    })
    this.$emit('search', this.form)
  }

  @Watch('searchForm', { deep: true, immediate: true })
  private searchFormUpadted() {
    this.form = JSON.parse(JSON.stringify(this.searchForm))
  }

  private async submit() {
    const form: any = this.$refs.searchForm
    form.validate(async(valid: any) => {
      if (valid) {
        this.closeDialog({ isRefresh: true, searchForm: this.form })
      }
    })
  }

  private closeDialog(payload: { isRefresh: boolean, searchForm?: AdvancedSearch }) {
    if (payload.isRefresh) {
      this.form = this.innerForm
      this.filterSearchResult()
    }
    this.dialog.advancedSearch = false
  }

  /**
   * 选择设备地址
   */
  public onDeviceAddressChange(region: DeviceAddress) {
    this.innerForm.deviceAddresses.code = region.code
    this.innerForm.deviceAddresses.level = region.level
  }
}
</script>
<style lang="scss" scoped>
.advanced-search {
  flex: 1;
  display: flex;
  // v2暂时没有搜索入口，加之设备告警页面用了common-layout，但是不提供搜索入口，所以将样式控制移到搜索框内部
  padding: 5px;
  min-height: 40px;
  border-top: 1px solid #ddd;

  ::v-deep .el-input--suffix .el-input__inner {
    padding-right: 0;
  }

  ::v-deep .el-button--mini {
    padding: 7px;
  }

  ::v-deep &-button {
    margin-left: 5px !important;
  }

  .el-button + .el-button,
  .el-tooltip + .el-button,
  .el-button + .el-tooltip {
    margin-left: 5px;
  }

  ::v-deep .el-input--suffix .el-input__inner {
    padding-right: 0;
  }
}

</style>
