<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card v-loading="loading">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="180px"
      >
        <el-form-item v-if="isEdit" label="业务组Id:" prop="groupId">
          <el-input v-model="form.groupId" disabled />
        </el-form-item>
        <el-form-item label="业务组名称:" prop="groupName" class="form-with-tip">
          <el-input v-model="form.groupName" />
          <div class="form-tip">4-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号。业务组名称不能重复。</div>
        </el-form-item>
        <el-form-item label="业务组描述:" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入业务组描述，如业务介绍或用途" />
        </el-form-item>
        <el-form-item v-if="!isVGroup" prop="region" class="form-with-tip">
          <template slot="label">
            接入区域:
            <el-popover
              placement="top-start"
              title="接入区域"
              width="400"
              trigger="hover"
              :open-delay="300"
              content="接入区域负责IPC/NVR/第三方视频平台视频接入、存储、分发和AI分析等，请根据需求选择。"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-cascader
            v-model="form.region"
            placeholder="请选择"
            :options="regionList"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item v-if="(!isEdit || !form.gbId || form.gbRegion) && form.inProtocol !== 'vgroup'" label="设备地址:" prop="gbRegion">
          <AddressCascader
            :code="form.gbRegion"
            :level="form.gbRegionLevel"
            :disabled="form.gbId !== ''"
            @change="onDeviceAddressChange"
          />
        </el-form-item>
        <el-form-item v-if="(!isEdit || !form.gbId || !!form.industryCode) && form.inProtocol !== 'vgroup'" label="所属行业:" prop="industryCode">
          <el-select v-model="form.industryCode" :disabled="form.gbId !== ''" placeholder="请选择所属行业">
            <el-option v-for="(item, index) in industryList" :key="index" :label="item.name" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="(!isEdit || !form.gbId || !!form.industryCode) && networkFlag && form.inProtocol !== 'vgroup'" label="网络标识:" prop="networkCode">
          <el-select v-model="form.networkCode" :disabled="form.gbId !== ''" placeholder="请选择网络标识">
            <el-option v-for="(item, index) in networkList" :key="index" :label="item.name" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isVGroup" label="接入类型:" prop="inProtocol">
          <el-radio-group v-model="form.inProtocol" :disabled="isEdit">
            <el-radio v-for="protocol in inProtocolList" :key="protocol" :label="protocol.toLocaleLowerCase()">{{ protocol }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!isVGroup" label="播放类型:" prop="outProtocol">
          <el-checkbox-group v-model="form.outProtocol">
            <el-checkbox
              v-for="protocol in outProtocolList"
              :key="protocol"
              :label="protocol.toLocaleLowerCase()"
            >
              {{ protocol }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <!-- gb28181/rtmp/rtsp允许设置是否自动拉流 -->
        <el-form-item v-if="form.inProtocol === 'gb28181' || form.inProtocol === 'rtmp' || form.inProtocol === 'rtsp'" prop="pullType">
          <template slot="label">
            自动拉流:
            <el-popover
              placement="top-start"
              title="自动拉流"
              width="400"
              trigger="hover"
              :open-delay="300"
              :content="`当启用自动拉流，${form.inProtocol.toLocaleUpperCase()}设备注册成功后自动启动拉流。关闭该选项后需要通过触发的方式启动拉流。`"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-switch v-model="form.pullType" :active-value="1" :inactive-value="2" />
        </el-form-item>
        <!-- rtmp/rtsp允许设置是否自动拉流 -->
        <el-form-item v-if="form.inProtocol === 'rtmp' || form.inProtocol === 'rtsp'" prop="pushType">
          <template slot="label">
            自动激活推流地址:
            <el-popover
              placement="top-start"
              title="自动激活推流地址"
              width="400"
              trigger="hover"
              :open-delay="300"
              content="自动激活推流地址，设备创建完成后，平台立刻自动生成推流地址。关闭该选项后需要通过触发的方式生成推流地址。"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-switch v-model="form.pushType" :active-value="1" :inactive-value="2" />
        </el-form-item>
        <el-form-item prop="inNetworkType">
          <template slot="label">
            接入网络:
            <el-popover
              placement="top-start"
              width="300"
              trigger="hover"
              :open-delay="300"
              content="设备接入的网络类型"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-radio-group v-model="form.inNetworkType" :disabled="isEdit && !isVGroup">
            <el-radio label="public">互联网</el-radio>
            <el-radio label="private">专线网络</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="outNetworkType">
          <template slot="label">
            播放网络:
            <el-popover
              placement="top-start"
              width="300"
              trigger="hover"
              :open-delay="300"
              content="视频调阅的网络类型"
            >
              <svg-icon slot="reference" class="form-question" name="help" />
            </el-popover>
          </template>
          <el-radio-group v-model="form.outNetworkType" :disabled="isEdit && !isVGroup">
            <el-radio label="public">互联网</el-radio>
            <el-radio label="private">专线网络</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="">
          <div class="mt10">
            <el-button :loading="submitting" type="primary" @click="submit">确定</el-button>
            <el-button @click="back">取 消</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { Group } from '@/type/group'
import { DeviceAddress } from '@/type/device'
import { GroupModule } from '@/store/modules/group'
import { InProtocolType, OutProtocolType } from '@/dics'
import { createGroup, queryGroup, updateGroup } from '@/api/group'
import { getRegions } from '@/api/region'
import { industryMap } from '@/assets/region/industry'
import { networkMap } from '@/assets/region/network'
import templateBind from '../components/templateBind.vue'
import AddressCascader from '@/views/components/AddressCascader.vue'

@Component({
  components: { templateBind, AddressCascader },
  name: 'CreateGroup'
})
export default class extends Vue {
  private breadCrumbContent = ''
  private loading = false
  private submitting = false
  private rules = {
    groupName: [
      { required: true, message: '请输入业务组名称', trigger: 'blur' },
      { validator: this.validateGroupName, trigger: 'blur' }
    ],
    region: [
      { required: true, message: '请选择区域', trigger: 'change' }
    ],
    gbRegion: [
      { required: true, message: '请选设备地址', trigger: 'change' }
    ],
    industryCode: [
      { required: true, message: '请选择所属行业', trigger: 'change' }
    ],
    networkCode: [
      { required: true, message: '请选择网络标识', trigger: 'change' }
    ],
    inProtocol: [
      { required: true, message: '请选择接入类型', trigger: 'change' }
    ],
    outProtocol: [
      { required: true, message: '请选择播放类型', trigger: 'change' },
      { validator: this.validateOutProtocol, trigger: 'change' }
    ],
    inNetworkType: [
      { required: true, message: '请选择接入网络', trigger: 'change' }
    ],
    outNetworkType: [
      { required: true, message: '请选择播放网络', trigger: 'change' }
    ]
  }
  private outProtocolList = Object.values(OutProtocolType)
  private inProtocolList = Object.values(InProtocolType)

  public form: Group = {
    groupName: '',
    description: '',
    region: [],
    inProtocol: 'gb28181',
    outProtocol: [],
    pullType: 1,
    pushType: 1,
    inNetworkType: 'public',
    outNetworkType: 'public',
    gbId: '',
    gbRegion: '',
    gbRegionLevel: '',
    industryCode: '',
    networkCode: ''
  }

  private regionList = []

  private get industryList() {
    return Object.keys(industryMap).map((key: any) => {
      return {
        name: industryMap[key],
        value: key
      }
    })
  }

  private get networkList() {
    return Object.keys(networkMap).map((key: any) => {
      return {
        name: networkMap[key],
        value: key
      }
    })
  }

  private get isEdit() {
    return !!this.form.groupId
  }

  private get isVGroup() {
    return this.form.inProtocol === 'vgroup'
  }

  /**
   * 针对网络标识
   */
  private get networkFlag() {
    return this.$store.state.user.tags.isNeedDeviceNetworkCode === 'Y'
  }

  private async mounted() {
    await this.getRegionList()
    this.breadCrumbContent = this.$route.meta.title
    let query: any = this.$route.query
    if (query.groupId) {
      this.$set(this.form, 'groupId', query.groupId)
      this.loading = true
      try {
        const res = await queryGroup({ groupId: this.form.groupId })
        res.outProtocol = res.outProtocol.split(',')
        res.region = this.getRegionPath(this.regionList, res.region)
        res.inNetworkType = res.inNetworkType || 'public'
        res.outNetworkType = res.outNetworkType || 'public'
        this.form = res
      } catch (e) {
        this.$message.error(e && e.message)
      } finally {
        this.loading = false
      }
    }
  }

  /**
   * 递归查找目标区域的所在路径
   */
  private getRegionPath(regions: any, target: string) {
    let path: Array<any> = []
    try {
      const _find: any = function(path: Array<string>, children: any, parentValue: any) {
        for (let i = 0; i < children.length; i++) {
          const item = children[i]
          item.children && _find(path, item.children, item.value)
          if (item.value === target) {
            path.push(parentValue)
            path.push(item.value)
            throw new Error('found')
          }
        }
      }
      _find(path, regions, null)
    // eslint-disable-next-line no-empty
    } catch (e) {}
    return path
  }

  /**
   * 获取接入区域列表
   */
  private async getRegionList() {
    this.loading = true
    try {
      this.regionList = await getRegions()
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 选择设备地址
   */
  public onDeviceAddressChange(region: DeviceAddress) {
    this.form.gbRegion = region.code
    this.form.gbRegionLevel = region.level
  }

  private validateGroupName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-()（）_]{4,64}$/u.test(value)) {
      callback(new Error('业务组名称格式错误。4-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号。'))
    } else {
      callback()
    }
  }

  private validateOutProtocol(rule: any, value: string, callback: Function) {
    if (value.length === 0) {
      callback(new Error('请选择'))
    } else {
      callback()
    }
  }

  private back() {
    if (this.$route.name === 'group-update') {
      this.$router.push({
        path: '/group/config',
        query: { groupId: this.form.groupId!.toString() }
      })
    } else {
      this.$router.push('/group')
    }
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        this.submitting = true
        var params = JSON.parse(JSON.stringify(this.form))
        params.outProtocol = params.outProtocol.join(',')
        params.region = params.region[params.region.length - 1]
        try {
          if (this.form.groupId) {
            await updateGroup(params)
            this.$message.success('修改业务组成功！')
          } else {
            await createGroup(params)
            this.$message.success('新建业务组成功！')
          }
          GroupModule.GetGroupList()
          this.back()
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.submitting = false
        }
      } else {
        return false
      }
    })
  }
}
</script>

<style lang="scss" scoped>
  .el-input, .el-select, .el-textarea, .el-cascader {
    width: 400px;
  }
</style>
