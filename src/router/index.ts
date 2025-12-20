import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TaskView from '../views/TaskView.vue'
import ShopView from '../views/ShopView.vue'
import FriendsView from '../views/FriendsView.vue'
import WithdrawView from '../views/WithdrawView.vue'
import WithdrawHistoryView from '@/views/WithdrawHistoryView.vue'
import LeaderboardView from '@/views/LeaderboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/tasks',
      component: TaskView,
      children: [
        {
          path: '',
          redirect: '/tasks/main',
        },
        {
          path: 'main',
          name: 'main-tasks',
          component: () => import('@/views/task/TaskMainView.vue'),
        },
        {
          path: 'partner',
          name: 'partner-tasks',
          component: () => import('@/views/task/TaskPartnerView.vue'),
        },
      ],
    },
    {
      path: '/shop',
      name: 'shop',
      component: ShopView,
    },
    {
      path: '/friends',
      name: 'friends',
      component: FriendsView,
    },
    {
      path: '/withdraw',
      name: 'withdraw',
      component: WithdrawView,
    },
    {
      path: '/withdraw-history',
      name: 'withdraw-history',
      component: WithdrawHistoryView,
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: LeaderboardView,
    },
  ],
})

export default router
