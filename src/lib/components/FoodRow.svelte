<script lang="ts">
    import type { Food } from '$lib/types';
    import { foods } from '$lib/foodStore';

    export let food: Food;

    function buy() {
        foods.buyFood(food.id);
    }

    function deleteFood() {
        if (confirm(`Delete "${food.name}"?`)) foods.deleteFood(food.id);
    }
</script>

<div class="flex items-center justify-between p-2 border-b">
    <div>
        <div class="font-medium">{food.name}</div>
        <div class="text-xs text-gray-600">Ingredients: {food.ingredients.join(', ')}</div>
    </div>
    <div class="flex gap-2">
        <button onclick={buy} class="px-3 py-1 bg-green-500 text-white rounded">Buy</button>
        <button onclick={deleteFood} class="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
    </div>
</div>
