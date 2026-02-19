<template>
  <section class="min-w-0">
    <header class="flex flex-col justify-between gap-3 md:flex-row md:items-start">
      <div>
        <h2 class="text-2xl font-bold text-zinc-800 md:text-3xl">Expense Management</h2>
        <p class="mt-2 text-base text-[#7a7467]">Track all farm expenses</p>
      </div>
      <button v-if="canWrite" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" @click="openCreateModal">
        + Add Expense
      </button>
    </header>
    <div class="mt-4 grid gap-3 md:grid-cols-[1fr_120px]">
      <input v-model="query" type="text" placeholder="Search category, item, vendor..." class="w-full rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" @keyup.enter="loadData(1)" />
      <button class="rounded-lg border border-[#d1cbc0] bg-[#f2f0ea] px-4 py-3 text-zinc-800" @click="loadData(1)">Filter</button>
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-3">
      <article v-for="card in cards" :key="card.label" :class="[cardClass, toneClass(card.tone)]">
        <p class="text-sm font-semibold tracking-wide">{{ card.label }}</p>
        <h3 class="my-2 break-words text-2xl font-bold leading-tight md:text-3xl">{{ card.value }}</h3>
        <small class="block break-words text-xs">{{ card.note }}</small>
      </article>
    </div>
    <div class="mt-3 flex flex-wrap items-center justify-end gap-2">
      <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm disabled:opacity-40" :disabled="page <= 1" @click="loadData(page - 1)">Prev</button>
      <span class="text-sm text-[#6f6758]">Page {{ page }} / {{ totalPages }}</span>
      <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm disabled:opacity-40" :disabled="page >= totalPages" @click="loadData(page + 1)">Next</button>
    </div>

    <h3 class="mb-3 mt-8 text-2xl font-bold text-zinc-800 md:text-3xl">Expense Ledger</h3>
    <div class="grid gap-3 md:hidden">
      <article v-if="!ledger.length" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 text-center text-[#7a7467]">
        No expenses yet. Add your first expense.
      </article>
      <article v-for="row in ledger" :key="`mobile-${row.date}-${row.item}`" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm text-[#7a7467]">{{ row.date }}</p>
            <h4 class="font-bold text-zinc-800">{{ row.item }}</h4>
          </div>
          <p class="font-bold text-farm-red">{{ row.amount }}</p>
        </div>
        <div class="mt-2 grid gap-1 text-sm text-zinc-700">
          <p><span class="font-semibold">Category:</span> {{ row.category }}</p>
          <p><span class="font-semibold">Vendor:</span> {{ row.vendor }}</p>
        </div>
        <div v-if="canWrite" class="mt-3 flex flex-wrap gap-2">
          <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditModal(row)">Edit</button>
          <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="deleteExpense(row)">Delete</button>
        </div>
      </article>
      <article class="rounded-lg border border-[#ddd8ce] bg-farm-gold p-4 font-bold text-zinc-800">
        Total Expenses: {{ total }}
      </article>
    </div>

    <div class="hidden overflow-x-auto rounded-lg border border-[#ddd8ce] bg-farm-panel shadow-sm md:block">
      <table class="w-full min-w-[980px] border-collapse">
        <thead class="bg-farm-red text-white">
          <tr>
            <th class="px-4 py-3 text-left text-sm">Date</th>
            <th class="px-4 py-3 text-left text-sm">Category</th>
            <th class="px-4 py-3 text-left text-sm">Item</th>
            <th class="px-4 py-3 text-left text-sm">Vendor</th>
            <th class="px-4 py-3 text-left text-sm">Amount</th>
            <th v-if="canWrite" class="px-4 py-3 text-right text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!ledger.length">
            <td :colspan="canWrite ? 6 : 5" class="px-4 py-8 text-center text-[#7a7467]">No expenses yet. Add your first expense.</td>
          </tr>
          <tr v-for="row in ledger" :key="row.date + row.item" class="border-t border-[#ddd8ce]">
            <td class="px-4 py-3">{{ row.date }}</td>
            <td class="px-4 py-3"><span class="inline-block rounded-full bg-farm-green px-3 py-1 text-xs font-bold text-white">{{ row.category }}</span></td>
            <td class="px-4 py-3">{{ row.item }}</td>
            <td class="px-4 py-3">{{ row.vendor }}</td>
            <td class="px-4 py-3 font-bold text-farm-red">{{ row.amount }}</td>
            <td v-if="canWrite" class="px-4 py-3 text-right">
              <div class="inline-flex flex-wrap justify-end gap-2">
                <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditModal(row)">Edit</button>
                <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="deleteExpense(row)">Delete</button>
              </div>
            </td>
          </tr>
          <tr class="bg-farm-gold font-bold text-zinc-800">
            <td class="px-4 py-3">TOTAL EXPENSES</td>
            <td class="px-4 py-3"></td>
            <td class="px-4 py-3"></td>
            <td class="px-4 py-3"></td>
            <td class="px-4 py-3">{{ total }}</td>
            <td v-if="canWrite" class="px-4 py-3"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :open="modalOpen" :title="modalMode === 'create' ? 'Add Expense' : 'Edit Expense'" @close="closeModal">
      <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submitModal">
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Date</label>
          <input v-model="form.date" type="date" required class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Category</label>
          <input v-model.trim="form.category" required placeholder="Feed" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Item</label>
          <input v-model.trim="form.item" required placeholder="Corn feed" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Vendor</label>
          <input v-model.trim="form.vendor" required placeholder="Agri Supplies Co." class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Amount</label>
          <input v-model.number="form.amount" type="number" min="0.01" step="0.01" required placeholder="0.00" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="md:col-span-2 space-y-3">
          <ul v-if="fieldErrors.length" class="rounded-lg border border-farm-red/30 bg-[#fff4f3] p-3">
            <li v-for="issue in fieldErrors" :key="issue" class="ml-5 list-disc text-sm font-semibold text-farm-red">{{ issue }}</li>
          </ul>
          <p v-if="error" class="font-semibold text-farm-red">{{ error }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-5 py-3 font-semibold text-zinc-800" :disabled="saving" @click="closeModal">Cancel</button>
            <button type="submit" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" :disabled="saving">
              {{ saving ? 'Saving...' : (modalMode === 'create' ? 'Create Expense' : 'Save Changes') }}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
    <ConfirmModal :open="confirmOpen" title="Delete Expense" :message="`Delete expense ${pendingDelete?.item || ''}?`" confirm-text="Delete" @cancel="confirmOpen = false" @confirm="confirmDeleteExpense" />
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
const summary = ref({ totalExpenses: 0, dailyAverage: 0, largestCategory: '-', largestAmount: 0 })
const ledger = ref([])
const modalOpen = ref(false)
const modalMode = ref('create')
const confirmOpen = ref(false)
const pendingDelete = ref(null)
const saving = ref(false)
const error = ref('')
const fieldErrors = ref([])
const selectedId = ref(null)
const query = ref('')
const page = ref(1)
const totalCount = ref(0)
const pageSize = ref(10)
const form = ref({
  date: '',
  category: '',
  item: '',
  vendor: '',
  amount: null
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
  { label: 'Total Expenses (Month)', value: fmtCurrency(summary.value.totalExpenses), note: 'Current month', tone: 'red' },
  { label: 'Daily Average', value: fmtCurrency(summary.value.dailyAverage), note: 'Per day', tone: 'gold' },
  {
    label: 'Largest Category',
    value: summary.value.largestCategory || '-',
    note: fmtCurrency(summary.value.largestAmount),
    tone: 'green'
  }
])

const total = computed(() => fmtCurrency(summary.value.totalExpenses))
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const canWrite = computed(() => hasActionAccess(auth.role || auth.user?.role || '', 'expenses.write'))

async function loadData(nextPage = page.value) {
  const [sum, items] = await Promise.all([
    apiGet('/api/expenses/summary'),
    apiGet(`/api/expenses?q=${encodeURIComponent(query.value || '')}&page=${nextPage}&pageSize=${pageSize.value}`)
  ])
  summary.value = sum
  const list = Array.isArray(items) ? items : (items.items || [])
  const count = Number(items.total || list.length)
  const resolvedPage = Number(items.page || nextPage)
  const maxPage = Math.max(1, Math.ceil(count / pageSize.value))
  if (resolvedPage > maxPage && resolvedPage !== 1) {
    await loadData(maxPage)
    return
  }
  ledger.value = list
  totalCount.value = count
  page.value = resolvedPage
}

async function createExpense() {
  await apiPost('/api/expenses', form.value)
}

async function updateExpense() {
  await apiPut(`/api/expenses/${selectedId.value}`, form.value)
}

function resetForm() {
  form.value = { date: '', category: '', item: '', vendor: '', amount: null }
  fieldErrors.value = []
}

function openCreateModal() {
  if (!canWrite.value) return
  resetForm()
  selectedId.value = null
  error.value = ''
  modalMode.value = 'create'
  modalOpen.value = true
}

function openEditModal(row) {
  if (!canWrite.value) return
  selectedId.value = row.id
  error.value = ''
  modalMode.value = 'edit'
  form.value = {
    date: row.dateRaw,
    category: row.category,
    item: row.item,
    vendor: row.vendor,
    amount: row.amountRaw
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
  if (!String(form.value.date || '').trim()) issues.push('Date is required.')
  if (!String(form.value.category || '').trim()) issues.push('Category is required.')
  if (!String(form.value.item || '').trim()) issues.push('Item is required.')
  if (!String(form.value.vendor || '').trim()) issues.push('Vendor is required.')
  if (!Number.isFinite(Number(form.value.amount)) || Number(form.value.amount) <= 0) issues.push('Amount must be greater than 0.')
  fieldErrors.value = issues
  return issues.length === 0
}

async function submitModal() {
  if (!canWrite.value) return
  if (!validateForm()) return
  error.value = ''
  saving.value = true
  try {
    if (modalMode.value === 'create') await createExpense()
    else await updateExpense()
    await loadData()
    closeModal()
  } catch (err) {
    error.value = err.message || 'Failed to save expense'
  } finally {
    saving.value = false
  }
}

async function deleteExpense(row) {
  if (!canWrite.value) return
  pendingDelete.value = row
  confirmOpen.value = true
}

async function confirmDeleteExpense() {
  if (!pendingDelete.value) return
  try {
    await apiDelete(`/api/expenses/${pendingDelete.value.id}`)
    confirmOpen.value = false
    pendingDelete.value = null
    await loadData()
  } catch (err) {
    error.value = err.message || 'Failed to delete expense'
  }
}

onMounted(() => loadData(1))
</script>
