<template>
  <section class="min-w-0">
    <header class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-zinc-800 md:text-3xl">Production Management</h2>
        <p class="mt-2 text-base text-[#7a7467]">Track daily production output</p>
      </div>
      <button v-if="canCreate" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" @click="openCreateModal">
        + Add Log
      </button>
    </header>

    <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <article v-for="card in productionCards" :key="card.label" :class="[cardClass, toneClass(card.tone)]">
        <p class="text-sm font-semibold tracking-wide">{{ card.label }}</p>
        <h3 class="my-2 break-words text-2xl font-bold leading-tight md:text-3xl">{{ card.value }}</h3>
        <small class="block break-words text-xs">{{ card.note }}</small>
      </article>
    </div>

    <div class="mt-4 grid gap-3 md:grid-cols-[1fr_120px]">
      <input v-model="query" type="text" placeholder="Search date (e.g. Feb)" class="w-full rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" @keyup.enter="loadData(1)" />
      <button class="rounded-lg border border-[#d1cbc0] bg-[#f2f0ea] px-4 py-3 text-zinc-800" @click="loadData(1)">Filter</button>
    </div>

    <h3 class="mb-3 mt-8 text-2xl font-bold text-zinc-800 md:text-3xl">Daily Production Log</h3>
    <div class="grid gap-3 md:hidden">
      <article v-if="!filteredRows.length" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 text-center text-[#7a7467]">
        No production logs available.
      </article>
      <article v-for="row in filteredRows" :key="`mobile-${row.id}`" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm text-[#7a7467]">{{ row.date }}</p>
            <h4 class="font-bold text-zinc-800">{{ row.total }}</h4>
          </div>
        </div>
        <div class="mt-2 grid gap-1 text-sm text-zinc-700">
          <p><span class="font-semibold">Milk:</span> {{ row.milk }}</p>
          <p v-if="row.milkBreakdown" class="text-xs text-[#7a7467]">{{ row.milkBreakdown }}</p>
          <p><span class="font-semibold">Eggs:</span> {{ row.eggs }}</p>
          <p><span class="font-semibold">Wool:</span> {{ row.wool }}</p>
          <p><span class="font-semibold">Meat:</span> {{ row.meat }}</p>
        </div>
        <div v-if="canEdit" class="mt-3 flex flex-wrap gap-2">
          <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditModal(row)">Edit</button>
          <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="askDelete(row)">Delete</button>
        </div>
      </article>
      <article class="rounded-lg border border-[#ddd8ce] bg-farm-gold p-4 font-bold text-zinc-800">
        Weekly Total: {{ weeklyValue }}
      </article>
    </div>

    <div class="hidden overflow-x-auto rounded-lg border border-[#ddd8ce] bg-farm-panel shadow-sm md:block">
      <table class="min-w-[980px] w-full border-collapse">
        <thead class="bg-farm-green text-white">
          <tr>
            <th class="px-4 py-3 text-left text-sm">Date</th>
            <th class="px-4 py-3 text-left text-sm">Milk (L)</th>
            <th class="px-4 py-3 text-left text-sm">Eggs</th>
            <th class="px-4 py-3 text-left text-sm">Wool (kg)</th>
            <th class="px-4 py-3 text-left text-sm">Meat (kg)</th>
            <th class="px-4 py-3 text-left text-sm">Total Value</th>
            <th v-if="canEdit" class="px-4 py-3 text-right text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filteredRows.length">
            <td :colspan="canEdit ? 7 : 6" class="px-4 py-8 text-center text-[#7a7467]">No production logs available.</td>
          </tr>
          <tr v-for="row in filteredRows" :key="row.id" class="border-t border-[#ddd8ce]">
            <td class="px-4 py-3 font-bold">{{ row.date }}</td>
            <td class="px-4 py-3">{{ row.milk }}</td>
            <td class="px-4 py-3">{{ row.eggs }}</td>
            <td class="px-4 py-3">{{ row.wool }}</td>
            <td class="px-4 py-3">{{ row.meat }}</td>
            <td class="px-4 py-3 font-bold">{{ row.total }}</td>
            <td v-if="canEdit" class="px-4 py-3 text-right">
              <div class="inline-flex flex-wrap justify-end gap-2">
                <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditModal(row)">Edit</button>
                <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="askDelete(row)">Delete</button>
              </div>
            </td>
          </tr>
          <tr class="bg-farm-gold font-bold text-zinc-800">
            <td class="px-4 py-3">WEEKLY TOTAL</td>
            <td class="px-4 py-3">{{ weeklyMilk }}</td>
            <td class="px-4 py-3">{{ weeklyEggs }}</td>
            <td class="px-4 py-3">{{ weeklyWool }}</td>
            <td class="px-4 py-3">{{ weeklyMeat }}</td>
            <td class="px-4 py-3">{{ weeklyValue }}</td>
            <td v-if="canEdit" class="px-4 py-3"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-3 flex flex-wrap items-center justify-end gap-2">
      <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm disabled:opacity-40" :disabled="page <= 1" @click="loadData(page - 1)">Prev</button>
      <span class="text-sm text-[#6f6758]">Page {{ page }} / {{ totalPages }}</span>
      <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm disabled:opacity-40" :disabled="page >= totalPages" @click="loadData(page + 1)">Next</button>
    </div>

    <BaseModal :open="modalOpen" :title="modalMode === 'create' ? 'Add Production Log' : 'Edit Production Log'" @close="closeModal">
      <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submitModal">
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Date</label>
          <input v-model="form.date" type="date" required class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Milk (Cow, L)</label>
          <input v-model.number="form.milkCowLiters" type="number" min="0" step="0.01" placeholder="0.00" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Milk (Goat, L)</label>
          <input v-model.number="form.milkGoatLiters" type="number" min="0" step="0.01" placeholder="0.00" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Eggs</label>
          <input v-model.number="form.eggsCount" type="number" min="0" step="1" required placeholder="0" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Wool (kg)</label>
          <input v-model.number="form.woolKg" type="number" min="0" step="0.01" placeholder="0.00" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Meat (kg)</label>
          <input v-model.number="form.meatKg" type="number" min="0" step="0.01" placeholder="0.00" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Cow Milk Rate (KSh/L)</label>
          <input v-model.number="form.milkCowRate" type="number" min="0" step="0.01" required class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Goat Milk Rate (KSh/L)</label>
          <input v-model.number="form.milkGoatRate" type="number" min="0" step="0.01" required class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Egg Rate (KSh/egg)</label>
          <input v-model.number="form.eggRate" type="number" min="0" step="0.01" required class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Wool Rate (KSh/kg)</label>
          <input v-model.number="form.woolRate" type="number" min="0" step="0.01" required class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Meat Rate (KSh/kg)</label>
          <input v-model.number="form.meatRate" type="number" min="0" step="0.01" required class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1 md:col-span-2">
          <label class="inline-flex items-center gap-2 rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3 text-sm text-zinc-700">
            <input v-model="form.manualTotalOverride" type="checkbox" />
            Override total manually
          </label>
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Total Value (KSh)</label>
          <input v-model.number="form.totalValue" type="number" min="0" step="0.01" :required="form.manualTotalOverride" :disabled="!form.manualTotalOverride" placeholder="0.00" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3 disabled:opacity-60" />
          <small v-if="!form.manualTotalOverride" class="text-xs text-[#7a7467]">Auto-calculated: {{ fmtCurrency(calculatedTotal) }}</small>
        </div>
        <div class="md:col-span-2 space-y-3">
          <ul v-if="fieldErrors.length" class="rounded-lg border border-farm-red/30 bg-[#fff4f3] p-3">
            <li v-for="issue in fieldErrors" :key="issue" class="ml-5 list-disc text-sm font-semibold text-farm-red">{{ issue }}</li>
          </ul>
          <p v-if="error" class="font-semibold text-farm-red">{{ error }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-5 py-3 font-semibold text-zinc-800" :disabled="saving" @click="closeModal">Cancel</button>
            <button type="submit" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" :disabled="saving">
              {{ saving ? 'Saving...' : (modalMode === 'create' ? 'Create Log' : 'Save Changes') }}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>

    <ConfirmModal
      :open="confirmOpen"
      title="Delete Production Log"
      :message="`Delete production log for ${pendingDelete?.date || ''}?`"
      confirm-text="Delete"
      @cancel="confirmOpen = false"
      @confirm="confirmDelete"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseModal from '../components/BaseModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { apiDelete, apiGet, apiPost, apiPut } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { fmtCurrency } from '../utils/animal'
import { hasActionAccess } from '../utils/rbac'

const auth = useAuthStore()
const summary = ref({
  weeklyMilk: 0,
  weeklyMilkTotal: 0,
  weeklyMilkCow: 0,
  weeklyMilkGoat: 0,
  weeklyEggs: 0,
  weeklyWool: 0,
  weeklyMeat: 0,
  weeklyValue: 0,
  productivityChange: 0
})
const rows = ref([])
const query = ref('')
const page = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

const modalOpen = ref(false)
const modalMode = ref('create')
const selectedId = ref(null)
const saving = ref(false)
const error = ref('')
const fieldErrors = ref([])

const confirmOpen = ref(false)
const pendingDelete = ref(null)

const DEFAULT_MILK_RATE = 60
const DEFAULT_MILK_COW_RATE = 60
const DEFAULT_MILK_GOAT_RATE = 80
const DEFAULT_EGG_RATE = 15
const DEFAULT_WOOL_RATE = 500
const DEFAULT_MEAT_RATE = 450
const form = ref({
  date: '',
  milkLiters: 0,
  milkCowLiters: 0,
  milkGoatLiters: 0,
  eggsCount: 0,
  woolKg: 0,
  meatKg: 0,
  milkRate: DEFAULT_MILK_RATE,
  milkCowRate: DEFAULT_MILK_COW_RATE,
  milkGoatRate: DEFAULT_MILK_GOAT_RATE,
  eggRate: DEFAULT_EGG_RATE,
  woolRate: DEFAULT_WOOL_RATE,
  meatRate: DEFAULT_MEAT_RATE,
  manualTotalOverride: false,
  totalValue: 0
})

const canCreate = computed(() => hasActionAccess(auth.role || auth.user?.role || '', 'production.create'))
const canEdit = computed(() => hasActionAccess(auth.role || auth.user?.role || '', 'production.manage'))

const filteredRows = computed(() => {
  if (!query.value.trim()) return rows.value
  return rows.value.filter((r) => r.date.toLowerCase().includes(query.value.trim().toLowerCase()))
})

const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

const cardClass =
  'rounded-lg p-4 md:p-5 shadow-[0_4px_0_rgba(0,0,0,0.12)] overflow-hidden bg-[length:20px_20px] bg-[linear-gradient(135deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,transparent_75%,transparent)]'
const toneClass = (tone) => ({
  green: 'bg-farm-green text-white',
  gold: 'bg-farm-gold text-zinc-800',
  orange: 'bg-farm-orange text-white',
  red: 'bg-farm-red text-white'
}[tone] || 'bg-farm-green text-white')

const productionCards = computed(() => [
  { label: 'Weekly Milk', value: `${Number(summary.value.weeklyMilkTotal ?? summary.value.weeklyMilk)}L`, note: 'Last 7 days', tone: 'green' },
  { label: 'Weekly Eggs', value: summary.value.weeklyEggs, note: 'Last 7 days', tone: 'gold' },
  { label: 'Weekly Wool', value: `${summary.value.weeklyWool} kg`, note: 'Last 7 days', tone: 'orange' },
  { label: 'Weekly Meat', value: `${summary.value.weeklyMeat} kg`, note: 'Last 7 days', tone: 'gold' },
  {
    label: 'Productivity',
    value: `${summary.value.productivityChange >= 0 ? '+' : ''}${Number(summary.value.productivityChange || 0).toFixed(1)}%`,
    note: 'vs previous 7 days',
    tone: summary.value.productivityChange >= 0 ? 'green' : 'red'
  }
])

const weeklyMilk = computed(() => `${Number(summary.value.weeklyMilkTotal ?? summary.value.weeklyMilk)} L`)
const weeklyEggs = computed(() => summary.value.weeklyEggs)
const weeklyWool = computed(() => `${summary.value.weeklyWool} kg`)
const weeklyMeat = computed(() => `${summary.value.weeklyMeat} kg`)
const weeklyValue = computed(() => fmtCurrency(summary.value.weeklyValue))
const calculatedTotal = computed(() => {
  const milkVarietyTotal =
    Number(form.value.milkCowLiters || 0) +
    Number(form.value.milkGoatLiters || 0)
  const milkLiters = Number(form.value.milkLiters || 0)
  const eggs = Number(form.value.eggsCount || 0)
  const wool = Number(form.value.woolKg || 0)
  const meat = Number(form.value.meatKg || 0)
  const milkRate = Number(form.value.milkRate || 0)
  const milkCowRate = Number(form.value.milkCowRate || 0)
  const milkGoatRate = Number(form.value.milkGoatRate || 0)
  const eggRate = Number(form.value.eggRate || 0)
  const woolRate = Number(form.value.woolRate || 0)
  const meatRate = Number(form.value.meatRate || 0)
  if (milkVarietyTotal === 0 && milkLiters > 0) {
    return milkLiters * milkRate + eggs * eggRate + wool * woolRate + meat * meatRate
  }
  const milkTotal =
    Number(form.value.milkCowLiters || 0) * milkCowRate +
    Number(form.value.milkGoatLiters || 0) * milkGoatRate
  return milkTotal + eggs * eggRate + wool * woolRate + meat * meatRate
})

function resetForm() {
  form.value = {
    date: '',
    milkLiters: 0,
    milkCowLiters: 0,
    milkGoatLiters: 0,
    eggsCount: 0,
    woolKg: 0,
    meatKg: 0,
    milkRate: DEFAULT_MILK_RATE,
    milkCowRate: DEFAULT_MILK_COW_RATE,
    milkGoatRate: DEFAULT_MILK_GOAT_RATE,
    eggRate: DEFAULT_EGG_RATE,
    woolRate: DEFAULT_WOOL_RATE,
    meatRate: DEFAULT_MEAT_RATE,
    manualTotalOverride: false,
    totalValue: 0
  }
  fieldErrors.value = []
}

function openCreateModal() {
  if (!canCreate.value) return
  resetForm()
  modalMode.value = 'create'
  selectedId.value = null
  error.value = ''
  modalOpen.value = true
}

function openEditModal(row) {
  if (!canEdit.value) return
  modalMode.value = 'edit'
  selectedId.value = row.id
  error.value = ''
  fieldErrors.value = []
  form.value = {
    date: row.dateRaw,
    milkLiters: row.milkValue,
    milkCowLiters: row.milkCowValue || 0,
    milkGoatLiters: row.milkGoatValue || 0,
    eggsCount: row.eggsValue,
    woolKg: row.woolValue,
    meatKg: row.meatValue || 0,
    milkRate: DEFAULT_MILK_RATE,
    milkCowRate: DEFAULT_MILK_COW_RATE,
    milkGoatRate: DEFAULT_MILK_GOAT_RATE,
    eggRate: DEFAULT_EGG_RATE,
    woolRate: DEFAULT_WOOL_RATE,
    meatRate: DEFAULT_MEAT_RATE,
    manualTotalOverride: false,
    totalValue: row.totalValue
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
  if (!form.value.date) issues.push('Date is required.')
  if (form.value.milkCowLiters < 0) issues.push('Cow milk cannot be negative.')
  if (form.value.milkGoatLiters < 0) issues.push('Goat milk cannot be negative.')
  if (form.value.eggsCount < 0 || !Number.isInteger(Number(form.value.eggsCount))) issues.push('Eggs must be a whole number.')
  if (form.value.woolKg < 0) issues.push('Wool cannot be negative.')
  if (form.value.meatKg < 0) issues.push('Meat cannot be negative.')
  if (
    form.value.milkRate < 0 ||
    form.value.milkCowRate < 0 ||
    form.value.milkGoatRate < 0 ||
    form.value.eggRate < 0 ||
    form.value.woolRate < 0 ||
    form.value.meatRate < 0
  ) {
    issues.push('Rates cannot be negative.')
  }
  if (form.value.manualTotalOverride && form.value.totalValue < 0) issues.push('Manual total cannot be negative.')
  fieldErrors.value = issues
  return issues.length === 0
}

async function loadData(nextPage = page.value) {
  const [sum, logsRes] = await Promise.all([
    apiGet('/api/production/summary'),
    apiGet(`/api/production/logs?page=${nextPage}&pageSize=${pageSize.value}`)
  ])
  summary.value = sum
  const list = Array.isArray(logsRes) ? logsRes : (logsRes.items || [])
  const count = Number(logsRes.total || list.length)
  const resolvedPage = Number(logsRes.page || nextPage)
  const maxPage = Math.max(1, Math.ceil(count / pageSize.value))
  if (resolvedPage > maxPage && resolvedPage !== 1) {
    await loadData(maxPage)
    return
  }
  rows.value = list.map((row) => {
    const parts = []
    if (Number(row.milkCowValue || 0) > 0) parts.push(`Cow ${row.milkCow}`)
    if (Number(row.milkGoatValue || 0) > 0) parts.push(`Goat ${row.milkGoat}`)
    return {
      ...row,
      milkBreakdown: parts.join(' · ')
    }
  })
  totalCount.value = count
  page.value = resolvedPage
}

async function submitModal() {
  if (modalMode.value === 'create' && !canCreate.value) return
  if (modalMode.value === 'edit' && !canEdit.value) return
  if (!validateForm()) return
  error.value = ''
  saving.value = true
  try {
    const payload = {
      ...form.value,
      milkLiters:
        Number(form.value.milkCowLiters || 0) +
        Number(form.value.milkGoatLiters || 0) ||
        Number(form.value.milkLiters || 0),
      eggsCount: Number(form.value.eggsCount || 0),
      totalValue: form.value.manualTotalOverride ? Number(form.value.totalValue || 0) : Number(calculatedTotal.value || 0)
    }
    if (modalMode.value === 'create') {
      await apiPost('/api/production/logs', payload)
    } else {
      await apiPut(`/api/production/logs/${selectedId.value}`, payload)
    }
    await loadData()
    closeModal()
  } catch (err) {
    error.value = err.message || 'Failed to save production log'
  } finally {
    saving.value = false
  }
}

function askDelete(row) {
  if (!canEdit.value) return
  pendingDelete.value = row
  confirmOpen.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  try {
    await apiDelete(`/api/production/logs/${pendingDelete.value.id}`)
    confirmOpen.value = false
    pendingDelete.value = null
    await loadData()
  } catch (err) {
    error.value = err.message || 'Failed to delete production log'
  }
}

onMounted(() => loadData(1))
</script>
