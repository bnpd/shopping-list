import type { Food, ShoppingItem } from './types';
import { writable } from 'svelte/store';
import { shoppingItems } from './store';

const STORAGE_KEY = 'shopping-list-foods';



function createFoodStore() {
    const { subscribe, set, update } = writable<Food[]>([]);

    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                set(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse stored foods:', e);
            }
        }
    }

    return {
        subscribe,
        addFood: (food: Omit<Food, 'id' | 'createdDate'>) => {
            update(list => {
                const newFood: Food = { ...food, id: crypto.randomUUID(), createdDate: Date.now() };
                const updated = [...list, newFood];
                if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        },
        importFoods: (foodsToImport: Array<Omit<Food, 'id' | 'createdDate'>>) => {
            update(list => {
                const appended = foodsToImport.map(f => ({ ...f, id: crypto.randomUUID(), createdDate: Date.now() }));
                const updated = [...list, ...appended];
                if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        },
        deleteFood: (id: string) => {
            update(list => {
                const updated = list.filter(f => f.id !== id);
                if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        },
        buyFood: (id: string) => {
            let foodsSnapshot: Food[] = [];
            const unsub = subscribe(f => foodsSnapshot = f);
            unsub();
            const food = foodsSnapshot.find(f => f.id === id);
            if (!food) return;

            if (food.productIds.length > 0) {
                shoppingItems.setRequestedBulk(food.productIds, true);
            }
        },
        clear: () => {
            if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
            set([]);
        }
    };
}

export const foods = createFoodStore();
