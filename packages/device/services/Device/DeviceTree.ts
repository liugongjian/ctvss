import { ToolsEnum } from '../../enums/index'
import { AdvancedSearch } from '../../type/AdvancedSearch'
import { deleteDir as deleteDirApi } from '../../api/dir'
import { exportSearchResult as exportSearchResultApi } from '../../api/device'
import { getDeviceTree } from '../../api/dir'
import { downloadFileUrl } from '@vss/base/utils/excel'

/**
 * ===============================================================================================
 * 操作设备目录树
 */
/**
 * 设备搜索
 * @param state.advancedSearchForm 搜索表单
 * @param state.lazy 是否懒加载的状态
 * @param state.loading 加载中状态
 * @param state.treeSearchResult 搜索结果
 * @param state.deviceTree 树组件
 * @param filterData 过滤字段
 */
const advanceSearch = async function (
  getVueComponent: any,
  filterData?: any
) {
  const state: {
    advancedSearchForm: AdvancedSearch
    lazy: boolean
    loading: any
    treeSearchResult: any
    deviceTree: any
    rootSums: any
    handleTools: any
  } = getVueComponent()
  if (filterData) {
    state.advancedSearchForm.deviceStatusKeys = filterData.deviceStatusKeys
    state.advancedSearchForm.viidStatusKeys = filterData.viidStatusKeys
    state.advancedSearchForm.streamStatusKeys = filterData.streamStatusKeys
    state.advancedSearchForm.matchKeys = filterData.matchKeys
    state.advancedSearchForm.deviceAddresses = filterData.deviceAddresses
    state.advancedSearchForm.inProtocolKey = filterData.inProtocolKey
    state.advancedSearchForm.inputKey = filterData.inputKey
    state.advancedSearchForm.searchKey = filterData.searchKey
    state.advancedSearchForm.revertSearchFlag = filterData.revertSearchFlag
  }
  if (state.lazy) {
    state.treeSearchResult = []
  } else {
    // 初始化树
    await initSearchTree(state)
  }
  state.deviceTree.initCommonTree()
  state.handleTools(ToolsEnum.RefreshRouterView)
}

/**
 * 初始化搜索结果
 * @param state.advancedSearchForm 搜索表单
 * @param state.lazy 是否懒加载的状态
 * @param state.loading 加载中状态
 * @param state.treeSearchResult 搜索结果
 */
const initAdvancedSearch = async function (getVueComponent: any) {
  const state: {
    $route: any
    advancedSearchForm: AdvancedSearch
    lazy: boolean
    loading: any
    treeSearchResult: any
    deviceTree: any
    rootSums: any
  } = getVueComponent()
  if (state.lazy) return
  // 初始化数据
  const query: any = state.$route.query
  state.advancedSearchForm.deviceStatusKeys =
    (query.deviceStatusKeys && query.deviceStatusKeys.split(',')) || []
  state.advancedSearchForm.viidStatusKeys =
    (query.viidStatusKeys && query.viidStatusKeys.split(',')) || []
  state.advancedSearchForm.streamStatusKeys =
    (query.streamStatusKeys && query.streamStatusKeys.split(',')) || []
  if (query.deviceAddresses) {
    const temp = query.deviceAddresses.split(',')
    state.advancedSearchForm.deviceAddresses = {
      code: temp[0],
      level: temp[1]
    }
  }
  state.advancedSearchForm.inProtocolKey = query.inProtocolKey || ''
  state.advancedSearchForm.matchKeys = (query.matchKeys && query.matchKeys.split(',')) || []
  state.advancedSearchForm.inputKey = query.searchKey || ''
  state.advancedSearchForm.searchKey = query.searchKey || ''
  state.advancedSearchForm.revertSearchFlag = Boolean(
    state.advancedSearchForm.searchKey ||
      state.advancedSearchForm.deviceStatusKeys.length ||
      state.advancedSearchForm.viidStatusKeys.length ||
      state.advancedSearchForm.streamStatusKeys.length ||
      state.advancedSearchForm.inProtocolKey ||
      state.advancedSearchForm.deviceAddresses.code
  )
  // 初始化树
  await initSearchTree(state)
  state.deviceTree.initCommonTree()
}

/**
 * 初始化搜索树
 * @param state vue组件对象
 */
const initSearchTree = async function (state: any) {
  try {
    state.loading.tree = true
    const res = await getDeviceTree({
      searchKey: state.advancedSearchForm.searchKey || undefined,
      deviceStatusKeys: state.advancedSearchForm.deviceStatusKeys.join(',') || undefined,
      viidStatusKeys: state.advancedSearchForm.viidStatusKeys.join(',') || undefined,
      streamStatusKeys: state.advancedSearchForm.streamStatusKeys.join(',') || undefined,
      deviceAddresses: state.advancedSearchForm.deviceAddresses.code
        ? state.advancedSearchForm.deviceAddresses.code + ',' + state.advancedSearchForm.deviceAddresses.level
        : undefined,
      inProtocolKey: state.advancedSearchForm.inProtocolKey || undefined,
      matchKeys: state.advancedSearchForm.matchKeys.join(',') || undefined,
    })
    // 递归平铺权限对象authMap
    const tempArr: any[] = [res]
    while (tempArr.length) {
      const item = tempArr.shift()
      if (item.dirs && item.dirs.length) {
        for (let i = 0; i < item.dirs.length; i++) {
          item.dirs[i] = {
            ...item.dirs[i]['authMap'],
            ...item.dirs[i]
          }
          delete item.dirs[i]['authMap']
          tempArr.push(item.dirs[i])
        }
      }
    }
    state.treeSearchResult = res.dirs
    state.rootSums.onlineSize = res.onlineSize
    state.rootSums.totalSize = res.totalSize
  } catch (e) {
    console.log(e && e.message)
  } finally {
    state.loading.tree = false
  }
}

