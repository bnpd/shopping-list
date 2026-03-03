import { describe, expect, it } from 'vitest';
import {
	parseCSV,
	convertCSVRowToItem,
	convertCSVToItems,
	convertCSVToFoods,
	type CSVRow,
	type IncomingShoppingItem
} from './csvParser';
import type { ShoppingItem } from './types';


// Note: parseDate is not exported currently; we need to export it to test or test indirectly via conversion.

// `parseDate` isn't exported yet, so we will test updated column parsing via convertCSVRowToItem.

describe('csvParser utilities', () => {
	it('splits simple CSV into rows', () => {
		const text = 'Name,Price\nfoo,1.23\nbar,4.56';
		const rows = parseCSV(text);
		expect(rows).toHaveLength(2);
		expect(rows[0].Name).toBe('foo');
		expect(rows[1].Price).toBe('4.56');
	});

	it('convertCSVRowToItem reads updated column as lastBuyDate', () => {
		const now = Date.now();
		const dateStr = new Date(now - 24 * 60 * 60 * 1000).toISOString();
		const row: CSVRow = {
			Name: 'milk',
			'Frequency (days)': '7',
			Price: 'DKK 12.00',
			Stores: 'Supermarkt',
			reported: '2',
			updated: dateStr
		};

		const item = convertCSVRowToItem(row) as IncomingShoppingItem;
		expect(item).not.toBeNull();
		if (item) {
			expect(item.lastBuyDate).toBe(Date.parse(dateStr));
		}
	});

	it('convertCSVToItems handles CSV text including updated field', () => {
		const yesterday = new Date(Date.now() - 86400000).toISOString();
		const csv = ['Name,Frequency (days),Price,Stores,reported,updated',
			`eggs,3,DKK 22.00,Farm,1,${yesterday}`
		].join('\n');
		const items = convertCSVToItems(csv);
		expect(items).toHaveLength(1);
		const item = items[0];
		expect(item.name).toBe('eggs');
		expect(item.lastBuyDate).toBe(Date.parse(yesterday));
	});
});

describe('Food CSV Parsing', () => {
    it('convertCSVToFoods maps ingredient names to product IDs', () => {
        const shoppingItems: ShoppingItem[] = [
            { id: '1', name: 'Milk', price: 10, frequency: 7, lastBuyDate: 0, reported: 1, lifespan: 7, stores: [], createdDate: 0 },
            { id: '2', name: 'Bread', price: 20, frequency: 7, lastBuyDate: 0, reported: 1, lifespan: 7, stores: [], createdDate: 0 },
            { id: '3', name: 'Eggs', price: 30, frequency: 14, lastBuyDate: 0, reported: 1, lifespan: 21, stores: [], createdDate: 0 }
        ];

        const csv = `Name,Ingredients
Breakfast,"Milk,Eggs"`;

        const foods = convertCSVToFoods(csv, shoppingItems);

        expect(foods).toHaveLength(1);
        expect(foods[0].name).toBe('Breakfast');
        expect(foods[0].productIds).toEqual(['1', '3']);
    });
});
