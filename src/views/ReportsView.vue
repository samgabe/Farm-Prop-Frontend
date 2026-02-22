<template>
  <section>
    <header>
      <h2 class="text-2xl font-bold text-zinc-800 md:text-3xl">Reports & Analytics</h2>
      <p class="mt-2 text-base text-[#7a7467]">Generate and view farm reports</p>
    </header>

    <h3 class="mt-6 text-xl font-bold text-zinc-800 md:text-2xl">Record Highlights</h3>
    <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <article v-for="card in cards" :key="card.label" :class="[cardClass, toneClass(card.tone)]">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] opacity-90">{{ card.label }}</p>
        <h4 class="mt-2 break-words text-xl font-bold leading-tight md:text-2xl">{{ card.value }}</h4>
        <small class="mt-2 block break-words text-xs leading-5 opacity-95">{{ card.note }}</small>
      </article>
    </div>

    <h3 class="mb-3 mt-8 text-2xl font-bold text-zinc-800 md:text-3xl">Available Reports</h3>
    <div class="grid gap-4 lg:grid-cols-2">
      <article class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4" v-for="report in reports" :key="report.id">
        <h4 class="break-words text-xl font-bold leading-snug">{{ report.title }}</h4>
        <p class="mt-2 min-h-12 break-words text-sm leading-6 text-[#7a7467]">{{ report.detail }}</p>
        <p class="mt-2 break-words text-xs font-semibold text-[#6f6758]">
          {{ report.category }} | {{ report.dateRange || 'Last 7 days' }} | {{ report.format || 'JSON' }}
        </p>
        <footer class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#ddd8ce] pt-3">
          <small class="break-words">Last generated: {{ report.generated }}</small>
          <div class="inline-flex flex-wrap items-center gap-2">
            <button class="font-bold text-farm-green" @click="downloadReport(report, 'PDF')">Download PDF</button>
            <button class="rounded border border-[#cec7b8] px-2 py-1 text-xs font-semibold text-zinc-700" @click="downloadReport(report, 'CSV')">CSV</button>
            <button class="rounded border border-[#cec7b8] px-2 py-1 text-xs font-semibold text-zinc-700" @click="downloadReport(report, 'JSON')">JSON</button>
          </div>
        </footer>
      </article>
    </div>
    <div class="mt-3 flex items-center justify-end gap-2">
      <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm disabled:opacity-40" :disabled="reportsPage <= 1" @click="loadData(reportsPage - 1)">Prev</button>
      <span class="text-sm text-[#6f6758]">Page {{ reportsPage }} / {{ reportsTotalPages }}</span>
      <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm disabled:opacity-40" :disabled="reportsPage >= reportsTotalPages" @click="loadData(reportsPage + 1)">Next</button>
    </div>

    <div class="mt-4 rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 shadow-sm">
      <h3 class="text-2xl font-bold text-zinc-800 md:text-3xl">Custom Report Builder</h3>
      <p class="mt-2 text-[#7a7467]">Create a custom report by selecting date range, categories, and metrics</p>
      <div class="my-4 grid gap-3 lg:grid-cols-3">
        <label class="grid gap-1">
          Date Range
          <select v-model="builder.dateRange" class="w-full rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This month</option>
          </select>
        </label>
        <label class="grid gap-1">
          Report Type
          <select v-model="builder.reportType" class="w-full rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3">
            <option>Financial</option>
            <option>Health</option>
            <option>Breeding</option>
            <option>Feeding</option>
            <option>Resources</option>
            <option>Sales</option>
          </select>
        </label>
        <label class="grid gap-1">
          Format
          <select v-model="builder.format" class="w-full rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3">
            <option>PDF</option>
            <option>JSON</option>
            <option>CSV</option>
          </select>
        </label>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button v-if="canGenerate" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" :disabled="generating" @click="generateReport">{{ generating ? 'Generating...' : 'Generate Report' }}</button>
        <p v-else class="text-sm font-semibold text-[#7a7467]">You do not have permission to generate reports.</p>
        <p v-if="error" class="font-semibold text-farm-red">{{ error }}</p>
      </div>
    </div>

    <div class="mt-4 rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 shadow-sm">
      <h3 class="text-2xl font-bold text-zinc-800 md:text-3xl">Tax Receipts (Local)</h3>
      <p class="mt-2 text-[#7a7467]">Generate and download local tax receipts for your records. No KRA submission is made.</p>
      <div class="mt-3 grid gap-3 md:grid-cols-[320px_auto] md:items-end">
        <label class="grid gap-1">
          Sale ID
          <select v-model="etimsSaleId" class="w-full max-w-[320px] rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3">
            <option value="">{{ etimsSalesLoading ? 'Loading sales...' : 'Select sale' }}</option>
            <option v-for="sale in etimsSales" :key="sale.id" :value="String(sale.id)">
              {{ formatSaleOptionRich(sale) }}
            </option>
          </select>
        </label>
        <div class="flex items-end">
          <button v-if="canManageEtims" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white disabled:opacity-60" :disabled="etimsSubmitting || !hasSelectedSale" @click="generateReceipt">
            {{ etimsSubmitting ? 'Generating...' : 'Generate Receipt (Local)' }}
          </button>
          <p v-else class="text-sm font-semibold text-[#7a7467]">You do not have permission to generate receipts.</p>
        </div>
      </div>
      <div class="mt-1 w-full max-w-[320px]">
        <small v-if="selectedEtimsSale" class="block text-xs text-[#7a7467]">
          {{ formatSelectedSaleDetails(selectedEtimsSale) }}
        </small>
        <small class="block text-xs text-[#7a7467]">Showing latest 100 sales.</small>
      </div>
      <p v-if="etimsNotice" class="mt-3 font-semibold text-farm-green">{{ etimsNotice }}</p>
      <p v-if="etimsError" class="mt-3 font-semibold text-farm-red">{{ etimsError }}</p>

      <div class="mt-4 overflow-x-auto rounded-lg border border-[#ddd8ce] bg-white">
        <table class="w-full min-w-[760px] border-collapse">
          <thead class="bg-farm-green text-white">
            <tr>
              <th class="px-3 py-2 text-left text-sm">Receipt ID</th>
              <th class="px-3 py-2 text-left text-sm">Sale ID</th>
              <th class="px-3 py-2 text-left text-sm">Invoice Number</th>
              <th class="px-3 py-2 text-left text-sm">Status</th>
              <th class="px-3 py-2 text-left text-sm">Generated</th>
              <th class="px-3 py-2 text-right text-sm">Downloads</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!etimsSubmissions.length">
              <td colspan="7" class="px-3 py-6 text-center text-[#7a7467]">No local receipts yet.</td>
            </tr>
            <tr v-for="sub in etimsSubmissions" :key="sub.id" class="border-t border-[#e6e1d7]">
              <td class="px-3 py-2">{{ sub.id }}</td>
              <td class="px-3 py-2">{{ sub.saleId }}</td>
              <td class="px-3 py-2">{{ sub.invoiceNumber }}</td>
              <td class="px-3 py-2">{{ sub.status }}</td>
              <td class="px-3 py-2">{{ sub.generatedAt }}</td>
              <td class="px-3 py-2 text-right">
                <div class="inline-flex gap-2">
                  <button class="rounded border border-[#cec7b8] px-2 py-1 text-xs font-semibold text-zinc-700" @click="downloadReceipt(sub, 'PDF')">PDF</button>
                  <button class="rounded border border-[#cec7b8] px-2 py-1 text-xs font-semibold text-zinc-700" @click="downloadReceipt(sub, 'CSV')">CSV</button>
                  <button class="rounded border border-[#cec7b8] px-2 py-1 text-xs font-semibold text-zinc-700" @click="downloadReceipt(sub, 'JSON')">JSON</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { apiGet, apiPost } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { fmtCurrency } from '../utils/animal'
