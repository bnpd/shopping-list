<script lang="ts">
	import { foods } from '$lib/foodStore';
	import FoodRow from './FoodRow.svelte';

	let allFoods = $foods;

	let name = '';
	let ingredientsInput = '';
	let frequency = 7;

	function addFood() {
		const ingredients = ingredientsInput.split(',').map(s => s.trim()).filter(Boolean);
		if (!name.trim()) return alert('Name required');
		foods.addFood({ name: name.trim(), ingredients, frequency });
		name = '';
		ingredientsInput = '';
	}
</script>

<div class="space-y-4">
	<div class="flex justify-between items-center">
		<h2 class="text-xl font-bold">Foods</h2>
		<div class="flex gap-2">
			<input placeholder="Name" bind:value={name} class="px-2 py-1 border rounded" />
			<input placeholder="ingredients, comma-separated" bind:value={ingredientsInput} class="px-2 py-1 border rounded w-72" />
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
