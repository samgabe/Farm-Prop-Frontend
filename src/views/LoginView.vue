<template>
  <section class="grid min-h-screen place-content-center bg-[#f2efe6] bg-[linear-gradient(rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-[size:40px_40px] p-5">
    <div class="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-farm-green">
      <img src="/assets/logo.png" alt="FarmPro" class="h-12 w-12 rounded-lg" />
    </div>
    <h1 class="mt-3 text-center text-3xl font-bold text-zinc-800 md:text-4xl">Welcome to FarmPro</h1>
    <p class="mb-4 text-center text-base text-[#7a7467]">Sign in to manage your livestock</p>

    <form class="grid w-[min(460px,92vw)] gap-3 rounded-lg border border-[#ddd8ce] bg-[#f7f4ee] p-6 shadow" @submit.prevent="submit">
      <label class="font-bold">Email Address</label>
      <div class="relative">
        <Mail class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#847a67]" />
        <input v-model="form.email" type="email" autocomplete="email" placeholder="farmer@example.com" required class="w-full rounded-md border border-[#cdc6b7] bg-[#f1eee6] py-3 pl-11 pr-3" />
      </div>

      <label class="mt-2 font-bold">Password</label>
      <div class="relative">
        <Lock class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#847a67]" />
        <input v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="••••••••" required minlength="6" class="w-full rounded-md border border-[#cdc6b7] bg-[#f1eee6] py-3 pl-11 pr-3" />
      </div>
      <small class="text-sm text-[#7a7467]">Minimum 6 characters</small>
      <label class="inline-flex items-center gap-2 text-sm text-[#7a7467]">
        <input v-model="showPassword" type="checkbox" class="h-4 w-4" />
        Show password
      </label>

      <button class="mt-2 rounded-lg bg-farm-green px-4 py-3 font-semibold text-white disabled:opacity-60" type="submit" :disabled="auth.loading">
        {{ auth.loading ? 'Signing In...' : 'Sign In' }}
      </button>

      <p class="text-center text-sm">
        <RouterLink to="/forgot-password" class="font-semibold text-farm-green">Forgot password?</RouterLink>
      </p>

      <p class="text-center text-[#7a7467]">
        Don't have an account?
        <RouterLink to="/register" class="font-bold text-farm-green">Register here</RouterLink>
      </p>
      <p v-if="notice" class="m-0 font-semibold text-farm-green">{{ notice }}</p>
      <p v-if="error" class="m-0 font-semibold text-farm-red">{{ error }}</p>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Lock, Mail } from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const error = ref('')
const notice = ref(route.query.registered ? 'Account created. Verify your email before signing in.' : '')
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: ''
})

async function submit() {
  error.value = ''
  const email = String(form.email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    error.value = 'Enter a valid email address'
    return
  }
  if (String(form.password || '').length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  try {
    await auth.login({ email, password: form.password })
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Login failed'
  }
}
</script>
