<template>
  <div v-loading="loading.device" class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-form
      ref="dataForm"
      :rules="rules"
      :model="form"
      label-position="right"
      label-width="170px"
    >
      <el-form-item v-if="currentGroup" label="业务组:">
        {{ currentGroup.groupName }}
        <span class="in-protocol">({{ inProtocolUpper }})</span>
      </el-form-item>
      <el-form-item v-if="breadcrumb && !isUpdate" label="当前目录:">
        <div class="breadcrumb">
          <span
            v-for="item in breadcrumb"
            :key="item.id"
            class="breadcrumb__item"
          >
            {{ item.label }}
          </span>
        </div>
      </el-form-item>
      <el-form-item label="厂商:" prop="deviceVendor">
        <el-select v-model="form.deviceVendor">
          <el-option v-for="item in deviceVendorList" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="设备名称:" prop="deviceName" class="form-with-tip">
        <el-input v-model="form.deviceName" />
        <div class="form-tip">2-32位，可包含大小写字母、数字、中文、中划线、空格。</div>
      </el-form-item>
      <el-form-item label="视频流接入方式:" prop="inType">
        <el-radio-group v-model="form.inType" @change="clearValidate">
          <el-radio v-for="(inType, key) in inTypeList" :key="key" :label="key">{{ inType }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.inType === 'pull'" label="拉流地址:" prop="pullUrl">
        <el-input v-model="form.pullUrl" />
      </el-form-item>
      <el-form-item v-if="form.inType === 'pull'" prop="pullType">
        <template slot="label">
          自动拉流:
          <el-popover
            placement="top-start"
            title="自动拉流"
            width="400"
            trigger="hover"
            :open-delay="300"
            :content="tips.pullType"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
        <el-switch v-model="form.pullType" :active-value="1" :inactive-value="2" />
      </el-form-item>
      <el-form-item v-if="form.inType === 'push'" prop="pushType">
        <template slot="label">
          自动激活推流地址:
          <el-popover
            placement="top-start"
            title="自动激活推流地址"
            width="400"
            trigger="hover"
            :open-delay="300"
            :content="tips.pushType"
          >
            <svg-icon slot="reference" class="form-question" name="help" />
          </el-popover>
        </template>
        <el-switch v-model="form.pushType" :active-value="1" :inactive-value="2" />
      </el-form-item>
      <el-form-item label="视频标签:" prop="description">
        <Tags v-model="form.tags" class="tags" />
      </el-form-item>
      <el-form-item label="配置资源包:" prop="resources">
        <ResourceTabs v-model="form.resources" :is-update="isUpdate" :in-protocol="form.inProtocol" :is-private-in-network="isPrivateInNetwork" @on-change="onResourceChange" />
      </el-form-item>
      <el-form-item label="设备描述:" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入设备描述，如设备用途" />
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
        <el-button @click="back">取 消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang='ts'>
import { Component, Mixins } from 'vue-property-decorator'
import createMixin from '../mixin/createMixin'
import { InType } from '@/dics'
import { pick } from 'lodash'
import { createDevice, updateDevice, getDevice } from '@/api/device'
import { updateDeviceResources } from '@/api/billing'
import Tags from '@/components/Tags/index.vue'
import ResourceTabs from '../components/ResourceTabs.vue'

@Component({
  name: 'CreateRtmpDevice',
  components: {
    Tags,
    ResourceTabs
  }
})
export default class extends Mixins(createMixin) {
  private rules = {
    deviceName: [
      { required: true, message: '请输入设备名称', trigger: 'blur' },
      { validator: this.validateDeviceName, trigger: 'blur' }
    ],
    deviceVendor: [
      { required: true, message: '请选择厂商', trigger: 'change' }
    ],
    pullUrl: [
      { required: true, message: '请输入拉流地址', trigger: 'blur' }
    ],
    resources: [
      { required: true, validator: this.validateResources, trigger: 'blur' }
    ]
  }

  public form: any = {
    dirId: '',
    groupId: '',
    inProtocol: '',
    deviceId: '',
    deviceName: '',
    deviceType: 'ipc',
    deviceVendor: '',
    description: '',
    inType: 'push',
    pullType: 1,
    pushType: 1,
    pullUrl: '',
    tags: '',
    resources: []
  }

  private inTypeList = InType

  private async mounted() {
    if (this.isUpdate) {
      await this.getDeviceInfo()
    } else {
      this.form.dirId = this.dirId
      this.form.inProtocol = this.inProtocol
    }
    this.onGroupChange()
  }

  /**
   * 加载设备信息
   */
  private async getDeviceInfo() {
    try {
      this.loading.device = true
      this.form.deviceId = this.deviceId
      const info = await getDevice({
        deviceId: this.form.deviceId,
        inProtocol: this.inProtocol
      })
      this.form = Object.assign(this.form, pick(info, ['groupId', 'dirId', 'deviceId', 'deviceName', 'inProtocol', 'deviceType', 'deviceVendor',
        'description', 'inType', 'pullType', 'pushType', 'pullUrl', 'tags']))
      // 获取绑定资源包列表
      this.getDeviceResources(info.deviceId, info.deviceType!, info.inProtocol!)
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.loading.device = false
    }
  }

  /**
   * 提交
   */
  private submit() {
    this.beforeSubmit(this.doSubmit)
  }

  /**
   * 执行提交
   */
  private async doSubmit() {
    try {
      this.submitting = true
      let params: any = pick(this.form, ['groupId', 'dirId', 'deviceName', 'inProtocol', 'deviceType', 'deviceVendor', 'description', 'inType', 'tags'])
      if (this.isUpdate) {
        params = Object.assign(params, pick(this.form, ['deviceId']))
      } else {
        params = Object.assign(params, pick(this.form, ['resources']))
      }
      if (this.form.inType === 'push') {
        params = Object.assign(params, pick(this.form, ['pushType']))
      } else {
        params = Object.assign(params, pick(this.form, ['pullType', 'pullUrl']))
      }
      if (this.isUpdate) {
        delete params.deviceType
        delete params.deviceType
        // 获取设备资源包
        await updateDeviceResources({
          deviceId: this.deviceId,
          deviceType: this.form.deviceType,
          inProtocol: this.inProtocol,
          resources: this.form.resources
        })
        await updateDevice(params)
        this.$message.success('修改设备成功！')
      } else {
        await createDevice(params)
        this.$message.success('添加设备成功！')
      }
      this.back()
      this.initDirs()
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.submitting = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-input, .el-select, .el-textarea, .tags {
    width: 400px;
  }

  .in-protocol {
    color: $textGrey;
  }

  .breadcrumb {
    &__item:after {
      content: '/';
      color: $textGrey;
    }
    &__item:last-child:after {
      content: '';
    }
  }
</style>
