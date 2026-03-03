<script lang="ts">
	import { shoppingItems } from '$lib/store';
	import { convertCSVToItems } from '$lib/csvParser';
	import { formatDate } from '$lib/dateUtils';
	let { onClose }: { onClose: () => void } = $props();
	let csvContent = $state('');
	let previewItems = $state<any[]>([]);
	let showPreview = $state(false);
	let importError = $state('');

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			csvContent = (e.target?.result as string) || '';
			importError = '';
			previewCSV();
		};
		reader.readAsText(file);
	}

	function previewCSV() {
		try {
			if (!csvContent.trim()) {
				importError = 'No CSV content to import';
				return;
			}

			previewItems = convertCSVToItems(csvContent);

			if (previewItems.length === 0) {
				importError = 'No valid items found in CSV';
				return;
			}

			showPreview = true;
			importError = '';
		} catch (error) {
			importError = `Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`;
			previewItems = [];
			showPreview = false;
		}
	}

	function handleImport() {
		for (const item of previewItems) {
			shoppingItems.addItem(item);
		}
		onClose();
	}
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
	<div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
		<h2 class="text-xl font-bold mb-4">Import Products from CSV</h2>

		{#if !showPreview}
			<div class="space-y-4">
				<div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
					<input
						type="file"
						accept=".csv"
						onchange={handleFileUpload}
						class="hidden"
						id="csv-upload"
					/>
					<label for="csv-upload" class="cursor-pointer block">
						<p class="text-gray-700 font-medium mb-2">Click to upload CSV file</p>
						<p class="text-sm text-gray-500">or drag and drop</p>
					</label>
				</div>

				<div>
					<label for="csv-textarea" class="block text-sm font-medium text-gray-700 mb-2">Or paste CSV content:</label>
					<textarea
						id="csv-textarea"
						bind:value={csvContent}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
						rows="6"
						placeholder="Paste your CSV data here..."
					></textarea>
				</div>

				{#if importError}
					<div class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
						{importError}
					</div>
				{/if}

				<div class="flex justify-end gap-3">
					<button
						onclick={onClose}
						class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
					>
						Cancel
					</button>
					<button
						onclick={previewCSV}
						class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
					>
						Preview
					</button>
				</div>
			</div>
		{:else}
			<div class="space-y-4">
				<div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
					<p class="text-blue-700 font-medium">{previewItems.length} items found</p>
				</div>

				<div class="space-y-2 max-h-48 overflow-y-auto">
					{#each previewItems as item (item.name)}
						<div class="bg-gray-50 p-3 rounded border border-gray-200">
							<div class="font-medium text-gray-900">{item.name}</div>
							<div class="text-sm text-gray-600 mt-1">
								<span>Freq: {item.frequency}d</span>
								<span class="ml-4">Price: ${item.price.toFixed(2)}</span>
								<span class="ml-4">Reported: {item.reported}</span>
					{#if item.lastBuyDate}
						<span class="ml-4">Last: {formatDate(item.lastBuyDate)}</span>
					{/if}
							</div>
							{#if item.stores.length > 0}
								<div class="text-xs text-gray-500 mt-1">Stores: {item.stores.join(', ')}</div>
							{/if}
						</div>
					{/each}
				</div>

				<div class="flex justify-between gap-3">
					<button
						onclick={() => (showPreview = false)}
						class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
					>
						Back
					</button>
					<div class="flex gap-3">
						<button
							onclick={onClose}
							class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
						>
							Cancel
						</button>
						<button
							onclick={handleImport}
							class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
						>
							Import {previewItems.length} Items
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
