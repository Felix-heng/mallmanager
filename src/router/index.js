import Vue from 'vue'
import Router from 'vue-router'
import AppHome from '@/components/AppHome'
import AppLogin from '@/components/login/AppLogin'
import WelCome from '@/components/WelCome';
import AppUsers from '@/components/users/AppUsers';
import AppRight from '@/components/roles/AppRight';
import AppRoles from '@/components/roles/AppRoles';
import AppGoodsList from '@/components/goods/AppGoodsList';
import AppGoodsAdd from '@/components/goods/AppGoodsAdd';
import AppGoodsEdit from '@/components/goods/AppGoodsEdit';
import AppGoodsParams from '@/components/goods/AppGoodsParams';
import AppGoodsCategorys from '@/components/goods/AppGoodsCategorys';
import AppGoodsOrders from '@/components/goods/AppGoodsOrders';
import Appreports from '@/components/reporte/Appreports';
import { Message } from 'element-ui';

Vue.use(Router)
let router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: AppHome,
      children: [
        {
          path: '/',
          name: 'welcome',
          component: WelCome
        },
        {
          path: '/users',
          name: 'users',
          component: AppUsers
        },
        {
          path: '/rights',
          name: 'rights',
          component: AppRight
        },
        {
          path: '/roles',
          name: 'roles',
          component: AppRoles
        },
        {
          path: '/goods',
          name: 'goods',
          component: AppGoodsList
        },
        {
          path: '/goodsadd',
          name: 'goodsadd',
          component: AppGoodsAdd
        }, 
        {
          path: '/goodsedit/:id',
          name: 'goodsedit',
          component: AppGoodsEdit
        },
        {
          path: '/params',
          name: 'params',
          component: AppGoodsParams
        },
        {
          path: '/categories',
          name: 'categories',
          component: AppGoodsCategorys
        },
        {
          path: '/orders',
          name: 'orders',
          component: AppGoodsOrders
        },
        {
          path: '/reports',
          name: 'reports',
          component: Appreports
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: AppLogin
    }
  ]
})
//添加路由守卫 (避免在登录以后token失效导致数据无法展示就需要跳回登陆页面重新登录获取token) 每次调用路由时验证是否存在token凭证
router.beforeEach((to, from, next) => {
  // 如果是从登录请求进入就不验证(进登录的时候就会获得token凭证)
  if (to.name ==='login') {
    next()
  }else{
    // 其他情况都要验证
    let token = localStorage.getItem('token')
    if (!token) {
      Message.warning("请先登录！")
      router.push({
        name : 'login'
      })
    }
  }
  next()
})

export default router
