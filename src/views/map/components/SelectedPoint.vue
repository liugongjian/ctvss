<template>
  <div>
    <el-descriptions title="共选中两个节点" :column="1">
      <el-descriptions-item label="IPC1">
        <el-input v-model="editValue" disabled />
      </el-descriptions-item>
      <el-descriptions-item label="IPC2">
        <el-input v-model="editValue" disabled />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>
