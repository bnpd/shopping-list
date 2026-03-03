<script lang="ts">
	import { shoppingItems, shoppingTempItems } from '$lib/store';
	import { getItemsDueThisWeek } from '$lib/dateUtils';
    import ItemRowCompact from './ItemRowCompact.svelte';

	let items = $state<any[]>([]);
	let addTempItem = $state(false);

	function loadFilteredItems() {
		const all = $shoppingItems;
		const due = getItemsDueThisWeek(all);
		// include requested items that are not already in due
		const dueIds = new Set(due.map(d => d.id));
		const requested = all.filter(i => i.requested && !dueIds.has(i.id));
		items =  [...due, ...requested];
	}

	loadFilteredItems();
</script>

<div class="space-y-4">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl font-bold text-gray-900">Due This Week</h1>
		<button onclick={loadFilteredItems}>⟳</button>
		<button onclick={()=>addTempItem = true}>+</button>
	</div>

	{#if items.length === 0}
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
			<p>No items due this week. Great job!</p>
		</div>
	{:else}
		<div class="overflow-x-auto border border-gray-300 rounded-lg">
			<table class="w-full text-sm">
				<thead class="bg-gray-50 border-b border-gray-300">
					<tr>
						<th class="px-2 py-2 text-left font-semibold text-gray-900">Name</th>
						<th class="px-2 py-2 text-left font-semibold text-gray-900">Remaining</th>
						<th class="px-2 py-2 text-left font-semibold text-gray-900">Due</th>
						<th class="px-2 py-2 text-left font-semibold text-gray-900">☑</th>
					</tr>
				</thead>
				<tbody>
					{#if addTempItem}
						<tr>
							<td colspan="4">
								<input type="text" class="w-full px-2 py-2 text-left font-semibold text-gray-900" placeholder="New item"
									onblur={(e) => {
										console.log('blur');
										
										const value = (e.target as HTMLInputElement).value.trim();
										if (value) {
											shoppingTempItems.addItem(value);
										}
										addTempItem = false;
									}}
								/>
							</td>
						</tr>
					{/if}
					{#each $shoppingTempItems as tempItem (tempItem)}
						<tr>
							<td colspan="3" class="px-2 py-2 text-left font-semibold text-gray-900">{tempItem}</td>
							<td class="px-2 py-1 text-sm text-center">
								<input
									type="checkbox"
									checked={true}
									onclick={() => shoppingTempItems.deleteItem(tempItem)}
									class="h-4 w-4 text-blue-600 rounded mx-auto"
								/>
							</td>
						</tr>
					{/each}
					{#each items as item (item.id)}
						<ItemRowCompact {item} />
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
