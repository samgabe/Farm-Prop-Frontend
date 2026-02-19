<template>
  <section class="min-w-0">
    <header class="flex flex-col justify-between gap-3 md:flex-row md:items-start">
      <div>
        <h2 class="text-2xl font-bold text-zinc-800 md:text-3xl">Health Management</h2>
        <p class="mt-2 text-base text-[#7a7467]">Track vaccinations and health records</p>
      </div>
      <button v-if="canWrite" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" @click="openCreateModal">
        + Add Record
      </button>
    </header>

    <h3 class="mb-3 mt-8 text-2xl font-bold text-zinc-800 md:text-3xl">Upcoming Vaccinations</h3>
    <div class="grid gap-3 rounded-lg border border-[#ddd8ce] bg-farm-panel p-3 shadow-sm">
      <article class="flex flex-col gap-2 border-l-4 border-farm-gold bg-[#f4f1eb] p-4 sm:flex-row sm:items-start sm:justify-between" v-for="item in upcomingVaccinations" :key="item.id + item.treatment">
        <div>
          <strong>
            <component :is="animalIcon(item.animal)" class="mr-1 inline-block h-[18px] w-[18px] align-[-3px]" />
            {{ item.id }} - {{ item.animal }}
          </strong>
          <p class="mt-1">{{ item.treatment }}</p>
        </div>
        <div class="sm:text-right">
          <strong>{{ item.dueDate }}</strong>
          <small class="block">{{ item.remaining }}</small>
        </div>
      </article>
    </div>

    <h3 class="mb-3 mt-8 text-2xl font-bold text-zinc-800 md:text-3xl">Health Records</h3>
    <div class="grid gap-3 md:hidden">
      <article v-if="!healthRecords.length" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 text-center text-[#7a7467]">
        No health records yet.
      </article>
      <article v-for="r in healthRecords" :key="`mobile-${r.id}-${r.date}`" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm text-[#7a7467]">{{ r.date }}</p>
            <h4 class="font-bold text-zinc-800">{{ r.animalId }}</h4>
          </div>
          <span class="inline-block rounded-full bg-farm-gold px-3 py-1 text-xs font-bold">{{ r.nextDue }}</span>
        </div>
        <div class="mt-2 grid gap-1 text-sm text-zinc-700">
          <p><span class="font-semibold">Action:</span> {{ r.action }}</p>
          <p><span class="font-semibold">Treatment:</span> {{ r.treatment }}</p>
          <p><span class="font-semibold">Vet:</span> {{ r.vet }}</p>
        </div>
        <div v-if="canWrite" class="mt-3 flex flex-wrap gap-2">
          <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditModal(r)">Edit</button>
          <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="deleteRecord(r)">Delete</button>
        </div>
      </article>
    </div>

    <div class="hidden overflow-x-auto rounded-lg border border-[#ddd8ce] bg-farm-panel shadow-sm md:block">
      <table class="w-full min-w-[1040px] border-collapse">
        <thead class="bg-farm-green text-white">
          <tr>
            <th class="px-4 py-3 text-left text-sm">Animal ID</th>
            <th class="px-4 py-3 text-left text-sm">Action</th>
            <th class="px-4 py-3 text-left text-sm">Vaccine/Treatment</th>
            <th class="px-4 py-3 text-left text-sm">Date</th>
            <th class="px-4 py-3 text-left text-sm">Veterinarian</th>
            <th class="px-4 py-3 text-left text-sm">Next Due</th>
            <th v-if="canWrite" class="px-4 py-3 text-right text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!healthRecords.length">
            <td :colspan="canWrite ? 7 : 6" class="px-4 py-8 text-center text-[#7a7467]">No health records yet.</td>
          </tr>
          <tr v-for="r in healthRecords" :key="r.id + r.date" class="border-t border-[#ddd8ce]">
            <td class="px-4 py-3">{{ r.animalId }}</td>
            <td class="px-4 py-3 font-bold">{{ r.action }}</td>
            <td class="px-4 py-3">{{ r.treatment }}</td>
            <td class="px-4 py-3">{{ r.date }}</td>
            <td class="px-4 py-3">{{ r.vet }}</td>
            <td class="px-4 py-3"><span class="inline-block rounded-full bg-farm-gold px-3 py-1 text-xs font-bold">{{ r.nextDue }}</span></td>
            <td v-if="canWrite" class="px-4 py-3 text-right">
              <div class="inline-flex flex-wrap justify-end gap-2">
                <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditModal(r)">Edit</button>
                <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="deleteRecord(r)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :open="modalOpen" :title="modalMode === 'create' ? 'Add Health Record' : 'Edit Health Record'" @close="closeModal">
      <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submitModal">
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Animal Tag</label>
          <div class="relative">
            <input
              :value="tagQuery"
              required
              placeholder="Search tag (e.g. A049)"
              class="w-full rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3"
              @input="onTagQueryInput($event.target.value)"
              @focus="tagDropdownOpen = true"
              @blur="closeTagDropdown"
            />
            <div v-if="tagDropdownOpen && filteredAnimalTags.length" class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[#cec7b8] bg-white shadow">
              <button
                v-for="tag in filteredAnimalTags"
                :key="tag"
                type="button"
                class="block w-full px-3 py-2 text-left text-sm hover:bg-[#f1eee6]"
                @mousedown.prevent="selectAnimalTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Action</label>
          <input v-model.trim="form.action" required placeholder="Vaccination" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Treatment</label>
          <input v-model.trim="form.treatment" required placeholder="Deworming" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Record Date</label>
          <input v-model="form.recordDate" type="date" required class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Veterinarian</label>
          <input v-model.trim="form.veterinarian" required placeholder="Dr. Smith" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Next Due Date</label>
          <input v-model="form.nextDue" type="date" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="md:col-span-2 space-y-3">
          <ul v-if="fieldErrors.length" class="rounded-lg border border-farm-red/30 bg-[#fff4f3] p-3">
            <li v-for="issue in fieldErrors" :key="issue" class="ml-5 list-disc text-sm font-semibold text-farm-red">{{ issue }}</li>
          </ul>
          <p v-if="error" class="font-semibold text-farm-red">{{ error }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-5 py-3 font-semibold text-zinc-800" :disabled="saving" @click="closeModal">Cancel</button>
            <button type="submit" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" :disabled="saving">
              {{ saving ? 'Saving...' : (modalMode === 'create' ? 'Create Record' : 'Save Changes') }}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
    <ConfirmModal :open="confirmOpen" title="Delete Health Record" :message="`Delete health record for ${pendingDelete?.animalId || ''}?`" confirm-text="Delete" @cancel="confirmOpen = false" @confirm="confirmDeleteRecord" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseModal from '../components/BaseModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { apiDelete, apiGet, apiPost, apiPut } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { animalIcon } from '../utils/icons'
import { hasActionAccess } from '../utils/rbac'

const auth = useAuthStore()
const upcomingVaccinations = ref([])
const healthRecords = ref([])
const animalTags = ref([])
const tagQuery = ref('')
const tagDropdownOpen = ref(false)
const modalOpen = ref(false)
const modalMode = ref('create')
const selectedId = ref(null)
const confirmOpen = ref(false)
const pendingDelete = ref(null)
const saving = ref(false)
const error = ref('')
const fieldErrors = ref([])
const form = ref({
  animalTagId: '',
  action: '',
  treatment: '',
  recordDate: '',
  veterinarian: '',
  nextDue: ''
})
const canWrite = computed(() => hasActionAccess(auth.role || auth.user?.role || '', 'health.write'))
const filteredAnimalTags = computed(() => {
  const q = String(tagQuery.value || '').trim().toUpperCase()
  const pool = q ? animalTags.value.filter((tag) => tag.includes(q)) : animalTags.value
  return pool.slice(0, 10)
})

async function loadData() {
  const [upcoming, records, animals] = await Promise.all([
    apiGet('/api/health/upcoming'),
    apiGet('/api/health/records'),
    apiGet('/api/animals?page=1&pageSize=200')
  ])
  upcomingVaccinations.value = upcoming
  healthRecords.value = records
  const items = Array.isArray(animals) ? animals : (animals.items || [])
  animalTags.value = items.filter((a) => String(a.status || '').toLowerCase() === 'active').map((a) => a.tagId).filter(Boolean)
}

async function createRecord() {
  await apiPost('/api/health/records', form.value)
}

async function updateRecord() {
  await apiPut(`/api/health/records/${selectedId.value}`, form.value)
}

function dateForInput(v) {
  if (!v || v === 'N/A') return ''
  const parts = String(v).split('/')
  if (parts.length !== 3) return ''
  const [d, m, y] = parts
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function resetForm() {
  form.value = { animalTagId: '', action: '', treatment: '', recordDate: '', veterinarian: '', nextDue: '' }
  tagQuery.value = ''
  tagDropdownOpen.value = false
  fieldErrors.value = []
}

function openCreateModal() {
  if (!canWrite.value) return
  resetForm()
  selectedId.value = null
  modalMode.value = 'create'
  error.value = ''
  modalOpen.value = true
}

function openEditModal(record) {
  if (!canWrite.value) return
  selectedId.value = record.id
  modalMode.value = 'edit'
  error.value = ''
  form.value = {
    animalTagId: record.animalId,
    action: record.action,
    treatment: record.treatment,
    recordDate: dateForInput(record.date),
    veterinarian: record.vet,
    nextDue: dateForInput(record.nextDue)
  }
  tagQuery.value = record.animalId
  tagDropdownOpen.value = false
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  tagDropdownOpen.value = false
  error.value = ''
  fieldErrors.value = []
}

function onTagQueryInput(v) {
  const normalized = String(v || '').toUpperCase().replace(/[^A-Z0-9-]/g, '')
  tagQuery.value = normalized
  form.value.animalTagId = normalized
  tagDropdownOpen.value = true
}

function selectAnimalTag(tag) {
  tagQuery.value = tag
  form.value.animalTagId = tag
  tagDropdownOpen.value = false
}

function closeTagDropdown() {
  setTimeout(() => {
    tagDropdownOpen.value = false
  }, 120)
}

function validateForm() {
  const issues = []
  const tag = String(form.value.animalTagId || '').trim().toUpperCase()
  if (!tag) issues.push('Animal tag is required.')
  if (tag && !/^[A-Z0-9-]{2,24}$/.test(tag)) issues.push('Animal tag must be 2-24 chars (A-Z, 0-9, hyphen).')
  if (!String(form.value.action || '').trim()) issues.push('Action is required.')
  if (!String(form.value.treatment || '').trim()) issues.push('Treatment is required.')
  if (!String(form.value.recordDate || '').trim()) issues.push('Record date is required.')
  if (!String(form.value.veterinarian || '').trim()) issues.push('Veterinarian is required.')
  fieldErrors.value = issues
  return issues.length === 0
}

async function submitModal() {
  if (!canWrite.value) return
  if (!validateForm()) return
  error.value = ''
  saving.value = true
  try {
    form.value.animalTagId = String(form.value.animalTagId || '').trim().toUpperCase()
    if (modalMode.value === 'create') await createRecord()
    else await updateRecord()
    await loadData()
    closeModal()
  } catch (err) {
    error.value = err.message || 'Failed to save record'
  } finally {
    saving.value = false
  }
}

async function deleteRecord(record) {
  if (!canWrite.value) return
  pendingDelete.value = record
  confirmOpen.value = true
}

async function confirmDeleteRecord() {
  if (!pendingDelete.value) return
  try {
    await apiDelete(`/api/health/records/${pendingDelete.value.id}`)
    confirmOpen.value = false
    pendingDelete.value = null
    await loadData()
  } catch (err) {
    error.value = err.message || 'Failed to delete record'
  }
}

onMounted(loadData)
</script>
