<template>
  <section class="min-w-0">
    <header class="flex flex-col justify-between gap-3 md:flex-row md:items-start">
      <div>
        <h2 class="text-2xl font-bold text-zinc-800 md:text-3xl">Breeding Management</h2>
        <p class="mt-2 text-base text-[#7a7467]">Track breeding cycles and births</p>
      </div>
      <button v-if="canWrite" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" @click="openCreateModal">
        + Add Breeding Record
      </button>
    </header>

    <h3 class="mb-3 mt-8 text-2xl font-bold text-zinc-800 md:text-3xl">Active Breeding Records</h3>
    <div class="grid gap-3 rounded-lg border border-[#ddd8ce] bg-farm-panel p-3 shadow-sm">
      <p v-if="!breedingRecords.length" class="p-6 text-center text-[#7a7467]">No active breeding records yet.</p>
      <article class="border-l-4 border-farm-green bg-[#f4f1eb] p-3" v-for="record in breedingRecords" :key="record.id">
        <p class="font-bold">
          <component :is="animalIcon(record.animal)" class="mr-1 inline-block h-[18px] w-[18px] align-[-3px]" />
          Mother: {{ record.mother }} | Father: {{ record.father }} ({{ record.animal }})
        </p>
        <div class="mt-2 flex flex-wrap gap-5 text-sm">
          <span>Breed Date: <strong>{{ record.breedDate }}</strong></span>
          <span>Expected Date: <strong>{{ record.expected }}</strong></span>
          <span>Days Remaining: <strong>{{ record.days }}</strong></span>
        </div>
        <div class="mt-3 h-3 rounded-full bg-[#ddd5c6]"><div class="h-full rounded-full bg-farm-green" :style="`width: ${record.progress}%`" /></div>
        <div v-if="canWrite" class="mt-3 inline-flex gap-2">
          <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditModal(record)">Edit</button>
          <button class="rounded-md border border-farm-green px-3 py-1 text-sm text-farm-green" @click="openBirthModal(record)">Record Birth</button>
          <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="deleteRecord(record)">Delete</button>
        </div>
      </article>
    </div>

    <h3 class="mb-3 mt-8 text-2xl font-bold text-zinc-800 md:text-3xl">Recent Births</h3>
    <div class="grid gap-3 md:hidden">
      <article v-if="!recentBirths.length" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 text-center text-[#7a7467]">
        No births recorded yet.
      </article>
      <article v-for="row in recentBirths" :key="`mobile-${row.mother}-${row.date}`" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="font-bold text-zinc-800">{{ row.mother }}</h4>
            <p class="text-sm text-[#7a7467]">{{ row.date }}</p>
          </div>
          <span :class="['inline-block rounded-full px-3 py-1 text-xs font-bold lowercase', row.health === 'healthy' ? 'bg-farm-green text-white' : 'bg-farm-gold text-zinc-800']">{{ row.health }}</span>
        </div>
        <div class="mt-2 grid gap-1 text-sm text-zinc-700">
          <p><span class="font-semibold">Type:</span> {{ row.type }}</p>
          <p><span class="font-semibold">Offspring:</span> {{ row.offspring }}</p>
        </div>
      </article>
    </div>

    <div class="hidden overflow-x-auto rounded-lg border border-[#ddd8ce] bg-farm-panel shadow-sm md:block">
      <table class="w-full min-w-[860px] border-collapse">
        <thead class="bg-farm-green text-white">
          <tr>
            <th class="px-4 py-3 text-left text-sm">Mother ID</th>
            <th class="px-4 py-3 text-left text-sm">Type</th>
            <th class="px-4 py-3 text-left text-sm">Birth Date</th>
            <th class="px-4 py-3 text-left text-sm">Offspring</th>
            <th class="px-4 py-3 text-left text-sm">Health Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!recentBirths.length">
            <td colspan="5" class="px-4 py-8 text-center text-[#7a7467]">No births recorded yet.</td>
          </tr>
          <tr v-for="row in recentBirths" :key="row.mother + row.date" class="border-t border-[#ddd8ce]">
            <td class="px-4 py-3"><component :is="animalIcon(row.type)" class="mr-1 inline-block h-[18px] w-[18px] align-[-3px]" />{{ row.mother }}</td>
            <td class="px-4 py-3">{{ row.type }}</td>
            <td class="px-4 py-3">{{ row.date }}</td>
            <td class="px-4 py-3"><span class="inline-block rounded-full bg-farm-gold px-3 py-1 text-xs font-bold">{{ row.offspring }}</span></td>
            <td class="px-4 py-3"><span :class="['inline-block rounded-full px-3 py-1 text-xs font-bold lowercase', row.health === 'healthy' ? 'bg-farm-green text-white' : 'bg-farm-gold text-zinc-800']">{{ row.health }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :open="modalOpen" :title="modalMode === 'create' ? 'Add Breeding Record' : 'Edit Breeding Record'" @close="closeModal">
      <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submitModal">
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Mother Tag</label>
          <div class="relative">
            <input
              :value="motherTagQuery"
              required
              placeholder="Search mother tag"
              class="w-full rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3"
              @input="onMotherTagInput($event.target.value)"
              @focus="motherDropdownOpen = true"
              @blur="closeMotherDropdown"
            />
            <div v-if="motherDropdownOpen && filteredMotherTags.length" class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[#cec7b8] bg-white shadow">
              <button
                v-for="tag in filteredMotherTags"
                :key="`m-${tag}`"
                type="button"
                class="block w-full px-3 py-2 text-left text-sm hover:bg-[#f1eee6]"
                @mousedown.prevent="selectMotherTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Father Tag</label>
          <div class="relative">
            <input
              :value="fatherTagQuery"
              required
              placeholder="Search father tag"
              class="w-full rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3"
              @input="onFatherTagInput($event.target.value)"
              @focus="fatherDropdownOpen = true"
              @blur="closeFatherDropdown"
            />
            <div v-if="fatherDropdownOpen && filteredFatherTags.length" class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[#cec7b8] bg-white shadow">
              <button
                v-for="tag in filteredFatherTags"
                :key="`f-${tag}`"
                type="button"
                class="block w-full px-3 py-2 text-left text-sm hover:bg-[#f1eee6]"
                @mousedown.prevent="selectFatherTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Species</label>
          <input v-model.trim="form.species" required placeholder="Cattle" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Breeding Date</label>
          <input v-model="form.breedingDate" type="date" required class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Expected Birth Date</label>
          <input v-model="form.expectedBirthDate" type="date" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Notes</label>
          <input v-model.trim="form.notes" placeholder="Optional notes" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
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
    <BaseModal :open="birthModalOpen" title="Record Birth" @close="closeBirthModal">
      <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submitBirthModal">
        <div class="grid gap-1 md:col-span-2">
          <label class="text-sm font-semibold text-zinc-700">Record</label>
          <p class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3 text-sm text-zinc-700">
            {{ birthRecord?.mother }} / {{ birthRecord?.father }} ({{ birthRecord?.animal }})
          </p>
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Actual Birth Date</label>
          <input v-model="birthForm.actualBirthDate" type="date" required class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Offspring Count</label>
          <input v-model.number="birthForm.offspringCount" type="number" min="0" step="1" required class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="md:col-span-2 space-y-3">
          <p v-if="birthError" class="font-semibold text-farm-red">{{ birthError }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-5 py-3 font-semibold text-zinc-800" :disabled="birthSaving" @click="closeBirthModal">Cancel</button>
            <button type="submit" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" :disabled="birthSaving">
              {{ birthSaving ? 'Saving...' : 'Save Birth' }}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
    <ConfirmModal :open="confirmOpen" title="Delete Breeding Record" :message="`Delete breeding record ${pendingDelete?.mother || ''}/${pendingDelete?.father || ''}?`" confirm-text="Delete" @cancel="confirmOpen = false" @confirm="confirmDeleteRecord" />
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
const breedingRecords = ref([])
const recentBirths = ref([])
const animalTags = ref([])
const motherTagQuery = ref('')
const fatherTagQuery = ref('')
const motherDropdownOpen = ref(false)
const fatherDropdownOpen = ref(false)
const modalOpen = ref(false)
const modalMode = ref('create')
const selectedId = ref(null)
const confirmOpen = ref(false)
const pendingDelete = ref(null)
const birthModalOpen = ref(false)
const birthRecord = ref(null)
const birthSaving = ref(false)
const birthError = ref('')
const birthForm = ref({
  actualBirthDate: '',
  offspringCount: 1
})
const saving = ref(false)
const error = ref('')
const fieldErrors = ref([])
const form = ref({
  motherTagId: '',
  fatherTagId: '',
  species: '',
  breedingDate: '',
  expectedBirthDate: '',
  notes: ''
})
const canWrite = computed(() => hasActionAccess(auth.role || auth.user?.role || '', 'breeding.write'))
const filteredMotherTags = computed(() => {
  const q = String(motherTagQuery.value || '').trim().toUpperCase()
  const exclude = String(form.value.fatherTagId || '').trim().toUpperCase()
  const pool = animalTags.value.filter((tag) => tag !== exclude)
  return (q ? pool.filter((tag) => tag.includes(q)) : pool).slice(0, 10)
})
const filteredFatherTags = computed(() => {
  const q = String(fatherTagQuery.value || '').trim().toUpperCase()
  const exclude = String(form.value.motherTagId || '').trim().toUpperCase()
  const pool = animalTags.value.filter((tag) => tag !== exclude)
  return (q ? pool.filter((tag) => tag.includes(q)) : pool).slice(0, 10)
})

async function loadData() {
  const [active, births, animals] = await Promise.all([
    apiGet('/api/breeding/active'),
    apiGet('/api/breeding/births'),
    apiGet('/api/animals?page=1&pageSize=200')
  ])
  breedingRecords.value = active
  recentBirths.value = births
  const items = Array.isArray(animals) ? animals : (animals.items || [])
  animalTags.value = items.filter((a) => String(a.status || '').toLowerCase() === 'active').map((a) => a.tagId).filter(Boolean)
}

async function createRecord() {
  await apiPost('/api/breeding', form.value)
}

async function updateRecord() {
  await apiPut(`/api/breeding/${selectedId.value}`, form.value)
}

function dateForInput(v) {
  if (!v) return ''
  const parts = String(v).split('/')
  if (parts.length !== 3) return ''
  const [d, m, y] = parts
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function resetForm() {
  form.value = { motherTagId: '', fatherTagId: '', species: '', breedingDate: '', expectedBirthDate: '', notes: '' }
  motherTagQuery.value = ''
  fatherTagQuery.value = ''
  motherDropdownOpen.value = false
  fatherDropdownOpen.value = false
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
    motherTagId: record.mother,
    fatherTagId: record.father,
    species: record.animal,
    breedingDate: dateForInput(record.breedDate),
    expectedBirthDate: dateForInput(record.expected),
    notes: record.notes || ''
  }
  motherTagQuery.value = record.mother
  fatherTagQuery.value = record.father
  motherDropdownOpen.value = false
  fatherDropdownOpen.value = false
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  motherDropdownOpen.value = false
  fatherDropdownOpen.value = false
  error.value = ''
  fieldErrors.value = []
}

function onMotherTagInput(v) {
  const normalized = String(v || '').toUpperCase().replace(/[^A-Z0-9-]/g, '')
  motherTagQuery.value = normalized
  form.value.motherTagId = normalized
  motherDropdownOpen.value = true
}

function onFatherTagInput(v) {
  const normalized = String(v || '').toUpperCase().replace(/[^A-Z0-9-]/g, '')
  fatherTagQuery.value = normalized
  form.value.fatherTagId = normalized
  fatherDropdownOpen.value = true
}

function selectMotherTag(tag) {
  motherTagQuery.value = tag
  form.value.motherTagId = tag
  motherDropdownOpen.value = false
}

function selectFatherTag(tag) {
  fatherTagQuery.value = tag
  form.value.fatherTagId = tag
  fatherDropdownOpen.value = false
}

function closeMotherDropdown() {
  setTimeout(() => {
    motherDropdownOpen.value = false
  }, 120)
}

function closeFatherDropdown() {
  setTimeout(() => {
    fatherDropdownOpen.value = false
  }, 120)
}

function validateForm() {
  const issues = []
  const mother = String(form.value.motherTagId || '').trim().toUpperCase()
  const father = String(form.value.fatherTagId || '').trim().toUpperCase()
  if (!mother) issues.push('Mother tag is required.')
  if (!father) issues.push('Father tag is required.')
  if (mother && !/^[A-Z0-9-]{2,24}$/.test(mother)) issues.push('Mother tag must be 2-24 chars (A-Z, 0-9, hyphen).')
  if (father && !/^[A-Z0-9-]{2,24}$/.test(father)) issues.push('Father tag must be 2-24 chars (A-Z, 0-9, hyphen).')
  if (mother && father && mother === father) issues.push('Mother and father tags must be different.')
  if (!String(form.value.species || '').trim()) issues.push('Species is required.')
  if (!String(form.value.breedingDate || '').trim()) issues.push('Breeding date is required.')
  fieldErrors.value = issues
  return issues.length === 0
}

async function submitModal() {
  if (!canWrite.value) return
  if (!validateForm()) return
  error.value = ''
  saving.value = true
  try {
    form.value.motherTagId = String(form.value.motherTagId || '').trim().toUpperCase()
    form.value.fatherTagId = String(form.value.fatherTagId || '').trim().toUpperCase()
    if (modalMode.value === 'create') await createRecord()
    else await updateRecord()
    await loadData()
    closeModal()
  } catch (err) {
    error.value = err.message || 'Failed to save breeding record'
  } finally {
    saving.value = false
  }
}

async function deleteRecord(record) {
  if (!canWrite.value) return
  pendingDelete.value = record
  confirmOpen.value = true
}

function openBirthModal(record) {
  if (!canWrite.value) return
  birthRecord.value = record
  birthError.value = ''
  birthForm.value = {
    actualBirthDate: new Date().toISOString().slice(0, 10),
    offspringCount: 1
  }
  birthModalOpen.value = true
}

function closeBirthModal() {
  birthModalOpen.value = false
  birthError.value = ''
}

async function submitBirthModal() {
  if (!birthRecord.value) return
  const offspring = Number(birthForm.value.offspringCount)
  if (!birthForm.value.actualBirthDate) {
    birthError.value = 'Actual birth date is required.'
    return
  }
  if (!Number.isInteger(offspring) || offspring < 0) {
    birthError.value = 'Offspring count must be 0 or more.'
    return
  }

  birthError.value = ''
  birthSaving.value = true
  try {
    await apiPost(`/api/breeding/${birthRecord.value.id}/birth`, {
      actualBirthDate: birthForm.value.actualBirthDate,
      offspringCount: offspring
    })
    closeBirthModal()
    await loadData()
  } catch (err) {
    birthError.value = err.message || 'Failed to record birth'
  } finally {
    birthSaving.value = false
  }
}

async function confirmDeleteRecord() {
  if (!pendingDelete.value) return
  try {
    await apiDelete(`/api/breeding/${pendingDelete.value.id}`)
    confirmOpen.value = false
    pendingDelete.value = null
    await loadData()
  } catch (err) {
    error.value = err.message || 'Failed to delete breeding record'
  }
}

onMounted(loadData)
</script>
