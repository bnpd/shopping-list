export interface ShoppingItem {
	id: string;
	name: string;
	reported: number;
	frequency: number; // in days
	price: number;
	lifespan: number; // in days
	stores: string[];
	lastBuyDate: number; // timestamp
	createdDate: number; // timestamp
	costPerUnit?: number;
	needed?: number;
	requested?: boolean;
	/**
	 * chronological log of each time `reported` was adjusted.  The array
	 * contains entries with the timestamp and the delta between the new and
	 * previous value.  Used later to compute consumption rate.
	 */
	reportedHistory?: ReportedLogEntry[];
}

export interface ReportedLogEntry {
    date: number;
    change: number;
}

export interface Store {
	name: string;
}

export interface Food {
	id: string;
	name: string;
	frequency: number; // in days
	productIds: string[]; // ShoppingItem.id[]
	links: string[];
	tags: string[];
	createdDate: number;
}

export type SortColumn = 'name' | 'reported' | 'due' | 'frequency' | 'price' | 'updated' | 'nextDue' | 'needed';
export type SortDirection = 'asc' | 'desc';
