<script lang="ts">
    import type { Food } from '$lib/types';
    import { foods } from '$lib/foodStore';
    import { shoppingItems } from '$lib/store';

    export let food: Food;

    let ingredientNames: string[] = [];
    $: {
        const allShoppingItems = $shoppingItems;
        ingredientNames = food.productIds.map(id => {
            const item = allShoppingItems.find(it => it.id === id);
            return item ? item.name : 'Unknown';
        });
    }

    function buy() {
        foods.buyFood(food.id);
    }

    function deleteFood() {
        if (confirm(`Delete "${food.name}"?`)) foods.deleteFood(food.id);
    }
</script>

<div class="flex items-center justify-between p-2 border-b">
    <div class="flex flex-col gap-3 text-xs">
        <div class="font-bold">{food.name}</div>
        <div class="flex flex-wrap gap-1">
            {#each ingredientNames as name (name)}
                <span class="bg-gray-200 px-2 py-1 rounded">{name}</span>
            {/each}
        </div>
        <div class="flex flex-wrap gap-1">
            {#each food.tags as tag (tag)}
                <span class="bg-gray-50 px-2 py-1 rounded">{tag}</span>
            {/each}
        </div>
    </div>
    <div class="flex flex-col gap-2">
        <button onclick={buy} class="px-3 py-1 bg-green-500 text-white rounded">Buy</button>
        <button onclick={deleteFood} class="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
    </div>
</div>
