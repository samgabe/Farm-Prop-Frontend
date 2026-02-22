<template>
  <section>
    <header>
        <h2 class="text-2xl font-bold text-zinc-800 md:text-3xl">Farm Overview</h2>
      <p class="mt-2 text-base text-[#7a7467]">{{ today }}</p>
    </header>

    <div class="mt-4 grid gap-4 lg:grid-cols-5">
      <article
        v-for="card in stats"
        :key="card.label"
        :class="[
          cardClass,
          toneClass(card.tone)
        ]"
      >
        <p class="text-sm font-semibold tracking-wide">{{ card.label }}</p>
        <h3 class="my-2 break-words text-2xl font-bold leading-tight md:text-3xl">{{ card.value }}</h3>
        <small class="block break-words text-xs">{{ card.note }}</small>
      </article>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article v-for="item in productSnapshot" :key="item.label" class="rounded-lg border-2 border-[#4b6c4e] bg-farm-panel p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-[#7a7467]">{{ item.note }}</p>
        <h3 class="mt-2 text-lg font-bold text-zinc-800">{{ item.label }}</h3>
        <p class="mt-1 text-2xl font-bold text-[#2f5736]">{{ item.value }}</p>
      </article>
    </div>

    <div v-if="milkVarieties.length" class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <article v-for="item in milkVarieties" :key="item.label" class="rounded-lg border border-[#d8d2c6] bg-white/70 p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-[#7a7467]">Milk variety</p>
        <h3 class="mt-2 text-base font-bold text-zinc-800">{{ item.label }}</h3>
        <p class="mt-1 text-lg font-bold text-[#2f5736]">{{ item.value }}</p>
      </article>
    </div>

    <section v-if="opsInsights.length" class="mt-8">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-2xl font-bold text-zinc-800 md:text-3xl">Operational Insights</h3>
        <RouterLink
          to="/insights"
          class="rounded-full border border-[#4b6c4e] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#2f5736]"
        >
          View all insights
        </RouterLink>
      </div>
      <div class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="item in opsInsights" :key="item.title" class="rounded-lg border-2 border-[#4b6c4e] bg-farm-panel p-5">
          <h4 class="text-lg font-bold text-zinc-800">{{ item.title }}</h4>
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

    <section v-if="mlInsights.length || mlSummary || mlError" class="mt-8">
      <h3 class="text-2xl font-bold text-zinc-800 md:text-3xl">Ration Insights</h3>
      <p class="mt-2 text-sm text-[#7a7467]">Signals derived from feeding and production logs.</p>

      <p v-if="mlError" class="mt-3 rounded-md border border-[#f0c9c9] bg-[#fff3f3] px-3 py-2 text-sm text-[#7b3b3b]">
        ML service unavailable: {{ mlError }}
      </p>

      <div v-if="mlSummaryCards.length" class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in mlSummaryCards"
          :key="card.label"
          class="rounded-lg border border-[#d8d2c6] bg-white/80 p-4"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-[#7a7467]">{{ card.label }}</p>
          <p class="mt-2 text-xl font-bold text-[#2f5736]">{{ card.value }}</p>
        </article>
      </div>

      <div v-if="mlInsights.length" class="mt-4 grid gap-4 md:grid-cols-2">
        <article v-for="item in mlInsights" :key="item.title" class="rounded-lg border-2 border-[#4b6c4e] bg-farm-panel p-5">
          <h4 class="text-lg font-bold text-zinc-800">{{ item.title }}</h4>
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

    <h3 class="mb-3 mt-8 text-2xl font-bold text-zinc-800 md:text-3xl">Species Profile</h3>
    <div class="grid gap-4 md:grid-cols-2">
      <article v-for="item in profileBreakdown" :key="item.profile" class="rounded-lg border-2 border-[#4b6c4e] bg-farm-panel p-5">
        <strong class="text-base">{{ item.profile }}</strong>
        <div class="mt-3 flex items-center justify-between text-sm text-[#7a7467]">
          <span>Total</span>
          <span class="font-semibold text-zinc-800">{{ item.count }}</span>
        </div>
        <div class="mt-2 flex items-center justify-between text-sm text-[#7a7467]">
          <span>Needs attention</span>
          <span class="font-semibold text-farm-red">{{ item.attention }}</span>
        </div>
      </article>
    </div>

    <h3 class="mb-3 mt-8 text-2xl font-bold text-zinc-800 md:text-3xl">Livestock Distribution</h3>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <article v-for="item in distribution" :key="item.type" class="rounded-lg border-2 border-[#4b6c4e] bg-farm-panel p-5 text-center">
        <component :is="item.icon" class="mx-auto h-9 w-9" />
        <strong class="mt-2 block break-words text-base">{{ item.type }}</strong>
        <h3 class="my-2 break-words text-3xl font-bold text-[#2f5736]">{{ item.count }}</h3>
        <small class="break-words text-xs text-[#7a7467]">{{ item.status }}</small>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { apiGet } from '../services/api'
import { fmtCurrency } from '../utils/animal'
import { animalIcon } from '../utils/icons'
import { getSpeciesProfile } from '../utils/species'

const stats = ref([])
const distribution = ref([])
const profileBreakdown = ref([])
const productSnapshot = ref([])
const milkVarieties = ref([])
const opsInsights = ref([])
const mlInsights = ref([])
const mlSummary = ref(null)
const mlError = ref('')

const cardClass =
  'rounded-lg p-4 md:p-5 shadow-[0_4px_0_rgba(0,0,0,0.12)] overflow-hidden bg-[length:20px_20px] bg-[linear-gradient(135deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,transparent_75%,transparent)]'

const toneClass = (tone) => ({
  green: 'bg-farm-green text-white',
  gold: 'bg-farm-gold text-zinc-800',
  orange: 'bg-farm-orange text-white',
  red: 'bg-farm-red text-white'
}[tone] || 'bg-farm-green text-white')

const today = computed(() =>
  new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const mlSummaryCards = computed(() => {
  if (!mlSummary.value) return []
  const summary = mlSummary.value
  return [
    { label: 'Weeks Analyzed', value: summary.weeks ?? 0 },
    { label: 'Feed Cost', value: fmtCurrency(summary.total_feed_cost ?? 0) },
    { label: 'Total Value', value: fmtCurrency(summary.total_value ?? 0) },
    { label: 'Milk Output', value: `${Number(summary.total_milk ?? 0).toFixed(1)} L` }
  ]
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

onMounted(async () => {
  const [dashboard, production, insightsData] = await Promise.all([
    apiGet('/api/dashboard'),
    apiGet('/api/production/summary'),
    apiGet('/api/insights').catch(() => null)
  ])

  stats.value = [
    { label: 'Total Animals', value: dashboard.totalAnimals, note: 'Across all types', tone: 'green' },
    { label: 'Sick Animals', value: dashboard.sickAnimals, note: 'Need attention', tone: 'red' },
    { label: 'Upcoming Vaccines', value: dashboard.upcomingVaccinations, note: 'Next 7 days', tone: 'orange' },
    { label: 'Gross Revenue', value: fmtCurrency(dashboard.monthlyGrossRevenue ?? dashboard.monthlyRevenue), note: 'Current month', tone: 'gold' },
    { label: 'VAT Collected', value: fmtCurrency(dashboard.monthlyVATCollected), note: 'Current month', tone: 'green' }
  ]

  const counts = Array.isArray(dashboard.animalTypeCounts) ? dashboard.animalTypeCounts : []
  const attention = Array.isArray(dashboard.animalTypeAttention) ? dashboard.animalTypeAttention : []
  const attentionMap = attention.reduce((acc, row) => {
    acc[String(row.type || '')] = Number(row.count || 0)
    return acc
  }, {})

  distribution.value = counts.map((row) => ({
    type: row.type,
    icon: animalIcon(row.type),
    count: row.count,
    status: attentionMap[String(row.type || '')] > 0 ? 'Attention' : 'Healthy'
  }))

  const profileCounts = counts.reduce(
    (acc, row) => {
      const profile = getSpeciesProfile(row.type)
      acc[profile] = acc[profile] || { profile, count: 0, attention: 0 }
      acc[profile].count += Number(row.count || 0)
      acc[profile].attention += attentionMap[String(row.type || '')] || 0
      return acc
    },
    {}
  )

  profileBreakdown.value = Object.values(profileCounts).map((p) => ({
    profile: p.profile === 'poultry' ? 'Poultry' : 'Mammals',
    count: p.count,
    attention: p.attention
  }))

  const milkTotal = Number((production.weeklyMilkTotal ?? production.weeklyMilk) || 0)
  productSnapshot.value = [
    { label: 'Milk', value: `${milkTotal.toFixed(1)} L`, note: 'Mammal products' },
    { label: 'Eggs', value: `${Number(production.weeklyEggs || 0).toFixed(0)} pcs`, note: 'Poultry products' },
    { label: 'Wool', value: `${Number(production.weeklyWool || 0).toFixed(1)} kg`, note: 'Mammal products' },
    { label: 'Meat', value: `${Number(production.weeklyMeat || 0).toFixed(1)} kg`, note: 'All species' }
  ]

  milkVarieties.value = [
    { label: 'Cow', liters: Number(production.weeklyMilkCow || 0) },
    { label: 'Goat', liters: Number(production.weeklyMilkGoat || 0) }
  ]
    .filter((item) => item.liters > 0)
    .map((item) => ({ label: item.label, value: `${item.liters.toFixed(1)} L` }))

  if (insightsData && Array.isArray(insightsData.insights)) {
    opsInsights.value = insightsData.insights.slice(0, 3)
  }

  try {
    const mlData = await apiGet('/api/ml/insights?days=90')
    mlInsights.value = Array.isArray(mlData.insights) ? mlData.insights : []
    mlSummary.value = mlData.summary || null
  } catch (err) {
    mlError.value = err?.message || 'Unable to load insights'
  }
})
</script>
