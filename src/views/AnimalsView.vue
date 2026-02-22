<template>
  <section class="min-w-0">
    <header class="flex flex-col justify-between gap-3 md:flex-row md:items-start">
      <div>
        <h2 class="text-2xl font-bold text-zinc-800 md:text-3xl">Animal Management</h2>
        <p class="mt-2 text-base text-[#7a7467]">Manage and track all livestock</p>
      </div>
      <button v-if="canWrite" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" @click="openCreateModal">
        + Add Animal
      </button>
    </header>

    <div class="my-4 grid gap-3 md:grid-cols-[1fr_120px]">
      <input v-model="query" type="text" placeholder="Search by ID, type, or breed..." class="w-full rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" @keyup.enter="loadAnimals(1)" />
      <button class="rounded-lg border border-[#d1cbc0] bg-[#f2f0ea] px-4 py-3 text-zinc-800" @click="loadAnimals(1)">Filter</button>
    </div>
    <div class="mt-3 flex flex-wrap items-center justify-end gap-2">
      <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm disabled:opacity-40" :disabled="page <= 1" @click="loadAnimals(page - 1)">Prev</button>
      <span class="text-sm text-[#6f6758]">Page {{ page }} / {{ totalPages }}</span>
      <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm disabled:opacity-40" :disabled="page >= totalPages" @click="loadAnimals(page + 1)">Next</button>
    </div>

    <div class="grid gap-3 md:hidden">
      <article v-if="!filtered.length" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 text-center text-[#7a7467]">
        No animals found. Use Add Animal to create your first record.
      </article>
      <article v-for="a in filtered" :key="`mobile-${a.tagId}`" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="inline-block rounded-md bg-farm-gold px-2 py-1 text-xs font-bold text-zinc-800">{{ a.tagId }}</span>
            <h4 class="mt-2 font-bold text-zinc-800">{{ a.type }} - {{ a.breed }}</h4>
          </div>
          <span class="rounded border border-farm-green px-2 py-0.5 text-xs font-semibold">{{ a.status }}</span>
        </div>
        <div class="mt-2 grid gap-1 text-sm text-zinc-700">
          <p><span class="font-semibold">Age:</span> {{ a.age }}</p>
          <p><span class="font-semibold">Weight:</span> {{ a.weight }}</p>
          <p><span class="font-semibold">Health:</span> {{ a.health }}</p>
        </div>
        <div v-if="canWrite" class="mt-3 flex flex-wrap gap-2">
          <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditModal(a)">Edit</button>
          <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="deleteAnimal(a)">Delete</button>
        </div>
      </article>
    </div>

    <div class="hidden overflow-x-auto rounded-lg border border-[#ddd8ce] bg-farm-panel shadow-sm md:block">
      <table class="w-full min-w-[980px] border-collapse">
        <thead class="bg-farm-green text-white">
          <tr>
            <th class="px-4 py-3 text-left text-sm">Tag ID</th>
            <th class="px-4 py-3 text-left text-sm">Type</th>
            <th class="px-4 py-3 text-left text-sm">Breed</th>
            <th class="px-4 py-3 text-left text-sm">Age</th>
            <th class="px-4 py-3 text-left text-sm">Weight</th>
            <th class="px-4 py-3 text-left text-sm">Health</th>
            <th class="px-4 py-3 text-left text-sm">Status</th>
            <th v-if="canWrite" class="px-4 py-3 text-right text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filtered.length">
            <td :colspan="canWrite ? 8 : 7" class="px-4 py-8 text-center text-[#7a7467]">No animals found. Use Add Animal to create your first record.</td>
          </tr>
          <tr v-for="a in filtered" :key="a.tagId" class="border-t border-[#ddd8ce]">
            <td class="px-4 py-3"><span class="rounded-md bg-farm-gold px-3 py-2 font-bold text-zinc-800">{{ a.tagId }}</span></td>
            <td class="px-4 py-3">
              <component :is="animalIcon(a.type)" class="mr-1 inline-block h-[18px] w-[18px] align-[-3px]" />
              {{ a.type }}
            </td>
            <td class="px-4 py-3">{{ a.breed }}</td>
            <td class="px-4 py-3">{{ a.age }}</td>
            <td class="px-4 py-3 font-bold">{{ a.weight }}</td>
            <td class="px-4 py-3">
              <span :class="['inline-block rounded-full px-3 py-1 text-xs font-bold lowercase', a.health === 'healthy' ? 'bg-farm-green text-white' : 'bg-farm-gold text-zinc-800']">{{ a.health }}</span>
            </td>
            <td class="px-4 py-3"><span class="rounded border-2 border-farm-green px-2 py-0.5 text-xs font-semibold">{{ a.status }}</span></td>
            <td v-if="canWrite" class="px-4 py-3 text-right">
              <div class="inline-flex gap-2">
                <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditModal(a)">Edit</button>
                <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="deleteAnimal(a)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :open="modalOpen" :title="modalMode === 'create' ? 'Add Animal' : 'Edit Animal'" @close="closeModal">
      <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submitModal">
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Tag ID</label>
          <input
            v-model.trim="form.tagId"
            :disabled="modalMode === 'edit'"
            required
            :placeholder="tagPlaceholder"
            class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3 disabled:bg-[#e9e4d9]"
          />
          <p v-if="expectedPrefix" class="text-xs text-[#7a7467]">Expected prefix: {{ expectedPrefix }}</p>
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Type</label>
          <input v-model.trim="form.type" required placeholder="Cattle" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Breed</label>
          <input v-model.trim="form.breed" required placeholder="Holstein" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Birth Date</label>
          <input v-model="form.birthDate" type="date" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Weight (kg)</label>
          <input v-model.number="form.weightKg" type="number" step="0.01" min="0" placeholder="0.00" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Health Status</label>
          <select v-model="form.healthStatus" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3">
            <option value="healthy">healthy</option>
            <option value="attention">attention</option>
            <option value="sick">sick</option>
          </select>
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Status</label>
          <select v-model="form.status" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="sold">sold</option>
          </select>
        </div>
        <div class="md:col-span-2 space-y-3">
          <ul v-if="fieldErrors.length" class="rounded-lg border border-farm-red/30 bg-[#fff4f3] p-3">
            <li v-for="issue in fieldErrors" :key="issue" class="ml-5 list-disc text-sm font-semibold text-farm-red">{{ issue }}</li>
          </ul>
          <p v-if="error" class="font-semibold text-farm-red">{{ error }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-5 py-3 font-semibold text-zinc-800" :disabled="saving" @click="closeModal">Cancel</button>
            <button type="submit" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" :disabled="saving">
              {{ saving ? 'Saving...' : (modalMode === 'create' ? 'Create Animal' : 'Save Changes') }}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
    <ConfirmModal :open="confirmOpen" title="Delete Animal" :message="`Delete animal ${pendingDelete?.tagId || ''}?`" confirm-text="Delete" @cancel="confirmOpen = false" @confirm="confirmDeleteAnimal" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import BaseModal from '../components/BaseModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { apiDelete, apiGet, apiPost, apiPut } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { animalIcon } from '../utils/icons'
import { hasActionAccess } from '../utils/rbac'
import { getTagPrefixForType } from '../utils/species'

const auth = useAuthStore()
const query = ref('')
const animals = ref([])
const modalOpen = ref(false)
const modalMode = ref('create')
const confirmOpen = ref(false)
const pendingDelete = ref(null)
const saving = ref(false)
const error = ref('')
const fieldErrors = ref([])
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const form = ref({
  tagId: '',
  type: '',
  breed: '',
  birthDate: '',
  weightKg: null,
  healthStatus: 'healthy',
  status: 'active'
})

const filtered = computed(() => animals.value)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const canWrite = computed(() => hasActionAccess(auth.role || auth.user?.role || '', 'animals.write'))
const expectedPrefix = computed(() => getTagPrefixForType(form.value.type))
const tagPlaceholder = computed(() => (expectedPrefix.value ? `${expectedPrefix.value}001` : 'A050'))

watch(
  () => form.value.type,
  (next) => {
    if (modalMode.value !== 'create') return
    const prefix = getTagPrefixForType(next)
    if (!prefix) return
    const current = String(form.value.tagId || '').trim().toUpperCase()
    if (!current || !current.startsWith(prefix)) {
      form.value.tagId = prefix
    }
  }
)

async function loadAnimals(nextPage = page.value) {
  const res = await apiGet(`/api/animals?q=${encodeURIComponent(query.value || '')}&page=${nextPage}&pageSize=${pageSize.value}`)
  const list = Array.isArray(res) ? res : (res.items || [])
  const count = Number(res.total || list.length)
  const resolvedPage = Number(res.page || nextPage)
  const maxPage = Math.max(1, Math.ceil(count / pageSize.value))
  if (resolvedPage > maxPage && resolvedPage !== 1) {
    await loadAnimals(maxPage)
    return
  }
  animals.value = list
  total.value = count
  page.value = resolvedPage
}

async function createAnimal() {
  await apiPost('/api/animals', form.value)
}

async function updateAnimal() {
  await apiPut(`/api/animals/${encodeURIComponent(form.value.tagId)}`, form.value)
}

function resetForm() {
  form.value = { tagId: '', type: '', breed: '', birthDate: '', weightKg: null, healthStatus: 'healthy', status: 'active' }
  fieldErrors.value = []
}

function openCreateModal() {
  if (!canWrite.value) return
  resetForm()
  error.value = ''
  modalMode.value = 'create'
  modalOpen.value = true
}

function openEditModal(animal) {
  if (!canWrite.value) return
  error.value = ''
  fieldErrors.value = []
  modalMode.value = 'edit'
  const weight = Number.parseFloat(String(animal.weight).replace(/[^\d.]/g, ''))
  form.value = {
    tagId: animal.tagId,
    type: animal.type,
    breed: animal.breed,
    birthDate: String(animal.birthDate || ''),
    weightKg: Number.isNaN(weight) ? null : weight,
    healthStatus: animal.health || 'healthy',
    status: animal.status || 'active'
  }
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  error.value = ''
  fieldErrors.value = []
}

function validateForm() {
  const issues = []
  const tag = String(form.value.tagId || '').trim().toUpperCase()
  const birthDate = String(form.value.birthDate || '').trim()
  const today = new Date().toISOString().slice(0, 10)
  if (!tag) issues.push('Tag ID is required.')
  if (tag && !/^[A-Z0-9-]{2,24}$/.test(tag)) issues.push('Tag ID must be 2-24 chars (A-Z, 0-9, hyphen).')
  if (expectedPrefix.value && !tag.startsWith(expectedPrefix.value)) {
    issues.push(`Tag ID must start with ${expectedPrefix.value}.`)
  }
  if (!String(form.value.type || '').trim()) issues.push('Type is required.')
  if (!String(form.value.breed || '').trim()) issues.push('Breed is required.')
  if (form.value.weightKg !== null && Number(form.value.weightKg) < 0) issues.push('Weight cannot be negative.')
  if (birthDate && birthDate > today) issues.push('Birth date cannot be in the future.')
  fieldErrors.value = issues
  return issues.length === 0
}

async function submitModal() {
  if (!canWrite.value) return
  if (!validateForm()) return
  error.value = ''
  saving.value = true
  try {
    form.value.tagId = String(form.value.tagId || '').trim().toUpperCase()
    if (modalMode.value === 'create') await createAnimal()
    else await updateAnimal()
    await loadAnimals()
    closeModal()
  } catch (err) {
    error.value = err.message || 'Failed to save animal'
  } finally {
    saving.value = false
  }
}

async function deleteAnimal(animal) {
  if (!canWrite.value) return
  pendingDelete.value = animal
  confirmOpen.value = true
}

async function confirmDeleteAnimal() {
  if (!pendingDelete.value) return
  try {
    await apiDelete(`/api/animals/${encodeURIComponent(pendingDelete.value.tagId)}`)
    confirmOpen.value = false
    pendingDelete.value = null
    await loadAnimals()
  } catch (err) {
    error.value = err.message || 'Failed to delete animal'
  }
}

onMounted(() => loadAnimals(1))
</script>