import { hasActionAccess } from '../utils/rbac'

const auth = useAuthStore()
const stats = ref({ grossRevenue: 0, netRevenue: 0, vatCollected: 0, monthlyProfit: 0, operatingCosts: 0, totalAnimals: 0, productivityRate: 0 })
const reports = ref([])
const reportsPage = ref(1)
const reportsPageSize = ref(8)
const reportsTotal = ref(0)
const generating = ref(false)
const error = ref('')
const etimsSaleId = ref('')
const etimsSubmitting = ref(false)
const etimsError = ref('')
const etimsNotice = ref('')
const etimsSubmissions = ref([])
const etimsSales = ref([])
const etimsSalesLoading = ref(false)
const builder = ref({
  dateRange: 'Last 7 days',
  reportType: 'Financial',
  format: 'PDF'
})
const canGenerate = computed(() => hasActionAccess(auth.role || auth.user?.role || '', 'reports.generate'))
const canManageEtims = computed(() => hasActionAccess(auth.role || auth.user?.role || '', 'etims.manage'))
const hasSelectedSale = computed(() => Number.isInteger(Number.parseInt(String(etimsSaleId.value || ''), 10)) && Number.parseInt(String(etimsSaleId.value || ''), 10) > 0)
const selectedEtimsSale = computed(() => etimsSales.value.find((s) => String(s?.id) === String(etimsSaleId.value || '')) || null)

