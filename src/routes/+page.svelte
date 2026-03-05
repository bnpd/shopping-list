<script lang="ts">
	import ProductsView from '$lib/components/ProductsView.svelte';
	import DueThisWeekView from '$lib/components/DueThisWeekView.svelte';
	import FoodsView from '$lib/components/FoodsView.svelte';
	import NoConsumptionPeriods from '$lib/components/NoConsumptionPeriods.svelte';
	import AddProductModal from '$lib/components/AddProductModal.svelte';
	import ImportCSVModal from '$lib/components/ImportCSVModal.svelte';
	import ImportFoodModal from '$lib/components/ImportFoodModal.svelte';

	type View = 'all' | 'due-this-week' | 'foods' | 'no-consumption';

	let currentView: View = $state('due-this-week');
	let showAddModal = $state(false);
	let showImportModal = $state(false);
	let showImportFoodModal = $state(false);
</script>

<div class="min-h-screen bg-gray-100">
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex justify-between items-center">
				<h1 class="text-3xl font-bold text-gray-900">🛒 Shopping List</h1>
				<div class="flex gap-2">
					<button
						onclick={() => (showImportModal = true)}
						class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition font-medium"
					>
						📥 Import CSV
					</button>
					<button
						onclick={() => (showImportFoodModal = true)}
						class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
					>
						🍽️ Import Foods
					</button>
					<button
						onclick={() => (showAddModal = true)}
						class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-medium"
					>
						+ Add Product
					</button>
				</div>
			</div>
		</div>
	</header>

	<nav class="bg-white border-b border-gray-200 sticky top-0 z-40">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex gap-8">
				<button
					onclick={() => (currentView = 'due-this-week')}
					class={`py-4 px-1 border-b-2 font-medium text-sm ${
						currentView === 'due-this-week'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
					}`}
				>
					Due This Week
				</button>
				<button
					onclick={() => (currentView = 'all')}
					class={`py-4 px-1 border-b-2 font-medium text-sm ${
						currentView === 'all'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
					}`}
				>
					All Products
				</button>
				<button
					onclick={() => (currentView = 'foods')}
					class={`py-4 px-1 border-b-2 font-medium text-sm ${
						currentView === 'foods'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
					}`}
				>
					Foods
				</button>
				<button
					onclick={() => (currentView = 'no-consumption')}
					class={`py-4 px-1 border-b-2 font-medium text-sm ${
						currentView === 'no-consumption'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
					}`}
				>
					No Consumption
				</button>
			</div>
		</div>
	</nav>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if currentView === 'all'}
			<ProductsView />
		{:else if currentView === 'due-this-week'}
			<DueThisWeekView />
		{:else if currentView === 'no-consumption'}
			<NoConsumptionPeriods />
		{:else}
			<FoodsView />
		{/if}
	</main>

	{#if showAddModal}
		<AddProductModal onClose={() => (showAddModal = false)} />
	{/if}

		{#if showImportModal}
			<ImportCSVModal onClose={() => (showImportModal = false)} />
		{/if}

		{#if showImportFoodModal}
			<ImportFoodModal onClose={() => (showImportFoodModal = false)} />
		{/if}
</div>
