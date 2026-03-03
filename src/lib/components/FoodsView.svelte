<script lang="ts">
	import { foods } from '$lib/foodStore';
	import { shoppingItems } from '$lib/store';
	import FoodRow from './FoodRow.svelte';

	let allFoods = $derived($foods);
	const allShoppingItems = $shoppingItems;

	let name = $state('');
	let selectedProductIds: string[] = $state([]);
	let frequency = 7;
	let searchTerm = $state('');

	function addFood() {
		foods.addFood({
			name: name.trim(),
			productIds: selectedProductIds,
			frequency,
			links: [],
			tags: []
		});
		name = '';
		selectedProductIds = [];
	}

	function toggleSelection(id: string) {
		if (selectedProductIds.includes(id)) {
			selectedProductIds = selectedProductIds.filter(pid => pid !== id);
		} else {
			selectedProductIds = [...selectedProductIds, id];
		}
	}

	let filteredItems = $derived(allShoppingItems.filter((item) => 
		item.name.toLowerCase().includes(searchTerm.toLowerCase())
	));
</script>

<div class="space-y-4">
	<div class="flex flex-col justify-between items-center">
		<h2 class="text-xl font-bold">Foods</h2>
		<div class="flex flex-col gap-2">
			<input placeholder="Name" bind:value={name} class="px-2 py-1 border rounded" />
			<div class="flex flex-col">
				<input 
					placeholder="Search ingredients..." 
					bind:value={searchTerm} 
					onkeypress={(e) => {
						if (e.key === 'Enter' && filteredItems.length > 0) { 
							e.preventDefault(); 
							toggleSelection(filteredItems[0].id);
						}}}
					class="px-2 py-1 border rounded text-sm" />
				<div class="px-2 py-1 border rounded w-72 h-32 overflow-y-auto bg-white">
					{#each filteredItems as item}
						<label class="py-1 flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50">
							<input 
								type="checkbox" 
								checked={selectedProductIds.includes(item.id)} 
								onchange={() => toggleSelection(item.id)}
							/>
							{item.name}
						</label>
					{/each}
					{#each selectedProductIds as id}
						{@const item = allShoppingItems.find(it => it.id === id)!}
						{#if !filteredItems.includes(item)}
							<label class="py-1 flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50">
								<input 
									type="checkbox" 
									checked={true} 
									onchange={() => toggleSelection(id)}
								/>
								{item.name}
							</label>
						{/if}
					{/each}
				</div>
				{#each selectedProductIds as id}
					<div class="text-xs text-gray-600">Selected: {allShoppingItems.find(it => it.id === id)?.name || 'Unknown'}</div>
				{/each}
			</div>
			<button onclick={addFood} class="px-3 py-1 bg-blue-500 text-white rounded">Add</button>
		</div>
	</div>

	<div class="border rounded overflow-hidden">
		{#each allFoods as food (food.id)}
			<FoodRow {food} />
		{/each}
		{#if allFoods.length === 0}
			<div class="p-4 text-gray-600">No foods yet. Use CSV import or add one.</div>
		{/if}
	</div>
</div>
