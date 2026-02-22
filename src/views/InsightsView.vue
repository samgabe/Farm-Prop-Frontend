<template>
  <section>
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-zinc-800 md:text-3xl">Insights & Optimization</h2>
        <p class="mt-2 text-base text-[#7a7467]">Operational, financial, and ration signals across the farm.</p>
      </div>
    </header>

    <div v-if="summaryCards.length" class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-lg border-2 border-[#4b6c4e] bg-farm-panel p-4"
      >
        <p class="text-xs font-semibold uppercase tracking-wide text-[#7a7467]">{{ card.label }}</p>
        <p class="mt-2 text-2xl font-bold text-[#2f5736]">{{ card.value }}</p>
        <small v-if="card.note" class="mt-1 block text-xs text-[#7a7467]">{{ card.note }}</small>
      </article>
    </div>

    <p v-if="error" class="mt-4 rounded-md border border-[#f0c9c9] bg-[#fff3f3] px-3 py-2 text-sm text-[#7b3b3b]">
      {{ error }}
    </p>

    <section v-if="speciesProfitability.length" class="mt-6">
      <h3 class="text-xl font-bold text-zinc-800">Per-Species Profitability (Est.)</h3>
      <p class="mt-2 text-sm text-[#7a7467]">Estimated from sales revenue and feed costs over the last 30 days.</p>
      <div class="mt-3 overflow-hidden rounded-lg border border-[#d8d2c6] bg-white/80">
        <table class="w-full text-left text-sm">
          <thead class="bg-[#f5f1e8] text-xs uppercase tracking-wide text-[#7a7467]">
            <tr>
              <th class="px-4 py-2">Species</th>
              <th class="px-4 py-2">Revenue</th>
              <th class="px-4 py-2">Feed Cost</th>
              <th class="px-4 py-2">Profit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in speciesProfitability" :key="row.species" class="border-t border-[#eee5d6]">
              <td class="px-4 py-2 font-semibold text-zinc-800">{{ row.species }}</td>
              <td class="px-4 py-2">{{ fmtCurrency(row.revenue) }}</td>
              <td class="px-4 py-2">{{ fmtCurrency(row.feedCost) }}</td>
              <td class="px-4 py-2 font-semibold text-[#2f5736]">{{ fmtCurrency(row.profit) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="feedConversion.length" class="mt-6">
      <h3 class="text-xl font-bold text-zinc-800">Feed Conversion by Species</h3>
      <p class="mt-2 text-sm text-[#7a7467]">Estimated feed cost per output unit over the last 30 days.</p>
      <div class="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="row in feedConversion" :key="row.species" class="rounded-lg border-2 border-[#4b6c4e] bg-farm-panel p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-[#7a7467]">{{ row.species }}</p>
          <p class="mt-2 text-lg font-bold text-[#2f5736]">{{ fmtCurrency(row.costPerUnit) }} / {{ row.outputUnit }}</p>
          <p class="mt-1 text-xs text-[#7a7467]">Feed cost: {{ fmtCurrency(row.feedCost) }}</p>
          <p class="text-xs text-[#7a7467]">Output: {{ Number(row.outputAmount || 0).toFixed(1) }} {{ row.outputUnit }}</p>
        </article>
      </div>
    </section>

    <section v-if="aiSummary" class="mt-6">
      <h3 class="text-xl font-bold text-zinc-800">AI Success Rate (12 months)</h3>
      <div class="mt-3 grid gap-3 md:grid-cols-3">
        <article class="rounded-lg border-2 border-[#4b6c4e] bg-farm-panel p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-[#7a7467]">Success Rate</p>
          <p class="mt-2 text-2xl font-bold text-[#2f5736]">{{ Number(aiSummary.successRate || 0).toFixed(1) }}%</p>
        </article>
        <article class="rounded-lg border-2 border-[#4b6c4e] bg-farm-panel p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-[#7a7467]">AI Attempts</p>
          <p class="mt-2 text-2xl font-bold text-[#2f5736]">{{ aiSummary.total || 0 }}</p>
        </article>
        <article class="rounded-lg border-2 border-[#4b6c4e] bg-farm-panel p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-[#7a7467]">Successful</p>
          <p class="mt-2 text-2xl font-bold text-[#2f5736]">{{ aiSummary.success || 0 }}</p>
        </article>
      </div>
    </section>

    <section v-if="healthIncidents.length" class="mt-6">
      <h3 class="text-xl font-bold text-zinc-800">Health Incidents by Month</h3>
      <div class="mt-3 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <article v-for="row in healthIncidents" :key="row.month" class="rounded-lg border border-[#d8d2c6] bg-white/80 p-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-[#7a7467]">{{ row.month }}</p>
          <p class="mt-2 text-xl font-bold text-[#2f5736]">{{ row.count }}</p>
        </article>
      </div>
    </section>

    <div v-if="groupedInsights.length" class="mt-6 space-y-6">
      <section v-for="group in groupedInsights" :key="group.category">
        <h3 class="text-xl font-bold text-zinc-800">{{ group.category }}</h3>
        <div class="mt-3 grid gap-4 md:grid-cols-2">
          <article
            v-for="item in group.items"
            :key="item.title"
            class="rounded-lg border-2 bg-white/80 p-5"
            :class="severityClass(item.severity)"
          >
            <div class="flex items-center justify-between">
              <h4 class="text-lg font-bold text-zinc-800">{{ item.title }}</h4>
              <span class="rounded-full border border-[#d8d2c6] bg-white px-3 py-1 text-xs font-semibold text-[#7a7467]">
                {{ severityLabel(item.severity) }}
              </span>
            </div>
            <p class="mt-2 text-sm text-[#7a7467]">{{ item.detail }}</p>
            <div v-if="item.metrics" class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="(val, key) in item.metrics"
                :key="key"
                class="rounded-full border border-[#c6d2c8] bg-white/80 px-3 py-1 text-xs font-semibold text-[#2f5736]"
              >
                {{ metricLabel(key) }}: {{ formatMetricValue(key, val) }}
              </span>
            </div>
            <p v-if="item.action" class="mt-3 text-xs text-[#7a7467]">{{ item.action }}</p>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { apiGet } from '../services/api'
import { fmtCurrency } from '../utils/animal'

const summary = ref(null)
const insights = ref([])
const mlInsights = ref([])
const error = ref('')

const summaryCards = computed(() => {
  if (!summary.value) return []
  const animals = summary.value.animals || {}
  const finance = summary.value.finance || {}
  const feeding = summary.value.feeding || {}
  const production = summary.value.production || {}
  return [
    { label: 'Active Animals', value: animals.active ?? 0, note: `Attention ${Number(animals.attentionPct || 0).toFixed(1)}%` },
    { label: 'Monthly Profit', value: fmtCurrency(finance.profitMonth ?? 0), note: `Sales ${fmtCurrency(finance.salesMonth ?? 0)}` },
    { label: 'Feed Cost (30d)', value: fmtCurrency(feeding.cost ?? 0), note: `Top feed: ${feeding.topFeed || 'N/A'}` },
    { label: 'Production Value (30d)', value: fmtCurrency(production.value ?? 0), note: `Milk ${Number(production.milk || 0).toFixed(1)} L` }
  ]
})

const speciesProfitability = computed(() => summary.value?.speciesProfitability || [])
const feedConversion = computed(() => summary.value?.feedConversion || [])
const healthIncidents = computed(() => summary.value?.healthIncidents || [])
const aiSummary = computed(() => summary.value?.ai || null)

const groupedInsights = computed(() => {
  const all = [
    ...insights.value,
    ...mlInsights.value.map((item) => ({ ...item, category: 'Ration Insights' }))
  ]
  const map = new Map()
  for (const item of all) {
    const key = item.category || 'General'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(item)
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
})

const metricLabel = (key) => ({
  attention_rate: 'Attention %',
  active_animals: 'Active',
  vaccines_due: 'Vaccines Due',
  active: 'Active',
  on_heat: 'On Heat',
  births_next30: 'Births 30d',
  ai_recent30: 'AI 30d',
  hatch_rate: 'Hatch %',
  eggs_set: 'Eggs Set',
  log_coverage: 'Log Coverage %',
  feed_cost_ratio: 'Feed Cost %',
  feed_cost: 'Feed Cost',
  output_value: 'Output Value',
  profit: 'Profit',
  sales: 'Sales',
  expenses: 'Expenses',
  margin_pct: 'Margin %',
  corr_feed_milk: 'Feed vs Milk',
  corr_feed_value: 'Feed vs Value',
  value_per_cost: 'Value per Cost'
}[key] || key)

const formatMetricValue = (key, val) => {
  const num = Number(val || 0)
  if (['feed_cost', 'output_value', 'profit', 'sales', 'expenses'].includes(key)) {
    return fmtCurrency(num)
  }
  if (key.endsWith('_pct') || key.endsWith('_rate') || key.endsWith('_coverage') || key.endsWith('_ratio')) {
    return `${num.toFixed(1)}%`
  }
  if (key.startsWith('corr_')) return num.toFixed(2)
  if (key === 'value_per_cost') return num.toFixed(2)
  return Number.isFinite(num) ? num.toFixed(2) : String(val ?? '')
}

const severityLabel = (level) => ({
  good: 'Good',
  info: 'Info',
  warn: 'Watch',
  alert: 'Action'
}[level] || 'Info')

const severityClass = (level) => ({
  good: 'border-[#4b6c4e]',
  info: 'border-[#4b6c4e]',
  warn: 'border-[#e0b15a] bg-[#fff7e7]',
  alert: 'border-[#d26b6b] bg-[#fff2f2]'
}[level] || 'border-[#4b6c4e]')

onMounted(async () => {
  try {
    const data = await apiGet('/api/insights')
    summary.value = data.summary || null
    insights.value = Array.isArray(data.insights) ? data.insights : []
  } catch (err) {
    error.value = err?.message || 'Unable to load insights.'
  }

  try {
    const mlData = await apiGet('/api/ml/insights?days=90')
    mlInsights.value = Array.isArray(mlData.insights) ? mlData.insights : []
  } catch (err) {
    const msg = err?.message || 'ML service unavailable.'
    error.value = error.value ? `${error.value} ${msg}` : msg
  }
})
</script>
