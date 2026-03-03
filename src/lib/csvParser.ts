import type { ShoppingItem, Food } from './types';

export interface CSVRow {
	[key: string]: string;
}

export function parseCSV(csvText: string): CSVRow[] {
	const lines = csvText.trim().split('\n');
	if (lines.length < 2) return [];

	const headers = parseCSVLine(lines[0]);
	const rows: CSVRow[] = [];

	for (let i = 1; i < lines.length; i++) {
		const values = parseCSVLine(lines[i]);
		const row: CSVRow = {};

		headers.forEach((header, index) => {
			row[header] = values[index] || '';
		});

		rows.push(row);
	}

	return rows;
}

function parseCSVLine(line: string): string[] {
	const result: string[] = [];
	let current = '';
	let insideQuotes = false;

	for (const element of line) {
		const char = element;

		if (char === '"') {
			insideQuotes = !insideQuotes;
		} else if (char === ',' && !insideQuotes) {
			result.push(current.trim());
			current = '';
		} else {
			current += char;
		}
	}

	result.push(current.trim());
	return result;
}

function extractStores(storeString: string): string[] {
	if (!storeString) return [];

	// Remove URLs and extract store names
	const stores = storeString
		.split(',')
		.map(store => {
			// Remove URLs in format (https://...)
			return store
				.replace(/\s*\(https:\/\/[^)]+\)/g, '')
				.trim();
		})
		.filter(store => store.length > 0);

	return stores;
}

function parsePrice(priceString: string): number {
	if (!priceString) return 0;

	// Extract number from strings like "DKK 12.00"
	const match = priceString.match(/[\d.,]+/);
	if (!match) return 0;

	const numberStr = match[0].replace(',', '.');
	return parseFloat(numberStr) || 0;
}

function parseFrequency(freqString: string): number {
	if (!freqString) return Infinity; // treat empty frequency as non-repeating
	const match = freqString.match(/\d+/);
	return match ? parseInt(match[0]) : 7;
}

function parseReported(reportedString: string): number {
	if (!reportedString) return 1;
	const num = parseFloat(reportedString);
	return isNaN(num) ? 1 : num;
}

/**
 * Try to turn a human-readable date string into a timestamp.
 * We'll fall back to `Date.now()` in calling code if parsing fails.
 */
export function parseDate(dateString: string): number {
	if (!dateString) return Number.NaN;
	// most CSV exports use ISO format but we also tolerate other locales
	const ts = Date.parse(dateString);
	if (!Number.isNaN(ts)) return ts;
	// try constructing directly (in case of dd.mm.yyyy style)
	const parts = dateString.split(/[-\.\//]/).map(p => Number.parseInt(p, 10));
	if (parts.length === 3) {
		let year = parts[0];
		let month = parts[1] - 1;
		let day = parts[2];
		// naive guess if format might be dd-mm-yyyy
		if (year < 1000) {
			// assume dd.mm.yyyy
			[day, month, year] = parts;
			month -= 1;
		}
		const d = new Date(year, month, day);
		if (!Number.isNaN(d.getTime())) return d.getTime();
	}
	return Number.NaN;
}

function normalizeName(s: string) {
    return s.replace(/\([^)]*\)/g, '') // remove parentheses content
        .replace(/[\p{Emoji_Presentation}\p{Emoji}\u200d]/gu, '') // remove emojis
        .replace(/['"`]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

export type IncomingShoppingItem = Omit<ShoppingItem, 'id' | 'createdDate'> & { lastBuyDate?: number };

export function convertCSVRowToItem(row: CSVRow): IncomingShoppingItem | null {
	const name = row['Name']?.trim();

	if (!name) return null;

	const frequencyStr = row['Frequency (days)'] || '';
	const frequency = parseFrequency(frequencyStr);

	const priceStr = row['Price'] || '';
	const price = parsePrice(priceStr);

	const storesStr = row['Stores'] || '';
	const stores = extractStores(storesStr);

	const reportedStr = row['reported'] || '1';
	const reported = parseReported(reportedStr);

	// parse updated/last buy date if available
	const updatedStr = row['updated'] || row['Updated'] || '';
	let lastBuyDate = Date.now();
	if (updatedStr) {
		const parsed = parseDate(updatedStr);
		if (!Number.isNaN(parsed) && parsed > 0) {
			lastBuyDate = parsed;
		}
	}

	return {
		name,
		reported,
		frequency,
		price,
		lifespan: 0,
		stores,
		lastBuyDate
	};
}

export function convertCSVToItems(csvText: string): Array<IncomingShoppingItem> {
	const rows = parseCSV(csvText);
	const items = rows
		.map(row => convertCSVRowToItem(row))
		.filter((item): item is IncomingShoppingItem => item !== null);

	return items;
}

// --- Food CSV parsing ---
function extractIngredients(ingString: string): string[] {
	if (!ingString) return [];
	// split by comma, remove any parenthesized URLs
	return ingString
		.split(',')
		.map(s => s.replace(/\s*\([^)]*\)/g, '').trim())
		.filter(s => s.length > 0);
}

function extractLinks(row: CSVRow): string[] {
	const links: string[] = [];
	if (row['Link']) links.push(row['Link'].trim());
	if (row['Link 2']) links.push(row['Link 2'].trim());
	if (row['Link 3']) links.push(row['Link 3'].trim());
	return links.filter(Boolean);
}

function extractTags(tagsString: string): string[] {
	if (!tagsString) return [];
	return tagsString.split(',').map(t => t.trim()).filter(Boolean);
}

export function convertCSVRowToFood(row: CSVRow, shoppingItems: ShoppingItem[]): Omit<Food, 'id' | 'createdDate'> | null {
	const name = row['Name']?.trim();
	if (!name) return null;

	const freqStr = row['Frequenz (Tage Abstand)'] || row['Frequenz (Tage Abstand)'] || '';
	const frequency = parseFrequency(freqStr) || 1;

	const ingredientNames = extractIngredients(row['Ingredients'] || row['Ingredients'] || '');
	const links = extractLinks(row);
	const tags = extractTags(row['Tags'] || '');

	const productIds: string[] = [];
    for (const ingName of ingredientNames) {
        const normalizedIngName = normalizeName(ingName);
        const foundItem = shoppingItems.find(item => normalizeName(item.name) === normalizedIngName);
        if (foundItem) {
            productIds.push(foundItem.id);
        }
    }

	return {
		name,
		frequency,
		productIds,
		links,
		tags
	};
}

export function convertCSVToFoods(csvText: string, shoppingItems: ShoppingItem[]): Array<Omit<Food, 'id' | 'createdDate'>> {
	const rows = parseCSV(csvText);
	const foods = rows
		.map(row => convertCSVRowToFood(row, shoppingItems))
		.filter((f): f is Omit<Food, 'id' | 'createdDate'> => f !== null);

	return foods;
}
