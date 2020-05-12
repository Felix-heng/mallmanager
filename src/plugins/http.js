// 使用axios（本身是属于第三方库 与vue没有任何关系）  封装vue插件
import axios from 'axios';
import { Message } from 'element-ui';

//1. 定义插件
const MyPlugin = {}

// 2.开发插件
MyPlugin.install = function (Vue, options) {
  // 基准地址设置
  axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/';

  // 除了登录以外的所有请求对需要通过 登录后的token来进行授权，要不然无法获取相应的数据
  // 只会加载一次 token凭证 当退出后刷新页面则无法再次获取token凭证来进行验证 导致无法显示数据（所以需要拦截器去对每一请求进行拦截）
  // let AUTH_TOKEN = localStorage.getItem("token")
  // axios.defaults.headers.common['Authorization'] = AUTH_TOKEN

  // axios拦截器
  // 添加请求拦截器
  axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    if(config.url !== 'login'){
      let AUTH_TOKEN = localStorage.getItem("token")
      // 在当前请求下加入 Authorization
      config.headers['Authorization'] = AUTH_TOKEN
    }
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  })

  // 需求：对所有网络失败请求 (不是200 或201) 400 404 500 403 统一处理
  axios.interceptors.response.use(function(response){
    // 对数据响应做点什么
    let {meta:{msg,status}} = response.data
    // 表示服务器返回失败
    if (status!==200 && status!==201) {
      Message.error(msg)
    }
    return response
  },function(error){
    Message.error('服务器正在维修中...')
    // 对响应错误做点什么
    return Promise.reject(error)
  }
  )



  // 添加实例方法
  Vue.prototype.$http = axios
}

//   3.导出插件

export default MyPlugin
