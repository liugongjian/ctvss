<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <el-form ref="form" class="form" :rules="rules" :model="form" label-width="100px">
        <el-form-item label="策略名：" prop="policyName">
          <el-input v-model="form.policyName" class="form__input" placeholder="admin" />
        </el-form-item>
        <el-form-item label="描述：" prop="describe">
          <el-input
            v-model="form.describe"
            class="form__input"
            type="textarea"
            rows="4"
          />
        </el-form-item>
        <el-form-item label="策略：" prop="policy">
          <div class="policy">
            <div>
              <div class="list">
                <div class="list__title">资源</div>
                <el-checkbox style="margin-left: 24px" v-model="sourceCheckAll" @change="checkAllChange('source')">全选</el-checkbox>
                <el-tree
                  ref="sourceTree"
                  :props="props"
                  :load="loadNode"
                  lazy
                  show-checkbox
                  node-key="name"
                  @check-change="sourceCheckChange"
                />
              </div>
            </div>
            <div style="margin-left: 200px">
              <div class="list">
                <el-input v-model="search" placeholder="请输入内容">
                  <el-button slot="append" icon="el-icon-search" />
                </el-input>
                <div class="list__title" style="margin: 8px">操作</div>
                <el-checkbox style="margin-left: 24px" v-model="operateCheckAll" @change="checkAllChange('operate')">全选</el-checkbox>
                <el-tree
                  ref="operateTree"
                  :props="props"
                  :load="loadNode"
                  lazy
                  show-checkbox
                  node-key="name"
                  @check-change="operateCheckChange"
                />
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-row style="margin: 20px 0">
            <el-button type="primary" class="add" @click="addPolicy">添加声明</el-button>
          </el-row>
          <el-row>
            <el-table :data="policyList">
              <el-table-column prop="source" label="已选资源" />
              <el-table-column prop="operate" label="已选操作" />
              <el-table-column label="操作" width="140">
                <template slot-scope="scope">
                  <el-button type="text" @click="policyList.splice(scope.$index, 1)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-row>
          <el-row style="margin: 20px 0">
            <el-button type="primary" class="confirm" @click="upload">确认</el-button>
            <el-button class="cancel" @click="back">取消</el-button>
          </el-row>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      breadCrumbContent: '',
      form: {
        policyName: '',
        describe: ''
      },
      rules: {
        policyName: [
          { required: true, message: '必须输入策略名称', trigger: 'blur' }
        ]
      },
      search: '',
      props: {
        label: 'name',
        children: 'zones'
      },
      count: 1,
      sourceCheckBoxes: [],
      operateCheckBoxes: [],
      sourceCheckAll: false,
      operateCheckAll: false,
      policyList: []
    }
  },
  mounted() {
    this.policyList = []
    this.breadCrumbContent = this.$route.meta.title
  },
  methods: {
    sourceCheckChange() {
      this.sourceCheckBoxes = this.$refs.sourceTree.getCheckedKeys()
      console.log('sourceCheckBoxes', this.sourceCheckBoxes)
    },
    operateCheckChange() {
      this.operateCheckBoxes = this.$refs.operateTree.getCheckedKeys()
      console.log('operateCheckBoxes', this.operateCheckBoxes)
    },
    checkAllChange(type) {
      if (this[`${type}CheckAll`]) {
        this.$refs[`${type}Tree`].setCheckedNodes([{ name: 'region1' }, { name: 'region2' }])
      } else {
        this.$refs[`${type}Tree`].setCheckedKeys([])
      }
    },
    addPolicy() {
      if (this.sourceCheckBoxes.length === 0) {
        this.$message({
          type: 'error',
          message: `请为策略配置资源`
        })
        return
      } else if (this.operateCheckBoxes.length === 0) {
        this.$message({
          type: 'error',
          message: `请为策略配置操作`
        })
        return
      }
      this.policyList.push({
        source: this.sourceCheckBoxes.join(','),
        operate: this.operateCheckBoxes.join(',')
      })
      console.log(this.policyList)
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        return resolve([{ name: 'region1' }, { name: 'region2' }])
      }
      // if (node.level > 3) return resolve([])

      var hasChild
      if (node.data.name === 'region1') {
        hasChild = true
      } else if (node.data.name === 'region2') {
        hasChild = false
      } else {
        hasChild = Math.random() > 0.5
      }

      setTimeout(() => {
        var data
        if (hasChild) {
          data = [{
            name: 'zone' + this.count++
          }, {
            name: 'zone' + this.count++
          }]
        } else {
          data = []
        }

        resolve(data)
      }, 500)
    },
    upload() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          console.log('unploaded')
        }
      })
    },
    back() {
      this.$router.push(`/accessManage/policy`)
    }
  }
}
</script>

<style lang="scss" scoped>
  .form {
    margin-left: 10px;
    &__input {
      width: 500px;
    }
  }
  .policy {
    display: flex;
  }
  .list {
    height: 400px;
    width: 400px;
    overflow: auto;
    border: 1px solid #D7D7D7;
    border-top: none;
    border-radius: 5px;
    &__title {
      height: 40px;
      line-height: 40px;
      background: #F2F2F2;
      padding-left: 20px;
    }
  }
  .el-table {
    width: 90%
  }
</style>
