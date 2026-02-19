<template>
  <section class="grid min-h-screen place-content-center bg-[#f2efe6] p-5">
    <div class="grid w-[min(460px,92vw)] gap-4 rounded-lg border border-[#ddd8ce] bg-[#f7f4ee] p-6 shadow">
      <h1 class="text-center text-2xl font-bold text-zinc-800">Verify Email</h1>
      <p v-if="loading" class="text-center text-[#7a7467]">Verifying your account...</p>
      <p v-if="success" class="text-center font-semibold text-farm-green">Email verified. Redirecting...</p>
      <p v-if="error" class="text-center font-semibold text-farm-red">{{ error }}</p>
      <RouterLink to="/login" class="text-center font-semibold text-farm-green">Back to Login</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const token = String(route.query.token || '').trim()
  if (!token) {
    loading.value = false
    error.value = 'Missing verification token'
    return
  }
  try {
    await auth.verifyEmail(token)
    success.value = true
    setTimeout(() => router.push('/'), 800)
  } catch (err) {
    error.value = err.message || 'Verification failed'
  } finally {
    loading.value = false
  }
})
</script>
