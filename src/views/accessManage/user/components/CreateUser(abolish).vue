<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <div class="main-box">
        <div class="head">
          <div class="head__left">
            <el-button type="primary" @click="addUser" :disabled="form.userList.length === 10">添加新增用户</el-button>
            <span style="color: #999999">(单次最多创建10个用户)</span>
          </div>
          <div class="head__right">
            <el-checkbox v-model="form.resetPassword">用户必须在下次登录时重置密码</el-checkbox>
          </div>
        </div>
        <el-form 
          :model="form"
          :rules="form.rules" 
          label-position="left" 
          ref="userForm"
        >
          <el-table :data="form.userList" max-height="500">
            <el-table-column prop="userName" label="用户名" width="250">
              <template slot="header">
                <el-form-item label="用户名" required style="margin: 0px 0;"/>
              </template>
              <template slot-scope="scope">
                <el-form-item 
                  :prop="'userList.' + scope.$index + '.userName'"
                  :rules="form.rules.userName"
                  style="margin: 18px 0;"
                >
                  <el-input size="mini" v-model="scope.row.path" placeholder="用户名"></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="accessType" label="访问方式" width="200">
              <template slot-scope="scope">
                <span>{{ accessTypeObj[scope.row.accessType] }}</span>
                <el-button @click="accessEdit(scope.row.accessType, scope.$index)" style="margin-left: 5px" type="text">
                  <svg-icon name="edit" />
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="policy" label="用户权限">
              <template>
                <span>{{ '无' }}</span>
                <el-button @click="accessEdit(scope.row.accessType, scope.$index)" style="margin-left: 5px" type="text">
                  <svg-icon name="edit" />
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140">
              <template slot-scope="scope">
                <el-button type="text" @click="form.userList.splice(scope.$index, 1)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
        <div class="foot">
          <el-button type="primary" @click="submit">创建用户</el-button>
          <el-button @click="back">取消</el-button>
        </div>
      </div>
    </el-card>
    <EditAccessType
      v-if="showAccessEditDialog"
      @on-close="closeDialog"
      @on-return="getReturnAccessType"
      :dialogData="dialogData"
    />
  </div>
</template>

<script>
import EditAccessType from './dialogs/EditAccessType.vue'
export default {
  components: {
    EditAccessType
  },
  data() {
    return {
      showAccessEditDialog: false,
      breadCrumbContent: '',
      form: {
        resetPassword: true,
        userList: [],
        rules: {
          userName: [
            { required: true, message: '用户名必填', trigger: 'blur' },
          ]
        },
      },
      accessTypeObj: {
        a: '编程访问',
        b: '控制台访问'
      },
      dialogData: {}
    }
  },
  mounted() {
    this.breadCrumbContent = this.$route.meta.title
  },
  methods: {
    accessEdit(val, index) {
      this.showAccessEditDialog = true
      this.dialogData = {
        val: val,
        index: index
      }
    },
    getReturnAccessType(dialogData) {
      this.form.userList[dialogData.index].accessType = dialogData.val
    },
    closeDialog() {
      this.showAccessEditDialog = false
    },
    addUser() {
      let obj = {
        userName: '',
        accessType: 'b',
        plicy: ''
      }
      this.form.userList.push(obj)
    },
    submit() {
      if (this.form.userList.length === 0) {
        this.$message.error('请添加新增用户')
      }
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          console.log('success')
        }
      })
    },
    back() {
      this.$router.push(`/accessManage/user`)
    }
  }
}
</script>

<style lang="scss" scoped>
  .main-box {
    max-width: 1000px;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    &__left {
      .el-button {
        margin-right: 20px;
      }
    }
    &__right {
      display: flex;
      padding-right: 10px;
    }
  }
  .foot {
    margin-top: 20px;
  }
</style>
