import type { ShoppingItem } from './types';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'shopping-list-items';

export function createShoppingStore() {
	const { subscribe, set, update } = writable<ShoppingItem[]>([]);

	// Initialize from localStorage
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				set(JSON.parse(stored));
			} catch (e) {
				console.error('Failed to parse stored items:', e);
			}
		}
	}

	return {
		subscribe,
		// parameter allows callers (including csv import) to optionally provide lastBuyDate
		addItem: (item: Omit<ShoppingItem, 'id' | 'createdDate' | 'lastBuyDate'> & { lastBuyDate?: number }) => {
			// caller may supply a lastBuyDate (for imports), otherwise default to now
			update(items => {
				const now = Date.now();
				const newItem: ShoppingItem = {
					...item,
					id: crypto.randomUUID(),
					createdDate: now,
					lastBuyDate: item.lastBuyDate ?? now,
					requested: false,
					reportedHistory: []
				};
				const updated = [...items, newItem];
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		},
		updateItem: (id: string, updates: Partial<ShoppingItem>) => {
			update(items => {
				const updated = items.map(item =>
					item.id === id
						? {
								...item,
								...updates,
								id: item.id,
								createdDate: item.createdDate
							}
						: item
				);
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		},
		deleteItem: (id: string) => {
			update(items => {
				const updated = items.filter(item => item.id !== id);
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		},
		updateReported: (id: string, reported: number, change: number) => {
			update(items => {
				const now = Date.now();
				const updated = items.map(item => {
					if (item.id === id) {
						const lastEntry = item.reportedHistory?.[item.reportedHistory.length - 1];
						const shouldMerge = lastEntry && (now - lastEntry.date) < 10 * 60 * 1000; // 10 minute threshold for merging

						const newEntry = { date: now, change };
						
						let updatedHistory = item.reportedHistory;
						if (Math.abs(change) > 0.05) {
							if (shouldMerge) {
								updatedHistory = [
									...item.reportedHistory!.slice(0, -1),
									{ ...lastEntry, change: lastEntry.change + change }
								];
							} else {
								updatedHistory = [...(item.reportedHistory ?? []), newEntry];
							}
						}

						return {
							...item,
							reported,
							requested: change > 0 ? false : item.requested, // if we're increasing reported, assume user bought more and clear requested flag
							lastBuyDate: now,
							reportedHistory: updatedHistory
						};
					} else return item
				});
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		},

		setRequested: (id: string, requested: boolean) => {
			update(items => {
				const updated = items.map(item => item.id === id ? { ...item, requested } : item);
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		},
		setRequestedBulk: (ids: string[], requested: boolean) => {
			update(items => {
				const idSet = new Set(ids);
				const updated = items.map(item => idSet.has(item.id) ? { ...item, requested } : item);
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				}
				return updated;
			});
		}
	};
}

const STORAGE_KEY_TEMP_ITEMS = 'shopping-list-temp-items';
export function createShoppingTempItemsStore() {
	const { subscribe, set, update } = writable<string[]>([]);

	// Initialize from localStorage
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(STORAGE_KEY_TEMP_ITEMS);
		if (stored) {
			try {
				set(JSON.parse(stored));
			} catch (e) {
				console.error('Failed to parse stored items:', e);
			}
		}
	}

	return {
		subscribe,
		addItem: (item: string) => {
			update(items => {
				if (items.includes(item)) return items; // avoid duplicates
				const updated = [...items, item];
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY_TEMP_ITEMS, JSON.stringify(updated));
				}
				return updated;
			});
		},
		deleteItem: (itemToDelete: string) => {
			update(items => {
				const updated = items.filter(item => item !== itemToDelete);
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY_TEMP_ITEMS, JSON.stringify(updated));
				}
				return updated;
			});
		}
	};
}

export const shoppingItems = createShoppingStore();
export const shoppingTempItems = createShoppingTempItemsStore();
