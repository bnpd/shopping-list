<script lang="ts">
	import { shoppingItems } from '$lib/store';
	import type { SortColumn, SortDirection } from '$lib/types';
    import ItemRowComplete from './ItemRowComplete.svelte';

	let sortColumn: SortColumn = $state('name');
	let sortDirection: SortDirection = $state('asc');

	let items = $derived.by(() => {
		const allItems = $shoppingItems;
		const sorted = [...allItems].sort((a, b) => {
			let aVal: any = a[sortColumn];
			let bVal: any = b[sortColumn];

			if (sortColumn === 'due' || sortColumn === 'updated' || sortColumn === 'nextDue') {
				// Already timestamps
			} else if (aVal === undefined || bVal === undefined) {
				return 0;
			}

			if (typeof aVal === 'string') {
				aVal = aVal.toLowerCase();
				bVal = (bVal as string).toLowerCase();
			}

			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

		return sorted;
	});

	function toggleSort(column: SortColumn) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
	}

	const getSortIndicator = (column: SortColumn) => {
		if (sortColumn !== column) return '';
		return sortDirection === 'asc' ? ' ▲' : ' ▼';
	};
</script>

<div class="space-y-4">
	<h1 class="text-2xl font-bold text-gray-900">All Products</h1>

	{#if items.length === 0}
		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700">
			<p>No products yet. Add your first product to get started!</p>
		</div>
	{:else}
		<div class="overflow-x-auto border border-gray-300 rounded-lg">
			<table class="w-full text-sm">
				<thead class="bg-gray-50 border-b border-gray-300">
					<tr>
						<th class="px-4 py-2 text-left font-semibold text-gray-900">Requested</th>
						<th
							class="px-4 py-2 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
							onclick={() => toggleSort('name')}
						>
							Name{getSortIndicator('name')}
						</th>
						<th
							class="px-4 py-2 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
							onclick={() => toggleSort('reported')}
						>
							Remaining{getSortIndicator('reported')}
						</th>
						<th
							class="px-4 py-2 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
							onclick={() => toggleSort('nextDue')}
						>
							Due Date{getSortIndicator('nextDue')}
						</th>
						<th class="px-4 py-2 text-left font-semibold text-gray-900">Days left</th>
						<th
							class="px-4 py-2 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
							onclick={() => toggleSort('frequency')}
						>
							Frequency{getSortIndicator('frequency')}
						</th>
						<th class="px-4 py-2 text-left font-semibold text-gray-900">Est. Days</th>
						<th class="px-4 py-2 text-left font-semibold text-gray-900">Est. Days (90d)</th>
						<th
							class="px-4 py-2 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
							onclick={() => toggleSort('price')}
						>
							Price{getSortIndicator('price')}
						</th>
						<th
							class="px-4 py-2 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
							onclick={() => toggleSort('lastBuyDate')}
						>
							Last Updated{getSortIndicator('lastBuyDate')}
						</th>
						<th class="px-4 py-2 text-left font-semibold text-gray-900">Stores</th>
						<th class="px-4 py-2 text-left font-semibold text-gray-900">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each items as item (item.id)}
						<ItemRowComplete {item} />
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
