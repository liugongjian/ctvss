<template>
  <div class="ibox-list-create">
    <el-button class="ibox-create-btn">
      添加/编辑设备
    </el-button>
    <div class="process" />
    <el-steps :active="active" finish-status="success" simple>
      <el-step title="设备配置"><span slot="icon">1</span></el-step>
      <el-step title="接入配置"><span slot="icon">2</span></el-step>
    </el-steps>
    <div v-if="active===1" class="ibox-create">
      <el-form ref="form1" :model="formData1" label-width="130px" :rules="rules">
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="formData1.deviceName" />
        </el-form-item>
        <el-form-item label="设备分类" prop="deviceType">
          <el-select v-model="formData1.deviceType" placeholder="请选择活动区域">
            <el-option v-for="item in deviceType" :key="item.label" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="厂商" prop="region">
          <el-select v-model="formData1.deviceVendor" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai" />
            <el-option label="区域二" value="beijing" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备地址" prop="region">
          <el-select v-model="formData1.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai" />
            <el-option label="区域二" value="beijing" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属行业" prop="region">
          <el-select v-model="formData1.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai" />
            <el-option label="区域二" value="beijing" />
          </el-select>
        </el-form-item>
        <el-form-item label="经纬度:" prop="longlat">
          <el-input v-model="formData1.deviceLongitude" class="longlat-input" /> :
          <el-input v-model="formData1.deviceLatitude" class="longlat-input" />
        </el-form-item>
        <el-form-item label="活动形式" prop="desc">
          <el-input v-model="formData1.description" type="textarea" />
        </el-form-item>
      </el-form>
      <el-button style="margin-top: 12px;" @click="next">下一步</el-button>
      <el-button style="margin-top: 12px;" @click="cancel">取消</el-button>
    </div>
    <div v-if="active===2" class="ibox-create">
      <el-form ref="form2" :model="formData2" label-width="130px" :rules="rules">
        <el-form-item label="特殊资源">
          <el-radio-group v-model="formData2.inProtocol" size="medium">
            <el-radio border label="gb28181" />
            <el-radio border label="RTSP" />
          </el-radio-group>
        </el-form-item>

        <el-form-item label="设备分类" prop="deviceType">
          <el-select v-model="formData2.deviceType" placeholder="请选择设备类型">
            <el-option v-for="item in deviceType" :key="item.label" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="formData2.deviceName" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input v-model="formData2.deviceName" />
        </el-form-item>
        <el-form-item label="GB28181账号" prop="deviceType">
          <el-select v-model="formData2.deviceType" placeholder="请选择活动区域">
            <el-option v-for="item in deviceType" :key="item.label" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="自动拉流" prop="delivery">
          <el-switch v-model="formData2.delivery" />
        </el-form-item>
        <el-form-item label="设备MAC地址">
          <el-input v-model="formData2.deviceName" />
        </el-form-item>
        <el-form-item label="杆号">
          <el-input v-model="formData2.deviceName" />
        </el-form-item>
      </el-form>
      <el-button style="margin-top: 12px;" @click="pre">上一步</el-button>
      <el-button style="margin-top: 12px;" @click="create">创建</el-button>
      <el-button style="margin-top: 12px;" @click="cancel">取消</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { createDevice } from '@/api/ibox'

@Component({
  name: 'Create',
  components: {
  }
})

export default class CreateIBox extends Vue {
  public active = 1

  public formData1 = {
    deviceName: '',
    deviceType: '',
    deviceVendor: '',
    description: '',
    deviceLongitude: 0,
    deviceLatitude: 0,
    region: ''
  }

  public formData2 = {
    deviceName: '',
    deviceType: '',
    delivery: '',
    inProtocol: ''
  }

  public rules = {
    deviceName: [
      { required: true, message: '请输入设备名称', trigger: 'blur' },
      { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
    ],
    deviceType: [
      { required: true, message: '请选择设备分类', trigger: 'change' }
    ]
  }

  public deviceType = [
    {
      label: 'ipc',
      value: 'ipc'
    }, {
      label: 'nvr',
      value: 'nvr'
    }, {
      label: 'platform',
      value: 'platform'
    }
  ]

  async mounted() {
    // await this.getIBoxList()
  }

  public next() {
    const form = this.$refs.form1 as any
    form.validate((valid) => {
      if (valid) {
        if (this.active++ > 1) this.active = 0
        console.log('formData-->', this.formData1)
      }
    })
  }

  public pre() {
    this.active = 1
  }

  public cancel() {

  }

  public async create() {
    const { query } = (this.$route) as any
    const { deviceId } = query
    const param = {
      device: {
        parentDeviceId: deviceId,
        ...this.formData1
      },
      videos: [
        {
          InVideoProtocol: this.formData2.inProtocol,
          GB28181Device: {
            ...this.formData2
          }
        }
      ],
      'Industry': {
        'InOrgRegion': '0851002',
        'InOrgRegionLevel': 1,
        'IndustryCode': '22',
        'NetworkCode': '7',
        'OutId': '123'
      }

    }
    createDevice(param).then(() => {
      this.$parent.showAdd()
      this.$parent.getBoxList()
    })
  }
}
</script>
  <style lang="scss" scoped>
.ibox-list-create {
  width: 100%;
  height: calc(100% - 20px);
  padding: 0 20px 10px 0;
  overflow: auto;

  .ibox-create-btn {
    margin: 10px 0;
  }

  .ibox-create {
    width: 60%;
  }

  .process {
    // padding: 20px 30px;
    border-bottom: 1px solid $borderGrey;

    .el-steps--simple {
      width: 400px;
      background: none;
      padding: 0;

      ::v-deep {
        .el-step.is-simple .el-step__head {
          padding-right: 15px;
        }

        .el-step.is-simple .el-step__arrow {
          margin-right: 15px;
          align-self: center;
          height: 0;
          border-bottom: 2px solid $primary;

          &:before,
          &:after {
            content: none;
          }
        }

        .el-step__title {
          flex: 0 0 80px;
          color: #000;
        }

        .el-step__icon {
          width: 30px;
          height: 30px;
          font-size: 16px;
          font-weight: bold;
        }

        .is-success {
          .el-step__icon {
            color: $primary;
            border-color: $primary;
          }
        }

        .is-process {
          .el-step__icon {
            background: $primary;
            color: #fff;
            border-color: $primary;
          }
        }

        .is-wait,
        .is-finish {
          color: $textGrey;

          .el-step__icon {
            border-color: $textGrey;
          }
        }

        .is-finish {
          .el-step__icon {
            background: #bbb;
            color: #fff;
            border-color: #bbb;
          }
        }
      }
    }
  }
}
  </style>
