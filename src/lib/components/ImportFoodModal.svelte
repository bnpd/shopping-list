<script lang="ts">
	import { foods } from '$lib/foodStore';
	import { convertCSVToFoods } from '$lib/csvParser';
	import { shoppingItems } from '$lib/store';
	import type { Food } from '$lib/types';

	let { onClose }: { onClose: () => void } = $props();

	let csvContent = $state('');
	let preview = $state<Omit<Food, 'id' | 'createdDate'>[]>([]);
	let error = $state('');
	const allShoppingItems = $shoppingItems;

	function handleFile(event: Event) {
		const input = event.target as HTMLInputElement;
		const f = input.files?.[0];
		if (!f) return;
		const r = new FileReader();
		r.onload = e => {
			csvContent = (e.target?.result as string) || '';
			previewCSV();
		};
		r.readAsText(f);
	}

	function previewCSV() {
		try {
			if (!csvContent.trim()) {
				error = 'No CSV content';
				return;
			}
			preview = convertCSVToFoods(csvContent, allShoppingItems);
			if (preview.length === 0) {
				error = 'No valid foods found';
			} else {
				error = '';
			}
		} catch (e: any) {
			error = 'Parse error: ' + e.message;
			preview = [];
		}
	}

	function importFoods() {
		if (preview.length === 0) return;
		foods.importFoods(preview);
		onClose();
	}

	function getIngredientNames(productIds: string[]): string[] {
		return productIds.map(id => {
			const item = allShoppingItems.find(it => it.id === id);
			return item ? item.name : 'Unknown';
		});
	}
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
	<div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
		<h2 class="text-xl font-bold mb-4">Import Foods CSV</h2>

		<div class="space-y-4">
			<div>
				<input id="food-csv" class="hidden" type="file" accept=".csv" onchange={handleFile} />
				<label for="food-csv" class="cursor-pointer block text-center p-6 border-2 border-dashed border-gray-300 rounded">
					Click to upload foods CSV
				</label>
			</div>

			<div>
				<label for="food-csv-text" class="block text-sm font-medium">Or paste CSV</label>
				<textarea id="food-csv-text" bind:value={csvContent} rows={6} class="w-full border rounded p-2 font-mono text-sm"></textarea>
			</div>

			{#if error}
				<div class="text-red-600">{error}</div>
			{/if}

			{#if preview.length}
				<div class="space-y-2">
					{#each preview as f (f.name)}
						<div class="p-2 border rounded bg-gray-50">
							<div class="font-medium">{f.name}</div>
							<div class="text-xs text-gray-600">Freq: {f.frequency}d · Ingredients: {getIngredientNames(f.productIds).join(', ')}</div>
						</div>
					{/each}
				</div>
			{/if}

			<div class="flex justify-end gap-2">
				<button onclick={() => onClose()} class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
				<button onclick={previewCSV} class="px-4 py-2 bg-blue-500 text-white rounded">Preview</button>
				<button onclick={importFoods} class="px-4 py-2 bg-green-500 text-white rounded" disabled={preview.length === 0}>Import {preview.length}</button>
			</div>
		</div>
	</div>
</div>
