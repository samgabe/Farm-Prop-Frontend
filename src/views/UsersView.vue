<template>
  <section class="min-w-0">
    <header class="flex flex-col justify-between gap-3 md:flex-row md:items-start">
      <div>
        <h2 class="text-2xl font-bold text-zinc-800 md:text-3xl">User Management</h2>
        <p class="mt-2 text-base text-[#7a7467]">Manage farm staff and permissions</p>
      </div>
      <button v-if="canManageUsers" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" @click="openCreateModal">
        + Add User
      </button>
    </header>
    <div class="mt-4 grid gap-3 md:grid-cols-[1fr_120px]">
      <input v-model="query" type="text" placeholder="Search name, email, role..." class="w-full rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" @keyup.enter="loadData(1)" />
      <button class="rounded-lg border border-[#d1cbc0] bg-[#f2f0ea] px-4 py-3 text-zinc-800" @click="loadData(1)">Filter</button>
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-4">
      <article v-for="card in cards" :key="card.label" :class="[cardClass, toneClass(card.tone)]">
        <p class="text-sm font-semibold tracking-wide">{{ card.label }}</p>
        <h3 class="my-2 break-words text-2xl font-bold leading-tight md:text-3xl">{{ card.value }}</h3>
      </article>
    </div>

    <h3 class="mb-3 mt-8 text-2xl font-bold text-zinc-800 md:text-3xl">Staff Directory</h3>
    <div class="grid gap-3 md:hidden">
      <article v-if="!staffDirectory.length" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 text-center text-[#7a7467]">
        No users yet. Add your first user.
      </article>
      <article v-for="user in staffDirectory" :key="`mobile-${user.id || user.email}`" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="font-bold text-zinc-800">{{ user.name }}</h4>
            <p class="text-sm text-[#7a7467] break-all">{{ user.email }}</p>
          </div>
          <span class="inline-block rounded-full bg-farm-green px-2 py-1 text-xs font-bold text-white">{{ user.role }}</span>
        </div>
        <div class="mt-2 grid gap-1 text-sm text-zinc-700">
          <p><span class="font-semibold">Phone:</span> {{ user.phone || '-' }}</p>
          <p><span class="font-semibold">Status:</span> {{ user.status }}</p>
        </div>
        <div v-if="canManageUsers" class="mt-3 flex flex-wrap gap-2">
          <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditModal(user)">Edit</button>
          <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="deleteUser(user)">Delete</button>
        </div>
      </article>
    </div>

    <div class="hidden overflow-x-auto rounded-lg border border-[#ddd8ce] bg-farm-panel shadow-sm md:block">
      <table class="w-full min-w-[980px] border-collapse">
        <thead class="bg-farm-green text-white">
          <tr>
            <th class="px-4 py-3 text-left text-sm">Name</th>
            <th class="px-4 py-3 text-left text-sm">Email</th>
            <th class="px-4 py-3 text-left text-sm">Role</th>
            <th class="px-4 py-3 text-left text-sm">Phone</th>
            <th class="px-4 py-3 text-left text-sm">Status</th>
            <th v-if="canManageUsers" class="px-4 py-3 text-right text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!staffDirectory.length">
            <td :colspan="canManageUsers ? 6 : 5" class="px-4 py-8 text-center text-[#7a7467]">No users yet. Add your first user.</td>
          </tr>
          <tr v-for="user in staffDirectory" :key="user.id || user.email" class="border-t border-[#ddd8ce]">
            <td class="px-4 py-3 font-semibold">{{ user.name }}</td>
            <td class="px-4 py-3">{{ user.email }}</td>
            <td class="px-4 py-3">
              <span class="inline-block rounded-full bg-farm-green px-3 py-1 text-xs font-bold text-white">{{ user.role }}</span>
            </td>
            <td class="px-4 py-3">{{ user.phone || '-' }}</td>
            <td class="px-4 py-3">
              <span class="inline-block rounded-full bg-farm-green px-3 py-1 text-xs font-bold lowercase text-white">{{ user.status }}</span>
            </td>
            <td v-if="canManageUsers" class="px-4 py-3 text-right">
              <div class="inline-flex flex-wrap justify-end gap-2">
                <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditModal(user)">Edit</button>
                <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="deleteUser(user)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-3 flex flex-wrap items-center justify-end gap-2">
      <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm disabled:opacity-40" :disabled="page <= 1" @click="loadData(page - 1)">Prev</button>
      <span class="text-sm text-[#6f6758]">Page {{ page }} / {{ totalPages }}</span>
      <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm disabled:opacity-40" :disabled="page >= totalPages" @click="loadData(page + 1)">Next</button>
    </div>

    <BaseModal v-if="canManageUsers" :open="modalOpen" :title="modalMode === 'create' ? 'Add User' : 'Edit User'" @close="closeModal">
      <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submitModal">
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Full Name</label>
          <input v-model.trim="form.name" required placeholder="John Doe" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Email</label>
          <input v-model.trim="form.email" type="email" required placeholder="john@example.com" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Role</label>
          <select v-model="form.role" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3">
            <option value="worker">worker</option>
            <option value="manager">manager</option>
            <option value="veterinarian">veterinarian</option>
            <option value="owner">owner</option>
          </select>
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Phone</label>
          <input v-model.trim="form.phone" placeholder="+1 ..." class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Status</label>
          <select v-model="form.status" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">{{ modalMode === 'create' ? 'Password' : 'New Password (optional)' }}</label>
          <input v-model="form.password" :required="modalMode === 'create'" :type="showPassword ? 'text' : 'password'" minlength="6" :placeholder="modalMode === 'create' ? 'At least 6 characters' : 'Leave blank to keep current'" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Password Visibility</label>
          <label class="inline-flex items-center gap-2 rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3 text-sm text-zinc-700">
            <input v-model="showPassword" type="checkbox" class="h-4 w-4" />
            Show password
          </label>
        </div>
        <div class="md:col-span-2 space-y-3">
          <ul v-if="fieldErrors.length" class="rounded-lg border border-farm-red/30 bg-[#fff4f3] p-3">
            <li v-for="issue in fieldErrors" :key="issue" class="ml-5 list-disc text-sm font-semibold text-farm-red">{{ issue }}</li>
          </ul>
          <p v-if="error" class="font-semibold text-farm-red">{{ error }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-5 py-3 font-semibold text-zinc-800" :disabled="saving" @click="closeModal">Cancel</button>
            <button type="submit" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" :disabled="saving">
              {{ saving ? 'Saving...' : (modalMode === 'create' ? 'Create User' : 'Save Changes') }}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
    <ConfirmModal :open="confirmOpen" title="Delete User" :message="`Delete user ${pendingDelete?.name || ''}?`" confirm-text="Delete" @cancel="confirmOpen = false" @confirm="confirmDeleteUser" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseModal from '../components/BaseModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { apiDelete, apiGet, apiPost, apiPut } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { canManageUsers as canManageUsersByRole } from '../utils/rbac'

const auth = useAuthStore()
const stats = ref({ totalStaff: 0, activeUsers: 0, managers: 0, veterinarians: 0 })
const staffDirectory = ref([])
const modalOpen = ref(false)
const modalMode = ref('create')
const confirmOpen = ref(false)
const pendingDelete = ref(null)
const saving = ref(false)
const error = ref('')
const fieldErrors = ref([])
const showPassword = ref(false)
const selectedId = ref(null)
const query = ref('')
const page = ref(1)
const totalCount = ref(0)
const pageSize = ref(10)
const form = ref({
  name: '',
  email: '',
  role: 'worker',
  phone: '',
  password: '',
  status: 'active'
})

const cardClass =
  'rounded-lg p-4 md:p-5 shadow-[0_4px_0_rgba(0,0,0,0.12)] overflow-hidden bg-[length:20px_20px] bg-[linear-gradient(135deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,transparent_75%,transparent)]'

const toneClass = (tone) => ({
  green: 'bg-farm-green text-white',
  gold: 'bg-farm-gold text-zinc-800',
  orange: 'bg-farm-orange text-white',
  red: 'bg-farm-red text-white'
}[tone] || 'bg-farm-green text-white')

const cards = computed(() => [
  { label: 'Total Staff', value: stats.value.totalStaff, tone: 'green' },
  { label: 'Active Users', value: stats.value.activeUsers, tone: 'gold' },
  { label: 'Managers', value: stats.value.managers, tone: 'orange' },
  { label: 'Veterinarians', value: stats.value.veterinarians, tone: 'red' }
])
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const canManageUsers = computed(() => canManageUsersByRole(auth.role || auth.user?.role || ''))

async function loadData(nextPage = page.value) {
  const [s, users] = await Promise.all([
    apiGet('/api/users/stats'),
    apiGet(`/api/users?q=${encodeURIComponent(query.value || '')}&page=${nextPage}&pageSize=${pageSize.value}`)
  ])
  stats.value = s
  const list = Array.isArray(users) ? users : (users.items || [])
  const count = Number(users.total || list.length)
  const resolvedPage = Number(users.page || nextPage)
  const maxPage = Math.max(1, Math.ceil(count / pageSize.value))
  if (resolvedPage > maxPage && resolvedPage !== 1) {
    await loadData(maxPage)
    return
  }
  staffDirectory.value = list
  totalCount.value = count
  page.value = resolvedPage
}

async function createUser() {
  const payload = { ...form.value }
  payload.phone = normalizeKEPhone(payload.phone)
  await apiPost('/api/users', payload)
}

async function updateUser() {
  const payload = { ...form.value }
  payload.phone = normalizeKEPhone(payload.phone)
  if (!payload.password) delete payload.password
  await apiPut(`/api/users/${selectedId.value}`, payload)
}

function resetForm() {
  form.value = { name: '', email: '', role: 'worker', phone: '', password: '', status: 'active' }
  showPassword.value = false
  fieldErrors.value = []
}

function openCreateModal() {
  resetForm()
  selectedId.value = null
  error.value = ''
  modalMode.value = 'create'
  modalOpen.value = true
}

function openEditModal(user) {
  selectedId.value = user.id
  error.value = ''
  modalMode.value = 'edit'
  form.value = {
    name: user.name,
    email: user.email,
    role: String(user.role || '').toLowerCase(),
    phone: user.phone,
    password: '',
    status: user.status
  }
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  showPassword.value = false
  error.value = ''
  fieldErrors.value = []
}

function validateForm() {
  const issues = []
  if (!form.value.name.trim()) issues.push('Name is required.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) issues.push('Valid email is required.')
  if (String(form.value.phone || '').trim() && !isValidKEPhone(form.value.phone)) issues.push('Phone must be a valid Kenya number (e.g. +2547XXXXXXXX).')
  if (!['owner', 'manager', 'worker', 'veterinarian'].includes(form.value.role)) issues.push('Invalid role.')
  if (!['active', 'inactive'].includes(form.value.status)) issues.push('Invalid status.')
  if (modalMode.value === 'create' && String(form.value.password || '').length < 6) issues.push('Password must be at least 6 characters.')
  if (modalMode.value === 'edit' && form.value.password && String(form.value.password).length < 6) issues.push('New password must be at least 6 characters.')
  fieldErrors.value = issues
  return issues.length === 0
}

async function submitModal() {
  if (!validateForm()) return
  error.value = ''
  saving.value = true
  try {
    if (modalMode.value === 'create') await createUser()
    else await updateUser()
    await loadData()
    closeModal()
  } catch (err) {
    error.value = err.message || 'Failed to save user'
  } finally {
    saving.value = false
  }
}

async function deleteUser(user) {
  pendingDelete.value = user
  confirmOpen.value = true
}

async function confirmDeleteUser() {
  if (!pendingDelete.value) return
  try {
    await apiDelete(`/api/users/${pendingDelete.value.id}`)
    confirmOpen.value = false
    pendingDelete.value = null
    await loadData()
  } catch (err) {
    error.value = err.message || 'Failed to delete user'
  }
}

onMounted(() => loadData(1))

function isValidKEPhone(v) {
  const cleaned = String(v || '').replace(/\s+/g, '')
  if (!cleaned) return true
  return /^(?:\+254|254|0)(7\d{8}|1\d{8})$/.test(cleaned)
}

function normalizeKEPhone(v) {
  const cleaned = String(v || '').replace(/\s+/g, '')
  if (!cleaned) return ''
  if (cleaned.startsWith('0')) return `+254${cleaned.slice(1)}`
  if (cleaned.startsWith('254')) return `+${cleaned}`
  return cleaned
}
</script>
