import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createShoppingStore, shoppingItems } from './store';
import { estimateDaysPerUnit } from './dateUtils';
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
		store.updateReported(original.id, 3, 1);

		expect(items[0].reported).toBe(3);
		expect(items[0].lastBuyDate).toBe(Date.now());
		expect(items[0].reportedHistory).toHaveLength(1);
		const entry = items[0].reportedHistory![0];
		expect(entry.change).toBe(1);
		expect(entry.date).toBe(Date.now());
		expect(entry.reported).toBe(3);

		// updating again with a lower value should record a negative change
		vi.setSystemTime(Date.now() + 11 * 60 * 1000);
		store.updateReported(original.id, 1.5, -1.5);
		const hist = items[0].reportedHistory!;
		expect(hist).toHaveLength(2);
		expect(hist[1].change).toBeCloseTo(-1.5);
		expect(hist[1].reported).toBe(1.5);
	});

	it('updates the quantity snapshot when merging reported-history entries', () => {
		store.addItem({
			name: 'milk',
			reported: 2,
			frequency: 7,
			price: 1,
			lifespan: 15,
			stores: []
		});

		store.updateReported(items[0].id, 3, 1);
		store.updateReported(items[0].id, 4, 1);

		expect(items[0].reportedHistory).toHaveLength(1);
		expect(items[0].reportedHistory![0]).toMatchObject({ change: 2, reported: 4 });
	});

	it('adjusts estimated consumption for the stock change in the requested period', () => {
		const now = Date.now();
		vi.setSystemTime(now);
		const days = 30;
		const estimate = estimateDaysPerUnit([
			{ date: now - days * 24 * 60 * 60 * 1000, change: 0, reported: 5 },
			{ date: now - 15 * 24 * 60 * 60 * 1000, change: 4, reported: 9 },
			{ date: now, change: 0, reported: 7 }
		]);

		// 4 units purchased, with 2 more units in stock at the end: 2 units consumed.
		expect(estimate).toBeCloseTo(15);
	});

	it('uses the first entry in the requested period as the starting stock boundary', () => {
		const now = Date.now();
		vi.setSystemTime(now);
		const day = 24 * 60 * 60 * 1000;
		const estimate = estimateDaysPerUnit([
			{ date: now - 120 * day, change: 5, reported: 8 },
			{ date: now - 30 * day, change: 3, reported: 4 },
			{ date: now, change: 0, reported: 2 }
		], 30);

		// The first in-window entry raised stock from 1 to 4; 3 units were bought,
		// and stock then fell from 4 to 2, so 2 units were consumed in 30 days.
		expect(estimate).toBeCloseTo(15);
	});

	it('ends the stock-adjusted estimate at the last entry rather than now', () => {
		const now = Date.now();
		vi.setSystemTime(now);
		const day = 24 * 60 * 60 * 1000;
		const estimate = estimateDaysPerUnit([
			{ date: now - 30 * day, change: 0, reported: 5 },
			{ date: now - 10 * day, change: 0, reported: 3 }
		]);

		expect(estimate).toBeCloseTo(10);
	});

	it('does not apply stock adjustment for legacy entries without quantity snapshots', () => {
		const now = Date.now();
		vi.setSystemTime(now);
		const days = 30;
		const estimate = estimateDaysPerUnit([
			{ date: now - days * 24 * 60 * 60 * 1000, change: 0 },
			{ date: now - 15 * 24 * 60 * 60 * 1000, change: 4 },
			{ date: now, change: 0 }
		]);

		expect(estimate).toBeCloseTo(7.5);
	});
});