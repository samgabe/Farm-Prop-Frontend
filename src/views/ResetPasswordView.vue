<template>
  <section class="grid min-h-screen place-content-center bg-[#f2efe6] p-5">
    <form class="grid w-[min(460px,92vw)] gap-4 rounded-lg border border-[#ddd8ce] bg-[#f7f4ee] p-6 shadow" @submit.prevent="submit">
      <h1 class="text-center text-2xl font-bold text-zinc-800">Reset Password</h1>
      <input v-model="password" :type="showPasswords ? 'text' : 'password'" autocomplete="new-password" required minlength="6" placeholder="New password" class="w-full rounded-md border border-[#cdc6b7] bg-[#f1eee6] px-3 py-3" />
      <input v-model="confirmPassword" :type="showPasswords ? 'text' : 'password'" autocomplete="new-password" required minlength="6" placeholder="Confirm password" class="w-full rounded-md border border-[#cdc6b7] bg-[#f1eee6] px-3 py-3" />
      <label class="inline-flex items-center gap-2 text-sm text-[#7a7467]">
        <input v-model="showPasswords" type="checkbox" class="h-4 w-4" />
        Show passwords
      </label>
      <button class="rounded-lg bg-farm-green px-4 py-3 font-semibold text-white disabled:opacity-60" :disabled="auth.loading" type="submit">
        {{ auth.loading ? 'Resetting...' : 'Reset Password' }}
      </button>
      <p v-if="notice" class="m-0 text-center font-semibold text-farm-green">{{ notice }}</p>
      <p v-if="error" class="m-0 text-center font-semibold text-farm-red">{{ error }}</p>
      <RouterLink to="/login" class="text-center font-semibold text-farm-green">Back to Login</RouterLink>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const password = ref('')
const confirmPassword = ref('')
const showPasswords = ref(false)
const error = ref('')
const notice = ref('')

async function submit() {
  error.value = ''
  notice.value = ''
  const token = String(route.query.token || '').trim()
  if (!token) {
    error.value = 'Missing reset token'
    return
  }
  if (String(password.value || '').length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  try {
    await auth.resetPassword(token, password.value)
    notice.value = 'Password updated. Redirecting to login...'
    setTimeout(() => router.push('/login'), 900)
  } catch (err) {
    error.value = err.message || 'Reset failed'
  }
}
</script>