const cardClass =
  'flex min-h-32 flex-col rounded-lg p-4 shadow-[0_4px_0_rgba(0,0,0,0.12)] overflow-hidden bg-[length:20px_20px] bg-[linear-gradient(135deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,transparent_75%,transparent)]'

const toneClass = (tone) => ({
  green: 'bg-farm-green text-white',
  gold: 'bg-farm-gold text-zinc-800',
  orange: 'bg-farm-orange text-white',
  red: 'bg-farm-red text-white'
}[tone] || 'bg-farm-green text-white')

const cards = computed(() => [
  { label: 'Gross Revenue', value: fmtCurrency(stats.value.grossRevenue), note: 'Sales before deductions (month)', tone: 'gold' },
  { label: 'Net Revenue', value: fmtCurrency(stats.value.netRevenue), note: 'Revenue after VAT split', tone: 'green' },
  { label: 'VAT Collected', value: fmtCurrency(stats.value.vatCollected), note: 'VAT tracked for local records', tone: 'orange' },
  { label: 'Operating Costs', value: fmtCurrency(stats.value.operatingCosts), note: 'Expense total this month', tone: 'orange' },
  { label: 'Monthly Profit', value: fmtCurrency(stats.value.monthlyProfit), note: `Net margin: ${stats.value.productivityRate}%`, tone: 'green' }
])
const reportsTotalPages = computed(() => Math.max(1, Math.ceil(reportsTotal.value / reportsPageSize.value)))

async function loadData(nextReportsPage = reportsPage.value) {
  if (canManageEtims.value) etimsSalesLoading.value = true
  try {
    const [statsRes, reportsRes, etimsRes, salesRes] = await Promise.allSettled([
      apiGet('/api/reports/stats'),
      apiGet(`/api/reports?page=${nextReportsPage}&pageSize=${reportsPageSize.value}`),
      canManageEtims.value ? apiGet('/api/etims/receipts') : Promise.resolve([]),
      canManageEtims.value ? apiGet('/api/sales?page=1&pageSize=100') : Promise.resolve({ items: [] })
    ])
    if (statsRes.status === 'fulfilled') stats.value = statsRes.value
    if (reportsRes.status === 'fulfilled') {
      const payload = reportsRes.value
      const list = Array.isArray(payload) ? payload : (payload.items || [])
      const count = Number(payload.total || list.length)
      const resolvedPage = Number(payload.page || nextReportsPage)
      const maxPage = Math.max(1, Math.ceil(count / reportsPageSize.value))
      if (resolvedPage > maxPage && resolvedPage !== 1) {
        await loadData(maxPage)
        return
      }
      reports.value = list
      reportsTotal.value = count
      reportsPage.value = resolvedPage
    }
    if (etimsRes.status === 'fulfilled') etimsSubmissions.value = Array.isArray(etimsRes.value) ? etimsRes.value : []
    if (salesRes.status === 'fulfilled') {
      const payload = salesRes.value
      const list = Array.isArray(payload) ? payload : (payload.items || [])
      etimsSales.value = list
      if (!etimsSaleId.value && list.length) {
        etimsSaleId.value = String(list[0].id)
      }
    }
  } finally {
    if (canManageEtims.value) etimsSalesLoading.value = false
  }
}

