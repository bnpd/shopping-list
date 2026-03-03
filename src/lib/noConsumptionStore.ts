import { writable } from 'svelte/store';

export interface NoConsumptionPeriod {
	id: string;
	days: number; // number of days (duration)
	cutoffDate: number; // timestamp in ms
}

const STORAGE_KEY = 'no-consumption-periods';

function loadFromStorage(): NoConsumptionPeriod[] {
	if (typeof window === 'undefined') return [];
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw) as NoConsumptionPeriod[];
		return parsed;
	} catch (e) {
		console.error('Failed to parse no-consumption periods', e);
		return [];
	}
}

function persist(list: NoConsumptionPeriod[]) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
	} catch (e) {
		console.error('Failed to persist no-consumption periods', e);
	}
}

function createNoConsumptionStore() {
	const { subscribe, set, update } = writable<NoConsumptionPeriod[]>(loadFromStorage());

	return {
		subscribe,
		add: (p: Omit<NoConsumptionPeriod, 'id'>) => {
			update(list => {
				const period: NoConsumptionPeriod = { ...p, id: crypto.randomUUID() };
				const next = [...list, period];
				persist(next);
				return next;
			});
		},
		remove: (id: string) => {
			update(list => {
				const next = list.filter(p => p.id !== id);
				persist(next);
				return next;
			});
		},
		updatePeriod: (id: string, patch: Partial<NoConsumptionPeriod>) => {
			update(list => {
				const next = list.map(p => p.id === id ? { ...p, ...patch } : p);
				persist(next);
				return next;
			});
		},
		set
	};
}

export const noConsumptionPeriods = createNoConsumptionStore();
