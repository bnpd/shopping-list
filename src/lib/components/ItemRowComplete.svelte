<script lang="ts">
	import type { ShoppingItem } from '$lib/types';
	import { formatDate, calculateNextDueDate, daysUntilDate, estimateDaysPerUnit, remainingAmount } from '$lib/dateUtils';
	import { shoppingItems } from '$lib/store';

	let { item }: { item: ShoppingItem; compact?: boolean } = $props();

	const nextDue = $derived(calculateNextDueDate(item));
	const daysUntilDue = $derived(daysUntilDate(nextDue));
	
	let calculatedAmount = $derived(remainingAmount(item));
	const estDays = $derived(estimateDaysPerUnit(item.reportedHistory));
	const estDaysRecent = $derived(estimateDaysPerUnit(item.reportedHistory, 90));

	function deleteItem() {
		if (confirm(`Delete "${item.name}"?`)) {
			shoppingItems.deleteItem(item.id);
		}
	}
</script>


<tr>
	<td class="px-2 py-1 text-sm text-gray-700">
		<input
			type="checkbox"
			aria-label={`Mark ${item.name} requested`}
			checked={item.requested}
			onclick={(e: Event) => {
				const target = e.target as HTMLInputElement;
				shoppingItems.setRequested(item.id, target.checked);
			}}
			class="h-4 w-4 text-blue-600 rounded"
		/>
	</td>
	<td class="px-2 py-1 text-sm font-medium text-gray-900">
		<input
			type="text"
			value={item.name}
			onblur={(e) => shoppingItems.updateItem(item.id, { name: (e.target as HTMLInputElement).value })}
			class="w-full bg-transparent border-none p-0 m-0"
		/>
	</td>
	<td class="px-2 py-1 text-sm text-gray-700">
		<input
			type="number"
			value={calculatedAmount.toFixed(1)}
			onblur={(e) => {
				const newValue = parseFloat((e.target as HTMLInputElement).value);
				shoppingItems.updateReported(item.id, newValue, newValue - item.reported);
			}}
			class="w-full bg-transparent border-none p-0 m-0"
		/>
	</td>
	<td class="px-2 py-1 text-sm text-gray-700">{nextDue < Number.POSITIVE_INFINITY ? formatDate(nextDue) : ''}</td>
	<td class="px-2 py-1 text-sm">
		<span class={`px-2 py-1 rounded text-sm font-medium ${
			daysUntilDue < 0 ? 'bg-red-100 text-red-800' :
			daysUntilDue <= 3 ? 'bg-yellow-100 text-yellow-800' :
			daysUntilDue <= 7 ? 'bg-blue-100 text-blue-800' :
			'bg-gray-100 text-gray-800'
		}`}>
			{daysUntilDue < 0 ? 'Overdue' : `${daysUntilDue < Number.POSITIVE_INFINITY ? daysUntilDue + 'd' : ''}`}
		</span>
	</td>
	<td class="px-2 py-1 text-sm text-gray-700">
		<input
			type="number"
			value={item.frequency}
			onblur={(e) => shoppingItems.updateItem(item.id, { frequency: parseInt((e.target as HTMLInputElement).value) })}
			class="w-full bg-transparent border-none p-0 m-0"
		/>
	</td>
	<td class="px-2 py-1 text-sm text-gray-700">{estDays < Number.POSITIVE_INFINITY ? `${Math.round(estDays)}d` : ''}</td>
	<td class="px-2 py-1 text-sm text-gray-700">{estDaysRecent < Number.POSITIVE_INFINITY ? `${Math.round(estDaysRecent)}d` : ''}</td>
	<td class="px-2 py-1 text-sm text-gray-700">
		$<input
			type="number"
			value={item.price.toFixed(2)}
			onblur={(e) => shoppingItems.updateItem(item.id, { price: parseFloat((e.target as HTMLInputElement).value) })}
			class="w-20 bg-transparent border-none p-0 m-0"
		/>
	</td>
	<td class="px-2 py-1 text-sm text-gray-700">
		<input
			type="datetime-local"
			value={new Date(item.lastBuyDate).toISOString().slice(0,16)}
			onblur={(e) => shoppingItems.updateItem(item.id, { lastBuyDate: new Date((e.target as HTMLInputElement).value).getTime() })}
			class="w-full bg-transparent border-none p-0 m-0"
		/>
	</td>
	<td class="px-2 py-1 text-sm text-gray-500">
		<input
			type="text"
			value={item.stores.join(', ')}
			onblur={(e) => shoppingItems.updateItem(item.id, { stores: (e.target as HTMLInputElement).value.split(',').map(s => s.trim()) })}
			class="w-full bg-transparent border-none p-0 m-0"
		/>
	</td>
	<td class="px-2 py-1 text-sm">
		<button
			type="button"
			onclick={deleteItem}
			class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs transition"
		>
			Delete
		</button>
	</td>
</tr>