/**
 * 导出搜索结果
 * @param state.advancedSearchForm 搜索表单
 */
const exportSearchResult = async function (state: { advancedSearchForm: AdvancedSearch }) {
  try {
    const search = state.advancedSearchForm
    const data: any = {
      // groupId: this.currentGroupId,
      // inProtocol: this.currentGroupInProtocol,
      deviceStatusKeys: search.deviceStatusKeys.join(',') || undefined,
      viidStatusKeys: search.viidStatusKeys.join(',') || undefined,
      streamStatusKeys: search.streamStatusKeys.join(',') || undefined,
      matchKeys: search.matchKeys.join(',') || undefined,
      deviceAddresses: search.deviceAddresses.code
        ? search.deviceAddresses.code + ',' + search.deviceAddresses.level
        : undefined,
      inProtocolKey: search.inProtocolKey || undefined,
      searchKey: search.searchKey || undefined,
      sortBy: 'OrderSequence',
      sortDirection: 'asc',
      pageSize: 5000,
      pageNum: 1
    }
    const res = await exportSearchResultApi(data)
    downloadFileUrl(`${data.inProtocol}导出设备表格`, res.exportFile)
  } catch (e) {
    console.log(e)
  }
}

/**
 * 打开目录对话框
 * @param state.dialog 弹窗状态
 * @param state.parentDir 上级目录
 * @param state.currentDir 当前目录
 * @param state.sortDir 筛选的目录
 * @param state.sortNode 筛选的节点
 * @param type 触发打开窗口的事件类型
 * @param payload 操作目录信息
 * @param node 操作目录树节点
 */
const openDirectoryDialog = function (
  getVueComponent: any,
  type: string,
  payload: any,
  node?: any
) {
  const state: { dialog: any; parentDir: any; currentDir: any; sortDir: any; sortNode: any } = getVueComponent()
  switch (type) {
    case ToolsEnum.AddDirectory:
      if (payload) {
        state.parentDir = payload
      }
      state.dialog[ToolsEnum.EditDirectory] = true
      break
    case ToolsEnum.EditDirectory:
      if (payload) {
        state.currentDir = payload
      }
      state.dialog[type] = true
      break
    case ToolsEnum.SortDirectory:
      if (payload) {
        state.sortDir = payload
        state.sortNode = node
      }
      state.dialog[type] = true
  }
}

/**
 * 关闭目录对话框
 * @param state.dialog 弹窗状态
 * @param state.parentDir 上级目录
 * @param state.currentDir 当前目录
 * @param state.sortDir 筛选的目录
 * @param state.sortNode 筛选的节点
 * @param type 触发关闭窗口的事件类型
 * @param isRefresh 是否更新树
 */
const closeDirectoryDialog = function (
  getVueComponent: any,
  type: string,
  isRefresh: any
) {
  const state: {
    dialog?: any
    parentDir?: any
    currentDir?: any
    sortDir?: any
    deviceTree?: any
    loadDirChildren?: any,
    handleTreeNode: any,
    handleTools: any
  } = getVueComponent()
  // @ts-ignore
  state.dialog[type] = false
  switch (type) {
    case ToolsEnum.SortDirectory:
      if (isRefresh === true) {
        const key = state.sortDir.id
        if (key === '') {
          state.deviceTree.initCommonTree()
        } else {
          state.deviceTree.loadChildren(key)
        }
      }
      state.handleTreeNode({ id: state.sortDir.id, type: state.sortDir.type })
      state.handleTools(ToolsEnum.RefreshRouterView)
      state.sortDir = null
      break
    case ToolsEnum.AddDirectory:
    case ToolsEnum.EditDirectory:
      try {
        if (isRefresh === true) {
          const key = state.currentDir ? state.currentDir.parentDirId : state.parentDir.id
          if (key === '') {
            state.deviceTree.initCommonTree()
          } else {
            state.deviceTree.loadChildren(key)
          }
        }
      } catch (e) {
        console.log(e)
      }
      state.currentDir = null
      state.parentDir = null
      break
  }
}

/**
 * 删除目录
 * @param state.deviceTree 树组件
 * @param state.gotoRoot 跳转到根
 * @param dir 目录信息
 */
const deleteDir = function (getVueComponent: any, dir: any) {
  const state: { $alertDelete: any, $route: any, deviceTree: any; gotoRoot?: any } = getVueComponent()
  state.$alertDelete({
    type: '目录',
    msg: `是否确认删除目录"${dir.name}"`,
    method: deleteDirApi,
    payload: { dirId: dir.id },
    onSuccess: () => {
      if (dir.parentDirId === '') {
        state.deviceTree.initCommonTree()
      } else {
        state.deviceTree.loadChildren(dir.parentDirId)
      }
    }
  })
}

export default {
  advanceSearch,
  initAdvancedSearch,
  exportSearchResult,
  openDirectoryDialog,
  closeDirectoryDialog,
  deleteDir
}
