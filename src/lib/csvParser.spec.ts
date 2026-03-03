import { describe, expect, it } from 'vitest';
import {
	parseCSV,
	convertCSVRowToItem,
	convertCSVToItems,
	type CSVRow,
	type IncomingShoppingItem
} from './csvParser';

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
