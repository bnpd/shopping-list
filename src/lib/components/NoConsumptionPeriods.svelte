<script lang="ts">
	import { onDestroy } from 'svelte';
	import { noConsumptionPeriods, type NoConsumptionPeriod } from '$lib/noConsumptionStore';

	let days: number = 7;
	// yyyy-mm-dd default to today
	let cutoff: string = new Date().toISOString().slice(0, 10);

	let periods: NoConsumptionPeriod[] = [];
	const unsub = noConsumptionPeriods.subscribe(v => (periods = v));
	onDestroy(() => unsub());

	function addPeriod(e?: Event) {
		e?.preventDefault();
		const ts = new Date(cutoff).getTime();
		if (isNaN(ts) || !Number.isFinite(days) || days <= 0) return;
		noConsumptionPeriods.add({ days: Number(days), cutoffDate: ts });
		days = 7;
		cutoff = new Date().toISOString().slice(0, 10);
	}

	function remove(id: string) {
		noConsumptionPeriods.remove(id);
	}

	const fmtDate = (ts: number) => new Date(ts).toLocaleDateString();
</script>

<div class="space-y-4">
	<h2 class="text-xl font-semibold text-gray-900">No-Consumption Periods (global)</h2>

	<form class="flex items-end gap-2" on:submit|preventDefault={addPeriod}>
		<div>
			<label class="block text-sm text-gray-700">Days</label>
			<input type="number" min="1" class="mt-1 block w-32 rounded border-gray-300" bind:value={days} />
		</div>

		<div>
			<label class="block text-sm text-gray-700">Cutoff date</label>
			<input type="date" class="mt-1 block rounded border-gray-300" bind:value={cutoff} />
		</div>

		<div>
			<button class="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded" type="submit">Add</button>
		</div>
	</form>

	{#if periods.length === 0}
		<div class="text-sm text-gray-600">No periods defined.</div>
	{:else}
		<div class="mt-2 border border-gray-200 rounded">
			<table class="w-full text-sm">
				<thead class="bg-gray-50 text-left text-gray-700">
					<tr>
						<th class="px-3 py-2">Days</th>
						<th class="px-3 py-2">Cutoff</th>
						<th class="px-3 py-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each periods as p (p.id)}
						<tr class="border-t border-gray-100">
							<td class="px-3 py-2">{p.days}</td>
							<td class="px-3 py-2">{fmtDate(p.cutoffDate)}</td>
							<td class="px-3 py-2">
								<button class="text-sm text-red-600 hover:underline" on:click={() => remove(p.id)}>Delete</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

