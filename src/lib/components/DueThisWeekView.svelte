<script lang="ts">
	import { shoppingItems, shoppingTempItems } from '$lib/store';
	import { calculateNextDueDate, getItemsDueThisWeek } from '$lib/dateUtils';
    import ItemRowCompact from './ItemRowCompact.svelte';
    import type { ShoppingItem } from '$lib/types';

	let searchTerm = $state('');
	let items = $state<ShoppingItem[]>(loadFilteredItems());
	let addTempItem = $state(false);

	function loadFilteredItems(): ShoppingItem[] {
		const all = $shoppingItems;

		if (searchTerm.trim()) {
			const results = searchTerm.trim() ? all.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];;
			return results.sort((a, b) => calculateNextDueDate(a) - calculateNextDueDate(b));
		} else {
			const due = getItemsDueThisWeek(all);
			// include requested items that are not already in due
			const dueIds = new Set(due.map(d => d.id));
			const requested = all.filter(i => i.requested && !dueIds.has(i.id));
			return [...due, ...requested];
		}
	}
</script>

<div class="space-y-4">
	{#if items.length === 0}
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
			<p>No items due this week. Great job!</p>
		</div>
	{:else}
		<input placeholder="Search items..." bind:value={searchTerm} onkeyup={() => items =loadFilteredItems()} class="px-2 py-1 border rounded w-full max-w-md" />
		<div class="overflow-x-auto border border-gray-300 rounded-lg">
			<table class="w-full text-sm">
				<thead class="bg-gray-50 border-b border-gray-300">
					<tr>
						<th class="px-2 py-2 text-left font-semibold text-gray-900">
							<div class="flex items-center gap-6">
								Name
								<button onclick={() => items = loadFilteredItems()}>⟳</button>
								<button onclick={()=>addTempItem = true}>+</button>
							</div>
						</th>
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
