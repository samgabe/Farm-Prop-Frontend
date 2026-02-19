import { defineStore } from 'pinia'
import { apiGet, apiPost } from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('farmpro_token') || '',
    role: localStorage.getItem('farmpro_role') || '',
    user: null,
    loading: false,
    initialized: false
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token)
  },
  actions: {
    setSession(res) {
      this.token = res?.token || ''
      this.user = res?.user || null
      this.role = res?.user?.role || ''
      if (this.token) {
        localStorage.setItem('farmpro_token', this.token)
      } else {
        localStorage.removeItem('farmpro_token')
      }
      if (this.role) {
        localStorage.setItem('farmpro_role', this.role)
      } else {
        localStorage.removeItem('farmpro_role')
      }
    },
    async init() {
      if (!this.token) {
        this.initialized = true
        return
      }
      try {
        this.user = await apiGet('/api/auth/me')
        this.role = this.user?.role || ''
        if (this.role) localStorage.setItem('farmpro_role', this.role)
      } catch {
        this.logout()
      } finally {
        this.initialized = true
      }
    },
    async login(payload) {
      this.loading = true
      try {
        const res = await apiPost('/api/auth/login', payload)
        this.setSession(res)
      } finally {
        this.loading = false
      }
    },
    async register(payload) {
      this.loading = true
      try {
        return await apiPost('/api/auth/register', payload)
      } finally {
        this.loading = false
      }
    },
    async verifyEmail(token) {
      this.loading = true
      try {
        const res = await apiPost('/api/auth/verify-email', { token })
        this.setSession(res)
        return res
      } finally {
        this.loading = false
      }
    },
    async forgotPassword(email) {
      this.loading = true
      try {
        return await apiPost('/api/auth/forgot-password', { email })
      } finally {
        this.loading = false
      }
    },
    async resetPassword(token, newPassword) {
      this.loading = true
      try {
        return await apiPost('/api/auth/reset-password', { token, newPassword })
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.token = ''
      this.role = ''
      this.user = null
      localStorage.removeItem('farmpro_token')
      localStorage.removeItem('farmpro_role')
    }
  }
})
