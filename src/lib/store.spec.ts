import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createShoppingStore, shoppingItems } from './store';
import type { ShoppingItem } from './types';

// tests for the shopping store logic, in particular the reported-history feature

describe('shopping store', () => {
	let store: ReturnType<typeof createShoppingStore>;
	let items: ShoppingItem[];

	beforeEach(() => {
		// create a fresh instance so we don't accidentally carry state between tests
		store = createShoppingStore();
		items = [];
		store.subscribe(v => (items = v));

		// make the clock predictable
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('initially has no items', () => {
		expect(items).toHaveLength(0);
	});

	it('addItem initializes reportedHistory to an empty array', () => {
		store.addItem({
			name: 'test',
			reported: 1,
			frequency: 10,
			price: 2,
			lifespan: 30,
			stores: []
		});

		expect(items).toHaveLength(1);
		expect(items[0].reportedHistory).toEqual([]);
	});

	it('updateReported appends a history entry with correct delta and timestamp', () => {
		// add initial item
		store.addItem({
			name: 'milk',
			reported: 2,
			frequency: 7,
			price: 1,
			lifespan: 15,
			stores: []
		});

		const original = items[0];
		expect(original.reportedHistory).toEqual([]);

		// advance clock a day and change reported
		vi.setSystemTime(Date.now() + 24 * 60 * 60 * 1000);
		store.updateReported(original.id, 3);

		expect(items[0].reported).toBe(3);
		expect(items[0].lastBuyDate).toBe(Date.now());
		expect(items[0].reportedHistory).toHaveLength(1);
		const entry = items[0].reportedHistory![0];
		expect(entry.change).toBe(1);
		expect(entry.date).toBe(Date.now());

		// updating again with a lower value should record a negative change
		vi.setSystemTime(Date.now() + 1000);
		store.updateReported(original.id, 1.5);
		const hist = items[0].reportedHistory!;
		expect(hist).toHaveLength(2);
		expect(hist[1].change).toBeCloseTo(-1.5);
	});
});