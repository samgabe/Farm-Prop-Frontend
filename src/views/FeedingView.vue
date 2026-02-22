<template>
  <section class="min-w-0">
    <header class="flex flex-col justify-between gap-3 md:flex-row md:items-start">
      <div>
        <h2 class="text-2xl font-bold text-zinc-800 md:text-3xl">Feeding Management</h2>
        <p class="mt-2 text-base text-[#7a7467]">Track feed usage and costs</p>
      </div>
      <button v-if="canWrite" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" @click="openCreateModal">
        + Add Feeding Record
      </button>
    </header>

    <div class="mt-4 grid gap-3 md:grid-cols-[1fr_120px]">
      <input v-model="query" type="text" placeholder="Search feed, supplier, animal tag..." class="w-full rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" @keyup.enter="loadData(1)" />
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

    <h3 class="mb-3 mt-8 text-2xl font-bold text-zinc-800 md:text-3xl">Feeding Ledger</h3>
    <div class="grid gap-3 md:hidden">
      <article v-if="!ledger.length" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 text-center text-[#7a7467]">
        No feeding records yet.
      </article>
      <article v-for="row in ledger" :key="`mobile-${row.date}-${row.feedType}-${row.animalTag}`" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm text-[#7a7467]">{{ row.date }}</p>
            <h4 class="font-bold text-zinc-800">{{ row.feedType }}</h4>
          </div>
          <p class="font-bold text-farm-green">{{ row.cost }}</p>
        </div>
        <div class="mt-2 grid gap-1 text-sm text-zinc-700">
          <p><span class="font-semibold">Animal:</span> {{ row.animalTag || 'Group' }}</p>
          <p><span class="font-semibold">Quantity:</span> {{ row.quantity }}</p>
          <p><span class="font-semibold">Supplier:</span> {{ row.supplier || 'N/A' }}</p>
          <p v-if="row.rationName"><span class="font-semibold">Ration:</span> {{ row.rationName }}</p>
        </div>
        <div v-if="canWrite" class="mt-3 flex flex-wrap gap-2">
          <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditModal(row)">Edit</button>
          <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="deleteRecord(row)">Delete</button>
        </div>
      </article>
      <article class="rounded-lg border border-[#ddd8ce] bg-farm-gold p-4 font-bold text-zinc-800">
        Total Feed Cost: {{ totalCost }}
      </article>
    </div>

    <div class="hidden overflow-x-auto rounded-lg border border-[#ddd8ce] bg-farm-panel shadow-sm md:block">
      <table class="w-full min-w-[1080px] border-collapse">
        <thead class="bg-farm-green text-white">
          <tr>
            <th class="px-4 py-3 text-left text-sm">Date</th>
            <th class="px-4 py-3 text-left text-sm">Animal</th>
            <th class="px-4 py-3 text-left text-sm">Feed Type</th>
            <th class="px-4 py-3 text-left text-sm">Quantity</th>
            <th class="px-4 py-3 text-left text-sm">Supplier</th>
            <th class="px-4 py-3 text-left text-sm">Ration</th>
            <th class="px-4 py-3 text-left text-sm">Cost</th>
            <th v-if="canWrite" class="px-4 py-3 text-right text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!ledger.length">
            <td :colspan="canWrite ? 8 : 7" class="px-4 py-8 text-center text-[#7a7467]">No feeding records yet.</td>
          </tr>
          <tr v-for="row in ledger" :key="row.id" class="border-t border-[#ddd8ce]">
            <td class="px-4 py-3">{{ row.date }}</td>
            <td class="px-4 py-3"><span class="inline-block rounded-full bg-farm-gold px-3 py-1 text-xs font-bold">{{ row.animalTag || 'Group' }}</span></td>
            <td class="px-4 py-3">{{ row.feedType }}</td>
            <td class="px-4 py-3">{{ row.quantity }}</td>
            <td class="px-4 py-3">{{ row.supplier || 'N/A' }}</td>
            <td class="px-4 py-3">{{ row.rationName || 'N/A' }}</td>
            <td class="px-4 py-3 font-bold text-farm-green">{{ row.cost }}</td>
            <td v-if="canWrite" class="px-4 py-3 text-right">
              <div class="inline-flex flex-wrap justify-end gap-2">
                <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditModal(row)">Edit</button>
                <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="deleteRecord(row)">Delete</button>
              </div>
            </td>
          </tr>
          <tr class="bg-farm-gold font-bold text-zinc-800">
            <td class="px-4 py-3">TOTAL COST</td>
            <td class="px-4 py-3"></td>
            <td class="px-4 py-3"></td>
            <td class="px-4 py-3"></td>
            <td class="px-4 py-3"></td>
            <td class="px-4 py-3"></td>
            <td class="px-4 py-3">{{ totalCost }}</td>
            <td v-if="canWrite" class="px-4 py-3"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="mb-3 mt-8 text-2xl font-bold text-zinc-800 md:text-3xl">Feeding Rations</h3>
    <div class="mb-3 flex justify-end">
      <button v-if="canWrite" class="rounded-lg border border-[#cec7b8] px-4 py-2 text-sm" @click="openRationModal">
        + Add Ration
      </button>
    </div>
    <div class="grid gap-3 md:hidden">
      <article v-if="!rations.length" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 text-center text-[#7a7467]">
        No rations yet.
      </article>
      <article v-for="ration in rations" :key="`ration-${ration.id}`" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="font-bold text-zinc-800">{{ ration.name }}</h4>
            <p class="text-xs text-[#7a7467]">{{ ration.species || 'All species' }} · {{ ration.state || 'Any state' }}</p>
          </div>
        </div>
        <div class="mt-2 text-sm text-zinc-700">
          <p><span class="font-semibold">Items:</span> {{ ration.itemsSummary || 'None' }}</p>
        </div>
        <div v-if="canWrite" class="mt-3 flex flex-wrap gap-2">
          <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditRationModal(ration)">Edit</button>
          <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="askDeleteRation(ration)">Delete</button>
        </div>
      </article>
    </div>
    <div class="hidden overflow-x-auto rounded-lg border border-[#ddd8ce] bg-farm-panel shadow-sm md:block">
      <table class="w-full min-w-[980px] border-collapse">
        <thead class="bg-farm-green text-white">
          <tr>
            <th class="px-4 py-3 text-left text-sm">Name</th>
            <th class="px-4 py-3 text-left text-sm">Species</th>
            <th class="px-4 py-3 text-left text-sm">State</th>
            <th class="px-4 py-3 text-left text-sm">Items</th>
            <th v-if="canWrite" class="px-4 py-3 text-right text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rations.length">
            <td :colspan="canWrite ? 5 : 4" class="px-4 py-8 text-center text-[#7a7467]">No rations yet.</td>
          </tr>
          <tr v-for="ration in rations" :key="ration.id" class="border-t border-[#ddd8ce]">
            <td class="px-4 py-3 font-semibold">{{ ration.name }}</td>
            <td class="px-4 py-3">{{ ration.species || 'All' }}</td>
            <td class="px-4 py-3">{{ ration.state || 'Any' }}</td>
            <td class="px-4 py-3 text-sm text-[#6f6758]">{{ ration.itemsSummary || 'None' }}</td>
            <td v-if="canWrite" class="px-4 py-3 text-right">
              <div class="inline-flex flex-wrap justify-end gap-2">
                <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditRationModal(ration)">Edit</button>
                <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="askDeleteRation(ration)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="mb-3 mt-8 text-2xl font-bold text-zinc-800 md:text-3xl">Feeding Plans</h3>
    <div class="mb-3 flex justify-end">
      <button v-if="canWrite" class="rounded-lg border border-[#cec7b8] px-4 py-2 text-sm" @click="openPlanModal">
        + Add Plan
      </button>
    </div>
    <div class="grid gap-3 md:hidden">
      <article v-if="!plans.length" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 text-center text-[#7a7467]">
        No feeding plans yet.
      </article>
      <article v-for="plan in plans" :key="`plan-${plan.id}`" class="rounded-lg border border-[#ddd8ce] bg-farm-panel p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="font-bold text-zinc-800">{{ plan.animalTag || 'Group' }}</h4>
            <p class="text-xs text-[#7a7467]">{{ plan.rationName || 'No ration' }} · {{ plan.state || 'Any state' }}</p>
          </div>
          <span class="rounded-full bg-farm-gold px-3 py-1 text-xs font-semibold text-zinc-800">{{ plan.status }}</span>
        </div>
        <div class="mt-2 text-sm text-zinc-700">
          <p><span class="font-semibold">Daily:</span> {{ plan.dailyQuantity }}</p>
          <p><span class="font-semibold">Period:</span> {{ plan.startDate }} {{ plan.endDate ? '→ ' + plan.endDate : '' }}</p>
        </div>
        <div v-if="canWrite" class="mt-3 flex flex-wrap gap-2">
          <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditPlanModal(plan)">Edit</button>
          <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="askDeletePlan(plan)">Delete</button>
        </div>
      </article>
    </div>
    <div class="hidden overflow-x-auto rounded-lg border border-[#ddd8ce] bg-farm-panel shadow-sm md:block">
      <table class="w-full min-w-[980px] border-collapse">
        <thead class="bg-farm-green text-white">
          <tr>
            <th class="px-4 py-3 text-left text-sm">Animal</th>
            <th class="px-4 py-3 text-left text-sm">Ration</th>
            <th class="px-4 py-3 text-left text-sm">State</th>
            <th class="px-4 py-3 text-left text-sm">Daily Qty</th>
            <th class="px-4 py-3 text-left text-sm">Period</th>
            <th class="px-4 py-3 text-left text-sm">Status</th>
            <th v-if="canWrite" class="px-4 py-3 text-right text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!plans.length">
            <td :colspan="canWrite ? 7 : 6" class="px-4 py-8 text-center text-[#7a7467]">No feeding plans yet.</td>
          </tr>
          <tr v-for="plan in plans" :key="plan.id" class="border-t border-[#ddd8ce]">
            <td class="px-4 py-3">{{ plan.animalTag || 'Group' }}</td>
            <td class="px-4 py-3">{{ plan.rationName || 'N/A' }}</td>
            <td class="px-4 py-3">{{ plan.state || 'Any' }}</td>
            <td class="px-4 py-3">{{ plan.dailyQuantity }}</td>
            <td class="px-4 py-3">{{ plan.startDate }}{{ plan.endDate ? ' → ' + plan.endDate : '' }}</td>
            <td class="px-4 py-3"><span class="inline-block rounded-full bg-farm-gold px-3 py-1 text-xs font-semibold text-zinc-800">{{ plan.status }}</span></td>
            <td v-if="canWrite" class="px-4 py-3 text-right">
              <div class="inline-flex flex-wrap justify-end gap-2">
                <button class="rounded-md border border-[#cec7b8] px-3 py-1 text-sm" @click="openEditPlanModal(plan)">Edit</button>
                <button class="rounded-md border border-farm-red px-3 py-1 text-sm text-farm-red" @click="askDeletePlan(plan)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :open="modalOpen" :title="modalMode === 'create' ? 'Add Feeding Record' : 'Edit Feeding Record'" @close="closeModal">
      <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submitModal">
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Date</label>
          <input v-model="form.date" type="date" required class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1 md:col-span-2">
          <label class="text-sm font-semibold text-zinc-700">Animal Tag (optional)</label>
          <div class="relative">
            <input
              :value="animalTagQuery"
              placeholder="Search animal tag"
              class="w-full rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3"
              @input="onAnimalTagInput($event.target.value)"
              @focus="animalDropdownOpen = true"
              @blur="closeAnimalDropdown"
            />
            <div v-if="animalDropdownOpen && filteredAnimalTags.length" class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[#cec7b8] bg-white shadow">
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
          <label class="text-sm font-semibold text-zinc-700">Feed Type</label>
          <input v-model.trim="form.feedType" required placeholder="Dairy meal" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Ration (optional)</label>
          <select v-model.number="form.rationId" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3">
            <option :value="0">Select ration</option>
            <option v-for="ration in rations" :key="ration.id" :value="ration.id">{{ ration.name }}</option>
          </select>
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Plan (optional)</label>
          <select v-model.number="form.planId" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3">
            <option :value="0">Select plan</option>
            <option v-for="plan in plans" :key="plan.id" :value="plan.id">
              {{ plan.animalTag || 'Group' }} · {{ plan.rationName || 'No ration' }}
            </option>
          </select>
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Quantity</label>
          <input v-model.number="form.quantityValue" type="number" min="0" step="0.01" required placeholder="0.00" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Unit</label>
          <input v-model.trim="form.quantityUnit" required placeholder="kg" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Supplier</label>
          <input v-model.trim="form.supplier" placeholder="Optional supplier" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Cost</label>
          <input v-model.number="form.cost" type="number" min="0" step="0.01" required placeholder="0.00" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1 md:col-span-2">
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

    <ConfirmModal :open="confirmOpen" title="Delete Feeding Record" :message="`Delete feeding record ${pendingDelete?.feedType || ''}?`" confirm-text="Delete" @cancel="confirmOpen = false" @confirm="confirmDeleteRecord" />

    <BaseModal :open="rationModalOpen" :title="rationModalMode === 'create' ? 'Add Ration' : 'Edit Ration'" @close="closeRationModal">
      <form class="grid gap-3" @submit.prevent="submitRationModal">
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Name</label>
          <input v-model.trim="rationForm.name" required placeholder="Lactating Dairy Mix" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Species</label>
          <input v-model.trim="rationForm.species" placeholder="Cattle" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">State</label>
          <input v-model.trim="rationForm.state" placeholder="Lactating" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Notes</label>
          <input v-model.trim="rationForm.notes" placeholder="Optional notes" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-semibold text-zinc-700">Ration Items</label>
            <button type="button" class="rounded-md border border-[#cec7b8] px-3 py-1 text-xs" @click="addRationItem">+ Add Item</button>
          </div>
          <div v-for="(item, idx) in rationForm.items" :key="`item-${idx}`" class="grid gap-2 md:grid-cols-[2fr_1fr_1fr_auto]">
            <input v-model.trim="item.ingredient" placeholder="Ingredient" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-2" />
            <input v-model.number="item.quantity" type="number" min="0" step="0.01" placeholder="0.00" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-2" />
            <input v-model.trim="item.unit" placeholder="kg" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-2" />
            <button type="button" class="rounded-md border border-farm-red px-3 py-2 text-xs text-farm-red" @click="removeRationItem(idx)">Remove</button>
          </div>
        </div>
        <div class="space-y-3">
          <ul v-if="rationErrors.length" class="rounded-lg border border-farm-red/30 bg-[#fff4f3] p-3">
            <li v-for="issue in rationErrors" :key="issue" class="ml-5 list-disc text-sm font-semibold text-farm-red">{{ issue }}</li>
          </ul>
          <p v-if="rationError" class="font-semibold text-farm-red">{{ rationError }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-5 py-3 font-semibold text-zinc-800" :disabled="rationSaving" @click="closeRationModal">Cancel</button>
            <button type="submit" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" :disabled="rationSaving">
              {{ rationSaving ? 'Saving...' : (rationModalMode === 'create' ? 'Create Ration' : 'Save Changes') }}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>

    <BaseModal :open="planModalOpen" :title="planModalMode === 'create' ? 'Add Feeding Plan' : 'Edit Feeding Plan'" @close="closePlanModal">
      <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submitPlanModal">
        <div class="grid gap-1 md:col-span-2">
          <label class="text-sm font-semibold text-zinc-700">Animal Tag (optional)</label>
          <div class="relative">
            <input
              :value="planAnimalTagQuery"
              placeholder="Search animal tag"
              class="w-full rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3"
              @input="onPlanAnimalTagInput($event.target.value)"
              @focus="planAnimalDropdownOpen = true"
              @blur="closePlanAnimalDropdown"
            />
            <div v-if="planAnimalDropdownOpen && filteredPlanAnimalTags.length" class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[#cec7b8] bg-white shadow">
              <button
                v-for="tag in filteredPlanAnimalTags"
                :key="`plan-${tag}`"
                type="button"
                class="block w-full px-3 py-2 text-left text-sm hover:bg-[#f1eee6]"
                @mousedown.prevent="selectPlanAnimalTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Ration</label>
          <select v-model.number="planForm.rationId" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3">
            <option :value="0">Select ration</option>
            <option v-for="ration in rations" :key="ration.id" :value="ration.id">{{ ration.name }}</option>
          </select>
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Animal State</label>
          <input v-model.trim="planForm.state" placeholder="Lactating" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Daily Quantity</label>
          <input v-model.number="planForm.dailyQuantityValue" type="number" min="0" step="0.01" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Unit</label>
          <input v-model.trim="planForm.dailyQuantityUnit" placeholder="kg" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Start Date</label>
          <input v-model="planForm.startDate" type="date" required class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">End Date</label>
          <input v-model="planForm.endDate" type="date" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="grid gap-1">
          <label class="text-sm font-semibold text-zinc-700">Status</label>
          <select v-model="planForm.status" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3">
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="completed">completed</option>
          </select>
        </div>
        <div class="grid gap-1 md:col-span-2">
          <label class="text-sm font-semibold text-zinc-700">Notes</label>
          <input v-model.trim="planForm.notes" placeholder="Optional notes" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-3 py-3" />
        </div>
        <div class="md:col-span-2 space-y-3">
          <ul v-if="planErrors.length" class="rounded-lg border border-farm-red/30 bg-[#fff4f3] p-3">
            <li v-for="issue in planErrors" :key="issue" class="ml-5 list-disc text-sm font-semibold text-farm-red">{{ issue }}</li>
          </ul>
          <p v-if="planError" class="font-semibold text-farm-red">{{ planError }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="rounded-lg border border-[#cec7b8] bg-[#f5f2eb] px-5 py-3 font-semibold text-zinc-800" :disabled="planSaving" @click="closePlanModal">Cancel</button>
            <button type="submit" class="rounded-lg bg-farm-green px-5 py-3 font-semibold text-white" :disabled="planSaving">
              {{ planSaving ? 'Saving...' : (planModalMode === 'create' ? 'Create Plan' : 'Save Changes') }}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>

    <ConfirmModal :open="rationConfirmOpen" title="Delete Ration" :message="`Delete ration ${pendingRation?.name || ''}?`" confirm-text="Delete" @cancel="rationConfirmOpen = false" @confirm="confirmDeleteRation" />
    <ConfirmModal :open="planConfirmOpen" title="Delete Plan" :message="`Delete feeding plan ${pendingPlan?.animalTag || ''}?`" confirm-text="Delete" @cancel="planConfirmOpen = false" @confirm="confirmDeletePlan" />
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
const summary = ref({ totalCost: 0, dailyAverage: 0, topFeed: '-', topCost: 0 })
const ledger = ref([])
const rations = ref([])
const plans = ref([])
const modalOpen = ref(false)
const modalMode = ref('create')
const confirmOpen = ref(false)
const pendingDelete = ref(null)
const rationModalOpen = ref(false)
const rationModalMode = ref('create')
const rationSaving = ref(false)
const rationError = ref('')
const rationErrors = ref([])
const pendingRation = ref(null)
const rationConfirmOpen = ref(false)
const planModalOpen = ref(false)
const planModalMode = ref('create')
const planSaving = ref(false)
const planError = ref('')
const planErrors = ref([])
const pendingPlan = ref(null)
const planConfirmOpen = ref(false)
const saving = ref(false)
const error = ref('')
const fieldErrors = ref([])
const selectedId = ref(null)
const query = ref('')
const page = ref(1)
const totalCount = ref(0)
const pageSize = ref(10)
const animalTags = ref([])
const animalTagQuery = ref('')
const animalDropdownOpen = ref(false)
const planAnimalTagQuery = ref('')
const planAnimalDropdownOpen = ref(false)
const form = ref({
  date: '',
  animalTagId: '',
  rationId: 0,
  planId: 0,
  feedType: '',
  quantityValue: 0,
  quantityUnit: 'kg',
  supplier: '',
  cost: 0,
  notes: ''
})
const rationForm = ref({
  name: '',
  species: '',
  state: '',
  notes: '',
  items: [{ ingredient: '', quantity: 0, unit: 'kg' }]
})
const planForm = ref({
  animalTagId: '',
  rationId: 0,
  state: '',
  dailyQuantityValue: 0,
  dailyQuantityUnit: 'kg',
  startDate: '',
  endDate: '',
  status: 'active',
  notes: ''
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
  { label: 'Feed Cost (Month)', value: fmtCurrency(summary.value.totalCost), note: 'Current month', tone: 'green' },
  { label: 'Daily Average', value: fmtCurrency(summary.value.dailyAverage), note: 'Per day', tone: 'gold' },
  { label: 'Top Feed', value: summary.value.topFeed || '-', note: fmtCurrency(summary.value.topCost), tone: 'orange' }
])

const totalCost = computed(() => fmtCurrency(summary.value.totalCost))
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const canWrite = computed(() => hasActionAccess(auth.role || auth.user?.role || '', 'feeding.write'))
const filteredAnimalTags = computed(() => {
  const q = String(animalTagQuery.value || '').trim().toUpperCase()
  const pool = animalTags.value
  return (q ? pool.filter((tag) => tag.includes(q)) : pool).slice(0, 10)
})
const filteredPlanAnimalTags = computed(() => {
  const q = String(planAnimalTagQuery.value || '').trim().toUpperCase()
  const pool = animalTags.value
  return (q ? pool.filter((tag) => tag.includes(q)) : pool).slice(0, 10)
})

async function loadData(nextPage = page.value) {
  const [sum, items, animals, rationRes, planRes] = await Promise.all([
    apiGet('/api/feeding/summary'),
    apiGet(`/api/feeding?q=${encodeURIComponent(query.value || '')}&page=${nextPage}&pageSize=${pageSize.value}`),
    apiGet('/api/animals?page=1&pageSize=200'),
    apiGet('/api/feeding/rations?page=1&pageSize=200'),
    apiGet('/api/feeding/plans?page=1&pageSize=200')
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
  const animalList = Array.isArray(animals) ? animals : (animals.items || [])
  animalTags.value = animalList.filter((a) => String(a.status || '').toLowerCase() === 'active').map((a) => a.tagId).filter(Boolean)
  const rationList = Array.isArray(rationRes) ? rationRes : (rationRes.items || [])
  rations.value = rationList.map((r) => ({
    ...r,
    itemsSummary: Array.isArray(r.items) && r.items.length
      ? r.items.map((i) => `${i.ingredient} ${i.quantity}${i.unit ? ' ' + i.unit : ''}`).join(', ')
      : ''
  }))
  const planList = Array.isArray(planRes) ? planRes : (planRes.items || [])
  plans.value = planList
}

async function createRecord() {
  await apiPost('/api/feeding', form.value)
}

async function updateRecord() {
  await apiPut(`/api/feeding/${selectedId.value}`, form.value)
}

function resetForm() {
  form.value = { date: '', animalTagId: '', rationId: 0, planId: 0, feedType: '', quantityValue: 0, quantityUnit: 'kg', supplier: '', cost: 0, notes: '' }
  animalTagQuery.value = ''
  animalDropdownOpen.value = false
  fieldErrors.value = []
}

function openCreateModal() {
  if (!canWrite.value) return
  resetForm()
  error.value = ''
  modalMode.value = 'create'
  selectedId.value = null
  modalOpen.value = true
}

function openEditModal(row) {
  if (!canWrite.value) return
  error.value = ''
  fieldErrors.value = []
  modalMode.value = 'edit'
  selectedId.value = row.id
  form.value = {
    date: row.dateRaw,
    animalTagId: row.animalTag || '',
    rationId: row.rationId || 0,
    planId: row.planId || 0,
    feedType: row.feedType,
    quantityValue: row.quantityValue,
    quantityUnit: row.quantityUnit,
    supplier: row.supplier || '',
    cost: row.costRaw,
    notes: row.notes || ''
  }
  animalTagQuery.value = row.animalTag || ''
  animalDropdownOpen.value = false
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  error.value = ''
  fieldErrors.value = []
}

function onAnimalTagInput(v) {
  const normalized = String(v || '').toUpperCase().replace(/[^A-Z0-9-]/g, '')
  animalTagQuery.value = normalized
  form.value.animalTagId = normalized
  animalDropdownOpen.value = true
}

function selectAnimalTag(tag) {
  animalTagQuery.value = tag
  form.value.animalTagId = tag
  animalDropdownOpen.value = false
}

function closeAnimalDropdown() {
  setTimeout(() => {
    animalDropdownOpen.value = false
  }, 120)
}

function onPlanAnimalTagInput(v) {
  const normalized = String(v || '').toUpperCase().replace(/[^A-Z0-9-]/g, '')
  planAnimalTagQuery.value = normalized
  planForm.value.animalTagId = normalized
  planAnimalDropdownOpen.value = true
}

function selectPlanAnimalTag(tag) {
  planAnimalTagQuery.value = tag
  planForm.value.animalTagId = tag
  planAnimalDropdownOpen.value = false
}

function closePlanAnimalDropdown() {
  setTimeout(() => {
    planAnimalDropdownOpen.value = false
  }, 120)
}

function validateForm() {
  const issues = []
  if (!form.value.date) issues.push('Date is required.')
  if (!String(form.value.feedType || '').trim()) issues.push('Feed type is required.')
  if (form.value.quantityValue < 0) issues.push('Quantity cannot be negative.')
  if (!String(form.value.quantityUnit || '').trim()) issues.push('Unit is required.')
  if (form.value.cost < 0) issues.push('Cost cannot be negative.')
  if (String(form.value.animalTagId || '').trim() && !/^[A-Z0-9-]{2,24}$/.test(String(form.value.animalTagId || '').trim().toUpperCase())) {
    issues.push('Animal tag must be 2-24 chars (A-Z, 0-9, hyphen).')
  }
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
    if (form.value.planId && !form.value.rationId) {
      const selectedPlan = plans.value.find((p) => Number(p.id) === Number(form.value.planId))
      if (selectedPlan && selectedPlan.rationId) {
        form.value.rationId = Number(selectedPlan.rationId)
      }
    }
    if (modalMode.value === 'create') await createRecord()
    else await updateRecord()
    await loadData()
    closeModal()
  } catch (err) {
    error.value = err.message || 'Failed to save feeding record'
  } finally {
    saving.value = false
  }
}

async function deleteRecord(row) {
  if (!canWrite.value) return
  pendingDelete.value = row
  confirmOpen.value = true
}

async function confirmDeleteRecord() {
  if (!pendingDelete.value) return
  try {
    await apiDelete(`/api/feeding/${pendingDelete.value.id}`)
    confirmOpen.value = false
    pendingDelete.value = null
    await loadData()
  } catch (err) {
    error.value = err.message || 'Failed to delete feeding record'
  }
}

function openRationModal() {
  if (!canWrite.value) return
  rationForm.value = { name: '', species: '', state: '', notes: '', items: [{ ingredient: '', quantity: 0, unit: 'kg' }] }
  rationErrors.value = []
  rationError.value = ''
  rationModalMode.value = 'create'
  pendingRation.value = null
  rationModalOpen.value = true
}

function openEditRationModal(ration) {
  if (!canWrite.value) return
  rationForm.value = {
    name: ration.name,
    species: ration.species || '',
    state: ration.state || '',
    notes: ration.notes || '',
    items: (ration.items || []).map((i) => ({ ingredient: i.ingredient, quantity: i.quantity, unit: i.unit || 'kg' }))
  }
  if (rationForm.value.items.length === 0) {
    rationForm.value.items = [{ ingredient: '', quantity: 0, unit: 'kg' }]
  }
  rationErrors.value = []
  rationError.value = ''
  rationModalMode.value = 'edit'
  pendingRation.value = ration
  rationModalOpen.value = true
}

function closeRationModal() {
  rationModalOpen.value = false
  rationError.value = ''
  rationErrors.value = []
}

function addRationItem() {
  rationForm.value.items.push({ ingredient: '', quantity: 0, unit: 'kg' })
}

function removeRationItem(idx) {
  rationForm.value.items.splice(idx, 1)
}

function validateRation() {
  const issues = []
  if (!String(rationForm.value.name || '').trim()) issues.push('Name is required.')
  rationForm.value.items.forEach((item) => {
    if (item.quantity < 0) issues.push('Ration item quantity must be non-negative.')
  })
  rationErrors.value = issues
  return issues.length === 0
}

async function submitRationModal() {
  if (!canWrite.value) return
  if (!validateRation()) return
  rationError.value = ''
  rationSaving.value = true
  try {
    const payload = {
      name: String(rationForm.value.name || '').trim(),
      species: String(rationForm.value.species || '').trim(),
      state: String(rationForm.value.state || '').trim(),
      notes: String(rationForm.value.notes || '').trim(),
      items: rationForm.value.items.filter((i) => String(i.ingredient || '').trim())
    }
    if (rationModalMode.value === 'create') {
      await apiPost('/api/feeding/rations', payload)
    } else if (pendingRation.value) {
      await apiPut(`/api/feeding/rations/${pendingRation.value.id}`, payload)
    }
    await loadData()
    closeRationModal()
  } catch (err) {
    rationError.value = err.message || 'Failed to save ration'
  } finally {
    rationSaving.value = false
  }
}

function askDeleteRation(ration) {
  if (!canWrite.value) return
  pendingRation.value = ration
  rationConfirmOpen.value = true
}

async function confirmDeleteRation() {
  if (!pendingRation.value) return
  try {
    await apiDelete(`/api/feeding/rations/${pendingRation.value.id}`)
    rationConfirmOpen.value = false
    pendingRation.value = null
    await loadData()
  } catch (err) {
    rationError.value = err.message || 'Failed to delete ration'
  }
}

function openPlanModal() {
  if (!canWrite.value) return
  planForm.value = { animalTagId: '', rationId: 0, state: '', dailyQuantityValue: 0, dailyQuantityUnit: 'kg', startDate: '', endDate: '', status: 'active', notes: '' }
  planAnimalTagQuery.value = ''
  planAnimalDropdownOpen.value = false
  planErrors.value = []
  planError.value = ''
  planModalMode.value = 'create'
  pendingPlan.value = null
  planModalOpen.value = true
}

function openEditPlanModal(plan) {
  if (!canWrite.value) return
  planForm.value = {
    animalTagId: plan.animalTag || '',
    rationId: plan.rationId || 0,
    state: plan.state || '',
    dailyQuantityValue: plan.dailyQuantityValue,
    dailyQuantityUnit: plan.dailyQuantityUnit,
    startDate: plan.startDate,
    endDate: plan.endDate || '',
    status: plan.status || 'active',
    notes: plan.notes || ''
  }
  planAnimalTagQuery.value = plan.animalTag || ''
  planAnimalDropdownOpen.value = false
  planErrors.value = []
  planError.value = ''
  planModalMode.value = 'edit'
  pendingPlan.value = plan
  planModalOpen.value = true
}

function closePlanModal() {
  planModalOpen.value = false
  planError.value = ''
  planErrors.value = []
}

function validatePlan() {
  const issues = []
  if (!planForm.value.startDate) issues.push('Start date is required.')
  if (planForm.value.dailyQuantityValue < 0) issues.push('Daily quantity must be non-negative.')
  if (!String(planForm.value.dailyQuantityUnit || '').trim()) issues.push('Unit is required.')
  if (String(planForm.value.animalTagId || '').trim() && !/^[A-Z0-9-]{2,24}$/.test(String(planForm.value.animalTagId || '').trim().toUpperCase())) {
    issues.push('Animal tag must be 2-24 chars (A-Z, 0-9, hyphen).')
  }
  planErrors.value = issues
  return issues.length === 0
}

async function submitPlanModal() {
  if (!canWrite.value) return
  if (!validatePlan()) return
  planError.value = ''
  planSaving.value = true
  try {
    const payload = {
      animalTagId: String(planForm.value.animalTagId || '').trim().toUpperCase(),
      rationId: planForm.value.rationId || 0,
      state: String(planForm.value.state || '').trim(),
      dailyQuantityValue: Number(planForm.value.dailyQuantityValue || 0),
      dailyQuantityUnit: String(planForm.value.dailyQuantityUnit || '').trim(),
      startDate: planForm.value.startDate,
      endDate: planForm.value.endDate,
      status: planForm.value.status,
      notes: String(planForm.value.notes || '').trim()
    }
    if (planModalMode.value === 'create') {
      await apiPost('/api/feeding/plans', payload)
    } else if (pendingPlan.value) {
      await apiPut(`/api/feeding/plans/${pendingPlan.value.id}`, payload)
    }
    await loadData()
    closePlanModal()
  } catch (err) {
    planError.value = err.message || 'Failed to save plan'
  } finally {
    planSaving.value = false
  }
}

function askDeletePlan(plan) {
  if (!canWrite.value) return
  pendingPlan.value = plan
  planConfirmOpen.value = true
}

async function confirmDeletePlan() {
  if (!pendingPlan.value) return
  try {
    await apiDelete(`/api/feeding/plans/${pendingPlan.value.id}`)
    planConfirmOpen.value = false
    pendingPlan.value = null
    await loadData()
  } catch (err) {
    planError.value = err.message || 'Failed to delete plan'
  }
}
onMounted(() => loadData(1))
</script>
