import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/download',
      name: 'download',
      component: () => import('../views/DownloadView.vue')
    },
    {
      path: '/generator',
      name: 'generator',
      component: () => import('../views/GeneratorView.vue')
    },
    {
      path: '/docs/:lang/:path*',
      name: 'docs',
      component: () => import('../views/DocsView.vue')
    }
  ]
})

export default router
