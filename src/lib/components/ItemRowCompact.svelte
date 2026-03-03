<script lang="ts">
	import type { ShoppingItem } from '$lib/types';
	import { calculateNextDueDate, daysUntilDate, remainingAmount } from '$lib/dateUtils';
	import { shoppingItems } from '$lib/store';

	let { item }: { item: ShoppingItem } = $props();

	const nextDue = $derived(calculateNextDueDate(item));
	const daysUntilDue = $derived(daysUntilDate(nextDue));
	
	let calculatedAmount = $derived(remainingAmount(item));

	function incrementReported() {
		calculatedAmount += 1;
		// leave time before updating the list to avoid sorting/filtering while user is still clicking
		shoppingItems.updateReported(item.id, calculatedAmount, 1);
		rowClass = 'modified';
	}

	function cycleReported() {
		const prevCalculated = calculatedAmount;
		const seq = [1.0, 0.5, 0.2, 0];
		const idx = seq.findIndex(val => Math.abs(val - calculatedAmount) < 0.0001);
		calculatedAmount = seq[(idx + 1) % seq.length];
		const change = calculatedAmount - prevCalculated;
		console.log(item.name, ':', calculatedAmount, ' - ', prevCalculated, ' = ', change);
		shoppingItems.updateReported(item.id, calculatedAmount, change);
		rowClass = 'modified';
	}

	let rowClass = $derived.by(()=>{		
		if (daysUntilDue < 0) return 'bg-red-50';
		if (daysUntilDue <= 3) return 'bg-yellow-50';
		if (daysUntilDue <= 7) return 'bg-blue-50';
		return '';
	});
</script>


<tr class={rowClass}>
	<td class="px-2 text-sm font-medium text-gray-900">{item.name}</td>
	<td class="px-2 py-1 text-sm text-gray-700">
		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={cycleReported}
				class="px-2 py-0.5 text-xs font-semibold bg-blue-200 rounded hover:bg-blue-300"
			>
				{calculatedAmount.toFixed(1)}
			</button>
			<button
				type="button"
				onclick={incrementReported}
				class="px-1 py-0.5 text-xs bg-blue-100 hover:bg-blue-300 rounded"
				title="Add 1"
			>
				+
			</button>
		</div>
	</td>
	<td class="px-2 py-1 text-sm">
		<div class="flex gap-1 items-center" aria-label={`Due in ${daysUntilDue} days`}>
			<div class="flex">
				{#each Array(7) as _, i}
					<div class={`w-2 h-1 rounded ${i < daysUntilDue ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
				{/each}
			</div>
		</div>
	</td>
	<td class="px-2 py-1 text-sm text-center">
		<input
			type="checkbox"
			aria-label={`Mark ${item.name} requested`}
			checked={item.requested}
			onclick={(e: Event) => {
				const target = e.target as HTMLInputElement;
				shoppingItems.setRequested(item.id, target.checked);
			}}
			class="h-4 w-4 text-blue-600 rounded mx-auto"
		/>
	</td>
</tr>

<style>
	button {
		min-width: 2rem;
		min-height: 2rem;
	}

	tr.modified {
		opacity: 0.2;
	}
</style>
