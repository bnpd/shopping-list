<script lang="ts">
	import { foods } from '$lib/foodStore';
	import { shoppingItems } from '$lib/store';
    import type { Food } from '$lib/types';
	import FoodRow from './FoodRow.svelte';

	let name = $state('');
	let selectedProductIds: string[] = $state([]);
	let frequency = 7;
	let ingredientSearchTerm = $state('');
	let searchTerm = $state('');

	let filteredFoods = $derived(filterFoods($foods, searchTerm));
	const allShoppingItems = $shoppingItems;

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

	function filterFoods(foods: Food[], term: string): Food[] {
		if (!term.trim()) return foods;
		return foods.filter(food => 
			food.name.toLowerCase().includes(term.toLowerCase())
			|| food.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
			|| food.productIds.some(pid => {
				const item = allShoppingItems.find(it => it.id === pid);
				return item?.name.toLowerCase().includes(term.toLowerCase());
			})
		);
	}

	let filteredProducts = $derived(allShoppingItems.filter((item) => 
		item.name.toLowerCase().includes(ingredientSearchTerm.toLowerCase())
	));
</script>

<div class="space-y-4">
	<div class="flex flex-col justify-between items-center">
		<input placeholder="Search foods..." bind:value={searchTerm} class="px-2 py-1 border rounded w-full max-w-md" />
		<div class="flex flex-col gap-2">
			<input placeholder="Name" bind:value={name} class="px-2 py-1 border rounded" />
			<div class="flex flex-col">
				<input 
					placeholder="Search ingredients..." 
					bind:value={ingredientSearchTerm} 
					onkeypress={(e) => {
						if (e.key === 'Enter' && filteredProducts.length > 0) { 
							e.preventDefault(); 
							toggleSelection(filteredProducts[0].id);
						}}}
					class="px-2 py-1 border rounded text-sm" />
				<div class="px-2 py-1 border rounded w-72 h-32 overflow-y-auto bg-white">
					{#each filteredProducts as item}
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
						{#if !filteredProducts.includes(item)}
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
		{#each filteredFoods as food (food.id)}
			<FoodRow {food} />
		{/each}
		{#if filteredFoods.length === 0}
			<div class="p-4 text-gray-600">No foods yet. Use CSV import or add one.</div>
		{/if}
	</div>
</div>
