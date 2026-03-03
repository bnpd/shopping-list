import { get } from 'svelte/store';
import { noConsumptionPeriods } from './noConsumptionStore';
import type { ShoppingItem } from './types';

export function calculateNextDueDate(item: ShoppingItem): number {
	if (item.frequency <= 0) return Number.POSITIVE_INFINITY;
	const daysWithoutConsumption = get(noConsumptionPeriods).reduce((sum, p) => sum + (p.cutoffDate > item.lastBuyDate ? p.days : 0), 0);
	return item.lastBuyDate + item.reported * (item.frequency + daysWithoutConsumption) * 24 * 60 * 60 * 1000;
}

export function remainingAmount(item: ShoppingItem): number {
	if (!item.frequency) return item.reported;
	const daysSinceReported = (Date.now() - item.lastBuyDate) / (24 * 60 * 60 * 1000);
	const daysWithoutConsumption = get(noConsumptionPeriods).reduce((sum, p) => sum + (p.cutoffDate > item.lastBuyDate ? p.days : 0), 0);
	const remainingAmount = item.reported - (daysSinceReported - daysWithoutConsumption) / item.frequency;
	return Math.max(0, remainingAmount);
}

export function daysUntilDate(date: number): number {
	const now = Date.now();
	return Math.ceil((date - now) / (24 * 60 * 60 * 1000));
}

export function formatDate(timestamp: number): string {
	return new Date(timestamp).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

export function getItemsDueThisWeek(items: ShoppingItem[]): ShoppingItem[] {
	return items
		.map(item => ({
			...item,
			nextDue: calculateNextDueDate(item)
		}))
		.filter(item => daysUntilDate(item.nextDue) <= 7)
		.sort((a, b) => a.nextDue - b.nextDue);
}

export type ReportedEntry = { date: number; change: number };

// Estimate how many days one unit lasts based on positive reportedHistory entries
// Uses only entries from last $limitDaysWindow days, or all available history.
// Calculation: daysPerUnit = daysWindow / totalPositiveChange
// Returns Number.POSITIVE_INFINITY when there's no positive consumption in window.
export function estimateDaysPerUnit(reportedHistory?: ReportedEntry[], limitDaysWindow?: number): number {
	if (!reportedHistory || reportedHistory.length === 0) return Number.POSITIVE_INFINITY;
	const now = Date.now();
	let daysWindow = (now - reportedHistory[0].date) / (24 * 60 * 60 * 1000);
	if (limitDaysWindow && limitDaysWindow < daysWindow) daysWindow = limitDaysWindow;

	const threeMonthsAgo = now - daysWindow * 24 * 60 * 60 * 1000;

	const positives = reportedHistory.filter(r => r.change > 0 && r.date >= threeMonthsAgo);

	if (positives.length === 0) return Number.POSITIVE_INFINITY;

	const totalConsumed = positives.reduce((sum, r) => sum + r.change, 0);
	if (totalConsumed <= 0) return Number.POSITIVE_INFINITY;

	return daysWindow / totalConsumed;
}
