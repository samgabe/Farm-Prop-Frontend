<template>
  <div v-if="isPublicRoute" class="min-h-screen">
    <header class="border-b border-black/10 bg-farm-bg px-4 py-3">
      <div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <img src="/assets/logo.png" alt="FarmPro" class="h-7 w-7 rounded-md object-cover" />
          <strong class="text-lg text-zinc-800">FarmPro</strong>
        </div>
        <nav class="flex items-center gap-2 text-xs sm:text-sm">
          <RouterLink v-if="route.path !== '/login'" to="/login" class="rounded-md border border-[#c8c2b5] px-2 py-1 text-zinc-700">Sign In</RouterLink>
          <RouterLink v-if="route.path !== '/register'" to="/register" class="rounded-md bg-farm-green px-2 py-1 font-semibold text-white">Register</RouterLink>
        </nav>
      </div>
    </header>
    <RouterView />
    <footer class="border-t border-black/10 bg-farm-bg px-4 py-4 text-center text-xs text-[#7a7467]">
      FarmPro © {{ currentYear }}. Built for reliable farm records.
    </footer>
  </div>

  <div v-else class="min-h-screen bg-farm-bg text-zinc-800 lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
    <header class="sticky top-0 z-40 flex items-center justify-between border-b border-black/10 bg-farm-bg px-4 py-3 lg:hidden">
      <div class="flex items-center gap-2">
        <img src="/assets/logo.png" alt="FarmPro" class="h-8 w-8 rounded-md object-cover" />
        <strong class="text-xl">FarmPro</strong>
      </div>
      <button class="rounded-md border border-[#c8c2b5] px-3 py-1 text-sm" @click="mobileNavOpen = true">Menu</button>
    </header>
    <div class="border-b border-black/10 bg-farm-bg px-4 py-2 lg:hidden">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide text-[#7a7467]">{{ currentSectionLabel }}</p>
          <strong class="text-sm text-zinc-800">{{ currentSectionTitle }}</strong>
        </div>
        <p class="text-xs text-[#7a7467]">{{ todayLabel }}</p>
      </div>
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <button class="rounded-md border border-[#c8c2b5] px-2.5 py-1 text-xs text-zinc-700" @click="refreshPage">Refresh</button>
        <button class="rounded-md bg-farm-green px-2.5 py-1 text-xs font-semibold text-white" @click="logout">Logout</button>
      </div>
    </div>

    <aside class="hidden flex-col border-r-2 border-black/10 bg-gradient-to-r from-[#2f5736] to-[#355f3a] text-[#f4efe4] lg:flex">
      <div class="flex items-center gap-3 border-b border-white/10 p-5">
        <img src="/assets/logo.png" alt="FarmPro" class="h-12 w-12 rounded-lg object-cover" />
        <div>
          <h1 class="m-0 text-3xl font-bold leading-none">FarmPro</h1>
          <p class="mt-1 text-sm text-[#d7d1c2]">Livestock Manager</p>
        </div>
      </div>

      <nav class="flex flex-col gap-1 p-3">
        <RouterLink
          v-for="item in allowedNavItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 rounded-md px-4 py-2.5 text-lg transition-colors"
          :class="route.path === item.path ? 'bg-farm-gold font-bold text-zinc-800' : 'text-[#f5f1e6] hover:bg-white/10'"
        >
          <component :is="navIconMap[item.icon]" class="h-[18px] w-[18px]" />
          {{ item.name }}
        </RouterLink>
      </nav>

      <div class="mt-auto flex items-center gap-3 border-t border-white/10 p-4">
        <div class="grid h-10 w-10 place-items-center rounded-full bg-[#4c7152] text-sm font-bold">{{ initials }}</div>
        <div>
          <strong class="text-sm">{{ auth.user?.name || 'Farm User' }}</strong>
          <p class="mt-0.5 text-xs text-[#d7d1c2]">{{ auth.user?.role || 'owner' }}</p>
        </div>
      </div>

      <button
        class="mx-4 mb-4 rounded-lg border border-white/35 bg-transparent px-3 py-2 text-sm text-[#f5f1e6]"
        @click="logout"
      >
        Logout
      </button>
    </aside>

    <main class="min-w-0 p-4 lg:p-8">
      <header class="mb-4 hidden items-center justify-between border-b border-black/10 pb-3 lg:flex">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-[#7a7467]">{{ currentSectionLabel }}</p>
          <strong class="text-lg text-zinc-800">{{ currentSectionTitle }}</strong>
        </div>
        <div class="flex items-center gap-2">
          <p class="text-sm text-[#7a7467]">{{ todayLabel }}</p>
          <button class="rounded-md border border-[#c8c2b5] px-3 py-1 text-sm text-zinc-700" @click="refreshPage">Refresh</button>
          <button class="rounded-md bg-farm-green px-3 py-1 text-sm font-semibold text-white" @click="logout">Logout</button>
        </div>
      </header>
      <RouterView />
      <footer class="mt-8 border-t border-black/10 pt-4 text-center text-xs text-[#7a7467]">
        FarmPro © {{ currentYear }}. Built for reliable farm records.
      </footer>
    </main>

    <Teleport to="body">
      <div v-if="mobileNavOpen" class="fixed inset-0 z-50 lg:hidden">
        <button class="absolute inset-0 bg-black/45" @click="mobileNavOpen = false" />
        <aside class="relative h-full w-[82%] max-w-[300px] bg-gradient-to-r from-[#2f5736] to-[#355f3a] text-[#f4efe4]">
          <div class="flex items-center justify-between border-b border-white/10 p-4">
            <div class="flex items-center gap-2">
              <img src="/assets/logo.png" alt="FarmPro" class="h-9 w-9 rounded-md object-cover" />
              <strong class="text-xl">FarmPro</strong>
            </div>
            <button class="rounded-md border border-white/30 px-3 py-1 text-sm" @click="mobileNavOpen = false">Close</button>
          </div>
          <nav class="flex flex-col gap-1 p-3">
            <RouterLink
              v-for="item in allowedNavItems"
              :key="item.path + '-mobile'"
              :to="item.path"
              class="flex items-center gap-3 rounded-md px-4 py-2.5 text-lg transition-colors"
              :class="route.path === item.path ? 'bg-farm-gold font-bold text-zinc-800' : 'text-[#f5f1e6] hover:bg-white/10'"
              @click="mobileNavOpen = false"
            >
              <component :is="navIconMap[item.icon]" class="h-[18px] w-[18px]" />
              {{ item.name }}
            </RouterLink>
          </nav>
        </aside>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { navItems } from './data/farmData'
import { useAuthStore } from './stores/auth'
import { navIconMap } from './utils/icons'
import { hasRouteAccess } from './utils/rbac'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const mobileNavOpen = ref(false)
const currentYear = new Date().getFullYear()

onMounted(() => {
  auth.init()
})

const isPublicRoute = computed(() => Boolean(route.meta.public))
const allowedNavItems = computed(() => {
  const role = auth.role || auth.user?.role || ''
  if (!auth.initialized || !role) return navItems
  return navItems.filter((item) => hasRouteAccess(role, item.key))
})
const currentNavItem = computed(() => navItems.find((item) => item.path === route.path) || null)
const currentSectionTitle = computed(() => currentNavItem.value?.name || 'Dashboard')
const currentSectionLabel = computed(() => currentNavItem.value?.key ? 'Current Section' : 'FarmPro')
const todayLabel = computed(() => new Date().toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }))

const initials = computed(() => {
  const name = auth.user?.name || 'Farm User'
  const parts = name.trim().split(/\s+/)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || 'FU'
})

function logout() {
  auth.logout()
  router.push('/login')
}

function refreshPage() {
  window.location.reload()
}
</script>
