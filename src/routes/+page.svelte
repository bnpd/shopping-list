<script lang="ts">
	import ProductsView from '$lib/components/ProductsView.svelte';
	import DueThisWeekView from '$lib/components/DueThisWeekView.svelte';
	import FoodsView from '$lib/components/FoodsView.svelte';
	import NoConsumptionPeriods from '$lib/components/NoConsumptionPeriods.svelte';
	import ImportCSVModal from '$lib/components/ImportCSVModal.svelte';
	import ImportFoodModal from '$lib/components/ImportFoodModal.svelte';
    import { exportProducts, exportFoods } from '$lib/exportUtils';
    import { shoppingItems } from '$lib/store';
    import { foods } from '$lib/foodStore';

	type View = 'all' | 'due-this-week' | 'foods' | 'no-consumption' | 'import-export';

	let currentView: View = $state('due-this-week');
	let showImportModal = $state(false);
	let showImportFoodModal = $state(false);
</script>

<div class="min-h-screen bg-gray-100">
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex justify-between items-center">
				<h1 class="text-3xl font-bold text-gray-900">🛒 Shopping List</h1>
			</div>
		</div>
	</header>

	<nav class="bg-white border-b border-gray-200 sticky top-0 z-40 overflow-x-auto max-w-full">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex gap-4 whitespace-nowrap">
				<button
					onclick={() => (currentView = 'due-this-week')}
					class={`py-4 px-1 border-b-2 font-medium text-sm ${
						currentView === 'due-this-week'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
					}`}
				>
					Week
				</button>
				<button
					onclick={() => (currentView = 'all')}
					class={`py-4 px-1 border-b-2 font-medium text-sm ${
						currentView === 'all'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
					}`}
				>
					Products
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
					Pause
				</button>
				<button
					onclick={() => (currentView = 'import-export')}
					class={`py-4 px-1 border-b-2 font-medium text-sm ${
						currentView === 'import-export'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
					}`}
				>
					Import/Export
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
		{:else if currentView === 'foods'}
			<FoodsView />
		{:else if currentView === 'import-export'}
		<div class="flex flex-col gap-8 items-center">
			<div>
				<button
					onclick={() => (showImportModal = true)}
					class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition font-medium"
				>
					📥 Import Products
				</button>
				<button onclick={()=>exportProducts($shoppingItems)} class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition font-medium">Export Products</button>
			</div>
			<div>
				<button
					onclick={() => (showImportFoodModal = true)}
					class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
				>
					🍽️ Import Foods
				</button>
				<button onclick={()=>exportFoods($foods, $shoppingItems)} class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium">Export Foods</button>
			</div>
		</div>
		{/if}
	</main>

	{#if showImportModal}
		<ImportCSVModal onClose={() => (showImportModal = false)} />
	{/if}

	{#if showImportFoodModal}
		<ImportFoodModal onClose={() => (showImportFoodModal = false)} />
	{/if}
</div>
