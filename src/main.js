// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import '@/assets/css/layout.css'
import router from './router'
import http from '@/plugins/http'
import comBreadcrumb from '@/components/commons/cusBreadcrumb'  //面包屑组件
import echarts from 'echarts'

// 是否是生产环境
Vue.config.productionTip = false

// 安装插件
Vue.use(ElementUI)
// 网络请求axios
Vue.use(http)
// 时间插件moment
Vue.use(require('vue-moment'))
// 图形插件
// Vue.prototype.$echarts = echarts
// 注册面包屑全局组件 (组件名  导入的组件)
Vue.component('comBreadcrumb', comBreadcrumb)

/* eslint-disable no-new */

new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