async function generateReport() {
  if (!canGenerate.value) return
  error.value = ''
  generating.value = true
  try {
    await apiPost('/api/reports/generate', builder.value)
    await loadData()
  } catch (err) {
    error.value = err.message || 'Failed to generate report'
  } finally {
    generating.value = false
  }
}

async function downloadReport(report, preferredFormat = '') {
  error.value = ''
  try {
    const format = String(preferredFormat || builder.value.format || 'PDF').toUpperCase()
    const token = localStorage.getItem('farmpro_token')
    const apiBase = import.meta.env.VITE_API_BASE || ''
    const res = await fetch(`${apiBase}/api/reports/${report.id}/download?format=${encodeURIComponent(format)}`, {
      headers: {
        Accept: '*/*',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      throw new Error(payload.error || `Request failed (${res.status})`)
    }
    const blob = await res.blob()
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    const ext = format === 'CSV' ? 'csv' : (format === 'PDF' ? 'pdf' : 'json')
    link.download = `${String(report.title || 'report').replace(/\s+/g, '-').toLowerCase()}.${ext}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(href)
  } catch (err) {
    error.value = err.message || 'Failed to download report'
  }
}

onMounted(loadData)

async function generateReceipt() {
  if (!canManageEtims.value) return
  etimsError.value = ''
  etimsNotice.value = ''
  const saleId = Number.parseInt(String(etimsSaleId.value || ''), 10)
  if (!Number.isInteger(saleId) || saleId <= 0) {
    etimsError.value = 'Enter a valid sale ID.'
    return
  }
  etimsSubmitting.value = true
  try {
    const res = await apiPost(`/api/etims/receipts/generate/${saleId}`, {})
    etimsNotice.value = res.notice || `Generated local receipt for sale #${saleId}.`
    await loadData()
  } catch (err) {
    etimsError.value = err.message || 'Failed to generate receipt'
  } finally {
    etimsSubmitting.value = false
  }
}

async function downloadReceipt(receipt, format = 'PDF') {
  etimsError.value = ''
  try {
    const token = localStorage.getItem('farmpro_token')
    const apiBase = import.meta.env.VITE_API_BASE || ''
    const res = await fetch(`${apiBase}/api/etims/receipts/${receipt.id}/download?format=${encodeURIComponent(format)}`, {
      headers: {
        Accept: '*/*',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      throw new Error(payload.error || `Request failed (${res.status})`)
    }
    const blob = await res.blob()
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = `${String(receipt.invoiceNumber || `receipt-${receipt.id}`).replace(/\s+/g, '-').toLowerCase()}.${String(format).toLowerCase()}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(href)
  } catch (err) {
    etimsError.value = err.message || 'Failed to download receipt'
  }
}

function formatSaleOptionRich(sale) {
  const id = Number(sale?.id || 0)
  const product = String(sale?.product || 'Sale')
  const buyer = String(sale?.buyer || 'Buyer')
  const total = String(sale?.total || 'KES 0')
  const date = String(sale?.date || '-')
  return `#${id} - ${product} | ${buyer} | ${total} | ${date}`
}

function formatSelectedSaleDetails(sale) {
  const product = String(sale?.product || '-')
  const buyer = String(sale?.buyer || '-')
  const total = String(sale?.total || '-')
  const date = String(sale?.date || '-')
  return `Product: ${product} | Buyer: ${buyer} | Total: ${total} | Date: ${date}`
}
</script>
