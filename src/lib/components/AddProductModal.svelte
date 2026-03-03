<script lang="ts">
	import type { ShoppingItem } from '$lib/types';
	import { shoppingItems } from '$lib/store';

	let { onClose }: { onClose: () => void } = $props();

	let name = $state('');
	let reported = $state(1);
	let frequency = $state(14);
	let price = $state(0);
	let lifespan = $state(0);
	let storesInput = $state('');

	function handleSubmit() {
		if (!name.trim()) {
			alert('Please enter a product name');
			return;
		}

		const stores = storesInput
			.split(',')
			.map(s => s.trim())
			.filter(s => s.length > 0);

		shoppingItems.addItem({
			name: name.trim(),
			reported,
			frequency,
			price,
			lifespan,
			stores
		});

		onClose();
	}
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
	<div class="bg-white rounded-lg shadow-lg p-6 w-96">
		<h2 class="text-xl font-bold mb-4">Add New Product</h2>

		<div class="space-y-4">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700">Product Name *</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="e.g., Milk"
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="reported" class="block text-sm font-medium text-gray-700">Reported</label>
					<input
						id="reported"
						type="number"
						bind:value={reported}
						min="0"
						class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div>
					<label for="frequency" class="block text-sm font-medium text-gray-700">Frequency (days)</label>
					<input
						id="frequency"
						type="number"
						bind:value={frequency}
						min="1"
						class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="price" class="block text-sm font-medium text-gray-700">Price</label>
					<input
						id="price"
						type="number"
						bind:value={price}
						min="0"
						step="0.01"
						class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div>
					<label for="lifespan" class="block text-sm font-medium text-gray-700">Lifespan (days)</label>
					<input
						id="lifespan"
						type="number"
						bind:value={lifespan}
						min="0"
						class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			<div>
				<label for="stores" class="block text-sm font-medium text-gray-700">Stores (comma-separated)</label>
				<input
					id="stores"
					type="text"
					bind:value={storesInput}
					class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="e.g., Lidl, Netto, Coop"
				/>
			</div>
		</div>

		<div class="mt-6 flex justify-end gap-3">
			<button
				onclick={onClose}
				class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
			>
				Cancel
			</button>
			<button
				onclick={handleSubmit}
				class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
			>
				Add Product
			</button>
		</div>
	</div>
</div>
