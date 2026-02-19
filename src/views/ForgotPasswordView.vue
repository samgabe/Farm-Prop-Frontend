<template>
  <section class="grid min-h-screen place-content-center bg-[#f2efe6] p-5">
    <form class="grid w-[min(460px,92vw)] gap-4 rounded-lg border border-[#ddd8ce] bg-[#f7f4ee] p-6 shadow" @submit.prevent="submit">
      <h1 class="text-center text-2xl font-bold text-zinc-800">Forgot Password</h1>
      <p class="text-center text-[#7a7467]">Enter your email and we will send reset instructions.</p>
      <input v-model="email" type="email" autocomplete="email" required placeholder="you@example.com" class="w-full rounded-md border border-[#cdc6b7] bg-[#f1eee6] px-3 py-3" />
      <button class="rounded-lg bg-farm-green px-4 py-3 font-semibold text-white disabled:opacity-60" :disabled="auth.loading" type="submit">
        {{ auth.loading ? 'Sending...' : 'Send Reset Email' }}
      </button>
      <p v-if="notice" class="m-0 text-center font-semibold text-farm-green">{{ notice }}</p>
      <p v-if="error" class="m-0 text-center font-semibold text-farm-red">{{ error }}</p>
      <RouterLink to="/login" class="text-center font-semibold text-farm-green">Back to Login</RouterLink>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const email = ref('')
const error = ref('')
const notice = ref('')

async function submit() {
  error.value = ''
  notice.value = ''
  try {
    const res = await auth.forgotPassword(String(email.value || '').trim().toLowerCase())
    notice.value = res?.message || 'If the email exists, reset instructions were sent.'
  } catch (err) {
    error.value = err.message || 'Unable to process request'
  }
}
</script>
